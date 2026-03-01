import { useState, useEffect } from "react";

// ─── STORAGE HELPERS ──────────────────────────────────────────────────────────
const store = {
  async get(key) {
    try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : null; } catch { return null; }
  },
  async set(key, val) {
    try { await window.storage.set(key, JSON.stringify(val)); return true; } catch { return false; }
  },
  async list(prefix) {
    try { const r = await window.storage.list(prefix); return r?.keys || []; } catch { return []; }
  }
};

const pad = (n) => String(n).padStart(2, "0");
const todayKey = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; };
const dateFromSlug = (slug) => slug ? `2026-${slug.slice(0,2)}-${slug.slice(2,4)}` : todayKey();

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
const buildQuestions = (words) => words.map((w, i) => {
  const others = words.filter((_, j) => j !== i);
  if (i % 2 === 0) {
    return { word: w.english, question: `What is the Myanmar meaning of "${w.english}"?`, correct_answer: w.myanmar, options: shuffle([w.myanmar, ...others.slice(0,3).map(o => o.myanmar)]) };
  } else {
    return { word: w.myanmar, question: `Which English word means "${w.myanmar}"?`, correct_answer: w.english, options: shuffle([w.english, ...others.slice(0,3).map(o => o.english)]) };
  }
});

const seedDemo = async () => {
  const existing = await store.get("students:STU-001");
  if (existing) return;
  await store.set("students:STU-001", { id: "STU-001", name: "Mg Paing Phyo Zaw", parent_name: "U Bla Bla", parent_password: "parent123" });
  await store.set("students:STU-002", { id: "STU-002", name: "Ma Su Su", parent_name: "Daw Khin", parent_password: "mypass456" });
  const words = [
    { english: "Benevolent", myanmar: "ကြင်နာတတ်သော" },
    { english: "Eloquent",   myanmar: "ဝါကျကောင်းသော" },
    { english: "Resilient",  myanmar: "ခိုင်မာသော" },
    { english: "Profound",   myanmar: "နက်နဲသော" },
    { english: "Tenacious",  myanmar: "အကြပ်အတည်းရောက်တတ်သော" },
  ];
  await store.set("words:2026-03-01", words);
  await store.set("quiz:2026-03-01", buildQuestions(words));
};

// ─── DESIGN ───────────────────────────────────────────────────────────────────
const C = { bg:"#0B0D14", card:"#131624", border:"#1E2235", accent:"#7C5CFC", accentLt:"#A78BFA", emerald:"#10B981", gold:"#F59E0B", text:"#F1F5F9", sub:"#64748B", danger:"#EF4444" };

