'use strict';

const STORAGE_KEY = 'lean-day-data-v1';
const SCHEMA_VERSION = 1;

const DEFAULT_FOODS = [
  { id:'sha-chicken-rice', name:'沙县鸡腿饭', calories:760, unit:'份', note:'常见范围约 600–950 kcal；米饭、鸡腿皮和酱汁影响较大', icon:'🍗' },
  { id:'rice', name:'米饭', calories:232, unit:'碗（约200g）', note:'熟米饭约 116 kcal/100g', icon:'🍚' },
  { id:'chicken-leg', name:'鸡腿', calories:250, unit:'只', note:'带皮卤/炸制差异较大，约 180–350 kcal', icon:'🍗' },
  { id:'fried-greens', name:'炒青菜', calories:150, unit:'份', note:'主要误差来自用油量，约 80–250 kcal', icon:'🥬' },
  { id:'braised-egg', name:'卤蛋', calories:75, unit:'个', note:'普通鸡蛋大小', icon:'🥚' },
  { id:'tofu-skin', name:'豆皮', calories:150, unit:'份', note:'卤制或油拌做法差异较大', icon:'🫘' },
  { id:'beef-kale', name:'芥兰炒牛肉', calories:420, unit:'份', note:'常见范围约 320–600 kcal', icon:'🥩' },
  { id:'beef-kway-teow', name:'牛肉粿条', calories:650, unit:'碗', note:'汤粉与炒制版本差异很大，约 500–900 kcal', icon:'🍜' },
  { id:'mcd-1plus1', name:'麦当劳 1+1', calories:650, unit:'套', note:'组合差异很大；建议分别记录具体单品', icon:'🍔' },
  { id:'double-cheeseburger', name:'双层吉士汉堡', calories:450, unit:'个', note:'不同地区配方可能变化，请优先采用门店营养标示', icon:'🍔' },
  { id:'corn-cup', name:'玉米杯', calories:90, unit:'杯', note:'按普通小杯估算', icon:'🌽' },
  { id:'sundae', name:'圣代', calories:280, unit:'杯', note:'口味和酱料影响热量', icon:'🍨' },
  { id:'pineapple-pie', name:'菠萝派', calories:240, unit:'个', note:'油炸甜点估算值', icon:'🥧' },
  { id:'taro-pie', name:'香芋派', calories:250, unit:'个', note:'油炸甜点估算值', icon:'🥧' },
  { id:'chili-pork-rice', name:'辣椒炒肉盖浇饭', calories:820, unit:'份', note:'常见范围约 650–1050 kcal', icon:'🍛' },
  { id:'fungus-beef-rice', name:'木耳炒牛肉盖浇饭', calories:760, unit:'份', note:'常见范围约 600–950 kcal', icon:'🍛' },
  { id:'beef-noodles', name:'牛肉拉面', calories:650, unit:'碗', note:'面量、汤油和牛肉量影响较大，约 500–850 kcal', icon:'🍜' },
  { id:'mizone', name:'脉动', calories:110, unit:'瓶（600ml）', note:'不同规格和版本请查看瓶身营养表', icon:'🧃' },
  { id:'hydration-drink', name:'补水啦', calories:30, unit:'瓶', note:'无糖/含糖版本差异大，请以瓶身营养表为准', icon:'💧' },
  { id:'coke', name:'可口可乐', calories:215, unit:'瓶（500ml）', note:'无糖版接近 0 kcal', icon:'🥤' },
  { id:'beef-hotpot', name:'牛肉火锅', calories:850, unit:'人份', note:'常见范围约 600–1400 kcal；锅底、蘸料和主食影响很大', icon:'🍲' }
];

const DEFAULT_EXERCISES = [
  { id:'running', name:'跑步', icon:'🏃', mets:{ low:7, medium:9.8, high:12.3 }, guides:{ low:'轻松慢跑：呼吸加快但能完整交谈，配速通常较舒适。', medium:'稳定跑：只能说短句，持续出汗，但仍能保持较长时间。', high:'快速跑或间歇：呼吸很急，只能说几个词，难以长时间维持。' } },
  { id:'strength', name:'力量训练', icon:'🏋️', mets:{ low:3.5, medium:5, high:6 }, guides:{ low:'组间休息较长、重量轻，整体呼吸平稳。', medium:'常规增肌训练，组间休息约 1–2 分钟，后几次重复明显费力。', high:'大重量、循环训练或短休息，心率持续较高，接近力竭组较多。' } },
  { id:'basketball', name:'篮球', icon:'🏀', mets:{ low:4.5, medium:6.5, high:8 }, guides:{ low:'投篮练习或半场轻松活动，停顿较多。', medium:'常规半场/全场对抗，跑动和停顿交替，明显出汗。', high:'高强度全场对抗，频繁冲刺、急停和防守，呼吸急促。' } },
  { id:'swimming', name:'游泳', icon:'🏊', mets:{ low:5, medium:7, high:9.8 }, guides:{ low:'休闲游、停顿较多，能轻松持续。', medium:'连续匀速游，呼吸有节奏，完成后有明显疲劳。', high:'快速连续游或间歇冲刺，呼吸急促，休息需求明显。' } },
  { id:'incline', name:'爬坡', icon:'⛰️', mets:{ low:4.3, medium:6, high:8 }, guides:{ low:'缓坡快走，能完整交谈。', medium:'中等坡度持续走，呼吸明显加快，只能说短句。', high:'陡坡快走或快速爬升，腿部负担大，只能说几个词。' } }
];

const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
const round = (value, digits=0) => Number(Number(value).toFixed(digits));
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const esc = (value='') => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

function localISO(date=new Date()) {
  const copy = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return copy.toISOString().slice(0,10);
}
function parseLocalDate(iso) { return new Date(`${iso}T12:00:00`); }
function addDays(iso, days) { const d=parseLocalDate(iso); d.setDate(d.getDate()+days); return localISO(d); }
function formatDate(iso, options={ month:'short', day:'numeric' }) { return new Intl.DateTimeFormat('zh-CN', options).format(parseLocalDate(iso)); }
function dateRange(days, end=localISO()) { return Array.from({length:days}, (_,i)=>addDays(end, i-days+1)); }

function initialState() {
  return { version:SCHEMA_VERSION, activeProfileId:null, profiles:[], entries:[], weights:[], customFoods:[], customExercises:[] };
}

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!parsed || !Array.isArray(parsed.profiles)) return initialState();
    return { ...initialState(), ...parsed };
  } catch { return initialState(); }
}

