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

// Walk base-state transitions: batter to 1st, forced runners advance
const WALK_MAP={"000":"100","100":"110","010":"110","110":"111","001":"101","101":"111","011":"111","111":"111"};
const WALK_RUNS={"111":1}; // only bases-loaded walk scores a run

function getTrans(c,outs,bases){
  const[b,s]=c.split("-").map(Number);const t=[];
  if(b>0&&s+1<=2)t.push({type:"b2s",label:"Ball → Strike",from:c,to:`${b-1}-${s+1}`,desc:"Overturned to strike",terminal:false});
  else if(b>0&&s===2)t.push({type:"b2s",label:"Ball → Strikeout",from:c,to:"K",desc:"Overturned to strike → K",terminal:true,newOuts:outs+1,newBases:bases,newCount:"0-0",runs:0});
  if(s>0&&b+1<=3)t.push({type:"s2b",label:"Strike → Ball",from:c,to:`${b+1}-${s-1}`,desc:"Overturned to ball",terminal:false});
  else if(s>0&&b===3)t.push({type:"s2b",label:"Strike → Walk",from:c,to:"BB",desc:"Overturned to ball → BB",terminal:true,newOuts:outs,newBases:WALK_MAP[bases]||"100",newCount:"0-0",runs:WALK_RUNS[bases]||0});
  return t;
}
const fmt=v=>v==null?"—":v.toFixed(3);
function heatColor(v,mn,mx){const t=Math.max(0,Math.min(1,(v-mn)/(mx-mn)));if(t<.5){const s=t/.5;return`rgb(${Math.round(33+(255-33)*s)},${Math.round(102+(255-102)*s)},${Math.round(172+(255-172)*s)})`}const s=(t-.5)/.5;return`rgb(${Math.round(255-(255-214)*s)},${Math.round(255-(255-48)*s)},${Math.round(255-(255-49)*s)})`}
function heatText(v,mn,mx){const t=Math.max(0,Math.min(1,(v-mn)/(mx-mn)));return(t<.2||t>.8)?"#fff":"#333"}
function dColor(d){if(d==null)return"transparent";const t=Math.min(Math.abs(d)/.45,1);if(d<0)return`rgb(${Math.round(255-(255-33)*t)},${Math.round(255-(255-102)*t)},${Math.round(255-(255-172)*t)})`;return`rgb(${Math.round(255-(255-214)*t)},${Math.round(255-(255-48)*t)},${Math.round(255-(255-49)*t)})`}
function dText(d){return d!=null&&Math.abs(d)>.2?"#fff":"#333"}

// ============================================================
// MLB API HOOKS
// ============================================================
const API="https://statsapi.mlb.com/api/v1";
const LG_OPS=0.719; // 2025 MLB league-average OPS

// Tango's ABS Challenge Thresholds (Feb 2025)
// Minimum confidence % needed to justify a challenge
// Access: TANGO[bases][outs][strikes][balls]
const TANGO={"000":{0:[[73,60,50,46],[80,70,60,56],[88,82,76,73]],1:[[71,64,51,37],[78,72,61,47],[85,82,75,65]],2:[[55,50,40,24],[63,59,49,32],[73,69,62,47]]},"100":{0:[[63,50,39,35],[70,59,49,45],[78,72,64,60]],1:[[61,54,40,28],[65,60,49,37],[71,69,62,51]],2:[[44,39,30,17],[48,44,35,22],[56,51,43,31]]},"010":{0:[[65,60,52,47],[72,68,61,57],[76,79,76,73]],1:[[56,54,48,39],[61,60,56,48],[63,64,67,66]],2:[[39,34,28,19],[44,40,33,25],[46,42,37,31]]},"110":{0:[[54,41,32,28],[59,47,37,33],[67,62,55,50]],1:[[50,44,32,22],[54,48,37,26],[56,54,50,42]],2:[[33,29,22,12],[37,32,25,15],[39,34,29,20]]},"001":{0:[[66,58,49,45],[64,67,63,59],[74,77,74,70]],1:[[57,54,47,36],[49,50,52,50],[61,62,64,63]],2:[[40,36,29,19],[32,28,24,19],[44,39,34,28]]},"101":{0:[[58,50,41,37],[58,56,50,45],[66,65,60,55]],1:[[49,46,39,29],[45,45,43,37],[53,53,52,46]],2:[[32,28,23,15],[29,25,21,15],[36,32,27,20]]},"011":{0:[[61,58,51,46],[59,66,66,61],[65,70,69,65]],1:[[50,48,45,38],[42,43,50,53],[49,50,55,56]],2:[[33,29,24,17],[26,23,19,17],[32,28,24,20]]},"111":{0:[[48,37,29,25],[47,37,29,25],[48,37,29,25]],1:[[43,38,28,19],[41,36,28,19],[42,37,28,19]],2:[[27,24,18,10],[26,22,17,10],[27,23,18,10]]}};
const getTangoThresh=(bases,outs,balls,strikes)=>TANGO[bases]?.[outs]?.[strikes]?.[balls]??50;
const getTier=(thresh)=>thresh<=25?{label:"Challenge",sub:"Even a hunch is enough",color:"#2563eb",bg:"#eff6ff",border:"#bfdbfe"}:thresh<=45?{label:"Lean challenge",sub:"Worth it if it looked wrong",color:"#16a34a",bg:"#f0fdf4",border:"#bbf7d0"}:thresh<=65?{label:"Toss-up",sub:"Only if you saw it clearly",color:"#d97706",bg:"#fffbeb",border:"#fde68a"}:thresh<=80?{label:"Lean hold",sub:"Need to be pretty sure",color:"#ea580c",bg:"#fff7ed",border:"#fed7aa"}:{label:"Hold",sub:"Only challenge if certain",color:"#dc2626",bg:"#fef2f2",border:"#fecaca"};

