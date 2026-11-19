const $=s=>document.querySelector(s);
let state;
let hasSavedProgress=false;
let storageWarningShown=false;
// V6 uses an isolated storage key. On first visit, it copies the V5 progress once
// so testing the development site cannot overwrite the original V5 progress.
const STORAGE_KEY="omanTogether_v6";
const LEGACY_STORAGE_KEY="omanTogether_v1";
try{
 const savedV6=localStorage.getItem(STORAGE_KEY);
 const savedV5=localStorage.getItem(LEGACY_STORAGE_KEY);
 hasSavedProgress=Boolean(savedV6||savedV5);
 state=JSON.parse(savedV6||savedV5||"null")||{};
 if(!savedV6&&savedV5)localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
}catch(e){state={};}
// حافظ على بيانات الإصدارات السابقة وأضف الحقول الجديدة عند الحاجة.
state=Object.assign({points:0,done:[],messages:[],name:"",visitedGov:[],routeDone:[],avatar:"🧭",avatarName:"المستكشف",companionChosen:hasSavedProgress},state);
if(typeof state.companionChosen!=="boolean")state.companionChosen=hasSavedProgress;
state.done=Array.isArray(state.done)?state.done:[];
state.messages=Array.isArray(state.messages)?state.messages:[];
state.visitedGov=Array.isArray(state.visitedGov)?state.visitedGov:[];
state.routeDone=Array.isArray(state.routeDone)?state.routeDone:[];
state.avatar=state.avatar||"🧭";state.avatarName=state.avatarName||"المستكشف";
const save=()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch(e){if(!storageWarningShown){storageWarningShown=true;toast("تعذر حفظ التقدم على هذا المتصفح؛ يمكنك مواصلة الرحلة، لكن قد لا تُحفظ إنجازاتك بعد إغلاق الصفحة.")}}renderProgress()};
const ar=n=>new Intl.NumberFormat("ar").format(n);
const modal=$("#modal"),content=$("#modalContent");
function openModal(html){content.innerHTML=html;const card=modal.querySelector(".modal-card"),welcome=content.querySelector(".companion-welcome");card.classList.toggle("welcome-modal",Boolean(welcome));if(welcome){card.setAttribute("role","dialog");card.setAttribute("aria-modal","true");card.setAttribute("aria-labelledby","companionWelcomeTitle")}else{card.removeAttribute("role");card.removeAttribute("aria-modal");card.removeAttribute("aria-labelledby")}modal.classList.add("show");modal.setAttribute("aria-hidden","false")}
function closeModal(){if(content.querySelector(".companion-welcome")&&!state.companionChosen){state.companionChosen=true;save();renderCompanion()}modal.classList.remove("show");modal.setAttribute("aria-hidden","true")}
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&modal.classList.contains("show"))closeModal()});
$("#closeModal").onclick=closeModal;modal.addEventListener("click",e=>{if(e.target===modal)closeModal()});
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2500)}
function award(key,pts){if(!state.done.includes(key)){state.done.push(key);state.points+=pts;save();toast(`أحسنت! أضيفت ${ar(pts)} نقطة إلى إنجازك.`)}}
function renderProgress(){
 const stationDone=state.done.length,govDone=state.visitedGov.length,routeDone=state.routeDone.length;
 const total=stationDone+govDone+routeDone,maximum=19,percent=Math.round(total/maximum*100);
 $("#points").textContent=ar(state.points);
 $("#progressText").textContent=total?`أنجزت ${ar(total)} من ${ar(maximum)} إنجازًا متاحًا. استمر في رحلتك!`:"رحلتك بانتظار خطوتك الأولى. اختر محطة لتبدأ!";
 $("#progressRing").style.background=`conic-gradient(#d6b36a ${percent}%, transparent 0)`;
 if($("#overallProgressBar"))$("#overallProgressBar").style.width=percent+"%";
 if($("#overallProgressLabel"))$("#overallProgressLabel").textContent=ar(percent)+"٪";
 if($("#stationCount"))$("#stationCount").textContent=`${ar(stationDone)} / ٤`;
 if($("#govCount"))$("#govCount").textContent=`${ar(govDone)} / ١١`;
 if($("#routeCountSmall"))$("#routeCountSmall").textContent=`${ar(routeDone)} / ٤`;
 const items=[["quiz","🧠 متقن المعرفة"],["explore","🧭 مستكشف عُمان"],["code","🔐 حارس الشفرة"],["message","💌 صوت الوطن"]];
 items.push(["allGov","🗺️ رحّالة المحافظات",govDone===11]);items.push(["routeMaster","🏅 مكتمل رحلة المستكشف",routeDone===4]);
 $("#badges").innerHTML=items.map(([k,n,custom])=>{const earned=custom===undefined?state.done.includes(k):custom;return `<span class="badge ${earned?"":"locked"}">${earned?"✦":"🔒"} ${n}</span>`}).join("");
}
const questions=[
 ["ما عاصمة سلطنة عُمان؟",["مسقط","نزوى","صلالة"],0,"مسقط هي عاصمة سلطنة عُمان."],
 ["في أي محافظة تقع مدينة صلالة؟",["الداخلية","ظفار","مسندم"],1,"تقع صلالة في محافظة ظفار."],
 ["بماذا اشتهرت عُمان تاريخيًا؟",["تجارة اللبان","صناعة الحرير","زراعة الأرز"],0,"كان اللبان العُماني من السلع المهمة في طرق التجارة القديمة."],
 ["ما اسم السلسلة الجبلية الشهيرة في شمال عُمان؟",["جبال الأطلس","جبال الألب","جبال الحجر"],2,"جبال الحجر من أبرز السلاسل الجبلية في عُمان."]
];
function quiz(){let i=0,score=0;function show(){if(i>=questions.length){if(score>=3)award("quiz",40);openModal(`<div class="eyebrow dark">نتيجة التحدي</div><h2>أحسنت المشاركة!</h2><p>أجبت إجابة صحيحة عن ${ar(score)} من ${ar(questions.length)} أسئلة.</p><p>${score>=3?"لقد حصلت على شارة متقن المعرفة و٤٠ نقطة.":"واصل الاستكشاف وأعد المحاولة لتحصل على الشارة."}</p><button class="action" onclick="closeModal()">العودة للرحلة</button>`);return}
let q=questions[i];openModal(`<div class="eyebrow dark">اختبر معلوماتك · السؤال ${ar(i+1)} من ${ar(questions.length)}</div><h2>تحدي المعرفة الوطنية</h2><div class="question">${q[0]}</div><div class="answers">${q[1].map((a,n)=>`<button class="answer" data-answer="${n}">${a}</button>`).join("")}</div><div class="feedback" id="feedback"></div>`);content.querySelectorAll("[data-answer]").forEach(b=>b.onclick=()=>{let n=+b.dataset.answer,ok=n===q[2];content.querySelectorAll(".answer").forEach(x=>x.disabled=true);b.classList.add(ok?"correct":"wrong");if(ok)score++;$("#feedback").textContent=(ok?"إجابة صحيحة! ":"ليست الإجابة الصحيحة. ")+q[3];let next=document.createElement("button");next.className="action";next.textContent=i===questions.length-1?"عرض النتيجة":"السؤال التالي";next.onclick=()=>{i++;show()};content.append(next)})}show()}
const places=[["مسقط","العاصمة، وتضم معالم بارزة مثل جامع السلطان قابوس الأكبر."],["ظفار","تشتهر بموسم الخريف والطبيعة الخضراء واللبان."],["الداخلية","تضم نزوى وقلعتها التاريخية والجبل الأخضر."],["مسندم","تتميز بالخلجان البحرية والجبال المطلة على مضيق هرمز."],["شمال الباطنة","تطل على بحر عُمان وتضم صحار ذات التاريخ البحري."],["جنوب الباطنة","تجمع بين السواحل والقرى الجبلية والحصون."],["شمال الشرقية","تشتهر برمال الشرقية وواحاتها."],["جنوب الشرقية","تضم صور ذات الإرث البحري العريق."],["الظاهرة","تضم مواقع تاريخية وطرقًا تجارية قديمة."],["البريمي","محافظة ذات موقع تاريخي وتجاري مميز."],["الوسطى","تتميز بسواحلها الواسعة ومحمياتها الطبيعية."]];
function explore(){openModal(`<div class="eyebrow dark">محطة الاستكشاف</div><h2>اكتشف محافظات عُمان</h2><p>اختر اسم المحافظة، وستظهر لمحتوياتها هنا مباشرة.</p><div class="explore-info" aria-live="polite"><b id="placeInfoTitle">لمحة عن المحافظة</b><p id="placeInfoText">اضغط على اسم أي محافظة لقراءة نبذة عنها دون الحاجة إلى النزول إلى أسفل النافذة.</p></div><div class="answers">${places.map((p,i)=>`<button class="answer" data-place="${i}">📍 ${p[0]}</button>`).join("")}</div><button class="action" id="finishExplore">أنهيت الاستكشاف</button>`);content.querySelectorAll("[data-place]").forEach(b=>b.onclick=()=>{$("#placeInfoTitle").textContent=places[+b.dataset.place][0];$("#placeInfoText").textContent=places[+b.dataset.place][1];content.querySelectorAll("[data-place]").forEach(x=>x.classList.toggle("selected",x===b))});$("#finishExplore").onclick=()=>{award("explore",30);closeModal()}}
function codeGame(){let solved=false;openModal(`<div class="eyebrow dark">محطة الذكاء</div><h2>شفرة الوطن</h2><p>رتّب الحروف التالية لتكتشف كلمة تعبّر عن وطننا: <b>م ـ ع ـ ا ـ ن</b></p><label for="codeAnswer">اكتب الكلمة الصحيحة</label><input class="field" id="codeAnswer" placeholder="اكتب إجابتك هنا"><button class="action" id="checkCode">تحقق من الإجابة</button><div class="feedback" id="codeFeedback"></div>`);$("#checkCode").onclick=()=>{let v=$("#codeAnswer").value.trim().replace(/[أإآ]/g,"ا");if(v==="عمان"||v==="عُمان"){if(!solved){award("code",30);solved=true}$("#codeFeedback").textContent="رائع! الكلمة هي عُمان. لقد فككت الشفرة بنجاح."}else $("#codeFeedback").textContent="حاول مرة أخرى؛ استخدم الحروف الأربعة جميعها."}}
function message(){openModal(`<div class="eyebrow dark">محطة الانتماء</div><h2>رسالة إلى عُمان</h2><p>اكتب أمنية أو فكرة أو وعدًا تقدمه لوطنك. اجعل كلماتك صادقة وإيجابية.</p><label>اسم المشارك (اختياري)</label><input class="field" id="msgName" maxlength="35" placeholder="اسمك الأول أو لقبك"><label>رسالتك</label><textarea class="field" id="msgText" rows="4" maxlength="300" placeholder="إلى عُمان الحبيبة..."></textarea><button class="action" id="saveMessage">احفظ رسالتي على هذا الجهاز</button><div class="feedback" id="msgFeedback"></div><p class="fineprint">تنبيه: في هذه النسخة تُحفظ الرسالة محليًا على جهازك ولا تُرسل إلى المدرسة أو تُنشر للعامة.</p>`);$("#saveMessage").onclick=()=>{let m=$("#msgText").value.trim();if(m.length<8){$("#msgFeedback").textContent="اكتب رسالة من ٨ أحرف على الأقل.";return}state.messages.push({name:$("#msgName").value.trim(),text:m,date:new Date().toISOString()});award("message",20);save();$("#msgFeedback").textContent="شكرًا لك. حُفظت رسالتك على هذا الجهاز.";}}
document.querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>({quiz,explore,code:codeGame,message}[b.dataset.open])());
$("#shareBtn").onclick=async()=>{let data={title:"عُمان تجمعنا",text:"انضم إلى الرحلة الوطنية التفاعلية «عُمان تجمعنا» من مدرسة أم أيمن للبنات.",url:location.href};if(navigator.share){try{await navigator.share(data)}catch(e){}}else{try{await navigator.clipboard.writeText(location.href);toast("تم نسخ رابط المبادرة")}catch(e){toast("انسخ رابط الصفحة من شريط العنوان")}}};
$("#certificateBtn").onclick=()=>{
 const total=state.done.length+state.visitedGov.length+state.routeDone.length;
 if(total<2){toast("أكمل إنجازين على الأقل أولًا للحصول على الشهادة.");return;}
 openModal(`<div class="eyebrow dark">شهادتك الرقمية</div><h2>أضف اسمك إلى الشهادة</h2><p>يمكنك كتابة الاسم أو اللقب الذي ترغب في ظهوره على الشهادة. هذه البيانات تبقى على جهازك.</p><label for="certificateName">الاسم على الشهادة</label><input class="field" id="certificateName" maxlength="45" value="${(state.name||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]))}" placeholder="اكتب الاسم هنا"><button class="action" id="showCertificate">عرض الشهادة</button><div id="certificatePreview"></div>`);
 $("#showCertificate").onclick=()=>{state.name=$("#certificateName").value.trim();save();$("#certificatePreview").innerHTML=`<div class="certificate" id="certificate"><h2>شهادة مشاركة</h2><p>تُمنح هذه الشهادة تقديرًا للمشاركة في المبادرة الوطنية</p><h2>عُمان تجمعنا</h2><div class="recipient">${(state.name||"مشارك / مشاركة مبدع(ة)").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]))}</div><p>تقديرًا للمساهمة في رحلة المعرفة والانتماء والإبداع.</p><small>الإنجازات: ${ar(total)} من ١٩ · النقاط: ${ar(state.points)}</small><p>✦ عُمان تجمعنا دائمًا ✦</p></div><button class="action" id="printCertificate">طباعة / حفظ PDF</button>`;$("#printCertificate").onclick=()=>window.print();};
};
const menuButton=$("#menuBtn"),siteNav=$("#nav");
menuButton.onclick=()=>{const isOpen=siteNav.classList.toggle("open");menuButton.setAttribute("aria-expanded",String(isOpen));menuButton.setAttribute("aria-label",isOpen?"إغلاق القائمة":"فتح القائمة")};
siteNav.querySelectorAll("a").forEach(a=>a.onclick=()=>{siteNav.classList.remove("open");menuButton.setAttribute("aria-expanded","false");menuButton.setAttribute("aria-label","فتح القائمة")});
renderProgress();
// بوابات المحافظات — معلومات موجزة وتحدٍّ قصير لكل محافظة
const governorates=[
{name:"مسقط",icon:"🏛️",tag:"العاصمة",fact:"محافظة مسقط هي عاصمة سلطنة عُمان ومركزها الإداري والاقتصادي، وتضم معالم ثقافية وعمرانية بارزة.",q:"ما المدينة التي تُعد عاصمة سلطنة عُمان؟",a:["مسقط","نزوى","صحار"],correct:0},
{name:"ظفار",icon:"🌿",tag:"الخريف واللبان",fact:"تشتهر محافظة ظفار بموسم الخريف، وتاريخ تجارة اللبان، وتنوع طبيعتها بين السواحل والجبال والسهول.",q:"بماذا تشتهر ظفار في موسم الصيف؟",a:["تساقط الثلوج","موسم الخريف","العواصف الرملية فقط"],correct:1},
{name:"مسندم",icon:"⛰️",tag:"الخلجان البحرية",fact:"تقع محافظة مسندم في أقصى شمال السلطنة، وتشتهر بخلجانها البحرية وجبالها المطلة على مضيق هرمز.",q:"ما الطبيعة التي تشتهر بها مسندم؟",a:["الخلجان والجبال","الكثبان الداخلية فقط","السهول الزراعية"],correct:0},
{name:"البريمي",icon:"🐪",tag:"واحات وتاريخ",fact:"تقع محافظة البريمي في شمال غرب السلطنة، وترتبط بتاريخ من التواصل التجاري والاجتماعي عبر الحدود.",q:"أي وصف يلائم محافظة البريمي؟",a:["محافظة ساحلية جنوبية","واحات وموقع حدودي","جزيرة بحرية"],correct:1},
{name:"الداخلية",icon:"🏰",tag:"القلاع والتراث",fact:"تضم محافظة الداخلية مدينة نزوى وقلعتها الشهيرة، ومواقع تاريخية وقرى جبلية وتراثًا معماريًا غنيًا.",q:"أي مدينة تاريخية تقع في محافظة الداخلية؟",a:["نزوى","صور","خصب"],correct:0},
{name:"شمال الباطنة",icon:"⚓",tag:"الساحل والتجارة",fact:"تمتد محافظة شمال الباطنة على ساحل بحر عُمان، وتضم ولاية صحار ذات الإرث التجاري والبحري المعروف.",q:"أي مدينة معروفة بتاريخها البحري تقع في شمال الباطنة؟",a:["صلالة","صحار","هيما"],correct:1},
{name:"جنوب الباطنة",icon:"🌴",tag:"الساحل والحصون",fact:"تجمع محافظة جنوب الباطنة بين الشريط الساحلي والقرى الزراعية والجبال والحصون التاريخية.",q:"أي مما يلي من ملامح جنوب الباطنة؟",a:["سواحل وحصون","مضيق هرمز","موسم الخريف في ظفار"],correct:0},
{name:"شمال الشرقية",icon:"🏜️",tag:"رمال وواحات",fact:"تشتهر محافظة شمال الشرقية برمال الشرقية الذهبية وواحاتها وامتدادها الصحراوي الجميل.",q:"ما المعلم الطبيعي الذي تشتهر به شمال الشرقية؟",a:["رمال الشرقية","جبل شمس","خور روري"],correct:0},
{name:"جنوب الشرقية",icon:"⛵",tag:"الإرث البحري",fact:"تضم محافظة جنوب الشرقية مدينة صور ذات التاريخ البحري وصناعة السفن التقليدية، إلى جانب شواطئ ومواقع طبيعية.",q:"أي مدينة تشتهر بصناعة السفن التقليدية؟",a:["عبري","صور","الرستاق"],correct:1},
{name:"الظاهرة",icon:"🧭",tag:"طرق تاريخية",fact:"تقع محافظة الظاهرة في غرب السلطنة، وتضم مواقع أثرية وطرقًا تاريخية ارتبطت بالتجارة والتنقل.",q:"في أي جهة عامة تقع محافظة الظاهرة؟",a:["غرب السلطنة","أقصى الشرق الساحلي","جنوب مسندم"],correct:0},
{name:"الوسطى",icon:"🐬",tag:"سواحل ومحميات",fact:"تتميز محافظة الوسطى بسواحل واسعة وبيئات طبيعية متنوعة، وتضم مواقع ذات أهمية للحياة الفطرية.",q:"ما أحد ملامح محافظة الوسطى؟",a:["سواحل ومحميات طبيعية","موسم الخريف","الخلجان الشمالية"],correct:0}
];
function renderGovernorates(){
 const board=$("#governorateBoard");if(!board)return;
 board.innerHTML=governorates.map((g,i)=>`<button class="governorate ${state.visitedGov?.includes(i)?"visited":""}" data-gov="${i}"><span class="gov-symbol">${g.icon}</span><strong>${g.name}</strong><small>${g.tag}</small></button>`).join("");
 board.querySelectorAll("[data-gov]").forEach(b=>b.onclick=()=>openGovernorate(+b.dataset.gov));
 const count=state.visitedGov?.length||0;$("#visitedCount").textContent=ar(count);$("#mapProgress").style.width=(count/governorates.length*100)+"%";renderProgress();
}
// مشاهد مصغّرة مرسومة بـ CSS: خفيفة وسريعة، وتمنح كل محافظة هوية بصرية مستقلة.
const governorateScenes=[
 {scene:"muscat",landmark:"🏙️",caption:"العاصمة · البحر والمدينة",place:"مسقط"},
 {scene:"dhofar",landmark:"🌿",caption:"الخريف · الجبال الخضراء",place:"ظفار"},
 {scene:"musandam",landmark:"⛰️",caption:"الخلجان · الجبال البحرية",place:"مسندم"},
 {scene:"buraimi",landmark:"🌴",caption:"الواحات · طرق التواصل",place:"البريمي"},
 {scene:"dakhiliyah",landmark:"🏰",caption:"نزوى · القلاع والتراث",place:"الداخلية"},
 {scene:"north-batinah",landmark:"⚓",caption:"صحار · الساحل والتجارة",place:"شمال الباطنة"},
 {scene:"south-batinah",landmark:"🌴",caption:"الحصون · الواحات الساحلية",place:"جنوب الباطنة"},
 {scene:"north-sharqiyah",landmark:"🏜️",caption:"رمال الشرقية · الواحات",place:"شمال الشرقية"},
 {scene:"south-sharqiyah",landmark:"⛵",caption:"صور · الإرث البحري",place:"جنوب الشرقية"},
 {scene:"dhahirah",landmark:"🧭",caption:"المواقع الأثرية · الطرق التاريخية",place:"الظاهرة"},
 {scene:"al-wusta",landmark:"🐬",caption:"السواحل · الحياة الفطرية",place:"الوسطى"}
];
function openGovernorate(i){
 const g=governorates[i],v=governorateScenes[i];state.visitedGov=state.visitedGov||[];
 const alreadyVisited=state.visitedGov.includes(i);
 openModal(`<div class="eyebrow dark">مغامرة المحافظة ${ar(i+1)} من ١١</div><div class="gov-modal-title"><div><h2>${g.icon} ${g.name}</h2><p>ابدأ بالتعرّف على المحافظة، ثم اختبر معرفتك.</p></div><span class="gov-reward ${alreadyVisited?"earned":""}">${alreadyVisited?"✓ زرتها":"+١٠ نقاط"}</span></div><div class="gov-fact gov-fact-featured"><b>✦ لمحة عن المحافظة</b><span>${g.fact}</span></div><div class="gov-scene-art scene-${v.scene}" role="img" aria-label="مشهد توضيحي مستوحى من محافظة ${g.name}"><span class="scene-sun" aria-hidden="true"></span><span class="scene-ridge ridge-back" aria-hidden="true"></span><span class="scene-ridge ridge-front" aria-hidden="true"></span><span class="scene-landmark" aria-hidden="true">${v.landmark}</span><span class="scene-ribbon">${g.tag}</span><span class="scene-caption">${v.caption}</span></div><div class="gov-challenge"><div class="challenge-kicker">تحدي المحافظة</div><b>${g.q}</b>${g.a.map((a,n)=>`<button data-gov-answer="${n}" ${alreadyVisited?"disabled":""}>${a}</button>`).join("")}<div class="feedback" id="govFeedback">${alreadyVisited?"أكملت تحدي هذه المحافظة من قبل. يمكنك العودة لاكتشاف معلوماتها.":"أجب إجابة صحيحة لتحصل على ١٠ نقاط عند زيارتك الأولى."}</div></div>`);
 content.querySelectorAll("[data-gov-answer]").forEach(btn=>btn.onclick=()=>{
   if(btn.disabled)return;
   const ok=+btn.dataset.govAnswer===g.correct;
   content.querySelectorAll("[data-gov-answer]").forEach(x=>x.disabled=true);
   btn.classList.add(ok?"right":"wrong");
   if(ok){if(!state.visitedGov.includes(i)){state.visitedGov.push(i);state.points+=10;save();renderGovernorates();renderTreasureBag();}$("#govFeedback").textContent="أحسنت! اكتملت مغامرتك في هذه المحافظة، وأُضيفت ١٠ نقاط إلى رصيدك."}
   else $("#govFeedback").textContent="ليست الإجابة الصحيحة. راجع حكاية المكان، ثم عد إلى التحدي في زيارة لاحقة.";
 });
}
renderGovernorates();

