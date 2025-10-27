
/* ====== State ====== */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.sheet').forEach(s => s.classList.remove('open'));
  document.getElementById('sheetBackdrop')?.classList.remove('show');
});

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
function showBackdrop(){ sheetBackdrop?.classList.add('show'); }
function hideBackdrop(){ sheetBackdrop?.classList.remove('show'); }
function closeAllMenus(){ const m = document.getElementById('menu'); if(m) m.classList.remove('open'); }
function anySheetOpen(){ return Array.from(document.querySelectorAll('.sheet')).some(s=>s.classList.contains('open')); }

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
    e.stopPropagation();
    menu.classList.remove('open');
    const type = it.dataset.panel;

    if (type === 'plan') {
      closeAllMenus();
      openOverlay('overlayPlan');
    } else if (type === 'search') {
      closeAllMenus();
      openSheet('sheetSearch');
    } else if (type === 'basic') {
      closeAllMenus();
      openSheet('sheetBasic');
    }
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
$('#historyBtn').addEventListener('click', () => { closeAllMenus(); openOverlay('overlayHistory'); });
$('#favBtn').addEventListener('click', () => { closeAllMenus(); openOverlay('overlayFav'); });
$('#planBtnDock').addEventListener('click', () => { closeAllMenus(); openOverlay('overlayPlan'); });
$('#settingsBtn').addEventListener('click', () => { closeAllMenus(); openSheet('sheetSearch'); });
$('#closeSearch').addEventListener('click', () => closeSheet('sheetSearch'));
$('#saveSearch').addEventListener('click', () => { /* 儲存流程 */ closeSheet('sheetSearch'); });
// 立即找餐廳：依選項觸發
$('#quickSearchSelect')?.addEventListener('change', (e)=>{
  const v = e.target.value;
  if(v==='fast') { $('#quickBtn').click(); }                  // 快速鎖定流程
  if(v==='near_hot') { TODAY.active=true; TODAY.rating='4.0'; $('#startScan').click(); }
  if(v==='open_now') { localStorage.setItem('_once_open_now','1'); $('#startScan').click(); }
  if(v==='takeout')  { localStorage.setItem('_once_takeout','1'); $('#startScan').click(); }
  if(v==='random')   { alert('（Demo）隨機為你挑一間！'); $('#startScan').click(); }
  setTimeout(()=> e.target.value='fast', 600);
});
// 漏斗按鈕：展開「今天想吃」的第一個（價格）小面板
$('#quickFilterBtn')?.addEventListener('click', ()=>{ if(!DRIVE_MODE) openQPanel('price'); });

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
    const __pf = effectivePrefs();
    const __km = (__pf.distHM ? (__pf.distHM/10).toFixed(1) : '—');
    const __price = (__pf.priceAmt!=null ? ` · 預算≤${__pf.priceAmt}` : '');
    modeDesc.textContent = modeMeta[currentMode].desc + ` · 人數：${currentPeople} · 距離≤${__km}km` + __price;

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
/* ====== One-time filters (今天想吃) ====== */
const TODAY = {active:false}; // 例如 {priceCap:500, priceAmt:320, distHM:12, cats:['拉麵'], rating:'4.0'}

function getQueryParams(){
  const q = {}; const s = location.search.slice(1).split('&').filter(Boolean);
  for(const kv of s){ const [k,v] = kv.split('='); q[decodeURIComponent(k)] = decodeURIComponent(v||''); }
  return q;
}
const URLQ = getQueryParams();
const DRIVE_MODE = (URLQ.mode === 'drive'); // ?mode=drive -> 移動中模式（隱藏今天想吃）

