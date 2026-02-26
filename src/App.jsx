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
  // c = pre-pitch count. Compute what happens if the call is overturned.
  const[b,s]=c.split("-").map(Number);const t=[];
  // Ball overturned to strike: apply strike to pre-pitch count
  if(s+1<=2)t.push({type:"b2s",label:"Ball → Strike",from:c,to:`${b}-${s+1}`,desc:"Overturned to strike",terminal:false});
  else if(s===2)t.push({type:"b2s",label:"Ball → Strikeout",from:c,to:"K",desc:"Overturned to strike → K",terminal:true,newOuts:outs+1,newBases:bases,newCount:"0-0",runs:0});
  // Strike overturned to ball: apply ball to pre-pitch count
  if(b+1<=3)t.push({type:"s2b",label:"Strike → Ball",from:c,to:`${b+1}-${s}`,desc:"Overturned to ball",terminal:false});
  else if(b===3)t.push({type:"s2b",label:"Strike → Walk",from:c,to:"BB",desc:"Overturned to ball → BB",terminal:true,newOuts:outs,newBases:WALK_MAP[bases]||"100",newCount:"0-0",runs:WALK_RUNS[bases]||0});
  return t;
}
const fmt=v=>v==null?"—":v.toFixed(3);
function heatColor(v,mn,mx){const t=Math.max(0,Math.min(1,(v-mn)/(mx-mn)));if(t<.5){const s=t/.5;return`rgb(${Math.round(33+(255-33)*s)},${Math.round(102+(255-102)*s)},${Math.round(172+(255-172)*s)})`}const s=(t-.5)/.5;return`rgb(${Math.round(255-(255-214)*s)},${Math.round(255-(255-48)*s)},${Math.round(255-(255-49)*s)})`}
function heatText(v,mn,mx){const t=Math.max(0,Math.min(1,(v-mn)/(mx-mn)));return(t<.2||t>.8)?"#fff":"#333"}
function dColor(d){if(d==null)return"transparent";const t=Math.min(Math.abs(d)/.45,1);if(d<0)return`rgb(${Math.round(255-(255-33)*t)},${Math.round(255-(255-102)*t)},${Math.round(255-(255-172)*t)})`;return`rgb(${Math.round(255-(255-214)*t)},${Math.round(255-(255-48)*t)},${Math.round(255-(255-49)*t)})`}
function dText(d){return d!=null&&Math.abs(d)>.2?"#fff":"#333"}

// ============================================================
// STRIKE ZONE — Gaussian confidence model
// ============================================================
const ZONE_WIDTH_FT=(17+2.9)/12; // plate width + ball diameter (Statcast pX = ball center)
const ZONE_HALF=ZONE_WIDTH_FT/2;

function getDistFromZone(pX,pZ,szTop,szBot){
  const xDist=Math.abs(pX)-ZONE_HALF;
  const zDistHigh=pZ-szTop;
  const zDistLow=szBot-pZ;
  const xIn=xDist<0,zIn=zDistHigh<0&&zDistLow<0;
  if(xIn&&zIn)return -Math.min(Math.abs(xDist),Math.abs(zDistHigh),Math.abs(zDistLow))*12;
  return Math.sqrt(Math.max(0,xDist)**2+Math.max(0,zDistHigh,zDistLow)**2)*12;
}

function normCDF(x){
  const t=1/(1+0.2316419*Math.abs(x));
  const d=0.3989422804*Math.exp(-x*x/2);
  const p=d*t*(0.3193815+t*(-0.3565638+t*(1.781478+t*(-1.8212560+t*1.3302744))));
  return x>0?1-p:p;
}

function confidenceFromDist(distInches, sigma = 1.0){
  return Math.max(5,Math.min(95,Math.round(normCDF(distInches/sigma)*100)));
}

// ============================================================
// MLB API HOOKS
// ============================================================
const API="https://statsapi.mlb.com/api/v1";
const TEAM_ABBR={108:"LAA",109:"ARI",110:"BAL",111:"BOS",112:"CHC",113:"CIN",114:"CLE",115:"COL",116:"DET",117:"HOU",118:"KC",119:"LAD",120:"WSH",121:"NYM",133:"OAK",134:"PIT",135:"SD",136:"SEA",137:"SF",138:"STL",139:"TB",140:"TEX",141:"TOR",142:"MIN",143:"PHI",144:"ATL",145:"CWS",146:"MIA",147:"NYY",158:"MIL",160:"LAA"};
const teamAbbr=(t)=>TEAM_ABBR[t?.id]||t?.abbreviation||t?.name||"?";
let LG_XWOBA=0.315; // default, overridden by xwoba.json if available

// Tango's ABS Challenge Thresholds (Feb 2025)
// Minimum confidence % needed to justify a challenge
// Access: TANGO[bases][outs][strikes][balls]
const TANGO={"000":{0:[[73,60,50,46],[80,70,60,56],[88,82,76,73]],1:[[71,64,51,37],[78,72,61,47],[85,82,75,65]],2:[[55,50,40,24],[63,59,49,32],[73,69,62,47]]},"100":{0:[[63,50,39,35],[70,59,49,45],[78,72,64,60]],1:[[61,54,40,28],[65,60,49,37],[71,69,62,51]],2:[[44,39,30,17],[48,44,35,22],[56,51,43,31]]},"010":{0:[[65,60,52,47],[72,68,61,57],[76,79,76,73]],1:[[56,54,48,39],[61,60,56,48],[63,64,67,66]],2:[[39,34,28,19],[44,40,33,25],[46,42,37,31]]},"110":{0:[[54,41,32,28],[59,47,37,33],[67,62,55,50]],1:[[50,44,32,22],[54,48,37,26],[56,54,50,42]],2:[[33,29,22,12],[37,32,25,15],[39,34,29,20]]},"001":{0:[[66,58,49,45],[64,67,63,59],[74,77,74,70]],1:[[57,54,47,36],[49,50,52,50],[61,62,64,63]],2:[[40,36,29,19],[32,28,24,19],[44,39,34,28]]},"101":{0:[[58,50,41,37],[58,56,50,45],[66,65,60,55]],1:[[49,46,39,29],[45,45,43,37],[53,53,52,46]],2:[[32,28,23,15],[29,25,21,15],[36,32,27,20]]},"011":{0:[[61,58,51,46],[59,66,66,61],[65,70,69,65]],1:[[50,48,45,38],[42,43,50,53],[49,50,55,56]],2:[[33,29,24,17],[26,23,19,17],[32,28,24,20]]},"111":{0:[[48,37,29,25],[47,37,29,25],[48,37,29,25]],1:[[43,38,28,19],[41,36,28,19],[42,37,28,19]],2:[[27,24,18,10],[26,22,17,10],[27,23,18,10]]}};
const getTangoThresh=(bases,outs,balls,strikes)=>TANGO[bases]?.[outs]?.[strikes]?.[balls]??50;
const getTier=(thresh)=>thresh<=25?{label:"Challenge",sub:"Even a hunch is enough",color:"#2563eb",bg:"#f9fafb",border:"#bfdbfe"}:thresh<=45?{label:"Lean challenge",sub:"Worth it if it looked wrong",color:"#16a34a",bg:"#f9fafb",border:"#bbf7d0"}:thresh<=65?{label:"Toss-up",sub:"Only if you saw it clearly",color:"#d97706",bg:"#fffbeb",border:"#fde68a"}:thresh<=80?{label:"Lean hold",sub:"Need to be pretty sure",color:"#ea580c",bg:"#fff7ed",border:"#fed7aa"}:{label:"Hold",sub:"Only challenge if certain",color:"#dc2626",bg:"#fef2f2",border:"#fecaca"};

// ============================================================
// ZONE MODEL — pitch location to zone confidence (Training Mode)
// ============================================================
const ZONE_LEFT = -17/2/12;    // -0.7083 ft
const ZONE_RIGHT = 17/2/12;    // +0.7083 ft
const ZONE_TOP = 3.5;          // ft (default sz_top)
const ZONE_BOT = 1.6;          // ft (default sz_bot)
const BALL_R = 2.9/2/12;       // ball radius in feet
const EFF_LEFT = ZONE_LEFT - BALL_R;
const EFF_RIGHT = ZONE_RIGHT + BALL_R;
const EFF_TOP = ZONE_TOP + BALL_R;
const EFF_BOT = ZONE_BOT - BALL_R;
const SIGMA = 0.25 / 12;       // 0.25 inch in feet (Hawk-Eye precision)

function gaussianCdf(x) {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989422804 * Math.exp(-x * x / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.8212560 + t * 1.3302744))));
  return x > 0 ? 1 - p : p;
}

function getZoneConfidence(px, pz) {
  const isOutside = px < EFF_LEFT || px > EFF_RIGHT || pz < EFF_BOT || pz > EFF_TOP;
  if (isOutside) {
    const dx = Math.max(EFF_LEFT - px, px - EFF_RIGHT, 0);
    const dz = Math.max(EFF_BOT - pz, pz - EFF_TOP, 0);
    return gaussianCdf(Math.max(dx, dz) / SIGMA);
  }
  const dxIn = Math.min(px - EFF_LEFT, EFF_RIGHT - px);
  const dzIn = Math.min(pz - EFF_BOT, EFF_TOP - pz);
  return 1 - gaussianCdf(Math.min(dxIn, dzIn) / SIGMA);
}

// ============================================================
// TRAINING — scenario generation
// ============================================================
function generatePitchLocation(difficulty) {
  // Reference from EFFECTIVE zone boundary (plate + ball radius), not plate edge.
  // This is where the actual strike/ball line is for Statcast coordinates.
  const edges = [
    { axis: "x", val: EFF_LEFT },
    { axis: "x", val: EFF_RIGHT },
    { axis: "z", val: EFF_TOP },
    { axis: "z", val: EFF_BOT },
  ];

  // Corner pitches: near two edges simultaneously (the real shadow zone)
  const useCorner = difficulty >= 2 && Math.random() < (difficulty === 3 ? 0.4 : 0.2);

  if (useCorner) {
    // Pick a corner of the effective zone
    const xEdge = Math.random() < 0.5 ? EFF_LEFT : EFF_RIGHT;
    const zEdge = Math.random() < 0.5 ? EFF_TOP : EFF_BOT;
    const maxOff = difficulty === 3 ? 0.3 : 1.0; // inches from boundary
    const xOff = (Math.random() * maxOff * 2 - maxOff) / 12;
    const zOff = (Math.random() * maxOff * 2 - maxOff) / 12;
    return { pitchX: xEdge + xOff, pitchZ: zEdge + zOff };
  }

  const edge = edges[Math.floor(Math.random() * edges.length)];
  const inside = Math.random() < 0.5;

  // Offset from the effective boundary in inches — tighter = harder
  let offset;
  if (difficulty === 1) offset = (1.0 + Math.random() * 2.0) / 12;  // 1.0–3.0" — clearly in or out
  else if (difficulty === 2) offset = (Math.random() * 1.2) / 12;    // 0–1.2" — borderline
  else offset = (Math.random() * 0.3) / 12;                          // 0–0.3" — shadow zone, right on the edge

  let pitchX, pitchZ;
  if (edge.axis === "x") {
    const sign = edge.val > 0 ? 1 : -1;
    pitchX = edge.val + sign * (inside ? -offset : offset);
    // Vary the z position but keep some near top/bottom for realism
    const zRange = EFF_TOP - EFF_BOT;
    pitchZ = EFF_BOT + Math.random() * zRange;
  } else {
    const sign = edge.val > EFF_BOT ? 1 : -1;
    pitchZ = edge.val + sign * (inside ? -offset : offset);
    const xRange = EFF_RIGHT - EFF_LEFT;
    pitchX = EFF_LEFT + Math.random() * xRange;
  }
  return { pitchX, pitchZ };
}

const LEVEL1_POOL = [
  { count: "3-2", bases: "111", outs: 2 },
  { count: "3-2", bases: "101", outs: 2 },
  { count: "3-2", bases: "110", outs: 2 },
  { count: "3-2", bases: "111", outs: 1 },
  { count: "0-0", bases: "000", outs: 0 },
  { count: "0-2", bases: "000", outs: 0 },
  { count: "0-1", bases: "000", outs: 0 },
];
const LEVEL2_POOL = [
  { count: "2-2", bases: "100", outs: 1 },
  { count: "1-2", bases: "001", outs: 1 },
  { count: "3-2", bases: "000", outs: 1 },
  { count: "1-1", bases: "010", outs: 0 },
  { count: "2-1", bases: "110", outs: 1 },
  { count: "0-2", bases: "101", outs: 2 },
  { count: "1-2", bases: "111", outs: 0 },
  { count: "2-2", bases: "011", outs: 1 },
  { count: "3-1", bases: "100", outs: 0 },
  { count: "1-1", bases: "001", outs: 2 },
];

function pickGameState(difficulty) {
  if (difficulty === 1) return LEVEL1_POOL[Math.floor(Math.random() * LEVEL1_POOL.length)];
  if (difficulty === 2) return LEVEL2_POOL[Math.floor(Math.random() * LEVEL2_POOL.length)];
  const count = COUNTS[Math.floor(Math.random() * COUNTS.length)];
  const bases = BASES_LIST[Math.floor(Math.random() * BASES_LIST.length)].key;
  const outs = Math.floor(Math.random() * 3);
  return { count, bases, outs };
}

function generateScenario(difficulty, perspective) {
  const gs = pickGameState(difficulty);
  const { pitchX, pitchZ } = generatePitchLocation(difficulty);
  const rawConf = getZoneConfidence(pitchX, pitchZ);
  const zoneConf = Math.max(5, Math.min(95, Math.round(rawConf * 100)));
  const [b, s] = gs.count.split("-").map(Number);
  const thresh = getTangoThresh(gs.bases, gs.outs, b, s);
  const tier = getTier(thresh);
  const trans = getTrans(gs.count, gs.outs, gs.bases);
  const relevantType = perspective === "batter" ? "s2b" : "b2s";
  const transition = trans.find(t => t.type === relevantType);
  if (!transition) return generateScenario(difficulty, perspective);

  const cur = RE[gs.outs]?.[gs.bases]?.[gs.count];
  if (cur == null) return generateScenario(difficulty, perspective);
  let cor;
  if (transition.terminal) {
    if (transition.newOuts >= 3) cor = 0;
    else cor = (RE[transition.newOuts]?.[transition.newBases]?.["0-0"] ?? 0) + transition.runs;
  } else {
    cor = RE[gs.outs]?.[gs.bases]?.[transition.to];
    if (cor == null) return generateScenario(difficulty, perspective);
  }
  const deltaRE = cor - cur;
  // Perspective-adjusted delta (no matchup in training, mult=1)
  const pD = perspective === "batter" ? deltaRE : -deltaRE;
  // Break-even: the actual confidence % needed to justify this challenge
  const COST = 0.20;
  const breakeven = Math.round(COST / (Math.abs(pD) + COST) * 100);
  const correctAction = zoneConf >= breakeven ? "challenge" : "accept";
  return { ...gs, pitchX, pitchZ, zoneConf, transition, thresh, tier, deltaRE, pD, breakeven, correctAction, cur, cor };
}

// ============================================================
// CHALLENGE CONTEXT — tug of war + both transitions
// ============================================================
function ChallengeContext({analysis,activeCount,persp}){
  const[showTip,setShowTip]=useState(false);
  if(!analysis||!activeCount)return null;
  const[balls,strikes]=activeCount.split("-").map(Number);

  // Find batter (s2b) and catcher (b2s) transitions
  const batterCard=analysis.results.find(r=>r.type==="s2b");
  const catcherCard=analysis.results.find(r=>r.type==="b2s");

  // If neither exists (0-0), don't render
  if(!batterCard&&!catcherCard)return null;

  // Threshold only shown on the perspective-relevant side
  const thresh=analysis.thresh;
  const batterIsRelevant=persp==="offense";
  const catcherIsRelevant=persp==="defense";

  // Tug of war bar: proportional to raw |dRE| — who gains more from overturning
  const bSwing=batterCard?Math.abs(batterCard.dRE):0;
  const cSwing=catcherCard?Math.abs(catcherCard.dRE):0;
  const swingTotal=bSwing+cSwing;
  const bPct=swingTotal===0?50:(bSwing/swingTotal)*100;
  const bWins=bPct>=50;

  let tipText="";
  if(!batterCard)tipText="Only catcher can challenge (no strikes in count)";
  else if(!catcherCard)tipText="Only batter can challenge (no balls in count)";
  else{
    const ratio=Math.max(bSwing,cSwing)/(Math.min(bSwing,cSwing)||0.001);
    const who=bWins?"Batter":"Catcher";
    tipText=ratio<1.2?"Challenge stakes are roughly even":ratio<2?`${who} has more to gain from overturning`:`${who} has much more to gain from overturning`;
  }

  return(
    <div style={{marginTop:8}}>
      <div style={{display:"flex",gap:0,alignItems:"stretch"}}>
        {/* Batter side */}
        <div style={{flex:1,background:bWins?"#eef0f3":"#f6f7f8",borderRadius:"6px 0 0 6px",padding:"5px 8px",textAlign:"center"}}>
          {batterCard?(<>
            <div style={{fontSize:7,fontWeight:600,color:"#6b7280",textTransform:"uppercase",letterSpacing:.5}}>Overturn strike</div>
            <div style={{fontSize:12,fontWeight:700,color:"#111827",marginTop:1}}>{batterCard.from} → {batterCard.to}</div>
            {batterIsRelevant&&<div style={{fontSize:9,color:"#6b7280"}}>Tango: {thresh}%</div>}
          </>):(
            <div style={{fontSize:9,color:"#d1d5db",paddingTop:4,paddingBottom:4}}>No strikes to overturn</div>
          )}
        </div>
        {/* Catcher side */}
        <div style={{flex:1,background:!bWins?"#eef0f3":"#f6f7f8",borderRadius:"0 6px 6px 0",padding:"5px 8px",textAlign:"center"}}>
          {catcherCard?(<>
            <div style={{fontSize:7,fontWeight:600,color:"#6b7280",textTransform:"uppercase",letterSpacing:.5}}>Overturn ball</div>
            <div style={{fontSize:12,fontWeight:700,color:"#111827",marginTop:1}}>{catcherCard.from} → {catcherCard.to}</div>
            {catcherIsRelevant&&<div style={{fontSize:9,color:"#6b7280"}}>Tango: {thresh}%</div>}
          </>):(
            <div style={{fontSize:9,color:"#d1d5db",paddingTop:4,paddingBottom:4}}>No balls to overturn</div>
          )}
        </div>
      </div>
      {/* Tug of war bar */}
      <div style={{position:"relative",marginTop:4}}>
        <div style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",padding:"2px 0"}} onClick={()=>setShowTip(t=>!t)}>
          <div style={{fontSize:8,fontWeight:600,color:bWins?"#374151":"#c4c8cd",width:14,textAlign:"center"}}>AB</div>
          <div style={{flex:1,height:5,borderRadius:3,background:"#e5e7eb",overflow:"hidden",display:"flex"}}>
            {batterCard&&catcherCard?(<>
              <div style={{width:`${bPct}%`,background:bWins?"#374151":"#c4c8cd",borderRadius:bPct>95?3:"3px 0 0 3px",transition:"width .4s ease"}}/>
              <div style={{width:`${100-bPct}%`,background:bWins?"#c4c8cd":"#374151",borderRadius:bPct<5?3:"0 3px 3px 0",transition:"width .4s ease"}}/>
            </>):batterCard?(
              <div style={{width:"100%",background:"#374151",borderRadius:3}}/>
            ):catcherCard?(
              <div style={{width:"100%",background:"#374151",borderRadius:3}}/>
            ):null}
          </div>
          <div style={{fontSize:8,fontWeight:600,color:!bWins?"#374151":"#c4c8cd",width:10,textAlign:"center"}}>P</div>
          <svg width="10" height="10" viewBox="0 0 12 12" style={{color:"#c4c8cd",flexShrink:0}}>
            <circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" strokeWidth="1.2"/>
            <text x="6" y="9" textAnchor="middle" fontSize="8" fill="currentColor" fontWeight="600">?</text>
          </svg>
        </div>
        {showTip&&(
          <div style={{position:"absolute",top:"100%",left:"50%",transform:"translateX(-50%)",background:"#1f2937",color:"#fff",fontSize:10,padding:"6px 10px",borderRadius:6,whiteSpace:"nowrap",zIndex:10,boxShadow:"0 4px 12px rgba(0,0,0,0.15)",marginTop:4}}>
            <div style={{marginBottom:2,fontWeight:600}}>Challenge Edge</div>
            <div style={{color:"#d1d5db"}}>{tipText}</div>
            <div style={{position:"absolute",top:-4,left:"50%",transform:"translateX(-50%)",width:0,height:0,borderLeft:"4px solid transparent",borderRight:"4px solid transparent",borderBottom:"4px solid #1f2937"}}/>
          </div>
        )}
      </div>
    </div>
  );
}

// xwOBA data: loaded once from static JSON (generated by scripts/update-xwoba.py)
let _xwobaCache=null;
async function loadXwobaJson(){
  if(_xwobaCache)return _xwobaCache;
  try{
    const r=await fetch("/api/xwoba");
    if(!r.ok)return null;
    const d=await r.json();
    if(d.lg_xwoba)LG_XWOBA=d.lg_xwoba;
    _xwobaCache=d;
    return d;
  }catch{return null;}
}