function usePlayerStats(gamePk,mode){
  const[stats,setStats]=useState({}); // {playerId: {ops, type:'batter'|'pitcher', name}}
  const[loading,setLoading]=useState(false);
  const fetched=useRef(null);

  useEffect(()=>{
    if(mode!=="live"||!gamePk||fetched.current===gamePk){return;}
    let cancelled=false;
    async function load(){
      setLoading(true);
      try{
        // Step 1: get boxscore for player IDs
        const bRes=await fetch(`${API}/game/${gamePk}/boxscore`);
        if(!bRes.ok)throw new Error("Boxscore fetch failed");
        const box=await bRes.json();
        // Extract all player IDs and classify as batter or pitcher
        const ids=new Set();
        const classify={}; // id -> 'batter' | 'pitcher'
        for(const side of["away","home"]){
          const players=box.teams?.[side]?.players||{};
          for(const[,p]of Object.entries(players)){
            const id=p.person?.id;if(!id)continue;
            ids.add(id);
            classify[id]=p.primaryPosition?.type==="Pitcher"||p.position?.type==="Pitcher"?"pitcher":"batter";
          }
        }
        if(ids.size===0){setLoading(false);return;}
        // Step 2: batch hydrate regular season stats
        const idArr=[...ids];
        const chunks=[];
        for(let i=0;i<idArr.length;i+=40)chunks.push(idArr.slice(i,i+40)); // API limit safety
        const map={};
        const season=new Date().getFullYear();
        for(const chunk of chunks){
          const url=`${API}/people?personIds=${chunk.join(",")}&hydrate=stats(group=[hitting,pitching],type=[season],season=${season})`;
          const pRes=await fetch(url);
          if(!pRes.ok)continue;
          const pData=await pRes.json();
          for(const person of(pData.people||[])){
            const id=person.id;
            const type=classify[id]||"batter";
            let ops=null;
            if(type==="pitcher"){
              // Look for pitching stats → OPS-against
              const pitchSplits=person.stats?.find(s=>s.group?.displayName==="pitching"&&s.type?.displayName==="season");
              const st=pitchSplits?.splits?.find(sp=>sp.gameType==="R")?.stat;
              if(st){
                const obp=parseFloat(st.obp)||0;
                const slg=parseFloat(st.slg)||0;
                // If slg is available use it, otherwise compute from components
                if(slg>0){ops=obp+slg;}
                else if(st.atBats>0){
                  const tb=(parseInt(st.hits)||0)+(parseInt(st.doubles)||0)+2*(parseInt(st.triples)||0)+3*(parseInt(st.homeRuns)||0);
                  ops=obp+tb/parseInt(st.atBats);
                }
              }
            }else{
              // Look for hitting stats → OPS
              const hitSplits=person.stats?.find(s=>s.group?.displayName==="hitting"&&s.type?.displayName==="season");
              const st=hitSplits?.splits?.find(sp=>sp.gameType==="R")?.stat;
              if(st)ops=parseFloat(st.ops)||null;
            }
            map[id]={ops,type,name:person.fullName||""};
          }
        }
        if(!cancelled){setStats(map);fetched.current=gamePk;}
      }catch(e){console.warn("Player stats fetch failed:",e)}
      finally{if(!cancelled)setLoading(false)}
    }
    load();
    return()=>{cancelled=true};
  },[gamePk,mode]);

  return{stats,loading};
}

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
  const timeoutRef=useRef(null);

  useEffect(()=>{
    if(!gamePk){setState(null);setErr(null);return;}
    let cancelled=false;
    async function poll(){
      try{
        const controller=new AbortController();
        const tid=setTimeout(()=>controller.abort(),8000); // 8s timeout
        const res=await fetch(`${API}/game/${gamePk}/linescore`,{signal:controller.signal});
        clearTimeout(tid);
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
        const batterId=d.offense?.batter?.id||null;
        const pitcherId=d.defense?.pitcher?.id||null;
        setState({
          balls,strikes,outs:Math.min(outs_val,2),inn,isTop,
          away,home,
          bases:`${first}${second}${third}`,
          count:`${balls}-${strikes}`,
          batter,pitcher,batterId,pitcherId,
        });
        setErr(null);
      }catch(e){if(!cancelled)setErr(e.name==="AbortError"?"Connection timed out":e.message)}
      finally{if(!cancelled)timeoutRef.current=setTimeout(poll,5000);} // schedule next poll after completion
    }
    poll();
    return()=>{cancelled=true;clearTimeout(timeoutRef.current)};
  },[gamePk]);

  return{state,err};
}

