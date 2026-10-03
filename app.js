
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const KEY = 'nizamy-pwa-v1';
const defaultState = { habits:[
  {id:crypto.randomUUID(),name:'شرب 2 لتر مياه',checks:{}},
  {id:crypto.randomUUID(),name:'قراءة 20 دقيقة',checks:{}},
  {id:crypto.randomUUID(),name:'رياضة',checks:{}}
],tasks:[],goals:[],sleep:{},updatedAt:null };
let state = JSON.parse(localStorage.getItem(KEY) || 'null') || defaultState;
const today = () => new Date().toISOString().slice(0,10);
const monthKey = d => d.slice(0,7);
const save = (sync=true) => {state.updatedAt=new Date().toISOString();localStorage.setItem(KEY,JSON.stringify(state));render(); if(sync) debouncedSync();};
let syncTimer; function debouncedSync(){clearTimeout(syncTimer); syncTimer=setTimeout(()=>syncToGoogle(false),800)}

$$('.tab').forEach(b=>b.onclick=()=>showView(b.dataset.view));
$$('[data-jump]').forEach(b=>b.onclick=()=>showView(b.dataset.jump));
function showView(id){$$('.view').forEach(v=>v.classList.toggle('active',v.id===id));$$('.tab').forEach(t=>t.classList.toggle('active',t.dataset.view===id));}

$('#settingsBtn').onclick=()=>{$('#settingsModal').classList.remove('hidden');$('#apiUrl').value=localStorage.getItem('nizamy-api')||''}
$('#closeSettings').onclick=()=>$('#settingsModal').classList.add('hidden');
$('#saveApi').onclick=()=>{localStorage.setItem('nizamy-api',$('#apiUrl').value.trim());$('#syncStatus').textContent='تم حفظ الرابط';}
$('#syncNow').onclick=()=>syncToGoogle(true);

$('#addHabit').onclick=()=>{let v=$('#newHabit').value.trim();if(!v)return;state.habits.push({id:crypto.randomUUID(),name:v,checks:{}});$('#newHabit').value='';save();}
$('#addTask').onclick=()=>{let v=$('#newTask').value.trim();if(!v)return;state.tasks.push({id:crypto.randomUUID(),title:v,date:$('#taskDate').value||today(),done:false});$('#newTask').value='';save();}
$('#addGoal').onclick=()=>{let title=$('#goalTitle').value.trim();if(!title)return;let steps=$('#goalSteps').value.split('\n').map(x=>x.trim()).filter(Boolean).map(x=>({id:crypto.randomUUID(),title:x,done:false}));state.goals.push({id:crypto.randomUUID(),title,deadline:$('#goalDeadline').value,steps});$('#goalTitle').value='';$('#goalSteps').value='';save();}
$('#saveSleep').onclick=()=>{let n=Number($('#sleepHours').value);if(n<0||n>24||!Number.isFinite(n))return;state.sleep[today()]=n;save();}

function toggleHabit(id){let h=state.habits.find(x=>x.id===id);h.checks[today()]=!h.checks[today()];save()}
function deleteHabit(id){state.habits=state.habits.filter(x=>x.id!==id);save()}
function toggleTask(id){let x=state.tasks.find(x=>x.id===id);x.done=!x.done;save()}
function deleteTask(id){state.tasks=state.tasks.filter(x=>x.id!==id);save()}
function toggleStep(gid,sid){let g=state.goals.find(g=>g.id===gid),s=g.steps.find(s=>s.id===sid);s.done=!s.done;save()}
function deleteGoal(id){state.goals=state.goals.filter(x=>x.id!==id);save()}
Object.assign(window,{toggleHabit,deleteHabit,toggleTask,deleteTask,toggleStep,deleteGoal});

function habitRateForDate(d){if(!state.habits.length)return 0;return Math.round(state.habits.filter(h=>h.checks[d]).length/state.habits.length*100)}
function avgSleep(days=30){let vals=Object.entries(state.sleep).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,days).map(x=>Number(x[1])).filter(Number.isFinite);return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:0}
function goalProgress(g){if(!g.steps.length)return 0;return Math.round(g.steps.filter(s=>s.done).length/g.steps.length*100)}
function todayScore(){let hr=habitRateForDate(today());let due=state.tasks.filter(t=>t.date===today());let tr=due.length?Math.round(due.filter(t=>t.done).length/due.length*100):100;return Math.round((hr+tr)/2)}

