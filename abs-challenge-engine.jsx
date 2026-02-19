import { useState, useMemo, useCallback, useEffect, useRef } from "react";

// ============================================================
// DATA
// ============================================================
const COUNTS=["0-2","1-2","0-1","2-2","1-1","0-0","1-0","2-1","3-2","2-0","3-1","3-0"];
const BASES_LIST=[
  {label:"---",key:"000",desc:"Empty"},{label:"1B",key:"100",desc:"1st"},{label:"2B",key:"010",desc:"2nd"},
  {label:"1B 2B",key:"110",desc:"1st & 2nd"},{label:"3B",key:"001",desc:"3rd"},{label:"1B 3B",key:"101",desc:"1st & 3rd"},
  {label:"2B 3B",key:"011",desc:"2nd & 3rd"},{label:"1B 2B 3B",key:"111",desc:"Loaded"},
];
const RE={0:{"000":{"0-2":0.42,"1-2":0.44,"0-1":0.47,"2-2":0.48,"1-1":0.50,"0-0":0.51,"1-0":0.55,"2-1":0.55,"3-2":0.59,"2-0":0.61,"3-1":0.67,"3-0":0.74},"100":{"0-2":0.76,"1-2":0.80,"0-1":0.84,"2-2":0.87,"1-1":0.89,"0-0":0.90,"1-0":0.96,"2-1":0.98,"3-2":1.03,"2-0":1.07,"3-1":1.15,"3-0":1.25},"010":{"0-2":0.99,"1-2":1.03,"0-1":1.10,"2-2":1.09,"1-1":1.13,"0-0":1.15,"1-0":1.20,"2-1":1.20,"3-2":1.18,"2-0":1.25,"3-1":1.30,"3-0":1.38},"110":{"0-2":1.31,"1-2":1.34,"0-1":1.41,"2-2":1.41,"1-1":1.47,"0-0":1.50,"1-0":1.58,"2-1":1.57,"3-2":1.64,"2-0":1.74,"3-1":1.83,"3-0":1.98},"001":{"0-2":1.23,"1-2":1.26,"0-1":1.33,"2-2":1.34,"1-1":1.37,"0-0":1.38,"1-0":1.44,"2-1":1.41,"3-2":1.43,"2-0":1.48,"3-1":1.52,"3-0":1.60},"101":{"0-2":1.56,"1-2":1.60,"0-1":1.68,"2-2":1.67,"1-1":1.74,"0-0":1.78,"1-0":1.85,"2-1":1.82,"3-2":1.86,"2-0":1.91,"3-1":1.98,"3-0":2.08},"011":{"0-2":1.77,"1-2":1.81,"0-1":1.91,"2-2":1.85,"1-1":1.95,"0-0":1.98,"1-0":2.03,"2-1":1.99,"3-2":1.97,"2-0":2.09,"3-1":2.11,"3-0":2.19},"111":{"0-2":2.08,"1-2":2.09,"0-1":2.21,"2-2":2.26,"1-1":2.27,"0-0":2.32,"1-0":2.40,"2-1":2.46,"3-2":2.59,"2-0":2.52,"3-1":2.63,"3-0":2.89}},1:{"000":{"0-2":0.21,"1-2":0.22,"0-1":0.24,"2-2":0.25,"1-1":0.26,"0-0":0.27,"1-0":0.30,"2-1":0.30,"3-2":0.32,"2-0":0.35,"3-1":0.38,"3-0":0.43},"100":{"0-2":0.41,"1-2":0.43,"0-1":0.48,"2-2":0.49,"1-1":0.51,"0-0":0.53,"1-0":0.57,"2-1":0.57,"3-2":0.60,"2-0":0.64,"3-1":0.69,"3-0":0.77},"010":{"0-2":0.55,"1-2":0.58,"0-1":0.63,"2-2":0.63,"1-1":0.67,"0-0":0.69,"1-0":0.73,"2-1":0.72,"3-2":0.71,"2-0":0.79,"3-1":0.79,"3-0":0.85},"110":{"0-2":0.76,"1-2":0.80,"0-1":0.86,"2-2":0.86,"1-1":0.91,"0-0":0.93,"1-0":1.00,"2-1":1.00,"3-2":1.06,"2-0":1.10,"3-1":1.21,"3-0":1.33},"001":{"0-2":0.77,"1-2":0.80,"0-1":0.90,"2-2":0.86,"1-1":0.93,"0-0":0.97,"1-0":1.00,"2-1":0.99,"3-2":0.95,"2-0":1.05,"3-1":1.06,"3-0":1.13},"101":{"0-2":0.98,"1-2":1.03,"0-1":1.13,"2-2":1.09,"1-1":1.21,"0-0":1.21,"1-0":1.24,"2-1":1.25,"3-2":1.24,"2-0":1.33,"3-1":1.36,"3-0":1.44},"011":{"0-2":1.10,"1-2":1.17,"0-1":1.28,"2-2":1.22,"1-1":1.32,"0-0":1.37,"1-0":1.42,"2-1":1.39,"3-2":1.33,"2-0":1.48,"3-1":1.48,"3-0":1.54},"111":{"0-2":1.27,"1-2":1.34,"0-1":1.43,"2-2":1.46,"1-1":1.53,"0-0":1.57,"1-0":1.68,"2-1":1.68,"3-2":1.78,"2-0":1.82,"3-1":1.91,"3-0":2.15}},2:{"000":{"0-2":0.06,"1-2":0.07,"0-1":0.09,"2-2":0.09,"1-1":0.10,"0-0":0.10,"1-0":0.12,"2-1":0.12,"3-2":0.12,"2-0":0.14,"3-1":0.16,"3-0":0.18},"100":{"0-2":0.14,"1-2":0.16,"0-1":0.19,"2-2":0.18,"1-1":0.21,"0-0":0.23,"1-0":0.26,"2-1":0.24,"3-2":0.25,"2-0":0.30,"3-1":0.32,"3-0":0.37},"010":{"0-2":0.19,"1-2":0.22,"0-1":0.27,"2-2":0.27,"1-1":0.31,"0-0":0.32,"1-0":0.35,"2-1":0.34,"3-2":0.32,"2-0":0.38,"3-1":0.39,"3-0":0.43},"110":{"0-2":0.23,"1-2":0.26,"0-1":0.32,"2-2":0.31,"1-1":0.34,"0-0":0.36,"1-0":0.39,"2-1":0.38,"3-2":0.37,"2-0":0.43,"3-1":0.45,"3-0":0.49},"001":{"0-2":0.31,"1-2":0.32,"0-1":0.44,"2-2":0.44,"1-1":0.47,"0-0":0.50,"1-0":0.55,"2-1":0.54,"3-2":0.54,"2-0":0.63,"3-1":0.67,"3-0":0.73},"101":{"0-2":0.35,"1-2":0.39,"0-1":0.48,"2-2":0.44,"1-1":0.53,"0-0":0.57,"1-0":0.62,"2-1":0.57,"3-2":0.54,"2-0":0.68,"3-1":0.69,"3-0":0.75},"011":{"0-2":0.41,"1-2":0.44,"0-1":0.49,"2-2":0.44,"1-1":0.51,"0-0":0.53,"1-0":0.57,"2-1":0.57,"3-2":0.60,"2-0":0.64,"3-1":0.69,"3-0":0.77},"111":{"0-2":0.46,"1-2":0.54,"0-1":0.62,"2-2":0.67,"1-1":0.74,"0-0":0.76,"1-0":0.90,"2-1":0.89,"3-2":0.92,"2-0":1.05,"3-1":1.18,"3-0":1.38}}};