let state = loadState();
let currentPage = 'today';
let selectedFoodId = null;
let installPrompt = null;

function saveState() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { showToast('无法保存到浏览器，请先导出备份并检查存储空间'); } }
function activeProfile() { return state.profiles.find(p => p.id === state.activeProfileId) || null; }
function profileEntries(profileId=state.activeProfileId) { return state.entries.filter(e => e.profileId === profileId); }
function allFoods() { return [...DEFAULT_FOODS, ...state.customFoods]; }
function allExercises() { return [...DEFAULT_EXERCISES, ...state.customExercises]; }
function getFood(id) { return allFoods().find(f => f.id === id); }
function getExercise(id) { return allExercises().find(e => e.id === id); }

function calculatePlan(profile) {
  if (!profile) return null;
  const w=Number(profile.weight), h=Number(profile.height), age=Number(profile.age), bf=Number(profile.bodyFat);
  const formula = profile.formula === 'katch' && bf > 0 ? 'katch' : 'mifflin';
  const ffm = bf > 0 ? w * (1-bf/100) : null;
  const bmr = formula === 'katch' ? 370 + 21.6*ffm : 10*w + 6.25*h - 5*age + (profile.sex==='female' ? -161 : 5);
  const tdee = bmr * Number(profile.activity || 1.55);
  const weeklyLoss = Number(profile.goalWeight)>=w ? 0 : w * Number(profile.weeklyRate ?? .5) / 100;
  const speedDeficit = weeklyLoss * 7700 / 7;
  const maxDeficit = tdee * .25;
  const deficit = Math.min(speedDeficit, maxDeficit);
  const target = tdee-deficit;
  const referenceWeight = Math.min(w, Math.max(Number(profile.goalWeight)||w, w*.8));
  const protein = referenceWeight * 1.8;
  const fat = referenceWeight * .8;
  const carbs = Math.max(0, (target - protein*4 - fat*9)/4);
  const goalDelta = Math.max(0, w-Number(profile.goalWeight || w));
  const actualWeeklyLoss = deficit*7/7700;
  const estimatedWeeks = actualWeeklyLoss > 0 ? goalDelta/actualWeeklyLoss : 0;
  return { formula, ffm, bmr:round(bmr), tdee:round(tdee), weeklyLoss:round(actualWeeklyLoss,2), deficit:round(deficit), target:round(target), protein:round(protein), fat:round(fat), carbs:round(carbs), estimatedWeeks:round(estimatedWeeks,1), capped:speedDeficit>maxDeficit+1, lowTarget:target<(profile.sex==='female'?1200:1500), goalReached:Number(profile.goalWeight)>=w };
}

function dayData(date, profile=activeProfile()) {
  const plan=calculatePlan(profile);
  const entries=state.entries.filter(e=>e.profileId===profile?.id && e.date===date);
  const foods=entries.filter(e=>e.type==='food');
  const exercises=entries.filter(e=>e.type==='exercise');
  const intake=foods.reduce((s,e)=>s+Number(e.calories),0);
  const exercise=exercises.reduce((s,e)=>s+Number(e.calories),0);
  const snapshot=[...entries].reverse().find(e=>e.planSnapshot)?.planSnapshot;
  const dayPlan=date===localISO()?plan:(snapshot||plan);
  const backfill=exercise*Number((date===localISO()?profile?.exerciseBackfill:snapshot?.backfill) ?? profile?.exerciseBackfill ?? 0);
  const target=(dayPlan?.target||0)+backfill;
  const gap=foods.length ? round((dayPlan?.tdee||0)-intake) : null;
  return { plan, entries, foods, exercises, intake:round(intake), exercise:round(exercise), target:round(target), gap, backfill:round(backfill) };
}

function planSnapshot() { const p=activeProfile(), plan=calculatePlan(p); return {target:plan.target,tdee:plan.tdee,backfill:Number(p.exerciseBackfill||0)}; }

function showToast(message) {
  const el=$('#toast'); el.textContent=message; el.classList.add('show');
  clearTimeout(showToast.timer); showToast.timer=setTimeout(()=>el.classList.remove('show'),2200);
}

function openDialog(dialog) { if (!dialog.open) dialog.showModal(); }
function closeDialog(dialog) { if (dialog.open) dialog.close(); }

function renderProfileSelect() {
  const select=$('#profileSelect');
  if (!state.profiles.length) { select.innerHTML='<option>尚未设置</option>'; select.disabled=true; return; }
  select.disabled=false;
  select.innerHTML=state.profiles.map(p=>`<option value="${p.id}" ${p.id===state.activeProfileId?'selected':''}>${esc(p.name)}</option>`).join('');
}

