(function(root){
const E=typeof module!=='undefined'?require('./engine.js'):root.Engine;
function kungFuDemo(){
  const ground=E.layer('line',1);
  ground.name='Dojo floor';
  Object.assign(ground.keys[0],{x:480,y:435,color:'#b8c4ab',width:2,points:[{x:-350,y:0,parent:-1},{x:350,y:0,parent:0}]});
  const poses={
    guard:[-90,-90,30,-80,-20,-75,135,110,50,60],
    loadPunch:[-100,-95,20,-80,55,-135,135,110,50,60],
    punch:[-75,-85,25,-75,-20,-10,135,110,50,60],
    headHit:[-112,-120,15,-70,-35,-100,135,110,50,60],
    stagger:[-103,-105,45,-65,0,-80,135,110,50,60],
    chamber:[-100,-95,20,-75,-35,-100,120,95,-100,60],
    kick:[-105,-100,30,-65,-60,-100,125,100,-35,-10],
    bodyHit:[-60,-70,15,-45,30,-90,135,110,50,60],
    recover:[-80,-85,30,-70,-10,-65,135,110,50,60]
  };
  const skeleton=E.stick();
  const length=i=>{const a=skeleton[i],b=skeleton[a.parent];return Math.hypot(a.x-b.x,a.y-b.y);};
  // Solve a two-bone chain to an exact target without changing either bone length.
  function reach(p,mid,end,target,bend){
    const start=p.points[p.points[mid].parent],dx=target.x-start.x,dy=target.y-start.y;
    const a=length(mid),b=length(end),distance=Math.hypot(dx,dy);
    const d=Math.max(Math.abs(a-b)+.0001,Math.min(a+b-.0001,distance));
    const theta=Math.atan2(dy,dx),offset=Math.acos(Math.max(-1,Math.min(1,(a*a+d*d-b*b)/(2*a*d))));
    const angle=theta+bend*offset;
    p.points[mid].x=start.x+a*Math.cos(angle);p.points[mid].y=start.y+a*Math.sin(angle);
    p.points[end].x=start.x+Math.cos(theta)*d;p.points[end].y=start.y+Math.sin(theta)*d;
  }
  function fighter(name,color,fill,direction,sequence){
    const l=E.layer('stick',1),base=E.clone(l.keys[0]);
    Object.assign(l,{name,easing:'smooth',lockLengths:true,keys:{}});
    for(const [frame,x,pose,anchor=x] of sequence){
      const p=E.clone(base),angles=poses[pose];p.points=E.clone(skeleton);
      for(let i=1;i<p.points.length;i++){
        const q=p.points[i],origin=p.points[q.parent],angle=angles[i-1]*Math.PI/180;
        q.x=origin.x+direction*Math.cos(angle)*length(i);q.y=origin.y+Math.sin(angle)*length(i);
      }
      const kicking=['chamber','kick'].includes(pose),scale=1.2;
      // Keep supporting feet planted while the hips transfer weight into a strike.
      const rear=anchor-direction*52,front=anchor+direction*52;
      const maxDx=kicking?Math.abs(rear-x):Math.max(Math.abs(rear-x),Math.abs(front-x));
      const reachLength=(length(7)+length(8))*scale-1;
      const y=Math.max(345,435-Math.sqrt(Math.max(1,reachLength*reachLength-maxDx*maxDx))+1);
      Object.assign(p,{x,y,scale,width:8,color,fillEnabled:true,fillColor:fill});
      reach(p,7,8,{x:(rear-x)/scale,y:(435-y)/scale},-direction);
      if(!kicking)reach(p,9,10,{x:(front-x)/scale,y:(435-y)/scale},-direction);
      l.keys[frame]=p;
    }
    return l;
  }
  const jade=fighter('Jade · Tiger style','#305a45','#d5e4bc',1,[
    [0,390,'guard'],[12,405,'guard'],[19,420,'loadPunch',410],[21,423,'loadPunch',410],
    [24,435,'punch',410],[30,430,'punch',410],[36,410,'guard'],[45,405,'guard'],
    [56,405,'guard'],[57,405,'guard'],[62,383,'headHit',405],[69,378,'stagger'],[80,405,'guard'],
    [91,435,'chamber',440],[95,440,'chamber',440],[100,465,'kick',440],[106,465,'kick',440],
    [112,440,'chamber',440],[122,415,'guard'],[137,410,'guard'],[144,410,'guard'],
    [145,410,'guard'],[150,385,'bodyHit',410],[157,378,'stagger'],[170,390,'recover'],[191,390,'guard']
  ]);
  const ember=fighter('Ember · Crane style','#ac573f','#f3d4b1',-1,[
    [0,570,'guard'],[12,565,'guard'],[24,565,'guard'],[25,565,'guard'],
    [30,589,'headHit',565],[37,595,'stagger'],[45,570,'guard'],
    [51,551,'loadPunch',565],[53,550,'loadPunch',565],[56,532,'punch',550],
    [62,532,'punch',550],[69,558,'guard'],[80,565,'guard'],[100,565,'guard'],[101,565,'guard'],
    [106,590,'bodyHit',565],[114,598,'stagger'],[126,562,'guard'],
    [135,537,'chamber',537],[139,535,'chamber',537],[144,510,'kick',537],[150,510,'kick',537],
    [156,535,'chamber',537],[166,555,'recover'],[178,570,'guard'],[191,570,'guard']
  ]);
  const world=(p,q)=>({x:p.x+q.x*p.scale,y:p.y+q.y*p.scale});
  const hits=[
    {frame:24,attacker:jade,defender:ember,mid:5,end:6,target:'head',reaction:30},
    {frame:56,attacker:ember,defender:jade,mid:5,end:6,target:'head',reaction:62},
    {frame:100,attacker:jade,defender:ember,mid:9,end:10,target:'body',reaction:106},
    {frame:144,attacker:ember,defender:jade,mid:9,end:10,target:'body',reaction:150}
  ];
  for(const hit of hits){
    const p=hit.attacker.keys[hit.frame],defender=hit.defender.keys[hit.frame],direction=p.x<defender.x?1:-1;
    const q=hit.target==='head'?world(defender,defender.points[2]):world(defender,{x:defender.points[1].x*.55,y:defender.points[1].y*.55});
    q.x-=direction*(hit.target==='head'?20*defender.scale:4);
    reach(p,hit.mid,hit.end,{x:(q.x-p.x)/p.scale,y:(q.y-p.y)/p.scale},direction);
    // Brief contact hold, then a quick retraction while the opponent staggers.
    hit.attacker.keys[hit.frame+1]=E.clone(p);
    hit.attacker.keys[hit.frame+3]=E.clone(p);
    const next=hit.attacker.keys[hit.frame+6];
    if(next){const angles=poses[hit.end===6?'guard':'chamber'];for(const i of [hit.mid,hit.end]){const origin=next.points[next.points[i].parent],angle=angles[i-1]*Math.PI/180;next.points[i].x=origin.x+direction*Math.cos(angle)*length(i);next.points[i].y=origin.y+Math.sin(angle)*length(i);}}
  }
  return {format:'tisfat-browser',version:1,title:'Kung fu · Tiger & Crane',fps:24,duration:192,background:'#fbfaf7',layers:[ground,jade,ember],demoHits:hits.map(h=>({frame:h.frame,attacker:h.attacker.id,defender:h.defender.id,end:h.end,target:h.target,reaction:h.reaction}))};
}
if(typeof module!=='undefined')module.exports=kungFuDemo;else root.kungFuDemo=kungFuDemo;
})(globalThis);