function render(){
 $('#todayScore').textContent=todayScore()+'%';
 $('#habitRate').textContent=habitRateForDate(today())+'%';
 $('#taskCount').textContent=state.tasks.filter(t=>t.done).length;
 $('#sleepAvg').textContent=avgSleep(30).toFixed(1);
 let gr=state.goals.length?Math.round(state.goals.reduce((a,g)=>a+goalProgress(g),0)/state.goals.length):0;$('#goalRate').textContent=gr+'%';
 $('#sleepHours').value=state.sleep[today()] ?? '';

 $('#habitQuick').innerHTML=state.habits.slice(0,4).map(h=>itemHabit(h,false)).join('') || '<p class="muted">لا توجد عادات بعد.</p>';
 $('#habitsList').innerHTML=state.habits.map(h=>itemHabit(h,true)).join('') || '<p class="muted">أضف أول عادة.</p>';
 $('#tasksList').innerHTML=state.tasks.slice().sort((a,b)=>a.date.localeCompare(b.date)).map(t=>`
 <div class="item"><div class="item-main"><button class="check ${t.done?'done':''}" onclick="toggleTask('${t.id}')">${t.done?'✓':''}</button><div><div>${escapeHtml(t.title)}</div><small>${t.date}</small></div></div><button class="danger" onclick="deleteTask('${t.id}')">حذف</button></div>`).join('') || '<p class="muted">لا توجد مهام.</p>';
 $('#goalsList').innerHTML=state.goals.map(g=>{let p=goalProgress(g);return `<div class="goal-card"><div class="goal-title"><div><h4>${escapeHtml(g.title)}</h4><small>${g.deadline||'بدون موعد'}</small></div><button class="danger" onclick="deleteGoal('${g.id}')">حذف</button></div><div class="progress"><span style="width:${p}%"></span></div><small>${p}% مكتمل</small>${g.steps.map(s=>`<label class="step"><input type="checkbox" ${s.done?'checked':''} onchange="toggleStep('${g.id}','${s.id}')"><span>${escapeHtml(s.title)}</span></label>`).join('')}</div>`}).join('') || '<p class="muted">لا توجد أهداف.</p>';
 renderYear(); drawWeek();
}
function itemHabit(h,del){let done=!!h.checks[today()];return `<div class="item"><div class="item-main"><button class="check ${done?'done':''}" onclick="toggleHabit('${h.id}')">${done?'✓':''}</button><div>${escapeHtml(h.name)}</div></div>${del?`<button class="danger" onclick="deleteHabit('${h.id}')">حذف</button>`:''}</div>`}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function renderYear(){
 let y=new Date().getFullYear();let names=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
 $('#yearTable').innerHTML=names.map((n,i)=>{let m=`${y}-${String(i+1).padStart(2,'0')}`;let hs=Object.keys(state.habits.reduce((acc,h)=>({...acc,...h.checks}),{})).filter(d=>monthKey(d)===m);let hr=hs.length?Math.round(hs.reduce((a,d)=>a+habitRateForDate(d),0)/hs.length):0;let ts=state.tasks.filter(t=>monthKey(t.date)===m);let tc=ts.filter(t=>t.done).length;let sv=Object.entries(state.sleep).filter(([d])=>monthKey(d)===m).map(([,v])=>Number(v));let sa=sv.length?(sv.reduce((a,b)=>a+b,0)/sv.length).toFixed(1):'—';let gp=state.goals.length?Math.round(state.goals.reduce((a,g)=>a+goalProgress(g),0)/state.goals.length):0;return `<tr><td>${n}</td><td>${hr}%</td><td>${tc}</td><td>${sa}</td><td>${gp}%</td></tr>`}).join('');
}
function drawWeek(){
 const c=$('#weekChart'),ctx=c.getContext('2d');const dpr=devicePixelRatio||1;const cssW=c.clientWidth||760,cssH=260;c.width=cssW*dpr;c.height=cssH*dpr;ctx.scale(dpr,dpr);
 ctx.clearRect(0,0,cssW,cssH);ctx.strokeStyle='#252c59';ctx.lineWidth=1;for(let i=1;i<5;i++){let y=(cssH-40)*i/5;ctx.beginPath();ctx.moveTo(30,y);ctx.lineTo(cssW-20,y);ctx.stroke()}
 let vals=[];for(let i=6;i>=0;i--){let d=new Date();d.setDate(d.getDate()-i);vals.push({d:d.toISOString().slice(0,10),v:habitRateForDate(d.toISOString().slice(0,10))})}
 let gap=(cssW-70)/7,bw=Math.min(44,gap*.58);vals.forEach((x,i)=>{let h=(cssH-70)*x.v/100;let X=38+i*gap+(gap-bw)/2,Y=cssH-35-h;let grad=ctx.createLinearGradient(0,Y,0,cssH);grad.addColorStop(0,'#7c5cff');grad.addColorStop(1,'#42a5ff');ctx.fillStyle=grad;ctx.fillRect(X,Y,bw,h);ctx.fillStyle='#8f97c0';ctx.font='12px sans-serif';ctx.textAlign='center';ctx.fillText(x.d.slice(8),X+bw/2,cssH-15)})
}
async function syncToGoogle(manual){
 const url=localStorage.getItem('nizamy-api');if(!url){if(manual)$('#syncStatus').textContent='أضف رابط Apps Script أولًا';return}
 try{
  $('#syncStatus').textContent='جارٍ المزامنة...';
  let r=await fetch(url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'save',payload:state})});
  let j=await r.json(); if(!j.ok) throw new Error(j.error||'Sync failed');
  $('#syncStatus').textContent='تمت المزامنة مع Google Sheets ✓';
 }catch(e){$('#syncStatus').textContent='تعذر المزامنة: '+e.message}
}
if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
render();