function renderToday() {
  const root=$('#todayContent');
  const profile=activeProfile();
  $('#todayLabel').textContent=new Intl.DateTimeFormat('zh-CN',{month:'long',day:'numeric',weekday:'short'}).format(new Date());
  if (!profile) {
    root.innerHTML=`<div class="empty-state"><strong>先创建一个个人档案</strong>只需年龄、身高、体重和目标，数据只保存在这台设备。<br><br><button class="button primary" data-action="add-profile">开始设置</button></div>`;
    return;
  }
  const today=localISO(), d=dayData(today,profile), plan=d.plan;
  const remaining=round(d.target-d.intake);
  const progress=d.target ? clamp(d.intake/d.target*100,0,100) : 0;
  const latestWeight=[...state.weights].filter(w=>w.profileId===profile.id).sort((a,b)=>b.date.localeCompare(a.date))[0];
  const status=remaining>=0 ? `还可安排 ${remaining}` : `超出 ${Math.abs(remaining)}`;
  root.innerHTML=`
    <section class="hero-card">
      <div class="hero-top"><div><p class="eyebrow">今日已摄入</p><div class="calorie-number">${d.intake}</div><div class="calorie-unit">kcal</div></div><span class="status-pill">${status} kcal</span></div>
      <div class="progress-track"><div class="progress-fill" style="width:${progress}%"></div></div>
      <div class="hero-meta"><span>建议 ${d.target} kcal${d.backfill?`（含回补 ${d.backfill}）`:''}</span><span>维持约 ${plan.tdee} kcal</span></div>
    </section>
    <div class="quick-actions">
      <button class="quick-action" data-action="add-food"><span>＋</span><span>记饮食</span></button>
      <button class="quick-action" data-action="add-exercise"><span>⌁</span><span>记运动</span></button>
      <button class="quick-action" data-action="add-weight"><span>↕</span><span>记体重</span></button>
    </div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-label">运动</div><div class="stat-value">${d.exercise}</div><div class="stat-note">kcal · 仅记录</div></div>
      <div class="stat-card"><div class="stat-label">估算缺口</div><div class="stat-value">${d.gap??'—'}</div><div class="stat-note">${d.foods.length?'请完整记录全天':'记录饮食后显示'}</div></div>
      <div class="stat-card"><div class="stat-label">体重</div><div class="stat-value">${latestWeight?round(latestWeight.weight,1):round(profile.weight,1)}</div><div class="stat-note">kg${latestWeight?` · ${formatDate(latestWeight.date)}`:' · 档案值'}</div></div>
    </div>
    <section class="card">
      <div class="card-head"><h3>每日营养参考</h3><button class="text-button" data-action="edit-profile">调整目标</button></div>
      <div class="macro-row"><span class="macro-name"><i class="dot"></i>蛋白质</span><span class="macro-value">${plan.protein} g</span></div>
      <div class="macro-row"><span class="macro-name"><i class="dot fat"></i>脂肪</span><span class="macro-value">${plan.fat} g</span></div>
      <div class="macro-row"><span class="macro-name"><i class="dot carb"></i>碳水</span><span class="macro-value">${plan.carbs} g</span></div>
      <p class="help-text">按参考体重分配蛋白质 1.8 g/kg、脂肪 0.8 g/kg，其余热量分给碳水。参考体重取目标体重与当前体重 80% 中较高者，且不超过当前体重。</p>
    </section>
    <section class="card">
      <div class="card-head"><h3>目标进度</h3><span class="eyebrow">${plan.weeklyLoss} kg/周</span></div>
      <div class="macro-row"><span>当前 → 目标</span><span class="macro-value">${round(profile.weight,1)} → ${round(profile.goalWeight,1)} kg</span></div>
      <div class="macro-row"><span>预计时间</span><span class="macro-value">约 ${plan.estimatedWeeks || 0} 周</span></div>
      ${plan.capped?'<div class="warning-box">目标速度对应的缺口超过 TDEE 的 25%，程序已自动按 25% 封顶。</div>':''}
      ${plan.lowTarget?'<div class="warning-box">计算出的摄入较低，可能难以保证营养和训练恢复，建议降低减重速度或咨询营养师。</div>':''}
      ${plan.goalReached?'<div class="warning-box">当前体重已达到目标，可在档案中重新设定目标；如需维持体重，请选择“维持体重”。</div>':''}
    </section>`;
}

function renderLog() {
  const profile=activeProfile(), root=$('#entryList');
  if (!profile) { $('#logSummary').innerHTML=''; root.innerHTML='<div class="empty-state"><strong>还没有个人档案</strong>请先在“今天”创建档案。</div>'; return; }
  const date=$('#logDate').value||localISO();
  const d=dayData(date,profile);
  const weight=state.weights.find(w=>w.profileId===profile.id&&w.date===date);
  $('#logSummary').innerHTML=`<div class="stats-grid"><div class="stat-card"><div class="stat-label">摄入</div><div class="stat-value">${d.intake}</div><div class="stat-note">kcal</div></div><div class="stat-card"><div class="stat-label">运动</div><div class="stat-value">${d.exercise}</div><div class="stat-note">kcal</div></div><div class="stat-card"><div class="stat-label">估算缺口</div><div class="stat-value">${d.gap??'—'}</div><div class="stat-note">需完整记录全天</div></div></div><div class="quick-actions"><button class="quick-action" data-action="add-food"><span>＋</span><span>记饮食</span></button><button class="quick-action" data-action="add-exercise"><span>⌁</span><span>记运动</span></button><button class="quick-action" data-action="add-weight"><span>↕</span><span>${weight?`${round(weight.weight,1)} kg · 更正`:'记体重'}</span></button></div>`;
  if (!d.entries.length) { root.innerHTML='<div class="empty-state"><strong>这天还没有记录</strong>用“今天”页的快捷按钮添加饮食、运动和体重。</div>'; return; }
  const groups=[['早餐',d.foods.filter(e=>e.meal==='早餐')],['午餐',d.foods.filter(e=>e.meal==='午餐')],['晚餐',d.foods.filter(e=>e.meal==='晚餐')],['加餐',d.foods.filter(e=>e.meal==='加餐')],['运动',d.exercises]];
  root.innerHTML=groups.filter(([,items])=>items.length).map(([label,items])=>`
    <section class="entry-group"><h3>${label}</h3>${items.map(e=>`
      <div class="entry-item">
        <span class="entry-icon">${esc(e.icon|| (e.type==='exercise'?'⌁':'🍽️'))}</span>
        <div class="entry-main"><div class="entry-name">${esc(e.name)}</div><div class="entry-sub">${e.type==='exercise'?`${e.minutes} 分钟 · ${esc(intensityLabel(e.intensity))}`:`${e.quantity} ${esc(e.unit||'份')}`}${e.note?` · ${esc(e.note)}`:''}</div></div>
        <span class="entry-kcal">${round(e.calories)} kcal</span>
        <button class="delete-button" data-delete-entry="${e.id}" aria-label="删除 ${esc(e.name)}">×</button>
      </div>`).join('')}</section>`).join('');
}

function intensityLabel(value) { return ({low:'低强度',medium:'中强度',high:'高强度'})[value]||value||''; }

function dailySeries(days, end=localISO()) {
  return dateRange(days,end).map(date=>{
    const d=dayData(date);
    const w=state.weights.filter(x=>x.profileId===state.activeProfileId && x.date===date).sort((a,b)=>b.createdAt-a.createdAt)[0];
    const history=state.weights.filter(x=>x.profileId===state.activeProfileId && x.date<=date && x.date>=addDays(date,-6));
    const avgWeight=history.length>=2?round(history.reduce((s,x)=>s+Number(x.weight),0)/history.length,2):null;
    return { date, intake:d.intake, exercise:d.exercise, gap:d.gap, target:d.target, recorded:d.foods.length>0, weight:w?Number(w.weight):null, avgWeight };
  });
}

