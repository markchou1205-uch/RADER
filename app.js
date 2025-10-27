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
    if(type==='plan') openOverlay('overlayPlan');
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
$('#historyBtn').addEventListener('click', ()=>openOverlay('overlayHistory'));
$('#favBtn').addEventListener('click', ()=>openOverlay('overlayFav'));
$('#planBtnDock').addEventListener('click', ()=>openOverlay('overlayPlan'));
$('#settingsBtn').addEventListener('click', ()=>openSheet('sheetSearch'));

/* ====== Quick Lock ====== */
$('#quickBtn').addEventListener('click', ()=>{
  resetUI();
  // reflect current mode & people
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
  openOverlay('overlay');
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

/* ====== Search Settings ====== */
function togglePill2(el){ el.classList.toggle('active'); }
$$('#sheetSearch .pill2').forEach(el=>{
  el.addEventListener('click', ()=>{
    if(el.dataset.rating){ $$('[data-rating]').forEach(x=>x.classList.remove('active')); }
    togglePill2(el);
  });
});
const distRange = $('#distRange');
const distBadge = $('#distBadge');
distRange.addEventListener('input', ()=>distBadge.textContent = (+distRange.value).toFixed(1));
$('#closeSearch').addEventListener('click', ()=>closeSheet('sheetSearch'));
$('#saveSearch').addEventListener('click', ()=>{ alert('（Demo）已儲存搜尋設定'); closeSheet('sheetSearch'); });

/* ====== Basic Settings ====== */
function bindSwitch(id){
  const el = document.getElementById(id);
  el.addEventListener('click', ()=>el.classList.toggle('on'));
}
bindSwitch('voiceSwitch'); bindSwitch('hotwordSwitch');
$('#closeBasic').addEventListener('click', ()=>closeSheet('sheetBasic'));
$('#saveBasic').addEventListener('click', ()=>{ alert('（Demo）已儲存基本設定'); closeSheet('sheetBasic'); });

/* ====== Nav confirm ====== */
window.confirmNav = function(name, action){
  const msg = `導航至「${name}」嗎？\n選擇：\n【確定】${action==='nav'?'開始導航':'地圖顯示'}；【取消】返回`;
  if(confirm(msg)){
    alert(action==='nav'?'（Demo）已呼叫 Google Maps 導航。':'（Demo）開啟地圖顯示。');
    // 真實實作：window.location.href = 'https://www.google.com/maps/dir/?api=1&destination=...'
  }
};