function usePlayerStats(gamePk,mode){
  const[stats,setStats]=useState({}); // {playerId: {xwoba, type, name}}
  const[loading,setLoading]=useState(false);
  const fetched=useRef(null);

  useEffect(()=>{
    if((mode!=="live"&&mode!=="signal")||!gamePk||fetched.current===gamePk){return;}
    let cancelled=false;
    async function load(){
      setLoading(true);
      try{
        // Step 1: get boxscore for player IDs + classification
        const bRes=await fetch(`${API}/game/${gamePk}/boxscore`);
        if(!bRes.ok)throw new Error("Boxscore fetch failed");
        const box=await bRes.json();
        const ids=new Set();
        const classify={};
        for(const side of["away","home"]){
          const players=box.teams?.[side]?.players||{};
          for(const[,p]of Object.entries(players)){
            const id=p.person?.id;if(!id)continue;
            ids.add(id);
            classify[id]=p.primaryPosition?.type==="Pitcher"||p.position?.type==="Pitcher"?"pitcher":"batter";
          }
        }
        if(ids.size===0){setLoading(false);return;}

        // Step 2: try xwoba.json first (Savant data, pre-baked)
        const xData=await loadXwobaJson();
        const map={};
        let missing=[];

        if(xData?.players){
          for(const id of ids){
            const p=xData.players[String(id)];
            if(p){
              map[id]={xwoba:p.xwoba,type:p.type||classify[id]||"batter",name:p.name||""};
            }else{
              missing.push(id);
            }
          }
        }else{
          missing=[...ids];
        }

        // Step 3: fallback to statsapi for missing players (OPS->xwOBA approx)
        if(missing.length>0){
          const chunks=[];
          for(let i=0;i<missing.length;i+=40)chunks.push(missing.slice(i,i+40));
          const season=new Date().getFullYear();
          for(const chunk of chunks){
            const url=`${API}/people?personIds=${chunk.join(",")}&hydrate=stats(group=[hitting,pitching],type=[season],season=${season})`;
            const pRes=await fetch(url);
            if(!pRes.ok)continue;
            const pData=await pRes.json();
            for(const person of(pData.people||[])){
              const id=person.id;
              const type=classify[id]||"batter";
              let xwoba=null;
              if(type==="pitcher"){
                const ps=person.stats?.find(s=>s.group?.displayName==="pitching"&&s.type?.displayName==="season");
                const st=ps?.splits?.find(sp=>sp.gameType==="R")?.stat;
                if(st){const obp=parseFloat(st.obp)||0,slg=parseFloat(st.slg)||0;if(slg>0)xwoba=0.21*obp+0.15*slg+0.06;}
              }else{
                const hs=person.stats?.find(s=>s.group?.displayName==="hitting"&&s.type?.displayName==="season");
                const st=hs?.splits?.find(sp=>sp.gameType==="R")?.stat;
                if(st){const obp=parseFloat(st.obp)||0,slg=parseFloat(st.slg)||0;if(obp+slg>0)xwoba=0.21*obp+0.15*slg+0.06;}
              }
              if(!map[id])map[id]={xwoba,type,name:person.fullName||""};
            }
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
    let cancelled=false,tid;
    async function load(){
      try{
        const now=new Date();
        const today=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
        const res=await fetch(`${API}/schedule?sportId=1&date=${today}&hydrate=linescore`);
        if(!res.ok)throw new Error("Schedule fetch failed");
        const data=await res.json();
        const allGames=(data.dates||[]).flatMap(d=>d.games||[]);
        if(!cancelled)setGames(allGames);
      }catch(e){if(!cancelled)setError(e.message)}
      finally{if(!cancelled){setLoading(false);tid=setTimeout(load,30000);}}
    }
    load();
    return()=>{cancelled=true;clearTimeout(tid)};
  },[]);
  return{games,loading,error};
}

function useLiveGame(gamePk){
  const[state,setState]=useState(null);
  const[pitch,setPitch]=useState(null);
  const[pitchSequence,setPitchSequence]=useState([]);
  const[lastPlayResult,setLastPlayResult]=useState(null);
  const[recentPlays,setRecentPlays]=useState([]);
  const[err,setErr]=useState(null);
  const lsTimer=useRef(null);
  const pitchTimer=useRef(null);
  const lastPitchId=useRef(null);
  const lastAbIndex=useRef(null);
  const lsSnap=useRef(null); // snapshot of linescore state for pitch context

  useEffect(()=>{
    if(!gamePk){setState(null);setPitch(null);setPitchSequence([]);setLastPlayResult(null);setRecentPlays([]);setErr(null);lastPitchId.current=null;lastAbIndex.current=null;lsSnap.current=null;return;}
    let cancelled=false;

    // Linescore poll — game state every 5s
    async function pollLinescore(){
      try{
        const controller=new AbortController();
        const tid=setTimeout(()=>controller.abort(),8000);
        const res=await fetch(`${API}/game/${gamePk}/linescore`,{signal:controller.signal});
        clearTimeout(tid);
        if(!res.ok)throw new Error("Linescore fetch failed");
        const d=await res.json();
        if(cancelled)return;
        const balls=d.balls??0,strikes=d.strikes??0,outs_val=d.outs??0;
        const inn=d.currentInning??1;
        const isTop=d.isTopInning??true;
        const away=d.teams?.away?.runs??0,home=d.teams?.home?.runs??0;
        const first=d.offense?.first?1:0;
        const second=d.offense?.second?1:0;
        const third=d.offense?.third?1:0;
        const batter=d.offense?.batter?.fullName||"";
        const pitcher=d.defense?.pitcher?.fullName||"";
        const batterId=d.offense?.batter?.id||null;
        const pitcherId=d.defense?.pitcher?.id||null;
        const newState={
          balls,strikes,outs:Math.min(outs_val,2),inn,isTop,
          away,home,
          bases:`${first}${second}${third}`,
          count:`${balls}-${strikes}`,
          batter,pitcher,batterId,pitcherId,
        };
        setState(newState);
        lsSnap.current=newState;
        setErr(null);
      }catch(e){if(!cancelled)setErr(e.name==="AbortError"?"Connection timed out":e.message)}
      finally{if(!cancelled)lsTimer.current=setTimeout(pollLinescore,5000);}
    }

    // Pitch poll — feed/live every 10s
    async function pollPitch(){
      try{
        const controller=new AbortController();
        const tid=setTimeout(()=>controller.abort(),10000);
        const res=await fetch(`https://statsapi.mlb.com/api/v1.1/game/${gamePk}/feed/live`,{signal:controller.signal});
        clearTimeout(tid);
        if(!res.ok||cancelled)return;
        const fd=await res.json();

        // --- Play-by-play extraction (from same response, no new fetches) ---
        const curPlayData=fd.liveData?.plays?.currentPlay;

        // Pitch sequence: every pitch in the current at-bat
        if(curPlayData?.playEvents){
          const seq=curPlayData.playEvents.filter(e=>e.isPitch).map(e=>({
            callCode:e.details?.call?.code||"",
            callDesc:e.details?.call?.description||"",
            pitchType:e.details?.type?.code||"",
            speed:e.pitchData?.startSpeed||null,
            balls:e.count?.balls??0,
            strikes:e.count?.strikes??0,
          }));
          if(!cancelled)setPitchSequence(seq);
        }else if(!cancelled)setPitchSequence([]);

        // Recent completed at-bats (last 8) + last play result
        const allPlaysArr=fd.liveData?.plays?.allPlays||[];
        const completed=allPlaysArr.filter(p=>p.about?.isComplete&&p.result?.event).slice(-8).reverse().map(p=>({
          batter:p.matchup?.batter?.fullName||"",
          event:p.result?.event||"",
          rbi:p.result?.rbi??0,
          isOut:p.result?.isOut??true,
          count:`${p.count?.balls??0}-${p.count?.strikes??0}`,
          atBatIndex:p.atBatIndex,
          inning:p.about?.inning??0,
          halfInning:p.about?.halfInning||"top",
        }));
        if(!cancelled){
          setRecentPlays(completed);
          setLastPlayResult(completed.length>0?completed[0]:null);
        }
        // --- End play-by-play extraction ---

        const curPlay=curPlayData;
        const events=curPlay?.playEvents;
        if(!events||events.length===0)return;
        let lastP=null;
        for(let i=events.length-1;i>=0;i--){if(events[i].isPitch){lastP=events[i];break;}}
        if(!lastP)return;
        const curAbIndex=curPlay?.atBatIndex;
        const pitchId=`${curAbIndex}-${lastP.index}`;
        // Clear pitch when a new at-bat starts (K, BB, in-play ended previous AB)
        if(curAbIndex!==lastAbIndex.current){
          lastAbIndex.current=curAbIndex;
          if(lastPitchId.current!==null)setPitch(null); // clear stale pitch from previous AB
        }
        // If same pitch but AB just completed, update with result
        if(pitchId===lastPitchId.current){
          const result=curPlay?.about?.isComplete?curPlay?.result?.event:null;
          if(result){setPitch(prev=>prev?{...prev,result}:prev);}
          return;
        }
        lastPitchId.current=pitchId;
        const callCode=lastP.details?.call?.code;
        if(callCode==="C"||callCode==="B"){
          const pX=lastP.pitchData?.coordinates?.pX;
          const pZ=lastP.pitchData?.coordinates?.pZ;
          if(pX!=null&&pZ!=null){
            // Compute pre-pitch count by reversing the call from post-pitch count
            const postB=lastP.count?.balls??0,postS=lastP.count?.strikes??0;
            let preB,preS;
            if(callCode==="B"){preB=postB-1;preS=postS;}
            else{preB=postB;preS=postS-1;}
            const preCount=`${Math.max(0,preB)}-${Math.min(2,Math.max(0,preS))}`;
            // Outs from pitch event (stable during AB), bases from linescore snapshot
            const preOuts=Math.min(lastP.count?.outs??0,2);
            const preBases=lsSnap.current?.bases||"000";
            const result=curPlay?.about?.isComplete?curPlay?.result?.event:null;
            setPitch({pX,pZ,
              szTop:lastP.pitchData?.strikeZoneTop??3.5,
              szBot:lastP.pitchData?.strikeZoneBottom??1.6,
              call:callCode==="C"?"strike":"ball",
              type:lastP.details?.type?.description||lastP.details?.type?.code||"",
              speed:lastP.pitchData?.startSpeed?`${Math.round(lastP.pitchData.startSpeed)} mph`:"",
              preCount,preOuts,preBases,result,
            });
          }
        }else{setPitch(null);}
      }catch(e){/* pitch fetch failed, keep going */}
      finally{if(!cancelled)pitchTimer.current=setTimeout(pollPitch,10000);}
    }

    pollLinescore();
    pollPitch();
    return()=>{cancelled=true;clearTimeout(lsTimer.current);clearTimeout(pitchTimer.current)};
  },[gamePk]);

  return{state,pitch,pitchSequence,lastPlayResult,recentPlays,err};
}

// ============================================================
// DEMO: 2025 WORLD SERIES GAME 7 (LAD 5, TOR 4 — 11 inn)
// ============================================================
const HEADSHOT="https://content.mlb.com/images/headshots/current/60x60/";
const lastName=n=>{if(!n)return"";const p=n.split(" ");if(p.length<=1)return n;const last=p[p.length-1];if(["Jr.","Sr.","II","III","IV"].includes(last))return p[p.length-2]+" "+last;return last;};
// 2025 season xwOBA from Baseball Savant (baseballsavant.mlb.com)
// Pitchers: xwOBA-against (lower = better). Batters: xwOBA (higher = better).
const DEMO_STATS={571970:{xwoba:.374,type:"batter",name:"Max Muncy"},605135:{xwoba:.310,type:"pitcher",name:"Chris Bassitt"},605483:{xwoba:.283,type:"pitcher",name:"Blake Snell"},606192:{xwoba:.323,type:"batter",name:"Teoscar Hernández"},607192:{xwoba:.285,type:"pitcher",name:"Tyler Glasnow"},622554:{xwoba:.290,type:"pitcher",name:"Seranthony Domínguez"},656546:{xwoba:.285,type:"pitcher",name:"Jeff Hoffman"},660271:{xwoba:.250,type:"pitcher",name:"Shohei Ohtani"},665489:{xwoba:.384,type:"batter",name:"Vladimir Guerrero Jr."},665926:{xwoba:.308,type:"batter",name:"Andrés Giménez"},666182:{xwoba:.353,type:"batter",name:"Bo Bichette"},669257:{xwoba:.378,type:"batter",name:"Will Smith"},669456:{xwoba:.310,type:"pitcher",name:"Shane Bieber"},676914:{xwoba:.323,type:"batter",name:"Davis Schneider"},702056:{xwoba:.295,type:"pitcher",name:"Trey Yesavage"},808967:{xwoba:.259,type:"pitcher",name:"Yoshinobu Yamamoto"}};
const DEMO_PLAYS=[
  {label:"Hernández vs Bassitt",sub:"Top 6 · 0 out · 1st & 2nd · LAD 1, TOR 3",note:"Ump scorecard's #1 most impactful missed call. Strike called a ball on a 1-1 count — runners on 1st and 2nd with nobody out.",count:"2-1",outs:0,bases:"110",inn:6,isTop:true,away:1,home:3,batterId:606192,pitcherId:605135,batter:"Teoscar Hernández",pitcher:"Chris Bassitt",result:"Forceout",
    pitch:{pX:0.266,pZ:3.401,szTop:3.38,szBot:1.62,call:"ball",type:"Sinker",speed:"92.1 mph",preCount:"1-1"}},
  {label:"Giménez vs Glasnow",sub:"Bot 6 · 0 out · Runner on 1st · LAD 2, TOR 4",note:"5 called pitches in this at-bat — a full-count battle. Giménez doubles to drive in the run. Runner on 1st, nobody out.",count:"3-2",outs:0,bases:"100",inn:6,isTop:false,away:2,home:4,batterId:665926,pitcherId:607192,batter:"Andrés Giménez",pitcher:"Tyler Glasnow",result:"Double",
    pitch:{pX:-0.573,pZ:2.338,szTop:3.50,szBot:1.70,call:"strike",type:"Four-Seam Fastball",speed:"96.1 mph",preCount:"3-1"}},
  {label:"Muncy HR off Yesavage",sub:"Top 8 · 1 out · Bases empty · LAD 2, TOR 4",note:"Down 2 in the 8th, Muncy launches a solo homer to cut the deficit. Called strike on 0-1 was actually 3.7\" outside the zone.",count:"0-1",outs:1,bases:"000",inn:8,isTop:true,away:2,home:4,batterId:571970,pitcherId:702056,batter:"Max Muncy",pitcher:"Trey Yesavage",result:"Home Run",
    pitch:{pX:0.234,pZ:3.472,szTop:3.17,szBot:1.51,call:"strike",type:"Splitter",speed:"82.4 mph",preCount:"0-0"}},
  {label:"Schneider vs Snell",sub:"Bot 8 · 2 out · Runner on 2nd · LAD 3, TOR 4",note:"Snell protecting a 1-run lead. Called strike on 0-1, then the pivotal called strike on 2-2 — ball called a strike per ump scorecard (#3 most impactful).",count:"2-2",outs:2,bases:"010",inn:8,isTop:false,away:3,home:4,batterId:676914,pitcherId:605483,batter:"Davis Schneider",pitcher:"Blake Snell",result:"Strikeout",
    pitch:{pX:0.914,pZ:2.835,szTop:3.11,szBot:1.53,call:"strike",type:"Changeup",speed:"81.8 mph",preCount:"2-1"}},
  {label:"Smith called K",sub:"Top 9 · 2 out · Bases empty · Tied 4-4",note:"6 called pitches — the most in any at-bat. Game-tying run already in. Hoffman gets Smith looking on a full count. Called strike 3 per ump scorecard was ball called strike (#2 most impactful).",count:"3-2",outs:2,bases:"000",inn:9,isTop:true,away:4,home:4,batterId:669257,pitcherId:656546,batter:"Will Smith",pitcher:"Jeff Hoffman",result:"Strikeout",
    pitch:{pX:0.960,pZ:2.130,szTop:3.33,szBot:1.57,call:"strike",type:"Four-Seam Fastball",speed:"94.9 mph",preCount:"3-2"}},
  {label:"Hernández walks, bases loaded",sub:"Top 10 · 1 out · 1st & 2nd · Tied 4-4",note:"Extras. Bases loaded with 1 out. 4 called pitches including the walk on 3-2. A challenge on a ball/strike here changes everything.",count:"3-2",outs:1,bases:"110",inn:10,isTop:true,away:4,home:4,batterId:606192,pitcherId:622554,batter:"Teoscar Hernández",pitcher:"Seranthony Domínguez",result:"Walk",
    pitch:{pX:1.014,pZ:2.325,szTop:3.55,szBot:1.70,call:"ball",type:"Four-Seam Fastball",speed:"98.5 mph",preCount:"2-2"}},
  {label:"Smith go-ahead HR",sub:"Top 11 · 2 out · Bases empty · Tied 4-4",note:"Will Smith homers off Bieber to break the tie in the 11th. 2 called balls early in the count.",count:"2-0",outs:2,bases:"000",inn:11,isTop:true,away:4,home:4,batterId:669257,pitcherId:669456,batter:"Will Smith",pitcher:"Shane Bieber",result:"Home Run",
    pitch:{pX:1.015,pZ:0.973,szTop:3.40,szBot:1.59,call:"ball",type:"Knuckle Curve",speed:"82.5 mph",preCount:"1-0"}},
  {label:"Vlad Jr. double",sub:"Bot 11 · 0 out · Bases empty · LAD 5, TOR 4",note:"Down 1 in the bottom of the 11th. Vlad Jr. rips a double — 5 called pitches in a full-count battle. Tying run in scoring position.",count:"3-2",outs:0,bases:"000",inn:11,isTop:false,away:5,home:4,batterId:665489,pitcherId:808967,batter:"Vladimir Guerrero Jr.",pitcher:"Yoshinobu Yamamoto",result:"Double",
    pitch:{pX:-1.105,pZ:3.131,szTop:3.67,szBot:1.51,call:"ball",type:"Splitter",speed:"91.3 mph",preCount:"2-2"}},
];

// ============================================================
// STRIKE ZONE COMPONENTS
// ============================================================
function CompactZone({pX,pZ,szTop,szBot,call,onClickZone,interactive}){
  const W=120,H=155;
  const m={t:12,b:12,l:18,r:18};
  const pW=W-m.l-m.r,pH=H-m.t-m.b;
  const xR=[-1.5,1.5],zR=[0.5,4.5];
  const sx=(ft)=>m.l+((ft-xR[0])/(xR[1]-xR[0]))*pW;
  const sy=(ft)=>m.t+((zR[1]-ft)/(zR[1]-zR[0]))*pH;
  const zL=sx(-ZONE_HALF),zR2=sx(ZONE_HALF),zT=sy(szTop||3.5),zB=sy(szBot||1.6);
  const zW=zR2-zL,zH=zB-zT;
  const hasPitch=pX!=null&&pZ!=null;
  const px=hasPitch?sx(pX):0,py=hasPitch?sy(pZ):0;
  const dist=hasPitch?getDistFromZone(pX,pZ,szTop||3.5,szBot||1.6):0;
  const inside=dist<0;
  const dotColor=call==="strike"?"#dc2626":"#16a34a";
  const lineColor=Math.abs(dist)<1.5?"#d97706":inside?"#16a34a":"#dc2626";
  let ex=px,ey=py;
  if(hasPitch&&!inside){ex=sx(Math.max(-ZONE_HALF,Math.min(ZONE_HALF,pX)));ey=sy(Math.max(szBot||1.6,Math.min(szTop||3.5,pZ)));}
  const handleClick=onClickZone?(e)=>{
    const rect=e.currentTarget.getBoundingClientRect();
    const svgX=(e.clientX-rect.left)/rect.width*W;
    const svgY=(e.clientY-rect.top)/rect.height*H;
    const ftX=xR[0]+((svgX-m.l)/pW)*(xR[1]-xR[0]);
    const ftZ=zR[1]-((svgY-m.t)/pH)*(zR[1]-zR[0]);
    onClickZone(ftX,ftZ);
  }:undefined;
  return(
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{borderRadius:6,flexShrink:0,cursor:interactive?"crosshair":"default"}} onClick={handleClick}>
      <rect width={W} height={H} fill="#fff" rx={6}/>
      <polygon points={`${sx(0)},${sy(0.4)} ${sx(-ZONE_HALF)},${sy(0.6)} ${sx(-ZONE_HALF)},${sy(0.7)} ${sx(ZONE_HALF)},${sy(0.7)} ${sx(ZONE_HALF)},${sy(0.6)}`} fill="#f3f4f6" stroke="#e5e7eb" strokeWidth={0.5}/>
      <rect x={zL} y={zT} width={zW} height={zH} fill="#f9fafb" stroke="#9ca3af" strokeWidth={1.2}/>
      {[1,2].map(i=><line key={`h${i}`} x1={zL} y1={zT+(zH/3)*i} x2={zR2} y2={zT+(zH/3)*i} stroke="#e5e7eb" strokeWidth={0.4}/>)}
      {[1,2].map(i=><line key={`v${i}`} x1={zL+(zW/3)*i} y1={zT} x2={zL+(zW/3)*i} y2={zB} stroke="#e5e7eb" strokeWidth={0.4}/>)}
      {hasPitch&&!inside&&<line x1={px} y1={py} x2={ex} y2={ey} stroke={lineColor} strokeWidth={1} strokeDasharray="2 1.5" opacity={0.7}/>}
      {hasPitch&&!inside&&Math.abs(dist)>1&&<text x={(px+ex)/2+6} y={(py+ey)/2-1} fill={lineColor} fontSize={7} fontWeight={700} fontFamily="monospace">{dist.toFixed(1)}"</text>}
      {hasPitch&&<circle cx={px} cy={py} r={4} fill={dotColor} opacity={0.9} stroke="#fff" strokeWidth={1}/>}
      {interactive&&!hasPitch&&<text x={W/2} y={H/2} textAnchor="middle" fontSize={8} fill="#d1d5db">Tap zone</text>}
    </svg>
  );
}

function ZoneCard({pitch,thresh,persp,interactive,onClickZone,onClear,sigma=1.0}){
  const green="#16a34a",red="#dc2626";
  const zone=useMemo(()=>{
    if(!pitch)return null;
    const dist=getDistFromZone(pitch.pX,pitch.pZ,pitch.szTop,pitch.szBot);
    const inside=dist<0;
    const pOutside=confidenceFromDist(dist,sigma);
    const pInside=100-pOutside;
    const conf=pitch.call==="strike"?pOutside:pInside;
    const shouldChallenge=conf>=thresh;
    const challengerPersp=pitch.call==="strike"?"offense":"defense";
    const canChallenge=persp===challengerPersp;
    return{dist,inside,conf,shouldChallenge,canChallenge};
  },[pitch,thresh,persp,sigma]);

  const hasPitch=!!pitch;
  const{dist,inside,conf,shouldChallenge,canChallenge}=zone||{};

  return(
    <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:10,marginBottom:10,overflow:"hidden",opacity:hasPitch&&!canChallenge?0.5:1}}>
      <div style={{padding:"7px 12px",borderBottom:"1px solid #f3f4f6",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        {hasPitch?(
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:10,fontWeight:700,color:pitch.call==="strike"?red:pitch.call==="ball"?green:"#9ca3af",textTransform:"uppercase",letterSpacing:0.5}}>{pitch.call?`Called ${pitch.call}`:pitch.rawCall||"Pitch"}</span>
            {(pitch.type||pitch.speed)&&<><span style={{fontSize:10,color:"#d1d5db"}}>{"\u00B7"}</span><span style={{fontSize:10,color:"#9ca3af"}}>{pitch.type||""} {pitch.speed||""}</span></>}
            {pitch.result&&<><span style={{fontSize:10,color:"#d1d5db"}}>{"\u00B7"}</span><span style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>{pitch.result}</span></>}
          </div>
        ):(
          <span style={{fontSize:10,color:"#9ca3af"}}>{interactive?"Click zone to plot pitch":"Pitch Location"}</span>
        )}
        {hasPitch&&canChallenge?(
          <div style={{fontSize:11,fontWeight:800,padding:"2px 10px",borderRadius:5,background:shouldChallenge?"#f0fdf4":"#f3f4f6",color:shouldChallenge?green:"#6b7280"}} title={shouldChallenge?"Confidence exceeds threshold":"Confidence below threshold"}>
            {shouldChallenge?"CHALLENGE":"HOLD"}
          </div>
        ):hasPitch&&!canChallenge?(
          <div style={{fontSize:10,color:"#9ca3af"}}>Call favors you</div>
        ):null}
      </div>
      <div style={{padding:"8px 10px"}}>
        <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
          <CompactZone pX={pitch?.pX} pZ={pitch?.pZ} szTop={pitch?.szTop||3.5} szBot={pitch?.szBot||1.6} call={pitch?.call||"strike"} onClickZone={onClickZone} interactive={interactive}/>
          {hasPitch&&canChallenge?(
            <div style={{flex:1,paddingTop:2}}>
              <div style={{display:"flex",flexDirection:"column",gap:4}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}} title="Distance from nearest zone edge"><span style={{fontSize:9,color:"#9ca3af",fontWeight:600,cursor:"help"}}>DIST</span><span style={{fontSize:15,fontWeight:700,fontVariantNumeric:"tabular-nums",color:inside?green:Math.abs(dist)<1.5?"#d97706":red}}>{inside?`${Math.abs(dist).toFixed(1)}" in`:`${dist.toFixed(1)}" out`}</span></div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}} title={pitch.call==="strike"?"Confidence pitch was actually a ball":"Confidence pitch was actually a strike"}><span style={{fontSize:9,color:"#9ca3af",fontWeight:600,cursor:"help"}}>CONF</span><span style={{fontSize:15,fontWeight:700,fontVariantNumeric:"tabular-nums",color:conf>=thresh?green:"#374151"}}>{conf}%</span></div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}} title="Tango threshold for this count/bases/outs"><span style={{fontSize:9,color:"#9ca3af",fontWeight:600,cursor:"help"}}>NEED</span><span style={{fontSize:15,fontWeight:700,color:"#374151",fontVariantNumeric:"tabular-nums"}}>{thresh}%</span></div>
              </div>
              <div style={{marginTop:6}} title={`Confidence ${conf}% vs ${thresh}% threshold`}>
                <div style={{height:4,borderRadius:2,background:"#e5e7eb",position:"relative",overflow:"hidden"}}><div style={{height:"100%",borderRadius:2,width:`${Math.min(conf,100)}%`,background:shouldChallenge?green:"#9ca3af",transition:"width .3s ease"}}/></div>
                <div style={{position:"relative",height:8,marginTop:-6}}><div style={{position:"absolute",left:`${thresh}%`,transform:"translateX(-50%)",width:1.5,height:8,background:"#374151",borderRadius:1}}/></div>
              </div>
              {interactive&&<button onClick={onClear} style={{marginTop:6,background:"none",border:"none",cursor:"pointer",fontSize:9,color:"#d1d5db",fontFamily:"inherit",padding:0}}>Clear</button>}
            </div>
          ):hasPitch&&!canChallenge?(
            <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"16px 0",gap:6}}>
              <span style={{fontSize:11,color:"#9ca3af"}}>Called {pitch.call} favors {persp==="offense"?"batting":"pitching"} side</span>
              {interactive&&<button onClick={onClear} style={{background:"none",border:"none",cursor:"pointer",fontSize:9,color:"#d1d5db",fontFamily:"inherit",padding:0}}>Clear</button>}
            </div>
          ):(
            <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px 0",fontSize:11,color:"#d1d5db"}}>
              {interactive?"Click zone to place pitch":"No pitch data"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
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
// CSV PARSER (lightweight, handles quoted fields)
// ============================================================
function parseCSV(text){
  const lines=text.split(/\r?\n/).filter(l=>l.trim());
  if(lines.length<2)return[];
  const headers=parseCSVLine(lines[0]).map(h=>h.trim());
  return lines.slice(1).map(line=>{
    const vals=parseCSVLine(line);
    const row={};
    headers.forEach((h,i)=>{row[h]=vals[i]?.trim()||"";});
    return row;
  });
}
function parseCSVLine(line){
  const result=[];let cur="",inQuote=false;
  for(let i=0;i<line.length;i++){
    const ch=line[i];
    if(inQuote){
      if(ch==='"'&&line[i+1]==='"'){cur+='"';i++;}
      else if(ch==='"')inQuote=false;
      else cur+=ch;
    }else{
      if(ch==='"')inQuote=true;
      else if(ch===","){result.push(cur);cur="";}
      else cur+=ch;
    }
  }
  result.push(cur);
  return result;
}
// Case-insensitive column resolver — accepts multiple aliases, first match wins
function resolveColumn(row,...names){
  for(const name of names){
    const key=Object.keys(row).find(k=>k.toLowerCase()===name.toLowerCase());
    if(key&&row[key]!==''&&row[key]!==undefined)return row[key];
  }
  return undefined;
}
// PitchCall mapping — Trackman V3 descriptive strings + Statcast + shorthand
const CALLED_STRIKES=['StrikeCalled','called_strike','C','S'];
const CALLED_BALLS=['BallCalled','ball','B'];
function mapPitchCall(raw){
  if(!raw)return{call:null,rawCall:''};
  const trimmed=raw.trim();
  if(CALLED_STRIKES.includes(trimmed))return{call:'strike',rawCall:trimmed};
  if(CALLED_BALLS.includes(trimmed))return{call:'ball',rawCall:trimmed};
  return{call:null,rawCall:trimmed};
}
function parseBool(v){
  if(v==null||v==='')return null;
  if(typeof v==='number')return v?1:0;
  if(typeof v==='boolean')return v?1:0;
  const s=String(v).trim().toUpperCase();
  return(s==='1'||s==='TRUE')?1:(s==='0'||s==='FALSE')?0:null;
}
function mapTrackmanRow(row){
  const pX=parseFloat(resolveColumn(row,'PlateLocSide','plate_x','px'));
  const pZ=parseFloat(resolveColumn(row,'PlateLocHeight','plate_z','pz'));
  const szTop=parseFloat(resolveColumn(row,'sz_top','zone_top','StrikeZoneTop'))||3.5;
  const szBot=parseFloat(resolveColumn(row,'sz_bot','zone_bot','StrikeZoneBottom'))||1.6;
  if(isNaN(pX)||isNaN(pZ))return null;
  const rawCallStr=resolveColumn(row,'PitchCall','pitch_call','call','description')||'';
  const{call,rawCall}=mapPitchCall(rawCallStr);
  const type=resolveColumn(row,'TaggedPitchType','AutoPitchType','pitch_type')||'';
  const rawSpeed=resolveColumn(row,'RelSpeed','ZoneSpeed','speed')||'';
  const speed=rawSpeed&&!String(rawSpeed).includes('mph')?rawSpeed+' mph':String(rawSpeed);
  const ballsVal=resolveColumn(row,'Balls','balls');
  const strikesVal=resolveColumn(row,'Strikes','strikes');
  const outsVal=resolveColumn(row,'Outs','outs','outs_when_up');
  const balls=ballsVal!=null?parseInt(ballsVal):null;
  const strikes=strikesVal!=null?parseInt(strikesVal):null;
  const outsNum=outsVal!=null?parseInt(outsVal):null;
  const on1b=parseBool(resolveColumn(row,'on_1b'));
  const on2b=parseBool(resolveColumn(row,'on_2b'));
  const on3b=parseBool(resolveColumn(row,'on_3b'));
  const preCount=balls!=null&&!isNaN(balls)&&strikes!=null&&!isNaN(strikes)?`${balls}-${strikes}`:null;
  const preOuts=outsNum!=null&&!isNaN(outsNum)?Math.min(outsNum,2):null;
  const preBases=on1b!=null&&on2b!=null&&on3b!=null?`${on1b}${on2b}${on3b}`:null;
  const pitcher=resolveColumn(row,'Pitcher','pitcher')||'';
  const batter=resolveColumn(row,'Batter','batter')||'';
  const catcher=resolveColumn(row,'Catcher','catcher')||'';
  const inning=resolveColumn(row,'Inning','inning')||'';
  const half=resolveColumn(row,'Top/Bottom','top_bottom','inning_topbot')||'';
  return{pX,pZ,szTop,szBot,call,type,speed,preCount,preOuts,preBases,rawCall,pitcher,batter,catcher,inning,half};
}

// ============================================================
// ZONE GRAPHIC — SVG strike zone for training mode
// ============================================================
function ZoneGraphic({pitchX,pitchZ}){
  const W=200,H=240;
  const mapX=x=>(x+1.5)/3*W;
  const mapZ=z=>H-(z-1.0)/3.2*H;
  const zL=mapX(ZONE_LEFT),zR=mapX(ZONE_RIGHT),zT=mapZ(ZONE_TOP),zB=mapZ(ZONE_BOT);
  const sL=mapX(EFF_LEFT),sR=mapX(EFF_RIGHT),sT=mapZ(EFF_TOP),sB=mapZ(EFF_BOT);
  const hasPitch=pitchX!=null&&pitchZ!=null;
  const px=hasPitch?mapX(pitchX):0,pz=hasPitch?mapZ(pitchZ):0;
  const plateW=17/12/3*W,plateMid=W/2,plateY=mapZ(1.0);
  return(
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{display:"block",margin:"0 auto"}}>
      <rect x={sL} y={sT} width={sR-sL} height={sB-sT} fill="none" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 3"/>
      <rect x={zL} y={zT} width={zR-zL} height={zB-zT} fill="none" stroke="#d1d5db" strokeWidth="1.5"/>
      <polygon points={`${plateMid},${plateY} ${plateMid-plateW/2},${plateY-6} ${plateMid-plateW/2},${plateY-12} ${plateMid+plateW/2},${plateY-12} ${plateMid+plateW/2},${plateY-6}`} fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1"/>
      {hasPitch&&<circle cx={px} cy={pz} r={7} fill="#dc2626" stroke="#fff" strokeWidth={2}/>}
    </svg>
  );
}

// ============================================================
// TRAINING HELPERS — tug of war, intuition, RE ledger, mini zone
// ============================================================

// Generate a plain-English sentence explaining why the break-even is what it is
function getBreakevenIntuition(scenario, perspective) {
  const { count, bases, outs, breakeven, pD, transition } = scenario;
  const [b, s] = count.split("-").map(Number);
  const basesDesc = BASES_LIST.find(x => x.key === bases)?.desc || "Empty";
  const absSwing = Math.abs(pD).toFixed(3);
  const isTerminal = transition.terminal;
  const isWalk = transition.to === "BB";
  const isK = transition.to === "K";

  if (breakeven <= 25) {
    if (isWalk) return `${basesDesc}, ${outs} out, full count — overturning means a walk${bases === "111" ? " and a run scores" : ""}. The ${absSwing} run swing makes almost any read worth it.`;
    if (isK) return `${basesDesc}, ${outs} out${outs === 2 ? " — overturning means a strikeout to end the inning" : ""} — ${absSwing} run swing. Challenge on a hunch.`;
    return `${basesDesc}, ${outs} out — the ${absSwing} run swing is so large that even low confidence justifies the challenge.`;
  }
  if (breakeven >= 75) {
    if (basesDesc === "Empty" && outs === 0) return `Empty, nobody out — the count shift is worth only ${absSwing} runs. You need to be very sure the call was wrong.`;
    return `${basesDesc}, ${outs} out — the ${absSwing} run swing is small relative to the cost. Save your challenge for a bigger moment.`;
  }
  if (breakeven >= 55) {
    return `${basesDesc}, ${outs} out — a ${absSwing} run swing. Moderate leverage — you need a solid read, not just a hunch.`;
  }
  return `${basesDesc}, ${outs} out — a ${absSwing} run swing. The math leans toward challenging if your read says it was wrong.`;
}

// Compute both transitions for tug of war display on reveal
function getBothTransitions(scenario) {
  const trans = getTrans(scenario.count, scenario.outs, scenario.bases);
  const cur = scenario.cur;
  const results = [];
  for (const t of trans) {
    let cor;
    if (t.terminal) {
      if (t.newOuts >= 3) cor = 0;
      else cor = (RE[t.newOuts]?.[t.newBases]?.["0-0"] ?? 0) + t.runs;
    } else {
      cor = RE[scenario.outs]?.[scenario.bases]?.[t.to];
    }
    if (cor == null) continue;
    const dRE = cor - cur;
    const COST = 0.20;
    const pD_batter = dRE;
    const pD_catcher = -dRE;
    results.push({ ...t, dRE, cor, batterSwing: Math.abs(pD_batter), catcherSwing: Math.abs(pD_catcher) });
  }
  return results;
}

// Compute RE impact: the difference in expected value between what you did
// and what you should have done. Positive = you did better than or equal to optimal.
// The baseline is the WRONG action's EV, so correct decisions always show >= 0.
function getREImpact(scenario, userAction) {
  const COST = 0.20;
  const swing = Math.abs(scenario.pD);
  const conf = scenario.zoneConf / 100;
  // EV of challenging: expected overturn value minus challenge cost
  const evChallenge = swing * conf - COST;
  // EV of accepting: 0 (no cost, no gain)
  const evAccept = 0;

  const myEV = userAction === "challenge" ? evChallenge : evAccept;
  const optimalEV = scenario.correctAction === "challenge" ? evChallenge : evAccept;

  // How much better/worse you did vs optimal
  return myEV - optimalEV;
}

// Mini zone SVG for replay reel
function MiniZone({ pitchX, pitchZ, verdictColor, size = 48 }) {
  const W = size, H = size * 1.2;
  const mapX = x => (x + 1.5) / 3 * W;
  const mapZ = z => H - (z - 1.0) / 3.2 * H;
  const zL = mapX(ZONE_LEFT), zR = mapX(ZONE_RIGHT), zT = mapZ(ZONE_TOP), zB = mapZ(ZONE_BOT);
  const hasPitch = pitchX != null && pitchZ != null;
  const px = hasPitch ? mapX(pitchX) : 0, pz = hasPitch ? mapZ(pitchZ) : 0;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      <rect x={zL} y={zT} width={zR - zL} height={zB - zT} fill="none" stroke="#d1d5db" strokeWidth="1" />
      {hasPitch && <circle cx={px} cy={pz} r={size / 10} fill={verdictColor || "#dc2626"} stroke="#fff" strokeWidth={1} />}
    </svg>
  );
}

