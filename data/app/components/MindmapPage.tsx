'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { AppData, NavSection } from '../types';

interface Props {
  data: AppData;
  completed: Set<string>;
  setActiveSection: (s: NavSection) => void;
}

interface CNode { id:string; label:string; sublabel?:string; x:number; y:number; type:'root'|'phase'|'topic'; resourceIds:string[]; section?:NavSection; }
interface CEdge { from:string; to:string; }

// ── Layout constants ──────────────────────────────────────────────────────────
const CX     = 1150;    // canvas centre
const CY     = 1150;
const R1     = 390;     // root → phase distance
const R2     = 750;     // root → topic distance
const CANVAS = 2500;    // canvas px (square)

// Node sizes — wide enough so text never clips
const NW: Record<string,number> = { root:164, phase:188, topic:208 };
const NH: Record<string,number> = { root:64,  phase:60,  topic:44  };

// Max angular spread per phase group (phases are 60° apart → 52° safe)
const MAX_SPREAD  = 52 * Math.PI / 180;
// Preferred angular gap between adjacent topics
const PREF_STEP   = 11 * Math.PI / 180;
// Minimum gap so topics don't touch
const MIN_STEP    =  7 * Math.PI / 180;

// ── Helpers ───────────────────────────────────────────────────────────────────
function rectEdge(cx:number,cy:number,w:number,h:number,angle:number){
  const hw=w/2,hh=h/2,cos=Math.cos(angle),sin=Math.sin(angle);
  if(Math.abs(cos)<1e-9) return {x:cx,y:cy+hh*Math.sign(sin)};
  if(Math.abs(sin)<1e-9) return {x:cx+hw*Math.sign(cos),y:cy};
  const t=Math.min(hw/Math.abs(cos),hh/Math.abs(sin));
  return {x:cx+t*cos,y:cy+t*sin};
}

function getPct(rids:string[],completed:Set<string>){
  if(!rids.length) return -1;
  return Math.round(rids.filter(id=>completed.has(id)).length/rids.length*100);
}

function trunc(s:string,n=34){ return s.length>n ? s.slice(0,n)+'…' : s; }

