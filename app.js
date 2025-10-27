
/* ====== State ====== */
const modeMeta = {
  casual:{label:'一般用餐',desc:'近距離、價位優先、評價門檻 3.5★'},
  treat:{label:'小確幸',desc:'中距離、評價 4.0★ 以上、評論數適中'},
  important:{label:'重要用餐',desc:'可接受較遠、評價 4.5★、環境佳'},
  late:{label:'點心宵夜',desc:'依營業時間篩選、甜飲/炸物/宵夜'}
};
let currentMode = 'casual';
let currentPeople = '1';
let lastPicked = null;

const $ = (sel)=>document.querySelector(sel);
const $$ = (sel)=>document.querySelectorAll(sel);
const modeLabel = $('#modeLabel');
const modeDesc  = $('#modeDesc');

/* ====== Helpers ====== */
function resetUI(){
  $$('.sheet').forEach(s=>s.classList.remove('open'));
  $$('.overlay').forEach(o=>o.classList.remove('show'));
  $('#scanBox').style.display='grid';
  $('#resultBox').style.display='none';
}
function openSheet(id){ document.getElementById(id).classList.add('open'); }
function closeSheet(id){ document.getElementById(id).classList.remove('open'); }
function openOverlay(id){ document.getElementById(id).classList.add('show'); }
function closeOverlay(id){ document.getElementById(id).classList.remove('show'); }
function vibrate(ms){ if(navigator.vibrate) navigator.vibrate(ms); }

/* ====== Backdrop & Close Helpers ====== */
const sheetBackdrop = document.getElementById('sheetBackdrop');
function closeAllMenus(){ const m = document.getElementById('menu'); if(m) m.classList.remove('open'); }
function anySheetOpen(){ return Array.from(document.querySelectorAll('.sheet')).some(s=>s.classList.contains('open')); }
function showBackdrop(){ if(sheetBackdrop) sheetBackdrop.classList.add('show'); }
function hideBackdrop(){ if(sheetBackdrop) sheetBackdrop.classList.remove('show'); }

// Override openSheet/closeSheet to manage backdrop
const _openSheet = openSheet; const _closeSheet = closeSheet;
openSheet = function(id){ closeAllMenus(); _openSheet(id); showBackdrop(); };
closeSheet = function(id){ _closeSheet(id); if(!anySheetOpen()) hideBackdrop(); };

// Clicking on backdrop closes the topmost open sheet
sheetBackdrop && sheetBackdrop.addEventListener('click', ()=>{
  const opens = Array.from(document.querySelectorAll('.sheet.open'));
  if(opens.length){ opens[opens.length-1].classList.remove('open'); }
  if(!anySheetOpen()) hideBackdrop();
});

// ESC to close sheets or overlays or avatar menu
document.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape'){
    // Close sheets
    const opens = Array.from(document.querySelectorAll('.sheet.open'));
    if(opens.length){ opens[opens.length-1].classList.remove('open'); hideBackdrop(); return; }
    // Close overlays
    const ovs = Array.from(document.querySelectorAll('.overlay.show'));
    if(ovs.length){ ovs[ovs.length-1].classList.remove('show'); return; }
    // Close avatar menu
    closeAllMenus();
  }
});



/* ====== Topbar ====== */
$('#brandHome').addEventListener('click', resetUI);
const avatar = $('#avatar');
const menu = $('#menu');
avatar.addEventListener('click', (e)=>{ e.stopPropagation(); menu.classList.toggle('open'); });
document.addEventListener('click', ()=>menu.classList.remove('open'));
menu.querySelectorAll('.item').forEach(it=>{
  it.addEventListener('click', (e)=>{
    e.stopPropagation(); menu.classList.remove('open');
    const type = it.dataset.panel;
    if(type==='plan') closeAllMenus(); openOverlay('overlayPlan');
    if(type==='search') openSheet('sheetSearch');
    if(type==='basic') openSheet('sheetBasic');
  });
});

/* ====== Pills ====== */
$$('.pill').forEach(p=>{
  p.addEventListener('click', ()=>{
    $$('.pill').forEach(x=>x.classList.remove('active'));
    p.classList.add('active');
    currentMode = p.dataset.mode;
    modeLabel.textContent = modeMeta[currentMode].label;
    modeDesc.textContent  = modeMeta[currentMode].desc;
    $('.radar').animate([{transform:'scale(1)'},{transform:'scale(1.03)'},{transform:'scale(1)'}],{duration:220,easing:'ease-out'});
  });
});