// ============================================================
// VERDICT SYSTEM — tiered feedback for training
// ============================================================
// Classifies each decision into a nuanced tier instead of binary correct/incorrect.
// High-confidence zone threshold: if zoneConf >= this, the call is "clearly wrong"
const ZONE_OBVIOUS_THRESH = 75;

function getVerdict(userAction, scenario) {
  const { correctAction, zoneConf, breakeven } = scenario;
  const zoneObvious = zoneConf >= ZONE_OBVIOUS_THRESH; // the call is clearly wrong
  const reChallenge = correctAction === "challenge"; // break-even math says challenge
  const callLikelyWrong = zoneConf > 50; // more likely than not the call was wrong

  if (userAction === "challenge") {
    if (reChallenge) {
      return { tier: "perfect", label: "Perfect", emoji: "🎯", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0",
        desc: "Confidence above break-even and zone-aware — this is the challenge to make." };
    }
    if (zoneObvious) {
      return { tier: "smart_costly", label: "Smart but costly", emoji: "👁", color: "#d97706", bg: "#fffbeb", border: "#fde68a",
        desc: `Good eye — the call was wrong (${zoneConf}% conf), but break-even was ${breakeven}% here. The run swing didn't justify it. Save this challenge for a bigger moment.` };
    }
    if (callLikelyWrong) {
      return { tier: "lucky_challenge", label: "Overturned, but risky", emoji: "🍀", color: "#d97706", bg: "#fffbeb", border: "#fde68a",
        desc: `The call was probably wrong (${zoneConf}% conf), so this gets overturned. But break-even was ${breakeven}% — at this confidence, you're gambling. Over a season, this costs more challenges than it saves.` };
    }
    return { tier: "bad_challenge", label: "Bad challenge", emoji: "✗", color: "#dc2626", bg: "#fef2f2", border: "#fecaca",
      desc: `The call was probably right (${zoneConf}% conf) and break-even was ${breakeven}%. Burned a challenge on a pitch that likely stands.` };
  }

  // userAction === "accept"
  if (reChallenge && zoneObvious) {
    return { tier: "missed", label: "Missed opportunity", emoji: "⚠", color: "#dc2626", bg: "#fef2f2", border: "#fecaca",
      desc: `The call was clearly wrong (${zoneConf}% conf) and break-even was only ${breakeven}%. This was the moment to challenge.` };
  }
  if (reChallenge && !zoneObvious) {
    return { tier: "tough_hold", label: "Tough hold", emoji: "🤏", color: "#d97706", bg: "#fffbeb", border: "#fde68a",
      desc: `Break-even was ${breakeven}% so the math said challenge, but the pitch was borderline (${zoneConf}% conf). Close call.` };
  }
  if (!reChallenge && zoneObvious) {
    return { tier: "disciplined", label: "Disciplined hold", emoji: "🧊", color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe",
      desc: `The call was wrong (${zoneConf}% conf), but break-even was ${breakeven}% — the run swing didn't justify spending it. Smart discipline.` };
  }
  return { tier: "perfect", label: "Perfect", emoji: "🎯", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0",
    desc: "Correct read — the call was close and the break-even said hold." };
}

// ============================================================
// HISTORICAL GAME LIBRARY — real Statcast data for training
// ============================================================
const HISTORICAL_GAMES = [
  {
    id: "ws2025g7",
    title: "2025 World Series Game 7",
    sub: "LAD 5, TOR 4 (11 inn)",
    tag: "Postseason",
    pitches: [
      { batter: "Teoscar Hernández", pitcher: "Chris Bassitt", inn: 6, isTop: true, count: "2-1", outs: 0, bases: "110", pitchX: 0.266, pitchZ: 3.401, szTop: 3.38, szBot: 1.62, call: "ball", type: "Sinker", speed: "92 mph", preCount: "1-1", note: "Ump scorecard #1 missed call. Strike called a ball." },
      { batter: "Andrés Giménez", pitcher: "Tyler Glasnow", inn: 6, isTop: false, count: "3-2", outs: 0, bases: "100", pitchX: -0.573, pitchZ: 2.338, szTop: 3.50, szBot: 1.70, call: "strike", type: "Fastball", speed: "96 mph", preCount: "3-1", note: "5 called pitches. Giménez doubles to drive in a run." },
      { batter: "Max Muncy", pitcher: "Trey Yesavage", inn: 8, isTop: true, count: "0-1", outs: 1, bases: "000", pitchX: 0.234, pitchZ: 3.472, szTop: 3.17, szBot: 1.51, call: "strike", type: "Splitter", speed: "82 mph", preCount: "0-0", note: "Down 2 in the 8th. Called strike 3.7\" outside zone. Muncy homers next." },
      { batter: "Davis Schneider", pitcher: "Blake Snell", inn: 8, isTop: false, count: "2-2", outs: 2, bases: "010", pitchX: 0.914, pitchZ: 2.835, szTop: 3.11, szBot: 1.53, call: "strike", type: "Changeup", speed: "82 mph", preCount: "2-1", note: "Ump scorecard #3 missed call. Ball called strike, leads to K." },
      { batter: "Will Smith", pitcher: "Jeff Hoffman", inn: 9, isTop: true, count: "3-2", outs: 2, bases: "000", pitchX: 0.960, pitchZ: 2.130, szTop: 3.33, szBot: 1.57, call: "strike", type: "Fastball", speed: "95 mph", preCount: "3-2", note: "Ump scorecard #2 missed call. 6 called pitches in the AB." },
      { batter: "Teoscar Hernández", pitcher: "Seranthony Domínguez", inn: 10, isTop: true, count: "3-2", outs: 1, bases: "110", pitchX: 1.014, pitchZ: 2.325, szTop: 3.55, szBot: 1.70, call: "ball", type: "Fastball", speed: "99 mph", preCount: "2-2", note: "Extras. Bases loaded walk. Challenge here changes everything." },
      { batter: "Will Smith", pitcher: "Shane Bieber", inn: 11, isTop: true, count: "2-0", outs: 2, bases: "000", pitchX: 1.015, pitchZ: 0.973, szTop: 3.40, szBot: 1.59, call: "ball", type: "Knuckle Curve", speed: "83 mph", preCount: "1-0", note: "Smith homers to break the tie in the 11th." },
      { batter: "Vladimir Guerrero Jr.", pitcher: "Yoshinobu Yamamoto", inn: 11, isTop: false, count: "3-2", outs: 0, bases: "000", pitchX: -1.105, pitchZ: 3.131, szTop: 3.67, szBot: 1.51, call: "ball", type: "Splitter", speed: "91 mph", preCount: "2-2", note: "Bottom 11, down 1. Vlad Jr. rips a double. Tying run in scoring position." },
    ],
  },
  {
    id: "alwc2024",
    title: "2024 AL Wild Card Game 3",
    sub: "DET 2, HOU 1",
    tag: "Postseason",
    pitches: [
      { batter: "Jose Altuve", pitcher: "Tarik Skubal", inn: 1, isTop: false, count: "1-2", outs: 0, bases: "000", pitchX: -0.831, pitchZ: 2.690, szTop: 3.22, szBot: 1.56, call: "strike", type: "Slider", speed: "85 mph", preCount: "1-1", note: "Skubal's slider painting the corner on Altuve. Just catches the edge." },
      { batter: "Yordan Alvarez", pitcher: "Tarik Skubal", inn: 3, isTop: false, count: "2-2", outs: 1, bases: "100", pitchX: 0.743, pitchZ: 1.582, szTop: 3.55, szBot: 1.60, call: "ball", type: "Changeup", speed: "88 mph", preCount: "2-1", note: "Runner on first. Alvarez takes a borderline low pitch. Walk or K changes the inning." },
      { batter: "Alex Bregman", pitcher: "Tarik Skubal", inn: 5, isTop: false, count: "3-2", outs: 2, bases: "010", pitchX: -0.492, pitchZ: 3.355, szTop: 3.30, szBot: 1.65, call: "ball", type: "Fastball", speed: "97 mph", preCount: "3-1", note: "Runner in scoring position, 2 outs. High fastball just misses — walk loads it up." },
      { batter: "Kerry Carpenter", pitcher: "Ryan Pressly", inn: 7, isTop: true, count: "1-2", outs: 1, bases: "100", pitchX: 0.881, pitchZ: 2.044, szTop: 3.42, szBot: 1.68, call: "strike", type: "Fastball", speed: "95 mph", preCount: "1-1", note: "Carpenter facing the closer. Called strike on the outside edge." },
      { batter: "Matt Vierling", pitcher: "Ryan Pressly", inn: 7, isTop: true, count: "2-2", outs: 2, bases: "110", pitchX: -0.256, pitchZ: 1.533, szTop: 3.18, szBot: 1.55, call: "ball", type: "Slider", speed: "87 mph", preCount: "2-1", note: "Runners on 1st and 2nd. Low slider. Ball or strike changes the inning." },
      { batter: "Jose Altuve", pitcher: "Beau Brieske", inn: 9, isTop: false, count: "3-2", outs: 1, bases: "100", pitchX: 0.612, pitchZ: 1.648, szTop: 3.22, szBot: 1.56, call: "strike", type: "Slider", speed: "83 mph", preCount: "3-1", note: "Bottom 9, down 1. Altuve rung up on a low slider. Tigers win the series." },
    ],
  },
  {
    id: "hernandez2022",
    title: "Angel Hernandez: CLE vs CWS",
    sub: "Apr 20, 2022 — 14 missed calls",
    tag: "Umpire Study",
    pitches: [
      { batter: "José Ramírez", pitcher: "Vince Velasquez", inn: 1, isTop: true, count: "1-0", outs: 0, bases: "100", pitchX: -0.906, pitchZ: 2.520, szTop: 3.10, szBot: 1.55, call: "strike", type: "Fastball", speed: "93 mph", preCount: "0-0", note: "Hernandez calls a strike well off the outside corner. Sets the tone." },
      { batter: "Josh Naylor", pitcher: "Vince Velasquez", inn: 1, isTop: true, count: "2-1", outs: 0, bases: "110", pitchX: 0.957, pitchZ: 2.831, szTop: 3.28, szBot: 1.62, call: "strike", type: "Changeup", speed: "84 mph", preCount: "2-0", note: "Another outside strike call. Runners on 1st and 2nd." },
      { batter: "Owen Miller", pitcher: "Vince Velasquez", inn: 1, isTop: true, count: "1-1", outs: 1, bases: "101", pitchX: -0.411, pitchZ: 1.380, szTop: 3.35, szBot: 1.60, call: "ball", type: "Curveball", speed: "78 mph", preCount: "0-1", note: "Low pitch, but catches more zone than Hernandez gives it credit for." },
      { batter: "Tim Anderson", pitcher: "Cal Quantrill", inn: 2, isTop: false, count: "0-1", outs: 0, bases: "000", pitchX: 0.284, pitchZ: 3.691, szTop: 3.45, szBot: 1.68, call: "ball", type: "Sinker", speed: "94 mph", preCount: "0-0", note: "Hernandez squeezes the top of the zone. Clear strike called ball." },
      { batter: "AJ Pollock", pitcher: "Cal Quantrill", inn: 4, isTop: false, count: "2-2", outs: 1, bases: "010", pitchX: -0.873, pitchZ: 2.195, szTop: 3.22, szBot: 1.55, call: "strike", type: "Slider", speed: "82 mph", preCount: "2-1", note: "Runner on 2nd. Slider misses outside. Hernandez punches him out." },
      { batter: "José Abreu", pitcher: "Cal Quantrill", inn: 6, isTop: false, count: "3-2", outs: 2, bases: "110", pitchX: 0.799, pitchZ: 1.402, szTop: 3.48, szBot: 1.52, call: "ball", type: "Sinker", speed: "93 mph", preCount: "3-1", note: "Full count, runners on 1st and 2nd, 2 outs. Low sinker called ball — walk loads the bases." },
      { batter: "Franmil Reyes", pitcher: "Dallas Keuchel", inn: 5, isTop: true, count: "1-2", outs: 2, bases: "001", pitchX: -0.352, pitchZ: 3.524, szTop: 3.42, szBot: 1.72, call: "ball", type: "Fastball", speed: "91 mph", preCount: "1-1", note: "Runner on 3rd. High fastball that catches the zone. Ball call extends the AB." },
      { batter: "Ernie Clement", pitcher: "Vince Velasquez", inn: 3, isTop: true, count: "0-2", outs: 1, bases: "000", pitchX: 0.725, pitchZ: 3.380, szTop: 3.20, szBot: 1.45, call: "ball", type: "Fastball", speed: "94 mph", preCount: "0-1", note: "0-2 count, nobody on. High outside fastball called ball — borderline, but Hernandez has been inconsistent." },
    ],
  },
  {
    id: "perfect2023",
    title: "Domingo Germán Perfect Game",
    sub: "Jun 28, 2023 — NYY 11, OAK 0",
    tag: "Historic",
    pitches: [
      { batter: "Esteury Ruiz", pitcher: "Domingo Germán", inn: 1, isTop: false, count: "0-2", outs: 0, bases: "000", pitchX: 0.725, pitchZ: 1.524, szTop: 3.42, szBot: 1.55, call: "strike", type: "Changeup", speed: "84 mph", preCount: "0-1", note: "First batter of the game. Germán gets ahead with a borderline low changeup." },
      { batter: "Tony Kemp", pitcher: "Domingo Germán", inn: 3, isTop: false, count: "1-2", outs: 1, bases: "000", pitchX: -0.848, pitchZ: 2.310, szTop: 3.05, szBot: 1.52, call: "strike", type: "Slider", speed: "86 mph", preCount: "1-1", note: "Slider that catches the outside edge. Germán through 3 perfect." },
      { batter: "Jace Peterson", pitcher: "Domingo Germán", inn: 5, isTop: false, count: "2-2", outs: 2, bases: "000", pitchX: 0.345, pitchZ: 3.365, szTop: 3.32, szBot: 1.48, call: "strike", type: "Fastball", speed: "93 mph", preCount: "2-1", note: "15 up, 15 down. High fastball called strike. Just at the top of the zone." },
      { batter: "Ryan Noda", pitcher: "Domingo Germán", inn: 7, isTop: false, count: "3-2", outs: 0, bases: "000", pitchX: -0.768, pitchZ: 2.756, szTop: 3.50, szBot: 1.65, call: "strike", type: "Cutter", speed: "88 mph", preCount: "3-1", note: "Full count, leadoff hitter, 7th inning of a perfect game. Cutter on the corner." },
      { batter: "Shea Langeliers", pitcher: "Domingo Germán", inn: 8, isTop: false, count: "1-2", outs: 1, bases: "000", pitchX: 0.489, pitchZ: 1.498, szTop: 3.38, szBot: 1.55, call: "strike", type: "Changeup", speed: "83 mph", preCount: "1-1", note: "22 up, 22 down. Low changeup. Borderline — if overturned, leadoff walk kills the perfecto." },
      { batter: "Seth Brown", pitcher: "Domingo Germán", inn: 9, isTop: false, count: "0-1", outs: 0, bases: "000", pitchX: -0.712, pitchZ: 2.891, szTop: 3.25, szBot: 1.60, call: "strike", type: "Slider", speed: "86 mph", preCount: "0-0", note: "9th inning. First pitch slider on the corner. 24 outs to go: 3." },
      { batter: "Aledmys Díaz", pitcher: "Domingo Germán", inn: 9, isTop: false, count: "2-2", outs: 1, bases: "000", pitchX: 0.408, pitchZ: 3.292, szTop: 3.30, szBot: 1.58, call: "strike", type: "Fastball", speed: "94 mph", preCount: "2-1", note: "25 up, 25 down. High heat. One out from history." },
      { batter: "Carlos Pérez", pitcher: "Domingo Germán", inn: 9, isTop: false, count: "1-2", outs: 2, bases: "000", pitchX: -0.652, pitchZ: 2.148, szTop: 3.15, szBot: 1.50, call: "strike", type: "Slider", speed: "85 mph", preCount: "1-1", note: "Final batter. Slider on the outside corner. History." },
    ],
  },
];

// Build a training scenario from a historical pitch
function historicalToScenario(pitch, perspective) {
  const rawConf = getZoneConfidence(pitch.pitchX, pitch.pitchZ);
  const zoneConf = Math.max(5, Math.min(95, Math.round(rawConf * 100)));
  const count = pitch.preCount || pitch.count;
  const [b, s] = count.split("-").map(Number);
  const outs = pitch.outs;
  const bases = pitch.bases;
  const thresh = getTangoThresh(bases, outs, b, s);
  const tier = getTier(thresh);
  const trans = getTrans(count, outs, bases);
  const relevantType = perspective === "batter" ? "s2b" : "b2s";
  const transition = trans.find(t => t.type === relevantType);
  if (!transition) return null;

  const cur = RE[outs]?.[bases]?.[count];
  if (cur == null) return null;
  let cor;
  if (transition.terminal) {
    if (transition.newOuts >= 3) cor = 0;
    else cor = (RE[transition.newOuts]?.[transition.newBases]?.["0-0"] ?? 0) + transition.runs;
  } else {
    cor = RE[outs]?.[bases]?.[transition.to];
    if (cor == null) return null;
  }
  const deltaRE = cor - cur;
  const pD = perspective === "batter" ? deltaRE : -deltaRE;
  const COST = 0.20;
  const breakeven = Math.round(COST / (Math.abs(pD) + COST) * 100);
  const correctAction = zoneConf >= breakeven ? "challenge" : "accept";
  return {
    count, outs, bases, pitchX: pitch.pitchX, pitchZ: pitch.pitchZ,
    zoneConf, transition, thresh, tier, deltaRE, pD, breakeven, correctAction, cur, cor,
    // Historical metadata
    batter: pitch.batter, pitcher: pitch.pitcher, inn: pitch.inn,
    type: pitch.type, speed: pitch.speed, call: pitch.call, note: pitch.note,
  };
}

// ============================================================
// ADAPTIVE DIFFICULTY — tighten offsets based on rolling accuracy
// ============================================================
function getAdaptiveOffset(difficulty, recentHistory) {
  if (recentHistory.length < 5) return null; // not enough data
  const last5 = recentHistory.slice(-5);
  const perfects = last5.filter(h => h.verdict?.tier === "perfect").length;
  const accuracy = perfects / 5;
  // If accuracy > 80%, tighten. If > 90%, tighten hard.
  if (accuracy >= 0.8) {
    // Scale: 80% = 0.6x, 100% = 0.15x of base offset
    const t = (accuracy - 0.8) / 0.2; // 0 to 1
    return 0.6 - t * 0.45; // 0.6 down to 0.15
  }
  return null; // no adjustment
}

function generateAdaptiveScenario(difficulty, perspective, recentHistory) {
  const adaptiveMult = getAdaptiveOffset(difficulty, recentHistory);

  // If adapting and on level 3, weight toward coin-flip game states
  // where break-even and zone conf are likely to converge (mid-range thresholds)
  const useCoinFlipState = adaptiveMult !== null && difficulty >= 3 && Math.random() < 0.6;

  const COIN_FLIP_POOL = [
    // States where Tango threshold is 40-60% — genuine toss-ups
    { count: "1-1", bases: "001", outs: 0 }, // 49%
    { count: "2-1", bases: "010", outs: 1 }, // 40%
    { count: "1-2", bases: "100", outs: 0 }, // 50%
    { count: "0-1", bases: "110", outs: 1 }, // 49%
    { count: "2-2", bases: "001", outs: 0 }, // 49%
    { count: "1-1", bases: "011", outs: 1 }, // 43%
    { count: "0-1", bases: "101", outs: 0 }, // 50%
    { count: "2-1", bases: "111", outs: 1 }, // 36%
    { count: "1-2", bases: "010", outs: 0 }, // 60%
    { count: "0-0", bases: "001", outs: 1 }, // 57%
  ];

  const gs = useCoinFlipState
    ? COIN_FLIP_POOL[Math.floor(Math.random() * COIN_FLIP_POOL.length)]
    : pickGameState(difficulty);

  // Generate pitch with tightened offsets
  const { pitchX, pitchZ } = generateAdaptivePitch(difficulty, adaptiveMult);

  const rawConf = getZoneConfidence(pitchX, pitchZ);
  const zoneConf = Math.max(5, Math.min(95, Math.round(rawConf * 100)));
  const [b, s] = gs.count.split("-").map(Number);
  const thresh = getTangoThresh(gs.bases, gs.outs, b, s);
  const tier = getTier(thresh);
  const trans = getTrans(gs.count, gs.outs, gs.bases);
  const relevantType = perspective === "batter" ? "s2b" : "b2s";
  const transition = trans.find(t => t.type === relevantType);
  if (!transition) return generateAdaptiveScenario(difficulty, perspective, recentHistory);

  const cur = RE[gs.outs]?.[gs.bases]?.[gs.count];
  if (cur == null) return generateAdaptiveScenario(difficulty, perspective, recentHistory);
  let cor;
  if (transition.terminal) {
    if (transition.newOuts >= 3) cor = 0;
    else cor = (RE[transition.newOuts]?.[transition.newBases]?.["0-0"] ?? 0) + transition.runs;
  } else {
    cor = RE[gs.outs]?.[gs.bases]?.[transition.to];
    if (cor == null) return generateAdaptiveScenario(difficulty, perspective, recentHistory);
  }
  const deltaRE = cor - cur;
  const pD = perspective === "batter" ? deltaRE : -deltaRE;
  const COST = 0.20;
  const breakeven = Math.round(COST / (Math.abs(pD) + COST) * 100);
  const correctAction = zoneConf >= breakeven ? "challenge" : "accept";
  return { ...gs, pitchX, pitchZ, zoneConf, transition, thresh, tier, deltaRE, pD, breakeven, correctAction, cur, cor, adapted: adaptiveMult !== null };
}

function generateAdaptivePitch(difficulty, adaptiveMult) {
  const edges = [
    { axis: "x", val: EFF_LEFT }, { axis: "x", val: EFF_RIGHT },
    { axis: "z", val: EFF_TOP }, { axis: "z", val: EFF_BOT },
  ];

  const mult = adaptiveMult || 1;
  const cornerChance = difficulty >= 2 ? (difficulty === 3 ? 0.4 : 0.2) : 0;
  const useCorner = Math.random() < cornerChance;

  if (useCorner) {
    const xEdge = Math.random() < 0.5 ? EFF_LEFT : EFF_RIGHT;
    const zEdge = Math.random() < 0.5 ? EFF_TOP : EFF_BOT;
    const maxOff = (difficulty === 3 ? 0.3 : 1.0) * mult;
    const xOff = (Math.random() * maxOff * 2 - maxOff) / 12;
    const zOff = (Math.random() * maxOff * 2 - maxOff) / 12;
    return { pitchX: xEdge + xOff, pitchZ: zEdge + zOff };
  }

  const edge = edges[Math.floor(Math.random() * edges.length)];
  const inside = Math.random() < 0.5;
  let offset;
  if (difficulty === 1) offset = (1.0 + Math.random() * 2.0) * mult / 12;
  else if (difficulty === 2) offset = (Math.random() * 1.2) * mult / 12;
  else offset = (Math.random() * 0.3) * mult / 12; // Level 3: 0-0.3 inches from edge

  let pitchX, pitchZ;
  if (edge.axis === "x") {
    const sign = edge.val > 0 ? 1 : -1;
    pitchX = edge.val + sign * (inside ? -offset : offset);
    pitchZ = EFF_BOT + Math.random() * (EFF_TOP - EFF_BOT);
  } else {
    const sign = edge.val > EFF_BOT ? 1 : -1;
    pitchZ = edge.val + sign * (inside ? -offset : offset);
    pitchX = EFF_LEFT + Math.random() * (EFF_RIGHT - EFF_LEFT);
  }
  return { pitchX, pitchZ };
}

