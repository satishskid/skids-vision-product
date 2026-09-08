/* SKIDS Vision — SPA */
(function(){
"use strict";
var app = document.getElementById('app');
var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- utils ---------- */
function $(s,c){ return (c||document).querySelector(s); }
function $$(s,c){ return Array.prototype.slice.call((c||document).querySelectorAll(s)); }
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function rupee(n){ return '₹' + n.toLocaleString('en-IN'); }
function frameById(id){ for(var i=0;i<FRAMES.length;i++) if(FRAMES[i].id===id) return FRAMES[i]; }
function colorById(id){ for(var i=0;i<FRAME_COLORS.length;i++) if(FRAME_COLORS[i].id===id) return FRAME_COLORS[i]; }
function lensById(id){ for(var i=0;i<LENS_OPTIONS.length;i++) if(LENS_OPTIONS[i].id===id) return LENS_OPTIONS[i]; }
function frameSvg(f, hex, w, sw){
  w = w || 120; sw = sw || 5;
  return '<svg width="'+w+'" height="'+Math.round(w*0.45)+'" viewBox="0 0 300 240" aria-hidden="true">'+
    '<path d="'+f.path+'" fill="none" stroke="'+hex+'" stroke-width="'+sw+'" stroke-linejoin="round" opacity=".95"/>'+
    '<path d="'+f.path+'" fill="'+hex+'" fill-opacity=".12" stroke="none"/></svg>';
}
var toastTimer;
function toast(msg){
  var t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function(){ t.classList.remove('show'); }, 2600);
}
function reveal(){
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  },{threshold:.1});
  $$('.rv', app).forEach(function(el){ io.observe(el); });
}

/* ---------- state (localStorage) ---------- */
var DEFAULT_STATE = {
  cart:[], wishlist:[], prescription:null, kids:[
    {id:'k1', name:'Aarav', age:8, lastScreening:'2026-03-14', status:'Glasses — Explorer, −1.25 D, review in 6 months'},
    {id:'k2', name:'Meera', age:5, lastScreening:'2026-03-14', status:'All clear — next screening in school camp, Apr 2027'}
  ],
  appointments:[
    {id:'a1', child:'Aarav', clinic:'SKIDS Vision Clinic · AECS Layout, Bengaluru', date:'2026-09-18', slot:'10:30 AM', reason:'Myopia progression review', status:'confirmed'}
  ],
  orders:[
    {id:'SV-24081', items:[{frameId:'explorer', colorId:'crystal-blue', lensId:'myopiactl', qty:1}], placed:'2026-09-02', total:2999, stage:3, address:'Indiranagar, Bengaluru'}
  ]
};
function loadState(){
  try{
    var s = JSON.parse(localStorage.getItem('skids_vision_state'));
    if(!s) throw 0;
    return Object.assign({}, DEFAULT_STATE, s);
  }catch(e){ return JSON.parse(JSON.stringify(DEFAULT_STATE)); }
}
function save(){
  localStorage.setItem('skids_vision_state', JSON.stringify(S));
}
var S = loadState();

/* ---------- router ---------- */
function go(path){
  if(location.pathname !== path) history.pushState({}, '', path);
  render();
  window.scrollTo(0, 0);
}
document.addEventListener('click', function(e){
  var a = e.target.closest('a[data-route]');
  if(a){ e.preventDefault(); go(a.getAttribute('href')); }
});
window.addEventListener('popstate', render);

function render(){
  renderNav();
  var path = location.pathname.replace(/\/+$/,'') || '/';
  var m;
  if(path === '/' ) homePage();
  else if(path === '/frames') framesPage();
  else if(m = path.match(/^\/frames\/([\w-]+)$/)){ var f = frameById(m[1]); f ? pdpPage(f) : notFound(); }
  else if(path === '/try-on') tryonPage();
  else if(path === '/prescription') rxPage();
  else if(path === '/cart') cartPage();
  else if(path === '/checkout') checkoutPage();
  else if(path === '/orders') ordersPage();
  else if(path === '/appointment') apptPage();
  else if(path === '/account') accountPage();
  else notFound();
  reveal();
}

/* ---------- nav + footer ---------- */
function cartCount(){ return S.cart.reduce(function(a,c){ return a + c.qty; }, 0); }
function renderNav(){
  var path = location.pathname;
  var links = [
    ['/','Home'],['/frames','Frames'],['/try-on','Virtual try-on'],['/appointment','Appointment'],['/orders','Track order']
  ].map(function(l){
    return '<a data-route href="'+l[0]+'" class="'+(path===l[0]||(l[0]!=='/'&&path.indexOf(l[0])===0)?'active':'')+'">'+l[1]+'</a>';
  }).join('');
  document.getElementById('nav').innerHTML =
  '<div class="wrap">'+
    '<a class="brand" data-route href="/">'+
      '<span class="mark"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="6.5" stroke="#fdfcf8" stroke-width="2"/><circle cx="12" cy="12" r="2.2" fill="#f6c28b"/></svg></span>'+
      '<span>SKIDS Vision<small>One home for your child\u2019s eyes</small></span>'+
    '</a>'+
    '<div class="links">'+links+'</div>'+
    '<div class="nav-cta">'+
      '<a class="cart-link" data-route href="/cart" title="Cart">🛍<span class="cart-badge">'+cartCount()+'</span></a>'+
      '<a class="btn solid sm" data-route href="/account">Account</a>'+
    '</div>'+
  '</div>';
}
function footerHTML(){
  return '<div class="wrap"><div class="cols">'+
  '<div><a class="brand" data-route href="/">'+
    '<span class="mark"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="6.5" stroke="#fdfcf8" stroke-width="2"/><circle cx="12" cy="12" r="2.2" fill="#f6c28b"/></svg></span>'+
    '<span>SKIDS<small>Healthy kids. Healthy nations.</small></span></a>'+
    '<p style="margin-top:14px;max-width:30em;font-size:13.5px;color:rgba(253,252,248,.6)">A continuous pediatric care system for the whole child. Built for India. SKIDS Vision is one of 23 specialty clinics every SKIDS pediatrician runs from day one.</p></div>'+
  '<div><h4>Shop</h4><ul>'+
    '<li><a data-route href="/frames">All frames</a></li><li><a data-route href="/try-on">Virtual try-on</a></li>'+
    '<li><a data-route href="/prescription">Upload prescription</a></li><li><a data-route href="/orders">Track an order</a></li></ul></div>'+
  '<div><h4>Care</h4><ul>'+
    '<li><a data-route href="/appointment">Book an appointment</a></li><li><a href="https://skids.clinic/clinics/vision">The Vision Clinic</a></li>'+
    '<li><a href="https://skids.clinic/schools">School screening camps</a></li><li><a href="https://skids.clinic/contact">Contact clinic manager</a></li></ul></div>'+
  '<div><h4>SKIDS</h4><ul>'+
    '<li><a href="https://skids.clinic/parents">For parents</a></li><li><a href="https://skids.clinic/providers">For pediatricians</a></li>'+
    '<li><a href="https://skids.clinic/my-skids">mySKIDS life record</a></li><li><a href="https://skids.clinic/reading-room">Reading Room</a></li></ul></div>'+
  '</div><div class="base">'+
    '<span>SKIDS Health Technologies Pvt. Ltd. · 518, V V Arcade, AECS Layout, Bengaluru 560037 · +91 73771 12777</span>'+
    '<span>© 2026 SKIDS Health Technologies Pvt. Ltd. · <a href="https://skids.clinic/legal/privacy">Privacy</a> · <a href="https://skids.clinic/legal/terms">Terms</a> · <a href="https://skids.clinic/legal/medical-disclaimer">Medical disclaimer</a></span>'+
  '</div></div>';
}
function notFound(){
  document.getElementById('footer').innerHTML = footerHTML();
  app.innerHTML = '<div class="page"><div class="wrap" style="text-align:center;padding:80px 0">'+
  '<p class="eyebrow">404</p><h1 style="font-size:40px;margin:12px 0">This page is out of focus.</h1>'+
  '<p style="color:var(--muted);margin-bottom:28px">The page you are looking for does not exist.</p>'+
  '<a class="btn solid" data-route href="/">Back to home</a></div></div>';
}

/* ---------- cart logic ---------- */
function cartTotal(){
  return S.cart.reduce(function(a,c){
    var f = frameById(c.frameId); var l = lensById(c.lensId);
    return a + (f.price + l.price) * c.qty;
  }, 0);
}
function addToCart(frameId, colorId, lensId){
  var key = frameId + '|' + colorId + '|' + lensId;
  for(var i=0;i<S.cart.length;i++){
    var c = S.cart[i];
    if(c.frameId+'|'+c.colorId+'|'+c.lensId === key){ c.qty++; save(); return false; }
  }
  S.cart.push({frameId:frameId, colorId:colorId, lensId:lensId, qty:1});
  save(); return true;
}
function toggleWish(id){
  var i = S.wishlist.indexOf(id);
  if(i >= 0){ S.wishlist.splice(i,1); return false; }
  S.wishlist.push(id); return true;
}