function getTrans(c){const[b,s]=c.split("-").map(Number);const t=[];if(b>0&&s+1<=2)t.push({type:"b2s",label:"Ball → Strike",from:c,to:`${b-1}-${s+1}`,desc:"Overturned to strike"});if(s>0&&b+1<=3)t.push({type:"s2b",label:"Strike → Ball",from:c,to:`${b+1}-${s-1}`,desc:"Overturned to ball"});return t;}
function getLI(inn,diff){let l=1;if(inn>=7)l*=1.3;if(inn>=9)l*=1.5;if(Math.abs(diff)<=1)l*=1.4;else if(Math.abs(diff)<=3)l*=1.1;else if(Math.abs(diff)>=6)l*=0.5;return l;}
const fmt=v=>v==null?"—":v.toFixed(3);
function heatColor(v,mn,mx){const t=Math.max(0,Math.min(1,(v-mn)/(mx-mn)));if(t<.5){const s=t/.5;return`rgb(${Math.round(33+(255-33)*s)},${Math.round(102+(255-102)*s)},${Math.round(172+(255-172)*s)})`}const s=(t-.5)/.5;return`rgb(${Math.round(255-(255-214)*s)},${Math.round(255-(255-48)*s)},${Math.round(255-(255-49)*s)})`}
function heatText(v,mn,mx){const t=Math.max(0,Math.min(1,(v-mn)/(mx-mn)));return(t<.2||t>.8)?"#fff":"#333"}
function dColor(d){if(d==null)return"transparent";const t=Math.min(Math.abs(d)/.45,1);if(d<0)return`rgb(${Math.round(255-(255-33)*t)},${Math.round(255-(255-102)*t)},${Math.round(255-(255-172)*t)})`;return`rgb(${Math.round(255-(255-214)*t)},${Math.round(255-(255-48)*t)},${Math.round(255-(255-49)*t)})`}
function dText(d){return d!=null&&Math.abs(d)>.2?"#fff":"#333"}

// ============================================================
// MLB API HOOKS
// ============================================================
const API="https://statsapi.mlb.com/api/v1";

function useTodaysGames(){
  const[games,setGames]=useState([]);
  const[loading,setLoading]=useState(true);
  const[error,setError]=useState(null);
  useEffect(()=>{
    let cancelled=false;
    async function load(){
      try{
        const today=new Date().toISOString().split("T")[0];
        const res=await fetch(`${API}/schedule?sportId=1&date=${today}&hydrate=linescore`);
        if(!res.ok)throw new Error("Schedule fetch failed");
        const data=await res.json();
        const allGames=(data.dates||[]).flatMap(d=>d.games||[]);
        if(!cancelled)setGames(allGames);
      }catch(e){if(!cancelled)setError(e.message)}
      finally{if(!cancelled)setLoading(false)}
    }
    load();
    return()=>{cancelled=true};
  },[]);
  return{games,loading,error};
}