// رحلة المستكشف — إضافة الإصدار الثالث مع الحفاظ على إنجازات الإصدار السابق
state.routeDone=Array.isArray(state.routeDone)?state.routeDone:[];
const routeStops=[
 {title:"قلعة نزوى",place:"محافظة الداخلية",symbol:"🏰",scene:"fort",intro:"تقف قلعة نزوى شاهدةً على جانب مهم من التاريخ العُماني، وتجاورها أسواق تقليدية عريقة.",question:"في أي محافظة تقع قلعة نزوى؟",answers:["الداخلية","ظفار","مسندم"],correct:0,success:"أحسنت! نزوى من أبرز الحواضر التاريخية في محافظة الداخلية."},
 {title:"طبيعة ظفار",place:"محافظة ظفار",symbol:"🌿",scene:"khareef",intro:"تتحول أجزاء من ظفار في موسم الخريف إلى مشاهد خضراء، وتشتهر المحافظة كذلك بتاريخ اللبان العُماني.",question:"ما الموسم الذي تشتهر به ظفار؟",answers:["الربيع القطبي","الخريف","موسم الثلوج"],correct:1,success:"رائع! موسم الخريف يمنح ظفار طابعها الطبيعي المميز."},
 {title:"مراكب صور",place:"محافظة جنوب الشرقية",symbol:"⛵",scene:"dhow",intro:"ارتبطت مدينة صور بالملاحة وصناعة السفن الخشبية التقليدية، وبحكايات البحارة والتجارة البحرية.",question:"بماذا اشتهرت مدينة صور تاريخيًا؟",answers:["صناعة السفن التقليدية","زراعة البن فقط","تعدين الذهب"],correct:0,success:"إجابة موفقة! لصور إرث بحري عريق."},
 {title:"جبال مسندم",place:"محافظة مسندم",symbol:"⛰️",scene:"musandam",intro:"تشتهر مسندم بجبالها الشاهقة وخلجانها البحرية المتعرجة المطلة على مضيق هرمز.",question:"أي مظهر طبيعي يميز مسندم؟",answers:["الكثبان الرملية وحدها","الخلجان والجبال","الغابات الاستوائية"],correct:1,success:"ممتاز! خلجان مسندم وجبالها من أبرز ملامحها الطبيعية."}
];
function renderExplorerRoute(){
 const track=$("#routeTrack");if(!track)return;
 track.innerHTML=routeStops.map((stop,i)=>{const done=state.routeDone.includes(i);const unlocked=i===0||state.routeDone.includes(i-1);return `<article class="route-stop ${done?"is-done":""} ${unlocked?"is-open":"is-locked"}"><div class="route-scene ${stop.scene}"><span>${stop.symbol}</span><small>${done?"✓ أُنجزت":unlocked?"محطة متاحة":"🔒 مغلقة"}</small></div><div class="route-stop-copy"><span class="route-index">المحطة ${ar(i+1)} من ٤</span><h3>${stop.title}</h3><p>${stop.place}</p><button class="route-start" data-route="${i}" ${unlocked?"":"disabled"}>${done?"أعد قراءة المحطة":"ابدأ الاستكشاف"} <b>←</b></button></div></article>`}).join("");
 track.querySelectorAll("[data-route]").forEach(btn=>btn.onclick=()=>openRouteStop(+btn.dataset.route));
 const count=state.routeDone.length;$("#routeCount").textContent=`${ar(count)} / ٤`;$("#routeProgress").style.width=(count/routeStops.length*100)+"%";renderProgress();
}
function openRouteStop(i){
 const stop=routeStops[i],done=state.routeDone.includes(i);
 openModal(`<div class="eyebrow dark">رحلة المستكشف · ${ar(i+1)} / ٤</div><div class="route-modal-art ${stop.scene}"><span>${stop.symbol}</span></div><h2>${stop.title}</h2><p class="route-place">${stop.place}</p><div class="gov-fact">${stop.intro}</div><div class="gov-challenge"><b>تحدي المحطة: ${stop.question}</b>${stop.answers.map((a,n)=>`<button data-route-answer="${n}" ${done?"disabled":""}>${a}</button>`).join("")}<div class="feedback" id="routeFeedback">${done?"لقد أكملت هذه المحطة من قبل. يمكنك العودة لقراءة معلوماتها.":"اختر الإجابة الصحيحة لفتح المحطة التالية."}</div></div><button class="action" id="routeClose">العودة إلى مسار الرحلة</button>`);
 $("#routeClose").onclick=closeModal;
 content.querySelectorAll("[data-route-answer]").forEach(btn=>btn.onclick=()=>{if(btn.disabled)return;const ok=+btn.dataset.routeAnswer===stop.correct;content.querySelectorAll("[data-route-answer]").forEach(x=>x.disabled=true);btn.classList.add(ok?"right":"wrong");if(ok){if(!state.routeDone.includes(i)){state.routeDone.push(i);state.points+=15;save();renderExplorerRoute();toast("أُنجزت المحطة! أضيفت ١٥ نقطة.")}$("#routeFeedback").textContent=stop.success+(i<routeStops.length-1?" أصبحت المحطة التالية متاحة الآن.":" لقد أكملت رحلة المستكشف!");}else{$("#routeFeedback").textContent="ليست الإجابة الصحيحة. راجع المعلومة وحاول مرة أخرى في زيارة جديدة.";}});
}
renderExplorerRoute();


