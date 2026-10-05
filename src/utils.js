export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const lerp=(a,b,t)=>a+(b-a)*t;
export const moveToward=(v,t,d)=>v<t?Math.min(v+d,t):Math.max(v-d,t);
export const rand=(a=0,b=1)=>a+Math.random()*(b-a);
export const randi=(a,b)=>Math.floor(rand(a,b+1));
export const choice=a=>a[Math.floor(Math.random()*a.length)];
export const sign=v=>v<0?-1:1;
export const len=(x,y)=>Math.hypot(x,y);
export const norm=(x,y)=>{const l=Math.hypot(x,y)||1;return{x:x/l,y:y/l}};
export const dist=(a,b,c,d)=>typeof a==='number'?Math.hypot(a-c,b-d):Math.hypot(a.x-b.x,a.y-b.y);
export const angleTo=(a,b)=>Math.atan2(b.y-a.y,b.x-a.x);
export const circleHit=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y)<=a.r+b.r;
export const circleRectHit=(c,r)=>{const x=clamp(c.x,r.x-r.w/2,r.x+r.w/2),y=clamp(c.y,r.y-r.h/2,r.y+r.h/2);return (c.x-x)**2+(c.y-y)**2<=c.r**2};
export const aabbHit=(a,b)=>Math.abs(a.x-b.x)*2<a.w+b.w&&Math.abs(a.y-b.y)*2<a.h+b.h;
export function rgba(hex,a=1){if(hex.startsWith('rgba')||hex.startsWith('rgb'))return hex;let h=hex.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');const n=parseInt(h,16);return`rgba(${n>>16},${(n>>8)&255},${n&255},${a})`}
export function ellipse(ctx,x,y,rx,ry,fill,rot=0){ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.scale(rx,ry);ctx.beginPath();ctx.arc(0,0,1,0,Math.PI*2);ctx.restore();ctx.fillStyle=fill;ctx.fill()}
export function line(ctx,x1,y1,x2,y2,color,width=2){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
export function poly(ctx,pts,fill){if(!pts.length)return;ctx.fillStyle=fill;ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);ctx.closePath();ctx.fill()}
export function text(ctx,s,x,y,size=20,color='#fff',align='left',weight=900){ctx.fillStyle=color;ctx.font=`${weight} ${size}px system-ui, sans-serif`;ctx.textAlign=align;ctx.textBaseline='alphabetic';ctx.fillText(s,x,y)}
export function roundRect(ctx,x,y,w,h,r,fill,stroke=null,lw=1){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke()}}
export const normalize=norm;
export const drawRoundRect=roundRect;
export function noise1(x){const s=Math.sin(x*12.9898)*43758.5453;return s-Math.floor(s)}
