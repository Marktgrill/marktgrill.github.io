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
function setTheme(t){const mt=document.querySelector('meta[name=theme-color]');if(mt)mt.content=t==='dark'?'#0d0c0b':'#f4f1ed';document.documentElement.setAttribute('data-theme',t);const b=document.getElementById('theme-icon');if(b)b.textContent=t==='dark'?'🌙':'☀️';try{localStorage.setItem('theme',t)}catch(e){}}
function toggleTheme(){setTheme(document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark')}
function toggleMenu(){const o=document.getElementById('mm').classList.toggle('open');document.body.style.overflow=o?'hidden':'';const b=document.getElementById('tab-more');if(b)b.classList.toggle('active',o||['catering.html','about.html'].includes(page))}

// Header + Footer einfügen
const page=location.pathname.split('/').pop()||'index.html';
const links=cls=>PAGES.map(([h,t])=>`<a href="${h}" class="${h===page?'active':''}">${t}</a>`).join('');
const st=openStatus();
document.body.insertAdjacentHTML('afterbegin',`
<header class="site-header">
  <div class="brand" id="secret-logo"><i class="fa-solid fa-fire"></i><span>Marktgrill</span></div>
  <nav class="nav">${links()}</nav>
  <div class="tools">
    <div class="status ${st.open?'open':'closed'}" id="status"><span class="dot"></span><span class="long">${st.text}</span><span class="short">${st.open?'Offen':'Zu'}</span></div>
    <button class="icon-btn" onclick="toggleTheme()" id="theme-icon" aria-label="Design wechseln">🌙</button>
    <button class="icon-btn burger" onclick="toggleMenu()" aria-label="Menü">☰</button>
  </div>
</header>
<nav class="mobile-menu" id="mm" onclick="toggleMenu()">${links()}</nav>
<div id="confused-emoji">😵‍💫</div>
<nav class="tabbar" aria-label="Hauptnavigation">
  <a href="index.html" class="${page==='index.html'?'active':''}"><i class="fa-solid fa-house"></i>Home</a>
  <a href="speisekarte.html" class="${page==='speisekarte.html'?'active':''}"><i class="fa-solid fa-utensils"></i>Karte</a>
  <a href="tagesgericht.html" class="${page==='tagesgericht.html'?'active':''}"><i class="fa-solid fa-star"></i>Heute</a>
  <a href="contact.html" class="${page==='contact.html'?'active':''}"><i class="fa-solid fa-envelope"></i>Kontakt</a>
  <button id="tab-more" class="${['catering.html','about.html'].includes(page)?'active':''}" onclick="toggleMenu()"><i class="fa-solid fa-bars"></i>Mehr</button>
</nav>
<div class="install" id="install" hidden>
  <div class="install-text"><strong>Marktgrill als App</strong><span id="install-sub"></span></div>
  <button class="btn" id="install-go">Installieren</button>
  <button class="icon-btn" id="install-x" aria-label="Schließen">✕</button>
</div>`);
document.querySelector('main').insertAdjacentHTML('afterend',`
<footer class="site-footer">
  <div>&copy; 2026 Marktgrill Ennigerloh</div>
  <div>developed by <a class="dev" href="https://diyarino.github.io/">Diyar Altinses</a></div>
  <div class="foot-links"><a href="#" id="install-link" hidden>App installieren</a><a href="impressum.html">Impressum</a><a href="datenschutz.html">Datenschutz</a></div>
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
  const init=()=>{canvas.width=innerWidth;canvas.height=innerHeight;embers=Array.from({length:innerWidth<700?32:70},()=>mk())};
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

// Video sparen bei "Weniger Bewegung" oder Datensparmodus
const vid=document.querySelector('.bg-video');
if(vid&&(matchMedia('(prefers-reduced-motion: reduce)').matches||(navigator.connection&&navigator.connection.saveData)))vid.remove();

// ===== App-Installation (PWA) =====
if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost')){
  addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
}
(function(){
  const standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone;
  if(standalone)return;
  const isIOS=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  const box=document.getElementById('install'),sub=document.getElementById('install-sub'),go=document.getElementById('install-go'),link=document.getElementById('install-link');
  let deferred=null;
  const dismissed=()=>{try{return Date.now()-(+localStorage.getItem('installDismissed')||0)<7*864e5}catch(e){return false}};
  function show(){
    if(deferred){sub.textContent='Schneller Zugriff auf Karte, Tagesgericht und Öffnungszeiten.';go.style.display=''}
    else if(isIOS){sub.innerHTML='Tippe unten auf <i class="fa-solid fa-arrow-up-from-bracket"></i> Teilen und dann auf „Zum Home-Bildschirm“.';go.style.display='none'}
    else return;
    box.hidden=false;
  }
  addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;link.hidden=false;if(!dismissed())setTimeout(show,5000)});
  if(isIOS){link.hidden=false;if(!dismissed())setTimeout(show,6000)}
  go.addEventListener('click',async()=>{if(!deferred)return;deferred.prompt();await deferred.userChoice;deferred=null;box.hidden=true;link.hidden=true});
  document.getElementById('install-x').addEventListener('click',()=>{box.hidden=true;try{localStorage.setItem('installDismissed',Date.now())}catch(e){}});
  link.addEventListener('click',e=>{e.preventDefault();show()});
  addEventListener('appinstalled',()=>{box.hidden=true;link.hidden=true});
})();