document.addEventListener('DOMContentLoaded', ()=>{
  const box = document.getElementById('qbarBox');
  if(!box) return;
  box.style.display = DRIVE_MODE ? 'none' : 'flex';
});
// ===== Splash & Onboarding & Subscription gate =====
(function(){
  const SPL = $('#overlaySplash');
  const OB  = $('#overlayOnboard');
  const SUB = $('#overlaySub');

  const SEEN = localStorage.getItem('OB_SEEN') === '1';
  const DONT = localStorage.getItem('OB_DONT') === '1';
  const TRIAL = localStorage.getItem('TRIAL_START'); // ISO string
  const NOW = Date.now();

  // Splash 1.2s
  setTimeout(()=>{ SPL?.classList.remove('show'); proceed(); }, 1200);

  function proceed(){
    // Onboarding：若勾了不要再顯示則跳過
    if(!SEEN && !DONT){ OB?.classList.add('show'); initOnboard(); }
    else { checkSub(); }
  }
  function initOnboard(){
    let i=0; const N=3;
    const show=(k)=>{ for(let j=0;j<N;j++){ $('.ob[data-i="'+j+'"]').style.display=(j===k)?'block':'none'; $('#dot'+j).style.opacity=(j===k)?'1':'.3'; } };
    show(0);
    $('#obNext').onclick=()=>{ i++; if(i>=N){ localStorage.setItem('OB_SEEN','1'); OB.classList.remove('show'); checkSub(); } else show(i); };
    $('#obSkip').onclick=()=>{ localStorage.setItem('OB_SEEN','1'); OB.classList.remove('show'); checkSub(); };
    $('#obDont').onchange=(e)=>{ localStorage.setItem('OB_DONT', e.target.checked ? '1':'0'); };
    // 簡單左右滑
    let sx=0; $('#obSlides').addEventListener('touchstart',e=>sx=e.touches[0].clientX,{passive:true});
    $('#obSlides').addEventListener('touchend',e=>{ const dx=e.changedTouches[0].clientX-sx; if(Math.abs(dx)>40){ i = Math.min(2, Math.max(0, i + (dx<0?1:-1))); show(i); } },{passive:true});
  }
  function checkSub(){
    // 試用中？超過14小時？
    if(TRIAL){
      const elapsedH = (NOW - Date.parse(TRIAL))/36e5;
      if(elapsedH > 14){ SUB.classList.add('show'); lockSub(); return; }
      // 試用尚未超過14小時 → 直接進主畫面
      return;
    }
    // 未開始試用 → 首次顯示訂閱頁
    SUB.classList.add('show'); wireSub();
  }
  function lockSub(){
    // 超過14小時 → 留在訂閱頁，只能訂閱
    $('#subClose').onclick = ()=>alert('試用已超過 14 小時，請選擇訂閱方案繼續使用。');
    wireSub(true);
  }
  function wireSub(locked=false){
    $('#subTrial').onclick=()=>{
      if(locked){ alert('試用已到期'); return; }
      localStorage.setItem('TRIAL_START', new Date().toISOString());
      $('#overlaySub').classList.remove('show');
      // 初次可導到設定（可略過）
      setTimeout(()=>{ openSheet('sheetSearch'); }, 200);
    };
    document.querySelectorAll('.subPay').forEach(b=>b.addEventListener('click', ()=>{
      alert('（Demo）前往付款：' + b.dataset.plan);
      localStorage.setItem('SUB_ACTIVE','1');
      $('#overlaySub').classList.remove('show');
    }));
    if(!locked) $('#subClose').onclick = ()=>{ $('#overlaySub').classList.remove('show'); };
  }
})();

// 種類 chips（與 CATEGORIES_POOL 共用）
function renderQuickCats(){
  const pool = CATEGORIES_POOL.slice(0, 14); // 精簡一些，避免太擠
  const row = document.getElementById('qCatRow');
  if(!row) return;
  row.innerHTML = pool.map(c=>`<div class="pill2 ${TODAY.cats?.includes(c)?'active':''}" data-qcat="${c}">${c}</div>`).join('');
  row.querySelectorAll('.pill2').forEach(el=>el.addEventListener('click', ()=>el.classList.toggle('active')));
}

// 開/關 小面板
function openQPanel(key){
  document.querySelectorAll('.qbtn').forEach(b=>b.classList.toggle('active', b.dataset.q===key));
  document.querySelectorAll('.qpanel').forEach(p=>p.classList.remove('show'));
  const p = document.getElementById(`qp-${key}`); if(p) p.classList.add('show');
  if(key==='cats') renderQuickCats();
}
function closeQPanels(){
  document.querySelectorAll('.qbtn').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.qpanel').forEach(p=>p.classList.remove('show'));
}

// 點按鈕展開；點畫面其它處收合
document.addEventListener('click', (e)=>{
  const btn = e.target.closest('.qbtn');
  if(btn){ openQPanel(btn.dataset.q); e.stopPropagation(); return; }
  if(!e.target.closest('.qpanel')) closeQPanels();
});

