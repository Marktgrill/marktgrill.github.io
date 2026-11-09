const PAGES=[['index.html','Home'],['speisekarte.html','Speisekarte'],['tagesgericht.html','Tagesgericht'],['catering.html','Catering'],['about.html','Über uns'],['contact.html','Kontakt']];
// Öffnungszeiten: Wochentag (0 = Sonntag) -> [von, bis] oder null = geschlossen
const HOURS={1:['11:30','20:45'],2:['11:30','20:45'],3:['11:30','20:45'],4:['11:30','20:45'],5:['11:30','20:45'],6:['11:30','20:00'],0:null};
const DAYS=['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];
const mins=t=>{const [h,m]=t.split(':');return +h*60+ +m};
const esc=t=>{const d=document.createElement('div');d.textContent=t??'';return d.innerHTML};

function openStatus(){
  const n=new Date(),d=n.getDay(),m=n.getHours()*60+n.getMinutes(),h=HOURS[d];
  if(h&&m>=mins(h[0])&&m<mins(h[1]))return{open:true,text:'Geöffnet bis '+h[1]+' Uhr'};
  if(h&&m<mins(h[0]))return{open:false,text:'Öffnet heute um '+h[0]+' Uhr'};
  for(let i=1;i<=7;i++){const nd=(d+i)%7;if(HOURS[nd])return{open:false,text:'Öffnet '+(i===1?'morgen':DAYS[nd].slice(0,2)+'.')+' um '+HOURS[nd][0]+' Uhr'}}
  return{open:false,text:'Geschlossen'};
}

// Theme
function setTheme(t){document.documentElement.setAttribute('data-theme',t);const b=document.getElementById('theme-icon');if(b)b.textContent=t==='dark'?'🌙':'☀️';try{localStorage.setItem('theme',t)}catch(e){}}
function toggleTheme(){setTheme(document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark')}
function toggleMenu(){document.getElementById('mm').classList.toggle('open')}

// Header + Footer einfügen
const page=location.pathname.split('/').pop()||'index.html';
const links=cls=>PAGES.map(([h,t])=>`<a href="${h}" class="${h===page?'active':''}">${t}</a>`).join('');
const st=openStatus();
document.body.insertAdjacentHTML('afterbegin',`
<header class="site-header">
  <div class="brand" id="secret-logo"><i class="fa-solid fa-fire"></i><span>Marktgrill</span></div>
  <nav class="nav">${links()}</nav>
  <div class="tools">
    <div class="status ${st.open?'open':'closed'}" id="status"><span class="dot"></span><span><span class="long">${st.text}</span></span></div>
    <button class="icon-btn" onclick="toggleTheme()" id="theme-icon" aria-label="Design wechseln">🌙</button>
    <button class="icon-btn burger" onclick="toggleMenu()" aria-label="Menü">☰</button>
  </div>
</header>
<nav class="mobile-menu" id="mm" onclick="toggleMenu()">${links()}</nav>
<div id="confused-emoji">😵‍💫</div>`);
document.querySelector('main').insertAdjacentHTML('afterend',`
<footer class="site-footer">
  <div>&copy; 2026 Marktgrill Ennigerloh</div>
  <div>developed by <a class="dev" href="https://diyarino.github.io/">Diyar Altinses</a></div>
  <div class="foot-links"><a href="impressum.html">Impressum</a><a href="datenschutz.html">Datenschutz</a></div>
</footer>`);
try{setTheme(localStorage.getItem('theme')||'dark')}catch(e){setTheme('dark')}

// Öffnungszeiten-Liste
document.querySelectorAll('[data-hours]').forEach(el=>{
  el.innerHTML=[1,2,3,4,5,6,0].map(d=>`<li class="${d===new Date().getDay()?'today':''}"><span>${DAYS[d]}</span><span>${HOURS[d]?HOURS[d][0]+' – '+HOURS[d][1]+' Uhr':'Geschlossen'}</span></li>`).join('');
});

// Tagesgericht aus tagesgericht.json
function renderDaily(el,compact){
  fetch('tagesgericht.json?t='+Date.now()).then(r=>r.json()).then(d=>{
    if(!d.aktiv){el.innerHTML='<h2>Heute kein Tagesgericht</h2><p>Schau in die Speisekarte, dort warten alle Klassiker.</p>';return}
    const datum=d.gueltig_am?new Date(d.gueltig_am).toLocaleDateString('de-DE',{weekday:'long',day:'numeric',month:'long'}):'';
    el.classList.toggle('sold-out',!!d.ausverkauft);
    el.innerHTML=(d.bild&&!compact?`<img src="${esc(d.bild)}" alt="${esc(d.titel)}">`:'')+
      (d.vegetarisch?'<span class="badge veg">Vegetarisch</span>':'')+(d.ausverkauft?'<span class="badge sold">Ausverkauft</span>':'')+
      (datum&&!compact?`<p class="note">${esc(datum)}</p>`:'')+
      `<h2>${esc(d.titel)}</h2><p>${esc(d.beschreibung)}</p><div class="daily-price">${esc(d.preis)}</div>`+(d.hinweis?`<p class="note">${esc(d.hinweis)}</p>`:'');
  }).catch(()=>{el.innerHTML='<p>Das Tagesgericht konnte gerade nicht geladen werden.</p>'});
}
document.querySelectorAll('[data-daily]').forEach(el=>renderDaily(el,el.dataset.daily==='compact'));

// Funken (nur Seiten mit Canvas)
const canvas=document.getElementById('bg-canvas');
if(canvas&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
  const ctx=canvas.getContext('2d');let embers=[];
  const init=()=>{canvas.width=innerWidth;canvas.height=innerHeight;embers=Array.from({length:70},()=>mk())};
  const mk=()=>({x:Math.random()*canvas.width,y:canvas.height+Math.random()*100,s:Math.random()*2.5+1,vx:(Math.random()-.5)*1.2,vy:-(Math.random()*1.6+.4),o:Math.random()});
  (function loop(){ctx.clearRect(0,0,canvas.width,canvas.height);
    const c=getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()||'#ff5a1f';
    embers.forEach((e,i)=>{e.x+=e.vx;e.y+=e.vy;e.o-=.003;if(e.o<=0||e.y<0)embers[i]=mk();
      ctx.globalAlpha=Math.max(e.o,0);ctx.fillStyle=c;ctx.beginPath();ctx.arc(e.x,e.y,e.s,0,7);ctx.fill()});
    requestAnimationFrame(loop)})();
  addEventListener('resize',init);init();
}

// Easter Egg 1: 5 Klicks auf das Logo
let clicks=0,ct;
document.getElementById('secret-logo').addEventListener('click',()=>{clicks++;clearTimeout(ct);if(clicks>=5)location.href='easteregg.html';ct=setTimeout(()=>clicks=0,1500)});
// Easter Egg 2: Handy schütteln
let lx,ly,lz;
addEventListener('devicemotion',e=>{const a=e.accelerationIncludingGravity;if(!a)return;
  if(lx!=null&&Math.abs(a.x-lx)+Math.abs(a.y-ly)+Math.abs(a.z-lz)>50){const el=document.getElementById('confused-emoji');el.style.display='block';setTimeout(()=>el.style.display='none',2000)}
  lx=a.x;ly=a.y;lz=a.z});



if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