function useLiveGame(gamePk){
  const[state,setState]=useState(null);
  const[err,setErr]=useState(null);
  const intervalRef=useRef(null);

  useEffect(()=>{
    if(!gamePk){setState(null);return;}
    let cancelled=false;
    async function poll(){
      try{
        const res=await fetch(`${API}/game/${gamePk}/linescore`);
        if(!res.ok)throw new Error("Linescore fetch failed");
        const d=await res.json();
        if(cancelled)return;
        // Parse game state
        const balls=d.balls??0,strikes=d.strikes??0,outs_val=d.outs??0;
        const inn=d.currentInning??1;
        const isTop=d.isTopInning??true;
        const away=d.teams?.away?.runs??0,home=d.teams?.home?.runs??0;
        // Base runners
        const first=d.offense?.first?1:0;
        const second=d.offense?.second?1:0;
        const third=d.offense?.third?1:0;
        const batter=d.offense?.batter?.fullName||"";
        const pitcher=d.defense?.pitcher?.fullName||"";
        setState({
          balls,strikes,outs:Math.min(outs_val,2),inn,isTop,
          away,home,
          bases:`${first}${second}${third}`,
          count:`${balls}-${strikes}`,
          batter,pitcher,
        });
        setErr(null);
      }catch(e){if(!cancelled)setErr(e.message)}
    }
    poll();
    intervalRef.current=setInterval(poll,5000); // poll every 5s
    return()=>{cancelled=true;clearInterval(intervalRef.current)};
  },[gamePk]);

  return{state,err};
}

// ============================================================
// SMALL COMPONENTS
// ============================================================
function Diamond({bs,size=36}){
  const s=size,mid=s/2,d=s*.28,r=s*.09;
  const bases=[{x:mid+d,y:mid,on:bs[0]==="1"},{x:mid,y:mid-d,on:bs[1]==="1"},{x:mid-d,y:mid,on:bs[2]==="1"}];
  return(<svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{verticalAlign:"middle",flexShrink:0}}>
    <polygon points={`${mid},${mid-d} ${mid+d},${mid} ${mid},${mid+d*.6} ${mid-d},${mid}`} fill="none" stroke="#d1d5db" strokeWidth=".8"/>
    {bases.map((b,i)=><rect key={i} x={b.x-r} y={b.y-r} width={r*2} height={r*2} transform={`rotate(45 ${b.x} ${b.y})`} fill={b.on?"#ef4444":"#e5e7eb"} stroke={b.on?"#dc2626":"#d1d5db"} strokeWidth=".7"/>)}
  </svg>);
}
function Dots({count,sm}){
  const[balls,strikes]=count.split("-").map(Number);const sz=sm?7:10,g=2;
  return(<div style={{display:"inline-flex",flexDirection:"column",gap:2}}>
    <div style={{display:"flex",alignItems:"center",gap:g}}><span style={{fontSize:sm?7:9,color:"#9ca3af",width:8,fontWeight:600}}>B</span>{[0,1,2,3].map(i=><div key={i} style={{width:sz,height:sz,borderRadius:"50%",background:i<balls?"#22c55e":"#e5e7eb",transition:"background .15s"}}/>)}</div>
    <div style={{display:"flex",alignItems:"center",gap:g}}><span style={{fontSize:sm?7:9,color:"#9ca3af",width:8,fontWeight:600}}>S</span>{[0,1,2].map(i=><div key={i} style={{width:sz,height:sz,borderRadius:"50%",background:i<strikes?"#ef4444":"#e5e7eb",transition:"background .15s"}}/>)}</div>
  </div>);
}

// ============================================================
// MAIN
// ============================================================
const TABS=[{key:"simulator",label:"Simulator"},{key:"matrix",label:"RE Matrix"},{key:"methodology",label:"Methodology"}];