/* ---------- HOME ---------- */
function homePage(){
  document.getElementById('footer').innerHTML = footerHTML();
  app.innerHTML =
  '<header class="hero">'+
    '<div class="orb o1 parallax" data-speed="0.25"></div><div class="orb o2 parallax" data-speed="-0.2"></div><div class="orb o3 parallax" data-speed="0.4"></div>'+
    '<div class="wrap"><div>'+
      '<p class="eyebrow"><b>SKIDS</b> Vision · for parents</p>'+
      '<h1>Your child\u2019s sight has a story. <em>We make sure it\u2019s read early.</em></h1>'+
      '<p class="lede">From the school screening that first spots the signal, to the clinic where pediatricians and ophthalmologists care together — to frames tried on at home, ordered digitally and delivered to your door. One home for your child\u2019s eyes, for life.</p>'+
      '<div class="cta">'+
        '<a class="btn solid" data-route href="/appointment">Get an appointment</a>'+
        '<a class="btn amber" data-route href="/try-on">Try frames on your child</a>'+
        '<a class="btn ghost" data-route href="/frames">Browse frames</a>'+
      '</div>'+
      '<div class="trust"><div><b>1 in 3</b>children needs glasses before 12</div><div><b>120K+</b>screenings done</div><div><b>48 hrs</b>home delivery of specs</div></div>'+
    '</div><div class="eye-stage">'+
      '<span class="float-chip fc1" data-route href="/frames">School camp<small>screening this week</small></span>'+
      '<span class="float-chip fc2" data-route href="/prescription">Upload Rx<small>prescription in seconds</small></span>'+
      '<span class="float-chip fc3" data-route href="/try-on">Virtual try-on<small>frames at home</small></span>'+
      '<span class="float-chip fc4" data-route href="/orders">Home delivery<small>track every step</small></span>'+
      '<div class="eye"><svg width="360" height="360" viewBox="0 0 360 360" fill="none" aria-hidden="true">'+
        '<circle cx="180" cy="180" r="140" stroke="#1e3358" stroke-opacity=".16"/>'+
        '<circle cx="180" cy="180" r="112" stroke="#1e3358" stroke-opacity=".22"/>'+
        '<path d="M40 180 C 90 90, 270 90, 320 180 C 270 270, 90 270, 40 180 Z" fill="#fff" stroke="#1e3358" stroke-width="3"/>'+
        '<g class="iris"><circle cx="180" cy="180" r="52" fill="#3a3866"/><circle cx="180" cy="180" r="52" fill="url(#ir)" fill-opacity=".7"/>'+
        '<circle cx="180" cy="180" r="20" fill="#1b1230"/><circle cx="164" cy="164" r="9" fill="#fff" fill-opacity=".85"/></g>'+
        '<path d="M40 180 C 90 90, 270 90, 320 180 C 270 270, 90 270, 40 180 Z" fill="none" stroke="#1e3358" stroke-width="3"/>'+
        '<defs><radialGradient id="ir" cx=".6" cy=".4" r=".8"><stop offset="0" stop-color="#f6c28b"/><stop offset="1" stop-color="#6b2640" stop-opacity="0"/></radialGradient></defs>'+
        '<g class="blink" style="transform-origin:180px 180px"><path d="M40 180 C 90 90, 270 90, 320 180 C 270 270, 90 270, 40 180 Z" fill="#fdfcf8"/></g>'+
      '</svg></div>'+
    '</div></div>'+
    '<div class="scroll-cue">The story</div>'+
  '</header>';
  homeScience(); homeMore1(); homeMore2();
  wireParallax();
  $$('[data-open]', app).forEach(function(c){
    c.addEventListener('click', function(){ go('/frames/' + c.dataset.open); });
  });
}


function homeScience(){
  app.insertAdjacentHTML('beforeend',
  '<section class="sec dark" id="science">'+
    '<div class="wrap"><div class="sec-head rv"><p class="eyebrow">The science, visually</p>'+
    '<h2>What myopia actually does inside your child\u2019s eye.</h2>'+
    '<p>Drag the slider and watch what years of close-up screen work quietly do.</p><div class="rule"></div></div>'+
    '<div class="demo-shell">'+
      '<div class="eye-demo rv">'+
        '<svg viewBox="0 0 460 220" id="myoSvg" aria-label="Light focusing inside a child\u2019s eye">'+
          '<ellipse id="eyeball" cx="230" cy="110" rx="120" ry="78" fill="#fdfcf8" fill-opacity=".1" stroke="#fdfcf8" stroke-opacity=".5" stroke-width="2"/>'+
          '<line x1="4" y1="110" x2="110" y2="110" stroke="#f6c28b" stroke-width="1.5" stroke-dasharray="4 5" opacity=".6"/>'+
          '<path id="ray1" d="" stroke="#f6c28b" stroke-width="2"/><path id="ray2" d="" stroke="#f6c28b" stroke-width="2"/>'+
          '<circle id="focus" cx="0" cy="110" r="5" fill="#f6c28b"/>'+
          '<rect id="retina" x="342" y="34" width="7" height="152" rx="3" fill="#8ea2c8"/>'+
          '<text x="356" y="30" fill="#c9d4ea" font-size="11" font-family="Inter">retina</text>'+
          '<text x="60" y="100" fill="#c9d4ea" font-size="11" font-family="Inter">light</text>'+
          '<g id="lensG" opacity="0"><path d="M118 70 Q 128 110 118 150" stroke="#7fd8a0" stroke-width="4" fill="none"/>'+
          '<text x="86" y="188" fill="#7fd8a0" font-size="11" font-family="Inter">corrective lens</text></g>'+
          '<circle id="focusGood" cx="342" cy="110" r="0" fill="none" stroke="#7fd8a0" stroke-width="2.5"/>'+
        '</svg>'+
        '<div class="slider-row"><span>Age 6</span><input type="range" id="ageSlider" min="0" max="100" value="0" aria-label="Close-up work over time"><span>Age 14</span></div>'+
        '<p class="demo-note" id="demoNote"><b>Normal eye.</b> Light focuses exactly on the retina. The board is sharp.</p>'+
      '</div>'+
      '<div class="myth-list rv">'+
        '<div class="myth"><h3>The eyeball quietly stretches</h3><p>Sustained near work elongates the eye. Light focuses in front of the retina — distant things blur. Myopia is structural, not a habit.</p></div>'+
        '<div class="myth"><h3>It progresses fastest from 7 to 14</h3><p>The years of heaviest reading and screen time. Most parents discover it after months of squinting and headaches.</p></div>'+
        '<div class="myth"><h3>Caught early, it can be slowed</h3><p>Outdoor time, myopia-control lenses and the right spectacles change the curve. That\u2019s why SKIDS screens annually.</p></div>'+
        '<div class="myth"><h3>\u201CHe\u2019ll tell us if he can\u2019t see\u201D</h3><p>He won\u2019t. Children assume everyone sees the way they do. Screening is the only honest witness.</p></div>'+
      '</div>'+
    '</div></div>'+
  '</section>');
  wireDemo();
}
function wireDemo(){
  var slider = $('#ageSlider', app), note = $('#demoNote', app);
  var ray1 = $('#ray1', app), ray2 = $('#ray2', app), focus = $('#focus', app);
  var ball = $('#eyeball', app), lensG = $('#lensG', app), focusGood = $('#focusGood', app);
  function demo(v){
    var t = v/100, rx = 120 + t*26, fx = 342 - t*74;
    ball.setAttribute('rx', rx); focus.setAttribute('cx', fx);
    ray1.setAttribute('d','M4 60 L118 84 L'+fx+' 110');
    ray2.setAttribute('d','M4 160 L118 136 L'+fx+' 110');
    if(t < .18){
      note.innerHTML = '<b>Normal eye.</b> Light focuses exactly on the retina. The board is sharp.';
      lensG.setAttribute('opacity','0'); focusGood.setAttribute('r','0');
    } else {
      note.innerHTML = '<b>Myopia −'+(t*3.5).toFixed(1)+' D.</b> The eye has elongated — light now focuses <b>in front of</b> the retina. The board is blurry, and your child has adapted silently.';
      lensG.setAttribute('opacity','1'); focusGood.setAttribute('r','7');
      focusGood.setAttribute('cx', fx); focusGood.setAttribute('cy','110');
    }
  }
  slider.addEventListener('input', function(){ demo(+this.value); });
  demo(0);
  if(reduceMotion) return;
  var played = false;
  var ob = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting && !played){
        played = true;
        var v = 0, dir = 1;
        var iv = setInterval(function(){
          v += dir*2;
          if(v >= 100) dir = -1;
          if(v <= 0){ clearInterval(iv); demo(0); slider.value = 0; return; }
          slider.value = v; demo(v);
        }, 28);
      }
    });
  },{threshold:.4});
  ob.observe($('#myoSvg', app));
}