/* ====== Radar ====== */
$('#radarBtn').addEventListener('click', ()=>{
  vibrate(30);
  alert('（Demo）直接啟動雷達掃描。建議使用下方「快速鎖定」獲得完整流程。');
});

/* ====== Dock ====== */
$('#historyBtn').addEventListener('click', () => {
  closeAllMenus();
  openOverlay('overlayHistory');
});

$('#favBtn').addEventListener('click', () => {
  closeAllMenus();
  openOverlay('overlayFav');
});

$('#planBtnDock').addEventListener('click', () => {
  closeAllMenus();
  openOverlay('overlayPlan');
});

// 建議這行也一併收起選單
$('#settingsBtn').addEventListener('click', () => {
  closeAllMenus();
  openSheet('sheetSearch');
});


/* ====== Quick Lock ====== */
$('#quickBtn').addEventListener('click', ()=>{
  resetUI();
  $$('#modeGrid .opt').forEach(o=>o.classList.toggle('active', o.dataset.mode===currentMode));
  $$('#peopleGrid .opt').forEach(o=>o.classList.remove('active'));
  const def = document.querySelector('#peopleGrid .opt[data-pp="'+currentPeople+'"]');
  if(def) def.classList.add('active');
  openSheet('sheetMode');
});
$$('#modeGrid .opt').forEach(o=>{
  o.addEventListener('click', ()=>{
    $$('#modeGrid .opt').forEach(x=>x.classList.remove('active'));
    o.classList.add('active'); currentMode = o.dataset.mode;
  });
});
$$('#peopleGrid .opt').forEach(o=>{
  o.addEventListener('click', ()=>{
    $$('#peopleGrid .opt').forEach(x=>x.classList.remove('active'));
    o.classList.add('active'); currentPeople = o.dataset.pp;
  });
});
$('#cancel1').addEventListener('click', ()=>closeSheet('sheetMode'));

const overlay = $('#overlay');
const scanBox = $('#scanBox');
const resultBox = $('#resultBox');
$('#startScan').addEventListener('click', ()=>{
  closeSheet('sheetMode');
  closeAllMenus(); openOverlay('overlay');
  scanBox.style.display='grid'; resultBox.style.display='none';
  setTimeout(()=>{
    scanBox.style.display='none';
    resultBox.style.display='block';
    modeLabel.textContent = modeMeta[currentMode].label;
    modeDesc.textContent  = modeMeta[currentMode].desc + ' · 人數：' + currentPeople;
    $('#peopleBadge').textContent = '人數：' + currentPeople;
  }, 900);
});

/* ====== Results actions ====== */
$$('#resultBox .rest').forEach(card=>{
  card.addEventListener('click', (e)=>{
    const act = e.target?.dataset?.act;
    const name = card.dataset.name;
    if(!act) return;
    if(act==='detail'){
      lastPicked = name;
      $('#detailTitle').textContent = name;
      $('#detailMeta').textContent = '⭐ 4.6（1,238）· 類型 / $$ · 650 公尺';
      $('#detailMenu').textContent = '熱門：招牌一、招牌二、招牌三';
      openSheet('sheetDetail');
    }
    if(act==='map'){ confirmNav(name,'map'); }
    if(act==='nav'){ confirmNav(name,'nav'); }
  });
});

/* ====== Detail actions ====== */
$('#closeDetail').addEventListener('click', ()=>closeSheet('sheetDetail'));
$('#detailMap').addEventListener('click', ()=>confirmNav(lastPicked || '餐廳','map'));
$('#detailNav').addEventListener('click', ()=>confirmNav(lastPicked || '餐廳','nav'));

/* ====== Overlays close buttons ====== */
$('#closeHist').addEventListener('click', ()=>closeOverlay('overlayHistory'));
$('#closeFav').addEventListener('click', ()=>closeOverlay('overlayFav'));
$('#clearHistory').addEventListener('click', ()=>alert('（Demo）記錄已清除'));
$('#favToMap').addEventListener('click', ()=>confirmNav('初晴咖啡','map'));
$('#favToNav').addEventListener('click', ()=>confirmNav('初晴咖啡','nav'));