// ============================================================
// TRAINING MODE
// ============================================================
function TrainingMode(){
  const[perspective,setPerspective]=useState("batter");
  const[difficulty,setDifficulty]=useState(1);
  const[phase,setPhase]=useState("ready");
  const[scenario,setScenario]=useState(null);
  const[timeLeft,setTimeLeft]=useState(2000);
  const[userAction,setUserAction]=useState(null);
  const[cardIndex,setCardIndex]=useState(0);
  const[stats,setStats]=useState({correct:0,incorrect:0,timeouts:0,totalTime:0,streak:0,bestStreak:0,reLedger:0,history:[]});
  const[challengeMode,setChallengeMode]=useState("unlimited"); // "unlimited" | "2" | "1"
  const[challengesLeft,setChallengesLeft]=useState(null); // null = unlimited
  const[previewDuration,setPreviewDuration]=useState(5);
  const[previewTimeLeft,setPreviewTimeLeft]=useState(5000);
  const[trainingSource,setTrainingSource]=useState("random"); // "random" | game id | "custom"
  const[historicalQueue,setHistoricalQueue]=useState([]); // shuffled pitch queue for historical mode
  const[customPitches,setCustomPitches]=useState([]); // parsed CSV pitches as training scenarios
  const[customPitchesTotal,setCustomPitchesTotal]=useState(0); // total before filtering
  const[customFileName,setCustomFileName]=useState("");
  const[customDragOver,setCustomDragOver]=useState(false);
  const customFileRef=useRef(null);

  // Parse an uploaded CSV into training scenarios
  const handleCustomCSV=useCallback((file)=>{
    if(!file)return;
    setCustomFileName(file.name);
    const reader=new FileReader();
    reader.onload=(e)=>{
      try{
        const rows=parseCSV(e.target.result);
        const mapped=rows.map(r=>mapTrackmanRow(r)).filter(Boolean);
        // Filter to called pitches only (ball or strike calls)
        const calledPitches=mapped.filter(p=>p.call==="ball"||p.call==="strike");
        // Convert to training scenarios
        const allScenarios=calledPitches.map(p=>{
          const count=p.preCount||"0-0";
          const outs=p.preOuts!=null?p.preOuts:0;
          const bases=p.preBases||"000";
          const rawConf=getZoneConfidence(p.pX,p.pZ);
          const zoneConf=Math.max(5,Math.min(95,Math.round(rawConf*100)));
          const[b,s]=count.split("-").map(Number);
          const thresh=getTangoThresh(bases,outs,b,s);
          const tier=getTier(thresh);
          const trans=getTrans(count,outs,bases);
          const relevantType=perspective==="batter"?"s2b":"b2s";
          const transition=trans.find(t=>t.type===relevantType);
          if(!transition)return null;
          const cur=RE[outs]?.[bases]?.[count];
          if(cur==null)return null;
          let cor;
          if(transition.terminal){
            if(transition.newOuts>=3)cor=0;
            else cor=(RE[transition.newOuts]?.[transition.newBases]?.["0-0"]??0)+transition.runs;
          }else{
            cor=RE[outs]?.[bases]?.[transition.to];
            if(cor==null)return null;
          }
          const deltaRE=cor-cur;
          const pD=perspective==="batter"?deltaRE:-deltaRE;
          const COST=0.20;
          const breakeven=Math.round(COST/(Math.abs(pD)+COST)*100);
          const correctAction=zoneConf>=breakeven?"challenge":"accept";
          return{
            count,outs,bases,pitchX:p.pX,pitchZ:p.pZ,zoneConf,transition,thresh,tier,deltaRE,pD,breakeven,correctAction,cur,cor,
            batter:p.batter||null,pitcher:p.pitcher||null,type:p.type||null,speed:p.speed||null,call:p.call,
            inn:p.inning?parseInt(p.inning):null,
          };
        }).filter(Boolean);

        // Auto-filter: keep pitches that are actually worth training on
        // Close call: zone confidence between 25-85% (not obvious either way)
        // High leverage: break-even ≤ 40% (big run swing — worth challenging even on borderline read)
        // If both filters together yield < 5 pitches, relax to top N by proximity to 50% confidence
        const isCloseCall = s => s.zoneConf >= 25 && s.zoneConf <= 85;
        const isHighLeverage = s => s.breakeven <= 40;
        let filtered = allScenarios.filter(s => isCloseCall(s) || isHighLeverage(s));
        if (filtered.length < 5 && allScenarios.length >= 5) {
          // Fallback: rank by how interesting the pitch is (proximity to 50% conf + low breakeven)
          filtered = [...allScenarios]
            .sort((a, b) => {
              const scoreA = Math.abs(a.zoneConf - 50) + a.breakeven * 0.5;
              const scoreB = Math.abs(b.zoneConf - 50) + b.breakeven * 0.5;
              return scoreA - scoreB;
            })
            .slice(0, Math.min(allScenarios.length, 20));
        }

        setCustomPitches(filtered);
        setCustomPitchesTotal(allScenarios.length);
        if(filtered.length>0)setTrainingSource("custom");
      }catch(err){
        console.error("CSV parse error:",err);
        setCustomPitches([]);
        setCustomPitchesTotal(0);
      }
    };
    reader.readAsText(file);
  },[perspective]);
  const startTimeRef=useRef(null);
  const timerRef=useRef(null);
  const previewStartRef=useRef(null);
  const previewTimerRef=useRef(null);
  const callTimerRef=useRef(null);

  const seg=(active)=>({padding:"6px 0",flex:1,borderRadius:7,fontSize:12,fontWeight:active?600:400,cursor:"pointer",textAlign:"center",border:"none",background:active?"#111827":"#f3f4f6",color:active?"#fff":"#6b7280",transition:"all .15s",fontFamily:"inherit"});

  const pitchTimerRef=useRef(null);

  const goToPitch=useCallback(()=>{
    clearInterval(previewTimerRef.current);
    setPhase("pitch");
  },[]);

  const goToCall=useCallback(()=>{
    clearTimeout(pitchTimerRef.current);
    setPhase("call");
  },[]);

  const goToLive=useCallback(()=>{
    clearTimeout(callTimerRef.current);
    startTimeRef.current=Date.now();
    setTimeLeft(2000);
    setPhase("live");
  },[]);

  const getNextScenario=useCallback((history=[])=>{
    if(trainingSource==="custom"){
      // Custom CSV: pull from queue
      let queue=historicalQueue;
      if(queue.length===0){
        queue=[...customPitches].sort(()=>Math.random()-0.5);
        setHistoricalQueue(queue);
      }
      if(queue.length>0){
        const s=queue[0];
        setHistoricalQueue(q=>q.slice(1));
        return s;
      }
    }
    if(trainingSource!=="random"&&trainingSource!=="custom"){
      // Historical mode: pull from queue
      const game=HISTORICAL_GAMES.find(g=>g.id===trainingSource);
      if(game){
        // Build queue on first call or if empty
        let queue=historicalQueue;
        if(queue.length===0){
          const scenarios=game.pitches.map(p=>historicalToScenario(p,perspective)).filter(Boolean);
          // Shuffle
          queue=[...scenarios].sort(()=>Math.random()-0.5);
          setHistoricalQueue(queue);
        }
        if(queue.length>0){
          const s=queue[0];
          setHistoricalQueue(q=>q.slice(1));
          return s;
        }
      }
    }
    // Random mode: use adaptive generation
    return generateAdaptiveScenario(difficulty,perspective,history);
  },[trainingSource,difficulty,perspective,historicalQueue]);

  const startRound=useCallback(()=>{
    setStats({correct:0,incorrect:0,timeouts:0,totalTime:0,streak:0,bestStreak:0,reLedger:0,history:[]});
    setCardIndex(0);
    setChallengesLeft(challengeMode==="unlimited"?null:Number(challengeMode));
    // Reset queue and pick first scenario based on source
    if(trainingSource==="custom"&&customPitches.length>0){
      const shuffled=[...customPitches].sort(()=>Math.random()-0.5);
      setHistoricalQueue(shuffled.slice(1));
      setScenario(shuffled[0]);
    } else if(trainingSource!=="random"&&trainingSource!=="custom"){
      const game=HISTORICAL_GAMES.find(g=>g.id===trainingSource);
      if(game){
        const scenarios=game.pitches.map(p=>historicalToScenario(p,perspective)).filter(Boolean);
        const shuffled=[...scenarios].sort(()=>Math.random()-0.5);
        setHistoricalQueue(shuffled.slice(1));
        setScenario(shuffled[0]||generateAdaptiveScenario(difficulty,perspective,[]));
      } else {
        setHistoricalQueue([]);
        setScenario(generateAdaptiveScenario(difficulty,perspective,[]));
      }
    } else {
      setHistoricalQueue([]);
      setScenario(generateAdaptiveScenario(difficulty,perspective,[]));
    }
    setUserAction(null);
    setPreviewTimeLeft(previewDuration*1000);
    previewStartRef.current=Date.now();
    setPhase("preview");
  },[difficulty,perspective,previewDuration,challengeMode,trainingSource,customPitches]);

  const handleAction=useCallback((action)=>{
    if(phase!=="live")return;
    // Block challenge if no challenges remaining
    if(action==="challenge"&&challengesLeft===0){return;}
    clearInterval(timerRef.current);
    const elapsed=Date.now()-startTimeRef.current;
    const isTimeout=action===null;
    const effective=action||"accept";
    const correct=effective===scenario.correctAction;
    const verdict=isTimeout?getVerdict("accept",scenario):getVerdict(effective,scenario);
    const isPerfect=verdict.tier==="perfect";
    const reImpact=isTimeout?getREImpact(scenario,"accept"):getREImpact(scenario,effective);
    const newPhase=isTimeout?"timeout":"reveal";
    setUserAction(effective);
    setTimeLeft(isTimeout?0:2000-elapsed);
    // Update challenge inventory: incorrect challenge costs one, correct challenge is free
    if(challengesLeft!==null&&effective==="challenge"&&!isPerfect){
      setChallengesLeft(prev=>Math.max(0,prev-1));
    }
    setStats(prev=>{
      const ns=prev.streak+(isPerfect?1:0);
      return{
        correct:prev.correct+(isPerfect?1:0),
        incorrect:prev.incorrect+(isPerfect?0:1),
        timeouts:prev.timeouts+(isTimeout?1:0),
        totalTime:prev.totalTime+Math.min(elapsed,2000),
        streak:isPerfect?ns:0,
        bestStreak:Math.max(prev.bestStreak,isPerfect?ns:prev.streak),
        reLedger:prev.reLedger+reImpact,
        history:[...prev.history,{...scenario,userAction:effective,correct,verdict,reImpact,elapsed:Math.min(elapsed,2000),isTimeout}],
      };
    });
    setPhase(newPhase);
  },[phase,scenario,challengesLeft]);

  const advance=useCallback(()=>{
    const totalCards=trainingSource==="custom"?customPitches.length:trainingSource!=="random"?(HISTORICAL_GAMES.find(g=>g.id===trainingSource)?.pitches.length||10):10;
    if(cardIndex>=totalCards-1||(challengesLeft!==null&&challengesLeft<=0)){setPhase("summary");return;}
    const next=cardIndex+1;
    setCardIndex(next);
    const s=getNextScenario(stats.history);
    if(s)setScenario(s);
    else{setPhase("summary");return;} // ran out of historical pitches
    setUserAction(null);
    setPreviewTimeLeft(previewDuration*1000);
    previewStartRef.current=Date.now();
    setPhase("preview");
  },[cardIndex,difficulty,perspective,previewDuration,challengesLeft,getNextScenario,stats.history,trainingSource]);

  // Preview timer
  useEffect(()=>{
    if(phase!=="preview")return;
    const dur=previewDuration*1000;
    previewTimerRef.current=setInterval(()=>{
      const elapsed=Date.now()-previewStartRef.current;
      const remaining=Math.max(0,dur-elapsed);
      setPreviewTimeLeft(remaining);
      if(remaining<=0){clearInterval(previewTimerRef.current);goToPitch();}
    },16);
    return()=>clearInterval(previewTimerRef.current);
  },[phase,previewDuration,goToPitch]);

  // Pitch arrival timer
  useEffect(()=>{
    if(phase!=="pitch")return;
    pitchTimerRef.current=setTimeout(goToCall,500);
    return()=>clearTimeout(pitchTimerRef.current);
  },[phase,goToCall]);

  // Call announcement timer
  useEffect(()=>{
    if(phase!=="call")return;
    callTimerRef.current=setTimeout(goToLive,1000);
    return()=>clearTimeout(callTimerRef.current);
  },[phase,goToLive]);

  // Challenge timer
  useEffect(()=>{
    if(phase!=="live")return;
    timerRef.current=setInterval(()=>{
      const elapsed=Date.now()-startTimeRef.current;
      const remaining=Math.max(0,2000-elapsed);
      setTimeLeft(remaining);
      if(remaining<=0){clearInterval(timerRef.current);handleAction(null);}
    },16);
    return()=>clearInterval(timerRef.current);
  },[phase,handleAction]);

  // Keyboard
  useEffect(()=>{
    const handler=(e)=>{
      if(phase==="preview"){
        if(e.key===" "||e.key==="Enter"){e.preventDefault();goToPitch();}
      }
      if(phase==="live"){
        if(e.key==="ArrowLeft"||e.key==="a"||e.key==="A"){e.preventDefault();handleAction("challenge");}
        if(e.key==="ArrowRight"||e.key==="d"||e.key==="D"){e.preventDefault();handleAction("accept");}
      }
      if(phase==="reveal"||phase==="timeout"){
        if(e.key===" "||e.key==="Enter"){e.preventDefault();advance();}
      }
    };
    window.addEventListener("keydown",handler);
    return()=>window.removeEventListener("keydown",handler);
  },[phase,handleAction,advance,goToPitch]);

  const cardStyle={background:"#fff",border:"1px solid #e5e7eb",borderRadius:10,padding:16,marginBottom:10};
  const mutedLabel={fontSize:8,fontWeight:600,color:"#9ca3af",textTransform:"uppercase",letterSpacing:.5};
  const green="#16a34a",red="#dc2626",blue="#2563eb",amber="#d97706";
  const noChallenges=challengesLeft!==null&&challengesLeft<=0;
  const totalCards=trainingSource==="custom"?customPitches.length:trainingSource!=="random"?(HISTORICAL_GAMES.find(g=>g.id===trainingSource)?.pitches.length||10):10;
  const challengeBadge=challengesLeft!==null?(
    <span style={{fontSize:11,color:challengesLeft<=0?red:challengesLeft===1?amber:"#374151",fontWeight:600,fontVariantNumeric:"tabular-nums"}}>
      {challengesLeft<=0?"No challenges":"🏳 "+challengesLeft+" left"}
    </span>
  ):null;

  // ---- READY ----
  if(phase==="ready"){
    return(
      <div style={{maxWidth:480,margin:"0 auto"}}>
        <div style={cardStyle}>
          <div style={mutedLabel}>Perspective</div>
          <div style={{display:"flex",gap:2,background:"#f3f4f6",borderRadius:8,padding:2,marginTop:6,marginBottom:16}}>
            <button onClick={()=>setPerspective("batter")} style={seg(perspective==="batter")}>Batter</button>
            <button onClick={()=>setPerspective("catcher")} style={seg(perspective==="catcher")}>Catcher</button>
          </div>
          <div style={mutedLabel}>Difficulty</div>
          <div style={{display:"flex",gap:2,background:"#f3f4f6",borderRadius:8,padding:2,marginTop:6}}>
            <button onClick={()=>setDifficulty(1)} style={seg(difficulty===1)}>Level 1</button>
            <button onClick={()=>setDifficulty(2)} style={seg(difficulty===2)}>Level 2</button>
            <button onClick={()=>setDifficulty(3)} style={seg(difficulty===3)}>Level 3</button>
          </div>
          <div style={{fontSize:11,color:"#6b7280",marginTop:8,lineHeight:1.5}}>
            {trainingSource==="random"&&difficulty===1&&"Obvious calls — extreme game states where the answer is almost always challenge or always accept. Learn the poles."}
            {trainingSource==="random"&&difficulty===2&&"Intermediate — mid-range thresholds (25-65%) where the math starts to matter. The shadow zone."}
            {trainingSource==="random"&&difficulty===3&&"Edge cases — fully random game states and borderline pitch locations. Adapts if you're too accurate."}
            {trainingSource!=="random"&&"Difficulty doesn't apply to historical or custom games — you're training on real pitch locations."}
          </div>
          <div style={{marginTop:16}}>
            <div style={mutedLabel}>Scenarios</div>
            <div style={{display:"flex",gap:2,background:"#f3f4f6",borderRadius:8,padding:2,marginTop:6,marginBottom:2}}>
              <button onClick={()=>setTrainingSource("random")} style={seg(trainingSource==="random")}>Random</button>
              <button onClick={()=>setTrainingSource(HISTORICAL_GAMES[0]?.id||"random")} style={seg(trainingSource!=="random"&&trainingSource!=="custom")}>Historical</button>
              <button onClick={()=>setTrainingSource("custom")} style={seg(trainingSource==="custom")}>Custom CSV</button>
            </div>
            {trainingSource==="custom"&&(
              <div style={{marginTop:8}}>
                <div
                  onDragOver={e=>{e.preventDefault();setCustomDragOver(true);}}
                  onDragLeave={()=>setCustomDragOver(false)}
                  onDrop={e=>{e.preventDefault();setCustomDragOver(false);const f=e.dataTransfer.files[0];if(f)handleCustomCSV(f);}}
                  onClick={()=>customFileRef.current?.click()}
                  style={{
                    border:`2px dashed ${customDragOver?"#111827":"#d1d5db"}`,borderRadius:10,padding:"20px 12px",textAlign:"center",
                    cursor:"pointer",background:customDragOver?"#f9fafb":"#fff",transition:"all .15s",
                  }}
                >
                  <input ref={customFileRef} type="file" accept=".csv,.tsv" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(f)handleCustomCSV(f);e.target.value="";}}/>
                  <div style={{fontSize:20,marginBottom:4}}>📄</div>
                  <div style={{fontSize:12,fontWeight:600,color:"#374151"}}>
                    {customFileName||"Drop a CSV or click to upload"}
                  </div>
                  <div style={{fontSize:10,color:"#9ca3af",marginTop:4,lineHeight:1.5}}>
                    Upload a Baseball Savant CSV — search.csv from any game or player page.
                    Auto-filters to close calls and high-leverage situations. Also supports Trackman V3 if game state columns are present.
                  </div>
                </div>
                {customPitches.length>0&&(
                  <div style={{fontSize:11,color:green,fontWeight:600,marginTop:6}}>
                    ✓ {customPitches.length} training pitches from {customPitchesTotal} called
                    <span style={{fontWeight:400,color:"#6b7280"}}> · filtered to close calls and high leverage</span>
                  </div>
                )}
                {customFileName&&customPitchesTotal>0&&customPitches.length===0&&(
                  <div style={{fontSize:11,color:amber,fontWeight:600,marginTop:6}}>
                    {customPitchesTotal} called pitches found but none were borderline or high-leverage enough for training.
                  </div>
                )}
                {customFileName&&customPitchesTotal===0&&(
                  <div style={{fontSize:11,color:red,fontWeight:600,marginTop:6}}>
                    No valid called pitches found. Needs Savant CSV with plate_x, plate_z, and ball/strike calls.
                  </div>
                )}
              </div>
            )}
            {trainingSource!=="random"&&trainingSource!=="custom"&&(
              <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:4}}>
                {HISTORICAL_GAMES.map(g=>(
                  <button key={g.id} onClick={()=>setTrainingSource(g.id)} style={{
                    textAlign:"left",padding:"8px 10px",borderRadius:8,cursor:"pointer",fontFamily:"inherit",transition:"all .12s",
                    border:trainingSource===g.id?"1.5px solid #111827":"1.5px solid #e5e7eb",
                    background:trainingSource===g.id?"#f9fafb":"#fff",
                  }}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:12,fontWeight:600,color:"#111827"}}>{g.title}</span>
                      <span style={{fontSize:9,fontWeight:600,color:"#6b7280",background:"#f3f4f6",padding:"1px 6px",borderRadius:4}}>{g.tag}</span>
                    </div>
                    <div style={{fontSize:10,color:"#9ca3af",marginTop:2}}>{g.sub} · {g.pitches.length} pitches</div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div style={{marginTop:16}}>
            <div style={mutedLabel}>Challenges</div>
            <div style={{display:"flex",gap:2,background:"#f3f4f6",borderRadius:8,padding:2,marginTop:6}}>
              <button onClick={()=>setChallengeMode("unlimited")} style={seg(challengeMode==="unlimited")}>Unlimited</button>
              <button onClick={()=>setChallengeMode("2")} style={seg(challengeMode==="2")}>2 Challenges</button>
              <button onClick={()=>setChallengeMode("1")} style={seg(challengeMode==="1")}>1 Challenge</button>
            </div>
            <div style={{fontSize:11,color:"#6b7280",marginTop:6,lineHeight:1.5}}>
              {challengeMode==="unlimited"&&"Practice mode — unlimited challenges, always see all 10 cards."}
              {challengeMode==="2"&&"Game mode — 2 challenges like MLB. Correct challenge keeps it, incorrect loses one. Round ends when you're out."}
              {challengeMode==="1"&&"Hard mode — 1 challenge. Miss it and you're done."}
            </div>
          </div>
          <div style={{marginTop:16}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={mutedLabel}>Preview Time</div>
              <span style={{fontSize:12,fontWeight:600,color:"#374151",fontVariantNumeric:"tabular-nums"}}>{previewDuration}s</span>
            </div>
            <input type="range" min={4} max={10} step={1} value={previewDuration} onChange={e=>setPreviewDuration(Number(e.target.value))} style={{width:"100%",marginTop:6}}/>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#c4c8cd",marginTop:2}}>
              <span>4s</span><span>10s</span>
            </div>
          </div>
        </div>
        <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:10,padding:"12px 14px",marginBottom:10}}>
          <div style={{fontSize:12,fontWeight:700,color:"#111827",marginBottom:8}}>Two inputs, one decision</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <div style={{flex:"1 1 180px",background:"#f9fafb",borderRadius:8,padding:"8px 10px"}}>
              <div style={{fontSize:10,fontWeight:700,color:"#374151",marginBottom:3}}>Break-even <span style={{fontWeight:400,color:"#9ca3af"}}>— game state</span></div>
              <div style={{fontSize:11,color:"#6b7280",lineHeight:1.5}}>How confident you <b>need</b> to be. High-leverage lowers the bar, low-leverage raises it.</div>
            </div>
            <div style={{flex:"1 1 180px",background:"#f9fafb",borderRadius:8,padding:"8px 10px"}}>
              <div style={{fontSize:10,fontWeight:700,color:"#374151",marginBottom:3}}>Zone confidence <span style={{fontWeight:400,color:"#9ca3af"}}>— pitch location</span></div>
              <div style={{fontSize:11,color:"#6b7280",lineHeight:1.5}}>How confident you <b>should</b> be. How far the pitch was from the zone edge. Challenge when conf ≥ break-even.</div>
            </div>
          </div>
        </div>
        <button onClick={startRound} disabled={trainingSource==="custom"&&customPitches.length===0} style={{width:"100%",padding:"14px 0",borderRadius:10,border:"none",background:trainingSource==="custom"&&customPitches.length===0?"#e5e7eb":"#111827",color:trainingSource==="custom"&&customPitches.length===0?"#9ca3af":"#fff",fontSize:15,fontWeight:600,cursor:trainingSource==="custom"&&customPitches.length===0?"not-allowed":"pointer",fontFamily:"inherit"}}>
          Start Round
        </button>
        <div style={{textAlign:"center",fontSize:11,color:"#9ca3af",marginTop:8}}>{trainingSource==="random"?"10 unique scenarios":trainingSource==="custom"?`${customPitches.length} pitches`:"Real pitches"} · 2 seconds each</div>
      </div>
    );
  }

  // ---- PREVIEW ----
  if(phase==="preview"&&scenario){
    const pvPct=previewTimeLeft/(previewDuration*1000);
    return(
      <div style={{maxWidth:480,margin:"0 auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,flexWrap:"wrap",gap:4}}>
          <span style={{fontSize:12,fontWeight:600,color:"#374151",fontVariantNumeric:"tabular-nums"}}>{stats.correct}/{cardIndex} correct</span>
          {stats.streak>1&&<span style={{fontSize:11,color:amber,fontWeight:600}}>🔥 {stats.streak} streak</span>}
          {challengeBadge}
          <span style={{fontSize:11,color:"#9ca3af"}}>Card {cardIndex+1} of {totalCards}</span>
        </div>
        <div style={cardStyle}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:24,marginBottom:16,marginTop:8}}>
            <Dots count={scenario.count}/>
            <div style={{display:"flex",alignItems:"center",gap:3}}>
              {[0,1,2].map(i=><div key={i} style={{width:12,height:12,borderRadius:"50%",background:i<scenario.outs?"#374151":"#e5e7eb"}}/>)}
              <span style={{fontSize:9,color:"#9ca3af",marginLeft:3}}>Outs</span>
            </div>
            <Diamond bs={scenario.bases} size={42}/>
          </div>
          <ZoneGraphic pitchX={null} pitchZ={null}/>
          <div style={{textAlign:"center",fontSize:13,fontWeight:500,color:"#9ca3af",margin:"12px 0 8px",animation:"pulse 1.5s infinite"}}>
            Pitch incoming…
          </div>
          <div style={{position:"relative",height:4,borderRadius:2,background:"#e5e7eb",overflow:"hidden"}}>
            <div style={{position:"absolute",left:0,top:0,height:"100%",width:`${pvPct*100}%`,background:"#d1d5db",borderRadius:2,transition:"width 16ms linear"}}/>
          </div>
          <div style={{textAlign:"center",fontSize:9,color:"#c4c8cd",marginTop:8}}>Space to skip</div>
        </div>
      </div>
    );
  }

  // ---- PITCH ARRIVAL ----
  if(phase==="pitch"&&scenario){
    return(
      <div style={{maxWidth:480,margin:"0 auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,flexWrap:"wrap",gap:4}}>
          <span style={{fontSize:12,fontWeight:600,color:"#374151",fontVariantNumeric:"tabular-nums"}}>{stats.correct}/{cardIndex} correct</span>
          {stats.streak>1&&<span style={{fontSize:11,color:amber,fontWeight:600}}>🔥 {stats.streak} streak</span>}
          {challengeBadge}
          <span style={{fontSize:11,color:"#9ca3af"}}>Card {cardIndex+1} of {totalCards}</span>
        </div>
        <div style={cardStyle}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:20,marginBottom:12}}>
            <Dots count={scenario.count}/>
            <div style={{display:"flex",alignItems:"center",gap:3}}>
              {[0,1,2].map(i=><div key={i} style={{width:10,height:10,borderRadius:"50%",background:i<scenario.outs?"#374151":"#e5e7eb"}}/>)}
              <span style={{fontSize:9,color:"#9ca3af",marginLeft:3}}>Outs</span>
            </div>
            <Diamond bs={scenario.bases} size={36}/>
          </div>
          <ZoneGraphic pitchX={scenario.pitchX} pitchZ={scenario.pitchZ}/>
        </div>
      </div>
    );
  }

  // ---- CALL ANNOUNCEMENT ----
  if(phase==="call"&&scenario){
    const callText=perspective==="batter"?"STRIKE!":"BALL!";
    const callColor=perspective==="batter"?red:green;
    return(
      <div style={{maxWidth:480,margin:"0 auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,flexWrap:"wrap",gap:4}}>
          <span style={{fontSize:12,fontWeight:600,color:"#374151",fontVariantNumeric:"tabular-nums"}}>{stats.correct}/{cardIndex} correct</span>
          {stats.streak>1&&<span style={{fontSize:11,color:amber,fontWeight:600}}>🔥 {stats.streak} streak</span>}
          {challengeBadge}
          <span style={{fontSize:11,color:"#9ca3af"}}>Card {cardIndex+1} of {totalCards}</span>
        </div>
        <div style={cardStyle}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:20,marginBottom:12}}>
            <Dots count={scenario.count}/>
            <div style={{display:"flex",alignItems:"center",gap:3}}>
              {[0,1,2].map(i=><div key={i} style={{width:10,height:10,borderRadius:"50%",background:i<scenario.outs?"#374151":"#e5e7eb"}}/>)}
              <span style={{fontSize:9,color:"#9ca3af",marginLeft:3}}>Outs</span>
            </div>
            <Diamond bs={scenario.bases} size={36}/>
          </div>
          <div style={{position:"relative"}}>
            <ZoneGraphic pitchX={scenario.pitchX} pitchZ={scenario.pitchZ}/>
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
              <div style={{fontSize:40,fontWeight:900,color:callColor,textTransform:"uppercase",letterSpacing:2,textShadow:"0 2px 8px rgba(0,0,0,0.12)",animation:"pulse 0.6s ease-in-out"}}>{callText}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---- LIVE ----
  if(phase==="live"&&scenario){
    const pct=timeLeft/2000;
    const barColor=timeLeft>1200?green:timeLeft>600?amber:red;
    return(
      <div style={{maxWidth:480,margin:"0 auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,flexWrap:"wrap",gap:4}}>
          <span style={{fontSize:12,fontWeight:600,color:"#374151",fontVariantNumeric:"tabular-nums"}}>{stats.correct}/{cardIndex} correct</span>
          {stats.streak>1&&<span style={{fontSize:11,color:amber,fontWeight:600}}>🔥 {stats.streak} streak</span>}
          {challengeBadge}
          <span style={{fontSize:11,color:"#9ca3af"}}>Card {cardIndex+1} of {totalCards}</span>
        </div>
        <div style={cardStyle}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:20,marginBottom:12}}>
            <Dots count={scenario.count}/>
            <div style={{display:"flex",alignItems:"center",gap:3}}>
              {[0,1,2].map(i=><div key={i} style={{width:10,height:10,borderRadius:"50%",background:i<scenario.outs?"#374151":"#e5e7eb"}}/>)}
              <span style={{fontSize:9,color:"#9ca3af",marginLeft:3}}>Outs</span>
            </div>
            <Diamond bs={scenario.bases} size={36}/>
          </div>
          <ZoneGraphic pitchX={scenario.pitchX} pitchZ={scenario.pitchZ}/>
          {scenario.batter&&<div style={{textAlign:"center",fontSize:10,color:"#9ca3af",marginTop:4,lineHeight:1.5}}>
            <span style={{fontWeight:600,color:"#6b7280"}}>{scenario.batter}</span> vs <span style={{fontWeight:600,color:"#6b7280"}}>{scenario.pitcher}</span>
            {scenario.type&&<span> · {scenario.type}</span>}{scenario.speed&&<span> {scenario.speed}</span>}
            {scenario.inn&&<span> · Inn {scenario.inn}</span>}
          </div>}
          <div style={{textAlign:"center",fontSize:13,fontWeight:600,color:"#374151",margin:"10px 0 8px"}}>
            {perspective==="batter"?"Called strike. Challenge?":"Called ball. Challenge?"}
          </div>
          <div style={{position:"relative",height:6,borderRadius:3,background:"#e5e7eb",overflow:"hidden",marginBottom:4}}>
            <div style={{position:"absolute",left:0,top:0,height:"100%",width:`${pct*100}%`,background:barColor,borderRadius:3,transition:"width 16ms linear"}}/>
          </div>
          <div style={{textAlign:"right",fontSize:10,color:barColor,fontWeight:600,fontVariantNumeric:"tabular-nums",marginBottom:10}}>{(timeLeft/1000).toFixed(1)}s</div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>handleAction("challenge")} disabled={noChallenges} style={{flex:1,padding:"14px 0",borderRadius:8,border:"none",background:noChallenges?"#e5e7eb":blue,color:noChallenges?"#9ca3af":"#fff",fontSize:14,fontWeight:600,cursor:noChallenges?"not-allowed":"pointer",fontFamily:"inherit",opacity:noChallenges?.5:1}}>
              CHALLENGE
            </button>
            <button onClick={()=>handleAction("accept")} style={{flex:1,padding:"14px 0",borderRadius:8,border:"none",background:"#f3f4f6",color:"#374151",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
              ACCEPT
            </button>
          </div>
          <div style={{display:"flex",justifyContent:"center",gap:16,marginTop:6}}>
            <span style={{fontSize:9,color:"#c4c8cd"}}>← A</span>
            <span style={{fontSize:9,color:"#c4c8cd"}}>D →</span>
          </div>
        </div>
      </div>
    );
  }

  // ---- REVEAL / TIMEOUT ----
  if((phase==="reveal"||phase==="timeout")&&scenario){
    const lastEntry=stats.history[stats.history.length-1];
    const verdict=lastEntry?.verdict||getVerdict(lastEntry?.userAction||"accept",scenario);
    const isTimeout=phase==="timeout";
    const elapsed=lastEntry?.elapsed||2000;
    const effective=lastEntry?.userAction||"accept";
    const transLabel=scenario.transition.terminal?(scenario.transition.to==="BB"?"→ Walk":"→ Strikeout"):(`${scenario.transition.from} → ${scenario.transition.to}`);
    const intuition=getBreakevenIntuition(scenario,perspective);
    const bothTrans=getBothTransitions(scenario);
    const batterTrans=bothTrans.find(t=>t.type==="s2b");
    const catcherTrans=bothTrans.find(t=>t.type==="b2s");
    const bSwing=batterTrans?batterTrans.batterSwing:0;
    const cSwing=catcherTrans?catcherTrans.catcherSwing:0;
    const swingTotal=bSwing+cSwing;
    const bPct=swingTotal===0?50:(bSwing/swingTotal)*100;
    const reImpact=lastEntry?.reImpact||0;

    const gameOver=challengesLeft!==null&&challengesLeft<=0;
    return(
      <div style={{maxWidth:480,margin:"0 auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,flexWrap:"wrap",gap:4}}>
          <span style={{fontSize:12,fontWeight:600,color:"#374151",fontVariantNumeric:"tabular-nums"}}>{stats.correct}/{cardIndex+1} correct</span>
          {/* RE ledger */}
          <span style={{fontSize:11,fontWeight:600,color:stats.reLedger>=0?green:red,fontVariantNumeric:"tabular-nums"}}>
            RE: {stats.reLedger.toFixed(3)}
          </span>
          {challengeBadge}
          <span style={{fontSize:11,color:"#9ca3af"}}>Card {cardIndex+1} of {totalCards}</span>
        </div>
        <div style={cardStyle}>
          {/* Verdict banner */}
          <div style={{background:verdict.bg,border:`1.5px solid ${verdict.border}`,textAlign:"center",padding:"10px 12px",borderRadius:8,marginBottom:12}}>
            <div style={{fontSize:18,fontWeight:700,color:verdict.color}}>{verdict.emoji} {verdict.label}{isTimeout?" (timed out)":""}</div>
            <div style={{fontSize:11,color:"#6b7280",lineHeight:1.5,marginTop:4}}>{verdict.desc}</div>
            {reImpact!==0&&<div style={{fontSize:10,fontWeight:600,color:red,marginTop:4,fontVariantNumeric:"tabular-nums"}}>
              {reImpact.toFixed(3)} RE vs optimal
            </div>}
          </div>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            <div style={{flex:1,background:"#f9fafb",borderRadius:8,padding:"8px 10px",textAlign:"center"}}>
              <div style={mutedLabel}>You</div>
              <div style={{fontSize:13,fontWeight:700,color:effective==="challenge"?blue:"#374151",marginTop:4}}>{effective.toUpperCase()}</div>
            </div>
            <div style={{flex:1,background:"#f9fafb",borderRadius:8,padding:"8px 10px",textAlign:"center"}}>
              <div style={mutedLabel}>RE-Optimal</div>
              <div style={{fontSize:13,fontWeight:700,color:scenario.correctAction==="challenge"?blue:"#374151",marginTop:4}}>{scenario.correctAction.toUpperCase()}</div>
            </div>
          </div>
          <div style={{display:"flex",gap:6,marginBottom:12}}>
            <div style={{flex:1,background:"#f9fafb",borderRadius:8,padding:"8px 6px",textAlign:"center"}}>
              <div style={mutedLabel}>Zone Conf</div>
              <div style={{fontSize:14,fontWeight:700,color:scenario.zoneConf>=ZONE_OBVIOUS_THRESH?green:"#111827",marginTop:3,fontVariantNumeric:"tabular-nums"}}>{scenario.zoneConf}%</div>
              {scenario.zoneConf>=ZONE_OBVIOUS_THRESH&&<div style={{fontSize:8,color:green,fontWeight:600,marginTop:1}}>CLEARLY WRONG</div>}
            </div>
            <div style={{flex:1,background:"#f9fafb",borderRadius:8,padding:"8px 6px",textAlign:"center"}}>
              <div style={mutedLabel}>Break-even</div>
              <div style={{fontSize:14,fontWeight:700,color:"#111827",marginTop:3,fontVariantNumeric:"tabular-nums"}}>{scenario.breakeven}%</div>
              <div style={{fontSize:8,color:"#c4c8cd",marginTop:1}}>Tango: {scenario.thresh}%</div>
            </div>
            <div style={{flex:1,background:"#f9fafb",borderRadius:8,padding:"8px 6px",textAlign:"center"}}>
              <div style={mutedLabel}>Run Swing</div>
              <div style={{fontSize:14,fontWeight:700,color:scenario.pD>0?green:scenario.pD<0?red:"#6b7280",marginTop:3,fontVariantNumeric:"tabular-nums"}}>{scenario.pD>0?"+":""}{scenario.pD.toFixed(3)}</div>
            </div>
          </div>

          {/* Tug of war — both sides of the overturn */}
          {batterTrans&&catcherTrans&&(
            <div style={{background:"#f9fafb",borderRadius:8,padding:"8px 10px",marginBottom:12}}>
              <div style={{display:"flex",gap:0,alignItems:"stretch",marginBottom:4}}>
                <div style={{flex:1,textAlign:"center",padding:"3px 6px"}}>
                  <div style={{fontSize:7,fontWeight:600,color:"#9ca3af",textTransform:"uppercase",letterSpacing:.5}}>Overturn strike</div>
                  <div style={{fontSize:11,fontWeight:700,color:"#111827",marginTop:1}}>{batterTrans.from} → {batterTrans.terminal?batterTrans.to==="BB"?"Walk":"K":batterTrans.to}</div>
                  <div style={{fontSize:9,color:"#6b7280"}}>{bSwing.toFixed(3)} runs</div>
                </div>
                <div style={{flex:1,textAlign:"center",padding:"3px 6px"}}>
                  <div style={{fontSize:7,fontWeight:600,color:"#9ca3af",textTransform:"uppercase",letterSpacing:.5}}>Overturn ball</div>
                  <div style={{fontSize:11,fontWeight:700,color:"#111827",marginTop:1}}>{catcherTrans.from} → {catcherTrans.terminal?catcherTrans.to==="K"?"K":"Walk":catcherTrans.to}</div>
                  <div style={{fontSize:9,color:"#6b7280"}}>{cSwing.toFixed(3)} runs</div>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:4}}>
                <div style={{fontSize:8,fontWeight:600,color:bPct>=50?"#374151":"#c4c8cd",width:14,textAlign:"center"}}>AB</div>
                <div style={{flex:1,height:5,borderRadius:3,background:"#e5e7eb",overflow:"hidden",display:"flex"}}>
                  <div style={{width:`${bPct}%`,background:bPct>=50?"#374151":"#c4c8cd",borderRadius:bPct>95?3:"3px 0 0 3px",transition:"width .3s ease"}}/>
                  <div style={{width:`${100-bPct}%`,background:bPct<50?"#374151":"#c4c8cd",borderRadius:bPct<5?3:"0 3px 3px 0",transition:"width .3s ease"}}/>
                </div>
                <div style={{fontSize:8,fontWeight:600,color:bPct<50?"#374151":"#c4c8cd",width:10,textAlign:"center"}}>P</div>
              </div>
            </div>
          )}

          {/* Breakeven intuition */}
          <div style={{fontSize:11,color:"#6b7280",lineHeight:1.5,marginBottom:8,fontStyle:"italic"}}>{intuition}</div>

          {scenario.transition.terminal&&<div style={{textAlign:"center",fontSize:12,fontWeight:600,color:scenario.transition.to==="BB"?green:red,marginBottom:8}}>{transLabel}</div>}
          {scenario.note&&<div style={{background:"#f9fafb",border:"1px solid #e5e7eb",borderRadius:6,padding:"6px 10px",marginBottom:8,fontSize:11,color:"#374151",lineHeight:1.5}}>
            {scenario.batter&&<span style={{fontWeight:600}}>{scenario.batter} vs {scenario.pitcher}</span>}
            {scenario.batter&&<span> · </span>}{scenario.note}
          </div>}
          {scenario.adapted&&<div style={{fontSize:9,color:amber,fontWeight:600,marginBottom:4}}>⚡ Adaptive — pitches within a tenth of an inch</div>}
          <div style={{fontSize:10,color:"#9ca3af",fontVariantNumeric:"tabular-nums"}}>Decided in {(elapsed/1000).toFixed(1)}s{isTimeout?" (timed out)":""}</div>
        </div>
        <button onClick={advance} style={{width:"100%",padding:"12px 0",borderRadius:10,border:"none",background:"#111827",color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
          {cardIndex>=totalCards-1||gameOver?"See Results":"Next →"}
        </button>
        {gameOver&&cardIndex<9&&<div style={{textAlign:"center",fontSize:11,color:red,fontWeight:600,marginTop:6}}>Out of challenges — round over</div>}
        <div style={{textAlign:"center",fontSize:9,color:"#c4c8cd",marginTop:4}}>Space / Enter</div>
      </div>
    );
  }

  // ---- SUMMARY ----
  if(phase==="summary"){
    const total=stats.correct+stats.incorrect;
    const pct=total>0?Math.round(stats.correct/total*100):0;
    const avgTime=total>0?(stats.totalTime/total/1000).toFixed(1):"—";
    const wasEliminated=challengesLeft!==null&&challengesLeft<=0&&total<totalCards;
    const challengesUsed=challengeMode!=="unlimited"?stats.history.filter(h=>h.userAction==="challenge"&&h.verdict?.tier!=="perfect").length:0;

    // Verdict breakdown counts
    const verdictCounts={};
    stats.history.forEach(h=>{const t=h.verdict?.tier||"unknown";verdictCounts[t]=(verdictCounts[t]||0)+1;});
    const perfects=verdictCounts.perfect||0;
    const smartCostly=verdictCounts.smart_costly||0;
    const missed=verdictCounts.missed||0;
    const badChallenge=verdictCounts.bad_challenge||0;
    const luckyChallenge=verdictCounts.lucky_challenge||0;
    const toughHold=verdictCounts.tough_hold||0;
    const disciplined=verdictCounts.disciplined||0;

    // Challenge budget story
    let budgetStory=null;
    if(challengeMode!=="unlimited"){
      const wastedChallenges=stats.history.map((h,i)=>({...h,cardNum:i+1})).filter(h=>h.userAction==="challenge"&&(h.verdict?.tier==="smart_costly"||h.verdict?.tier==="bad_challenge"||h.verdict?.tier==="lucky_challenge"));
      const missedOpportunities=stats.history.map((h,i)=>({...h,cardNum:i+1})).filter(h=>h.verdict?.tier==="missed");
      const worstWaste=wastedChallenges.sort((a,b)=>Math.abs(a.pD)-Math.abs(b.pD))[0];
      const biggestMiss=missedOpportunities.sort((a,b)=>Math.abs(b.pD)-Math.abs(a.pD))[0];
      if(worstWaste&&biggestMiss){
        const basesDesc=(bs)=>BASES_LIST.find(b=>b.key===bs)?.desc||"";
        budgetStory={
          waste:worstWaste,
          miss:biggestMiss,
          text:`You burned a challenge on Card ${worstWaste.cardNum} — ${worstWaste.count}, ${basesDesc(worstWaste.bases)}, ${worstWaste.outs} out — a ${Math.abs(worstWaste.pD).toFixed(3)} run swing (break-even ${worstWaste.breakeven}%). Then Card ${biggestMiss.cardNum} came up: ${biggestMiss.count}, ${basesDesc(biggestMiss.bases)}, ${biggestMiss.outs} out — a ${Math.abs(biggestMiss.pD).toFixed(3)} run swing (break-even only ${biggestMiss.breakeven}%) that you couldn't challenge.`,
        };
      }
    }

    // Non-perfect entries for review
    const reviewCards=stats.history.map((h,i)=>({...h,cardNum:i+1})).filter(h=>h.verdict?.tier!=="perfect");

    return(
      <div style={{maxWidth:480,margin:"0 auto"}}>
        <div style={cardStyle}>
          <div style={{textAlign:"center",marginBottom:16}}>
            <div style={{fontSize:48,fontWeight:700,color:"#111827",fontVariantNumeric:"tabular-nums"}}>{perfects}/{total}</div>
            <div style={{fontSize:14,color:"#6b7280"}}>{pct}% perfect{wasEliminated?" · Eliminated":total>=totalCards?" · Complete":""}</div>
            {wasEliminated&&<div style={{fontSize:11,color:red,fontWeight:600,marginTop:4}}>Ran out of challenges after {total} card{total!==1?"s":""}</div>}
            {/* RE ledger total */}
            <div style={{fontSize:16,fontWeight:700,color:stats.reLedger>=0?green:stats.reLedger<-0.001?red:"#6b7280",marginTop:8,fontVariantNumeric:"tabular-nums"}}>
              {stats.reLedger>=0?"+":""}{stats.reLedger.toFixed(3)} RE
            </div>
            <div style={{fontSize:10,color:"#9ca3af"}}>RE lost to suboptimal decisions · 0.000 is perfect</div>
          </div>

          {/* Replay reel — mini zones for all pitches */}
          <div style={{...mutedLabel,marginBottom:6}}>Replay</div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:16,justifyContent:"center"}}>
            {stats.history.map((h,i)=>{
              const v=h.verdict||{};
              return(
                <div key={i} style={{textAlign:"center",width:52}}>
                  <div style={{border:`1.5px solid ${v.border||"#e5e7eb"}`,borderRadius:6,padding:2,background:v.bg||"#fff"}}>
                    <MiniZone pitchX={h.pitchX} pitchZ={h.pitchZ} verdictColor={v.color||"#9ca3af"} size={44}/>
                  </div>
                  <div style={{fontSize:10,marginTop:2}}>{v.emoji||"•"}</div>
                  <div style={{fontSize:8,color:"#9ca3af",fontVariantNumeric:"tabular-nums"}}>{h.zoneConf}%</div>
                </div>
              );
            })}
          </div>

          {/* Verdict breakdown */}
          <div style={{display:"flex",gap:4,marginBottom:16,flexWrap:"wrap"}}>
            {perfects>0&&<div style={{flex:"1 1 0",minWidth:60,background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:8,padding:"6px 4px",textAlign:"center"}}>
              <div style={{fontSize:16}}>🎯</div>
              <div style={{fontSize:16,fontWeight:700,color:"#16a34a"}}>{perfects}</div>
              <div style={{fontSize:8,fontWeight:600,color:"#6b7280",textTransform:"uppercase"}}>Perfect</div>
            </div>}
            {smartCostly>0&&<div style={{flex:"1 1 0",minWidth:60,background:"#fffbeb",border:"1px solid #fde68a",borderRadius:8,padding:"6px 4px",textAlign:"center"}}>
              <div style={{fontSize:16}}>👁</div>
              <div style={{fontSize:16,fontWeight:700,color:"#d97706"}}>{smartCostly}</div>
              <div style={{fontSize:8,fontWeight:600,color:"#6b7280",textTransform:"uppercase"}}>Smart costly</div>
            </div>}
            {luckyChallenge>0&&<div style={{flex:"1 1 0",minWidth:60,background:"#fffbeb",border:"1px solid #fde68a",borderRadius:8,padding:"6px 4px",textAlign:"center"}}>
              <div style={{fontSize:16}}>🍀</div>
              <div style={{fontSize:16,fontWeight:700,color:"#d97706"}}>{luckyChallenge}</div>
              <div style={{fontSize:8,fontWeight:600,color:"#6b7280",textTransform:"uppercase"}}>Lucky</div>
            </div>}
            {disciplined>0&&<div style={{flex:"1 1 0",minWidth:60,background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:8,padding:"6px 4px",textAlign:"center"}}>
              <div style={{fontSize:16}}>🧊</div>
              <div style={{fontSize:16,fontWeight:700,color:"#2563eb"}}>{disciplined}</div>
              <div style={{fontSize:8,fontWeight:600,color:"#6b7280",textTransform:"uppercase"}}>Disciplined</div>
            </div>}
            {toughHold>0&&<div style={{flex:"1 1 0",minWidth:60,background:"#fffbeb",border:"1px solid #fde68a",borderRadius:8,padding:"6px 4px",textAlign:"center"}}>
              <div style={{fontSize:16}}>🤏</div>
              <div style={{fontSize:16,fontWeight:700,color:"#d97706"}}>{toughHold}</div>
              <div style={{fontSize:8,fontWeight:600,color:"#6b7280",textTransform:"uppercase"}}>Tough hold</div>
            </div>}
            {missed>0&&<div style={{flex:"1 1 0",minWidth:60,background:"#fef2f2",border:"1px solid #fecaca",borderRadius:8,padding:"6px 4px",textAlign:"center"}}>
              <div style={{fontSize:16}}>⚠</div>
              <div style={{fontSize:16,fontWeight:700,color:"#dc2626"}}>{missed}</div>
              <div style={{fontSize:8,fontWeight:600,color:"#6b7280",textTransform:"uppercase"}}>Missed</div>
            </div>}
            {badChallenge>0&&<div style={{flex:"1 1 0",minWidth:60,background:"#fef2f2",border:"1px solid #fecaca",borderRadius:8,padding:"6px 4px",textAlign:"center"}}>
              <div style={{fontSize:16}}>✗</div>
              <div style={{fontSize:16,fontWeight:700,color:"#dc2626"}}>{badChallenge}</div>
              <div style={{fontSize:8,fontWeight:600,color:"#6b7280",textTransform:"uppercase"}}>Bad chall.</div>
            </div>}
          </div>

          <div style={{display:"flex",gap:6,marginBottom:16}}>
            <div style={{flex:1,background:"#f9fafb",borderRadius:8,padding:"8px 6px",textAlign:"center"}}>
              <div style={mutedLabel}>Avg Time</div>
              <div style={{fontSize:14,fontWeight:700,color:"#111827",marginTop:3,fontVariantNumeric:"tabular-nums"}}>{avgTime}s</div>
            </div>
            <div style={{flex:1,background:"#f9fafb",borderRadius:8,padding:"8px 6px",textAlign:"center"}}>
              <div style={mutedLabel}>Timeouts</div>
              <div style={{fontSize:14,fontWeight:700,color:"#111827",marginTop:3,fontVariantNumeric:"tabular-nums"}}>{stats.timeouts}</div>
            </div>
            <div style={{flex:1,background:"#f9fafb",borderRadius:8,padding:"8px 6px",textAlign:"center"}}>
              <div style={mutedLabel}>Best Streak</div>
              <div style={{fontSize:14,fontWeight:700,color:"#111827",marginTop:3,fontVariantNumeric:"tabular-nums"}}>{stats.bestStreak}</div>
            </div>
            {challengeMode!=="unlimited"&&<div style={{flex:1,background:"#f9fafb",borderRadius:8,padding:"8px 6px",textAlign:"center"}}>
              <div style={mutedLabel}>Chall. Lost</div>
              <div style={{fontSize:14,fontWeight:700,color:challengesUsed>0?red:"#111827",marginTop:3,fontVariantNumeric:"tabular-nums"}}>{challengesUsed}</div>
            </div>}
          </div>

          {/* Challenge budget story */}
          {budgetStory&&(
            <div style={{background:"#f9fafb",border:"1px solid #e5e7eb",borderRadius:8,padding:"10px 12px",marginBottom:16}}>
              <div style={{fontSize:9,fontWeight:600,color:"#9ca3af",textTransform:"uppercase",letterSpacing:.5,marginBottom:6}}>Challenge Budget</div>
              <div style={{fontSize:11,color:"#374151",lineHeight:1.6}}>{budgetStory.text}</div>
            </div>
          )}

          {/* Review cards — non-perfect decisions */}
          {reviewCards.length>0&&(<>
            <div style={{...mutedLabel,marginBottom:8}}>Review</div>
            {reviewCards.map((m,i)=>{
              const v=m.verdict||{};
              return(
                <div key={i} style={{background:v.bg||"#f9fafb",border:`1px solid ${v.border||"#e5e7eb"}`,borderRadius:8,padding:"8px 10px",marginBottom:6,fontSize:11,color:"#374151",lineHeight:1.5}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                    <span style={{fontSize:13}}>{v.emoji||"•"}</span>
                    <span style={{fontWeight:700,color:v.color||"#374151"}}>{v.label||"—"}</span>
                    <span style={{color:"#9ca3af",fontSize:10}}>Card {m.cardNum}</span>
                    <span style={{marginLeft:"auto",color:"#9ca3af",fontVariantNumeric:"tabular-nums",fontSize:10}}>{(m.elapsed/1000).toFixed(1)}s{m.isTimeout?" ⏱":""}</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                    <Dots count={m.count} sm/>
                    <span>{m.outs} out{m.outs!==1?"s":""}</span>
                    <Diamond bs={m.bases} size={24}/>
                  </div>
                  <span>You: <b>{m.userAction}</b> · RE-optimal: <b>{m.correctAction}</b> · Conf {m.zoneConf}% vs BE {m.breakeven}%</span>
                </div>
              );
            })}
          </>)}
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={startRound} style={{flex:1,padding:"12px 0",borderRadius:10,border:"none",background:"#111827",color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Play Again</button>
          <button onClick={()=>setPhase("ready")} style={{flex:1,padding:"12px 0",borderRadius:10,border:"1px solid #e5e7eb",background:"#fff",color:"#374151",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Back</button>
        </div>
      </div>
    );
  }
  return null;
}

// ============================================================
// MAIN
// ============================================================
const TABS=[{key:"simulator",label:"Simulator"},{key:"matrix",label:"RE Matrix"},{key:"thresholds",label:"Thresholds"},{key:"methodology",label:"Methodology"},{key:"training",label:"Training"}];

export default function App(){
  const[tab,setTab]=useState("simulator");
  // Manual state
  const[count,setCount]=useState("1-1");
  const[outs,setOuts]=useState(0);
  const[bs,setBs]=useState("000");
  
  const[persp,setPersp]=useState("offense");
  // Live game state
  const[selectedGame,setSelectedGame]=useState(null);
  const[mode,setMode]=useState("manual"); // "manual" | "live" | "demo" | "signal"
  const[demoIdx,setDemoIdx]=useState(0);
  const demoPlay=DEMO_PLAYS[demoIdx]||DEMO_PLAYS[0];
  const{games,loading:gamesLoading}=useTodaysGames();
  const{state:liveState,pitch:livePitch,pitchSequence:livePitchSeq,lastPlayResult:liveLastPlay,recentPlays:liveRecentPlays}=useLiveGame(mode==="live"||mode==="signal"?selectedGame:null);
  const{stats:playerStats,loading:statsLoading}=usePlayerStats(selectedGame,mode);
  const[showRecentPlays,setShowRecentPlays]=useState(false);
  // Game ticker carousel
  const tickerRef=useRef(null);
  const tickerDrag=useRef({down:false,didDrag:false,startX:0,scrollL:0});
  const onTickerDown=useCallback(e=>{
    const el=tickerRef.current;if(!el)return;
    tickerDrag.current={down:true,didDrag:false,startX:e.pageX??e.touches?.[0]?.pageX??0,scrollL:el.scrollLeft};
    el.style.cursor="grabbing";el.style.userSelect="none";
  },[]);
  const onTickerMove=useCallback(e=>{
    if(!tickerDrag.current.down)return;
    const x=e.pageX??e.touches?.[0]?.pageX??0;
    const dx=x-tickerDrag.current.startX;
    if(Math.abs(dx)>5)tickerDrag.current.didDrag=true;
    tickerRef.current.scrollLeft=tickerDrag.current.scrollL-dx;
  },[]);
  const onTickerUp=useCallback(()=>{
    tickerDrag.current.down=false;
    if(tickerRef.current){tickerRef.current.style.cursor="grab";tickerRef.current.style.userSelect="";}
  },[]);
  const tickerScroll=useCallback((dir)=>{
    const el=tickerRef.current;if(!el)return;
    el.scrollBy({left:dir*200,behavior:"smooth"});
  },[]);
  // Matrix state
  const[mOuts,setMOuts]=useState(0);
  const[mView,setMView]=useState("re");
  // Manual pitch state (click-to-plot)
  const[manualPitch,setManualPitch]=useState(null); // {pX, pZ}

  // Trackman state
  const[trackmanActive,setTrackmanActive]=useState(false);
  const[trackmanMethod,setTrackmanMethod]=useState("paste"); // "paste" | "ws" | "csv"
  const[tmWsUrl,setTmWsUrl]=useState("");
  const[tmWsStatus,setTmWsStatus]=useState("disconnected"); // "connected" | "disconnected" | "error"
  const tmWsRef=useRef(null);
  const[tmPaste,setTmPaste]=useState({pX:"",pZ:"",szTop:"3.5",szBot:"1.6",call:"strike"});
  const[tmCsvData,setTmCsvData]=useState(null); // array of mapped rows
  const[tmCsvIdx,setTmCsvIdx]=useState(0);
  const[tmCsvView,setTmCsvView]=useState("step"); // "step" | "list"
  const[tmCsvSort,setTmCsvSort]=useState(null); // {col:"conf"|"dRE",dir:"asc"|"desc"}
  const[tmCsvFileName,setTmCsvFileName]=useState("");
  const[tmPitch,setTmPitch]=useState(null); // active pitch from any trackman method
  const[tmCount,setTmCount]=useState("0-0");
  const[tmOuts,setTmOuts]=useState(0);
  const[tmBases,setTmBases]=useState("000");
  const tmFileRef=useRef(null);
  const[tmDragOver,setTmDragOver]=useState(false);

  // WebSocket connect/disconnect handlers
  const tmWsConnect=useCallback(()=>{
    if(!tmWsUrl||tmWsRef.current)return;
    try{
      const ws=new WebSocket(tmWsUrl);
      ws.onopen=()=>setTmWsStatus("connected");
      ws.onclose=()=>{setTmWsStatus("disconnected");tmWsRef.current=null;};
      ws.onerror=()=>{setTmWsStatus("error");};
      ws.onmessage=(e)=>{
        try{
          const d=JSON.parse(e.data);
          const pX=parseFloat(resolveColumn(d,'PlateLocSide','plate_x','px'));
          const pZ=parseFloat(resolveColumn(d,'PlateLocHeight','plate_z','pz'));
          if(isNaN(pX)||isNaN(pZ))return;
          const szTop=parseFloat(resolveColumn(d,'sz_top','zone_top','StrikeZoneTop'))||3.5;
          const szBot=parseFloat(resolveColumn(d,'sz_bot','zone_bot','StrikeZoneBottom'))||1.6;
          const rawCallStr=resolveColumn(d,'PitchCall','pitch_call','call','description')||'';
          const{call}=mapPitchCall(rawCallStr);
          const type=resolveColumn(d,'TaggedPitchType','AutoPitchType','pitch_type')||'';
          const rawSpeed=resolveColumn(d,'RelSpeed','ZoneSpeed','speed')||'';
          const speed=rawSpeed&&!String(rawSpeed).includes('mph')?rawSpeed+' mph':String(rawSpeed);
          const ballsVal=resolveColumn(d,'Balls','balls');
          const strikesVal=resolveColumn(d,'Strikes','strikes');
          const outsVal=resolveColumn(d,'Outs','outs','outs_when_up');
          const balls=ballsVal!=null?parseInt(ballsVal):null;
          const strikes=strikesVal!=null?parseInt(strikesVal):null;
          const outsNum=outsVal!=null?parseInt(outsVal):null;
          const on1b=parseBool(resolveColumn(d,'on_1b'));
          const on2b=parseBool(resolveColumn(d,'on_2b'));
          const on3b=parseBool(resolveColumn(d,'on_3b'));
          const preCount=balls!=null&&!isNaN(balls)&&strikes!=null&&!isNaN(strikes)?`${balls}-${strikes}`:null;
          const preOuts=outsNum!=null&&!isNaN(outsNum)?Math.min(outsNum,2):null;
          const preBases=on1b!=null&&on2b!=null&&on3b!=null?`${on1b}${on2b}${on3b}`:null;
          setTmPitch({pX,pZ,szTop,szBot,call,type,speed,preCount,preOuts,preBases});
          if(preCount)setTmCount(preCount);
          if(preOuts!=null)setTmOuts(preOuts);
          if(preBases)setTmBases(preBases);
        }catch{}
      };
      tmWsRef.current=ws;
      setTmWsStatus("connected");
    }catch{setTmWsStatus("error");}
  },[tmWsUrl]);
  const tmWsDisconnect=useCallback(()=>{
    if(tmWsRef.current){tmWsRef.current.close();tmWsRef.current=null;}
    setTmWsStatus("disconnected");
  },[]);
  // Cleanup websocket on unmount
  useEffect(()=>()=>{if(tmWsRef.current)tmWsRef.current.close();},[]);

  // CSV file handler — shared logic for input and drag-and-drop
  const loadCsvFile=useCallback((file)=>{
    if(!file)return;
    setTmCsvFileName(file.name);
    const reader=new FileReader();
    reader.onload=(ev)=>{
      const rows=parseCSV(ev.target.result);
      const mapped=rows.map(mapTrackmanRow).filter(Boolean);
      setTmCsvData(mapped);
      setTmCsvIdx(0);
      const firstCalled=mapped.find(r=>r.call);
      if(firstCalled)setTmPitch(firstCalled);
    };
    reader.readAsText(file);
  },[]);
  const handleTmCsvUpload=useCallback((e)=>loadCsvFile(e.target.files?.[0]),[loadCsvFile]);
  const handleTmCsvDrop=useCallback((e)=>{
    e.preventDefault();
    setTmDragOver(false);
    const file=e.dataTransfer.files?.[0];
    if(file&&file.name.endsWith(".csv"))loadCsvFile(file);
  },[loadCsvFile]);

  // Matchup multiplier (live and demo mode)
  const matchup=useMemo(()=>{
    if(mode==="demo"){
      const bSt=DEMO_STATS[demoPlay.batterId],pSt=DEMO_STATS[demoPlay.pitcherId];
      const bXw=bSt?.xwoba,pXw=pSt?.xwoba;
      let mult=1;
      if(bXw!=null&&bXw>0&&pXw!=null&&pXw>0){
        mult=Math.max(0.5,Math.min(2.0,(bXw/LG_XWOBA)*(pXw/LG_XWOBA)));
      }
      return{mult,batterXw:bXw,pitcherXw:pXw,batterName:bSt?.name||"",pitcherName:pSt?.name||""};
    }
    if(mode!=="live"&&mode!=="signal"||!liveState)return{mult:1,batterXw:null,pitcherXw:null,batterName:"",pitcherName:""};
    const bId=liveState.batterId,pId=liveState.pitcherId;
    const bSt=bId&&playerStats[bId],pSt=pId&&playerStats[pId];
    const bXw=bSt?.xwoba,pXw=pSt?.xwoba;
    let mult=1;
    if(bXw!=null&&bXw>0&&pXw!=null&&pXw>0){
      mult=Math.max(0.5,Math.min(2.0,(bXw/LG_XWOBA)*(pXw/LG_XWOBA)));
    }
    return{mult,batterXw:bXw,pitcherXw:pXw,batterName:bSt?.name||"",pitcherName:pSt?.name||""};
  },[mode,liveState,playerStats,demoPlay]);

  // Derived: which game state to use
  // When we have pitch data with a known call, use the PRE-PITCH count for challenge analysis.
  // This lets the engine show K/BB terminal transitions even after the linescore resets.
  const isLive=mode==="live"||mode==="signal";
  const rawCount=isLive&&trackmanActive?tmCount:isLive&&liveState?liveState.count:mode==="demo"?demoPlay.count:count;
  const rawOuts=isLive&&trackmanActive?tmOuts:isLive&&liveState?liveState.outs:mode==="demo"?demoPlay.outs:outs;
  const rawBases=isLive&&trackmanActive?tmBases:isLive&&liveState?liveState.bases:mode==="demo"?demoPlay.bases:bs;

  // Active pitch data for zone card
  // Batting perspective → challenging a called strike
  // Pitching perspective → challenging a called ball
  const activePitch=useMemo(()=>{
    if(mode==="manual"&&manualPitch){
      const call=persp==="offense"?"strike":"ball";
      return{pX:manualPitch.pX,pZ:manualPitch.pZ,szTop:3.5,szBot:1.6,call,type:"",speed:""};
    }
    if((mode==="live"||mode==="signal")&&trackmanActive&&tmPitch){
      return{...tmPitch};
    }
    if((mode==="live"||mode==="signal")&&!trackmanActive&&livePitch){
      return{pX:livePitch.pX,pZ:livePitch.pZ,szTop:livePitch.szTop,szBot:livePitch.szBot,call:livePitch.call,type:livePitch.type,speed:livePitch.speed,preCount:livePitch.preCount,preOuts:livePitch.preOuts,preBases:livePitch.preBases,result:livePitch.result};
    }
    if(mode==="demo"&&demoPlay.pitch){
      return{...demoPlay.pitch,preOuts:demoPlay.outs,preBases:demoPlay.bases,result:demoPlay.result};
    }
    return null;
  },[mode,manualPitch,persp,livePitch,demoPlay,trackmanActive,tmPitch]);

  // Context-dependent sigma: Hawk-Eye (live/demo) is extremely precise, manual has real uncertainty
  const activeSigma = mode === "manual" ? 1.0 : 0.25;

  // Use pre-pitch state for challenge analysis when we have pitch data
  const activeCount=activePitch?.preCount||rawCount;
  const activeOuts=activePitch?.preOuts??rawOuts;
  const activeBs=activePitch?.preBases||rawBases;

  const liveGames=games.filter(g=>g.status?.abstractGameState==="Live");
  const scheduledGames=games.filter(g=>g.status?.abstractGameState==="Preview");
  const finalGames=games.filter(g=>g.status?.abstractGameState==="Final");
  const selGameData=selectedGame&&games.find(g=>g.gamePk===selectedGame);
  const awayAbbr=selGameData?teamAbbr(selGameData.teams?.away?.team):"";
  const homeAbbr=selGameData?teamAbbr(selGameData.teams?.home?.team):"";

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
      const COST=0.20;
      const transBE=Math.round(COST/(Math.abs(pD)+COST)*100);
      return{...t,cur,cor,dRE,adjRE,pD,thresh,tier,toThresh,toTier,transBE,rel:pD>0,mult:matchup.mult};
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
        .game-ticker{display:flex;gap:6px;overflow-x:auto;padding:2px 0 2px;scrollbar-width:none;-webkit-overflow-scrolling:touch;cursor:grab}
        .game-ticker::-webkit-scrollbar{display:none}
        .game-ticker-btn{flex-shrink:0;min-width:120px;padding:6px 10px;border-radius:8px;border:2px solid transparent;cursor:pointer;text-align:left;transition:all .15s;font-family:inherit}
        .ticker-arrow{width:28px;height:28px;border-radius:50%;border:1px solid #e5e7eb;background:#fff;color:#374151;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;font-family:inherit;flex-shrink:0;transition:all .12s}
        .ticker-arrow:hover{background:#f3f4f6;border-color:#d1d5db}
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
        {tab==="simulator"&&(<>
          {/* === GAME TICKER CAROUSEL === */}
          {(mode==="live"||mode==="signal")&&!gamesLoading&&games.length>0&&(
            <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:10,marginBottom:12,padding:"10px 12px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                <div style={{fontSize:11,fontWeight:600,color:"#6b7280",textTransform:"uppercase",letterSpacing:.5}}>Today's Games</div>
                <div style={{display:"flex",gap:10,fontSize:10,color:"#9ca3af"}}>
                  {liveGames.length>0&&<span style={{display:"flex",alignItems:"center",gap:3}}><span style={{width:6,height:6,borderRadius:"50%",background:"#22c55e",display:"inline-block",animation:"pulse 1.5s infinite"}}/>{liveGames.length} Live</span>}
                  {finalGames.length>0&&<span>{finalGames.length} Final</span>}
                  {scheduledGames.length>0&&<span>{scheduledGames.length} Sched</span>}
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <button className="ticker-arrow" onClick={()=>tickerScroll(-1)} aria-label="Scroll left">‹</button>
                <div className="game-ticker" ref={tickerRef}
                  onMouseDown={onTickerDown} onMouseMove={onTickerMove} onMouseUp={onTickerUp} onMouseLeave={onTickerUp}
                  onTouchStart={onTickerDown} onTouchMove={onTickerMove} onTouchEnd={onTickerUp}>
                  {[...liveGames,...finalGames,...scheduledGames].map(g=>{
                    const away=g.teams?.away,home=g.teams?.home;
                    const sel=selectedGame===g.gamePk;
                    const ls=g.linescore;
                    const isLive=g.status?.abstractGameState==="Live";
                    const isFinal=g.status?.abstractGameState==="Final";
                    const isScheduled=g.status?.abstractGameState==="Preview";
                    return(
                      <button key={g.gamePk} onClick={()=>{if(tickerDrag.current.didDrag)return;setSelectedGame(g.gamePk);}} className="game-ticker-btn" style={{
                        background:sel?"#111827":isLive?"#f0fdf4":isFinal?"#f9fafb":"#f3f4f6",
                        color:sel?"#fff":"#374151",
                        borderColor:sel?"#111827":isLive?"#bbf7d0":"transparent",
                        opacity:isScheduled?.6:1,
                      }}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                          <div style={{fontSize:11,fontWeight:600,lineHeight:1.4}}>
                            <div>{teamAbbr(away?.team)} {ls?.teams?.away?.runs??"-"}</div>
                            <div>{teamAbbr(home?.team)} {ls?.teams?.home?.runs??"-"}</div>
                          </div>
                          <div style={{fontSize:9,color:sel?"rgba(255,255,255,.6)":"#9ca3af",textAlign:"right",lineHeight:1.5}}>
                            {isLive&&<div style={{display:"flex",alignItems:"center",gap:3,justifyContent:"flex-end"}}><span style={{width:5,height:5,borderRadius:"50%",background:"#22c55e",display:"inline-block",animation:"pulse 1.5s infinite"}}/><span style={{color:sel?"#4ade80":"#16a34a",fontWeight:600}}>{ls?.isTopInning?"Top":"Bot"} {ls?.currentInning||"?"}</span></div>}
                            {isFinal&&<div style={{fontWeight:500}}>Final{(ls?.currentInning&&ls.currentInning>9)?` (${ls.currentInning})`:""}</div>}
                            {isScheduled&&<div>{g.gameDate?new Date(g.gameDate).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}):"TBD"}</div>}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <button className="ticker-arrow" onClick={()=>tickerScroll(1)} aria-label="Scroll right">›</button>
              </div>
            </div>
          )}
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
                    <button onClick={()=>setMode("demo")} style={{...seg(mode==="demo"),background:mode==="demo"?"#111827":"#f3f4f6",color:mode==="demo"?"#fff":"#6b7280"}}>
                      WS G7
                    </button>
                    <button onClick={()=>setMode("signal")} style={{...seg(mode==="signal"),background:mode==="signal"?"#111827":"#f3f4f6",color:mode==="signal"?"#fff":"#6b7280"}}>
                      Signal
                    </button>
                  </div>

                  {(mode==="live"||mode==="signal")&&(
                    <div>
                      {!trackmanActive&&(<>
                        {gamesLoading&&<p style={{fontSize:12,color:"#9ca3af",margin:0}}>Loading today's schedule...</p>}
                        {!gamesLoading&&games.length===0&&(
                          <div style={{fontSize:12,color:"#9ca3af",lineHeight:1.6}}>
                            <p style={{margin:0}}>No games scheduled today.</p>
                          </div>
                        )}
                        {!gamesLoading&&games.length>0&&liveGames.length===0&&(
                          <div style={{fontSize:12,color:"#9ca3af",lineHeight:1.6}}>
                            <p style={{margin:"0 0 6px"}}>No live games right now.</p>
                            {scheduledGames.length>0&&<p style={{margin:0}}>{scheduledGames.length} game{scheduledGames.length>1?"s":""} scheduled today.</p>}
                          </div>
                        )}
                        {!gamesLoading&&selectedGame&&selGameData&&(
                          <div style={{fontSize:12,fontWeight:600,color:"#111827",marginBottom:4}}>
                            {awayAbbr} @ {homeAbbr}
                          </div>
                        )}

                        {/* Live state display */}
                        {liveState&&selectedGame&&(
                          <div style={{marginTop:10,padding:"8px 10px",background:"#f9fafb",borderRadius:8,fontSize:11,color:"#374151",lineHeight:1.6}}>
                            <div style={{fontWeight:600}}>
                              {liveState.isTop?"Top":"Bot"} {liveState.inn} — {liveState.count}, {liveState.outs} out{liveState.outs!==1?"s":""}
                            </div>
                            {(liveState.batter||liveState.pitcher)&&(()=>{
                              const bId=liveState.batterId,pId=liveState.pitcherId;
                              const bSt=bId&&playerStats[bId],pSt=pId&&playerStats[pId];
                              const bXw=bSt?.xwoba,pXw=pSt?.xwoba;
                              const bF=bXw?bXw/LG_XWOBA:1,pF=pXw?pXw/LG_XWOBA:1;
                              const bAdv=bF-1,pAdv=1-pF,diff=bAdv-pAdv,thresh=0.05;
                              const bEdge=diff>thresh,pEdge=diff<-thresh;
                              const bBord=bEdge?"#16a34a":pEdge?"#dc2626":"#9ca3af";
                              const pBord=pEdge?"#16a34a":bEdge?"#dc2626":"#9ca3af";
                              return <div style={{display:"flex",gap:8,marginTop:6}}>
                                {bId&&(
                                  <div style={{display:"flex",alignItems:"center",gap:6,flex:1,background:"#f3f4f6",borderRadius:6,padding:"4px 6px",borderLeft:`3px solid ${bBord}`}}>
                                    <img src={`${HEADSHOT}${bId}.png`} alt="" style={{width:28,height:28,borderRadius:"50%",objectFit:"cover",flexShrink:0}} onError={e=>{e.target.style.display="none"}}/>
                                    <div style={{minWidth:0}}><div style={{fontSize:8,fontWeight:600,color:"#9ca3af",textTransform:"uppercase",letterSpacing:.3}}>AB</div><div style={{fontSize:10,fontWeight:600,color:"#374151",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{lastName(liveState.batter)}</div>{bXw!=null&&<div style={{fontSize:9,color:bBord,fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{bXw.toFixed(3)} xwOBA</div>}</div>
                                  </div>
                                )}
                                {pId&&(
                                  <div style={{display:"flex",alignItems:"center",gap:6,flex:1,background:"#f3f4f6",borderRadius:6,padding:"4px 6px",borderLeft:`3px solid ${pBord}`}}>
                                    <img src={`${HEADSHOT}${pId}.png`} alt="" style={{width:28,height:28,borderRadius:"50%",objectFit:"cover",flexShrink:0}} onError={e=>{e.target.style.display="none"}}/>
                                    <div style={{minWidth:0}}><div style={{fontSize:8,fontWeight:600,color:"#9ca3af",textTransform:"uppercase",letterSpacing:.3}}>P</div><div style={{fontSize:10,fontWeight:600,color:"#374151",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{lastName(liveState.pitcher)}</div>{pXw!=null&&<div style={{fontSize:9,color:pBord,fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{pXw.toFixed(3)} xwOBA</div>}</div>
                                  </div>
                                )}
                              </div>;
                            })()}
                            {matchup.mult!==1&&(()=>{
                              const pct=(matchup.mult-1)*100;
                              const col=pct>0?"#16a34a":"#dc2626";
                              return <div style={{marginTop:4,padding:"4px 6px",background:pct>0?"#f9fafb":"#fef2f2",borderRadius:4,fontSize:10}}>
                                <span style={{fontWeight:600,color:col}}>Matchup: {pct>0?"+":""}{pct.toFixed(0)}% ΔRE</span>
                              </div>;
                            })()}
                            {statsLoading&&<div style={{fontSize:10,color:"#9ca3af",marginTop:2}}>Loading player stats...</div>}
                            <div style={{fontSize:10,color:"#4ade80",marginTop:2}}>Auto-updating every 5s</div>

                            {/* Pitch Sequence Strip */}
                            {livePitchSeq&&livePitchSeq.length>0&&(
                              <div style={{marginTop:8}}>
                                <div style={{fontSize:9,fontWeight:600,color:"#9ca3af",textTransform:"uppercase",letterSpacing:.3,marginBottom:4}}>This AB</div>
                                <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
                                  {livePitchSeq.map((p,i)=>{
                                    const isStrike=["C","S","F","T","W","L","M"].includes(p.callCode);
                                    const isBall=["B","P","I","H"].includes(p.callCode);
                                    const isInPlay=["X","D","E"].includes(p.callCode);
                                    const bg=isInPlay?"#2563eb":isStrike?"#dc2626":isBall?"#16a34a":"#9ca3af";
                                    return(
                                      <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",background:bg,borderRadius:4,padding:"2px 5px",minWidth:28}}>
                                        <div style={{fontSize:8,fontWeight:700,color:"#fff",letterSpacing:.2}}>{p.pitchType||"--"}</div>
                                        {p.speed&&<div style={{fontSize:7,color:"rgba(255,255,255,.8)",fontFamily:"'SF Mono',Menlo,monospace"}}>{Math.round(p.speed)}</div>}
                                        <div style={{fontSize:7,color:"rgba(255,255,255,.7)",fontWeight:500}}>{p.callCode}</div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Last Play Result Banner */}
                            {liveLastPlay&&(
                              <div style={{marginTop:8,padding:"5px 10px",borderRadius:6,background:liveLastPlay.isOut?"#f3f4f6":"#f0fdf4",border:`1px solid ${liveLastPlay.isOut?"#e5e7eb":"#bbf7d0"}`,fontSize:11,lineHeight:1.4}}>
                                <span style={{fontWeight:600,color:liveLastPlay.isOut?"#374151":"#16a34a"}}>{lastName(liveLastPlay.batter)}:</span>{" "}
                                <span style={{color:"#374151"}}>{liveLastPlay.event}{liveLastPlay.rbi>0?` (${liveLastPlay.rbi} RBI)`:""}</span>
                              </div>
                            )}

                            {/* Recent Plays Log (Collapsible) */}
                            {liveRecentPlays&&liveRecentPlays.length>0&&(
                              <div style={{marginTop:8}}>
                                <button onClick={()=>setShowRecentPlays(p=>!p)} style={{background:"none",border:"none",cursor:"pointer",padding:0,fontSize:10,fontWeight:600,color:"#6b7280",display:"flex",alignItems:"center",gap:4,fontFamily:"inherit"}}>
                                  <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" style={{transition:"transform .15s",transform:showRecentPlays?"rotate(90deg)":"rotate(0deg)"}}><path d="M2 0l4 4-4 4z"/></svg>
                                  Recent At-Bats ({liveRecentPlays.length})
                                </button>
                                {showRecentPlays&&(
                                  <div style={{marginTop:4,display:"flex",flexDirection:"column",gap:2}}>
                                    {liveRecentPlays.map((p,i)=>(
                                      <div key={p.atBatIndex} style={{padding:"3px 8px",borderRadius:4,fontSize:10,lineHeight:1.4,background:i===0?"#f3f4f6":"transparent",color:"#374151"}}>
                                        <span style={{fontWeight:600,color:p.isOut?"#9ca3af":"#16a34a",fontVariantNumeric:"tabular-nums"}}>{p.halfInning==="top"?"T":"B"}{p.inning}</span>{" "}
                                        <span style={{fontWeight:600}}>{lastName(p.batter)}</span>:{" "}
                                        <span>{p.event}{p.rbi>0?` (${p.rbi} RBI)`:""}</span>
                                        <span style={{color:"#9ca3af",marginLeft:4,fontFamily:"'SF Mono',Menlo,monospace"}}>{p.count}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Trackman toggle link */}
                        <button onClick={()=>{setTrackmanActive(true);setSelectedGame(null);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:"#2563eb",fontFamily:"inherit",padding:"8px 0 0",display:"flex",alignItems:"center",gap:4}}>
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M8 4v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                          Use custom pitch data
                        </button>
                      </>)}

                      {/* === TRACKMAN INPUT PANEL === */}
                      {trackmanActive&&(
                        <div>
                          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                            <div style={{fontSize:11,fontWeight:600,color:"#111827"}}>Trackman / Custom Data</div>
                            <button onClick={()=>setTrackmanActive(false)} style={{background:"none",border:"none",cursor:"pointer",fontSize:10,color:"#9ca3af",fontFamily:"inherit",padding:0}}>Back to MLB games</button>
                          </div>

                          {/* Method tabs */}
                          <div style={{display:"flex",gap:3,marginBottom:10}}>
                            {[["paste","Paste"],["ws","WebSocket"],["csv","CSV"]].map(([k,l])=>(
                              <button key={k} onClick={()=>setTrackmanMethod(k)} style={{...seg(trackmanMethod===k),fontSize:10,padding:"4px 0"}}>{l}</button>
                            ))}
                          </div>

                          {/* PASTE METHOD */}
                          {trackmanMethod==="paste"&&(
                            <div>
                              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:6}}>
                                <div>
                                  <label style={{fontSize:9,fontWeight:600,color:"#9ca3af",textTransform:"uppercase",letterSpacing:.3,display:"block",marginBottom:2}}>PlateLocSide</label>
                                  <input type="number" step="0.001" value={tmPaste.pX} onChange={e=>setTmPaste(p=>({...p,pX:e.target.value}))} placeholder="0.00" style={{width:"100%",padding:"6px 8px",borderRadius:6,border:"1px solid #e5e7eb",fontSize:12,fontFamily:"'SF Mono',Menlo,monospace",outline:"none",background:"#f9fafb",color:"#1f2937"}}/>
                                </div>
                                <div>
                                  <label style={{fontSize:9,fontWeight:600,color:"#9ca3af",textTransform:"uppercase",letterSpacing:.3,display:"block",marginBottom:2}}>PlateLocHeight</label>
                                  <input type="number" step="0.001" value={tmPaste.pZ} onChange={e=>setTmPaste(p=>({...p,pZ:e.target.value}))} placeholder="0.00" style={{width:"100%",padding:"6px 8px",borderRadius:6,border:"1px solid #e5e7eb",fontSize:12,fontFamily:"'SF Mono',Menlo,monospace",outline:"none",background:"#f9fafb",color:"#1f2937"}}/>
                                </div>
                                <div>
                                  <label style={{fontSize:9,fontWeight:600,color:"#9ca3af",textTransform:"uppercase",letterSpacing:.3,display:"block",marginBottom:2}}>Zone Top</label>
                                  <input type="number" step="0.01" value={tmPaste.szTop} onChange={e=>setTmPaste(p=>({...p,szTop:e.target.value}))} style={{width:"100%",padding:"6px 8px",borderRadius:6,border:"1px solid #e5e7eb",fontSize:12,fontFamily:"'SF Mono',Menlo,monospace",outline:"none",background:"#f9fafb",color:"#1f2937"}}/>
                                </div>
                                <div>
                                  <label style={{fontSize:9,fontWeight:600,color:"#9ca3af",textTransform:"uppercase",letterSpacing:.3,display:"block",marginBottom:2}}>Zone Bottom</label>
                                  <input type="number" step="0.01" value={tmPaste.szBot} onChange={e=>setTmPaste(p=>({...p,szBot:e.target.value}))} style={{width:"100%",padding:"6px 8px",borderRadius:6,border:"1px solid #e5e7eb",fontSize:12,fontFamily:"'SF Mono',Menlo,monospace",outline:"none",background:"#f9fafb",color:"#1f2937"}}/>
                                </div>
                              </div>
                              <label style={{fontSize:9,fontWeight:600,color:"#9ca3af",textTransform:"uppercase",letterSpacing:.3,display:"block",marginBottom:3}}>Call</label>
                              <div style={{display:"flex",gap:3,marginBottom:8}}>
                                <button onClick={()=>setTmPaste(p=>({...p,call:"ball"}))} style={{...seg(tmPaste.call==="ball"),fontSize:11,padding:"5px 0",background:tmPaste.call==="ball"?"#16a34a":"#f3f4f6",color:tmPaste.call==="ball"?"#fff":"#6b7280"}}>Ball</button>
                                <button onClick={()=>setTmPaste(p=>({...p,call:"strike"}))} style={{...seg(tmPaste.call==="strike"),fontSize:11,padding:"5px 0",background:tmPaste.call==="strike"?"#dc2626":"#f3f4f6",color:tmPaste.call==="strike"?"#fff":"#6b7280"}}>Strike</button>
                              </div>
                              <button onClick={()=>{
                                const pX=parseFloat(tmPaste.pX),pZ=parseFloat(tmPaste.pZ);
                                if(isNaN(pX)||isNaN(pZ))return;
                                const szTop=parseFloat(tmPaste.szTop)||3.5,szBot=parseFloat(tmPaste.szBot)||1.6;
                                setTmPitch({pX,pZ,szTop,szBot,call:tmPaste.call,type:"",speed:"",preCount:tmCount,preOuts:tmOuts,preBases:tmBases});
                              }} style={{width:"100%",padding:"7px 0",borderRadius:7,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,background:"#111827",color:"#fff",fontFamily:"inherit"}}>Analyze</button>
                            </div>
                          )}

                          {/* WEBSOCKET METHOD */}
                          {trackmanMethod==="ws"&&(
                            <div>
                              <label style={{fontSize:9,fontWeight:600,color:"#9ca3af",textTransform:"uppercase",letterSpacing:.3,display:"block",marginBottom:2}}>WebSocket URL</label>
                              <input type="text" value={tmWsUrl} onChange={e=>setTmWsUrl(e.target.value)} placeholder="ws://localhost:8080" style={{width:"100%",padding:"6px 8px",borderRadius:6,border:"1px solid #e5e7eb",fontSize:11,fontFamily:"'SF Mono',Menlo,monospace",outline:"none",background:"#f9fafb",color:"#1f2937",marginBottom:6}}/>
                              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                                {tmWsStatus!=="connected"?(
                                  <button onClick={tmWsConnect} disabled={!tmWsUrl} style={{padding:"6px 14px",borderRadius:7,border:"none",cursor:tmWsUrl?"pointer":"default",fontSize:11,fontWeight:600,background:tmWsUrl?"#111827":"#e5e7eb",color:tmWsUrl?"#fff":"#9ca3af",fontFamily:"inherit"}}>Connect</button>
                                ):(
                                  <button onClick={tmWsDisconnect} style={{padding:"6px 14px",borderRadius:7,border:"none",cursor:"pointer",fontSize:11,fontWeight:600,background:"#dc2626",color:"#fff",fontFamily:"inherit"}}>Disconnect</button>
                                )}
                                <div style={{display:"flex",alignItems:"center",gap:4}}>
                                  <div style={{width:7,height:7,borderRadius:"50%",background:tmWsStatus==="connected"?"#22c55e":tmWsStatus==="error"?"#dc2626":"#9ca3af",animation:tmWsStatus==="connected"?"pulse 1.5s infinite":"none"}}/>
                                  <span style={{fontSize:10,color:tmWsStatus==="connected"?"#22c55e":tmWsStatus==="error"?"#dc2626":"#9ca3af",fontWeight:500,textTransform:"capitalize"}}>{tmWsStatus}</span>
                                </div>
                              </div>
                              {tmWsStatus==="connected"&&tmPitch&&(
                                <div style={{marginTop:8,padding:"6px 8px",background:"#f0fdf4",borderRadius:6,fontSize:10,color:"#16a34a",fontWeight:500}}>
                                  Last pitch: {tmPitch.call} at ({tmPitch.pX.toFixed(3)}, {tmPitch.pZ.toFixed(3)})
                                </div>
                              )}
                            </div>
                          )}

                          {/* CSV METHOD */}
                          {trackmanMethod==="csv"&&(
                            <div>
                              <input ref={tmFileRef} type="file" accept=".csv" onChange={handleTmCsvUpload} style={{display:"none"}}/>
                              <div
                                onClick={()=>tmFileRef.current?.click()}
                                onDragOver={(e)=>{e.preventDefault();setTmDragOver(true);}}
                                onDragLeave={()=>setTmDragOver(false)}
                                onDrop={handleTmCsvDrop}
                                style={{width:"100%",padding:"14px 0",borderRadius:7,border:`1.5px dashed ${tmDragOver?"#2563eb":"#d1d5db"}`,cursor:"pointer",fontSize:11,fontWeight:500,background:tmDragOver?"#eff6ff":"#f9fafb",color:tmDragOver?"#2563eb":"#6b7280",fontFamily:"inherit",marginBottom:6,textAlign:"center",transition:"all .15s"}}
                              >
                                {tmDragOver?"Drop CSV here":tmCsvData?"Replace CSV":"Drop CSV here or click to upload"}
                              </div>
                              {tmCsvData&&(()=>{
                                const calledPitches=tmCsvData.filter(r=>r.call);
                                const totalPitches=tmCsvData.length;
                                return(
                                  <div>
                                    <div style={{fontSize:10,color:"#6b7280",marginBottom:6}}>
                                      <span style={{fontWeight:600}}>{tmCsvFileName}</span> — {totalPitches} pitch{totalPitches!==1?"es":""} ({calledPitches.length} called)
                                    </div>
                                    <div style={{display:"flex",gap:3,marginBottom:8}}>
                                      <button onClick={()=>setTmCsvView("step")} style={{...seg(tmCsvView==="step"),fontSize:10,padding:"4px 0"}}>Step Through</button>
                                      <button onClick={()=>setTmCsvView("list")} style={{...seg(tmCsvView==="list"),fontSize:10,padding:"4px 0"}}>List View</button>
                                    </div>
                                    {tmCsvView==="step"&&(
                                      <div>
                                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                                          <button onClick={()=>{const ni=Math.max(0,tmCsvIdx-1);setTmCsvIdx(ni);const p=tmCsvData[ni];if(p)setTmPitch({...p,preCount:p.preCount||tmCount,preOuts:p.preOuts??tmOuts,preBases:p.preBases||tmBases});}} disabled={tmCsvIdx===0} style={{width:28,height:28,borderRadius:6,border:"1px solid #e5e7eb",background:tmCsvIdx===0?"#f9fafb":"#fff",color:tmCsvIdx===0?"#d1d5db":"#374151",cursor:tmCsvIdx===0?"default":"pointer",fontSize:14,fontWeight:700,fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center"}}>&#8249;</button>
                                          <div style={{flex:1,textAlign:"center",fontSize:10,color:"#9ca3af",fontWeight:500}}>{tmCsvIdx+1} / {tmCsvData.length}</div>
                                          <button onClick={()=>{const ni=Math.min(tmCsvData.length-1,tmCsvIdx+1);setTmCsvIdx(ni);const p=tmCsvData[ni];if(p)setTmPitch({...p,preCount:p.preCount||tmCount,preOuts:p.preOuts??tmOuts,preBases:p.preBases||tmBases});}} disabled={tmCsvIdx>=tmCsvData.length-1} style={{width:28,height:28,borderRadius:6,border:"1px solid #e5e7eb",background:tmCsvIdx>=tmCsvData.length-1?"#f9fafb":"#fff",color:tmCsvIdx>=tmCsvData.length-1?"#d1d5db":"#374151",cursor:tmCsvIdx>=tmCsvData.length-1?"default":"pointer",fontSize:14,fontWeight:700,fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center"}}>&#8250;</button>
                                        </div>
                                        {tmCsvData[tmCsvIdx]&&(
                                          <div style={{fontSize:10,color:"#6b7280",background:"#f9fafb",borderRadius:6,padding:"4px 8px"}}>
                                            {tmCsvData[tmCsvIdx].call?<span style={{fontWeight:600,color:tmCsvData[tmCsvIdx].call==="strike"?"#dc2626":"#16a34a",textTransform:"uppercase"}}>Called {tmCsvData[tmCsvIdx].call}</span>:<span style={{color:"#d1d5db"}}>{tmCsvData[tmCsvIdx].rawCall||"No called pitch"}</span>}
                                            {tmCsvData[tmCsvIdx].type&&<span> · {tmCsvData[tmCsvIdx].type}</span>}
                                            {tmCsvData[tmCsvIdx].speed&&<span> {tmCsvData[tmCsvIdx].speed}</span>}
                                            {(tmCsvData[tmCsvIdx].pitcher||tmCsvData[tmCsvIdx].batter)&&(
                                              <div style={{marginTop:2,fontSize:9,color:"#9ca3af"}}>
                                                {tmCsvData[tmCsvIdx].half&&tmCsvData[tmCsvIdx].inning&&<span>{tmCsvData[tmCsvIdx].half} {tmCsvData[tmCsvIdx].inning} · </span>}
                                                {tmCsvData[tmCsvIdx].batter&&<span>AB: {tmCsvData[tmCsvIdx].batter}</span>}
                                                {tmCsvData[tmCsvIdx].batter&&tmCsvData[tmCsvIdx].pitcher&&<span> vs </span>}
                                                {tmCsvData[tmCsvIdx].pitcher&&<span>P: {tmCsvData[tmCsvIdx].pitcher}</span>}
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          )}

                          {/* WebSocket status indicator when not on WS tab */}
                          {trackmanMethod!=="ws"&&tmWsStatus==="connected"&&(
                            <div style={{marginTop:6,display:"flex",alignItems:"center",gap:4,fontSize:10,color:"#22c55e"}}>
                              <div style={{width:6,height:6,borderRadius:"50%",background:"#22c55e",animation:"pulse 1.5s infinite"}}/>
                              WebSocket connected
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {mode==="demo"&&(
                    <div>
                      <div style={{fontSize:11,fontWeight:600,color:"#111827",marginBottom:6}}>2025 World Series Game 7</div>
                      <div style={{fontSize:10,color:"#6b7280",marginBottom:8}}>LAD 5, TOR 4 (11 inn) · Rogers Centre</div>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                        <button onClick={()=>setDemoIdx(i=>Math.max(0,i-1))} disabled={demoIdx===0} style={{width:28,height:28,borderRadius:6,border:"1px solid #e5e7eb",background:demoIdx===0?"#f9fafb":"#fff",color:demoIdx===0?"#d1d5db":"#374151",cursor:demoIdx===0?"default":"pointer",fontSize:14,fontWeight:700,fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
                        <div style={{flex:1,textAlign:"center",fontSize:10,color:"#9ca3af",fontWeight:500}}>{demoIdx+1} / {DEMO_PLAYS.length}</div>
                        <button onClick={()=>setDemoIdx(i=>Math.min(DEMO_PLAYS.length-1,i+1))} disabled={demoIdx===DEMO_PLAYS.length-1} style={{width:28,height:28,borderRadius:6,border:"1px solid #e5e7eb",background:demoIdx===DEMO_PLAYS.length-1?"#f9fafb":"#fff",color:demoIdx===DEMO_PLAYS.length-1?"#d1d5db":"#374151",cursor:demoIdx===DEMO_PLAYS.length-1?"default":"pointer",fontSize:14,fontWeight:700,fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:`repeat(${DEMO_PLAYS.length},1fr)`,gap:4,marginBottom:10}}>
                        {DEMO_PLAYS.map((dp,di)=>(
                          <button key={di} onClick={()=>setDemoIdx(di)} style={{padding:"4px 0",borderRadius:5,fontSize:10,fontWeight:demoIdx===di?700:400,border:"none",cursor:"pointer",background:demoIdx===di?"#111827":"#f9fafb",color:demoIdx===di?"#fff":"#6b7280",transition:"all .12s",fontFamily:"inherit",textAlign:"center"}}>{di+1}</button>
                        ))}
                      </div>
                      <div style={{background:"#f9fafb",borderRadius:8,padding:"8px 10px",fontSize:11,color:"#374151",lineHeight:1.6}}>
                        <div style={{fontWeight:700,fontSize:12,marginBottom:4}}>{demoPlay.label}</div>
                        <div style={{fontSize:10,color:"#64748b",marginBottom:6}}>{demoPlay.sub}</div>
                        {(()=>{
                          const bSt=DEMO_STATS[demoPlay.batterId],pSt=DEMO_STATS[demoPlay.pitcherId];
                          const bF=bSt?.xwoba?bSt.xwoba/LG_XWOBA:1,pF=pSt?.xwoba?pSt.xwoba/LG_XWOBA:1;
                          const bAdv=bF-1,pAdv=1-pF,diff=bAdv-pAdv,thresh=0.05;
                          const bEdge=diff>thresh,pEdge=diff<-thresh;
                          const bBord=bEdge?"#16a34a":pEdge?"#dc2626":"#9ca3af";
                          const pBord=pEdge?"#16a34a":bEdge?"#dc2626":"#9ca3af";
                          return <div style={{display:"flex",gap:8,marginBottom:6}}>
                          <div style={{display:"flex",alignItems:"center",gap:6,flex:1,background:"#f3f4f6",borderRadius:6,padding:"4px 6px",borderLeft:`3px solid ${bBord}`}}>
                            <img src={`${HEADSHOT}${demoPlay.batterId}.png`} alt="" style={{width:28,height:28,borderRadius:"50%",objectFit:"cover",flexShrink:0}} onError={e=>{e.target.style.display="none"}}/>
                            <div style={{minWidth:0}}><div style={{fontSize:8,fontWeight:600,color:"#9ca3af",textTransform:"uppercase",letterSpacing:.3}}>AB</div><div style={{fontSize:10,fontWeight:600,color:"#374151",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{lastName(demoPlay.batter)}</div>{bSt?.xwoba!=null&&<div style={{fontSize:9,color:bBord,fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{bSt.xwoba.toFixed(3)} xwOBA</div>}</div>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:6,flex:1,background:"#f3f4f6",borderRadius:6,padding:"4px 6px",borderLeft:`3px solid ${pBord}`}}>
                            <img src={`${HEADSHOT}${demoPlay.pitcherId}.png`} alt="" style={{width:28,height:28,borderRadius:"50%",objectFit:"cover",flexShrink:0}} onError={e=>{e.target.style.display="none"}}/>
                            <div style={{minWidth:0}}><div style={{fontSize:8,fontWeight:600,color:"#9ca3af",textTransform:"uppercase",letterSpacing:.3}}>P</div><div style={{fontSize:10,fontWeight:600,color:"#374151",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{lastName(demoPlay.pitcher)}</div>{pSt?.xwoba!=null&&<div style={{fontSize:9,color:pBord,fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{pSt.xwoba.toFixed(3)} xwOBA</div>}</div>
                          </div>
                        </div>;
                        })()}
                        {matchup.mult!==1&&(()=>{
                          const pct=(matchup.mult-1)*100;
                          const col=pct>0?"#16a34a":"#dc2626";
                          return <div style={{padding:"3px 6px",background:pct>0?"#f9fafb":"#fef2f2",borderRadius:4,fontSize:10,marginBottom:4}}>
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
              <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:10,marginBottom:12,position:"relative"}}>
                <div style={{padding:16}}>
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
                    <div style={{textAlign:"center"}}>
                      <Diamond bs={activeBs} size={56}/>
                      {mode==="manual"&&<div style={{display:"flex",gap:3,justifyContent:"center",marginTop:4}}>
                        {["1B","2B","3B"].map((l,i)=>(
                          <button key={i} onClick={()=>toggleBase(i)} style={{padding:"2px 6px",borderRadius:5,fontSize:9,fontWeight:600,cursor:"pointer",border:"none",background:bs[i]==="1"?"#fef2f2":"#f3f4f6",color:bs[i]==="1"?"#ef4444":"#9ca3af",transition:"all .15s"}}>{l}</button>
                        ))}
                      </div>}
                      {isLive&&trackmanActive&&!(tmPitch?.preBases)&&<div style={{display:"flex",gap:3,justifyContent:"center",marginTop:4}}>
                        {["1B","2B","3B"].map((l,i)=>(
                          <button key={i} onClick={()=>setTmBases(p=>{const a=p.split("");a[i]=a[i]==="1"?"0":"1";return a.join("")})} style={{padding:"2px 6px",borderRadius:5,fontSize:9,fontWeight:600,cursor:"pointer",border:"none",background:tmBases[i]==="1"?"#fef2f2":"#f3f4f6",color:tmBases[i]==="1"?"#ef4444":"#9ca3af",transition:"all .15s"}}>{l}</button>
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
                    <div style={{marginLeft:"auto",textAlign:"right"}}>
                      <div style={{fontSize:9,fontWeight:500,color:"#9ca3af",textTransform:"uppercase",letterSpacing:.5}}>Run Exp</div>
                      <div style={{fontSize:26,fontWeight:700,color:"#111827",letterSpacing:-.5,lineHeight:1,fontVariantNumeric:"tabular-nums",marginTop:2}}>{analysis?fmt(analysis.cur):"—"}</div>
                    </div>
                  </div>
                  {analysis&&(()=>{
                    // Find the relevant challenge for current perspective
                    const relResult=analysis.results.find(r=>r.rel);
                    const oppResult=analysis.results.find(r=>!r.rel);
                    if(!relResult&&!oppResult)return null; // 0-0: no challenges
                    if(!relResult)return(
                      <div style={{borderTop:"1px solid #f3f4f6",marginTop:2,paddingTop:10}}>
                        <div style={{fontSize:11,color:"#9ca3af"}}>No {persp==="offense"?"batting":"pitching"} challenge available this count</div>
                      </div>
                    );
                    // Use Tango's raw threshold (not matchup-adjusted)
                    const displayThresh=analysis.thresh;
                    const displayTier=analysis.tier;
                    return(
                      <div style={{borderTop:"1px solid #f3f4f6",marginTop:2,paddingTop:10,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                        <div style={{fontSize:11,color:"#9ca3af"}}>{displayTier.sub}</div>
                        <div style={{textAlign:"center"}}><div style={{fontSize:9,fontWeight:500,color:"#9ca3af",textTransform:"uppercase",letterSpacing:.5}}>Tango Thresh</div><ConfidenceNum thresh={displayThresh}/></div>
                      </div>
                    );
                  })()}

                  <ChallengeContext analysis={analysis} activeCount={activeCount} persp={persp}/>

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
                  {isLive&&trackmanActive&&!(tmPitch?.preCount)&&(<>
                    <label style={{fontSize:11,fontWeight:500,color:"#6b7280",display:"block",marginBottom:4}}>Count</label>
                    <div className="count-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:3,marginBottom:12}}>
                      {COUNTS.map(c=><button key={c} onClick={()=>setTmCount(c)} style={{...seg(tmCount===c),padding:"5px 0",fontSize:11,borderRadius:6}}>{c}</button>)}
                    </div>
                    <label style={{fontSize:11,fontWeight:500,color:"#6b7280",display:"block",marginBottom:4}}>Outs</label>
                    <div style={{display:"flex",gap:3}}>
                      {[0,1,2].map(o=><button key={o} onClick={()=>setTmOuts(o)} style={seg(tmOuts===o)}>{o}</button>)}
                    </div>
                  </>)}
                  {mode==="live"&&!trackmanActive&&!liveState&&selectedGame&&(
                    <p style={{fontSize:12,color:"#9ca3af",margin:0}}>Connecting to game feed...</p>
                  )}
                  {mode==="live"&&!trackmanActive&&!selectedGame&&(
                    <p style={{fontSize:12,color:"#9ca3af",margin:0}}>Select a live game above.</p>
                  )}
                  {mode==="signal"&&!trackmanActive&&!liveState&&selectedGame&&(
                    <p style={{fontSize:12,color:"#9ca3af",margin:0}}>Connecting to game feed...</p>
                  )}
                  {mode==="signal"&&!trackmanActive&&!selectedGame&&(
                    <p style={{fontSize:12,color:"#9ca3af",margin:0}}>Select a live game above.</p>
                  )}
                </div>
              </div>

              {/* === CONTEXT === */}
              <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:10,marginBottom:12,overflow:"hidden"}}>
                <div style={{padding:16}}>
                  {isLive&&!trackmanActive&&liveState&&(
                    <div style={{display:"flex",gap:12,marginBottom:10,fontSize:12,color:"#6b7280"}}>
                      <span>{liveState.isTop?"Top":"Bot"} {liveState.inn}</span>
                      <span>{awayAbbr} {liveState.away} – {homeAbbr} {liveState.home}</span>
                    </div>
                  )}
                  {mode==="demo"&&(
                    <div style={{display:"flex",gap:12,marginBottom:10,fontSize:12,color:"#6b7280"}}>
                      <span>{demoPlay.isTop?"Top":"Bot"} {demoPlay.inn}</span>
                      <span>LAD {demoPlay.away} – TOR {demoPlay.home}</span>
                    </div>
                  )}
                  <div><label style={{fontSize:11,fontWeight:500,color:"#6b7280",display:"block",marginBottom:4}}>Perspective</label><div style={{display:"flex",gap:3}}>{[["offense","Batting"],["defense","Pitching"]].map(([p,l])=><button key={p} onClick={()=>setPersp(p)} style={{...seg(persp===p),fontSize:11}}>{l}</button>)}</div></div>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div style={{minHeight:120}}>
              {mode==="signal"&&(()=>{
                // Signal mode: big color block
                if(!trackmanActive&&(!liveState||!selectedGame))return(
                  <div style={{background:"#f3f4f6",borderRadius:16,padding:64,textAlign:"center",color:"#9ca3af",fontSize:15}}>
                    Select a live game to start
                  </div>
                );
                if(!activePitch||!analysis)return(
                  <div style={{background:"#1f2937",borderRadius:16,padding:64,textAlign:"center"}}>
                    <div style={{fontSize:16,fontWeight:600,color:"#9ca3af"}}>Waiting for called pitch...</div>
                    <div style={{marginTop:12}}><Diamond bs={activeBs} size={48}/></div>
                    <div style={{marginTop:8}}><Dots count={activeCount} sm/></div>
                  </div>
                );
                const dist=getDistFromZone(activePitch.pX,activePitch.pZ,activePitch.szTop,activePitch.szBot);
                const pOutside=confidenceFromDist(dist,activeSigma);
                const conf=activePitch.call==="strike"?pOutside:100-pOutside;
                const challengerPersp=activePitch.call==="strike"?"offense":"defense";
                const canChallenge=persp===challengerPersp;
                const thresh=analysis.thresh;

                if(!canChallenge)return(
                  <div style={{background:"#1f2937",borderRadius:16,padding:64,textAlign:"center"}}>
                    <div style={{fontSize:20,fontWeight:700,color:"#6b7280"}}>—</div>
                    <div style={{fontSize:13,color:"#9ca3af",marginTop:8}}>Called {activePitch.call} favors you</div>
                  </div>
                );

                const MARGIN=15;
                const gap=conf-thresh;
                let bg,textCol,label;
                if(gap>=MARGIN){bg="#16a34a";textCol="#fff";label="CHALLENGE";}
                else if(gap<=-MARGIN){bg="#dc2626";textCol="#fff";label="HOLD";}
                else{bg="#eab308";textCol="#1a1a1a";label="CLOSE";}

                return(
                  <div style={{background:bg,borderRadius:16,padding:"48px 32px",textAlign:"center",transition:"background .3s ease",minHeight:200,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                    <div style={{fontSize:48,fontWeight:800,color:textCol,letterSpacing:-1,lineHeight:1}}>{label}</div>
                    <div style={{fontSize:18,fontWeight:600,color:textCol,opacity:0.85,marginTop:12}}>{conf}% conf · need {thresh}%</div>
                    <div style={{fontSize:13,color:textCol,opacity:0.7,marginTop:8}}>Called {activePitch.call} · {activePitch.type} {activePitch.speed}{activePitch.result?` · ${activePitch.result}`:""}</div>
                  </div>
                );
              })()}
              {/* Coordinate readout for trackman */}
              {isLive&&trackmanActive&&activePitch&&(
                <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:8,padding:"6px 10px",marginBottom:10,fontFamily:"'SF Mono',Menlo,monospace",fontSize:11,color:"#374151",display:"flex",gap:12,flexWrap:"wrap"}}>
                  <span>PlateLocSide: <b>{activePitch.pX.toFixed(3)}</b></span>
                  <span>PlateLocHeight: <b>{activePitch.pZ.toFixed(3)}</b></span>
                  <span>Zone Top: <b>{activePitch.szTop.toFixed(2)}</b></span>
                  <span>Zone Bot: <b>{activePitch.szBot.toFixed(2)}</b></span>
                </div>
              )}

              {/* CSV List View */}
              {isLive&&trackmanActive&&trackmanMethod==="csv"&&tmCsvView==="list"&&tmCsvData&&(
                <CsvListView
                  data={tmCsvData}
                  selectedIdx={tmCsvIdx}
                  onSelect={(idx)=>{setTmCsvIdx(idx);const p=tmCsvData[idx];if(p)setTmPitch({...p,preCount:p.preCount||tmCount,preOuts:p.preOuts??tmOuts,preBases:p.preBases||tmBases});}}
                  persp={persp}
                  tmCount={tmCount}
                  tmOuts={tmOuts}
                  tmBases={tmBases}
                  sort={tmCsvSort}
                  onSort={setTmCsvSort}
                  sigma={activeSigma}
                />
              )}

              {mode==="manual"&&analysis&&<ZoneCard
                pitch={activePitch}
                thresh={analysis.thresh}
                persp={persp}
                sigma={activeSigma}
                interactive
                onClickZone={(pX,pZ)=>setManualPitch({pX,pZ})}
                onClear={()=>setManualPitch(null)}
              />}
              {mode!=="manual"&&mode!=="signal"&&!(isLive&&trackmanActive)&&activePitch&&analysis&&<ZoneCard pitch={activePitch} thresh={analysis.thresh} persp={persp} sigma={activeSigma}/>}
              {/* Trackman paste/ws/csv-step zone card */}
              {isLive&&trackmanActive&&!(trackmanMethod==="csv"&&tmCsvView==="list")&&analysis&&<ZoneCard
                pitch={activePitch}
                thresh={analysis.thresh}
                persp={persp}
                sigma={activeSigma}
                interactive={trackmanMethod==="paste"}
                onClickZone={trackmanMethod==="paste"?(pX,pZ)=>{
                  const szTop=parseFloat(tmPaste.szTop)||3.5,szBot=parseFloat(tmPaste.szBot)||1.6;
                  setTmPitch({pX,pZ,szTop,szBot,call:tmPaste.call,type:"",speed:"",preCount:tmCount,preOuts:tmOuts,preBases:tmBases});
                  setTmPaste(p=>({...p,pX:pX.toFixed(3),pZ:pZ.toFixed(3)}));
                }:undefined}
                onClear={trackmanMethod==="paste"?()=>setTmPitch(null):undefined}
              />}
              {mode!=="signal"&&matchup.mult!==1&&analysis?.results?.length>0&&(()=>{
                const mpct=(matchup.mult-1)*100;
                const col=mpct>0?"#16a34a":mpct<0?"#dc2626":"#6b7280";
                return <div style={{background:mpct>0?"#f9fafb":"#fef2f2",border:`1px solid ${mpct>0?"#bbf7d0":"#fecaca"}`,borderRadius:8,padding:"8px 12px",marginBottom:10,fontSize:12,fontWeight:600,color:col}}>
                  Challenges worth {mpct>0?"+":""}{mpct.toFixed(0)}% this AB
                </div>;
              })()}
              {mode!=="signal"&&analysis?.results?.filter(r=>{
                if(!activePitch?.call)return true; // manual mode: show both
                return activePitch.call==="ball"?r.type==="b2s":r.type==="s2b";
              }).map((r,i)=><ChallengeCard key={`${r.from}-${r.to}`} r={r} persp={persp} mode={mode}/>)}
              {mode!=="signal"&&(!analysis||analysis.results.length===0)&&(
                <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:10,padding:32,textAlign:"center",color:"#9ca3af",fontSize:13}}>
                  {isLive&&trackmanActive?"Analyze a pitch to see challenge data.":isLive&&!liveState?"Select a live game and wait for data.":"No valid challenge transitions for this count."}
                </div>
              )}
            </div>
          </div>

          {/* Decision framework explainer */}
          <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:10,padding:"16px 20px",marginTop:12}}>
            <div style={{fontSize:13,fontWeight:700,color:"#111827",marginBottom:10}}>Two inputs, one decision</div>
            <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
              <div style={{flex:"1 1 200px",background:"#f9fafb",borderRadius:8,padding:"10px 12px"}}>
                <div style={{fontSize:11,fontWeight:700,color:"#374151",marginBottom:4}}>Break-even <span style={{fontWeight:400,color:"#9ca3af"}}>— from game state</span></div>
                <div style={{fontSize:12,color:"#6b7280",lineHeight:1.6}}>How confident you <b>need</b> to be. Computed from the run swing of overturning this call: <span style={{fontFamily:"'SF Mono',Menlo,monospace",fontSize:11}}>cost ÷ (swing + cost)</span>. High-leverage spots lower the bar. Low-leverage spots raise it.</div>
              </div>
              <div style={{flex:"1 1 200px",background:"#f9fafb",borderRadius:8,padding:"10px 12px"}}>
                <div style={{fontSize:11,fontWeight:700,color:"#374151",marginBottom:4}}>Zone confidence <span style={{fontWeight:400,color:"#9ca3af"}}>— from pitch location</span></div>
                <div style={{fontSize:12,color:"#6b7280",lineHeight:1.6}}>How confident you <b>should</b> be. Estimated from Statcast coordinates — how far the pitch was from the zone edge, adjusted for tracking error. Challenge when confidence ≥ break-even.</div>
              </div>
            </div>
          </div>
        </>)}

        {tab==="matrix"&&<MatrixView {...{mOuts,setMOuts,mView,setMView}} seg={(active)=>({padding:"5px 14px",borderRadius:7,fontSize:12,fontWeight:active?600:400,cursor:"pointer",border:"none",background:active?"#111827":"#f3f4f6",color:active?"#fff":"#6b7280",transition:"all .15s",fontFamily:"inherit"})}/>}
        {tab==="thresholds"&&<ThresholdMatrix/>}
        {tab==="methodology"&&<Methodology/>}
        {tab==="training"&&<TrainingMode/>}
      </div>
    </div>
  );
}

// ============================================================
// CSV LIST VIEW
// ============================================================
function CsvListView({data,selectedIdx,onSelect,persp,tmCount,tmOuts,tmBases,sort,onSort,sigma=1.0}){
  const green="#16a34a",red="#dc2626",yellow="#eab308";
  // Compute analysis for each row
  const rows=useMemo(()=>data.map((row,i)=>{
    if(!row.call)return{...row,idx:i,verdict:null,conf:null,dRE:null,thresh:null};
    const c=row.preCount||tmCount;
    const o=row.preOuts??tmOuts;
    const b=row.preBases||tmBases;
    if(!RE[o]?.[b]?.[c])return{...row,idx:i,verdict:"—",conf:null,dRE:null,thresh:null};
    const dist=getDistFromZone(row.pX,row.pZ,row.szTop,row.szBot);
    const pOutside=confidenceFromDist(dist,sigma);
    const conf=row.call==="strike"?pOutside:100-pOutside;
    const challengerPersp=row.call==="strike"?"offense":"defense";
    const canChallenge=persp===challengerPersp;
    const[balls,strikes]=c.split("-").map(Number);
    const thresh=getTangoThresh(b,o,balls,strikes);
    const trans=getTrans(c,o,b);
    const relevantTrans=row.call==="ball"?trans.find(t=>t.type==="b2s"):trans.find(t=>t.type==="s2b");
    let dRE=null;
    if(relevantTrans){
      const cur=RE[o][b][c];
      let cor;
      if(relevantTrans.terminal){
        if(relevantTrans.newOuts>=3)cor=0;
        else cor=(RE[relevantTrans.newOuts]?.[relevantTrans.newBases]?.["0-0"]??null);
        if(cor!==null)cor=cor+relevantTrans.runs;
      }else{
        cor=RE[o]?.[b]?.[relevantTrans.to];
      }
      if(cor!=null&&cur!=null)dRE=Math.abs(cor-cur);
    }
    const MARGIN=15;
    const gap=conf-thresh;
    let verdict;
    if(!canChallenge)verdict="—";
    else if(gap>=MARGIN)verdict="CHALLENGE";
    else if(gap<=-MARGIN)verdict="HOLD";
    else verdict="CLOSE";
    return{...row,idx:i,verdict,conf,dRE,thresh,canChallenge};
  }),[data,persp,tmCount,tmOuts,tmBases,sigma]);

  const sorted=useMemo(()=>{
    if(!sort)return rows;
    const s=[...rows];
    s.sort((a,b)=>{
      const av=sort.col==="conf"?a.conf:a.dRE;
      const bv=sort.col==="conf"?b.conf:b.dRE;
      if(av==null&&bv==null)return 0;
      if(av==null)return 1;
      if(bv==null)return -1;
      return sort.dir==="asc"?av-bv:bv-av;
    });
    return s;
  },[rows,sort]);

  const handleSort=(col)=>{
    if(sort?.col===col)onSort({col,dir:sort.dir==="asc"?"desc":"asc"});
    else onSort({col,dir:"desc"});
  };
  const sortArrow=(col)=>sort?.col===col?(sort.dir==="asc"?" \u25B2":" \u25BC"):"";

  return(
    <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:10,marginBottom:10,overflow:"hidden"}}>
      <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch",maxHeight:400,overflowY:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:500}}>
          <thead><tr style={{position:"sticky",top:0,background:"#fff",zIndex:1}}>
            <th style={{padding:"6px 8px",textAlign:"center",fontSize:9,fontWeight:600,color:"#9ca3af",borderBottom:"1px solid #e5e7eb",width:30}}>#</th>
            <th style={{padding:"6px 6px",textAlign:"center",fontSize:9,fontWeight:600,color:"#9ca3af",borderBottom:"1px solid #e5e7eb"}}>pX</th>
            <th style={{padding:"6px 6px",textAlign:"center",fontSize:9,fontWeight:600,color:"#9ca3af",borderBottom:"1px solid #e5e7eb"}}>pZ</th>
            <th style={{padding:"6px 6px",textAlign:"center",fontSize:9,fontWeight:600,color:"#9ca3af",borderBottom:"1px solid #e5e7eb"}}>Call</th>
            <th style={{padding:"6px 6px",textAlign:"center",fontSize:9,fontWeight:600,color:"#9ca3af",borderBottom:"1px solid #e5e7eb"}}>Type</th>
            <th style={{padding:"6px 6px",textAlign:"center",fontSize:9,fontWeight:600,color:"#9ca3af",borderBottom:"1px solid #e5e7eb"}}>Speed</th>
            <th style={{padding:"6px 6px",textAlign:"center",fontSize:9,fontWeight:600,color:"#9ca3af",borderBottom:"1px solid #e5e7eb",cursor:"pointer",userSelect:"none"}} onClick={()=>handleSort("conf")}>Conf{sortArrow("conf")}</th>
            <th style={{padding:"6px 6px",textAlign:"center",fontSize:9,fontWeight:600,color:"#9ca3af",borderBottom:"1px solid #e5e7eb"}}>Verdict</th>
            <th style={{padding:"6px 6px",textAlign:"center",fontSize:9,fontWeight:600,color:"#9ca3af",borderBottom:"1px solid #e5e7eb",cursor:"pointer",userSelect:"none"}} onClick={()=>handleSort("dRE")}>{"\u0394"}RE{sortArrow("dRE")}</th>
          </tr></thead>
          <tbody>{sorted.map(row=>{
            const isSel=row.idx===selectedIdx;
            const noCalled=!row.call;
            return(
              <tr key={row.idx} onClick={()=>row.call&&onSelect(row.idx)} style={{cursor:row.call?"pointer":"default",background:isSel?"#f0f9ff":noCalled?"#fafafa":"#fff",opacity:noCalled?0.4:1,transition:"background .1s"}}>
                <td style={{padding:"4px 8px",fontSize:10,textAlign:"center",borderBottom:"1px solid #f3f4f6",color:"#9ca3af",fontWeight:500}}>{row.idx+1}</td>
                <td style={{padding:"4px 6px",fontSize:10,textAlign:"center",borderBottom:"1px solid #f3f4f6",fontFamily:"'SF Mono',Menlo,monospace",fontVariantNumeric:"tabular-nums"}}>{row.pX.toFixed(3)}</td>
                <td style={{padding:"4px 6px",fontSize:10,textAlign:"center",borderBottom:"1px solid #f3f4f6",fontFamily:"'SF Mono',Menlo,monospace",fontVariantNumeric:"tabular-nums"}}>{row.pZ.toFixed(3)}</td>
                <td style={{padding:"4px 6px",fontSize:10,textAlign:"center",borderBottom:"1px solid #f3f4f6",fontWeight:600,color:noCalled?"#d1d5db":row.call==="strike"?red:green}}>{noCalled?row.rawCall||"—":row.call==="strike"?"STR":"BALL"}</td>
                <td style={{padding:"4px 6px",fontSize:10,textAlign:"center",borderBottom:"1px solid #f3f4f6",color:"#6b7280"}}>{row.type||"—"}</td>
                <td style={{padding:"4px 6px",fontSize:10,textAlign:"center",borderBottom:"1px solid #f3f4f6",color:"#6b7280"}}>{row.speed||"—"}</td>
                <td style={{padding:"4px 6px",fontSize:10,textAlign:"center",borderBottom:"1px solid #f3f4f6",fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{row.conf!=null?`${row.conf}%`:"—"}</td>
                <td style={{padding:"4px 6px",fontSize:10,textAlign:"center",borderBottom:"1px solid #f3f4f6",fontWeight:700,color:row.verdict==="CHALLENGE"?green:row.verdict==="HOLD"?red:row.verdict==="CLOSE"?yellow:"#d1d5db"}}>{noCalled?"—":row.verdict||"—"}</td>
                <td style={{padding:"4px 6px",fontSize:10,textAlign:"center",borderBottom:"1px solid #f3f4f6",fontVariantNumeric:"tabular-nums",fontFamily:"'SF Mono',Menlo,monospace"}}>{row.dRE!=null?row.dRE.toFixed(3):"—"}</td>
              </tr>
            );
          })}</tbody>
        </table>
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

          {/* Break-even meter */}
          {r.rel&&<div style={{textAlign:"center",flexShrink:0}}>
            <div style={{fontSize:8,fontWeight:500,color:"#9ca3af",textTransform:"uppercase",letterSpacing:.5,marginBottom:3}}>Break-Even</div>
            <ConfidenceNum thresh={r.transBE}/>
          </div>}
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
          <div style={{fontSize:10,color:"#9ca3af",marginTop:8}}>This transition break-even: {r.transBE}% <span style={{color:"#c4c8cd"}}>·</span> 0.20 cost ÷ ({fmt(Math.abs(r.pD))} swing + 0.20 cost){"\n"}Tango game-state threshold: {r.thresh}% <span style={{color:"#c4c8cd"}}>·</span> published lookup for this count/bases/outs</div>
        </div>
      )}
    </div>
  );
}

function ConfidenceNum({thresh}){
  // Same palette as RE matrix: rgb(214,48,49) red, rgb(33,102,172) blue
  const t=Math.min(Math.abs(thresh-50)/40,1);
  const warm=thresh>52;
  const cool=thresh<48;
  const color=warm?`rgb(${Math.round(55+(214-55)*t)},${Math.round(65-(65-48)*t)},${Math.round(81-(81-49)*t)})`
    :cool?`rgb(${Math.round(55-(55-33)*t)},${Math.round(65+(102-65)*t)},${Math.round(81+(172-81)*t)})`
    :"#374151";
  return(
    <div style={{textAlign:"center",flexShrink:0}}>
      <div style={{fontSize:22,fontWeight:700,color,fontVariantNumeric:"tabular-nums",letterSpacing:-.5,lineHeight:1}}>{thresh}%</div>
      
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
                  if(st+1<=2){const nc=`${bl}-${st+1}`;const nr=data[b.key][nc];if(nr!==undefined)d=nr-re;}
                  else if(st===2){/* b2s on x-2 = strikeout */const newOuts=mOuts+1;d=newOuts>=3?-re:(RE[newOuts]?.[b.key]?.["0-0"]??re)-re;}
                  return(<td key={c} style={{padding:"5px 3px",textAlign:"center",fontSize:11,fontWeight:600,borderBottom:"1px solid #f3f4f6",background:dColor(d),color:d!=null?dText(d):"#d1d5db",fontVariantNumeric:"tabular-nums"}}>{d!=null?`${d>0?"+":""}${d.toFixed(2)}`:"—"}</td>);
                })}
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
      <p style={{marginTop:8,fontSize:11,color:"#9ca3af",lineHeight:1.6,padding:"0 4px"}}>{mView==="re"?"Expected runs from this state through end of half-inning. Blue = pitcher-favorable, Red = hitter-favorable.":mView==="rv"?"Marginal run value relative to the 0-0 count in each base-out state. Blue = pitcher's count, Red = hitter's count. Note: 3-2 is the only count that switches — it is a hitter's count in most states but becomes a pitcher's count with runners on 2nd & 3rd (the walk/strikeout outcome probabilities interact differently depending on the base-out state).":"RE change if the next pitch is called a ball but overturned to a strike. Blue = favors defense, Red = favors offense."}</p>
    </div>
  );
}

// ============================================================
// THRESHOLD MATRIX
// ============================================================
function ThresholdMatrix(){
  const[tOuts,setTOuts]=useState(0);
  const seg=(active)=>({padding:"5px 14px",borderRadius:7,fontSize:12,fontWeight:active?600:400,cursor:"pointer",border:"none",background:active?"#111827":"#f3f4f6",color:active?"#fff":"#6b7280",transition:"all .15s",fontFamily:"inherit"});
  // Color: same as ConfidenceNum — red(high,challenge) → black(mid) → blue(low,hold)
  const threshColor=(v)=>{
    const t=Math.min(Math.abs(v-50)/40,1);
    if(v>52)return`rgb(${Math.round(55+(214-55)*t)},${Math.round(65-(65-48)*t)},${Math.round(81-(81-49)*t)})`;
    if(v<48)return`rgb(${Math.round(55-(55-33)*t)},${Math.round(65+(102-65)*t)},${Math.round(81+(172-81)*t)})`;
    return"#374151";
  };
  // Background: same dColor gradient as RE matrix
  const threshBg=(v)=>{
    const t=Math.min(Math.abs(v-50)/45,1);
    if(v>=50)return`rgb(${Math.round(255-(255-214)*t)},${Math.round(255-(255-48)*t)},${Math.round(255-(255-49)*t)})`;
    return`rgb(${Math.round(255-(255-33)*t)},${Math.round(255-(255-102)*t)},${Math.round(255-(255-172)*t)})`;
  };
  const threshText=(v)=>{const t=Math.min(Math.abs(v-50)/45,1);return t>0.55?"#fff":t>0.3?"#374151":"#374151";};
  return(
    <div>
      <div className="mx-controls" style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:10,padding:"10px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:11,fontWeight:500,color:"#6b7280"}}>Outs</span><div style={{display:"flex",gap:3}}>{[0,1,2].map(o=><button key={o} onClick={()=>setTOuts(o)} style={seg(tOuts===o)}>{o}</button>)}</div></div>
        <div style={{flex:1}}/>
        <div style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:"#9ca3af"}}><span>Challenge</span><div style={{width:60,height:6,borderRadius:3,background:"linear-gradient(90deg,rgb(33,102,172),#fff,rgb(214,48,49))"}}/>
          <span>Hold</span></div>
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
                  const[bl,st]=c.split("-").map(Number);
                  const v=getTangoThresh(b.key,tOuts,bl,st);
                  return(<td key={c} style={{padding:"5px 3px",textAlign:"center",fontSize:11,fontWeight:600,borderBottom:"1px solid #f3f4f6",background:threshBg(v),color:threshText(v),fontVariantNumeric:"tabular-nums"}}>{v}%</td>);
                })}
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
      <p style={{marginTop:8,fontSize:11,color:"#9ca3af",lineHeight:1.6,padding:"0 4px"}}>Minimum confidence needed to justify a challenge (Tango, Feb 2025). Blue = low bar, challenge-friendly — even a small hunch is enough. Red = high bar, hold unless certain.</p>
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
  const tangoCBA="https://tangotiger.com/index.php/site/article/cost-benefit-analysis-of-making-an-abs-challenge";
  const link={color:"#2563eb",textDecoration:"none",fontWeight:500,borderBottom:"1px solid rgba(37,99,235,.3)"};
  return(
    <div style={{maxWidth:680}}>
      <div style={s}><div style={h}>Decision Framework</div><p style={p}>The challenge decision compares the run value of flipping a call (the benefit) against the cost of using up a challenge (the cost). Per <a href={tangoCBA} target="_blank" rel="noopener noreferrer" style={link}>Tango's cost/benefit analysis</a> using 2025 AAA data, the average value of an overturned call is about 0.20 runs — and this holds remarkably flat across innings and challenge inventory (1 vs 2 remaining).</p><div style={code}>benefit = |ΔRE| of flipping the call<br/>cost = ~0.20 runs (empirical, from AAA challenge data)<br/><br/>Break-even = cost / (benefit + cost)<br/>CHALLENGE when your confidence {"≥"} break-even</div></div>

      <div style={s}><div style={h}>Challenge Thresholds (Tango, Feb 2025)</div><p style={p}>The engine uses Tom Tango's published break-even confidence thresholds for ABS challenges. For each combination of bases, outs, balls, and strikes, the table gives the minimum confidence you'd need that the call was wrong in order to justify spending a challenge. Thresholds range from 10% (loaded, 2 outs, full count — challenge on a hunch) to 88% (empty, 0 outs, 0-2 — hold unless certain).</p><p style={{...p,marginTop:8}}>A key insight: the threshold depends only on count and base-out state, not inning or score. Because the cost of a challenge (~0.20 runs) stays flat regardless of game situation, leverage index scales both sides of the equation equally and cancels out.</p></div>

      <div style={s}><div style={h}>Count-Level Run Expectancy (RE288)</div><p style={p}>288 cells across 12 counts × 8 base states × 3 out states, following the <a href={tangoUrl} target="_blank" rel="noopener noreferrer" style={link}>RE288 framework developed by Tom Tango</a>. Values are computed recursively: the RE at each count state is derived from the transition probabilities (ball, called strike, foul, in-play) and the resulting RE of the next state, anchored to empirical RE24 values at plate appearance endpoints. This assumes the same run expectancy for an event (single, HR, etc.) regardless of count — a simplification Tango notes is reasonable given empirical evidence.</p><p style={{...p,marginTop:8}}>The matrix tab includes three views: Run Expectancy (absolute RE from each state), Run Values (marginal RE relative to the 0-0 count in each base-out state — <a href={tangoUrl} target="_blank" rel="noopener noreferrer" style={link}>Tango's "second chart"</a>), and Count Δ (RE shift when a ball is overturned to a strike, which drives the challenge model). A key insight from the Run Values view: the 3-2 count is the only count that flips between hitter's and pitcher's count depending on base-out state.</p></div>

      <div style={s}><div style={h}>Terminal Transitions (K / BB)</div><p style={p}>Overturning a pitch doesn't always produce another count — it can end the plate appearance. On any x-2 count, overturning a ball to a strike produces a strikeout: the batter is out, runners stay, and RE drops to the new base-out state at 0-0 (or zero if it's the third out). On any 3-x count, overturning a strike to a ball produces a walk: the batter takes first, forced runners advance, and a bases-loaded walk scores a run. These terminal transitions change the base-out state, not just the count, and are modeled explicitly.</p></div>

      <div style={s}><div style={h}>Live Game Integration</div><p style={p}>When connected to a live game, the engine polls the MLB Stats API linescore endpoint every 5 seconds, parsing count, outs, base runners, inning, and score. When the game state changes (new pitch, new batter, inning change), it fetches the full feed/live endpoint to extract Statcast pitch coordinates (pX, pZ, strikeZoneTop, strikeZoneBottom), pitch type, and velocity. Only called balls and called strikes trigger the zone card — swings and fouls keep the previous called pitch visible. This on-demand approach avoids polling the ~2MB feed/live response every cycle, fetching it only when a new pitch actually lands.</p></div>

      <div style={s}><div style={h}>Matchup Adjustment</div><p style={p}>The engine preloads season xwOBA for all players from Baseball Savant (via a serverless API endpoint) with a statsapi fallback. For each at-bat, it computes a matchup multiplier that scales ΔRE to reflect how the current batter-pitcher pairing compares to league average. This is our addition on top of Tango's base framework, which treats all matchups equally.</p><div style={code}>batterFactor = batterXwOBA / leagueXwOBA<br/>pitcherFactor = pitcherXwOBA_against / leagueXwOBA<br/>matchupMultiplier = batterFactor × pitcherFactor<br/>adjustedΔRE = ΔRE × matchupMultiplier</div><p style={{...p,marginTop:8}}>A league-average matchup produces a multiplier of ~1.0×, leaving the challenge decision unchanged. An elite hitter facing a bad pitcher can push ×1.3+, meaning the same base-out state swing is worth 30% more runs — lowering the break-even confidence threshold. A weak hitter vs. an ace compresses ΔRE, raising the bar for when to challenge. The multiplier is clamped to [0.5, 2.0] to prevent extreme small-sample distortions.</p></div>

      <div style={s}><div style={h}>Strike Zone Confidence Model</div><p style={p}>The zone card uses a Gaussian confidence model to estimate the probability a call was wrong, given the measured pitch location. The effective zone width accounts for the ball diameter: Statcast pX/pZ measure ball center, and a pitch is a strike if any part of the ball crosses any part of the plate, so the zone boundary for ball-center coordinates is (17" + 2.9") / 2 = 9.95" from center. Hawk-Eye/Statcast accuracy is approximately ±0.5 inches; combined with zone definition uncertainty, we model total measurement error as σ = 1.0 inch. For a called strike, confidence = P(pitch truly outside zone) = Φ(distance / σ). For a called ball, confidence = P(pitch truly inside zone) = 1 - Φ(distance / σ). Confidence is capped at 5–95% since tracking systems are never perfect. The verdict compares this confidence against the Tango threshold for the current count/bases/outs — CHALLENGE if conf ≥ threshold, HOLD otherwise.</p><div style={code}>Zone half-width = (17 + 2.9) / 2 / 12 = 0.829 ft<br/>σ = 1.0" (Hawk-Eye ±0.5" + zone uncertainty)<br/>P(outside) = Φ(dist_inches / σ)    // normal CDF<br/>Batter challenges called strike → conf = P(outside)<br/>Catcher challenges called ball → conf = P(inside) = 1 - P(outside)<br/>CHALLENGE when conf ≥ Tango threshold</div></div>

      <div style={s}><div style={h}>Demo Mode</div><p style={p}>The demo walkthrough features 8 real called pitches from the 2025 World Series Game 7 (LAD 5, TOR 4, 11 innings). Pitch coordinates are actual Statcast data from the MLB Stats API feed/live endpoint for gamePk 813024. Scenarios were selected for game impact — ump scorecard's top missed calls, high-leverage extras situations, and series-ending at-bats — not proximity to the zone edge. Player xwOBA values are 2025 season figures from Baseball Savant.</p></div>

      <div style={s}><div style={h}>How to Get Pitch Data</div>
        <div style={{marginBottom:12}}>
          <div style={{fontSize:13,fontWeight:600,color:"#374151",marginBottom:4}}>MLB: Baseball Savant (Statcast)</div>
          <ol style={{...p,paddingLeft:20,margin:0}}>
            <li>Go to baseballsavant.mlb.com/statcast_search</li>
            <li>Set filters: Season, Game Date, optionally Pitch Result / Team / Pitcher</li>
            <li>Click Search, then Download CSV</li>
            <li>CSV includes: plate_x, plate_z, sz_top, sz_bot, description, balls, strikes, outs_when_up, on_1b, on_2b, on_3b, inning, inning_topbot, batter, pitcher</li>
            <li>Upload directly — the engine accepts all Statcast column names as aliases</li>
          </ol>
        </div>
        <div style={{marginBottom:12}}>
          <div style={{fontSize:13,fontWeight:600,color:"#374151",marginBottom:4}}>College/MiLB: Trackman V3</div>
          <ol style={{...p,paddingLeft:20,margin:0}}>
            <li><b>Via FTP/FileZilla:</b> Programs with a V3 unit get automatic CSV uploads after each game. Use the /verified folder for quality-checked data.</li>
            <li><b>Request from DataDesk:</b> Email datadesksupervisors@trackman.com with organization, date, and session time.</li>
            <li><b>Via 643 Charts (Trackman SYNC):</b> Export pitch data directly from the SYNC interface if your program has the integration.</li>
            <li>Upload the CSV to the engine.</li>
          </ol>
        </div>
        <div style={{...code,fontSize:11,lineHeight:1.6}}>
          <div style={{fontWeight:600,marginBottom:4}}>What V3 CSVs include:</div>
          PlateLocSide, PlateLocHeight, PitchCall, Balls, Strikes, Outs,<br/>
          Pitcher, Batter, Catcher, TaggedPitchType, RelSpeed, Inning, Top/Bottom
        </div>
        <div style={{background:"#fef3c7",border:"1px solid #fde68a",borderRadius:8,padding:"10px 12px",marginTop:10,fontSize:12,color:"#92400e",lineHeight:1.6}}>
          <b>V3 CSVs do NOT include:</b><br/>
          Per-batter strike zone boundaries — engine defaults to 3.5 / 1.6 ft, editable in UI<br/>
          Base runners — add on_1b, on_2b, on_3b from scorebook for full RE analysis<br/>
          Umpire name — add manually if needed for future umpire scouting features
        </div>
      </div>

      <div style={s}><div style={h}>Limitations & Next Steps</div><p style={p}>The matchup adjustment uses season xwOBA from Statcast, which strips out defense and luck but doesn't yet capture platoon splits (L/R advantages), recent form, or pitch-type matchup edges. A production system would incorporate rolling xwOBA windows, platoon splits, and potentially batter hot/cold zones against specific pitch types. Trackman data can also be consumed via websocket or CSV for NCAA/college environments where ABS is being adopted.</p></div>

      <div style={{...s,background:"#f9fafb"}}><div style={{...h,fontSize:13}}>Data Sources</div><p style={{...p,fontSize:12}}>RE288 matrix computed recursively per <a href={tangoUrl} target="_blank" rel="noopener noreferrer" style={{...link,fontSize:12}}>Tango (2018)</a>, using 2010–2015 Retrosheet play-by-play data. Challenge thresholds per <a href={tangoCBA} target="_blank" rel="noopener noreferrer" style={{...link,fontSize:12}}>Tango (Feb 2025)</a>, validated against 2025 AAA challenge data. The RE288 framework and the concept of count-level run values are one of Tango's many contributions to modern sabermetrics. Methodology follows Tango, Lichtman & Dolphin, "The Book: Playing the Percentages in Baseball." Live game data from MLB Stats API (statsapi.mlb.com). xwOBA data from Baseball Savant (baseballsavant.mlb.com).</p></div>
    </div>
  );
}