function homeMore1(){
  app.insertAdjacentHTML('beforeend',
  '<section class="sec alt"><div class="wrap">'+
    '<div class="sec-head rv"><p class="eyebrow">How it works</p><h2>Wherever your child is, the screening finds them.</h2>'+
    '<p>SKIDS screens in schools, in clinic — and soon, at home. One pathway, one record.</p><div class="rule"></div></div>'+
    '<div class="doors">'+
      '<div class="door card rv"><div class="illus"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#1e3358" stroke-width="1.6"><path d="M3 10l9-6 9 6v10a1 1 0 01-1 1H4a1 1 0 01-1-1z"/><path d="M9 21V12h6v9"/></svg></div>'+
      '<span class="num">Door one</span><h3>School vision camps</h3><p>The Spot Vision Screener reads eight measurements per child in seconds — painless, contactless. Findings flow to your parent report the same day.</p><span class="where">At your child\u2019s school</span></div>'+
      '<div class="door card rv"><div class="illus"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#1e3358" stroke-width="1.6"><path d="M12 21s-7-4.5-9-9a5 5 0 019-3 5 5 0 019 3c-2 4.5-9 9-9 9z"/><path d="M12 12v9" stroke="#e8a04c"/></svg></div>'+
      '<span class="num">Door two</span><h3>The Vision Clinic</h3><p>Flagged at school or booked directly — full refraction, myopia-control discussion, amblyopia review, spectacles dispensed, follow-up set.</p><span class="where">Bengaluru · AECS Layout</span></div>'+
      '<div class="door card soon rv"><div class="illus"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#1e3358" stroke-width="1.6"><path d="M3 11l9-8 9 8v9a1 1 0 01-1 1h-4v-6H8v6H4a1 1 0 01-1-1z"/><circle cx="12" cy="10" r="2.5" stroke="#5a7148"/></svg></div>'+
      '<span class="num">Door three</span><h3>Screening at home</h3><p>A guided at-home vision check is being built into the SKIDS Companion — the same protocol, from your living room.</p><span class="where">Coming soon</span></div>'+
    '</div></div></section>'+
    '<section class="sec"><div class="wrap">'+
    '<div class="sec-head rv"><p class="eyebrow">The care team</p><h2>A pediatrician and an ophthalmologist, around the same child.</h2>'+
    '<p>Not a pair of glasses and a goodbye — a combined practice sharing one record.</p><div class="rule"></div></div>'+
    '<div class="team">'+
      '<div class="card member rv"><div class="avatar">S</div><h3>SKIDS Pediatrician</h3><span class="role">The whole child</span><p>Reads vision alongside sleep, growth, iron and attention. Owns the pathway — outdoor time, screen rhythm, reading posture.</p></div>'+
      '<div class="card member rv"><div class="avatar">O</div><h3>Pediatric Optometrist</h3><span class="role">The measurement</span><p>Full refraction, dioptre grading, convergence testing, dispensing. Confirms every screening finding.</p></div>'+
      '<div class="card member rv"><div class="avatar">Ph</div><h3>Pediatric Ophthalmologist</h3><span class="role">The escalation</span><p>Amblyopia, squint and red-flag care — reached at the right time, with the whole story intact, never as a stranger.</p></div>'+
    '</div>'+
    '<div class="ladder rv"><h3>The complete ladder of treatment</h3><div class="rungs">'+
      '<div class="rung"><b>Spectacles</b><span>Dispensed in-clinic or ordered digitally.</span></div>'+
      '<div class="rung"><b>Myopia control</b><span>Progression tracking, outdoor time, atropine.</span></div>'+
      '<div class="rung"><b>Amblyopia care</b><span>Patching inside the treatment window.</span></div>'+
      '<div class="rung"><b>Escalation</b><span>Complex care referred with the full record.</span></div>'+
    '</div></div></div></section>');
}
function homeMore2(){
  var feat = FRAMES.slice(0,4).map(function(f){
    return '<div class="pcard rv" data-open="'+f.id+'">'+
      (f.badge?'<span class="badge">'+f.badge+'</span>':'')+
      '<div class="fgfx">'+frameSvg(f, colorById(f.colors[0]).hex, 150)+'</div>'+
      '<div class="pmeta"><h3>'+f.name+'</h3><p class="meta">'+f.cat+' · '+f.age+'</p>'+
      '<div class="row"><span class="price">'+rupee(f.price)+'</span><span class="colordots">'+f.colors.map(function(c){return '<i style="background:'+colorById(c).hex+'"></i>';}).join('')+'</span></div></div></div>';
  }).join('');
  app.insertAdjacentHTML('beforeend',
  '<section class="sec alt" id="featured"><div class="wrap">'+
    '<div class="sec-head rv" style="display:flex;justify-content:space-between;align-items:flex-end;gap:20px;max-width:none">'+
      '<div><p class="eyebrow">The digital showroom</p><h2>Frames your child will actually wear.</h2><div class="rule"></div></div>'+
      '<a class="btn ghost" data-route href="/frames">View all frames</a></div>'+
    '<div class="fgrid">'+feat+'</div></div></section>'+
    '<section class="sec"><div class="wrap">'+
    '<div class="sec-head rv"><p class="eyebrow">Order to doorstep</p><h2>Prescription in. Spectacles out. Doorbell next.</h2>'+
    '<p>Every order is digital, AI-fitted and automatically fulfilled.</p><div class="rule"></div></div>'+
    '<div class="flow">'+
      '<div class="f rv"><h3>Prescription, digitally</h3><p>Flows straight from the clinic record — or upload a report. No transcription errors.</p></div>'+
      '<div class="f rv"><h3>AI fitting at home</h3><p>One standard photo gives clinical-grade PD and fitting measurements — contactless.</p></div>'+
      '<div class="f rv"><h3>Automated fulfilment</h3><p>The lab cuts lenses to the millimetre and dispatches — tracked live in your account.</p></div>'+
      '<div class="f rv"><h3>Home delivery &amp; after-care</h3><p>Delivered to your door with a follow-up review scheduled automatically.</p></div>'+
    '</div></div></section>');
  homeMore3();
  $$('[data-open]', app).forEach(function(c){
    c.addEventListener('click', function(){ go('/frames/' + c.dataset.open); });
  });
}


function homeMore3(){
  app.insertAdjacentHTML('beforeend',
  '<section class="sec alt"><div class="wrap"><div class="grid2" style="align-items:center">'+
    '<div class="rv"><p class="eyebrow">Lifetime membership</p><h2 style="font-size:clamp(26px,3.6vw,40px);margin:14px 0 14px">One child. One record. One membership that grows with them.</h2>'+
    '<p style="color:var(--muted)">After the screening, the relationship begins — annual screening, dioptre-by-dioptre tracking, myopia-control reviews, member pricing on every pair.</p><div class="rule"></div></div>'+
    '<div class="mem-card rv"><h3>SKIDS Vision family</h3><span class="lvl">Lifetime membership</span><ul>'+
      '<li>Annual screening — school, clinic, soon at home</li><li>Progression tracking in the mySKIDS record</li>'+
      '<li>Myopia-control reviews and outdoor-time plans</li><li>Member pricing &amp; home delivery of spectacles</li>'+
      '<li>Follow-up cadence matched to your child\u2019s risk</li></ul>'+
    '<a class="btn amber" href="https://skids.clinic/plans">Become a member family</a></div>'+
  '</div></div></section>'+
  '<section class="sec"><div class="wrap">'+
    '<div class="sec-head rv" style="text-align:center;max-width:36em;margin:0 auto 40px"><p class="eyebrow">The signal</p><h2>Real children. Growing evidence.</h2><div class="rule" style="margin:20px auto 0"></div></div>'+
    '<div class="signal"><div class="rv"><div class="v">120K+</div><div class="k">Screenings</div></div><div class="rv"><div class="v">23</div><div class="k">Specialty clinics</div></div>'+
    '<div class="rv"><div class="v">70+</div><div class="k">Whole-child parameters</div></div><div class="rv"><div class="v">1</div><div class="k">Life record</div></div></div></div></section>'+
  '<section class="sec alt final"><div class="wrap rv"><p class="eyebrow">SKIDS Vision · for parents</p>'+
    '<h2>Begin your child\u2019s vision story early. Calmly.</h2>'+
    '<p>The one place to get the appointment, the prescription, the specs, and the lifetime care.</p>'+
    '<div class="cta"><a class="btn solid" data-route href="/appointment">Get an appointment</a>'+
    '<a class="btn amber" data-route href="/frames">Get specs</a>'+
    '<a class="btn ghost" data-route href="/prescription">Upload prescription</a>'+
    '<a class="btn ghost" href="https://skids.clinic/activate/demo">Activate screening report</a></div></div></section>');
}
function wireParallax(){
  if(reduceMotion) return;
  var orbs = $$('.parallax', app);
  var tick = false;
  window.addEventListener('scroll', function(){
    if(tick) return; tick = true;
    requestAnimationFrame(function(){
      var y = window.scrollY;
      orbs.forEach(function(o){ o.style.transform = 'translateY(' + (y * parseFloat(o.dataset.speed)) + 'px)'; });
      tick = false;
    });
  }, {passive:true});
}