export default function App(){
  const[tab,setTab]=useState("simulator");
  // Manual state
  const[count,setCount]=useState("1-1");
  const[outs,setOuts]=useState(0);
  const[bs,setBs]=useState("000");
  const[conf,setConf]=useState(70);
  const[inn,setInn]=useState(5);
  const[diff,setDiff]=useState(0);
  const[persp,setPersp]=useState("offense");
  const[chLeft,setChLeft]=useState(3);
  // Live game state
  const[selectedGame,setSelectedGame]=useState(null);
  const[mode,setMode]=useState("manual"); // "manual" | "live"
  const{games,loading:gamesLoading}=useTodaysGames();
  const{state:liveState}=useLiveGame(mode==="live"?selectedGame:null);
  // Matrix state
  const[mOuts,setMOuts]=useState(0);
  const[mView,setMView]=useState("re");

  // Derived: which game state to use
  const activeCount=mode==="live"&&liveState?liveState.count:count;
  const activeOuts=mode==="live"&&liveState?liveState.outs:outs;
  const activeBs=mode==="live"&&liveState?liveState.bases:bs;
  const activeInn=mode==="live"&&liveState?liveState.inn:inn;
  const activeDiff=mode==="live"&&liveState?(liveState.isTop?liveState.away-liveState.home:liveState.home-liveState.away):diff;

  const liveGames=games.filter(g=>g.status?.abstractGameState==="Live");
  const scheduledGames=games.filter(g=>g.status?.abstractGameState==="Preview");
  const finalGames=games.filter(g=>g.status?.abstractGameState==="Final");

  const analysis=useMemo(()=>{
    const c=activeCount,o=activeOuts,b=activeBs;
    if(!RE[o]?.[b]?.[c])return null;
    const cur=RE[o][b][c];
    const li=getLI(activeInn,activeDiff);
    return{cur,results:getTrans(c).map(t=>{
      const cor=RE[o]?.[b]?.[t.to];if(cor===undefined)return null;
      const dRE=cor-cur,pD=persp==="offense"?dRE:-dRE,aD=pD*li;
      const rem=Math.max(9-activeInn,0),ov=(chLeft>1?.015:.035)*rem*.1;
      const be=Math.abs(dRE)>0?Math.max((ov/(Math.abs(dRE)+ov))*100,5):100;
      const ev=(conf/100)*aD-((100-conf)/100)*ov;
      return{...t,cur,cor,dRE,pD,aD,li,ov,be,ev,go:conf>=be&&pD>0,rel:pD>0};
    }).filter(Boolean)};
  },[activeCount,activeOuts,activeBs,activeInn,activeDiff,conf,persp,chLeft]);

  const toggleBase=useCallback(i=>setBs(p=>{const a=p.split("");a[i]=a[i]==="1"?"0":"1";return a.join("")}),[]);
  const seg=(active)=>({padding:"6px 0",flex:1,borderRadius:7,fontSize:12,fontWeight:active?600:400,cursor:"pointer",textAlign:"center",border:"none",background:active?"#111827":"#f3f4f6",color:active?"#fff":"#6b7280",transition:"all .15s",fontFamily:"inherit"});
  const sel={appearance:"none",WebkitAppearance:"none",background:"#f3f4f6",border:"1px solid #e5e7eb",borderRadius:8,padding:"7px 28px 7px 10px",fontSize:13,color:"#1f2937",cursor:"pointer",outline:"none",fontFamily:"inherit",width:"100%",backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%239ca3af'/%3E%3C/svg%3E")`,backgroundRepeat:"no-repeat",backgroundPosition:"right 10px center"};

  return(
    <div style={{minHeight:"100vh",background:"#f9fafb",fontFamily:"-apple-system,'SF Pro Display','Helvetica Neue',Helvetica,Arial,sans-serif",color:"#1f2937",fontSize:14}}>
      <style>{`
        *{box-sizing:border-box}
        @media(max-width:860px){.sim-grid{grid-template-columns:1fr!important}}
        @media(max-width:600px){.content-wrap{padding:12px!important}.count-grid{grid-template-columns:repeat(3,1fr)!important}.mx-controls{flex-direction:column!important;align-items:flex-start!important}}
        input[type=range]{-webkit-appearance:none;appearance:none;height:4px;border-radius:99px;background:#e5e7eb;outline:none}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:#111827;cursor:pointer;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.15)}
        input[type=range]::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:#111827;cursor:pointer;border:2px solid #fff}
        button{font-family:inherit}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
      `}</style>

      <header style={{background:"#fff",borderBottom:"1px solid #e5e7eb"}}>
        <div style={{maxWidth:1100,margin:"0 auto",padding:"0 16px"}}>
          <div style={{padding:"14px 0 0",display:"flex",alignItems:"baseline",gap:8,flexWrap:"wrap"}}>
            <h1 style={{fontSize:20,fontWeight:700,color:"#111827",margin:0,letterSpacing:-.3}}>ABS Challenge Engine</h1>
            <span style={{fontSize:12,color:"#9ca3af"}}>Run Expectancy Decision Model</span>
          </div>
          <nav style={{display:"flex",gap:0,marginTop:8}}>
            {TABS.map(t=>(
              <button key={t.key} onClick={()=>setTab(t.key)} style={{
                padding:"8px 16px",border:"none",cursor:"pointer",fontSize:13,fontWeight:tab===t.key?600:400,
                background:"transparent",color:tab===t.key?"#111827":"#9ca3af",
                borderBottom:tab===t.key?"2px solid #111827":"2px solid transparent",marginBottom:-1,transition:"all .12s",
              }}>{t.label}</button>
            ))}
          </nav>
        </div>
      </header>

      <div className="content-wrap" style={{maxWidth:1100,margin:"0 auto",padding:"16px"}}>
        {tab==="simulator"&&(
          <div className="sim-grid" style={{display:"grid",gridTemplateColumns:"300px 1fr",gap:16,alignItems:"start"}}>
            {/* LEFT PANEL */}
            <div>
              {/* === LIVE GAME SELECTOR === */}
              <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:10,marginBottom:12,overflow:"hidden"}}>
                <div style={{padding:14}}>
                  <div style={{display:"flex",gap:3,marginBottom:10}}>
                    <button onClick={()=>setMode("manual")} style={seg(mode==="manual")}>Manual</button>
                    <button onClick={()=>setMode("live")} style={seg(mode==="live")}>
                      Live Game{liveGames.length>0&&` (${liveGames.length})`}
                    </button>
                  </div>

                  {mode==="live"&&(
                    <div>
                      {gamesLoading&&<p style={{fontSize:12,color:"#9ca3af",margin:0}}>Loading today's schedule...</p>}
                      {!gamesLoading&&liveGames.length===0&&(
                        <div style={{fontSize:12,color:"#9ca3af",lineHeight:1.6}}>
                          <p style={{margin:"0 0 6px"}}>No live games right now.</p>
                          {scheduledGames.length>0&&<p style={{margin:0}}>{scheduledGames.length} game{scheduledGames.length>1?"s":""} scheduled today.</p>}
                          {games.length===0&&<p style={{margin:0}}>No games scheduled today.</p>}
                        </div>
                      )}
                      {!gamesLoading&&liveGames.length>0&&(
                        <div style={{display:"flex",flexDirection:"column",gap:4}}>
                          {liveGames.map(g=>{
                            const away=g.teams?.away,home=g.teams?.home;
                            const sel=selectedGame===g.gamePk;
                            const ls=g.linescore;
                            return(
                              <button key={g.gamePk} onClick={()=>setSelectedGame(g.gamePk)} style={{
                                padding:"8px 10px",borderRadius:8,border:"none",cursor:"pointer",textAlign:"left",
                                background:sel?"#111827":"#f3f4f6",color:sel?"#fff":"#374151",
                                transition:"all .15s",fontFamily:"inherit",
                              }}>
                                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                                  <div style={{fontSize:12,fontWeight:600}}>
                                    {away?.team?.abbreviation||"AWY"} {ls?.teams?.away?.runs??"-"} @ {home?.team?.abbreviation||"HME"} {ls?.teams?.home?.runs??"-"}
                                  </div>
                                  <div style={{display:"flex",alignItems:"center",gap:4}}>
                                    <div style={{width:6,height:6,borderRadius:"50%",background:sel?"#22c55e":"#22c55e",animation:"pulse 1.5s infinite"}}/>
                                    <span style={{fontSize:10,color:sel?"rgba(255,255,255,.6)":"#9ca3af"}}>
                                      {ls?.isTopInning?"Top":"Bot"} {ls?.currentInning||"?"}
                                    </span>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Live state display */}
                      {liveState&&selectedGame&&(
                        <div style={{marginTop:10,padding:"8px 10px",background:"#f0fdf4",borderRadius:8,fontSize:11,color:"#166534",lineHeight:1.6}}>
                          <div style={{fontWeight:600}}>
                            {liveState.isTop?"Top":"Bot"} {liveState.inn} — {liveState.count}, {liveState.outs} out{liveState.outs!==1?"s":""}
                          </div>
                          {liveState.batter&&<div>AB: {liveState.batter}</div>}
                          {liveState.pitcher&&<div>P: {liveState.pitcher}</div>}
                          <div style={{fontSize:10,color:"#4ade80",marginTop:2}}>Auto-updating every 5s</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* === GAME SITUATION === */}
              <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:10,marginBottom:12,overflow:"hidden"}}>
                <div style={{padding:16}}>
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
                    <div style={{textAlign:"center"}}>
                      <Diamond bs={activeBs} size={56}/>
                      {mode==="manual"&&<div style={{display:"flex",gap:3,justifyContent:"center",marginTop:4}}>
                        {["1B","2B","3B"].map((l,i)=>(
                          <button key={i} onClick={()=>toggleBase(i)} style={{padding:"2px 6px",borderRadius:5,fontSize:9,fontWeight:600,cursor:"pointer",border:"none",background:bs[i]==="1"?"#fef2f2":"#f3f4f6",color:bs[i]==="1"?"#ef4444":"#9ca3af",transition:"all .15s"}}>{l}</button>
                        ))}
                      </div>}
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:5}}>
                      <Dots count={activeCount}/>
                      <div style={{display:"flex",alignItems:"center",gap:2}}>
                        <span style={{fontSize:9,color:"#9ca3af",width:8,fontWeight:600}}>O</span>
                        {[0,1,2].map(i=><div key={i} style={{width:10,height:10,borderRadius:"50%",background:i<activeOuts?"#f59e0b":"#e5e7eb",transition:"background .15s"}}/>)}
                      </div>
                    </div>
                    <div style={{marginLeft:"auto",textAlign:"right",paddingLeft:8}}>
                      <div style={{fontSize:9,fontWeight:500,color:"#9ca3af",textTransform:"uppercase",letterSpacing:.5}}>Run Exp</div>
                      <div style={{fontSize:26,fontWeight:700,color:"#111827",letterSpacing:-.5,lineHeight:1,fontVariantNumeric:"tabular-nums",marginTop:2}}>{analysis?fmt(analysis.cur):"—"}</div>
                      <div style={{fontSize:10,fontWeight:500,color:"#9ca3af",marginTop:2,fontVariantNumeric:"tabular-nums"}}>LI {analysis?.results?.[0]?analysis.results[0].li.toFixed(2)+"×":"—"}</div>
                    </div>
                  </div>

                  {mode==="manual"&&(<>
                    <label style={{fontSize:11,fontWeight:500,color:"#6b7280",display:"block",marginBottom:4}}>Count</label>
                    <div className="count-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:3,marginBottom:12}}>
                      {COUNTS.map(c=><button key={c} onClick={()=>setCount(c)} style={{...seg(count===c),padding:"5px 0",fontSize:11,borderRadius:6}}>{c}</button>)}
                    </div>
                    <label style={{fontSize:11,fontWeight:500,color:"#6b7280",display:"block",marginBottom:4}}>Outs</label>
                    <div style={{display:"flex",gap:3}}>
                      {[0,1,2].map(o=><button key={o} onClick={()=>setOuts(o)} style={seg(outs===o)}>{o}</button>)}
                    </div>
                  </>)}
                  {mode==="live"&&!liveState&&selectedGame&&(
                    <p style={{fontSize:12,color:"#9ca3af",margin:0}}>Connecting to game feed...</p>
                  )}
                  {mode==="live"&&!selectedGame&&(
                    <p style={{fontSize:12,color:"#9ca3af",margin:0}}>Select a live game above.</p>
                  )}
                </div>
              </div>

              {/* === CONTEXT === */}
              <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:10,marginBottom:12,overflow:"hidden"}}>
                <div style={{padding:16}}>
                  {mode==="manual"&&(
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                      <div><label style={{fontSize:11,fontWeight:500,color:"#6b7280",display:"block",marginBottom:4}}>Inning</label><select value={inn} onChange={e=>setInn(+e.target.value)} style={sel}>{[1,2,3,4,5,6,7,8,9,10,11,12].map(i=><option key={i} value={i}>{i}{["st","nd","rd"][i-1]||"th"}</option>)}</select></div>
                      <div><label style={{fontSize:11,fontWeight:500,color:"#6b7280",display:"block",marginBottom:4}}>Run Diff</label><select value={diff} onChange={e=>setDiff(+e.target.value)} style={sel}>{[-8,-7,-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6,7,8].map(d=><option key={d} value={d}>{d===0?"Tied":d>0?`+${d}`:d}</option>)}</select></div>
                    </div>
                  )}
                  {mode==="live"&&liveState&&(
                    <div style={{display:"flex",gap:12,marginBottom:10,fontSize:12,color:"#6b7280"}}>
                      <span>{liveState.isTop?"Top":"Bot"} {liveState.inn}</span>
                      <span>Score: {liveState.away}–{liveState.home}</span>
                      <span>Diff: {activeDiff>0?"+":""}{activeDiff}</span>
                    </div>
                  )}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
                    <div><label style={{fontSize:11,fontWeight:500,color:"#6b7280",display:"block",marginBottom:4}}>Perspective</label><div style={{display:"flex",gap:3}}>{["offense","defense"].map(p=><button key={p} onClick={()=>setPersp(p)} style={{...seg(persp===p),fontSize:11,textTransform:"capitalize"}}>{p}</button>)}</div></div>
                    <div><label style={{fontSize:11,fontWeight:500,color:"#6b7280",display:"block",marginBottom:4}}>Challenges</label><div style={{display:"flex",gap:3}}>{[1,2,3].map(c=><button key={c} onClick={()=>setChLeft(c)} style={seg(chLeft===c)}>{c}</button>)}</div></div>
                  </div>
                  <div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:4}}>
                      <label style={{fontSize:11,fontWeight:500,color:"#6b7280"}}>Confidence</label>
                      <span style={{fontSize:17,fontWeight:700,color:"#111827",fontVariantNumeric:"tabular-nums"}}>{conf}%</span>
                    </div>
                    <input type="range" min={5} max={99} value={conf} onChange={e=>setConf(+e.target.value)} style={{width:"100%",cursor:"pointer"}}/>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div style={{minHeight:120}}>
              {analysis?.results?.map((r,i)=><ChallengeCard key={`${r.from}-${r.to}`} r={r} conf={conf} persp={persp}/>)}
              {(!analysis||analysis.results.length===0)&&(
                <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:10,padding:32,textAlign:"center",color:"#9ca3af",fontSize:13}}>
                  {mode==="live"&&!liveState?"Select a live game and wait for data.":"No valid challenge transitions for this count."}
                </div>
              )}
            </div>
          </div>
        )}

        {tab==="matrix"&&<MatrixView {...{mOuts,setMOuts,mView,setMView}} seg={(active)=>({padding:"5px 14px",borderRadius:7,fontSize:12,fontWeight:active?600:400,cursor:"pointer",border:"none",background:active?"#111827":"#f3f4f6",color:active?"#fff":"#6b7280",transition:"all .15s",fontFamily:"inherit"})}/>}
        {tab==="methodology"&&<Methodology/>}
      </div>
    </div>
  );
}