// ============================================================
// DEMO: 2025 WORLD SERIES GAME 7 (LAD 5, TOR 4 — 11 inn)
// ============================================================
const HEADSHOT="https://content.mlb.com/images/headshots/current/60x60/";
const lastName=n=>{if(!n)return"";const p=n.split(" ");if(p.length<=1)return n;const last=p[p.length-1];if(["Jr.","Sr.","II","III","IV"].includes(last))return p[p.length-2]+" "+last;return last;};
const DEMO_STATS={571970:{ops:.846,type:"batter",name:"Max Muncy"},605135:{ops:.740,type:"pitcher",name:"Chris Bassitt"},605483:{ops:.622,type:"pitcher",name:"Blake Snell"},606192:{ops:.738,type:"batter",name:"Teoscar Hernández"},607192:{ops:.589,type:"pitcher",name:"Tyler Glasnow"},622554:{ops:.616,type:"pitcher",name:"Seranthony Domínguez"},656546:{ops:.745,type:"pitcher",name:"Jeff Hoffman"},660271:{ops:.574,type:"pitcher",name:"Shohei Ohtani"},665489:{ops:.848,type:"batter",name:"Vladimir Guerrero Jr."},665926:{ops:.598,type:"batter",name:"Andrés Giménez"},666182:{ops:.840,type:"batter",name:"Bo Bichette"},669257:{ops:.901,type:"batter",name:"Will Smith"},669456:{ops:.681,type:"pitcher",name:"Shane Bieber"},672386:{ops:.769,type:"batter",name:"Alejandro Kirk"},676914:{ops:.797,type:"batter",name:"Davis Schneider"},702056:{ops:.596,type:"pitcher",name:"Trey Yesavage"},808967:{ops:.540,type:"pitcher",name:"Yoshinobu Yamamoto"}};
const DEMO_PLAYS=[
  {label:"Hernández vs Bassitt",sub:"Top 6 · 0 out · 1st & 2nd · LAD 1, TOR 3",note:"Ump scorecard's #1 most impactful missed call. Strike called a ball on 1-1 count — runners on 1st and 2nd with nobody out.",count:"1-1",outs:0,bases:"110",inn:6,isTop:true,away:1,home:3,batterId:606192,pitcherId:605135,batter:"Teoscar Hernández",pitcher:"Chris Bassitt"},
  {label:"Giménez vs Glasnow",sub:"Bot 6 · 0 out · Runner on 1st · LAD 2, TOR 4",note:"5 called pitches in this at-bat — a full-count battle. Giménez doubles to drive in the run. Runner on 1st, nobody out.",count:"3-2",outs:0,bases:"100",inn:6,isTop:false,away:2,home:4,batterId:665926,pitcherId:607192,batter:"Andrés Giménez",pitcher:"Tyler Glasnow"},
  {label:"Muncy HR off Yesavage",sub:"Top 8 · 1 out · Bases empty · LAD 2, TOR 4",note:"Down 2 in the 8th, Muncy launches a solo homer to cut the deficit. Called strike on 0-1, then ball on 1-1.",count:"1-1",outs:1,bases:"000",inn:8,isTop:true,away:2,home:4,batterId:571970,pitcherId:702056,batter:"Max Muncy",pitcher:"Trey Yesavage"},
  {label:"Schneider vs Snell",sub:"Bot 8 · 2 out · Runner on 2nd · LAD 3, TOR 4",note:"Snell protecting a 1-run lead. Called strike on 0-1, then the pivotal called strike on 2-2 — ball called a strike per ump scorecard (#3 most impactful).",count:"2-2",outs:2,bases:"010",inn:8,isTop:false,away:3,home:4,batterId:676914,pitcherId:605483,batter:"Davis Schneider",pitcher:"Blake Snell"},
  {label:"Smith called K",sub:"Top 9 · 2 out · Bases empty · Tied 4-4",note:"6 called pitches — the most in any at-bat. Game-tying run already in. Hoffman gets Smith looking on a full count. Called strike 3 per ump scorecard was ball called strike (#2 most impactful).",count:"3-2",outs:2,bases:"000",inn:9,isTop:true,away:4,home:4,batterId:669257,pitcherId:656546,batter:"Will Smith",pitcher:"Jeff Hoffman"},
  {label:"Kirk HBP — challenged!",sub:"Bot 9 · 1 out · 1st & 2nd · Tied 4-4",note:"Bases loaded in the 9th. Dodgers actually challenged this HBP call — upheld. Kirk hit by pitch loads the bases with 1 out in a tie game.",count:"0-1",outs:1,bases:"110",inn:9,isTop:false,away:4,home:4,batterId:672386,pitcherId:808967,batter:"Alejandro Kirk",pitcher:"Yoshinobu Yamamoto"},
  {label:"Hernández walks, bases loaded",sub:"Top 10 · 1 out · 1st & 2nd · Tied 4-4",note:"Extras. Bases loaded with 1 out. 4 called pitches including the walk on 3-2. A challenge on a ball/strike here changes everything.",count:"3-2",outs:1,bases:"110",inn:10,isTop:true,away:4,home:4,batterId:606192,pitcherId:622554,batter:"Teoscar Hernández",pitcher:"Seranthony Domínguez"},
  {label:"Smith go-ahead HR",sub:"Top 11 · 2 out · Bases empty · Tied 4-4",note:"Will Smith homers off Bieber to break the tie in the 11th. 2 called balls early in the count.",count:"2-0",outs:2,bases:"000",inn:11,isTop:true,away:4,home:4,batterId:669257,pitcherId:669456,batter:"Will Smith",pitcher:"Shane Bieber"},
  {label:"Vlad Jr. double",sub:"Bot 11 · 0 out · Bases empty · LAD 5, TOR 4",note:"Down 1 in the bottom of the 11th. Vlad Jr. rips a double — 5 called pitches in a full-count battle. Tying run in scoring position.",count:"3-2",outs:0,bases:"000",inn:11,isTop:false,away:5,home:4,batterId:665489,pitcherId:808967,batter:"Vladimir Guerrero Jr.",pitcher:"Yoshinobu Yamamoto"},
  {label:"Kirk GIDP — game over",sub:"Bot 11 · 1 out · 1st & 3rd · LAD 5, TOR 4",note:"Tying run on 3rd, 1 out. Kirk grounds into a double play to end the World Series. Called strike on 0-2 — was it worth challenging?",count:"0-2",outs:1,bases:"101",inn:11,isTop:false,away:5,home:4,batterId:672386,pitcherId:808967,batter:"Alejandro Kirk",pitcher:"Yoshinobu Yamamoto"},
];

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
  const[inn,setInn]=useState(5);
  const[persp,setPersp]=useState("offense");
  // Live game state
  const[selectedGame,setSelectedGame]=useState(null);
  const[mode,setMode]=useState("manual"); // "manual" | "live" | "demo"
  const[demoIdx,setDemoIdx]=useState(0);
  const demoPlay=DEMO_PLAYS[demoIdx]||DEMO_PLAYS[0];
  const{games,loading:gamesLoading}=useTodaysGames();
  const{state:liveState}=useLiveGame(mode==="live"?selectedGame:null);
  const{stats:playerStats,loading:statsLoading}=usePlayerStats(selectedGame,mode);
  // Matrix state
  const[mOuts,setMOuts]=useState(0);
  const[mView,setMView]=useState("re");

  // Matchup multiplier (live and demo mode)
  const matchup=useMemo(()=>{
    if(mode==="demo"){
      const bSt=DEMO_STATS[demoPlay.batterId],pSt=DEMO_STATS[demoPlay.pitcherId];
      const bOps=bSt?.ops,pOps=pSt?.ops;
      let mult=1;
      if(bOps!=null&&bOps>0&&pOps!=null&&pOps>0){
        mult=Math.max(0.5,Math.min(2.0,(bOps/LG_OPS)*(pOps/LG_OPS)));
      }
      return{mult,batterOps:bOps,pitcherOps:pOps,batterName:bSt?.name||"",pitcherName:pSt?.name||""};
    }
    if(mode!=="live"||!liveState)return{mult:1,batterOps:null,pitcherOps:null,batterName:"",pitcherName:""};
    const bId=liveState.batterId,pId=liveState.pitcherId;
    const bSt=bId&&playerStats[bId],pSt=pId&&playerStats[pId];
    const bOps=bSt?.ops,pOps=pSt?.ops;
    let mult=1;
    if(bOps!=null&&bOps>0&&pOps!=null&&pOps>0){
      mult=Math.max(0.5,Math.min(2.0,(bOps/LG_OPS)*(pOps/LG_OPS)));
    }
    return{mult,batterOps:bOps,pitcherOps:pOps,batterName:bSt?.name||"",pitcherName:pSt?.name||""};
  },[mode,liveState,playerStats,demoPlay]);

  // Derived: which game state to use
  const activeCount=mode==="live"&&liveState?liveState.count:mode==="demo"?demoPlay.count:count;
  const activeOuts=mode==="live"&&liveState?liveState.outs:mode==="demo"?demoPlay.outs:outs;
  const activeBs=mode==="live"&&liveState?liveState.bases:mode==="demo"?demoPlay.bases:bs;
  const activeInn=mode==="live"&&liveState?liveState.inn:mode==="demo"?demoPlay.inn:inn;

  const liveGames=games.filter(g=>g.status?.abstractGameState==="Live");
  const scheduledGames=games.filter(g=>g.status?.abstractGameState==="Preview");
  const finalGames=games.filter(g=>g.status?.abstractGameState==="Final");

  const analysis=useMemo(()=>{
    const c=activeCount,o=activeOuts,b=activeBs;
    if(!RE[o]?.[b]?.[c])return null;
    const cur=RE[o][b][c];
    const[balls,strikes]=c.split("-").map(Number);
    const thresh=getTangoThresh(b,o,balls,strikes);
    const tier=getTier(thresh);
    return{cur,thresh,tier,results:getTrans(c,o,b).map(t=>{
      let cor;
      if(t.terminal){
        if(t.newOuts>=3)cor=0;
        else cor=(RE[t.newOuts]?.[t.newBases]?.["0-0"]??null);
        if(cor===null)return null;
        cor=cor+t.runs;
      }else{
        cor=RE[o]?.[b]?.[t.to];if(cor===undefined)return null;
      }
      const dRE=cor-cur;
      const adjRE=dRE*matchup.mult;
      const pD=persp==="offense"?adjRE:-adjRE;
      // Compute the corrected-count threshold too
      let toThresh=null,toTier=null;
      if(!t.terminal){const[tb,ts]=t.to.split("-").map(Number);toThresh=getTangoThresh(b,o,tb,ts);toTier=getTier(toThresh);}
      else if(t.to==="K"){toThresh=null;toTier=null;} // terminal — no further challenge
      else if(t.to==="BB"){toThresh=null;toTier=null;}
      return{...t,cur,cor,dRE,adjRE,pD,thresh,tier,toThresh,toTier,rel:pD>0,mult:matchup.mult};
    }).filter(Boolean)};
  },[activeCount,activeOuts,activeBs,persp,matchup]);

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
                      Live{liveGames.length>0&&` (${liveGames.length})`}
                    </button>
                    <button onClick={()=>setMode("demo")} style={{...seg(mode==="demo"),background:mode==="demo"?"#1e40af":"#f3f4f6",color:mode==="demo"?"#fff":"#6b7280"}}>
                      WS G7
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
                          {(liveState.batter||liveState.pitcher)&&(()=>{
                            const bId=liveState.batterId,pId=liveState.pitcherId;
                            const bSt=bId&&playerStats[bId],pSt=pId&&playerStats[pId];
                            const bOps=bSt?.ops,pOps=pSt?.ops;
                            const bF=bOps?bOps/LG_OPS:1,pF=pOps?pOps/LG_OPS:1;
                            const bAdv=bF-1,pAdv=1-pF,diff=bAdv-pAdv,thresh=0.05;
                            const bEdge=diff>thresh,pEdge=diff<-thresh;
                            const bBord=bEdge?"#16a34a":pEdge?"#dc2626":"#9ca3af";
                            const pBord=pEdge?"#16a34a":bEdge?"#dc2626":"#9ca3af";
                            return <div style={{display:"flex",gap:8,marginTop:6}}>
                              {bId&&(
                                <div style={{display:"flex",alignItems:"center",gap:6,flex:1,background:"#ecfdf5",borderRadius:6,padding:"4px 6px",borderLeft:`3px solid ${bBord}`}}>
                                  <img src={`${HEADSHOT}${bId}.png`} alt="" style={{width:28,height:28,borderRadius:"50%",objectFit:"cover",flexShrink:0}} onError={e=>{e.target.style.display="none"}}/>
                                  <div style={{minWidth:0}}><div style={{fontSize:8,fontWeight:600,color:"#9ca3af",textTransform:"uppercase",letterSpacing:.3}}>AB</div><div style={{fontSize:10,fontWeight:600,color:"#166534",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{lastName(liveState.batter)}</div>{bOps!=null&&<div style={{fontSize:9,color:bBord,fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{bOps.toFixed(3)} OPS</div>}</div>
                                </div>
                              )}
                              {pId&&(
                                <div style={{display:"flex",alignItems:"center",gap:6,flex:1,background:"#ecfdf5",borderRadius:6,padding:"4px 6px",borderLeft:`3px solid ${pBord}`}}>
                                  <img src={`${HEADSHOT}${pId}.png`} alt="" style={{width:28,height:28,borderRadius:"50%",objectFit:"cover",flexShrink:0}} onError={e=>{e.target.style.display="none"}}/>
                                  <div style={{minWidth:0}}><div style={{fontSize:8,fontWeight:600,color:"#9ca3af",textTransform:"uppercase",letterSpacing:.3}}>P</div><div style={{fontSize:10,fontWeight:600,color:"#166534",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{lastName(liveState.pitcher)}</div>{pOps!=null&&<div style={{fontSize:9,color:pBord,fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{pOps.toFixed(3)} OPA</div>}</div>
                                </div>
                              )}
                            </div>;
                          })()}
                          {matchup.mult!==1&&(()=>{
                            const pct=(matchup.mult-1)*100;
                            const col=pct>0?"#16a34a":"#dc2626";
                            return <div style={{marginTop:4,padding:"4px 6px",background:pct>0?"#f0fdf4":"#fef2f2",borderRadius:4,fontSize:10}}>
                              <span style={{fontWeight:600,color:col}}>Matchup: {pct>0?"+":""}{pct.toFixed(0)}% ΔRE</span>
                            </div>;
                          })()}
                          {statsLoading&&<div style={{fontSize:10,color:"#9ca3af",marginTop:2}}>Loading player stats...</div>}
                          <div style={{fontSize:10,color:"#4ade80",marginTop:2}}>Auto-updating every 5s</div>
                        </div>
                      )}
                    </div>
                  )}

                  {mode==="demo"&&(
                    <div>
                      <div style={{fontSize:11,fontWeight:600,color:"#1e40af",marginBottom:6}}>2025 World Series Game 7</div>
                      <div style={{fontSize:10,color:"#6b7280",marginBottom:8}}>LAD 5, TOR 4 (11 inn) · Rogers Centre</div>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                        <button onClick={()=>setDemoIdx(i=>Math.max(0,i-1))} disabled={demoIdx===0} style={{width:28,height:28,borderRadius:6,border:"1px solid #e5e7eb",background:demoIdx===0?"#f9fafb":"#fff",color:demoIdx===0?"#d1d5db":"#374151",cursor:demoIdx===0?"default":"pointer",fontSize:14,fontWeight:700,fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
                        <div style={{flex:1,textAlign:"center",fontSize:10,color:"#9ca3af",fontWeight:500}}>{demoIdx+1} / {DEMO_PLAYS.length}</div>
                        <button onClick={()=>setDemoIdx(i=>Math.min(DEMO_PLAYS.length-1,i+1))} disabled={demoIdx===DEMO_PLAYS.length-1} style={{width:28,height:28,borderRadius:6,border:"1px solid #e5e7eb",background:demoIdx===DEMO_PLAYS.length-1?"#f9fafb":"#fff",color:demoIdx===DEMO_PLAYS.length-1?"#d1d5db":"#374151",cursor:demoIdx===DEMO_PLAYS.length-1?"default":"pointer",fontSize:14,fontWeight:700,fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
                      </div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:10}}>
                        {DEMO_PLAYS.map((dp,di)=>(
                          <button key={di} onClick={()=>setDemoIdx(di)} style={{padding:"3px 7px",borderRadius:5,fontSize:9,fontWeight:demoIdx===di?700:400,border:"none",cursor:"pointer",background:demoIdx===di?"#1e40af":"#eff6ff",color:demoIdx===di?"#fff":"#3b82f6",transition:"all .12s",fontFamily:"inherit"}}>{di+1}</button>
                        ))}
                      </div>
                      <div style={{background:"#eff6ff",borderRadius:8,padding:"8px 10px",fontSize:11,color:"#1e3a5f",lineHeight:1.6}}>
                        <div style={{fontWeight:700,fontSize:12,marginBottom:4}}>{demoPlay.label}</div>
                        <div style={{fontSize:10,color:"#64748b",marginBottom:6}}>{demoPlay.sub}</div>
                        {(()=>{
                          const bSt=DEMO_STATS[demoPlay.batterId],pSt=DEMO_STATS[demoPlay.pitcherId];
                          const bF=bSt?.ops?bSt.ops/LG_OPS:1,pF=pSt?.ops?pSt.ops/LG_OPS:1;
                          const bAdv=bF-1,pAdv=1-pF,diff=bAdv-pAdv,thresh=0.05;
                          const bEdge=diff>thresh,pEdge=diff<-thresh;
                          const bBord=bEdge?"#16a34a":pEdge?"#dc2626":"#9ca3af";
                          const pBord=pEdge?"#16a34a":bEdge?"#dc2626":"#9ca3af";
                          return <div style={{display:"flex",gap:8,marginBottom:6}}>
                          <div style={{display:"flex",alignItems:"center",gap:6,flex:1,background:"#dbeafe",borderRadius:6,padding:"4px 6px",borderLeft:`3px solid ${bBord}`}}>
                            <img src={`${HEADSHOT}${demoPlay.batterId}.png`} alt="" style={{width:28,height:28,borderRadius:"50%",objectFit:"cover",flexShrink:0}} onError={e=>{e.target.style.display="none"}}/>
                            <div style={{minWidth:0}}><div style={{fontSize:8,fontWeight:600,color:"#9ca3af",textTransform:"uppercase",letterSpacing:.3}}>AB</div><div style={{fontSize:10,fontWeight:600,color:"#1e3a5f",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{lastName(demoPlay.batter)}</div>{bSt?.ops!=null&&<div style={{fontSize:9,color:bBord,fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{bSt.ops.toFixed(3)} OPS</div>}</div>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:6,flex:1,background:"#dbeafe",borderRadius:6,padding:"4px 6px",borderLeft:`3px solid ${pBord}`}}>
                            <img src={`${HEADSHOT}${demoPlay.pitcherId}.png`} alt="" style={{width:28,height:28,borderRadius:"50%",objectFit:"cover",flexShrink:0}} onError={e=>{e.target.style.display="none"}}/>
                            <div style={{minWidth:0}}><div style={{fontSize:8,fontWeight:600,color:"#9ca3af",textTransform:"uppercase",letterSpacing:.3}}>P</div><div style={{fontSize:10,fontWeight:600,color:"#1e3a5f",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{lastName(demoPlay.pitcher)}</div>{pSt?.ops!=null&&<div style={{fontSize:9,color:pBord,fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{pSt.ops.toFixed(3)} OPA</div>}</div>
                          </div>
                        </div>;
                        })()}
                        {matchup.mult!==1&&(()=>{
                          const pct=(matchup.mult-1)*100;
                          const col=pct>0?"#16a34a":"#dc2626";
                          return <div style={{padding:"3px 6px",background:pct>0?"#f0fdf4":"#fef2f2",borderRadius:4,fontSize:10,marginBottom:4}}>
                            <span style={{fontWeight:600,color:col}}>Matchup: {pct>0?"+":""}{pct.toFixed(0)}% ΔRE</span>
                          </div>;
                        })()}
                        <div style={{fontSize:10,color:"#64748b",lineHeight:1.5,marginTop:4}}>{demoPlay.note}</div>
                      </div>
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
                      <div style={{display:"flex",gap:12,justifyContent:"flex-end",alignItems:"flex-end"}}>
                        <div style={{textAlign:"center"}}>
                          <div style={{fontSize:9,fontWeight:500,color:"#9ca3af",textTransform:"uppercase",letterSpacing:.5}}>Run Exp</div>
                          <div style={{fontSize:22,fontWeight:700,color:"#111827",letterSpacing:-.5,lineHeight:1,fontVariantNumeric:"tabular-nums",marginTop:2}}>{analysis?fmt(analysis.cur):"—"}</div>
                        </div>
                      </div>
                      {analysis&&<div style={{marginTop:4,display:"flex",justifyContent:"flex-end"}}><ConfidenceMeter thresh={analysis.thresh}/></div>}
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
                    <div style={{marginBottom:10}}>
                      <div><label style={{fontSize:11,fontWeight:500,color:"#6b7280",display:"block",marginBottom:4}}>Inning</label><select value={inn} onChange={e=>setInn(+e.target.value)} style={sel}>{[1,2,3,4,5,6,7,8,9,10,11,12].map(i=><option key={i} value={i}>{i}{["st","nd","rd"][i-1]||"th"}</option>)}</select></div>
                    </div>
                  )}
                  {mode==="live"&&liveState&&(
                    <div style={{display:"flex",gap:12,marginBottom:10,fontSize:12,color:"#6b7280"}}>
                      <span>{liveState.isTop?"Top":"Bot"} {liveState.inn}</span>
                      <span>Score: {liveState.away}–{liveState.home}</span>
                    </div>
                  )}
                  {mode==="demo"&&(
                    <div style={{display:"flex",gap:12,marginBottom:10,fontSize:12,color:"#6b7280"}}>
                      <span>{demoPlay.isTop?"Top":"Bot"} {demoPlay.inn}</span>
                      <span>LAD {demoPlay.away} – TOR {demoPlay.home}</span>
                    </div>
                  )}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
                    <div><label style={{fontSize:11,fontWeight:500,color:"#6b7280",display:"block",marginBottom:4}}>Perspective</label><div style={{display:"flex",gap:3}}>{[["offense","Batting"],["defense","Pitching"]].map(([p,l])=><button key={p} onClick={()=>setPersp(p)} style={{...seg(persp===p),fontSize:11}}>{l}</button>)}</div></div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div style={{minHeight:120}}>
              {matchup.mult!==1&&analysis?.results?.length>0&&(()=>{
                const mpct=(matchup.mult-1)*100;
                const col=mpct>0?"#16a34a":mpct<0?"#dc2626":"#6b7280";
                return <div style={{background:mpct>0?"#f0fdf4":"#fef2f2",border:`1px solid ${mpct>0?"#bbf7d0":"#fecaca"}`,borderRadius:8,padding:"8px 12px",marginBottom:10,fontSize:12,fontWeight:600,color:col}}>
                  Challenges worth {mpct>0?"+":""}{mpct.toFixed(0)}% this AB
                </div>;
              })()}
              {analysis?.results?.map((r,i)=><ChallengeCard key={`${r.from}-${r.to}`} r={r} persp={persp} mode={mode}/>)}
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
function ChallengeCard({r,persp,mode}){
  const[open,setOpen]=useState(false);
  const green="#16a34a",red="#dc2626";
  const mpct=r.mult!==1?((r.mult-1)*100):0;
  const tier=r.tier;

  return(
    <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:10,marginBottom:10,overflow:"hidden",opacity:r.rel?1:.45}}>
      <div style={{padding:"12px 14px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
          <span style={{fontSize:11,fontWeight:600,color:r.type==="s2b"?green:red}}>{r.label}</span>
          {!r.rel&&<span style={{fontSize:11,color:"#9ca3af"}}>Opponent</span>}
        </div>

        {/* Main layout: left = Called→Corrected, right = meter */}
        <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:8}}>
          {/* Called → Corrected */}
          <div style={{flex:1,display:"flex",alignItems:"center",gap:10,background:"#f9fafb",borderRadius:8,padding:"8px 10px"}}>
            <div style={{textAlign:"center",minWidth:48}}><div style={{fontSize:8,fontWeight:600,color:"#9ca3af",textTransform:"uppercase",letterSpacing:.5,marginBottom:3}}>Called</div><Dots count={r.from} sm/></div>
            <div style={{fontSize:14,color:"#d1d5db",flexShrink:0}}>→</div>
            <div style={{textAlign:"center",minWidth:48}}><div style={{fontSize:8,fontWeight:600,color:"#9ca3af",textTransform:"uppercase",letterSpacing:.5,marginBottom:3}}>Corrected</div>{r.terminal?<div style={{fontSize:13,fontWeight:700,color:r.to==="BB"?green:red,padding:"2px 0"}}>{r.to}</div>:<Dots count={r.to} sm/>}</div>
            <div style={{flex:1}}/>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:20,fontWeight:700,fontVariantNumeric:"tabular-nums",color:r.pD>0?green:r.pD<0?red:"#6b7280"}}>{r.pD>0?"+":""}{fmt(r.pD)}</div>
              <div style={{fontSize:8,fontWeight:600,color:"#9ca3af",textTransform:"uppercase",letterSpacing:.3}}>{r.mult!==1?"Adj ΔRE":"ΔRE"}</div>
            </div>
          </div>

          {/* Confidence meter */}
          {r.rel&&<ConfidenceMeter thresh={r.thresh}/>}
        </div>

        <button onClick={()=>setOpen(o=>!o)} style={{background:"none",border:"none",cursor:"pointer",padding:0,fontSize:10,color:"#9ca3af",fontFamily:"inherit",display:"flex",alignItems:"center",gap:3}}>
          {open?"Hide":"Show"} math
          <svg width="10" height="10" viewBox="0 0 12 12" style={{transform:open?"rotate(180deg)":"rotate(0deg)",transition:"transform .2s"}}><path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </button>
      </div>

      {open&&(
        <div style={{borderTop:"1px solid #f3f4f6",padding:"12px 14px"}}>
          <div style={{display:"flex",alignItems:"center",gap:12,background:"#f9fafb",borderRadius:8,padding:12}}>
            <div style={{textAlign:"center",minWidth:55}}><div style={{fontSize:8,fontWeight:600,color:"#9ca3af",textTransform:"uppercase",letterSpacing:.5,marginBottom:4}}>Called</div><Dots count={r.from} sm/><div style={{fontSize:15,fontWeight:700,color:"#111827",marginTop:4,fontVariantNumeric:"tabular-nums"}}>{fmt(r.cur)}</div></div>
            <div style={{fontSize:16,color:"#d1d5db",flexShrink:0}}>→</div>
            <div style={{textAlign:"center",minWidth:55}}><div style={{fontSize:8,fontWeight:600,color:"#9ca3af",textTransform:"uppercase",letterSpacing:.5,marginBottom:4}}>Corrected</div>{r.terminal?<div style={{fontSize:14,fontWeight:700,color:r.to==="BB"?green:red,padding:"4px 0"}}>{r.to}</div>:<Dots count={r.to} sm/>}<div style={{fontSize:15,fontWeight:700,color:"#111827",marginTop:4,fontVariantNumeric:"tabular-nums"}}>{fmt(r.cor)}</div></div>
            <div style={{flex:1}}/>
            <div style={{textAlign:"center"}}><div style={{fontSize:8,fontWeight:600,color:"#9ca3af",textTransform:"uppercase",letterSpacing:.5,marginBottom:2}}>Raw ΔRE</div><div style={{fontSize:18,fontWeight:700,fontVariantNumeric:"tabular-nums",color:r.dRE>0?green:r.dRE<0?red:"#6b7280"}}>{r.dRE>0?"+":""}{fmt(r.dRE)}</div></div>
            {r.mult!==1&&<><div style={{fontSize:14,color:"#d1d5db",flexShrink:0}}>×</div><div style={{textAlign:"center"}}><div style={{fontSize:8,fontWeight:600,color:"#9ca3af",textTransform:"uppercase",letterSpacing:.5,marginBottom:2}}>Matchup</div><div style={{fontSize:18,fontWeight:700,fontVariantNumeric:"tabular-nums",color:mpct>0?green:mpct<0?red:"#6b7280"}}>{r.mult.toFixed(2)}×</div></div><div style={{fontSize:14,color:"#d1d5db",flexShrink:0}}>=</div><div style={{textAlign:"center"}}><div style={{fontSize:8,fontWeight:600,color:"#9ca3af",textTransform:"uppercase",letterSpacing:.5,marginBottom:2}}>Adj ΔRE</div><div style={{fontSize:18,fontWeight:700,fontVariantNumeric:"tabular-nums",color:r.pD>0?green:r.pD<0?red:"#6b7280"}}>{r.pD>0?"+":""}{fmt(r.pD)}</div></div></>}
          </div>
          <div style={{fontSize:10,color:"#9ca3af",marginTop:8}}>Break-even confidence: {r.thresh}% · Based on Tango's challenge thresholds incorporating RE swing and option value of saving the challenge</div>
        </div>
      )}
    </div>
  );
}

function ConfidenceMeter({thresh}){
  // Gradient cell like RE matrix. Red=high(challenge-friendly), Blue=low(hold), White=middle
  const t=Math.min(Math.abs(thresh-50)/45,1);
  const warm=thresh>=50;
  const bg=warm
    ?`rgb(${Math.round(255-(255-214)*t)},${Math.round(255-(255-48)*t)},${Math.round(255-(255-49)*t)})`
    :`rgb(${Math.round(255-(255-33)*t)},${Math.round(255-(255-102)*t)},${Math.round(255-(255-172)*t)})`;
  const txt=t>0.5?"#fff":"#1f2937";
  return(
    <div style={{display:"inline-flex",flexDirection:"column",alignItems:"center",gap:2,flexShrink:0}}>
      <div style={{width:52,height:36,borderRadius:10,background:bg,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 1px 3px rgba(0,0,0,.06)"}}>
        <span style={{fontSize:15,fontWeight:700,color:txt,fontVariantNumeric:"tabular-nums",letterSpacing:-.3}}>{thresh}%</span>
      </div>
      <span style={{fontSize:8,fontWeight:500,color:"#9ca3af",letterSpacing:.3}}>confidence</span>
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
                  else if(bl>0&&st===2){/* b2s on x-2 = strikeout */const newOuts=mOuts+1;d=newOuts>=3?-re:(RE[newOuts]?.[b.key]?.["0-0"]??re)-re;}
                  return(<td key={c} style={{padding:"5px 3px",textAlign:"center",fontSize:11,fontWeight:600,borderBottom:"1px solid #f3f4f6",background:dColor(d),color:d!=null?dText(d):"#d1d5db",fontVariantNumeric:"tabular-nums"}}>{d!=null?`${d>0?"+":""}${d.toFixed(2)}`:"—"}</td>);
                })}
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
      <p style={{marginTop:8,fontSize:11,color:"#9ca3af",lineHeight:1.6,padding:"0 4px"}}>{mView==="re"?"Expected runs from this state through end of half-inning. Blue = pitcher-favorable, Red = hitter-favorable.":mView==="rv"?"Marginal run value relative to the 0-0 count in each base-out state. Blue = pitcher's count, Red = hitter's count. Note: 3-2 is the only count that switches — it is a hitter's count in most states but becomes a pitcher's count with runners on 2nd & 3rd (the walk/strikeout outcome probabilities interact differently depending on the base-out state).":"RE change when ball overturned to strike. Blue = favors defense, Red = favors offense."}</p>
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
      <div style={s}><div style={h}>Decision Framework</div><p style={p}>The challenge decision compares the expected RE gain from a successful challenge against the option cost of losing it for future situations. On a successful challenge, the count changes and you keep the challenge. On a failed challenge, the count stays and you lose it.</p><div style={code}>EV = P(success) × ΔRE − P(failure) × OptionCost<br/><br/>Challenge when EV {">"} 0<br/>Break-even = OptionCost / (|ΔRE| + OptionCost)</div></div>

      <div style={s}><div style={h}>Challenge Thresholds (Tango, Feb 2025)</div><p style={p}>The engine uses Tom Tango's published break-even confidence thresholds for ABS challenges. For each combination of bases, outs, balls, and strikes, the table gives the minimum confidence you'd need that the call was wrong in order to justify spending a challenge. Thresholds range from 10% (loaded, 2 outs, full count — challenge on a hunch) to 88% (empty, 0 outs, 0-2 — hold unless certain).</p><div style={code}>Threshold = OptionCost / (|ΔRE| + OptionCost)<br/>CHALLENGE when your confidence ≥ threshold</div><p style={{...p,marginTop:8}}>A key insight: the threshold depends only on count and base-out state, not inning or score. Leverage index (how much a run matters) scales both the current challenge value and the option value of saving the challenge equally — so it cancels out. The decision reduces to: how big is the RE swing relative to future opportunities?</p></div>

      <div style={s}><div style={h}>Count-Level Run Expectancy (RE288)</div><p style={p}>288 cells across 12 counts × 8 base states × 3 out states, following the <a href={tangoUrl} target="_blank" rel="noopener noreferrer" style={link}>RE288 framework developed by Tom Tango</a>. Values are computed recursively: the RE at each count state is derived from the transition probabilities (ball, called strike, foul, in-play) and the resulting RE of the next state, anchored to empirical RE24 values at plate appearance endpoints. This assumes the same run expectancy for an event (single, HR, etc.) regardless of count — a simplification Tango notes is reasonable given empirical evidence.</p><p style={{...p,marginTop:8}}>The matrix tab includes three views: Run Expectancy (absolute RE from each state), Run Values (marginal RE relative to the 0-0 count in each base-out state — <a href={tangoUrl} target="_blank" rel="noopener noreferrer" style={link}>Tango's "second chart"</a>), and Count Δ (RE shift when a ball is overturned to a strike, which drives the challenge model). A key insight from the Run Values view: the 3-2 count is the only count that flips between hitter's and pitcher's count depending on base-out state.</p></div>

      <div style={s}><div style={h}>Terminal Transitions (K / BB)</div><p style={p}>Overturning a pitch doesn't always produce another count — it can end the plate appearance. On any x-2 count, overturning a ball to a strike produces a strikeout: the batter is out, runners stay, and RE drops to the new base-out state at 0-0 (or zero if it's the third out). On any 3-x count, overturning a strike to a ball produces a walk: the batter takes first, forced runners advance, and a bases-loaded walk scores a run. These terminal transitions change the base-out state, not just the count, and are modeled explicitly.</p></div>

      <div style={s}><div style={h}>Option Value</div><p style={p}>Each challenge has opportunity cost — using it now forecloses a potentially higher-value use later in the game. The cost scales with remaining innings and challenge inventory (higher when only one challenge remains). In the 9th inning or later, option value drops to zero: there's no future to save it for. A production system would use Monte Carlo simulation over remaining game states; this model uses a linear approximation.</p></div>

      <div style={s}><div style={h}>Live Game Integration</div><p style={p}>When connected to a live game, the engine polls the MLB Stats API linescore endpoint every 5 seconds, parsing count, outs, base runners, inning, and score. Challenge decisions update automatically with each pitch. The confidence input remains manual — in production this would be fed by pitch tracking data estimating challenge success probability based on pitch location relative to the ABS zone boundary.</p></div>

      <div style={s}><div style={h}>Matchup Adjustment (Live Mode)</div><p style={p}>In live mode, the engine preloads regular-season stats for all players on both rosters via a single batch API call. For each at-bat, it computes an OPS-based matchup multiplier that scales ΔRE to reflect how the current batter-pitcher pairing compares to league average.</p><div style={code}>batterFactor = batterOPS / leagueOPS<br/>pitcherFactor = pitcherOPS_against / leagueOPS<br/>matchupMultiplier = batterFactor × pitcherFactor<br/>adjustedΔRE = ΔRE × matchupMultiplier</div><p style={{...p,marginTop:8}}>A league-average matchup produces a multiplier of ~1.0×, leaving the challenge decision unchanged. An elite hitter facing a bad pitcher can push ×1.3+, meaning the same base-out state swing is worth 30% more runs — lowering the break-even confidence threshold. A weak hitter vs. an ace compresses ΔRE, raising the bar for when to challenge. The multiplier is clamped to [0.5, 2.0] to prevent extreme small-sample distortions. The ⚡ indicator appears on challenge cards when the matchup adjustment is active.</p></div>

      <div style={s}><div style={h}>Limitations & Next Steps</div><p style={p}>The matchup adjustment uses full-season OPS, which doesn't capture platoon splits (L/R advantages), recent form, or pitch-type matchup edges. A production system would incorporate platoon-adjusted wOBA, pitch-level data from Statcast, and potentially batter hot/cold zones against specific pitch types. The option value model is a linear approximation; Monte Carlo simulation over remaining game states would be more precise. Challenge confidence is manual input; production would use Hawk-Eye pitch location data to estimate success probability automatically.</p></div>

      <div style={{...s,background:"#f9fafb"}}><div style={{...h,fontSize:13}}>Data Sources</div><p style={{...p,fontSize:12}}>RE288 matrix computed recursively per <a href={tangoUrl} target="_blank" rel="noopener noreferrer" style={{...link,fontSize:12}}>Tango (2018)</a>, using 2010–2015 Retrosheet play-by-play data. The RE288 framework and the concept of count-level run values are one of Tango's many contributions to modern sabermetrics. Methodology follows Tango, Lichtman & Dolphin, "The Book: Playing the Percentages in Baseball." Live game data from MLB Stats API (statsapi.mlb.com).</p></div>
    </div>
  );
}