function renderTrend() {
  const root=$('#trendContent'), profile=activeProfile();
  if (!profile) { root.innerHTML='<div class="empty-state"><strong>还没有数据</strong>创建档案并开始记录后，这里会显示趋势。</div>'; return; }
  const custom=$('#rangeSelect').value==='custom';
  $('#customRange').hidden=!custom;
  let end=localISO(), days=Number($('#rangeSelect').value||30);
  if(custom) {
    const start=$('#rangeStart').value; end=$('#rangeEnd').value;
    if(!start||!end||end<start) { root.innerHTML='<div class="empty-state">请选择有效的起止日期。</div>'; return; }
    days=Math.round((parseLocalDate(end)-parseLocalDate(start))/86400000)+1;
    if(days>366) { root.innerHTML='<div class="empty-state">一次最多查看 366 天。</div>'; return; }
  }
  const data=dailySeries(days,end);
  const hasAny=data.some(d=>d.recorded||d.exercise||d.weight!==null);
  if (!hasAny) { root.innerHTML='<div class="empty-state"><strong>先记录几天</strong>体重、摄入、运动和热量缺口会在这里形成趋势。</div>'; return; }
  const recorded=data.filter(d=>d.recorded);
  const avgIntake=recorded.length?round(recorded.reduce((s,d)=>s+d.intake,0)/recorded.length):0;
  const totalExercise=data.reduce((s,d)=>s+d.exercise,0);
  const avgGap=recorded.length?round(recorded.reduce((s,d)=>s+d.gap,0)/recorded.length):0;
  root.innerHTML=`
    <div class="stats-grid"><div class="stat-card"><div class="stat-label">平均摄入</div><div class="stat-value">${avgIntake}</div><div class="stat-note">有记录日 · kcal</div></div><div class="stat-card"><div class="stat-label">运动合计</div><div class="stat-value">${totalExercise}</div><div class="stat-note">kcal</div></div><div class="stat-card"><div class="stat-label">平均缺口</div><div class="stat-value">${avgGap}</div><div class="stat-note">有记录日 · kcal</div></div></div>
    ${weightChart(data)}
    ${intakeChart(data)}
    ${barChart(data,'exercise','运动消耗','kcal · MET/手表估算','exercise')}
    ${barChart(data,'gap','估算热量缺口','kcal · TDEE − 摄入；未记饮食的日期留空','gap')}
    <details class="card daily-details"><summary>查看每日数据</summary><div class="table-scroll"><table><thead><tr><th>日期</th><th>体重 kg</th><th>摄入</th><th>运动</th><th>缺口</th></tr></thead><tbody>${[...data].reverse().filter(d=>d.recorded||d.exercise||d.weight!==null).map(d=>`<tr><td>${formatDate(d.date)}</td><td>${d.weight??'—'}</td><td>${d.recorded?d.intake:'—'}</td><td>${d.exercise}</td><td>${d.gap??'—'}</td></tr>`).join('')}</tbody></table></div><p class="help-text">除体重外，单位均为 kcal。横杠表示没有记录。</p></details>
    <div class="warning-box">缺口只有在全天饮食记完整时才有参考意义；活动系数已包含训练，运动消耗不再次加入 TDEE。短期体重受水分、盐、碳水和训练影响，建议观察 2–4 周趋势再调整。</div>`;
}

function chartFrame(values, options={}) {
  const W=Math.max(250,Math.floor($('#trendContent').getBoundingClientRect().width-36)),H=210,L=48,R=12,T=18,B=34;
  let min=options.min ?? Math.min(...values), max=options.max ?? Math.max(...values);
  if (!Number.isFinite(min)||!Number.isFinite(max)) { min=0; max=1; }
  if (min===max) { min=Math.max(0,min-1); max+=1; }
  const pad=(max-min)*.12; min=options.zeroMin?Math.min(0,min):min-pad; max=max+pad;
  const count=options.count??values.length;
  const x=i=>L+8+(count<=1?(W-L-R-16)/2:i/(count-1)*(W-L-R-16));
  const y=v=>T+(max-v)/(max-min)*(H-T-B);
  const ticks=Array.from({length:4},(_,i)=>min+(max-min)*i/3);
  const grid=ticks.map(v=>`<line class="chart-grid" x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}"/><text class="chart-axis" x="${L-7}" y="${y(v)+3}" text-anchor="end">${round(v,options.digits||0)}</text>`).join('');
  return {W,H,L,R,T,B,min,max,x,y,grid};
}

function axisDates(data, frame) {
  if (!data.length) return '';
  const idx=[0,Math.floor((data.length-1)/2),data.length-1].filter((v,i,a)=>a.indexOf(v)===i);
  return idx.map(i=>`<text class="chart-axis" x="${frame.x(i)}" y="${frame.H-8}" text-anchor="${i===0?'start':i===data.length-1?'end':'middle'}">${formatDate(data[i].date)}</text>`).join('');
}

function weightChart(data) {
  const pts=data.filter(d=>d.weight!==null);
  if (!pts.length) return `<section class="chart-card"><h3>体重趋势</h3><p class="chart-sub">记录体重后显示；尽量在起床、如厕后、进食前测量</p><div class="empty-state">暂无体重记录</div></section>`;
  const values=pts.map(d=>d.weight), f=chartFrame([...values,...data.filter(d=>d.avgWeight!==null).map(d=>d.avgWeight)],{count:data.length,digits:1});
  const path=pts.map((d,i)=>`${i?'L':'M'} ${f.x(data.indexOf(d))} ${f.y(d.weight)}`).join(' ');
  const avg=data.filter(d=>d.avgWeight!==null), avgPath=avg.map((d,i)=>`${i?'L':'M'} ${f.x(data.indexOf(d))} ${f.y(d.avgWeight)}`).join(' ');
  const dots=pts.map(d=>`<circle class="chart-dot" cx="${f.x(data.indexOf(d))}" cy="${f.y(d.weight)}" r="4"><title>${formatDate(d.date)}：${d.weight} kg</title></circle>`).join('');
  return `<section class="chart-card"><h3>体重趋势</h3><p class="chart-sub">kg · 从 ${values[0]} 到 ${values.at(-1)} · 7日均值按最近7天已有测量计算</p><div class="chart-wrap"><svg viewBox="0 0 ${f.W} ${f.H}" role="img" aria-label="体重和7日平均趋势图">${f.grid}<path class="chart-line" d="${path}"/><path class="chart-line secondary" d="${avgPath}"/>${dots}${axisDates(data,f)}</svg></div><div class="chart-legend"><span><i class="legend-swatch"></i>实际体重</span><span><i class="legend-swatch blue"></i>7日均值（至少2次）</span></div></section>`;
}