// ── Build graph ───────────────────────────────────────────────────────────────
function buildGraph(data:AppData){
  const nodes:CNode[]=[], edges:CEdge[]=[];

  const phases=[
    {id:'phase-1',title:'Mathematics',    ph:1,sec:'math'         as NavSection, topics:data.mathematics.topics.map(t=>({id:t.id,label:t.title,rids:t.resources.map(r=>r.id)})),         rids:data.mathematics.topics.flatMap(t=>t.resources.map(r=>r.id))},
    {id:'phase-2',title:'Python & Tools', ph:2,sec:'python'       as NavSection, topics:data.pythonML.topics.map(t=>({id:t.id,label:t.title,rids:t.resources.map(r=>r.id)})),            rids:data.pythonML.topics.flatMap(t=>t.resources.map(r=>r.id))},
    {id:'phase-3',title:'Machine Learning',ph:3,sec:'ml'          as NavSection, topics:data.machineLearning.courses.map(c=>({id:c.id,label:trunc(c.name),rids:[c.id]})),               rids:data.machineLearning.courses.map(c=>c.id)},
    {id:'phase-4',title:'Deep Learning',  ph:4,sec:'deeplearning' as NavSection, topics:data.deepLearning.courses.map(c=>({id:c.id,label:trunc(c.name),rids:[c.id]})),                  rids:data.deepLearning.courses.map(c=>c.id)},
    {id:'phase-5',title:'Architectures',  ph:5,sec:'architectures'as NavSection, topics:data.architectures.architectureGroups.map(g=>({id:g.id,label:trunc(g.groupTitle),rids:g.resources.map(r=>r.id)})), rids:data.architectures.architectureGroups.flatMap(g=>g.resources.map(r=>r.id))},
    {id:'books',  title:'Books & Papers', ph:6,sec:'books'        as NavSection,
      topics:[
        ...data.freeBooksAndPapers.books.slice(0,5).map(b=>({id:b.id,label:trunc(b.title),rids:[b.id]})),
        ...data.freeBooksAndPapers.seminalPapers.slice(0,5).map(p=>({id:p.id,label:trunc(p.title),rids:[p.id]})),
      ],
      rids:[...data.freeBooksAndPapers.books.map(b=>b.id),...data.freeBooksAndPapers.seminalPapers.map(p=>p.id)],
    },
  ];

  // Root
  nodes.push({id:'root',label:'0 → AI',sublabel:'Architect Roadmap',x:CX,y:CY,type:'root',resourceIds:[]});

  const N=phases.length;
  const PHASE_STEP=(2*Math.PI)/N;

  phases.forEach((ph,i)=>{
    const phAngle = -Math.PI/2 + i*PHASE_STEP;
    const px=CX+R1*Math.cos(phAngle), py=CY+R1*Math.sin(phAngle);

    nodes.push({id:ph.id,label:ph.title,sublabel:`Phase ${ph.ph}`,x:px,y:py,type:'phase',resourceIds:ph.rids,section:ph.sec});
    edges.push({from:'root',to:ph.id});

    const nt=ph.topics.length;
    if(nt===0) return;

    // Compute per-topic angle step, clamped so total spread ≤ MAX_SPREAD
    const idealStep = Math.min(PREF_STEP, MAX_SPREAD/Math.max(nt-1,1));
    const step      = Math.max(idealStep, MIN_STEP);
    const spread    = step*(nt-1);
    const startA    = phAngle - spread/2;

    ph.topics.forEach((t,ti)=>{
      const ta = nt===1 ? phAngle : startA+ti*step;
      nodes.push({id:t.id,label:t.label,x:CX+R2*Math.cos(ta),y:CY+R2*Math.sin(ta),type:'topic',resourceIds:t.rids,section:ph.sec});
      edges.push({from:ph.id,to:t.id});
    });
  });

  return {nodes,edges};
}

// ── Toolbar button style ──────────────────────────────────────────────────────
const BTN: React.CSSProperties = {
  width:30,height:30,background:'var(--surface)',border:'1px solid var(--border)',
  borderRadius:3,color:'var(--text-secondary)',cursor:'pointer',fontSize:15,
  display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-mono)',
};