/* ---------- CATALOG ---------- */
var catFilter = 'all', catSort = 'featured';
function framesPage(){
  document.getElementById('footer').innerHTML = footerHTML();
  app.innerHTML =
  '<div class="page-hero"><div class="wrap">'+
    '<p class="crumb"><a data-route href="/">Home</a> / Frames</p>'+
    '<p class="eyebrow"><b>SKIDS</b> digital showroom</p>'+
    '<h1>Frames your child will actually want to wear.</h1>'+
    '<p>Built for small faces and big playgrounds. Every pair is AI-fitted to your child\u2019s measurements and delivered home in 48 hours.</p>'+
  '</div></div>'+
  '<div class="sec" style="padding-top:0"><div class="wrap">'+
    '<div class="cat-bar"><div class="filters">'+
      CATS.map(function(c){ return '<button class="fchip'+(catFilter===c.id?' on':'')+'" data-cat="'+c.id+'">'+c.name+'</button>'; }).join('')+
    '</div>'+
    '<select class="sel" id="sort"><option value="featured">Sort: Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="az">Name A–Z</option></select></div>'+
    '<div class="fgrid" id="fgrid"></div>'+
    '<div class="grid2" style="margin-top:44px">'+
      '<div class="card rv"><h3 style="font-size:20px;margin-bottom:8px">Not sure of the fit?</h3><p style="color:var(--muted);font-size:14px;margin-bottom:16px">Try every frame on your child virtually — no shop visit, no queue, no squirming.</p><a class="btn solid sm" data-route href="/try-on">Open virtual try-on</a></div>'+
      '<div class="card rv"><h3 style="font-size:20px;margin-bottom:8px">No prescription yet?</h3><p style="color:var(--muted);font-size:14px;margin-bottom:16px">Book the Vision Clinic — screening, refraction and myopia-control discussion in one visit.</p><a class="btn amber sm" data-route href="/appointment">Get an appointment</a></div>'+
    '</div>'+
  '</div></div>';
  $('#sort', app).value = catSort;
  renderGrid();
  $$('.fchip', app).forEach(function(ch){
    ch.onclick = function(){
      catFilter = ch.dataset.cat;
      $$('.fchip', app).forEach(function(c){ c.classList.remove('on'); });
      ch.classList.add('on');
      renderGrid();
    };
  });
  $('#sort', app).onchange = function(){ catSort = this.value; renderGrid(); };
}
function renderGrid(){
  var list = FRAMES.filter(function(f){ return catFilter === 'all' || f.cat === catFilter; });
  if(catSort === 'low') list.sort(function(a,b){ return a.price - b.price; });
  else if(catSort === 'high') list.sort(function(a,b){ return b.price - a.price; });
  else if(catSort === 'az') list.sort(function(a,b){ return a.name < b.name ? -1 : 1; });
  var g = $('#fgrid', app);
  g.innerHTML = list.map(function(f){
    return '<div class="pcard rv in" data-open="'+f.id+'">'+
      '<span class="heart'+(S.wishlist.indexOf(f.id)>=0?' on':'')+'" data-wish="'+f.id+'">'+(S.wishlist.indexOf(f.id)>=0?'♥':'♡')+'</span>'+
      (f.badge?'<span class="badge">'+f.badge+'</span>':'')+
      '<div class="fgfx">'+frameSvg(f, colorById(f.colors[0]).hex, 150)+'</div>'+
      '<div class="pmeta"><h3>'+f.name+'</h3><p class="meta">'+f.cat+' · '+f.age+' · '+f.shape+'</p>'+
      '<div class="row"><span class="price">'+rupee(f.price)+'</span><span class="colordots">'+f.colors.map(function(c){return '<i style="background:'+colorById(c).hex+'"></i>';}).join('')+'</span></div></div></div>';
  }).join('') || '<div class="empty">No frames in this category yet.</div>';
  $$('.pcard', g).forEach(function(c){
    c.addEventListener('click', function(e){
      if(e.target.closest('.heart')){ e.stopPropagation(); return; }
      go('/frames/' + c.dataset.open);
    });
  });
  $$('.heart', g).forEach(function(h){
    h.onclick = function(e){
      e.stopPropagation();
      var on = toggleWish(h.dataset.wish);
      h.classList.toggle('on', on); h.textContent = on ? '♥' : '♡';
      toast(on ? 'Saved to your wishlist' : 'Removed from wishlist');
    };
  });
}


/* ---------- PDP ---------- */
function pdpPage(f){
  document.getElementById('footer').innerHTML = footerHTML();
  var color = colorById(f.colors[0]);
  var sel = { colorId: color.id, lensId: 'standard', qty: 1 };
  app.innerHTML =
  '<div class="page"><div class="wrap">'+
    '<p class="crumb"><a data-route href="/">Home</a> / <a data-route href="/frames">Frames</a> / '+f.name+'</p>'+
    '<div class="pdp">'+
      '<div><div class="visual" id="pdpVisual">'+frameSvg(f, color.hex, 320, 6)+'</div>'+
        '<div class="includes"><b>Every pair includes</b> · anti-glare coating · impact-resistant lenses · 1-year frame warranty · free fitting + adjustment for life at the clinic.</div>'+
      '</div>'+
      '<div>'+
        '<p class="eyebrow">'+f.cat+' · '+f.shape+' · ages '+f.age+'</p>'+
        '<h1>'+f.name+'</h1>'+
        '<p style="color:var(--muted)">'+f.blurb+'</p>'+
        '<div class="price">'+rupee(f.price)+'<span style="font-size:14px;color:var(--muted);font-weight:500"> / frame+lenses</span></div>'+
        '<span class="save">Member families save 10% at checkout</span>'+
        '<div class="opts">'+
          '<div class="opt-group"><h4>Colour</h4><div class="swatches">'+
            f.colors.map(function(c,ci){ return '<span class="sw'+(ci===0?' on':'')+'" data-color="'+c+'" style="background:'+colorById(c).hex+'" title="'+colorById(c).name+'"></span>'; }).join('')+
          '</div></div>'+
          '<div class="opt-group"><h4>Lenses</h4>'+
            LENS_OPTIONS.map(function(l,li){
              return '<div class="opt'+(li===0?' on':'')+'" data-lens="'+l.id+'"><span><b>'+l.name+'</b><small>'+l.desc+'</small></span><span class="op">'+(l.price?'+ '+rupee(l.price):'Included')+'</span></div>';
            }).join('')+
          '</div>'+
          '<div class="opt-group"><h4>Quantity</h4><div class="qty"><button id="qm">−</button><span id="qv">1</span><button id="qp">+</button></div></div>'+
        '</div>'+
        '<div class="ctas">'+
          '<button class="btn solid wide" id="addBtn">Add to order · <span id="lineTotal">'+rupee(f.price)+'</span></button>'+
          '<a class="btn ghost" data-route href="/try-on?frame='+f.id+'">Try on</a>'+
        '</div>'+
        '<div class="rx-box">💊 <b>Prescription attached automatically</b> — we read the latest Rx from your child\u2019s clinic record, or <a data-route href="/prescription" style="text-decoration:underline;font-weight:600">enter / upload one</a>. AI fitting happens from a single photo after checkout.</div>'+
        '<div class="includes" style="margin-top:0"><b>'+f.tags.join(' · ')+'</b></div>'+
      '</div>'+
    '</div></div></div>';
  function lineTotal(){
    return (f.price + lensById(sel.lensId).price) * sel.qty;
  }
  function refresh(){
    $('#lineTotal', app).textContent = rupee(lineTotal());
    $('#qv', app).textContent = sel.qty;
  }
  $$('.sw', app).forEach(function(s){
    s.onclick = function(){
      $$('.sw', app).forEach(function(x){ x.classList.remove('on'); });
      s.classList.add('on'); sel.colorId = s.dataset.color;
      $('#pdpVisual', app).innerHTML = frameSvg(f, colorById(sel.colorId).hex, 320, 6);
    };
  });
  $$('.opt', app).forEach(function(o){
    o.onclick = function(){
      $$('.opt', app).forEach(function(x){ x.classList.remove('on'); });
      o.classList.add('on'); sel.lensId = o.dataset.lens; refresh();
    };
  });
  $('#qm', app).onclick = function(){ if(sel.qty>1){ sel.qty--; refresh(); } };
  $('#qp', app).onclick = function(){ sel.qty++; refresh(); };
  $('#addBtn', app).onclick = function(){
    addToCart(f.id, sel.colorId, sel.lensId);
    for(var i=0;i<S.cart.length;i++){
      var c = S.cart[i];
      if(c.frameId===f.id && c.colorId===sel.colorId && c.lensId===sel.lensId) c.qty = sel.qty;
    }
    save(); renderNav();
    toast(f.name + ' — ' + colorById(sel.colorId).name + ' added to your order');
  };
}