function intakeChart(data) {
  const values=data.flatMap(d=>[d.intake,d.target]).filter(Number.isFinite), f=chartFrame(values,{zeroMin:true,count:data.length});
  const bw=Math.max(3,Math.min(13,(f.W-f.L-f.R)/Math.max(data.length,1)*.58));
  const bars=data.map((d,i)=>d.intake?`<rect class="chart-bar" x="${f.x(i)-bw/2}" y="${f.y(d.intake)}" width="${bw}" height="${Math.max(0,f.y(0)-f.y(d.intake))}" rx="${Math.min(4,bw/2)}"><title>${formatDate(d.date)}：摄入 ${d.intake} kcal</title></rect>`:'').join('');
  const path=data.map((d,i)=>`${i?'L':'M'} ${f.x(i)} ${f.y(d.target)}`).join(' ');
  return `<section class="chart-card"><h3>摄入与建议</h3><p class="chart-sub">kcal · 绿色柱为摄入，蓝线为参考目标</p><div class="chart-wrap"><svg viewBox="0 0 ${f.W} ${f.H}" role="img" aria-label="每日摄入和建议热量趋势图">${f.grid}${bars}<path class="chart-line secondary" d="${path}"/>${axisDates(data,f)}</svg></div><div class="chart-legend"><span><i class="legend-swatch"></i>摄入</span><span><i class="legend-swatch blue"></i>建议</span></div></section>`;
}

function barChart(data,key,title,subtitle,kind) {
  if (!data.length || !data.some(d=>d[key])) return `<section class="chart-card"><h3>${title}</h3><p class="chart-sub">${subtitle}</p><div class="empty-state">暂无数据</div></section>`;
  const values=data.map(d=>Number(d[key])||0), f=chartFrame(values,{zeroMin:true,count:data.length});
  const zeroY=f.y(0), bw=Math.max(4,Math.min(14,(f.W-f.L-f.R)/Math.max(data.length,1)*.62));
  const bars=data.map((d,i)=>{ const v=Number(d[key])||0, y=Math.min(f.y(v),zeroY), h=Math.abs(zeroY-f.y(v)); return `<rect class="chart-bar ${kind==='exercise'?'exercise':''} ${v<0?'negative':''}" x="${f.x(i)-bw/2}" y="${y}" width="${bw}" height="${Math.max(h, v?2:0)}" rx="${Math.min(4,bw/2)}"><title>${formatDate(d.date)}：${v} kcal</title></rect>`; }).join('');
  return `<section class="chart-card"><h3>${title}</h3><p class="chart-sub">${subtitle}</p><div class="chart-wrap"><svg viewBox="0 0 ${f.W} ${f.H}" role="img" aria-label="${title}图">${f.grid}${bars}${axisDates(data,f)}</svg></div></section>`;
}

function renderSettings() {
  const root=$('#settingsContent'), p=activeProfile();
  if (!p) { root.innerHTML='<div class="empty-state"><strong>还没有个人档案</strong>请先创建档案。</div>'; return; }
  const plan=calculatePlan(p);
  root.innerHTML=`
    <div class="settings-list">
      <button class="settings-row" data-action="edit-profile"><span><strong>${esc(p.name)}的档案</strong><small>${p.age} 岁 · ${p.height} cm · ${p.weight} kg</small></span><span class="settings-value">编辑 ›</span></button>
      <div class="settings-row"><span><strong>每日建议</strong><small>BMR ${plan.bmr} · TDEE ${plan.tdee}</small></span><span class="settings-value">${plan.target} kcal</span></div>
      <div class="settings-row"><span><strong>计算口径</strong><small>${plan.formula==='katch'?'Katch–McArdle':'Mifflin–St Jeor'} · 活动系数 ${p.activity}</small></span><span class="settings-value">缺口 ${plan.deficit}</span></div>
      <div class="settings-row"><span><strong>运动回补</strong><small>运动仍会独立记录和绘图</small></span><span class="settings-value">${Number(p.exerciseBackfill||0)*100}%</span></div>
    </div>
    <div class="settings-list">
      <button class="settings-row" data-action="export"><span><strong>导出备份</strong><small>保存所有用户、饮食、运动和体重记录</small></span><span>↓</span></button>
      <button class="settings-row" data-action="import"><span><strong>导入备份</strong><small>从本程序导出的 JSON 文件恢复</small></span><span>↑</span></button>
      <button class="settings-row" data-action="install"><span><strong>安装到设备</strong><small>安卓/Windows 可直接安装；iPhone 请用 Safari 添加到主屏幕</small></span><span>＋</span></button>
    </div>
    <div class="settings-list">
      <button class="settings-row" data-action="delete-profile"><span><strong>删除当前用户</strong><small>只删除 ${esc(p.name)} 的档案和记录</small></span><span class="settings-value">删除</span></button>
    </div>
    <div class="warning-box">数据仅保存在当前浏览器中，不会上传。请偶尔“导出备份”；清除浏览器数据或更换设备前务必备份。</div>
    <details class="card"><summary>查看计算公式与说明</summary><p class="help-text">Mifflin：BMR = 10×体重kg + 6.25×身高cm − 5×年龄 + 常数（男+5 / 女−161）。<br>Katch：BMR = 370 + 21.6×体重×(1−体脂率/100)。<br>TDEE = BMR×活动系数；每日缺口 = 体重×每周减重比例×7700÷7，最高取 TDEE 的25%。<br>建议摄入 = TDEE−缺口；维持模式或达到目标时缺口为0。<br>运动消耗 = MET×3.5×体重÷200×分钟，包含运动时段静息消耗，不再叠加到 TDEE。<br>默认不回补运动热量。只有超出平时的长时间训练才考虑适当回补，避免重复计算。<br>过去日期沿用记录时的目标；补记时采用补记当时的档案估算。</p></details>
    <p class="help-text">热量、TDEE、食物和运动消耗都是估算值。若出现持续乏力、头晕、月经异常、训练表现明显下降或进食焦虑，请缩小缺口并咨询医生或注册营养师。</p>`;
}

function renderAll() { renderProfileSelect(); renderToday(); renderLog(); renderTrend(); renderSettings(); }

function switchPage(page) {
  currentPage=page;
  $$('.page').forEach(p=>{ const active=p.dataset.page===page; p.hidden=!active; p.classList.toggle('active',active); });
  $$('.nav-button').forEach(b=>{ const active=b.dataset.target===page; b.classList.toggle('active',active); active?b.setAttribute('aria-current','page'):b.removeAttribute('aria-current'); });
  if (page==='log') renderLog(); if (page==='trend') renderTrend(); if (page==='settings') renderSettings();
  window.scrollTo({top:0,behavior:'smooth'});
}

