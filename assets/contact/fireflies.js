(() => {
  'use strict';
  const canvas = document.querySelector('[data-st-fireflies]');
  const ctx = canvas?.getContext('2d');
  if (!ctx) return;
  // Tune counts, palette, halo size and cursor reach here. No form handlers are involved.
  const settings = { desktop:20, mobile:8, stationary:5, reach:125, halo:13, color:'198,161,106' };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 700px)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const pointer = { x:0, y:0, active:false };
  let width=0, height=0, particles=[], frame=0, last=0, time=0, alive=true;
  const random = (min,max) => min+Math.random()*(max-min);
  function resize() {
    width=innerWidth; height=innerHeight;
    const dpr=Math.min(devicePixelRatio || 1,1.5);
    canvas.width=Math.round(width*dpr); canvas.height=Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const count=reduced.matches?settings.stationary:mobile.matches?settings.mobile:settings.desktop;
    while(particles.length<count) particles.push({x:random(12,Math.max(12,width-12)),y:random(12,Math.max(12,height-12)),vx:0,vy:0,phase:random(0,Math.PI*2),speed:random(3,8),radius:random(.7,1.5),brightness:random(.35,.65),near:0,trail:[]});
    particles.length=count;
    particles.forEach(p=>{p.x=Math.max(12,Math.min(width-12,p.x));p.y=Math.max(12,Math.min(height-12,p.y));p.trail=[];});
    draw(0);
  }
  function glow(x,y,r,alpha) {
    const g=ctx.createRadialGradient(x,y,0,x,y,r);
    g.addColorStop(0,`rgba(255,226,170,${alpha})`);
    g.addColorStop(.12,`rgba(${settings.color},${alpha*.65})`);
    g.addColorStop(.4,`rgba(215,163,81,${alpha*.16})`);
    g.addColorStop(1,'rgba(198,161,106,0)');
    ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);
  }
  function draw(dt) {
    ctx.clearRect(0,0,width,height);
    for(const p of particles) {
      const dx=p.x-pointer.x,dy=p.y-pointer.y,distance=Math.hypot(dx,dy);
      const proximity=pointer.active&&fine.matches&&!reduced.matches?Math.max(0,1-distance/settings.reach):0;
      p.near+=(proximity-p.near)*Math.min(1,dt*4);
      if(dt) {
        const angle=time*.23+p.phase;
        let tx=Math.cos(angle)*p.speed,ty=Math.sin(angle*.8+p.phase)*p.speed*.7;
        if(proximity) {tx+=dx/Math.max(distance,1)*proximity*24;ty+=dy/Math.max(distance,1)*proximity*24;}
        // Soft inward steering avoids wrapping or sudden jumps at viewport edges.
        tx+=Math.max(0,40-p.x)*.6-Math.max(0,p.x-width+40)*.6;
        ty+=Math.max(0,40-p.y)*.6-Math.max(0,p.y-height+40)*.6;
        p.vx+=(tx-p.vx)*Math.min(1,dt*1.5);p.vy+=(ty-p.vy)*Math.min(1,dt*1.5);
        p.x=Math.max(8,Math.min(width-8,p.x+p.vx*dt));p.y=Math.max(8,Math.min(height-8,p.y+p.vy*dt));
        p.trail=p.trail.filter(t=>(t.life-=dt)>0);
        if(p.near>.08) {p.trail.push({x:p.x,y:p.y,life:.28});if(p.trail.length>10)p.trail.shift();}
      }
      for(const t of p.trail)glow(t.x,t.y,settings.halo*.6,t.life/.28*.05);
      const pulse=reduced.matches?1:.78+.22*Math.sin(time*.8+p.phase);
      glow(p.x,p.y,settings.halo*p.radius,(p.brightness+p.near*.22)*pulse);
    }
  }
  function tick(now) {
    frame=0;
    if(!alive||document.hidden||reduced.matches)return;
    const dt=last?Math.min((now-last)/1000,.05):0;last=now;time+=dt;draw(dt);
    frame=requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame);frame=0;last=0;pointer.active=false;
    if(alive&&!document.hidden&&!reduced.matches)frame=requestAnimationFrame(tick);
    else if(alive)draw(0);
  }
  const abort=new AbortController(),options={signal:abort.signal,passive:true};
  window.addEventListener('pointermove',e=>{pointer.active=e.pointerType==='mouse';pointer.x=e.clientX;pointer.y=e.clientY;},options);
  document.documentElement.addEventListener('pointerleave',()=>{pointer.active=false;},options);
  window.addEventListener('blur',()=>{pointer.active=false;},options);
  window.addEventListener('resize',resize,options);
  document.addEventListener('visibilitychange',sync,options);
  reduced.addEventListener('change',()=>{resize();sync();},options);
  mobile.addEventListener('change',resize,options);
  window.addEventListener('pagehide',e=>{alive=false;cancelAnimationFrame(frame);frame=0;last=0;if(!e.persisted)abort.abort();},options);
  window.addEventListener('pageshow',()=>{alive=true;sync();},options);
  resize();sync();
})();