// حقيبة كنوز عُمان: مقتنيات مرئية تُفتح بالإنجازات الحالية دون تغيير النقاط أو حذف البيانات.
const treasureItems=[
 {key:"gov0",icon:"🏛️",name:"بوابة مسقط",kind:"gov",index:0},{key:"gov1",icon:"🌿",name:"نسيم ظفار",kind:"gov",index:1},{key:"gov2",icon:"⛰️",name:"خلجان مسندم",kind:"gov",index:2},{key:"gov3",icon:"🌴",name:"واحة البريمي",kind:"gov",index:3},{key:"gov4",icon:"🏰",name:"قلعة الداخلية",kind:"gov",index:4},{key:"gov5",icon:"⚓",name:"مرسى شمال الباطنة",kind:"gov",index:5},{key:"gov6",icon:"🌴",name:"حصون جنوب الباطنة",kind:"gov",index:6},{key:"gov7",icon:"🏜️",name:"رمال شمال الشرقية",kind:"gov",index:7},{key:"gov8",icon:"⛵",name:"شراع جنوب الشرقية",kind:"gov",index:8},{key:"gov9",icon:"🧭",name:"دروب الظاهرة",kind:"gov",index:9},{key:"gov10",icon:"🐬",name:"سواحل الوسطى",kind:"gov",index:10},
 {key:"route0",icon:"🗝️",name:"مفتاح نزوى",kind:"route",index:0},{key:"route1",icon:"🍃",name:"ورقة الخريف",kind:"route",index:1},{key:"route2",icon:"⛵",name:"شراع صور",kind:"route",index:2},{key:"route3",icon:"💎",name:"جوهرة مسندم",kind:"route",index:3}
];
const treasureStories={
 gov0:"بوابة مسقط: تذكار يرمز إلى العاصمة العُمانية، حيث يلتقي عبق التاريخ بحيوية الحاضر.",
 gov1:"نسيم ظفار: يرمز إلى خريف ظفار وأجوائها الموسمية وطبيعتها الخضراء.",
 gov2:"خلجان مسندم: تذكار مستوحى من الخلجان البحرية والجبال المطلة على مضيق هرمز.",
 gov3:"واحة البريمي: ترمز إلى الواحات وطرق التواصل التاريخية في شمال غرب عُمان.",
 gov4:"قلعة الداخلية: تذكار يستحضر القلاع والحصون والحواضر التاريخية في المحافظة.",
 gov5:"مرسى شمال الباطنة: تذكار من ساحل شمال الباطنة وصحار ذات الإرث التجاري والبحري العريق.",
 gov6:"حصون جنوب الباطنة: تذكار يستحضر الحصون التاريخية والقرى الزراعية والساحل.",
 gov7:"رمال شمال الشرقية: تذكار يستحضر رمال الشرقية الذهبية وواحات شمال الشرقية.",
 gov8:"شراع جنوب الشرقية: رمز للإرث البحري وصناعة السفن الخشبية التقليدية في صور.",
 gov9:"دروب الظاهرة: تذكار يرمز إلى المواقع الأثرية والطرق التاريخية في المحافظة.",
 gov10:"كنز الوسطى: يرمز إلى سواحل الوسطى وتنوع بيئاتها الطبيعية وحياتها الفطرية.",
 route0:"مفتاح نزوى: رمز لاكتشاف أبواب التاريخ في قلعة نزوى وأسواقها العريقة.",
 route1:"ورقة الخريف: تذكار من رحلة الطبيعة في ظفار خلال موسم الخريف.",
 route2:"شراع صور: يستحضر مهارة البحارة وصُنّاع السفن في المدينة الساحلية.",
 route3:"جوهرة مسندم: رمز لجمال الجبال والخلجان البحرية في أقصى شمال عُمان."
};
let treasureFilter="all";
function renderTreasureBag(){
 const grid=$("#treasureGrid");if(!grid)return;
 const collected=treasureItems.filter(x=>x.kind==="gov"?state.visitedGov.includes(x.index):state.routeDone.includes(x.index));
 const count=collected.length,govCount=state.visitedGov.length,routeCount=state.routeDone.length;
 $("#treasureCount").textContent=`${ar(count)} / ١٥`;
 if($("#treasureProgress"))$("#treasureProgress").style.width=(count/15*100)+"%";
 if($("#treasureProgressLabel"))$("#treasureProgressLabel").textContent=`اكتملت ${ar(count)} من ١٥ مقتنى`;
 if($("#treasureCompletion"))$("#treasureCompletion").textContent=govCount===11&&routeCount===4?"اكتملت المجموعة كاملة! أنت مستكشف عُمان بكل جدارة.":govCount===11?"جمعت كنوز المحافظات الإحدى عشرة! بقيت محطات رحلة المستكشف.":`كنوز المحافظات: ${ar(govCount)} من ١١ · كنوز رحلة المستكشف: ${ar(routeCount)} من ٤`;
 const shown=treasureItems.filter(x=>treasureFilter==="all"||(treasureFilter==="gov"&&x.kind==="gov")||(treasureFilter==="route"&&x.kind==="route"));
 grid.innerHTML=shown.map(x=>{const unlocked=x.kind==="gov"?state.visitedGov.includes(x.index):state.routeDone.includes(x.index);return `<button type="button" class="treasure-item ${unlocked?"unlocked":"locked"}" data-treasure-key="${x.key}" aria-label="${unlocked?x.name:"كنز مقفل: "+x.name}"><span>${unlocked?x.icon:"🔒"}</span><small>${x.name}</small><em>${unlocked?"اضغط لقراءة الحكاية":"لم يُكتشف بعد"}</em></button>`}).join("");
 document.querySelectorAll("[data-treasure-filter]").forEach(b=>{b.classList.toggle("active",b.dataset.treasureFilter===treasureFilter);b.setAttribute("aria-pressed",b.dataset.treasureFilter===treasureFilter?"true":"false");b.onclick=()=>{treasureFilter=b.dataset.treasureFilter;renderTreasureBag()}});
 grid.querySelectorAll("[data-treasure-key]").forEach(b=>b.onclick=()=>{const item=treasureItems.find(x=>x.key===b.dataset.treasureKey);const unlocked=item&&(item.kind==="gov"?state.visitedGov.includes(item.index):state.routeDone.includes(item.index));if(!unlocked){toast("هذا الكنز ينتظرك! أكمل التحدي المرتبط به لاكتشافه.");return;}openModal(`<div class="eyebrow dark">من مقتنيات رحلتك</div><div class="treasure-story-icon">${item.icon}</div><div class="gov-modal-title"><div><h2>${item.name}</h2><p>كنز محفوظ في حقيبتك</p></div><span class="gov-reward earned">✓ مكتسب</span></div><div class="gov-fact">${treasureStories[item.key]||"تذكار من رحلتك في عُمان."}</div><p class="treasure-story-note">هذا المقتنى محفوظ على جهازك، ويمكنك العودة إليه في أي وقت.</p>`);});
 if(count===15&&!state.treasureCelebrated){
  state.treasureCelebrated=true;save();
  setTimeout(()=>{openModal('<div class="treasure-complete-mark">🏆</div><div class="eyebrow dark">إنجاز وطني مكتمل</div><h2>اكتملت حقيبة كنوز عُمان!</h2><p>جمعت الكنوز الخمسة عشر: أحد عشر تذكارًا من المحافظات وأربعة من رحلة المستكشف. أصبحت رحلتك مجموعة من الحكايات والمعرفة.</p><button class="action" id="treasureCompleteClose">أواصل رحلتي</button>');const close=$("#treasureCompleteClose");if(close)close.onclick=closeModal;},350);
 }

}
function renderCompanion(){
 if($("#companionAvatar"))$("#companionAvatar").textContent=state.avatar;
 if($("#companionName"))$("#companionName").textContent=state.avatarName;
 document.querySelectorAll(".companion-choice").forEach(b=>b.classList.toggle("selected",b.dataset.avatar===state.avatar));
 const oldCharacter=document.querySelector(".character-person");if(oldCharacter)oldCharacter.textContent=state.avatar;
}
document.querySelectorAll(".companion-choice").forEach(b=>b.addEventListener("click",()=>{state.avatar=b.dataset.avatar;state.avatarName=b.dataset.name;state.companionChosen=true;save();renderCompanion();toast(`أصبح ${state.avatarName} رفيق رحلتك!`)}));
renderTreasureBag();renderCompanion();
// تحديث الحقيبة مباشرة بعد أي زيارة لمحافظة أو إكمال محطة مستكشف.
const originalRenderGovernorates=renderGovernorates;
renderGovernorates=function(){originalRenderGovernorates();renderTreasureBag()};
const originalRenderExplorerRoute=renderExplorerRoute;
renderExplorerRoute=function(){originalRenderExplorerRoute();renderTreasureBag()};
renderTreasureBag();