function showProfileDialog(profile=null) {
  const form=$('#profileForm'); form.reset();
  form.elements.profileId.value='';
  $('#profileDialogTitle').textContent=profile?'编辑档案':'创建用户';
  if (profile) { Object.entries(profile).forEach(([k,v])=>{ if (form.elements[k] && v!==null && v!==undefined) form.elements[k].value=v; }); form.elements.profileId.value=profile.id; }
  else { form.elements.formula.value='mifflin'; form.elements.sex.value='male'; form.elements.weeklyRate.value='0.5'; form.elements.activity.value='1.55'; form.elements.exerciseBackfill.value='0'; }
  updateProfilePreview(); openDialog($('#profileDialog'));
}

function updateProfilePreview() {
  const form=$('#profileForm'), fd=Object.fromEntries(new FormData(form));
  const complete=fd.age&&fd.height&&fd.weight&&fd.goalWeight;
  if (!complete) { $('#profilePreview').innerHTML='填完数据后，这里会预览每日推荐热量。'; return; }
  if (fd.formula==='katch' && !fd.bodyFat) { $('#profilePreview').innerHTML='<strong>需要体脂率</strong><br>Katch 公式需要填写体脂率；否则保存时会自动改用 Mifflin。'; return; }
  const plan=calculatePlan(fd);
  $('#profilePreview').innerHTML=`<strong>预估：每日 ${plan.target} kcal</strong><br>BMR ${plan.bmr} · TDEE ${plan.tdee} · 每日缺口 ${plan.deficit} · 约 ${plan.weeklyLoss} kg/周${plan.capped?'（已按 25% 缺口封顶）':''}`;
}

function renderFoodPicker(query='') {
  const words=query.trim().toLowerCase();
  const foods=allFoods().filter(f=>!words || `${f.name} ${f.note||''}`.toLowerCase().includes(words));
  $('#foodPicker').innerHTML=foods.length?foods.map(f=>`<button type="button" class="picker-option ${f.id===selectedFoodId?'selected':''}" data-food-id="${f.id}" role="option" aria-selected="${f.id===selectedFoodId}"><span><strong>${esc(f.name)}</strong><small>${esc(f.note||'')}</small></span><span>${f.calories} kcal/${esc(f.unit)}</span></button>`).join(''):'<div class="empty-state">没有匹配项，可创建自定义食物。</div>';
}

function selectFood(id) {
  const f=getFood(id); if(!f) return;
  selectedFoodId=id; $('#foodForm').elements.foodId.value=id;
  const qty=Number($('#foodForm').elements.quantity.value||1);
  $('#foodForm').elements.calories.value=round(f.calories*qty);
  $('#selectedFood').innerHTML=`<strong>${esc(f.name)}</strong><br>${f.calories} kcal / ${esc(f.unit)} · ${esc(f.note||'自定义食物')}`;
  renderFoodPicker($('#foodSearch').value);
}

function showFoodDialog(date=localISO()) {
  if(!activeProfile()) return showProfileDialog();
  const form=$('#foodForm'); form.reset(); form.elements.date.value=date; form.elements.quantity.value=1; form.elements.meal.value='午餐';
  selectedFoodId=null; $('#foodSearch').value=''; $('#selectedFood').textContent='请选择食物'; renderFoodPicker(); openDialog($('#foodDialog'));
}

function populateExerciseSelect(selected) {
  const select=$('#exerciseSelect'); select.innerHTML=allExercises().map(e=>`<option value="${e.id}" ${e.id===selected?'selected':''}>${esc(e.name)}</option>`).join(''); updateExerciseEstimate();
}

function updateExerciseEstimate() {
  const form=$('#exerciseForm'), ex=getExercise(form.elements.exerciseId.value); if(!ex) return;
  const intensity=form.elements.intensity.value, minutes=Number(form.elements.minutes.value||0), w=Number(activeProfile()?.weight||0), met=Number(ex.mets[intensity]);
  const calories=met*3.5*w/200*minutes;
  form.elements.calories.value=round(calories);
  $('#intensityGuide').innerHTML=`<strong>${intensityLabel(intensity)} · MET ${met}</strong><br>${esc(ex.guides[intensity]||ex.guide||'根据呼吸、说话能力和主观费力程度判断。')}`;
}

function showExerciseDialog(date=localISO()) {
  if(!activeProfile()) return showProfileDialog();
  const form=$('#exerciseForm'); form.reset(); form.elements.date.value=date; form.elements.intensity.value='medium'; form.elements.minutes.value=45; populateExerciseSelect('running'); openDialog($('#exerciseDialog'));
}

function showWeightDialog(date=localISO()) {
  if(!activeProfile()) return showProfileDialog();
  const form=$('#weightForm'); form.reset(); form.elements.date.value=date;
  const latest=[...state.weights].filter(w=>w.profileId===state.activeProfileId).sort((a,b)=>b.date.localeCompare(a.date))[0];
  form.elements.weight.value=latest?.weight||activeProfile().weight; openDialog($('#weightDialog'));
}

async function confirmAction(title,message) {
  $('#confirmTitle').textContent=title; $('#confirmMessage').textContent=message;
  const dialog=$('#confirmDialog'); openDialog(dialog);
  return new Promise(resolve=>dialog.addEventListener('close',()=>resolve(dialog.returnValue==='confirm'),{once:true}));
}