/* ---------- TRY-ON ---------- */
var tryState = null;
function tryonPage(){
  document.getElementById('footer').innerHTML = footerHTML();
  var preselect = null;
  try{ preselect = (location.search.match(/frame=([\w-]+)/)||[])[1]; }catch(e){}
  var defId = (preselect && frameById(preselect)) ? preselect : 'explorer';
  if(!tryState){
    tryState = { frameId: defId, colorId: frameById(defId).colors[0], size: 1, offY: 0, photo: null };
  }
  app.innerHTML =
  '<div class="page-hero"><div class="wrap">'+
    '<p class="crumb"><a data-route href="/">Home</a> / Virtual try-on</p>'+
    '<p class="eyebrow"><b>SKIDS</b> virtual try-on</p>'+
    '<h1>See every frame on your child\u2019s face — before you order.</h1>'+
    '<p>Use the demo face, or upload a straight-facing photo. Position the frame, pick the colour, and drop it straight into your order.</p>'+
  '</div></div>'+
  '<div class="sec" style="padding-top:10px"><div class="wrap"><div class="try-layout">'+
    '<div><div class="try-stage" id="stage"></div>'+
      '<p class="try-note" style="margin-top:12px">Frame sizing is guided by your child\u2019s PD measured from this same photo at checkout — Oculfit-class AI fitting, contactless, from your sofa.</p></div>'+
    '<div class="try-controls">'+
      '<div class="card"><h4>Photo</h4>'+
        '<div class="drop" id="drop">📷 Upload a photo of your child<br><small style="font-weight:500">(straight-facing, no glasses — stored only on your device)</small></div>'+
        '<input type="file" id="file" accept="image/*" hidden>'+
        '<p style="text-align:center;margin:8px 0;font-size:12px;color:var(--muted)">— or —</p>'+
        '<button class="btn ghost sm wide" id="demoFace">Use the demo child</button>'+
      '</div>'+
      '<div class="card"><h4>Frame</h4><div id="framePills" style="display:grid;gap:8px">'+
        FRAMES.map(function(f){
          return '<div class="frame-pill'+(tryState.frameId===f.id?' on':'')+'" data-f="'+f.id+'">'+frameSvg(f, colorById(tryState.frameId===f.id?tryState.colorId:f.colors[0]).hex, 54, 7)+'<span>'+f.name+'</span><span style="margin-left:auto;font-family:var(--serif)">'+rupee(f.price)+'</span></div>';
        }).join('')+
      '</div></div>'+
      '<div class="card"><h4>Colour</h4><div class="swatches">'+
        frameById(tryState.frameId).colors.map(function(c){
          return '<span class="sw'+(tryState.colorId===c?' on':'')+'" data-color="'+c+'" style="background:'+colorById(c).hex+'" title="'+colorById(c).name+'"></span>';
        }).join('')+
      '</div></div>'+
      '<div class="card"><h4>Fit</h4>'+
        '<label style="font-size:12.5px;color:var(--muted)">Frame size</label>'+
        '<input type="range" id="rSize" min="60" max="170" value="'+Math.round(tryState.size*100)+'">'+
        '<label style="font-size:12.5px;color:var(--muted)">Vertical position</label>'+
        '<input type="range" id="rOff" min="-60" max="60" value="'+tryState.offY+'">'+
      '</div>'+
      '<button class="btn amber wide" id="orderThis">Order this pair</button>'+
    '</div>'+
  '</div></div></div>';
  wireTryon();
}


function wireTryon(){
  var stage = $('#stage', app);
  function draw(){
    var f = frameById(tryState.frameId), hex = colorById(tryState.colorId).hex;
    var cw = 560, ch = 440;
    if(tryState.photo){
      var img = tryState.photo;
      var sc = Math.max(cw/img.width, ch/img.height);
      var w = img.width*sc, h = img.height*sc;
      stage.innerHTML = '<canvas id="cv" width="'+cw+'" height="'+ch+'" style="max-width:100%"></canvas>';
      var cv = $('#cv', app), ctx = cv.getContext('2d');
      ctx.fillStyle = '#2a2f45'; ctx.fillRect(0,0,cw,ch);
      ctx.drawImage(img, (cw-w)/2, (ch-h)/2, w, h);
      var fs = 260 * tryState.size;
      ctx.save();
      ctx.translate(cw/2, ch*0.45 + tryState.offY);
      ctx.scale(fs/300, fs/300);
      var p = new Path2D(f.path);
      ctx.lineWidth = 5.5; ctx.strokeStyle = hex; ctx.lineJoin='round';
      ctx.stroke(p);
      ctx.globalAlpha = .12; ctx.fillStyle = hex; ctx.fill(p); ctx.globalAlpha = 1;
      ctx.restore();
    } else {
      stage.innerHTML =
      '<div class="demo-face"><svg viewBox="0 0 300 240" width="480" style="max-width:100%">'+
        '<ellipse cx="150" cy="128" rx="72" ry="88" fill="#f7dcc4"/>'+
        '<ellipse cx="150" cy="118" rx="60" ry="72" fill="#f9e4d2"/>'+
        '<path d="M108 44 Q 150 20 192 44 Q 150 8 108 44" fill="#3d2b23"/>'+
        '<path d="M104 46 Q 150 14 196 46 Q 186 30 150 26 Q 114 30 104 46" fill="#4a352b"/>'+
        '<ellipse cx="150" cy="196" rx="14" ry="10" fill="#f0cdb2"/>'+
        '<path d="M150 176 v14" stroke="#d9a98c" stroke-width="2.5" stroke-linecap="round"/>'+
        '<path d="M138 204 q 12 8 24 0" stroke="#c98a68" stroke-width="2.5" fill="none" stroke-linecap="round"/>'+
        '<circle cx="126" cy="118" r="7" fill="#2b1d16"/><circle cx="174" cy="118" r="7" fill="#2b1d16"/>'+
        '<circle cx="128" cy="116" r="2.2" fill="#fff"/><circle cx="176" cy="116" r="2.2" fill="#fff"/>'+
        '<g transform="translate(0,'+tryState.offY+')">'+
          '<path d="'+f.path+'" fill="none" stroke="'+hex+'" stroke-width="6" stroke-linejoin="round" opacity=".95" transform="scale(1,'+(0.4+tryState.size/1.4)+')"/>'+
          '<path d="'+f.path+'" fill="'+hex+'" fill-opacity=".13" transform="scale(1,'+(0.4+tryState.size/1.4)+')"/>'+
        '</g>'+
      '</svg></div>';
    }
  }
  draw();
  $('#file', app).onchange = function(){
    var fi = this.files[0]; if(!fi) return;
    var r = new FileReader();
    r.onload = function(){
      var img = new Image();
      img.onload = function(){ tryState.photo = img; draw(); toast('Photo loaded — use the Fit sliders to position the frame'); };
      img.src = r.result;
    };
    r.readAsDataURL(fi);
  };
  $('#drop', app).onclick = function(){ $('#file', app).click(); };
  $('#demoFace', app).onclick = function(){ tryState.photo = null; draw(); };
  $$('.frame-pill', app).forEach(function(p){
    p.onclick = function(){
      tryState.frameId = p.dataset.f;
      tryState.colorId = frameById(tryState.frameId).colors[0];
      go('/try-on?frame=' + tryState.frameId);
    };
  });
  $$('.sw', app).forEach(function(s){
    s.onclick = function(){
      $$('.sw', app).forEach(function(x){ x.classList.remove('on'); });
      s.classList.add('on'); tryState.colorId = s.dataset.color; draw();
    };
  });
  $('#rSize', app).oninput = function(){ tryState.size = this.value/100; draw(); };
  $('#rOff', app).oninput = function(){ tryState.offY = +this.value; draw(); };
  $('#orderThis', app).onclick = function(){
    addToCart(tryState.frameId, tryState.colorId, 'standard');
    save(); renderNav();
    toast(frameById(tryState.frameId).name + ' added to your order — pick lenses at checkout');
    go('/cart');
  };
}