// 價格 quick
(function(){
  const capSel = document.getElementById('qPriceCap');
  const range  = document.getElementById('qPriceRange');
  const prev   = document.getElementById('qPricePreview');
  if(!capSel) return;
  const syncCap = ()=>{ const cap = parseInt(capSel.value,10)||500; range.max = cap; if(+range.value>cap) range.value=cap; prev.textContent=range.value; };
  capSel.addEventListener('change', syncCap); syncCap();
  range.addEventListener('input', e=> prev.textContent = e.target.value);
  document.getElementById('qPriceApply').addEventListener('click', ()=>{
    TODAY.priceCap = parseInt(capSel.value,10);
    TODAY.priceAmt = parseInt(range.value,10);
    TODAY.active = true;
    document.getElementById('qb-price').textContent = `≤ ${TODAY.priceAmt}`;
    closeQPanels();
  });
  document.getElementById('qPriceClear').addEventListener('click', ()=>{
    delete TODAY.priceCap; delete TODAY.priceAmt;
    document.getElementById('qb-price').textContent = '';
    closeQPanels();
  });
})();

// 距離 quick
(function(){
  const range  = document.getElementById('qDistRange');
  const prev   = document.getElementById('qDistPreview');
  if(!range) return;
  range.addEventListener('input', e=> prev.textContent = e.target.value);
  document.getElementById('qDistApply').addEventListener('click', ()=>{
    TODAY.distHM = parseInt(range.value,10);
    TODAY.active = true;
    document.getElementById('qb-dist').textContent = `≤ ${TODAY.distHM}`;
    closeQPanels();
  });
  document.getElementById('qDistClear').addEventListener('click', ()=>{
    delete TODAY.distHM;
    document.getElementById('qb-dist').textContent = '';
    closeQPanels();
  });
})();

// 種類 quick
(function(){
  const apply = ()=>{
    const cats = Array.from(document.querySelectorAll('#qCatRow .pill2.active')).map(x=>x.dataset.qcat);
    if(cats.length){ TODAY.cats = cats; TODAY.active = true; document.getElementById('qb-cats').textContent = cats.length===1?cats[0]:`${cats.length}項`; }
    else { delete TODAY.cats; document.getElementById('qb-cats').textContent = ''; }
    closeQPanels();
  };
  const clear = ()=>{ document.querySelectorAll('#qCatRow .pill2.active').forEach(x=>x.classList.remove('active')); delete TODAY.cats; document.getElementById('qb-cats').textContent = ''; closeQPanels(); };
  document.getElementById('qCatsApply')?.addEventListener('click', apply);
  document.getElementById('qCatsClear')?.addEventListener('click', clear);
})();

// 評價 quick
(function(){
  const range  = document.getElementById('qRatingRange');
  const prev   = document.getElementById('qRatingPreview');
  if(!range) return;
  range.addEventListener('input', e=> prev.textContent = e.target.value + '★');
  document.getElementById('qRatingApply').addEventListener('click', ()=>{
    TODAY.rating = range.value;
    TODAY.active = true;
    document.getElementById('qb-rating').textContent = `≥ ${TODAY.rating}★`;
    closeQPanels();
  });
  document.getElementById('qRatingClear').addEventListener('click', ()=>{
    delete TODAY.rating;
    document.getElementById('qb-rating').textContent = '';
    closeQPanels();
  });
})();

// 合併「模式偏好」＋「今天想吃」成一次查詢用 payload（Demo）
function effectivePrefs(){
  const base = JSON.parse(localStorage.getItem('FR_PREFS') || 'null') || DEFAULT_PREFS;
  const pf = {...(base[currentMode] || DEFAULT_PREFS[currentMode])};
  if(TODAY.priceCap!=null) pf.priceCap = TODAY.priceCap;
  if(TODAY.priceAmt!=null) pf.priceAmt = TODAY.priceAmt;
  if(TODAY.distHM!=null)   pf.distHM   = TODAY.distHM;
  if(TODAY.cats)           pf.cats     = TODAY.cats;
  if(TODAY.rating!=null)   pf.rating   = TODAY.rating;
  return pf;
}