function exportData() {
  const blob=new Blob([JSON.stringify({...state,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob), a=document.createElement('a'); a.href=url; a.download=`豆记录备份-${localISO()}.json`; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000); showToast('备份已导出');
}

async function importData(file) {
  try {
    if(file.size>10*1024*1024) throw new Error('文件超过 10 MB');
    const parsed=JSON.parse(await file.text());
    validateBackup(parsed);
    const ok=await confirmAction('导入并覆盖？','导入会替换当前设备里的所有数据。建议先导出当前备份。');
    if(!ok) return;
    state={...initialState(),...parsed,version:SCHEMA_VERSION}; saveState(); renderAll(); showToast('备份已恢复');
  } catch(err) { showToast(`导入失败：${err.message}`); }
}

function validateBackup(data) {
  const fail=()=>{throw new Error('不是有效的豆记录备份，或包含不完整的数据');};
  const number=(n,min,max)=>typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max;
  const text=(s,max=200)=>typeof s==='string'&&s.length<=max;
  const id=s=>typeof s==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(s);
  const date=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!isNaN(parseLocalDate(s))&&localISO(parseLocalDate(s))===s;
  if(!data||data.version!==SCHEMA_VERSION) fail();
  for(const key of ['profiles','entries','weights','customFoods','customExercises']) if(!Array.isArray(data[key])||data[key].length>50000) fail();
  if(data.profiles.length>100) fail();
  const profileIds=new Set();
  for(const p of data.profiles) {
    if(!p||!id(p.id)||profileIds.has(p.id)||!text(p.name,20)||!p.name.trim()||!number(p.age,18,100)||!number(p.height,120,230)||!number(p.weight,30,300)||!number(p.goalWeight,35,300)||!['male','female'].includes(p.sex)||!['mifflin','katch'].includes(p.formula)||![0,.25,.5,.75,1].includes(p.weeklyRate)||![1.2,1.375,1.55,1.725].includes(p.activity)||![0,.25,.5].includes(p.exerciseBackfill)||!(p.bodyFat===null||number(p.bodyFat,3,60))) fail();
    profileIds.add(p.id);
  }
  if(data.activeProfileId!==null&&!profileIds.has(data.activeProfileId)) fail();
  const entryIds=new Set();
  for(const e of data.entries) {
    if(!e||!id(e.id)||entryIds.has(e.id)||!profileIds.has(e.profileId)||!['food','exercise'].includes(e.type)||!date(e.date)||!text(e.name,100)||!number(e.calories,0,10000)||!number(e.createdAt,0,1e15)) fail();
    if(e.icon!==undefined&&!text(e.icon,20)) fail();
    if(e.type==='food'&&(!id(e.foodId)||!number(e.quantity,.1,20)||!['早餐','午餐','晚餐','加餐'].includes(e.meal)||!text(e.unit,30)||!text(e.note,80))) fail();
    if(e.type==='exercise'&&(!id(e.exerciseId)||!number(e.minutes,1,600)||!['low','medium','high'].includes(e.intensity))) fail();
    if(e.planSnapshot&&(!number(e.planSnapshot.target,0,20000)||!number(e.planSnapshot.tdee,0,20000)||![0,.25,.5].includes(e.planSnapshot.backfill))) fail();
    entryIds.add(e.id);
  }
  const weightDays=new Set();
  for(const w of data.weights) {
    const day=`${w?.profileId}-${w?.date}`;
    if(!w||!id(w.id)||!profileIds.has(w.profileId)||!date(w.date)||!number(w.weight,30,300)||!number(w.createdAt,0,1e15)||weightDays.has(day)) fail();
    weightDays.add(day);
  }
  const foodIds=new Set(DEFAULT_FOODS.map(f=>f.id)), exerciseIds=new Set(DEFAULT_EXERCISES.map(e=>e.id));
  for(const f of data.customFoods) {
    if(!f||!id(f.id)||foodIds.has(f.id)||!text(f.name,30)||!f.name.trim()||!number(f.calories,0,5000)||!text(f.unit,10)||!f.unit.trim()||!text(f.note,80)) fail();
    foodIds.add(f.id);
  }
  for(const e of data.customExercises) {
    if(!e||!id(e.id)||exerciseIds.has(e.id)||!text(e.name,30)||!e.name.trim()||!e.mets||!e.guides) fail();
    for(const intensity of ['low','medium','high']) if(!number(e.mets[intensity],1,25)||!text(e.guides[intensity],200)) fail();
    exerciseIds.add(e.id);
  }
}

function handleAction(action) {
  const date=currentPage==='log'?$('#logDate').value:localISO();
  if(action==='add-profile') showProfileDialog();
  if(action==='edit-profile') showProfileDialog(activeProfile());
  if(action==='add-food') showFoodDialog(date);
  if(action==='add-exercise') showExerciseDialog(date);
  if(action==='add-weight') showWeightDialog(date);
  if(action==='export') exportData();
  if(action==='import') $('#importInput').click();
  if(action==='install') {
    if(installPrompt) { installPrompt.prompt(); installPrompt.userChoice.finally(()=>installPrompt=null); }
    else showToast('iPhone：请用 Safari 的“分享 → 添加到主屏幕”');
  }
  if(action==='delete-profile') deleteCurrentProfile();
}

async function deleteCurrentProfile() {
  const p=activeProfile(); if(!p) return;
  const ok=await confirmAction(`删除 ${p.name}？`,'这个用户的饮食、运动和体重记录都会删除。导出的备份仍可恢复。'); if(!ok) return;
  state.profiles=state.profiles.filter(x=>x.id!==p.id); state.entries=state.entries.filter(x=>x.profileId!==p.id); state.weights=state.weights.filter(x=>x.profileId!==p.id); state.activeProfileId=state.profiles[0]?.id||null; saveState(); switchPage('today'); renderAll(); showToast('用户已删除');
}

document.addEventListener('click', async e=>{
  const nav=e.target.closest('[data-target]'); if(nav) return switchPage(nav.dataset.target);
  const action=e.target.closest('[data-action]'); if(action) return handleAction(action.dataset.action);
  const food=e.target.closest('[data-food-id]'); if(food) return selectFood(food.dataset.foodId);
  const del=e.target.closest('[data-delete-entry]');
  if(del) { const entry=state.entries.find(x=>x.id===del.dataset.deleteEntry); const ok=await confirmAction('删除这条记录？',entry?.name||''); if(ok){ state.entries=state.entries.filter(x=>x.id!==del.dataset.deleteEntry); saveState(); renderAll(); showToast('记录已删除'); } }
  if(e.target.closest('.close-dialog')) closeDialog(e.target.closest('dialog'));
});

$('#profileSelect').addEventListener('change',e=>{ state.activeProfileId=e.target.value; saveState(); renderAll(); });
$('#addProfileButton').addEventListener('click',()=>showProfileDialog());
$('#logDate').addEventListener('change',renderLog);
$('#rangeSelect').addEventListener('change',renderTrend);
$('#rangeStart').addEventListener('change',renderTrend);
$('#rangeEnd').addEventListener('change',renderTrend);
$('#foodSearch').addEventListener('input',e=>renderFoodPicker(e.target.value));
$('#foodForm').elements.quantity.addEventListener('input',()=>{ const f=getFood(selectedFoodId); if(f) $('#foodForm').elements.calories.value=round(f.calories*Number($('#foodForm').elements.quantity.value||0)); });
['exerciseId','intensity','minutes'].forEach(name=>$('#exerciseForm').elements[name].addEventListener('input',updateExerciseEstimate));
['formula','sex','age','height','weight','goalWeight','bodyFat','weeklyRate','activity'].forEach(name=>$('#profileForm').elements[name].addEventListener('input',updateProfilePreview));

$('#profileForm').addEventListener('submit',e=>{
  e.preventDefault(); const fd=Object.fromEntries(new FormData(e.currentTarget));
  if(!fd.name.trim()) return showToast('请填写昵称');
  fd.name=fd.name.trim();
  const old=state.profiles.find(p=>p.id===fd.profileId), id=old?.id||uid();
  const profile={...old,...fd,id,age:Number(fd.age),height:Number(fd.height),weight:Number(fd.weight),goalWeight:Number(fd.goalWeight),bodyFat:fd.bodyFat?Number(fd.bodyFat):null,weeklyRate:Number(fd.weeklyRate),activity:Number(fd.activity),exerciseBackfill:Number(fd.exerciseBackfill)};
  if(profile.formula==='katch'&&!profile.bodyFat) profile.formula='mifflin';
  const idx=state.profiles.findIndex(p=>p.id===id); idx>=0?state.profiles.splice(idx,1,profile):state.profiles.push(profile); state.activeProfileId=id;
  if(!old||old.weight!==profile.weight) {
    state.weights=state.weights.filter(w=>!(w.profileId===id&&w.date===localISO()));
    state.weights.push({id:uid(),profileId:id,date:localISO(),weight:profile.weight,createdAt:Date.now()});
  }
  saveState(); closeDialog($('#profileDialog')); renderAll(); showToast(old?'档案已更新':'用户已创建');
});

$('#foodForm').addEventListener('submit',e=>{
  e.preventDefault(); const fd=Object.fromEntries(new FormData(e.currentTarget)), f=getFood(fd.foodId); if(!f) return showToast('请先选择食物');
  state.entries.push({id:uid(),profileId:state.activeProfileId,type:'food',date:fd.date,meal:fd.meal,foodId:f.id,name:f.name,icon:f.icon||'🍽️',unit:f.unit,quantity:Number(fd.quantity),calories:Number(fd.calories),note:fd.note||'',createdAt:Date.now(),planSnapshot:planSnapshot()});
  saveState(); closeDialog($('#foodDialog')); $('#logDate').value=fd.date; renderAll(); showToast('饮食已记录');
});

$('#exerciseForm').addEventListener('submit',e=>{
  e.preventDefault(); const fd=Object.fromEntries(new FormData(e.currentTarget)), ex=getExercise(fd.exerciseId); if(!ex) return;
  state.entries.push({id:uid(),profileId:state.activeProfileId,type:'exercise',date:fd.date,exerciseId:ex.id,name:ex.name,icon:ex.icon||'⌁',intensity:fd.intensity,minutes:Number(fd.minutes),calories:Number(fd.calories),createdAt:Date.now(),planSnapshot:planSnapshot()});
  saveState(); closeDialog($('#exerciseDialog')); $('#logDate').value=fd.date; renderAll(); showToast('运动已记录');
});

$('#weightForm').addEventListener('submit',e=>{
  e.preventDefault(); const fd=Object.fromEntries(new FormData(e.currentTarget)), weight=Number(fd.weight);
  state.weights=state.weights.filter(w=>!(w.profileId===state.activeProfileId&&w.date===fd.date)); state.weights.push({id:uid(),profileId:state.activeProfileId,date:fd.date,weight,createdAt:Date.now()});
  const p=activeProfile(); const latest=state.weights.filter(w=>w.profileId===p.id&&w.date<=localISO()).sort((a,b)=>b.date.localeCompare(a.date))[0]; if(latest) p.weight=latest.weight;
  saveState(); closeDialog($('#weightDialog')); renderAll(); showToast('体重已记录');
});

$('#openCustomFood').addEventListener('click',()=>openDialog($('#customFoodDialog')));
$('#customFoodForm').addEventListener('submit',e=>{
  e.preventDefault(); const fd=Object.fromEntries(new FormData(e.currentTarget)); if(!fd.name.trim()||!fd.unit.trim()) return showToast('请填写名称和单位'); const f={id:`custom-food-${uid()}`,name:fd.name.trim(),calories:Number(fd.calories),unit:fd.unit.trim(),note:fd.note||'自定义食物',icon:'🍽️'};
  state.customFoods.push(f); saveState(); closeDialog($('#customFoodDialog')); e.currentTarget.reset(); selectFood(f.id); showToast('自定义食物已保存');
});

$('#openCustomExercise').addEventListener('click',()=>openDialog($('#customExerciseDialog')));
$('#customExerciseForm').addEventListener('submit',e=>{
  e.preventDefault(); const fd=Object.fromEntries(new FormData(e.currentTarget)), guide=fd.guide||'低强度能完整交谈；中强度只能说短句；高强度只能说几个词。';
  if(!fd.name.trim()) return showToast('请填写运动名称');
  if(Number(fd.low)>Number(fd.medium)||Number(fd.medium)>Number(fd.high)) return showToast('MET 应按低、中、高强度依次增加');
  const ex={id:`custom-ex-${uid()}`,name:fd.name,icon:'⌁',mets:{low:Number(fd.low),medium:Number(fd.medium),high:Number(fd.high)},guides:{low:guide,medium:guide,high:guide},guide};
  state.customExercises.push(ex); saveState(); closeDialog($('#customExerciseDialog')); e.currentTarget.reset(); populateExerciseSelect(ex.id); showToast('自定义运动已保存');
});

$('#importInput').addEventListener('change',e=>{ if(e.target.files[0]) importData(e.target.files[0]); e.target.value=''; });
window.addEventListener('beforeinstallprompt',e=>{ e.preventDefault(); installPrompt=e; });

$('#logDate').value=localISO();
$('#rangeStart').value=addDays(localISO(),-29);
$('#rangeEnd').value=localISO();
$$('input[type="date"]').forEach(input=>input.max=localISO());
window.addEventListener('resize',()=>{ cancelAnimationFrame(window.chartFrameRequest); window.chartFrameRequest=requestAnimationFrame(()=>{if(currentPage==='trend') renderTrend();}); });
renderAll();
if(!state.profiles.length) setTimeout(()=>showProfileDialog(),250);

if('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
}