/* ---------- PRESCRIPTION ---------- */
function rxPage(){
  document.getElementById('footer').innerHTML = footerHTML();
  var p = S.prescription;
  app.innerHTML =
  '<div class="page-hero"><div class="wrap">'+
    '<p class="crumb"><a data-route href="/">Home</a> / Prescription</p>'+
    '<p class="eyebrow">Prescription</p>'+
    '<h1>Your child\u2019s prescription, one tap away.</h1>'+
    '<p>If your child was screened or examined at a SKIDS clinic or camp, the prescription is already in the mySKIDS record. Otherwise, enter it here — or upload the paper.</p>'+
  '</div></div>'+
  '<div class="sec" style="padding-top:6px"><div class="wrap">'+
    '<div class="rx-box"><b>✓ Aarav\u2019s clinic record is already attached</b> — OD −1.25 / −0.50 × 180 · OS −1.00 · PD 54 mm, updated 14 Mar 2026 at the school camp. Orders below use this automatically.</div>'+
    '<div class="grid2"><div class="card rv"><h3 style="font-size:20px;margin-bottom:14px">Enter a prescription</h3>'+
      '<div class="form-grid">'+
        '<div class="field"><label>OD — right sphere</label><input class="in" id="odS" placeholder="-1.25" value="'+(p&&p.odS||'')+'"></div>'+
        '<div class="field"><label>OD — cylinder</label><input class="in" id="odC" placeholder="-0.50" value="'+(p&&p.odC||'')+'"></div>'+
        '<div class="field"><label>OD — axis</label><input class="in" id="odA" placeholder="180" value="'+(p&&p.odA||'')+'"></div>'+
        '<div class="field"><label>OS — left sphere</label><input class="in" id="osS" placeholder="-1.00" value="'+(p&&p.osS||'')+'"></div>'+
        '<div class="field"><label>OS — cylinder</label><input class="in" id="osC" placeholder="-0.25" value="'+(p&&p.osC||'')+'"></div>'+
        '<div class="field"><label>OS — axis</label><input class="in" id="osA" placeholder="170" value="'+(p&&p.osA||'')+'"></div>'+
        '<div class="field full"><label>Pupillary distance (PD, mm)</label><input class="in" id="pd" placeholder="54" value="'+(p&&p.pd||'')+'"><small>Don\u2019t know it? Leave blank — our AI measures it from one photo.</small></div>'+
      '</div>'+
      '<button class="btn solid" id="saveRx">Save prescription</button></div>'+
    '<div class="card rv"><h3 style="font-size:20px;margin-bottom:14px">Or upload the paper</h3>'+
      '<div class="drop" style="padding:36px">📄 Drop or browse the prescription photo / PDF<small style="display:block;margin-top:6px;font-weight:500">We read it, verify it against the clinic record, and attach it to your next order</small></div>'+
      '<div style="margin-top:16px;background:var(--cream2);border-radius:12px;padding:14px 16px;font-size:13px;color:var(--muted)"><b style="color:var(--ink)">No prescription at all?</b><br>Your child probably needs a screening first — book the Vision Clinic and we\u2019ll take it from there.</div>'+
      '<a class="btn amber sm" data-route href="/appointment" style="margin-top:12px">Book a screening instead</a></div>'+
    '</div></div></div>';
  $('#saveRx', app).onclick = function(){
    var v = function(id){ return $('#' + id, app).value.trim(); };
    S.prescription = { odS:v('odS'), odC:v('odC'), odA:v('odA'), osS:v('osS'), osC:v('osC'), osA:v('osA'), pd:v('pd') };
    save(); toast('Prescription saved to your family record');
  };
}

/* ---------- CART ---------- */
function cartPage(){
  document.getElementById('footer').innerHTML = footerHTML();
  if(!S.cart.length){
    app.innerHTML = '<div class="page"><div class="empty"><h1 style="font-size:34px;margin-bottom:10px">Your order is empty.</h1>'+
    '<p style="margin-bottom:26px">Frames tried on and loved belong here.</p>'+
    '<a class="btn solid" data-route href="/frames">Browse frames</a> &nbsp; <a class="btn ghost" data-route href="/try-on">Virtual try-on</a></div></div>';
    return;
  }
  var lines = S.cart.map(function(c,i){
    var f = frameById(c.frameId), col = colorById(c.colorId), l = lensById(c.lensId);
    return '<div class="cline">'+
      '<div class="fgfx">'+frameSvg(f, col.hex, 78)+'</div>'+
      '<div><h4>'+f.name+' — '+col.name+'</h4>'+
      '<p class="meta">'+l.name+(l.price?' · + '+rupee(l.price):'')+' · Rx auto-attached</p>'+
      '<div class="qty" style="margin-top:8px"><button data-qm="'+i+'">−</button><span>'+c.qty+'</span><button data-qp="'+i+'">+</button></div></div>'+
      '<div style="text-align:right"><div class="price">'+rupee((f.price + l.price)*c.qty)+'</div>'+
      '<button class="x" data-x="'+i+'" style="margin-top:8px">Remove</button></div>'+
    '</div>';
  }).join('');
  app.innerHTML =
  '<div class="page-hero"><div class="wrap"><p class="crumb"><a data-route href="/">Home</a> / Your order</p>'+
  '<p class="eyebrow">Your order</p><h1>Review and confirm.</h1></div></div>'+
  '<div class="sec" style="padding-top:0"><div class="wrap"><div class="cart-layout">'+
    '<div>'+lines+
      '<div class="rx-box">🤖 <b>AI fitting</b> happens after checkout: we\u2019ll ask for one straight-facing photo of your child. PD and fitting heights are measured to the millimetre — no shop visit needed.</div>'+
    '</div>'+
    '<div class="summary"><h3>Order summary</h3>'+
      '<div class="srow"><span>'+cartCount()+' frame(s)</span><span>'+rupee(cartTotal())+'</span></div>'+
      '<div class="srow"><span>Member discount (10%)</span><span style="color:var(--green)">− '+rupee(Math.round(cartTotal()*0.1))+'</span></div>'+
      '<div class="srow"><span>Home delivery</span><span style="color:var(--green)">Free</span></div>'+
      '<div class="srow total"><span>To pay</span><span>'+rupee(Math.round(cartTotal()*0.9))+'</span></div>'+
      '<button class="btn solid wide" id="checkout">Proceed to checkout</button>'+
      '<p style="font-size:12px;color:var(--muted);margin-top:12px;text-align:center">Prescription verified against the clinic record · 48-hour dispatch</p>'+
    '</div>'+
  '</div></div></div>';
  $$('[data-qm]', app).forEach(function(b){ b.onclick = function(){ var c = S.cart[+b.dataset.qm]; if(c.qty>1) c.qty--; save(); render(); }; });
  $$('[data-qp]', app).forEach(function(b){ b.onclick = function(){ S.cart[+b.dataset.qp].qty++; save(); render(); }; });
  $$('[data-x]', app).forEach(function(b){ b.onclick = function(){ S.cart.splice(+b.dataset.x,1); save(); renderNav(); render(); }; });
  $('#checkout', app).onclick = function(){ go('/checkout'); };
}


function checkoutPage(){
  document.getElementById('footer').innerHTML = footerHTML();
  if(!S.cart.length){ go('/cart'); return; }
  var pay = Math.round(cartTotal()*0.9);
  app.innerHTML =
  '<div class="page-hero"><div class="wrap"><p class="crumb"><a data-route href="/cart">Your order</a> / Checkout</p>'+
  '<p class="eyebrow">Checkout</p><h1>Delivery &amp; confirmation.</h1></div></div>'+
  '<div class="sec" style="padding-top:0"><div class="wrap"><div class="cart-layout">'+
    '<div class="card"><h3 style="font-size:20px;margin-bottom:16px">Where should the specs reach?</h3>'+
      '<div class="form-grid">'+
        '<div class="field"><label>Parent name</label><input class="in" id="cn" placeholder="Ananya R"></div>'+
        '<div class="field"><label>Phone</label><input class="in" id="cp" placeholder="+91 98xxx xxxxx"></div>'+
        '<div class="field full"><label>Address</label><textarea class="in" id="ca" rows="2" placeholder="Flat, street, area"></textarea></div>'+
        '<div class="field"><label>City</label><input class="in" id="cc" placeholder="Bengaluru"></div>'+
        '<div class="field"><label>PIN</label><input class="in" id="cpin" placeholder="560038"></div>'+
        '<div class="field full"><label>Child this pair is for</label><select class="in" id="ck">'+
          S.kids.map(function(k){ return '<option value="'+esc(k.name)+'">'+esc(k.name)+' (age '+k.age+')</option>'; }).join('')+
        '</select></div>'+
      '</div>'+
      '<button class="btn amber wide" id="place">Place order · '+rupee(pay)+'</button>'+
      '<p style="font-size:12px;color:var(--muted);margin-top:10px">Pay on delivery or UPI — the automated lab pipeline starts the moment you place the order.</p>'+
    '</div>'+
    '<div class="summary"><h3>Review</h3>'+
      S.cart.map(function(c){
        var f = frameById(c.frameId), col = colorById(c.colorId), l = lensById(c.lensId);
        return '<div class="srow"><span>'+f.name+' · '+col.name+'<br><small>'+(l.name)+'</small></span><span>'+rupee((f.price+l.price)*c.qty)+'</span></div>';
      }).join('')+
      '<div class="srow"><span>Member discount</span><span style="color:var(--green)">− '+rupee(cartTotal()-pay)+'</span></div>'+
      '<div class="srow total"><span>To pay</span><span>'+rupee(pay)+'</span></div>'+
    '</div>'+
  '</div></div></div>';
  $('#place', app).onclick = function(){
    if(!$('#cn', app).value.trim() || !$('#ca', app).value.trim()){ toast('Name and address, please — the courier insists'); return; }
    var oid = 'SV-' + Math.floor(10000 + Math.random()*89999);
    S.orders.unshift({ id:oid, items: JSON.parse(JSON.stringify(S.cart)), placed: new Date().toISOString().slice(0,10),
      total: pay, stage: 1, child: $('#ck', app).value, address: $('#ca', app).value.trim() + ', ' + $('#cc', app).value.trim() });
    S.cart = []; save(); renderNav();
    orderPlaced(oid);
  };
}
function orderPlaced(oid){
  app.innerHTML = '<div class="page"><div class="wrap" style="max-width:600px;text-align:center;padding:60px 0">'+
    '<div style="font-size:54px;margin-bottom:8px">✅</div>'+
    '<h1 style="font-size:36px;margin:10px 0">Order placed.</h1>'+
    '<p style="color:var(--muted);margin:10px 0 6px">Order <b style="color:var(--ink)">'+oid+'</b> is confirmed.</p>'+
    '<p style="color:var(--muted);font-size:14px;margin-bottom:26px">Next: our AI asks you for one straight-facing photo of your child for millimetre fitting. Then the lab, then your door — in about 48 hours.</p>'+
    '<a class="btn solid" data-route href="/orders">Track this order</a>'+
  '</div></div>';
}