// V6: خريطة جغرافية تفاعلية بمواقع تمثيلية للمحافظات الإحدى عشرة.
// الإحداثيات المرجعية من مجموعة Open Admin Data (CC BY 4.0)، وليست مضلعات حدود إدارية.
function initOmanGeographicMap(){
 const el=document.getElementById("realOmanMap");
 if(!el)return;
 if(!window.L){el.innerHTML='<div class="map-load-fallback">تعذر تحميل الخريطة الآن. يمكنك اختيار المحافظة من البطاقات أدناه.</div>';return;}
 const points=[
  [23.25,58.76],      // مسقط
  [18.86,54.557],     // ظفار
  [25.997,56.298],    // مسندم
  [24.292,56.045],    // البريمي
  [22.388,57.224],    // الداخلية
  [24.235,56.574],    // شمال الباطنة
  [23.483,57.649],    // جنوب الباطنة
  [21.722,58.547],    // شمال الشرقية
  [22.116,59.521],    // جنوب الشرقية
  [23.005,55.988],    // الظاهرة
  [20.476,56.904]     // الوسطى
 ];
 const map=L.map(el,{scrollWheelZoom:false,zoomControl:true}).setView([22.1,57.1],5.5);
 L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
  maxZoom:18,
  attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
 }).addTo(map);
 const bounds=[];
 governorates.forEach((g,i)=>{
  const point=points[i];bounds.push(point);
  const icon=L.divIcon({className:'oman-gov-marker-wrap',html:`<div class="oman-gov-marker"><span>${g.icon}</span></div>`,iconSize:[36,36],iconAnchor:[18,32]});
  const marker=L.marker(point,{icon,keyboard:true,title:g.name,alt:g.name}).addTo(map);
  marker.bindTooltip(g.name,{permanent:true,direction:'top',offset:[0,-23],className:'oman-map-label'});
  marker.on('click',()=>openGovernorate(i));
 });
 map.fitBounds(bounds,{padding:[35,35]});
 setTimeout(()=>map.invalidateSize(),250);
 window.addEventListener('resize',()=>map.invalidateSize());
}
initOmanGeographicMap();