/* ====== Enhanced Settings: per-mode preferences + globals ====== */
const DEFAULT_PREFS = {
  casual:    { cats:['小吃店','便當店','快炒店'], price:['$','$$'], rating:'3.5', dist:2.0, ac:true, seat:true, wait:'10', noise:'中', openNow:true },
  treat:     { cats:['日式','韓式','義式','早午餐'], price:['$$','$$$'], rating:'4.0', dist:3.0, ac:true, seat:true, wait:'20', noise:'低', openNow:true },
  important: { cats:['精緻餐廳','牛排館','無菜單'], price:['$$$','$$$$'], rating:'4.5', dist:6.0, ac:true, seat:true, wait:'30', noise:'低', openNow:true, reserve:true },
  late:      { cats:['宵夜','炸物','甜點','手搖飲'], price:['$','$$'], rating:'3.5', dist:2.5, ac:false, seat:false, wait:'10', noise:'中', openNow:true }
};
let PREFS = JSON.parse(localStorage.getItem('FR_PREFS') || 'null') || DEFAULT_PREFS;
const CATEGORIES_POOL = ['小吃店','便當店','快炒店','牛肉麵','火鍋','日式','韓式','泰式','義式','美式','越式',
  '早午餐','咖啡','甜點','宵夜','炸物','手搖飲','素食','精緻餐廳','牛排館','無菜單'];