// ── Component ─────────────────────────────────────────────────────────────────
export function MindmapPage({data,completed,setActiveSection}:Props){
  const ref = useRef<HTMLDivElement>(null);
  const drag= useRef(false);
  const lp  = useRef({x:0,y:0});
  const [tf,setTf]=useState({x:0,y:0,scale:0.4});

  const {nodes,edges}=buildGraph(data);
  const nm=new Map(nodes.map(n=>[n.id,n]));

  useEffect(()=>{
    if(!ref.current) return;
    const {clientWidth:cw,clientHeight:ch}=ref.current;
    setTf({x:cw/2-CX*0.4, y:ch/2-CY*0.4, scale:0.4});
  },[]);

  const reset=useCallback(()=>{
    if(!ref.current) return;
    const {clientWidth:cw,clientHeight:ch}=ref.current;
    setTf({x:cw/2-CX*0.4,y:ch/2-CY*0.4,scale:0.4});
  },[]);

  const onDown =useCallback((e:React.MouseEvent)=>{drag.current=true;lp.current={x:e.clientX,y:e.clientY};},[]);
  const onMove =useCallback((e:React.MouseEvent)=>{
    if(!drag.current)return;
    const dx=e.clientX-lp.current.x, dy=e.clientY-lp.current.y;
    lp.current={x:e.clientX,y:e.clientY};
    setTf(p=>({...p,x:p.x+dx,y:p.y+dy}));
  },[]);
  const onUp   =useCallback(()=>{drag.current=false;},[]);
  const onWheel=useCallback((e:React.WheelEvent)=>{
    e.preventDefault();
    // Zoom towards cursor
    const rect=ref.current?.getBoundingClientRect();
    if(!rect) return;
    const mx=e.clientX-rect.left, my=e.clientY-rect.top;
    const f=e.deltaY<0?1.12:0.9;
    setTf(p=>{
      const ns=Math.min(Math.max(p.scale*f,0.18),3);
      return {x:mx-(mx-p.x)*(ns/p.scale), y:my-(my-p.y)*(ns/p.scale), scale:ns};
    });
  },[]);

  // Stats
  const allRids=nodes.flatMap(n=>n.resourceIds);
  const done=allRids.filter(id=>completed.has(id)).length;
  const total=allRids.length;
  const overall=total>0?Math.round(done/total*100):0;

  return (
    <div ref={ref} onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp} onWheel={onWheel}
      style={{position:'relative',width:'100%',height:'100%',overflow:'hidden',background:'var(--bg)',cursor:'grab',userSelect:'none'}}>

      {/* Canvas */}
      <div style={{position:'absolute',top:0,left:0,width:CANVAS,height:CANVAS,transform:`translate(${tf.x}px,${tf.y}px) scale(${tf.scale})`,transformOrigin:'0 0'}}>

        {/* SVG edges */}
        <svg style={{position:'absolute',top:0,left:0,width:CANVAS,height:CANVAS,pointerEvents:'none'}}>
          <defs>
            <marker id="dot-done"   markerWidth="4" markerHeight="4" refX="2" refY="2"><circle cx="2" cy="2" r="1.5" fill="rgba(34,197,94,0.7)"/></marker>
            <marker id="dot-active" markerWidth="4" markerHeight="4" refX="2" refY="2"><circle cx="2" cy="2" r="1.5" fill="rgba(99,102,241,0.7)"/></marker>
          </defs>
          {edges.map(edge=>{
            const f=nm.get(edge.from), t=nm.get(edge.to);
            if(!f||!t) return null;
            const angle=Math.atan2(t.y-f.y,t.x-f.x);
            const s=rectEdge(f.x,f.y,NW[f.type],NH[f.type],angle);
            const e2=rectEdge(t.x,t.y,NW[t.type],NH[t.type],angle+Math.PI);
            const p=getPct(t.resourceIds,completed);
            const color=p===100?'rgba(34,197,94,0.55)':p>0?'rgba(99,102,241,0.45)':'rgba(255,255,255,0.06)';
            const sw=edge.from==='root'?1.8:1.2;
            // Gentle bezier: control point pulled toward centre slightly
            const ctrl1x=s.x+(e2.x-s.x)*0.35, ctrl1y=s.y+(e2.y-s.y)*0.35;
            const ctrl2x=s.x+(e2.x-s.x)*0.65, ctrl2y=s.y+(e2.y-s.y)*0.65;
            return <path key={`${edge.from}>${edge.to}`} d={`M${s.x} ${s.y} C${ctrl1x} ${ctrl1y},${ctrl2x} ${ctrl2y},${e2.x} ${e2.y}`} fill="none" stroke={color} strokeWidth={sw}/>;
          })}
        </svg>

        {/* Nodes */}
        {nodes.map(node=>{
          const w=NW[node.type], h=NH[node.type];
          const p=getPct(node.resourceIds,completed);
          const done100=p===100, started=p>0;
          const bdr=done100?'rgba(34,197,94,0.5)':started?'rgba(99,102,241,0.45)':'rgba(255,255,255,0.09)';
          return (
            <div key={node.id}
              onClick={(e)=>{e.stopPropagation();node.section&&setActiveSection(node.section);}}
              style={{
                position:'absolute',left:node.x-w/2,top:node.y-h/2,width:w,height:h,
                background:node.type==='root'?'#111':'var(--surface)',
                border:`1px solid ${bdr}`,
                borderRadius:node.type==='root'?10:4,
                cursor:node.section?'pointer':'default',
                display:'flex',flexDirection:'column',justifyContent:'center',
                padding:node.type==='topic'?'0 12px':'0 14px',
                overflow:'hidden',
                boxShadow:node.type==='root'?'0 0 0 2px var(--accent),0 0 32px rgba(99,102,241,0.18)':
                           node.type==='phase'?'0 2px 12px rgba(0,0,0,0.4)':'0 1px 6px rgba(0,0,0,0.3)',
              }}>

              {/* Phase badge */}
              {node.type==='phase'&&node.sublabel&&(
                <div style={{fontSize:9,color:'var(--text-muted)',fontFamily:'var(--font-mono)',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:2}}>{node.sublabel}</div>
              )}

              {/* Label */}
              <div style={{
                fontSize:node.type==='root'?15:node.type==='phase'?13:11,
                fontWeight:node.type==='root'?700:node.type==='phase'?500:400,
                color:done100?'#22c55e':'var(--text-primary)',
                whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',
                fontFamily:node.type==='root'?'var(--font-mono)':'var(--font-inter)',
                letterSpacing:node.type==='root'?'-0.02em':0,
              }}>
                {node.type==='root'?<>0 <span style={{color:'var(--accent)'}}>→</span> AI</>:node.label}
              </div>

              {/* Root sublabel */}
              {node.type==='root'&&<div style={{fontSize:10,color:'var(--text-muted)',fontFamily:'var(--font-mono)',marginTop:3}}>{node.sublabel}</div>}

              {/* Progress bar */}
              {p>=0&&(
                <div style={{height:2,background:'rgba(255,255,255,0.06)',borderRadius:1,overflow:'hidden',marginTop:node.type==='topic'?4:6}}>
                  <div style={{height:'100%',width:`${p}%`,background:done100?'#22c55e':'var(--accent)',borderRadius:1,transition:'width 0.6s ease'}}/>
                </div>
              )}

              {/* Pct label for phase */}
              {node.type==='phase'&&p>=0&&(
                <div style={{fontSize:9,color:started?'var(--accent)':'var(--text-muted)',fontFamily:'var(--font-mono)',marginTop:2}}>{p}%</div>
              )}
            </div>
          );
        })}
      </div>

      {/* HUD – top left */}
      <div style={{position:'absolute',top:16,left:16,pointerEvents:'none',display:'flex',flexDirection:'column',gap:4}}>
        <div style={{fontSize:11,color:'var(--text-muted)',fontFamily:'var(--font-mono)'}}>Drag · Scroll to zoom · Click to open</div>
        <div style={{fontSize:11,fontFamily:'var(--font-mono)',color:'var(--text-muted)'}}>
          <span style={{color:overall>0?'var(--accent)':'var(--text-muted)'}}>{overall}%</span> · {done}/{total} resources
        </div>
      </div>

      {/* Controls – bottom right */}
      <div style={{position:'absolute',bottom:20,right:20,display:'flex',flexDirection:'column',alignItems:'flex-end',gap:6}}>
        <div style={{display:'flex',gap:5}}>
          <button style={BTN} onClick={()=>setTf(p=>({...p,scale:Math.min(p.scale*1.2,3)}))}>+</button>
          <button style={BTN} onClick={()=>setTf(p=>({...p,scale:Math.max(p.scale/1.2,0.18)}))}>−</button>
          <button style={BTN} onClick={reset} title="Fit all">⊙</button>
        </div>
        <div style={{fontSize:10,color:'var(--text-muted)',fontFamily:'var(--font-mono)'}}>{Math.round(tf.scale*100)}%</div>
      </div>

      {/* Legend – bottom left */}
      <div style={{position:'absolute',bottom:20,left:16,display:'flex',gap:14,pointerEvents:'none'}}>
        {([['rgba(99,102,241,0.5)','in progress'],['rgba(34,197,94,0.55)','complete'],['rgba(255,255,255,0.06)','not started']] as const).map(([c,l])=>(
          <div key={l} style={{display:'flex',alignItems:'center',gap:5}}>
            <div style={{width:22,height:1.5,background:c}}/>
            <span style={{fontSize:10,color:'var(--text-muted)',fontFamily:'var(--font-mono)'}}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