/* ====== Enhanced Settings: per-mode preferences + globals ====== */
const DEFAULT_PREFS = {
  casual:    { cats:['小吃店','便當店','快炒店'], priceCap:500,  priceAmt:200, distHM:10, ac:true,  seat:true,  wait:'10', noise:'中', openNow:true },
  treat:     { cats:['日式','韓式','義式','早午餐'], priceCap:1000, priceAmt:500, distHM:12, ac:true,  seat:true,  wait:'20', noise:'低', openNow:true },
  important: { cats:['精緻餐廳','牛排館','無菜單'], priceCap:3000, priceAmt:1500,distHM:20, ac:true,  seat:true,  wait:'30', noise:'低', openNow:true, reserve:true },
  late:      { cats:['宵夜','炸物','甜點','手搖飲'], priceCap:300,  priceAmt:150, distHM:10, ac:false, seat:false, wait:'10', noise:'中', openNow:true }
};

let PREFS = JSON.parse(localStorage.getItem('FR_PREFS') || 'null') || DEFAULT_PREFS;
const CATEGORIES_POOL = ['小吃店','便當店','快炒店','牛肉麵','火鍋','日式','韓式','泰式','義式','美式','越式',
  '早午餐','咖啡','甜點','宵夜','炸物','手搖飲','素食','精緻餐廳','牛排館','無菜單'];