function catChip(cat, active){ return `<div class="pill2 ${active?'active':''}" data-cat="${cat}">${cat}</div>`; }
function priceChip(p, active){ return `<div class="pill2 ${active?'active':''}" data-price="${p}">${p}</div>`; }
function renderModePref(mode){
  const pf = PREFS[mode] || DEFAULT_PREFS[mode];
  const catsHTML = CATEGORIES_POOL.map(c=>catChip(c, pf.cats.includes(c))).join('');
  const prices = ['$','$$','$$$','$$$$'].map(p=>priceChip(p, pf.price.includes(p))).join('');
  const acOn = pf.ac ? 'on':''; const seatOn = pf.seat ? 'on':'';
  const openChecked = pf.openNow ? 'checked':''; const reserveChecked = pf.reserve ? 'checked':'';
  $('#modePrefBox').innerHTML = `
    <div class="ctrl"><label>餐廳類別</label><div class="row" id="catRow">${catsHTML}</div></div>
    <div class="ctrl"><label>價位</label><div class="row" id="priceRow">${prices}</div></div>
    <div class="ctrl"><label>評價門檻 <span class="badge" id="ratingBadge">${pf.rating}★</span></label>
      <input type="range" min="3.0" max="5.0" step="0.1" value="${pf.rating}" id="ratingRange" class="range"/>
    </div>
    <div class="ctrl"><label>距離（公里） <span class="badge" id="distBadge2">${pf.dist}</span></label>
      <input type="range" min="0.5" max="10" step="0.5" value="${pf.dist}" id="distRange2" class="range"/>
    </div>
    <div class="ctrl"><label>有無冷氣</label><div id="acSwitch" class="switch ${acOn}"></div></div>
    <div class="ctrl"><label>可內用座位</label><div id="seatSwitch" class="switch ${seatOn}"></div></div>
    <div class="ctrl"><label>等候容忍（分鐘） <span class="badge2" id="waitBadge">${pf.wait}</span></label>
      <div class="rangeRow"><input type="range" min="0" max="60" step="5" value="${pf.wait}" id="waitRange" class="range"/></div>
    </div>
    <div class="ctrl"><label>噪音容忍</label>
      <div class="row" id="noiseRow">
        <div class="pill2 ${pf.noise==='低'?'active':''}" data-noise="低">低</div>
        <div class="pill2 ${pf.noise==='中'?'active':''}" data-noise="中">中</div>
        <div class="pill2 ${pf.noise==='高'?'active':''}" data-noise="高">高</div>
      </div>
    </div>
    <div class="ctrl">
      <label>即時條件</label>
      <div class="checkchips">
        <label class="cc"><input type="checkbox" id="openNow" ${openChecked}> 僅顯示「營業中」</label>
        <label class="cc"><input type="checkbox" id="needReserve" ${reserveChecked}> 可接受「需訂位」</label>
      </div>
    </div>
  `;
  $('#ratingRange').addEventListener('input', e=>$('#ratingBadge').textContent = e.target.value + '★');
  $('#distRange2').addEventListener('input', e=>$('#distBadge2').textContent = (+e.target.value).toFixed(1));
  $('#waitRange').addEventListener('input', e=>$('#waitBadge').textContent = e.target.value);
  function toggleSwitch(id){ const el = document.getElementById(id); el.addEventListener('click', ()=>el.classList.toggle('on')); }
  toggleSwitch('acSwitch'); toggleSwitch('seatSwitch');
  $$('#catRow .pill2').forEach(el=>el.addEventListener('click', ()=>el.classList.toggle('active')));
  $$('#priceRow .pill2').forEach(el=>el.addEventListener('click', ()=>el.classList.toggle('active')));
  $$('#noiseRow .pill2').forEach(el=>el.addEventListener('click', ()=>{ $$('#noiseRow .pill2').forEach(x=>x.classList.remove('active')); el.classList.add('active'); }));
}
function currentModeFromTabs(){ const el = document.querySelector('#modeTabs .tab.active'); return el ? el.dataset.mode : 'casual'; }
document.addEventListener('DOMContentLoaded', ()=>{ renderModePref('casual'); });
document.addEventListener('click', (e)=>{
  const tab = e.target.closest('#modeTabs .tab'); if(!tab) return;
  $$('#modeTabs .tab').forEach(x=>x.classList.remove('active')); tab.classList.add('active'); renderModePref(tab.dataset.mode);
});
document.getElementById('closeSearch').addEventListener('click', ()=>closeSheet('sheetSearch'));
document.getElementById('saveSearch').addEventListener('click', (evt)=>{
  evt.stopPropagation();
  const mode = currentModeFromTabs();
  const cats  = Array.from(document.querySelectorAll('#catRow .pill2.active')).map(x=>x.dataset.cat);
  const price = Array.from(document.querySelectorAll('#priceRow .pill2.active')).map(x=>x.dataset.price);
  const rating= document.getElementById('ratingRange').value;
  const dist  = parseFloat(document.getElementById('distRange2').value);
  const ac    = document.getElementById('acSwitch').classList.contains('on');
  const seat  = document.getElementById('seatSwitch').classList.contains('on');
  const wait  = document.getElementById('waitRange').value;
  const noise = (document.querySelector('#noiseRow .pill2.active')?.dataset.noise) || '中';
  const openNow = document.getElementById('openNow').checked;
  const reserve = document.getElementById('needReserve').checked;
  const PREFS = JSON.parse(localStorage.getItem('FR_PREFS') || 'null') || DEFAULT_PREFS;
  PREFS[mode] = { cats, price, rating, dist, ac, seat, wait, noise, openNow, reserve };
  const diet = Array.from(document.querySelectorAll('#dietRow .pill2.active')).map(x=>x.dataset.diet);
  const allergy = Array.from(document.querySelectorAll('#allergyRow .pill2.active')).map(x=>x.dataset.allergy);
  const globals = {
    takeout: !!document.querySelector('[data-global="takeout"]')?.checked,
    delivery: !!document.querySelector('[data-global="delivery"]')?.checked,
    parking: !!document.querySelector('[data-global="parking"]')?.checked,
    wheelchair: !!document.querySelector('[data-global="wheelchair"]')?.checked,
    kid: !!document.querySelector('[data-global="kid"]')?.checked,
    pet: !!document.querySelector('[data-global="pet"]')?.checked,
    diet, allergy
  };
  localStorage.setItem('FR_PREFS', JSON.stringify(PREFS));
  localStorage.setItem('FR_GLOBALS', JSON.stringify(globals));
  alert('（Demo）偏好已儲存');
  closeSheet('sheetSearch');
});
/* Bind toggle behavior for diet/allergy pills */
document.addEventListener('click', (e)=>{
  const pill = e.target.closest('#dietRow .pill2, #allergyRow .pill2');
  if(pill){ pill.classList.toggle('active'); }
});

/* ====== Basic Settings ====== */
function bindSwitch(id){ const el = document.getElementById(id); el.addEventListener('click', ()=>el.classList.toggle('on')); }
bindSwitch('voiceSwitch'); bindSwitch('hotwordSwitch');
document.getElementById('closeBasic').addEventListener('click', ()=>closeSheet('sheetBasic'));
document.getElementById('saveBasic').addEventListener('click', ()=>{ alert('（Demo）已儲存基本設定'); closeSheet('sheetBasic'); });

/* ====== Nav confirm ====== */
window.confirmNav = function(name, action){
  const msg = `導航至「${name}」嗎？\n選擇：\n【確定】${action==='nav'?'開始導航':'地圖顯示'}；【取消】返回`;
  if(confirm(msg)){
    alert(action==='nav'?'（Demo）已呼叫 Google Maps 導航。':'（Demo）開啟地圖顯示。');
    // 真實實作：window.location.href = 'https://www.google.com/maps/dir/?api=1&destination=...'
  }
};