/* ---------- ORDERS ---------- */
function stageLabel(s){ return ['new','fitting','inlab','dispatched','delivered'][s]; }
function ordersPage(){
  document.getElementById('footer').innerHTML = footerHTML();
  var cards = S.orders.map(function(o){
    var items = o.items.map(function(c){
      var f = frameById(c.frameId);
      return f.name + ' · ' + colorById(c.colorId).name + (c.qty>1?' ×'+c.qty:'');
    }).join(' · ');
    return '<div class="order-card" data-order="'+o.id+'"><div class="top">'+
      '<div><h4>'+esc(o.id)+' <span class="pill '+stageLabel(o.stage)+'">'+ORDER_STAGES[o.stage]+'</span></h4>'+
      '<p class="oid">'+esc(items)+'</p>'+
      '<p class="oid">Placed '+esc(o.placed)+' · '+rupee(o.total)+' · for '+esc(o.child||'your child')+'</p></div>'+
      '<span style="font-family:var(--serif);font-size:20px">→</span></div></div>';
  }).join('');
  app.innerHTML =
  '<div class="page-hero"><div class="wrap"><p class="crumb"><a data-route href="/">Home</a> / Track order</p>'+
  '<p class="eyebrow">Order tracking</p><h1>Every order, watched like a child\u2019s vision.</h1></div></div>'+
  '<div class="sec" style="padding-top:0"><div class="wrap">'+
    (cards || '<div class="empty">No orders yet — your child\u2019s first pair is one try-on away.</div>')+
  '</div></div>';
  $$('.order-card', app).forEach(function(c){
    c.onclick = function(){
      var o = null;
      S.orders.forEach(function(x){ if(x.id === c.dataset.order) o = x; });
      orderDetail(o);
    };
  });
}
function orderDetail(o){
  app.innerHTML =
  '<div class="page"><div class="wrap">'+
    '<p class="crumb"><a data-route href="/orders">Track order</a> / '+o.id+'</p>'+
    '<h1 style="font-size:34px;margin-bottom:4px">Order '+o.id+'</h1>'+
    '<p style="color:var(--muted);margin-bottom:6px">Placed '+esc(o.placed)+' · total '+rupee(o.total)+' · for '+esc(o.child||'your child')+'</p>'+
    '<p style="color:var(--muted);font-size:14px">Shipping to: '+esc(o.address||'your registered address')+'</p>'+
    '<div class="tracker">'+
      ORDER_STAGES.map(function(s,i){
        var cls = i < o.stage ? 'done' : (i === o.stage ? 'done now' : '');
        return '<div class="t '+cls+'">'+s+'</div>';
      }).join('')+
    '</div>'+
    '<div class="rx-box">🤖 <b>AI fitting:</b> '+(o.stage>=1?'✓ PD 54 mm and fitting heights captured from your photo — lab specs locked.':'awaiting your child\u2019s photo.')+'</div>'+
    '<div class="grid2">'+
      o.items.map(function(c){
        var f = frameById(c.frameId), col = colorById(c.colorId), l = lensById(c.lensId);
        return '<div class="card"><div style="display:grid;place-items:center;background:var(--cream2);border-radius:12px;padding:16px 0;margin-bottom:12px">'+frameSvg(f, col.hex, 140)+'</div>'+
        '<h3 style="font-size:19px">'+f.name+' — '+col.name+'</h3>'+
        '<p style="font-size:13.5px;color:var(--muted)">'+l.name+' · Rx auto-attached · qty '+c.qty+'</p></div>';
      }).join('')+
    '</div>'+
    '<div style="margin-top:20px;display:flex;gap:12px;flex-wrap:wrap">'+
      '<a class="btn ghost sm" data-route href="/orders">← All orders</a>'+
      '<a class="btn ghost sm" data-route href="/frames">Buy another pair</a>'+
    '</div>'+
  '</div></div>';
}


/* ---------- APPOINTMENT ---------- */
var apptSel = { date:null, slot:null };
function apptPage(){
  document.getElementById('footer').innerHTML = footerHTML();
  apptSel = { date:null, slot:null };
  var days = [];
  var d = new Date();
  for(var i=1;i<=8;i++){
    var dd = new Date(d.getTime()+i*86400000);
    days.push(dd);
  }
  var SLOTS = ['09:00 AM','09:45 AM','10:30 AM','11:15 AM','12:00 PM','03:00 PM','03:45 PM','04:30 PM','05:15 PM'];
  var dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var mons = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  app.innerHTML =
  '<div class="page-hero"><div class="wrap"><p class="crumb"><a data-route href="/">Home</a> / Appointment</p>'+
  '<p class="eyebrow"><b>SKIDS</b> Vision Clinic</p>'+
  '<h1>Get the appointment. The rest follows.</h1>'+
  '<p>Full refraction with the pediatric optometrist, myopia-control discussion with the SKIDS pediatrician, amblyopia review if needed — one visit, one record.</p></div></div>'+
  '<div class="sec" style="padding-top:0"><div class="wrap"><div class="grid2" style="grid-template-columns:1.5fr 1fr;align-items:start">'+
    '<div class="card"><h3 style="font-size:20px;margin-bottom:16px">Pick a day</h3>'+
      '<div class="date-chips" id="dchips">'+
        days.map(function(dd,i){
          return '<div class="dchip" data-date="'+dd.toISOString().slice(0,10)+'"><b>'+dd.getDate()+'</b><span>'+dayNames[dd.getDay()]+'</span><small style="font-size:10px;color:var(--muted)">'+mons[dd.getMonth()]+'</small></div>';
        }).join('')+
      '</div>'+
      '<h3 style="font-size:20px;margin:24px 0 14px">Pick a time</h3>'+
      '<div class="slot-grid" id="slots">'+
        SLOTS.map(function(s,i){
          return '<div class="slot'+(i===3?' off':'')+'" data-slot="'+s+'">'+s+'</div>';
        }).join('')+
      '</div>'+
      '<h3 style="font-size:20px;margin:24px 0 14px">Who is coming?</h3>'+
      '<div class="form-grid">'+
        '<div class="field"><label>Child</label><select class="in" id="ak">'+
          S.kids.map(function(k){ return '<option value="'+esc(k.name)+'">'+esc(k.name)+' (age '+k.age+')</option>'; }).join('')+
        '</select></div>'+
        '<div class="field"><label>Reason</label><select class="in" id="ar">'+
          '<option>Post-screening vision exam</option><option>Myopia progression review</option>'+
          '<option>Amblyopia / squint follow-up</option><option>First ever vision check</option>'+
          '<option>Spectacle fitting &amp; dispensing</option></select></div>'+
      '</div>'+
      '<button class="btn solid wide" id="book" style="margin-top:8px">Confirm appointment</button>'+
    '</div>'+
    '<div><div class="card" style="margin-bottom:16px"><h3 style="font-size:18px;margin-bottom:8px">The Vision Clinic</h3>'+
      '<p style="font-size:13.5px;color:var(--muted)">SKIDS Health Technologies · 518, V V Arcade, 1st Main Rd, AECS Layout, Bengaluru 560037.<br><br>Mon–Sat · 9:00 AM – 6:00 PM<br>+91 73771 12777</p></div>'+
      '<div class="card"><h3 style="font-size:18px;margin-bottom:8px">Upcoming</h3>'+
      (S.appointments.map(function(a){
        return '<div class="appt-card" style="border-top:1px solid var(--line);padding:12px 0">'+
          '<div><b style="font-size:14px">'+esc(a.child)+' · '+esc(a.reason)+'</b>'+
          '<p style="font-size:12.5px;color:var(--muted)">'+esc(a.date)+' at '+esc(a.slot)+' · '+esc(a.clinic.split('·')[0])+'</p></div>'+
          '<span class="pill confirmed">'+esc(a.status)+'</span></div>';
      }).join('') || '<p style="font-size:13.5px;color:var(--muted)">Nothing booked yet.</p>')+
    '</div></div>'+
  '</div></div></div>';
  $$('.dchip', app).forEach(function(ch){
    ch.onclick = function(){
      $$('.dchip', app).forEach(function(x){ x.classList.remove('on'); });
      ch.classList.add('on'); apptSel.date = ch.dataset.date;
    };
  });
  $$('.slot', app).forEach(function(s){
    if(s.classList.contains('off')) return;
    s.onclick = function(){
      $$('.slot', app).forEach(function(x){ x.classList.remove('on'); });
      s.classList.add('on'); apptSel.slot = s.dataset.slot;
    };
  });
  $('#book', app).onclick = function(){
    if(!apptSel.date || !apptSel.slot){ toast('Pick a day and a time, please'); return; }
    S.appointments.unshift({ id:'a'+Date.now(), child:$('#ak', app).value, clinic:'SKIDS Vision Clinic · AECS Layout, Bengaluru',
      date:apptSel.date, slot:apptSel.slot, reason:$('#ar', app).value, status:'confirmed' });
    save();
    toast('Appointment confirmed — see you at the clinic. Details in your account.');
    go('/account');
  };
}