const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{background:${C.bg};color:${C.text};font-family:'DM Sans',sans-serif;min-height:100vh;}
h1,h2,h3{font-family:'Syne',sans-serif;}
.card{background:${C.card};border:1px solid ${C.border};border-radius:20px;padding:24px;}
.input{width:100%;padding:12px 16px;background:#0B0D14;border:1.5px solid ${C.border};border-radius:12px;color:${C.text};font-size:14px;font-family:'DM Sans',sans-serif;outline:none;transition:border-color .2s;}
.input:focus{border-color:${C.accent};}
.input::placeholder{color:${C.sub};}
label{font-size:11px;font-weight:600;color:${C.sub};display:block;margin-bottom:5px;text-transform:uppercase;letter-spacing:.6px;}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 22px;border-radius:12px;font-weight:600;font-size:14px;cursor:pointer;border:none;transition:all .18s;font-family:'DM Sans',sans-serif;}
.btn:disabled{opacity:.45;cursor:not-allowed;}
.btn-p{background:${C.accent};color:#fff;} .btn-p:hover:not(:disabled){background:#6B4CE0;transform:translateY(-1px);}
.btn-g{background:${C.emerald};color:#fff;} .btn-g:hover:not(:disabled){background:#059669;transform:translateY(-1px);}
.btn-gh{background:${C.border};color:${C.text};} .btn-gh:hover:not(:disabled){background:#2A2D3E;}
.badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:700;}
.bp{background:rgba(124,92,252,.18);color:${C.accentLt};}
.be{background:rgba(16,185,129,.15);color:${C.emerald};}
.bgo{background:rgba(245,158,11,.13);color:${C.gold};}
.opt{width:100%;text-align:left;padding:13px 17px;background:#0B0D14;border:1.5px solid ${C.border};border-radius:13px;color:${C.text};font-size:14px;cursor:pointer;transition:all .15s;font-family:'DM Sans',sans-serif;}
.opt:hover:not(:disabled){border-color:${C.accent};background:rgba(124,92,252,.08);}
.opt.sel{border-color:${C.accent};background:rgba(124,92,252,.15);}
.opt.ok{border-color:${C.emerald};background:rgba(16,185,129,.12);color:${C.emerald};font-weight:600;}
.opt.bad{border-color:${C.danger};background:rgba(239,68,68,.1);color:${C.danger};}
.tab{padding:8px 18px;border-radius:10px;cursor:pointer;font-size:13px;font-weight:600;transition:all .18s;color:${C.sub};border:none;background:none;font-family:'DM Sans',sans-serif;}
.tab.on{background:${C.accent};color:#fff;}
.tab:hover:not(.on){color:${C.text};background:${C.border};}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
.au{animation:fadeUp .35s ease forwards;}
@keyframes spin{to{transform:rotate(360deg)}}
.spin{animation:spin .8s linear infinite;display:inline-block;}
.toast{position:fixed;top:18px;right:18px;padding:12px 20px;border-radius:12px;font-size:13px;font-weight:600;z-index:999;box-shadow:0 4px 24px rgba(0,0,0,.4);animation:fadeUp .3s ease;}
::-webkit-scrollbar{width:5px;} ::-webkit-scrollbar-track{background:${C.card};} ::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px;}
`;

const Ring = ({ pct, size=110, color=C.accent, label, sub }) => {
  const r=(size-14)/2, c=2*Math.PI*r;
  return (
    <div style={{position:"relative",width:size,height:size,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)",position:"absolute"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1A1D2E" strokeWidth={7}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={7}
          strokeDasharray={c} strokeDashoffset={c-(pct/100)*c} strokeLinecap="round"
          style={{transition:"stroke-dashoffset 1.1s cubic-bezier(.1,.5,.5,1)"}}/>
      </svg>
      <div style={{textAlign:"center",zIndex:1}}>
        <div style={{fontSize:16,fontWeight:800,color,fontFamily:"'Syne',sans-serif"}}>{label??`${pct}%`}</div>
        {sub&&<div style={{fontSize:10,color:C.sub,marginTop:1}}>{sub}</div>}
      </div>
    </div>
  );
};

const ErrBox = ({msg}) => msg ? <div style={{background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.3)",borderRadius:10,padding:"10px 14px",color:C.danger,fontSize:13,marginBottom:14}}>{msg}</div> : null;

// ─── NAV ──────────────────────────────────────────────────────────────────────
const Nav = ({view,go}) => {
  const slug=(()=>{const d=new Date();return `${pad(d.getMonth()+1)}${pad(d.getDate())}`;})();
  return (
    <nav style={{background:C.card,borderBottom:`1px solid ${C.border}`,padding:"11px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:10}}>
      <button onClick={()=>go("home")} style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:19,color:C.text,background:"none",border:"none",cursor:"pointer"}}>
        Word<span style={{color:C.accent}}>Smart</span>
      </button>
      <div style={{display:"flex",gap:4}}>
        {[["quiz/"+slug,"✏️ Quiz"],["profile","👨‍👩‍👧"],["admin","⚙️"]].map(([v,label])=>(
          <button key={v} className={`tab ${view.startsWith(v.split("/")[0])?"on":""}`} onClick={()=>go(v)}>{label}</button>
        ))}
      </div>
    </nav>
  );
};

// ─── HOME ─────────────────────────────────────────────────────────────────────
const Home = ({go}) => {
  const slug=(()=>{const d=new Date();return `${pad(d.getMonth()+1)}${pad(d.getDate())}`;})();
  return (
    <div style={{maxWidth:480,margin:"0 auto",padding:"48px 18px"}} className="au">
      <div style={{textAlign:"center",marginBottom:44}}>
        <div style={{fontSize:52}}>📚</div>
        <h1 style={{fontSize:32,fontWeight:800,marginTop:10}}>Word<span style={{color:C.accent}}>Smart</span></h1>
        <p style={{color:C.sub,fontSize:14,marginTop:6}}>Myanmar · English Daily Word Learning</p>
      </div>
      {[
        {icon:"✏️",title:"Today's Quiz",desc:"Answer 5 word questions",view:"quiz/"+slug,col:C.accent},
        {icon:"👨‍👩‍👧",title:"Parent Portal",desc:"Check your child's scores & progress",view:"profile",col:C.emerald},
        {icon:"⚙️",title:"Admin Panel",desc:"Publish words & manage students",view:"admin",col:C.gold},
      ].map(item=>(
        <div key={item.view} className="card" onClick={()=>go(item.view)}
          style={{cursor:"pointer",marginBottom:12,border:`1px solid ${item.col}28`,transition:"transform .15s,border-color .15s"}}
          onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.borderColor=item.col+"60";}}
          onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.borderColor=item.col+"28";}}>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <div style={{width:50,height:50,borderRadius:14,background:item.col+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{item.icon}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:16}}>{item.title}</div>
              <div style={{color:C.sub,fontSize:13,marginTop:2}}>{item.desc}</div>
            </div>
            <span style={{color:C.sub}}>›</span>
          </div>
        </div>
      ))}
      <div style={{textAlign:"center",marginTop:26,color:C.sub,fontSize:12}}>
        Quiz URL: <span style={{color:C.accentLt,fontFamily:"monospace"}}>quiz/MMDD</span> · Today: <span style={{color:C.accentLt,fontFamily:"monospace"}}>quiz/{slug}</span>
      </div>
    </div>
  );
};

// ─── QUIZ ─────────────────────────────────────────────────────────────────────
const Quiz = ({slug,go}) => {
  const dateKey = dateFromSlug(slug);
  const [phase,setPhase] = useState("id");
  const [sid,setSid] = useState("");
  const [student,setStudent] = useState(null);
  const [questions,setQuestions] = useState([]);
  const [answers,setAnswers] = useState({});
  const [qi,setQi] = useState(0);
  const [revealed,setRevealed] = useState(false);
  const [score,setScore] = useState(0);
  const [err,setErr] = useState("");
  const [busy,setBusy] = useState(false);
  const [already,setAlready] = useState(false);

  const mm=slug?.slice(0,2), dd=slug?.slice(2,4);

  const start = async () => {
    setBusy(true); setErr("");
    const s = await store.get(`students:${sid}`);
    if (!s) { setErr("Student ID not found. Ask your teacher to add you first."); setBusy(false); return; }
    const prev = await store.get(`sub:${sid}:${dateKey}`);
    if (prev) { setScore(prev.score); setStudent(s); setAlready(true); setPhase("done"); setBusy(false); return; }
    const qs = await store.get(`quiz:${dateKey}`);
    if (!qs) { setErr("No quiz found for this date. Ask your teacher to publish words first."); setBusy(false); return; }
    setStudent(s); setQuestions(qs); setPhase("quiz"); setBusy(false);
  };

  const pick = (opt) => { if (revealed) return; setAnswers(p=>({...p,[qi]:opt})); };

  const next = async () => {
    setRevealed(false);
    if (qi+1 < questions.length) { setQi(q=>q+1); return; }
    setBusy(true);
    let s=0; questions.forEach((q,i)=>{ if(answers[i]===q.correct_answer) s++; });
    setScore(s);
    await store.set(`sub:${sid}:${dateKey}`,{score:s,total:questions.length,submitted_at:new Date().toISOString(),answers});
    const list=(await store.get(`subs:${sid}`))||[];
    list.unshift({date:dateKey,score:s,total:questions.length,submitted_at:new Date().toISOString()});
    await store.set(`subs:${sid}`,list);
    setPhase("done"); setBusy(false);
  };

  const q = questions[qi];
  const pct = questions.length ? Math.round((score/questions.length)*100) : 0;

  return (
    <div style={{maxWidth:540,margin:"0 auto",padding:"28px 18px"}} className="au">
      <button className="btn btn-gh" style={{marginBottom:22,fontSize:13}} onClick={()=>go("home")}>← Back</button>

      {phase==="id" && (
        <div className="card">
          <h2 style={{fontSize:21,fontWeight:800,marginBottom:4}}>📋 Word Quiz</h2>
          <div style={{color:C.sub,fontSize:13,marginBottom:22}}>Date: {mm}/{dd} · Enter Student ID to begin</div>
          <ErrBox msg={err}/>
          <label>Student ID</label>
          <input className="input" placeholder="e.g. STU-001" value={sid} onChange={e=>setSid(e.target.value.toUpperCase())} onKeyDown={e=>e.key==="Enter"&&start()} style={{marginBottom:18}}/>
          <button className="btn btn-p" style={{width:"100%"}} onClick={start} disabled={busy||!sid}>
            {busy?<span className="spin">⟳</span>:"Start Quiz →"}
          </button>
        </div>
      )}

      {phase==="quiz" && q && (
        <div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
            <span className="badge bp">Q {qi+1} / {questions.length}</span>
            <span style={{fontSize:13,color:C.sub}}>{student?.name}</span>
          </div>
          <div style={{height:4,background:"#1A1D2E",borderRadius:2,marginBottom:22}}>
            <div style={{height:"100%",background:C.accent,borderRadius:2,width:`${(qi/questions.length)*100}%`,transition:"width .4s"}}/>
          </div>
          <div className="card" style={{marginBottom:18,borderColor:C.accent+"40"}}>
            <div style={{fontSize:11,color:C.accentLt,fontWeight:700,marginBottom:8,textTransform:"uppercase",letterSpacing:".5px"}}>📖 {q.word}</div>
            <div style={{fontSize:16,fontWeight:600,lineHeight:1.55}}>{q.question}</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            {q.options.map((opt,i)=>{
              let cls="opt";
              if(revealed){ cls+=opt===q.correct_answer?" ok":opt===answers[qi]?" bad":""; }
              else if(answers[qi]===opt) cls+=" sel";
              return <button key={i} className={cls} disabled={revealed} onClick={()=>pick(opt)}><span style={{color:C.sub,marginRight:9}}>{String.fromCharCode(65+i)}.</span>{opt}</button>;
            })}
          </div>
          <div style={{marginTop:18,display:"flex",gap:10}}>
            {!revealed
              ? <button className="btn btn-p" style={{flex:1}} disabled={!answers[qi]} onClick={()=>setRevealed(true)}>Check Answer</button>
              : <button className="btn btn-g" style={{flex:1}} onClick={next} disabled={busy}>
                  {busy?<span className="spin">⟳</span>:qi+1<questions.length?"Next →":"See Results 🎉"}
                </button>
            }
          </div>
        </div>
      )}

      {phase==="done" && (
        <div className="card au" style={{textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:12}}>{pct>=80?"🏆":pct>=60?"👍":"📚"}</div>
          <h2 style={{fontSize:24,fontWeight:800,marginBottom:4}}>{already?"Already submitted!":"Quiz Complete!"}</h2>
          <div style={{color:C.sub,marginBottom:28}}>{student?.name} · {mm}/{dd}</div>
          <div style={{display:"flex",justifyContent:"center",marginBottom:24}}>
            <Ring pct={pct} size={130} color={pct>=80?C.emerald:pct>=60?C.gold:C.danger} label={`${score}/${questions.length||5}`} sub="Score"/>
          </div>
          <div style={{background:"#0B0D14",borderRadius:12,padding:"14px 18px",marginBottom:20,textAlign:"left"}}>
            {[["Correct answers",score,C.emerald],["Total questions",questions.length||5,C.text]].map(([l,v,c])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0"}}>
                <span style={{color:C.sub,fontSize:13}}>{l}</span><strong style={{color:c}}>{v}</strong>
              </div>
            ))}
          </div>
          <button className="btn btn-gh" style={{width:"100%"}} onClick={()=>go("home")}>Back to Home</button>
        </div>
      )}
    </div>
  );
};

// ─── PROFILE ──────────────────────────────────────────────────────────────────
const Profile = ({go}) => {
  const [phase,setPhase] = useState("login");
  const [sid,setSid] = useState(""), [pw,setPw] = useState("");
  const [student,setStudent] = useState(null);
  const [subs,setSubs] = useState([]);
  const [wordDates,setWordDates] = useState([]);
  const [err,setErr] = useState(""), [busy,setBusy] = useState(false);
  const [tab,setTab] = useState("overview");

  const login = async () => {
    setBusy(true); setErr("");
    const s = await store.get(`students:${sid}`);
    if (!s||s.parent_password!==pw) { setErr("Incorrect Student ID or password."); setBusy(false); return; }
    const subList=(await store.get(`subs:${sid}`))||[];
    setSubs(subList);
    const wkeys=await store.list("words:");
    setWordDates(wkeys.map(k=>k.replace("words:","")));
    setStudent(s); setPhase("profile"); setBusy(false);
  };

  const learnedWords=wordDates.length*5;
  const totalCorrect=subs.reduce((a,x)=>a+x.score,0);
  const totalPossible=subs.reduce((a,x)=>a+x.total,0);
  const pct=totalPossible>0?Math.round((totalCorrect/totalPossible)*100):0;

  return (
    <div style={{maxWidth:560,margin:"0 auto",padding:"28px 18px"}} className="au">
      <button className="btn btn-gh" style={{marginBottom:22,fontSize:13}} onClick={()=>go("home")}>← Back</button>

      {phase==="login" && (
        <div className="card">
          <div style={{textAlign:"center",marginBottom:26}}>
            <div style={{fontSize:42}}>👨‍👩‍👧</div>
            <h2 style={{fontSize:22,fontWeight:800,marginTop:8}}>Parent Portal</h2>
            <p style={{color:C.sub,fontSize:13,marginTop:4}}>Login to view your child's progress</p>
          </div>
          <ErrBox msg={err}/>
          <div style={{marginBottom:14}}>
            <label>Student ID</label>
            <input className="input" placeholder="e.g. STU-001" value={sid} onChange={e=>setSid(e.target.value.toUpperCase())}/>
          </div>
          <div style={{marginBottom:22}}>
            <label>Parent Password</label>
            <input className="input" type="password" placeholder="••••••••" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()}/>
          </div>
          <button className="btn btn-g" style={{width:"100%"}} onClick={login} disabled={busy||!sid||!pw}>
            {busy?<span className="spin">⟳</span>:"View Profile →"}
          </button>
          <div style={{marginTop:14,padding:"11px 14px",background:"#0B0D14",borderRadius:10,fontSize:12,color:C.sub}}>
            Demo: <strong style={{color:C.accentLt}}>STU-001</strong> / <strong style={{color:C.accentLt}}>parent123</strong>
          </div>
        </div>
      )}

      {phase==="profile" && (
        <div className="au">
          <div className="card" style={{marginBottom:14,background:`linear-gradient(135deg,rgba(124,92,252,.1) 0%,rgba(16,185,129,.06) 100%)`,borderColor:C.accent+"38"}}>
            <div style={{display:"flex",alignItems:"center",gap:16}}>
              <div style={{width:58,height:58,borderRadius:"50%",background:`linear-gradient(135deg,${C.accent},${C.emerald})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,fontWeight:800,flexShrink:0}}>{student.name[0]}</div>
              <div style={{flex:1}}>
                <h2 style={{fontSize:18,fontWeight:800}}>{student.name}</h2>
                <div style={{color:C.sub,fontSize:13,marginTop:2}}>Parent: {student.parent_name}</div>
                <div style={{marginTop:8,display:"flex",gap:6,flexWrap:"wrap"}}>
                  <span className="badge bp">🪪 {student.id}</span>
                  <span className="badge be">📖 {learnedWords} words</span>
                  <span className="badge bgo">✏️ {subs.length} tests</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
            {[{icon:"📖",val:learnedWords,label:"Learned Words",col:C.accent},{icon:"✏️",val:subs.length,label:"Tests Taken",col:C.gold},{icon:"⭐",val:`${pct}%`,label:"Avg Score",col:C.emerald}].map((s,i)=>(
              <div key={i} className="card" style={{textAlign:"center",padding:"14px 10px",borderColor:s.col+"28"}}>
                <div style={{fontSize:20}}>{s.icon}</div>
                <div style={{fontSize:18,fontWeight:800,color:s.col,marginTop:4}}>{s.val}</div>
                <div style={{fontSize:10,color:C.sub,marginTop:2}}>{s.label}</div>
              </div>
            ))}
          </div>

          <div className="card" style={{marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
              <h3 style={{fontSize:14,fontWeight:700}}>Overall Progress</h3>
              <span className="badge bgo" style={{fontSize:10}}>Right / Total Questions</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:18}}>
              <Ring pct={pct} size={92} color={pct>=80?C.emerald:pct>=60?C.gold:C.danger}/>
              <div style={{flex:1}}>
                {[[`Correct (${totalCorrect})`,totalCorrect,totalPossible||1,C.emerald],[`Words (${learnedWords})`,learnedWords,Math.max(learnedWords,1),C.accent]].map(([label,val,max,col])=>(
                  <div key={label} style={{marginBottom:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.sub,marginBottom:5}}>
                      <span>{label}</span>
                    </div>
                    <div style={{background:"#1A1D2E",borderRadius:999,height:7,overflow:"hidden"}}>
                      <div style={{height:"100%",background:col,borderRadius:999,width:`${Math.min((val/max)*100,100)}%`,transition:"width 1.1s cubic-bezier(.1,.5,.5,1)"}}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{display:"flex",gap:6,marginBottom:12}}>
            {[["overview","📊 Overview"],["tests","✏️ Tests"],["words","📖 Words"]].map(([t,l])=>(
              <button key={t} className={`tab ${tab===t?"on":""}`} onClick={()=>setTab(t)}>{l}</button>
            ))}
          </div>

          {tab==="overview" && (
            <div className="card au">
              {[["📖 Total words learned",learnedWords,C.text],["✏️ Tests completed",subs.length,C.text],["⭐ Total correct answers",totalCorrect,C.emerald],["📊 Score percentage",`${pct}%`,pct>=80?C.emerald:pct>=60?C.gold:C.danger]].map(([l,v,c],i,arr)=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:i<arr.length-1?`1px solid ${C.border}`:"none"}}>
                  <span style={{color:C.sub,fontSize:13}}>{l}</span><strong style={{color:c}}>{v}</strong>
                </div>
              ))}
            </div>
          )}

          {tab==="tests" && (
            <div className="au">
              {subs.length===0
                ? <div className="card" style={{textAlign:"center",color:C.sub,fontSize:14}}>No tests taken yet.</div>
                : subs.map((sub,i)=>{
                    const p=Math.round((sub.score/sub.total)*100);
                    return (
                      <div key={i} className="card" style={{marginBottom:10,display:"flex",alignItems:"center",gap:14}}>
                        <div style={{width:44,height:44,borderRadius:12,background:p>=80?"rgba(16,185,129,.15)":p>=60?"rgba(245,158,11,.12)":"rgba(239,68,68,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>
                          {p>=80?"🏆":p>=60?"👍":"📚"}
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:600,fontSize:14}}>📅 {sub.date}</div>
                          <div style={{color:C.sub,fontSize:11,marginTop:1}}>{sub.submitted_at?new Date(sub.submitted_at).toLocaleString():""}</div>
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontWeight:800,fontSize:19,color:p>=80?C.emerald:p>=60?C.gold:C.danger}}>{sub.score}/{sub.total}</div>
                          <div style={{fontSize:11,color:C.sub}}>{p}%</div>
                        </div>
                      </div>
                    );
                  })
              }
            </div>
          )}

          {tab==="words" && (
            <div className="au">
              <div style={{color:C.sub,fontSize:13,marginBottom:12}}>5 words × {wordDates.length} day{wordDates.length!==1?"s":""} = <strong style={{color:C.text}}>{learnedWords}</strong> total words</div>
              {wordDates.length===0
                ? <div className="card" style={{textAlign:"center",color:C.sub,fontSize:14}}>No words published yet.</div>
                : wordDates.sort().reverse().map((date,i)=>(
                    <div key={i} className="card" style={{marginBottom:10,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <span style={{fontWeight:600,fontSize:13}}>📅 {date}</span>
                      <span className="badge be">5 words</span>
                    </div>
                  ))
              }
            </div>
          )}

          <button className="btn btn-gh" style={{width:"100%",marginTop:16}} onClick={()=>{setPhase("login");setStudent(null);setSid("");setPw("");setTab("overview");}}>Logout</button>
        </div>
      )}
    </div>
  );
};