// عداد الزيارات العام: يزيد مرة واحدة لكل جلسة تبويب، ويقرأ القيمة دون زيادتها عند التحديث.
(function initPublicVisitCounter(){
 const output=document.getElementById("visitorCount");
 if(!output)return;
 const key="oman_tajmauna_v6_oman_together_total_visits_2026";
 const base="https://countapi.mileshilliard.com/api/v1/";
 let counted=false;
 try{counted=sessionStorage.getItem("omanTogetherVisitCounted")==="1"}catch(e){}
 const endpoint=base+(counted?"get/":"hit/")+key;
 fetch(endpoint,{cache:"no-store"})
  .then(response=>{if(!response.ok)throw new Error("counter unavailable");return response.json()})
  .then(data=>{
   const value=Number(data.value);
   if(!Number.isFinite(value))throw new Error("invalid counter value");
   output.textContent=new Intl.NumberFormat("ar").format(value);
   if(!counted){try{sessionStorage.setItem("omanTogetherVisitCounted","1")}catch(e){}}
  })
  .catch(()=>{output.textContent="—";output.title="تعذر تحميل عداد الزيارات مؤقتًا"});
})();


// نافذة ترحيبية لاختيار رفيق الرحلة عند أول زيارة فقط.
(function initCompanionWelcome(){
 if(state.companionChosen)return;
 const choices=[
  {avatar:"🧭",name:"المستكشف",desc:"يعشق اكتشاف الأماكن",tag:"محب المغامرة"},
  {avatar:"🦅",name:"الصقر",desc:"يراقب التفاصيل من بعيد",tag:"عينٌ لا تفوتها التفاصيل"},
  {avatar:"🤖",name:"الروبوت",desc:"يحل الألغاز والتحديات",tag:"خبير التحديات"}
 ];
 const cards=choices.map((c,i)=>`<button type="button" class="welcome-companion-choice ${state.avatar===c.avatar?"selected":""}" data-welcome-avatar="${i}"><span class="welcome-companion-icon">${c.avatar}</span><b>${c.name}</b><small>${c.desc}</small><em>${c.tag}</em></button>`).join("");
 openModal(`<div class="companion-welcome"><span class="welcome-sparkle" aria-hidden="true">✦</span><div class="eyebrow dark">أهلًا بك في عُمان تجمعنا</div><h2 id="companionWelcomeTitle">اختر رفيق رحلتك</h2><p>لكل رحلة حكاية، ومع رفيقك تبدأ المغامرة. من تختار ليكتشف عُمان معك؟</p><div class="welcome-companion-grid">${cards}</div><div class="welcome-footnote">يمكنك تغيير رفيقك لاحقًا من قسم «رفيق الرحلة».</div></div>`);
 content.querySelectorAll("[data-welcome-avatar]").forEach(button=>button.addEventListener("click",()=>{
  const choice=choices[Number(button.dataset.welcomeAvatar)];
  if(!choice)return;
  state.avatar=choice.avatar;state.avatarName=choice.name;state.companionChosen=true;
  save();renderCompanion();closeModal();toast(`أصبح ${state.avatarName} رفيق رحلتك! هيا نكتشف عُمان.`);
 }));
 const firstChoice=content.querySelector("[data-welcome-avatar]");if(firstChoice)firstChoice.focus();
})();