function catChip(cat, active){ return `<div class="pill2 ${active?'active':''}" data-cat="${cat}">${cat}</div>`; }
function priceChip(p, active){ return `<div class="pill2 ${active?'active':''}" data-price="${p}">${p}</div>`; }
function renderModePref(mode){
  // 取現存或預設，並做向下相容遷移
  const raw = PREFS[mode] || DEFAULT_PREFS[mode];
  const pf = {
    ...raw,
    // 若舊資料有 dist(公里)，轉為 distHM（百公尺）
    distHM: raw.distHM ?? (raw.dist ? Math.max(1, Math.min(20, Math.round(raw.dist * 10))) : (DEFAULT_PREFS[mode].distHM)),
    // 舊 price 等級不再用；若沒有 priceCap/priceAmt，就給預設
    priceCap: raw.priceCap ?? DEFAULT_PREFS[mode].priceCap,
    priceAmt: raw.priceAmt ?? DEFAULT_PREFS[mode].priceAmt
  };

  const catsHTML = CATEGORIES_POOL.map(c=>`<div class="pill2 ${pf.cats?.includes(c)?'active':''}" data-cat="${c}">${c}</div>`).join('');

  const acOn = pf.ac ? 'on':''; const seatOn = pf.seat ? 'on':'';
  const openChecked = pf.openNow ? 'checked':''; const reserveChecked = pf.reserve ? 'checked':'';  

  // ===== 模板開始 =====
  $('#modePrefBox').innerHTML = `
    <div class="ctrl"><label>餐廳類別</label><div class="row" id="catRow">${catsHTML}</div></div>

<div class="ctrl">
  <label>價位上限（每人，元）</label>
  <select id="priceCap" class="select">
    <option value="100">100</option>
    <option value="300">300</option>
    <option value="500">500</option>
    <option value="1000">1000</option>
    <option value="3000">3000</option>
  </select>
</div>

<!-- 可接受每人金額：拉桿 + 右側預覽 -->
<div class="ctrl">
  <label>可接受每人金額</label>
  <div class="rangeRow">
    <input type="range" min="0" max="${pf.priceCap}" step="10"
           value="${pf.priceAmt}" id="priceRange" class="range"/>
    <span class="preview" id="pricePreview">${pf.priceAmt}</span>
  </div>
</div>

<!-- 評價門檻：0.5 級距 + 右側預覽 -->
<div class="ctrl">
  <label>評價門檻</label>
  <div class="rangeRow">
    <input type="range" min="3.0" max="5.0" step="0.5"
           value="${pf.rating ?? '3.5'}" id="ratingRange" class="range"/>
    <span class="preview" id="ratingPreview">${(pf.rating ?? '3.5')}★</span>
  </div>
</div>

<!-- 距離（百公尺）：1–20 + 右側預覽 -->
<div class="ctrl">
  <label>距離（百公尺）</label>
  <div class="rangeRow">
    <input type="range" min="1" max="20" step="1"
           value="${pf.distHM}" id="distRangeHM" class="range"/>
    <span class="preview" id="distPreview">${pf.distHM}</span>
  </div>
</div>

    <div class="ctrl"><label>有無冷氣</label><div id="acSwitch" class="switch ${acOn}"></div></div>
    <div class="ctrl"><label>可內用座位</label><div id="seatSwitch" class="switch ${seatOn}"></div></div>

    <div class="ctrl"><label>等候容忍（分鐘） <span class="badge2" id="waitBadge">${pf.wait}</span></label>
      <input type="range" min="0" max="60" step="5" value="${pf.wait}" id="waitRange" class="range"/>
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
  // ===== 事件綁定 =====
  // 類別/噪音/開關
  $$('#catRow .pill2').forEach(el=>el.addEventListener('click', ()=>el.classList.toggle('active')));
  $$('#noiseRow .pill2').forEach(el=>el.addEventListener('click', ()=>{ $$('#noiseRow .pill2').forEach(x=>x.classList.remove('active')); el.classList.add('active'); }));
  function toggleSwitch(id){ const el = document.getElementById(id); el.addEventListener('click', ()=>el.classList.toggle('on')); }
  toggleSwitch('acSwitch'); toggleSwitch('seatSwitch');

  // 評價/等待時間
const ratingR = $('#ratingRange');
const ratingP = $('#ratingPreview');
ratingR.addEventListener('input', e=> ratingP.textContent = e.target.value + '★');
  $('#waitRange').addEventListener('input',  e=>$('#waitBadge').textContent  = e.target.value);

// 價位上限 → 調整拉桿最大值與預覽
const capSel = $('#priceCap');
capSel.value = String(pf.priceCap);
const priceR = $('#priceRange');
const priceP = $('#pricePreview');
capSel.addEventListener('change', ()=>{
  const cap = parseInt(capSel.value,10);
  priceR.max = cap;
  if (+priceR.value > cap) priceR.value = cap;
  priceP.textContent = priceR.value;
});
priceR.addEventListener('input', e=> priceP.textContent = e.target.value);

  // 距離（百公尺）
const distR = $('#distRangeHM');
const distP = $('#distPreview');
distR.addEventListener('input', e=> distP.textContent = e.target.value);
}

function currentModeFromTabs(){ const el = document.querySelector('#modeTabs .tab.active'); return el ? el.dataset.mode : 'casual'; }
document.addEventListener('DOMContentLoaded', ()=>{
  renderModePref('casual');
  document.querySelectorAll('.sheet').forEach(s=>s.classList.remove('open'));
  const bd = document.getElementById('sheetBackdrop');
  bd && bd.classList.remove('show');
});

document.addEventListener('click', (e)=>{
  const tab = e.target.closest('#modeTabs .tab'); if(!tab) return;
  $$('#modeTabs .tab').forEach(x=>x.classList.remove('active')); tab.classList.add('active'); renderModePref(tab.dataset.mode);
});
document.getElementById('closeSearch').addEventListener('click', ()=>closeSheet('sheetSearch'));
document.getElementById('saveSearch').addEventListener('click', (evt)=>{
  evt.stopPropagation();
  const mode = currentModeFromTabs();
  const cats  = Array.from(document.querySelectorAll('#catRow .pill2.active')).map(x=>x.dataset.cat);
  const priceCap = parseInt(document.getElementById('priceCap').value,10);
  const priceAmt = parseInt(document.getElementById('priceRange').value,10);
  const distHM  = parseInt(document.getElementById('distRangeHM').value,10);
  const rating= document.getElementById('ratingRange').value;
  const ac    = document.getElementById('acSwitch').classList.contains('on');
  const seat  = document.getElementById('seatSwitch').classList.contains('on');
  const wait  = document.getElementById('waitRange').value;
  const noise = (document.querySelector('#noiseRow .pill2.active')?.dataset.noise) || '中';
  const openNow = document.getElementById('openNow').checked;
  const reserve = document.getElementById('needReserve').checked;
  const PREFS = JSON.parse(localStorage.getItem('FR_PREFS') || 'null') || DEFAULT_PREFS;
  PREFS[mode] = { cats, rating, priceCap, priceAmt, distHM, ac, seat, wait, noise, openNow, reserve };
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