/* ---------- ACCOUNT ---------- */
var acctTab = 'overview';
function accountPage(){
  document.getElementById('footer').innerHTML = footerHTML();
  var tabs = [['overview','Overview'],['kids','My children'],['rx','Prescriptions'],['appts','Appointments'],['orders','Orders'],['member','Membership']];
  app.innerHTML =
  '<div class="page-hero"><div class="wrap"><p class="crumb"><a data-route href="/">Home</a> / Account</p>'+
  '<p class="eyebrow">mySKIDS family account</p><h1>One child. One record. One place.</h1></div></div>'+
  '<div class="sec" style="padding-top:0"><div class="wrap"><div class="acct-layout">'+
    '<div class="acct-nav">'+ tabs.map(function(t){ return '<a class="'+(acctTab===t[0]?'on':'')+'" data-tab="'+t[0]+'">'+t[1]+'</a>'; }).join('') +'</div>'+
    '<div id="acctBody"></div>'+
  '</div></div></div>';
  $$('.acct-nav a', app).forEach(function(a){
    a.onclick = function(){ acctTab = a.dataset.tab; accountPage(); };
  });
  renderAcctBody();
}
function renderAcctBody(){
  var b = $('#acctBody', app);
  if(acctTab === 'overview'){
    b.innerHTML =
    '<div class="mem-card" style="margin-bottom:18px"><h3>Sharma family</h3><span class="lvl">SKIDS Vision · lifetime member family</span>'+
    '<ul><li>2 children on the pathway · last screening 14 Mar 2026 (school camp)</li>'+
    '<li>1 active order · 1 upcoming appointment · 1 prescription on file</li>'+
    '<li>Member pricing active on every pair of frames</li></ul>'+
    '<a class="btn amber sm" href="https://skids.clinic/plans">Manage membership</a></div>'+
    '<div class="grid2"><div class="card appt-card"><div><h3 style="font-size:17px">Next appointment</h3>'+
    '<p style="font-size:13.5px;color:var(--muted)">'+esc(S.appointments[0].child)+' · '+esc(S.appointments[0].date)+' · '+esc(S.appointments[0].slot)+'</p></div>'+
    '<a class="btn ghost sm" data-route href="/appointment">View / book</a></div>'+
    '<div class="card appt-card"><div><h3 style="font-size:17px">Latest order</h3>'+
    '<p style="font-size:13.5px;color:var(--muted)">'+esc(S.orders[0].id)+' · '+ORDER_STAGES[S.orders[0].stage]+'</p></div>'+
    '<a class="btn ghost sm" data-route href="/orders">Track</a></div></div>';
  } else if(acctTab === 'kids'){
    b.innerHTML = S.kids.map(function(k){
      return '<div class="kid-card"><div class="ka">'+esc(k.name[0])+'</div><div><h4>'+esc(k.name)+' · age '+k.age+'</h4>'+
      '<p class="meta">Last screening: '+esc(k.lastScreening)+'</p>'+
      '<p class="meta" style="color:var(--green);font-weight:600">'+esc(k.status)+'</p></div>'+
      '<a class="btn ghost sm" data-route href="/appointment" style="margin-left:auto">Book review</a></div>';
    }).join('') +
    '<div class="card" style="border-style:dashed;text-align:center;cursor:pointer" id="addKid"><h3 style="font-size:17px">+ Add a child</h3>'+
    '<p style="font-size:13px;color:var(--muted)">Every child you add joins the same lifetime pathway.</p></div>';
    $('#addKid', b).onclick = function(){
      var n = prompt('Child\u2019s name?'); if(!n) return;
      var a = prompt('Age?'); if(!a) return;
      S.kids.push({id:'k'+Date.now(), name:n, age:+a||0, lastScreening:'—', status:'Awaiting first screening — book the clinic'});
      save(); accountPage();
    };
  } else if(acctTab === 'rx'){
    var p = S.prescription;
    b.innerHTML = '<div class="card"><h3 style="font-size:19px;margin-bottom:6px">Latest prescription — Aarav</h3>'+
    '<p style="font-size:13px;color:var(--muted);margin-bottom:14px">From the SKIDS clinic record · OD −1.25 / −0.50 × 180 · OS −1.00 · PD 54 mm</p>'+
    (p?('<table class="rx-table"><tr><th></th><th>Sphere</th><th>Cylinder</th><th>Axis</th></tr>'+
      '<tr><td><b>OD (right)</b></td><td>'+esc(p.odS||'—')+'</td><td>'+esc(p.odC||'—')+'</td><td>'+esc(p.odA||'—')+'</td></tr>'+
      '<tr><td><b>OS (left)</b></td><td>'+esc(p.osS||'—')+'</td><td>'+esc(p.osC||'—')+'</td><td>'+esc(p.osA||'—')+'</td></tr></table>')
      :'<p style="font-size:14px;color:var(--muted)">No manually entered prescription yet — clinic records attach automatically to your orders.</p>')+
    '<a class="btn solid sm" data-route href="/prescription" style="margin-top:16px">Enter / upload prescription</a></div>';
  } else if(acctTab === 'appts'){
    b.innerHTML = S.appointments.map(function(a){
      return '<div class="order-card"><div class="top"><div><h4>'+esc(a.child)+' — '+esc(a.reason)+'</h4>'+
      '<p class="oid">'+esc(a.date)+' at '+esc(a.slot)+' · '+esc(a.clinic)+'</p></div>'+
      '<span class="pill confirmed">'+esc(a.status)+'</span></div></div>';
    }).join('') || '<div class="empty">No appointments yet.</div>';
  } else if(acctTab === 'orders'){
    b.innerHTML = S.orders.map(function(o){
      return '<div class="order-card"><div class="top"><div><h4>'+esc(o.id)+' <span class="pill '+stageLabel(o.stage)+'">'+ORDER_STAGES[o.stage]+'</span></h4>'+
      '<p class="oid">'+esc(o.items.map(function(c){return frameById(c.frameId).name;}).join(', '))+' · '+rupee(o.total)+'</p></div>'+
      '<a class="btn ghost sm" data-route href="/orders">Track</a></div></div>';
    }).join('') || '<div class="empty">No orders yet.</div>';
  } else {
    b.innerHTML = '<div class="mem-card"><h3>Lifetime membership</h3><span class="lvl">Active · since 2026</span><ul>'+
    '<li>Annual vision screening — school, clinic, soon at home</li>'+
    '<li>Dioptre-by-dioptre progression tracking in the mySKIDS record</li>'+
    '<li>Myopia-control reviews and outdoor-time prescriptions</li>'+
    '<li>Pediatrician + ophthalmologist care, escalated with context</li>'+
    '<li>10% member pricing on every pair of spectacles</li>'+
    '<li>Free delivery, free lifetime fitting adjustments at the clinic</li></ul>'+
    '<a class="btn amber" href="https://skids.clinic/plans">Manage plan</a></div>';
  }
}

/* ---------- BOOT ---------- */
render();
})();