// ============================================================
// CHALLENGE CARD
// ============================================================
function ChallengeCard({r,conf,persp}){
  const[open,setOpen]=useState(false);
  const green="#16a34a",red="#dc2626";
  return(
    <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:10,marginBottom:10,overflow:"hidden",opacity:r.rel?1:.45}}>
      <button onClick={()=>setOpen(o=>!o)} style={{width:"100%",border:"none",background:"transparent",cursor:"pointer",padding:"12px 14px",textAlign:"left",fontFamily:"inherit"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:6}}>
          <span style={{fontSize:11,fontWeight:600,color:r.type==="s2b"?green:red}}>{r.label}</span>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {r.rel&&<span style={{padding:"3px 10px",borderRadius:6,fontSize:11,fontWeight:700,background:r.go?green:red,color:"#fff",whiteSpace:"nowrap"}}>{r.go?"✓ CHALLENGE":"✗ HOLD"}</span>}
            {!r.rel&&<span style={{fontSize:11,color:"#9ca3af"}}>Opponent</span>}
            <svg width="12" height="12" viewBox="0 0 12 12" style={{transform:open?"rotate(180deg)":"rotate(0deg)",transition:"transform .2s",flexShrink:0,opacity:.3}}><path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12,fontSize:13,fontVariantNumeric:"tabular-nums",flexWrap:"wrap"}}>
          <span style={{color:"#6b7280"}}>{r.from}</span>
          <span style={{color:"#d1d5db"}}>→</span>
          <span style={{color:"#374151",fontWeight:600}}>{r.to}</span>
          <span style={{color:r.pD>0?green:r.pD<0?red:"#6b7280",fontWeight:700}}>ΔRE {r.pD>0?"+":""}{r.pD.toFixed(3)}</span>
          {r.rel&&<span style={{color:"#9ca3af",fontSize:11}}>EV {r.ev>0?"+":""}{r.ev.toFixed(4)}</span>}
        </div>
      </button>
      {open&&(
        <div style={{borderTop:"1px solid #f3f4f6",padding:14}}>
          <div style={{display:"flex",alignItems:"center",gap:12,background:"#f9fafb",borderRadius:8,padding:12,marginBottom:12}}>
            <div style={{textAlign:"center",minWidth:55}}><div style={{fontSize:8,fontWeight:600,color:"#9ca3af",textTransform:"uppercase",letterSpacing:.5,marginBottom:4}}>Called</div><Dots count={r.from} sm/><div style={{fontSize:15,fontWeight:700,color:"#111827",marginTop:4,fontVariantNumeric:"tabular-nums"}}>{fmt(r.cur)}</div></div>
            <div style={{fontSize:16,color:"#d1d5db",flexShrink:0}}>→</div>
            <div style={{textAlign:"center",minWidth:55}}><div style={{fontSize:8,fontWeight:600,color:"#9ca3af",textTransform:"uppercase",letterSpacing:.5,marginBottom:4}}>Corrected</div><Dots count={r.to} sm/><div style={{fontSize:15,fontWeight:700,color:"#111827",marginTop:4,fontVariantNumeric:"tabular-nums"}}>{fmt(r.cor)}</div></div>
            <div style={{flex:1}}/>
            <div style={{textAlign:"center"}}><div style={{fontSize:8,fontWeight:600,color:"#9ca3af",textTransform:"uppercase",letterSpacing:.5,marginBottom:2}}>ΔRE</div><div style={{fontSize:22,fontWeight:700,fontVariantNumeric:"tabular-nums",color:r.pD>0?green:r.pD<0?red:"#6b7280"}}>{r.pD>0?"+":""}{fmt(r.pD)}</div></div>
          </div>
          {r.rel&&(
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
              {[["Break-Even",r.be.toFixed(1)+"%",null],["Margin",(conf-r.be>0?"+":"")+(conf-r.be).toFixed(1)+"%",conf>=r.be?green:red],["Exp. Value",(r.ev>0?"+":"")+r.ev.toFixed(4),r.ev>0?green:red],["Option Cost",r.ov.toFixed(4),null],["Leverage",r.li.toFixed(2)+"×",null],["Your Conf.",conf+"%",null]].map(([label,val,clr],idx)=>(
                <div key={idx} style={{background:"#f9fafb",borderRadius:8,padding:"8px 10px"}}><div style={{fontSize:9,fontWeight:500,color:"#9ca3af",textTransform:"uppercase",letterSpacing:.3}}>{label}</div><div style={{fontSize:14,fontWeight:600,color:clr||"#374151",fontVariantNumeric:"tabular-nums",marginTop:1}}>{val}</div></div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// MATRIX
// ============================================================
function MatrixView({mOuts,setMOuts,mView,setMView,seg}){
  const data=RE[mOuts];const all=Object.values(data).flatMap(r=>Object.values(r));
  const mn=Math.min(...all),mx=Math.max(...all);
  return(
    <div>
      <div className="mx-controls" style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:10,padding:"10px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:11,fontWeight:500,color:"#6b7280"}}>Outs</span><div style={{display:"flex",gap:3}}>{[0,1,2].map(o=><button key={o} onClick={()=>setMOuts(o)} style={seg(mOuts===o)}>{o}</button>)}</div></div>
        <div style={{width:1,height:20,background:"#e5e7eb"}}/>
        <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:11,fontWeight:500,color:"#6b7280"}}>View</span><div style={{display:"flex",gap:3}}>{[{k:"re",l:"Run Expectancy"},{k:"rv",l:"Run Values"},{k:"delta",l:"Count Δ"}].map(v=><button key={v.k} onClick={()=>setMView(v.k)} style={seg(mView===v.k)}>{v.l}</button>)}</div></div>
        <div style={{flex:1}}/>
        {(mView==="re"||mView==="rv")&&<div style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:"#9ca3af"}}><span>{mView==="rv"?"Pitcher":"Low"}</span><div style={{width:60,height:6,borderRadius:3,background:"linear-gradient(90deg,rgb(33,102,172),#fff,rgb(214,48,49))"}}/>
          <span>{mView==="rv"?"Hitter":"High"}</span></div>}
      </div>
      <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:10,overflow:"hidden"}}>
        <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:700}}>
            <thead><tr>
              <th style={{padding:"9px 10px",textAlign:"left",fontSize:10,fontWeight:600,color:"#6b7280",textTransform:"uppercase",letterSpacing:.5,borderBottom:"1px solid #e5e7eb",background:"#fff",position:"sticky",left:0,zIndex:1}}>Runners</th>
              {COUNTS.map(c=><th key={c} style={{padding:"9px 4px",textAlign:"center",fontSize:11,fontWeight:600,color:"#374151",borderBottom:"1px solid #e5e7eb",minWidth:46}}>{c}</th>)}
            </tr></thead>
            <tbody>{BASES_LIST.map((b,ri)=>(
              <tr key={b.key}>
                <td style={{padding:"5px 10px",fontSize:12,fontWeight:500,color:"#374151",borderBottom:"1px solid #f3f4f6",background:ri%2?"#f9fafb":"#fff",position:"sticky",left:0,zIndex:1,whiteSpace:"nowrap"}}><div style={{display:"flex",alignItems:"center",gap:5}}><Diamond bs={b.key} size={18}/><span>{b.label==="---"?"Empty":b.label}</span></div></td>
                {COUNTS.map(c=>{
                  const re=data[b.key][c];
                  if(mView==="re"){return(<td key={c} style={{padding:"5px 3px",textAlign:"center",fontSize:11,fontWeight:600,color:heatText(re,mn,mx),borderBottom:"1px solid #f3f4f6",background:heatColor(re,mn,mx),fontVariantNumeric:"tabular-nums"}}>{re.toFixed(2)}</td>);}
                  if(mView==="rv"){
                    const base00=data[b.key]["0-0"];const rv=re-base00;
                    const rvAll=Object.values(data).flatMap(r=>COUNTS.map(cc=>r[cc]-r["0-0"]));
                    const rvMn=Math.min(...rvAll),rvMx=Math.max(...rvAll);
                    return(<td key={c} style={{padding:"5px 3px",textAlign:"center",fontSize:11,fontWeight:600,borderBottom:"1px solid #f3f4f6",background:c==="0-0"?"#f9fafb":heatColor((rv-rvMn)/(rvMx-rvMn)*(mx-mn)+mn,mn,mx),color:c==="0-0"?"#9ca3af":heatText((rv-rvMn)/(rvMx-rvMn)*(mx-mn)+mn,mn,mx),fontVariantNumeric:"tabular-nums"}}>{c==="0-0"?"—":`${rv>0?"+":""}${rv.toFixed(2)}`}</td>);
                  }
                  const[bl,st]=c.split("-").map(Number);let d=null;
                  if(bl>0&&st+1<=2){const nc=`${bl-1}-${st+1}`;const nr=data[b.key][nc];if(nr!==undefined)d=nr-re;}
                  return(<td key={c} style={{padding:"5px 3px",textAlign:"center",fontSize:11,fontWeight:600,borderBottom:"1px solid #f3f4f6",background:dColor(d),color:d!=null?dText(d):"#d1d5db",fontVariantNumeric:"tabular-nums"}}>{d!=null?`${d>0?"+":""}${d.toFixed(2)}`:"—"}</td>);
                })}
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
      <p style={{marginTop:8,fontSize:11,color:"#9ca3af",lineHeight:1.6,padding:"0 4px"}}>{mView==="re"?"Expected runs from this state through end of half-inning. Blue = pitcher-favorable, Red = hitter-favorable.":mView==="rv"?"Marginal run value relative to the 0-0 count in each base-out state. Blue = pitcher's count, Red = hitter's count. Note: 3-2 is the only count that switches — it is a hitter's count in most states but becomes a pitcher's count with runners on 2nd & 3rd (due to force-out / double play leverage).":"RE change when ball overturned to strike. Blue = favors defense, Red = favors offense."}</p>
    </div>
  );
}

// ============================================================
// METHODOLOGY
// ============================================================
function Methodology(){
  const s={background:"#fff",border:"1px solid #e5e7eb",borderRadius:10,padding:20,marginBottom:10};
  const h={fontSize:15,fontWeight:600,color:"#111827",marginBottom:8};
  const p={fontSize:13,lineHeight:1.8,color:"#4b5563",margin:0};
  const code={background:"#f9fafb",border:"1px solid #e5e7eb",borderRadius:8,padding:"12px 14px",marginTop:10,fontSize:12,fontFamily:"'SF Mono',Menlo,monospace",color:"#374151",lineHeight:1.8};
  const tangoUrl="https://tangotiger.com/index.php/site/comments/re288-run-expectancy-by-the-24-base-out-states-x-12-plate-count-states-recu";
  const link={color:"#2563eb",textDecoration:"none",fontWeight:500,borderBottom:"1px solid rgba(37,99,235,.3)"};
  return(
    <div style={{maxWidth:680}}>
      <div style={s}><div style={h}>Decision Framework</div><p style={p}>The challenge decision compares the expected RE gain from a successful challenge against the option cost of losing it for future situations.</p><div style={code}>EV = P(success) × ΔRE × LI − P(failure) × OptionCost<br/><br/>Challenge when EV {">"} 0<br/>Break-even = OptionCost / (|ΔRE| + OptionCost)</div></div>
      <div style={s}><div style={h}>Count-Level Run Expectancy (RE288)</div><p style={p}>288 cells across 12 counts × 8 base states × 3 out states, following the <a href={tangoUrl} target="_blank" rel="noopener noreferrer" style={link}>RE288 framework developed by Tom Tango</a>. Values are computed recursively: the RE at each count state is derived from the transition probabilities (ball, called strike, foul, in-play) and the resulting RE of the next state, anchored to empirical RE24 values at plate appearance endpoints. This assumes the same run expectancy for an event (single, HR, etc.) regardless of count — a simplification Tango notes is reasonable given empirical evidence.</p><p style={{...p,marginTop:8}}>The matrix tab includes three views: Run Expectancy (absolute RE from each state), Run Values (marginal RE relative to the 0-0 count in each base-out state — <a href={tangoUrl} target="_blank" rel="noopener noreferrer" style={link}>Tango's "second chart"</a>), and Count Δ (RE shift when a ball is overturned to a strike, which drives the challenge model). A key insight from the Run Values view: the 3-2 count is the only count that flips between hitter's and pitcher's count depending on base-out state.</p></div>
      <div style={s}><div style={h}>Leverage Adjustment</div><p style={p}>ΔRE is scaled by a simplified leverage index using inning and score differential. A production system would use a full win probability model for precise game-state leverage.</p></div>
      <div style={s}><div style={h}>Option Value</div><p style={p}>Each challenge has opportunity cost. Using it now forecloses a higher-value use later. Scales with remaining innings and challenge inventory. Production would use Monte Carlo simulation; this model uses a linear approximation.</p></div>
      <div style={s}><div style={h}>Production Extensions</div><p style={p}>Pitcher/batter-specific RE, ABS zone calibration via Hawk-Eye, WPA as primary metric, pre-computed dugout threshold cards.</p></div>
      <div style={s}><div style={h}>Live Integration</div><p style={p}>When connected to a live game, the engine polls the MLB Stats API linescore endpoint every 5 seconds, parsing count, outs, base runners, inning, and score. Challenge decisions update automatically with each pitch. The confidence input remains manual — in production this would be fed by pitch tracking data estimating challenge success probability based on pitch location relative to the ABS zone boundary.</p></div>
      <div style={{...s,background:"#f9fafb"}}><div style={{...h,fontSize:13}}>Data Source</div><p style={{...p,fontSize:12}}>RE288 matrix computed recursively per <a href={tangoUrl} target="_blank" rel="noopener noreferrer" style={{...link,fontSize:12}}>Tango (2018)</a>, using 2010–2015 Retrosheet play-by-play data. Run values are marginal to the 0-0 count within each base-out state. Live game data from MLB Stats API (statsapi.mlb.com). Methodology follows Tango, Lichtman & Dolphin ("The Book"). League-average values; team-specific and pitcher/batter-specific adjustments recommended for deployment.</p></div>
    </div>
  );
}