// ─── ADMIN ────────────────────────────────────────────────────────────────────
const Admin = ({go}) => {
  const [tab,setTab] = useState("publish");
  const [wordDate,setWordDate] = useState(todayKey());
  const [words,setWords] = useState(Array(5).fill(null).map(()=>({english:"",myanmar:""})));
  const [students,setStudents] = useState([]);
  const [wordsByDate,setWordsByDate] = useState({});
  const [ns,setNs] = useState({id:"",name:"",parent_name:"",parent_password:""});
  const [toast,setToast] = useState(null);
  const [busy,setBusy] = useState(false);

  const showToast=(msg,type="ok")=>{setToast({msg,type});setTimeout(()=>setToast(null),3000);};

  useEffect(()=>{loadData();},[]);

  const loadData = async () => {
    const keys=await store.list("students:");
    const all=await Promise.all(keys.map(k=>store.get(k)));
    setStudents(all.filter(Boolean));
    const wkeys=await store.list("words:");
    const byDate={};
    for(const k of wkeys){ byDate[k.replace("words:","")]=await store.get(k); }
    setWordsByDate(byDate);
  };

  const setWord=(i,field,val)=>setWords(prev=>prev.map((w,j)=>j===i?{...w,[field]:val}:w));

  const publish = async () => {
    if(words.some(w=>!w.english.trim()||!w.myanmar.trim())){showToast("Fill all 5 words first!","err");return;}
    setBusy(true);
    await store.set(`words:${wordDate}`,words);
    await store.set(`quiz:${wordDate}`,buildQuestions(words));
    showToast(`✅ Published 5 words for ${wordDate}!`);
    setWords(Array(5).fill(null).map(()=>({english:"",myanmar:""})));
    loadData(); setBusy(false);
  };

  const addStudent = async () => {
    if(!ns.id||!ns.name||!ns.parent_password){showToast("Fill all required fields!","err");return;}
    setBusy(true);
    await store.set(`students:${ns.id}`,ns);
    showToast(`✅ Student ${ns.name} added!`);
    setNs({id:"",name:"",parent_name:"",parent_password:""});
    loadData(); setBusy(false);
  };

  const slug=wordDate.replace(/-/g,"").slice(4);

  return (
    <div style={{maxWidth:660,margin:"0 auto",padding:"28px 18px"}} className="au">
      <button className="btn btn-gh" style={{marginBottom:22,fontSize:13}} onClick={()=>go("home")}>← Back</button>
      {toast&&<div className="toast" style={{background:toast.type==="err"?"rgba(239,68,68,.92)":"rgba(16,185,129,.92)",color:"#fff"}}>{toast.msg}</div>}

      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:26}}>
        <div style={{fontSize:30}}>⚙️</div>
        <div><h2 style={{fontSize:21,fontWeight:800}}>Admin Panel</h2><div style={{color:C.sub,fontSize:13}}>Publish words, manage students</div></div>
      </div>

      <div style={{display:"flex",gap:6,marginBottom:22}}>
        {[["publish","📝 Publish"],["history","📚 History"],["students","👥 Students"]].map(([t,l])=>(
          <button key={t} className={`tab ${tab===t?"on":""}`} onClick={()=>setTab(t)}>{l}</button>
        ))}
      </div>

      {tab==="publish" && (
        <div className="au">
          <div className="card" style={{marginBottom:14}}>
            <div style={{marginBottom:18}}>
              <label>📅 Lesson Date</label>
              <input className="input" type="date" value={wordDate} onChange={e=>setWordDate(e.target.value)}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <h3 style={{fontSize:14,fontWeight:700}}>5 Daily Words</h3>
              <span className="badge bgo" style={{fontSize:10}}>Quiz auto-generates ✨</span>
            </div>
            {words.map((w,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                <div><label>#{i+1} English</label><input className="input" placeholder="e.g. Eloquent" value={w.english} onChange={e=>setWord(i,"english",e.target.value)}/></div>
                <div><label>Myanmar</label><input className="input" placeholder="မြန်မာဘာသာ" value={w.myanmar} onChange={e=>setWord(i,"myanmar",e.target.value)}/></div>
              </div>
            ))}
            <button className="btn btn-p" style={{width:"100%",marginTop:6}} onClick={publish} disabled={busy}>
              {busy?<span className="spin">⟳</span>:"🚀 Publish Words & Generate Quiz"}
            </button>
          </div>
          <div style={{background:C.emerald+"0D",border:`1px solid ${C.emerald}22`,borderRadius:12,padding:"12px 16px",fontSize:12,color:C.sub}}>
            💡 Quiz accessible at: <span style={{color:C.accentLt,fontFamily:"monospace"}}>quiz/{slug}</span>
          </div>
        </div>
      )}

      {tab==="history" && (
        <div className="au">
          {Object.keys(wordsByDate).length===0
            ? <div className="card" style={{textAlign:"center",color:C.sub,fontSize:14}}>No words published yet.</div>
            : Object.entries(wordsByDate).sort((a,b)=>b[0]>a[0]?1:-1).map(([date,wds])=>(
                <div key={date} className="card" style={{marginBottom:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                    <span style={{fontWeight:700,fontSize:14}}>📅 {date}</span>
                    <span className="badge be">{wds?.length||5} words</span>
                  </div>
                  {(wds||[]).map((w,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:"rgba(124,92,252,.06)",border:`1px solid rgba(124,92,252,.18)`,borderRadius:12,marginBottom:i<wds.length-1?7:0}}>
                      <div><div style={{fontWeight:600,fontSize:14}}>{w.english}</div><div style={{fontSize:10,color:C.sub,marginTop:1}}>English</div></div>
                      <span style={{color:C.sub}}>→</span>
                      <div style={{textAlign:"right"}}><div style={{fontWeight:600,fontSize:14,color:C.accentLt}}>{w.myanmar}</div><div style={{fontSize:10,color:C.sub,marginTop:1}}>Myanmar</div></div>
                    </div>
                  ))}
                </div>
              ))
          }
        </div>
      )}

      {tab==="students" && (
        <div className="au">
          <div className="card" style={{marginBottom:18}}>
            <h3 style={{fontSize:14,fontWeight:700,marginBottom:14}}>➕ Add Student</h3>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[["id","Student ID *","STU-003"],["name","Name *","Mg Aung Aung"],["parent_name","Parent Name","U Ko Ko"],["parent_password","Parent Password *",""]].map(([field,lbl,ph])=>(
                <div key={field}>
                  <label>{lbl}</label>
                  <input className="input" placeholder={ph} value={ns[field]}
                    onChange={e=>setNs(p=>({...p,[field]:field==="id"?e.target.value.toUpperCase():e.target.value}))}
                    type={field==="parent_password"?"password":"text"}/>
                </div>
              ))}
            </div>
            <button className="btn btn-g" style={{marginTop:14,width:"100%"}} onClick={addStudent} disabled={busy}>Add Student</button>
          </div>
          <h3 style={{fontSize:14,fontWeight:700,marginBottom:12}}>All Students ({students.length})</h3>
          {students.map((s,i)=>(
            <div key={i} className="card" style={{marginBottom:10,display:"flex",alignItems:"center",gap:14}}>
              <div style={{width:40,height:40,borderRadius:"50%",background:`linear-gradient(135deg,${C.accent},${C.emerald})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,flexShrink:0}}>{s.name[0]}</div>
              <div>
                <div style={{fontWeight:600,fontSize:14}}>{s.name}</div>
                <div style={{color:C.sub,fontSize:12}}>{s.id} · Parent: {s.parent_name||"—"}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [view,setView] = useState("home");
  const [ready,setReady] = useState(false);

  useEffect(()=>{ seedDemo().then(()=>setReady(true)); },[]);

  const go=(v)=>setView(v);

  if(!ready) return (
    <>
      <style>{css}</style>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",flexDirection:"column",gap:14}}>
        <div style={{fontSize:36}} className="spin">⟳</div>
        <div style={{color:C.sub}}>Loading WordSmart…</div>
      </div>
    </>
  );

  const renderView=()=>{
    if(view==="home") return <Home go={go}/>;
    if(view==="profile") return <Profile go={go}/>;
    if(view==="admin") return <Admin go={go}/>;
    if(view.startsWith("quiz/")) return <Quiz slug={view.split("/")[1]} go={go}/>;
    return <Home go={go}/>;
  };

  return (
    <>
      <style>{css}</style>
      <Nav view={view} go={go}/>
      {renderView()}
    </>
  );
}
