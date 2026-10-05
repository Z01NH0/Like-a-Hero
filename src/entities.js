import {W,H,FLOOR_Y,ARENA_LEFT,ARENA_RIGHT,TAU} from './constants.js';
import {clamp,lerp,dist,normalize,rand,sign,drawRoundRect} from './utils.js';

export class Projectile{
  constructor(o={}){Object.assign(this,{x:0,y:0,vx:0,vy:0,r:8,damage:1,life:2,gravity:0,owner:'player',style:'pea',pierce:false,destroyEnemyProjectiles:false,breakableByPlayer:false,homing:false,homingStrength:0,homingSpeed:0,floorY:null,age:0,dead:false,hit:false,returning:false,source:null,alpha:1,spin:0,rotation:0,onDeath:null},o)}
  update(dt,g){
    this.age+=dt;this.life-=dt;if(this.life<=0){this.kill(g);return}
    if(this.homing&&g.player&&!g.player.dead){const d=normalize(g.player.x-this.x,g.player.y-this.y);const target=this.homingSpeed||Math.hypot(this.vx,this.vy);const k=clamp(this.homingStrength*dt,0,1);this.vx=lerp(this.vx,d.x*target,k);this.vy=lerp(this.vy,d.y*target,k)}
    if(this.style==='boomerang'&&this.owner==='player'&&this.age>.45){this.returning=true;const dir=this.vx>=0?1:-1;this.vx=lerp(this.vx,-dir*760,clamp(dt*2.9,0,1))}
    this.vy+=this.gravity*dt;this.x+=this.vx*dt;this.y+=this.vy*dt;this.rotation+=dt*(this.style.includes('shuriken')?13:5)*sign(this.vx||1);
    if(this.floorY!=null&&this.y>this.floorY-this.r){this.y=this.floorY-this.r;this.vy=0}
    if(this.style==='grenade'&&this.y>=FLOOR_Y-this.r){this.y=FLOOR_Y-this.r;this.kill(g,true);return}
    if(this.x<-120||this.x>W+120||this.y<-180||this.y>H+180)this.kill(g);
  }
  kill(g,explode=false){if(this.dead)return;this.dead=true;if((explode||this.style==='grenade')&&this.onDeath)this.onDeath(this,g)}
  draw(c){
    const x=this.x,y=this.y,r=this.r;c.save();c.globalAlpha=this.alpha;c.translate(x,y);c.rotate(this.rotation);
    if(this.style==='pea'){c.fillStyle='#85c457';c.strokeStyle='#31532b';c.lineWidth=3;c.beginPath();c.arc(0,0,r,0,TAU);c.fill();c.stroke();c.fillStyle='#d9ef8d';c.beginPath();c.arc(-r*.3,-r*.35,r*.27,0,TAU);c.fill()}
    else if(this.style==='boomerang'){c.strokeStyle='#e74345';c.lineWidth=Math.max(6,r*.55);c.lineCap='round';c.beginPath();c.moveTo(-r*.75,-r*.55);c.quadraticCurveTo(0,0,r*.8,-r*.5);c.stroke();c.strokeStyle='#f6d95c';c.lineWidth=Math.max(3,r*.2);c.beginPath();c.moveTo(-r*.55,-r*.4);c.quadraticCurveTo(0,.2*r,r*.58,-r*.35);c.stroke()}
    else if(this.style==='laser'||this.style==='focus_laser'){c.shadowBlur=18;c.shadowColor='#ff3b45';c.fillStyle=this.style==='focus_laser'?'#fff0ec':'#ff5962';c.beginPath();c.ellipse(0,0,r*1.8,r*.65,0,0,TAU);c.fill();c.shadowBlur=0;c.fillStyle='#fff';c.beginPath();c.ellipse(r*.25,0,r*.85,r*.25,0,0,TAU);c.fill()}
    else if(this.style==='visor_hadouken'){c.shadowBlur=22;c.shadowColor='#ed4058';c.fillStyle='#7a122e';c.beginPath();c.arc(0,0,r,0,TAU);c.fill();c.fillStyle='#ff5570';c.beginPath();c.arc(-r*.12,0,r*.68,0,TAU);c.fill();c.fillStyle='#ffe5e7';c.beginPath();c.arc(-r*.24,-r*.12,r*.28,0,TAU);c.fill();c.shadowBlur=0}
    else if(this.style==='sniper'){c.shadowBlur=12;c.shadowColor='#ffe183';c.fillStyle='#fff8cc';c.fillRect(-r*2.8,-r*.3,r*5.6,r*.6);c.fillStyle='#f9c85a';c.fillRect(-r*1.8,-r*.12,r*3.6,r*.24);c.shadowBlur=0}
    else if(this.style==='grenade'){c.rotate(-this.rotation*.5);c.fillStyle='#5d6e57';c.strokeStyle='#272d27';c.lineWidth=3;c.beginPath();c.arc(0,0,r,0,TAU);c.fill();c.stroke();c.fillStyle='#c7b36a';c.fillRect(-4,-r-5,8,7);c.fillStyle='#f7ca43';c.beginPath();c.arc(4,-r-7,3+Math.sin(this.age*20)*1.2,0,TAU);c.fill()}
    else if(this.style==='clod'){c.fillStyle='#805b37';c.strokeStyle='#4b331e';c.lineWidth=3;c.beginPath();c.arc(0,0,r,0,TAU);c.fill();c.stroke();for(let i=0;i<3;i++){c.fillStyle='#a77c4e';c.beginPath();c.arc(Math.cos(i*2.1)*r*.45,Math.sin(i*1.7)*r*.35,r*.18,0,TAU);c.fill()}}
    else if(this.style==='roller'){c.fillStyle='#8e7048';c.strokeStyle='#453822';c.lineWidth=4;c.beginPath();c.arc(0,0,r,0,TAU);c.fill();c.stroke();c.strokeStyle='#5d8f48';c.lineWidth=3;c.beginPath();c.arc(0,0,r*.55,0,Math.PI*1.4);c.stroke()}
    else if(this.style==='seed'){c.fillStyle='#e5bf6e';c.strokeStyle='#725426';c.lineWidth=2;c.beginPath();c.ellipse(0,0,r*.7,r,0,0,TAU);c.fill();c.stroke()}
    else if(this.style==='nut_pit'||this.style==='squirrel_nut'){c.fillStyle='#784a29';c.strokeStyle='#3d281a';c.lineWidth=3;c.beginPath();c.arc(0,2,r*.85,0,TAU);c.fill();c.stroke();c.fillStyle='#a37342';c.beginPath();c.moveTo(-r*.55,-r*.35);c.lineTo(0,-r);c.lineTo(r*.5,-r*.32);c.closePath();c.fill()}
    else if(this.style==='corn'){c.fillStyle='#f1c846';c.strokeStyle='#805c1d';c.lineWidth=2;c.beginPath();c.ellipse(0,0,r*.65,r,0,0,TAU);c.fill();c.stroke();c.strokeStyle='#d2972b';c.lineWidth=1;for(let i=-2;i<=2;i++){c.beginPath();c.moveTo(-r*.45,i*r*.25);c.lineTo(r*.45,i*r*.25);c.stroke()}}
    else if(this.style==='leaf'){c.fillStyle='#72a849';c.beginPath();c.ellipse(0,0,r*.55,r,0,0,TAU);c.fill();c.strokeStyle='#3e6a32';c.lineWidth=2;c.beginPath();c.moveTo(0,-r*.8);c.lineTo(0,r*.8);c.stroke()}
    else if(this.style==='tear'){c.fillStyle='#7fcbea';c.strokeStyle='#326a8b';c.lineWidth=2;c.beginPath();c.moveTo(0,-r);c.quadraticCurveTo(r,r*.2,0,r);c.quadraticCurveTo(-r,r*.2,0,-r);c.fill();c.stroke()}
    else if(this.style==='homing_carrot'){c.rotate(Math.atan2(this.vy,this.vx));c.fillStyle='#ee7d32';c.strokeStyle='#86411e';c.lineWidth=3;c.beginPath();c.moveTo(r,0);c.lineTo(-r*.75,-r*.58);c.lineTo(-r*.75,r*.58);c.closePath();c.fill();c.stroke();c.strokeStyle='#579344';c.lineWidth=4;c.beginPath();c.moveTo(-r*.7,0);c.lineTo(-r*1.2,-r*.5);c.moveTo(-r*.72,0);c.lineTo(-r*1.28,r*.38);c.stroke()}
    else if(this.style==='shuriken'||this.style==='blood_shuriken'){c.fillStyle=this.style==='blood_shuriken'?'#b91637':'#5e6670';c.strokeStyle=this.style==='blood_shuriken'?'#4c0716':'#222831';c.lineWidth=2;c.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,rr=i%2===0?r:r*.28;c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}c.closePath();c.fill();c.stroke();c.fillStyle='#ddd';c.beginPath();c.arc(0,0,r*.18,0,TAU);c.fill()}
    else{c.fillStyle='#fff';c.beginPath();c.arc(0,0,r,0,TAU);c.fill()}
    c.restore();
  }
}

export class Burst{
  constructor(x,y,color='#ffd46b',life=.35,size=55){Object.assign(this,{x,y,color,life,maxLife:life,size,dead:false})}
  update(dt){this.life-=dt;if(this.life<=0)this.dead=true}
  draw(c){const t=1-this.life/this.maxLife;c.save();c.globalAlpha=1-t;c.strokeStyle=this.color;c.lineWidth=4*(1-t)+1;for(let i=0;i<12;i++){const a=i*TAU/12,r1=this.size*.2*t,r2=this.size*t;c.beginPath();c.moveTo(this.x+Math.cos(a)*r1,this.y+Math.sin(a)*r1);c.lineTo(this.x+Math.cos(a)*r2,this.y+Math.sin(a)*r2);c.stroke()}c.restore()}
}

export class FloatingText{
  constructor(x,y,text,color='#fff',size=26){Object.assign(this,{x,y,text,color,size,life:.75,maxLife:.75,dead:false})}
  update(dt){this.life-=dt;this.y-=36*dt;if(this.life<=0)this.dead=true}
  draw(c){c.save();c.globalAlpha=clamp(this.life/.3,0,1);c.font=`900 ${this.size}px system-ui`;c.textAlign='center';c.lineWidth=5;c.strokeStyle='rgba(35,26,20,.72)';c.strokeText(this.text,this.x,this.y);c.fillStyle=this.color;c.fillText(this.text,this.x,this.y);c.restore()}
}

export class DamageZone{
  constructor(o={}){Object.assign(this,{x:0,y:0,w:100,h:60,life:1,openFrom:0,openTo:1,age:0,damage:1,kind:'spike',dead:false,hitCd:0,warning:true},o)}
  update(dt,g){this.age+=dt;this.life-=dt;this.hitCd-=dt;if(this.life<=0){this.dead=true;return}if(this.active&&this.hitCd<=0&&g.player&&!g.player.dead&&this.overlapsPlayer(g.player)){g.player.takeDamage(this.damage,this.x+this.w/2);this.hitCd=.5}}
  get active(){return this.age>=this.openFrom&&this.age<=this.openTo}
  overlapsPlayer(p){return Math.abs(p.x-(this.x+this.w/2))<this.w/2+p.colliderW/2&&Math.abs((p.y-p.colliderH/2)-(this.y+this.h/2))<this.h/2+p.colliderH/2}
  draw(c){c.save();const pulse=.45+.35*Math.sin(this.age*18);if(this.age<this.openFrom){c.globalAlpha=.32+pulse*.3;c.fillStyle='#f35f4f';c.fillRect(this.x,FLOOR_Y-12,this.w,12);c.fillStyle='#fff1bd';for(let x=this.x+12;x<this.x+this.w;x+=26){c.beginPath();c.moveTo(x,FLOOR_Y-12);c.lineTo(x+10,FLOOR_Y);c.lineTo(x-10,FLOOR_Y);c.closePath();c.fill()}}else{c.fillStyle='#cfc1a2';c.strokeStyle='#50483d';c.lineWidth=3;for(let x=this.x+15;x<this.x+this.w;x+=24){const h=this.h*(.75+.25*Math.sin(x));c.beginPath();c.moveTo(x-9,FLOOR_Y);c.lineTo(x,FLOOR_Y-h);c.lineTo(x+9,FLOOR_Y);c.closePath();c.fill();c.stroke()}}c.restore()}
}

export class Crow{
  constructor(x,y,dir=1,delay=6.8){Object.assign(this,{x,y,baseY:y,dir,delay,t:0,phase:'fly',dead:false,attackT:0,targetX:x,targetY:y,damageCd:0})}
  update(dt,g){this.t+=dt;this.damageCd-=dt;if(this.phase==='fly'){this.x+=this.dir*70*dt;this.y=this.baseY+Math.sin(this.t*2.2)*24;if(this.x<-80)this.x=W+60;if(this.x>W+80)this.x=-60;this.delay-=dt;if(this.delay<=0&&g.player){this.phase='dive';this.attackT=0;this.sx=this.x;this.sy=this.y;this.targetX=g.player.x;this.targetY=g.player.y-32}}
    else{this.attackT+=dt;const d=2.15,u=clamp(this.attackT/d,0,1),arc=Math.sin(u*Math.PI)*170;this.x=lerp(this.sx,this.targetX,u);this.y=lerp(this.sy,this.targetY,u)-arc;if(this.damageCd<=0&&dist(this.x,this.y,g.player.x,g.player.y-30)<46){g.player.takeDamage(1,this.x);g.player.vx+=this.dir*460;g.player.vy=-300;this.damageCd=.65}if(u>=1){this.phase='fly';this.baseY=95+Math.random()*45;this.delay=13.5+Math.random()*5;this.dir=this.x<W/2?1:-1}}
  }
  draw(c){c.save();c.translate(this.x,this.y);if(this.dir<0)c.scale(-1,1);c.fillStyle='#292629';c.strokeStyle='#120f12';c.lineWidth=3;c.beginPath();c.ellipse(0,0,23,14,0,0,TAU);c.fill();c.stroke();c.beginPath();c.moveTo(-8,-2);c.quadraticCurveTo(-35,-24,-43,3);c.quadraticCurveTo(-24,-7,-5,8);c.fill();c.beginPath();c.moveTo(6,-4);c.quadraticCurveTo(29,-25,37,0);c.quadraticCurveTo(24,-7,8,7);c.fill();c.fillStyle='#d7a530';c.beginPath();c.moveTo(20,-2);c.lineTo(37,3);c.lineTo(20,7);c.closePath();c.fill();c.fillStyle='#faf2da';c.beginPath();c.arc(10,-5,4,0,TAU);c.fill();c.fillStyle='#111';c.beginPath();c.arc(11,-5,2,0,TAU);c.fill();c.restore()}
}

export class Aura{
  constructor(o={}){Object.assign(this,{x:0,y:0,r:155,life:5.5,maxLife:5.5,dead:false,owner:null,kind:'buffer'})}
  update(dt,g){this.life-=dt;if(this.life<=0)this.dead=true}
  contains(p){return dist(this.x,this.y,p.x,p.y)<this.r}
  draw(c){c.save();c.globalAlpha=.18+.05*Math.sin(performance.now()/100);c.fillStyle='#79d1e5';c.strokeStyle='#d8f8ff';c.lineWidth=4;c.setLineDash([12,10]);c.beginPath();c.arc(this.x,this.y,this.r,0,TAU);c.fill();c.stroke();c.setLineDash([]);c.fillStyle='#527f88';c.fillRect(this.x-14,this.y-22,28,44);c.fillStyle='#d9f6ff';for(let i=0;i<3;i++)c.fillRect(this.x-6,this.y-14+i*12,12,5);c.restore()}
}

export class OrbitBoomerang{
  constructor(player,r=72,size=14){Object.assign(this,{player,angle:0,r,size,life:9,dead:false,damage:9,hit:false})}
  update(dt,g){this.life-=dt;this.angle+=dt*5.2;if(this.life<=0||!this.player||this.player.dead){this.dead=true;return}this.x=this.player.x+Math.cos(this.angle)*this.r;this.y=this.player.y-38+Math.sin(this.angle)*this.r;if(g.boss&&!g.boss.dead&&dist(this.x,this.y,g.boss.hitX,g.boss.hitY)<this.size+g.boss.hitRadius){g.damageBoss(this.damage,false);this.dead=true}for(const q of g.projectiles)if(!q.dead&&q.owner==='boss'&&dist(this.x,this.y,q.x,q.y)<this.size+q.r){q.dead=true;this.dead=true;g.effects.push(new Burst(q.x,q.y,'#ffdc70',.3,30));break}}
  draw(c){const p=new Projectile({x:this.x,y:this.y,r:this.size,style:'boomerang'});p.rotation=this.angle*2;p.draw(c)}
}

export class Slash{
  constructor(o={}){Object.assign(this,{x:0,y:0,facing:1,w:132,h:96,life:.18,maxLife:.18,damage:7,owner:'player',dead:false,hitBoss:false,destroysProjectiles:true,source:'katana'},o)}
  update(dt,g){this.life-=dt;if(this.life<=0){this.dead=true;return}if(g.boss&&!g.boss.dead&&!this.hitBoss&&Math.abs(g.boss.hitX-this.x)<this.w/2+g.boss.hitRadius&&Math.abs(g.boss.hitY-this.y)<this.h/2+g.boss.hitRadius){g.damageBoss(this.damage,false);this.hitBoss=true}if(this.destroysProjectiles)for(const p of g.projectiles)if(!p.dead&&p.owner==='boss'&&Math.abs(p.x-this.x)<this.w/2+p.r&&Math.abs(p.y-this.y)<this.h/2+p.r){p.dead=true;g.effects.push(new Burst(p.x,p.y,'#bde7ff',.25,28));g.player.onKatanaProjectileOrBossHit?.()}}
  draw(c){const t=this.life/this.maxLife;c.save();c.globalAlpha=t;c.translate(this.x,this.y);c.scale(this.facing,1);c.strokeStyle='#eef8ff';c.shadowColor='#9ad9ff';c.shadowBlur=20;c.lineWidth=10;c.beginPath();c.arc(-this.w*.18,0,this.w*.54,-.75,.8);c.stroke();c.strokeStyle='#77a9cf';c.lineWidth=3;c.stroke();c.restore()}
}

export class ShadowClone{
  constructor(player){this.player=player;this.x=player.x-player.facing*44;this.y=player.y;this.vx=player.facing*980;this.vy=0;this.life=5;this.dead=false;this.shootCd=0;this.slashCd=0}
  update(dt,g){this.life-=dt;if(this.life<=0){this.dead=true;return}const dx=this.player.x-(this._px??this.player.x),dy=this.player.y-(this._py??this.player.y);this.x+=dx;this.y+=dy;this._px=this.player.x;this._py=this.player.y;this.x+=this.vx*dt;this.vx-=Math.sign(this.vx)*Math.min(Math.abs(this.vx),1700*dt);this.x=clamp(this.x,ARENA_LEFT,ARENA_RIGHT);this.y=Math.min(this.y,FLOOR_Y);this.shootCd-=dt;this.slashCd-=dt}
  copyShot(g,dir){if(this.shootCd>0)return;this.shootCd=.22;g.spawnProjectile({x:this.x+dir.x*24,y:this.y-38+dir.y*8,vx:dir.x*1050,vy:dir.y*1050,r:8,damage:g.player.perks.scaled(2*.5,true,dir),life:1.4,owner:'player',style:'shuriken'})}
  copySlash(g){if(this.slashCd>0)return;this.slashCd=.28;g.entities.push(new Slash({x:this.x+g.player.facing*58,y:this.y-42,facing:g.player.facing,damage:g.player.perks.scaled(6*.5),source:'clone'}))}
  draw(c){c.save();c.globalAlpha=.48;c.translate(this.x,this.y);c.scale(this.player.facing,1);drawNinja(c,true);c.restore()}
}

export class HatUltimate{
  constructor(player,damage){this.player=player;this.damage=damage;this.pass=0;this.life=5.4;this.dead=false;this.x=player.x;this.y=player.y-55;this.dir=player.facing;this.hitThisPass=false;this.phase=0}
  update(dt,g){this.life-=dt;if(this.life<=0||this.pass>=4){this.dead=true;return}const speed=(this.phase===0?900:720)*Math.pow(1.3,this.pass);this.x+=this.dir*speed*dt;this.y=270+Math.sin((performance.now()/1000)*5+this.pass)*55;for(const p of g.projectiles)if(!p.dead&&p.owner==='boss'&&dist(this.x,this.y,p.x,p.y)<100+p.r){p.vx+=this.dir*170*dt;p.vy-=40*dt}if(g.boss&&!g.boss.dead&&!this.hitThisPass&&dist(this.x,this.y,g.boss.hitX,g.boss.hitY)<105+g.boss.hitRadius){g.damageBoss(this.damage,false);this.hitThisPass=true}if((this.dir>0&&this.x>W+130)||(this.dir<0&&this.x<-130)){this.pass++;this.phase=this.phase?0:1;this.dir*=-1;this.x=this.dir>0?-110:W+110;this.hitThisPass=false}}
  draw(c){c.save();c.translate(this.x,this.y);c.rotate(Math.sin(performance.now()/90)*.18);c.scale(2.3+this.pass*.28,2.3+this.pass*.28);drawCap(c,true);c.restore()}
}

export class LaserBeam{
  constructor(o={}){Object.assign(this,{x:0,y:0,dir:1,length:500,width:30,damage:1,tick:.16,tickCd:0,life:.1,dead:false,owner:'player',color:'#ff3659',ultimate:false},o)}
  update(dt,g){this.life-=dt;this.tickCd-=dt;if(this.life<=0){this.dead=true;return}if(this.tickCd<=0){this.tickCd=this.tick;const left=this.dir>0?this.x:this.x-this.length,right=this.dir>0?this.x+this.length:this.x;if(this.damage>0&&g.boss&&!g.boss.dead&&g.boss.hitX+g.boss.hitRadius>left&&g.boss.hitX-g.boss.hitRadius<right&&Math.abs(g.boss.hitY-this.y)<this.width/2+g.boss.hitRadius){g.damageBoss(this.damage,false)}for(const p of g.projectiles)if(!p.dead&&p.owner==='boss'&&p.x>left&&p.x<right&&Math.abs(p.y-this.y)<this.width/2+p.r&&(this.ultimate||p.breakableByPlayer)){p.dead=true;if(p.breakableByPlayer&&p.source?.onMinionDestroyed)p.source.onMinionDestroyed(g)}}}
  draw(c){const x2=this.x+this.dir*this.length;c.save();c.strokeStyle=this.color;c.shadowColor=this.color;c.shadowBlur=this.ultimate?42:24;c.lineWidth=this.width;c.lineCap='round';c.globalAlpha=.5;c.beginPath();c.moveTo(this.x,this.y);c.lineTo(x2,this.y);c.stroke();c.strokeStyle='#fff7f6';c.lineWidth=this.width*.28;c.globalAlpha=.96;c.beginPath();c.moveTo(this.x,this.y);c.lineTo(x2,this.y);c.stroke();c.restore()}
}

function heroBody(c,coat,shorts,skin='#f8efd6',ghost=false){
  c.save();
  c.fillStyle='rgba(0,0,0,.18)';c.beginPath();c.ellipse(0,9,31,7,0,0,TAU);c.fill();
  c.fillStyle='#23201f';c.fillRect(-19,-37,38,43);c.fillStyle=ghost?'#536069':coat;c.fillRect(-16,-34,32,36);
  c.fillStyle='#23201f';c.fillRect(-18,-12,36,18);c.fillStyle=ghost?'#46515a':shorts;c.fillRect(-15,-10,30,14);
  c.strokeStyle='#23201f';c.lineWidth=7;c.lineCap='round';c.beginPath();c.moveTo(-9,3);c.lineTo(-13,16);c.moveTo(9,3);c.lineTo(13,16);c.stroke();
  c.strokeStyle=ghost?'#59656c':'#ece8dc';c.lineWidth=5;c.beginPath();c.moveTo(-13,16);c.lineTo(-22,16);c.moveTo(13,16);c.lineTo(22,16);c.stroke();
  c.fillStyle='#23201f';c.beginPath();c.arc(0,-60,30,0,TAU);c.fill();c.fillStyle=ghost?'#6c777d':skin;c.beginPath();c.arc(0,-60,25,0,TAU);c.fill();
  c.restore();
}
function eye(c,x,y,dir=1){c.fillStyle='#25201f';c.beginPath();c.arc(x,y,4.2,0,TAU);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(x+dir*1.4,y-1.4,1.25,0,TAU);c.fill()}
function smile(c,dir=1){c.strokeStyle='#302723';c.lineWidth=2.5;c.beginPath();c.arc(dir*6,-52,9,.15,2.7);c.stroke();c.fillStyle='#d99a7e';c.beginPath();c.arc(dir*17,-58,3.5,0,TAU);c.fill()}
export function drawGunner(c,ghost=false){
  c.save();heroBody(c,'#316ea6','#be312f','#f8efd6',ghost);eye(c,8,-65,1);smile(c,1);
  c.fillStyle='#25201f';c.fillRect(-24,-84,48,9);c.fillStyle=ghost?'#4c5c66':'#455d69';c.fillRect(-21,-88,42,9);c.fillStyle='#e8c95b';c.fillRect(-7,-91,14,5);
  c.strokeStyle='#25201f';c.lineWidth=10;c.beginPath();c.moveTo(-8,-26);c.lineTo(15,-25);c.stroke();c.strokeStyle='#555e62';c.lineWidth=6;c.beginPath();c.moveTo(14,-25);c.lineTo(45,-25);c.stroke();c.strokeStyle='#27292c';c.lineWidth=4;c.beginPath();c.moveTo(42,-25);c.lineTo(58,-25);c.stroke();c.fillStyle='#ffe768';c.beginPath();c.arc(61,-25,3,0,TAU);c.fill();
  c.strokeStyle='#23201f';c.lineWidth=7;c.beginPath();c.moveTo(-13,-27);c.lineTo(10,-19);c.stroke();c.restore()
}
export function drawCap(c,ghost=false){
  c.save();heroBody(c,'#369256','#e7c340','#f8efd6',ghost);eye(c,8,-65,1);smile(c,1);
  c.strokeStyle='#25201f';c.lineWidth=8;c.beginPath();c.moveTo(-12,-28);c.lineTo(20,-29);c.stroke();c.fillStyle='#f8f4e6';c.beginPath();c.arc(25,-29,8,0,TAU);c.fill();
  c.fillStyle='#25201f';c.beginPath();c.ellipse(-2,-84,29,10,-.08,0,TAU);c.fill();c.fillStyle=ghost?'#694d54':'#d53e4b';c.beginPath();c.ellipse(-2,-84,25,7,-.08,0,TAU);c.fill();c.fillRect(-27,-87,39,7);c.fillStyle='#f2c34a';c.fillRect(-8,-91,15,4);
  c.restore()
}
export function drawVisor(c,ghost=false){
  c.save();heroBody(c,'#4a445b','#37373a','#f8efd6',ghost);
  c.fillStyle='#231f24';c.fillRect(-26,-72,52,16);c.fillStyle='#6b1732';c.fillRect(-22,-68,44,8);c.shadowColor='#ff3c60';c.shadowBlur=14;c.fillStyle='#ff4665';c.fillRect(-17,-66,34,5);c.shadowBlur=0;
  c.strokeStyle='#25201f';c.lineWidth=8;c.beginPath();c.moveTo(-12,-27);c.lineTo(22,-28);c.stroke();c.fillStyle='#f8f4e6';c.beginPath();c.arc(27,-28,8,0,TAU);c.fill();
  c.strokeStyle='#23201f';c.lineWidth=5;c.beginPath();c.moveTo(-14,-86);c.lineTo(-20,-99);c.moveTo(14,-86);c.lineTo(20,-98);c.stroke();c.fillStyle='#4b4459';c.beginPath();c.arc(-21,-101,4,0,TAU);c.arc(21,-100,4,0,TAU);c.fill();c.restore()
}
export function drawNinja(c,ghost=false){
  c.save();heroBody(c,'#1c1f2a','#12141c','#e5d5b8',ghost);
  c.fillStyle='#202532';c.fillRect(-25,-69,50,18);c.fillStyle='#e5d5b8';c.beginPath();c.ellipse(2,-63,15,7,0,0,TAU);c.fill();eye(c,8,-64,1);c.fillStyle='#ab243f';c.fillRect(-24,-49,48,7);
  c.strokeStyle='#25201f';c.lineWidth=8;c.beginPath();c.moveTo(-12,-27);c.lineTo(14,-35);c.stroke();c.strokeStyle='#f3f7fa';c.lineWidth=6;c.beginPath();c.moveTo(11,-34);c.lineTo(52,-67);c.stroke();c.strokeStyle='#6c8595';c.lineWidth=2;c.beginPath();c.moveTo(13,-32);c.lineTo(49,-62);c.stroke();
  c.strokeStyle='#9f233e';c.lineWidth=6;c.beginPath();c.moveTo(-20,-48);c.quadraticCurveTo(-45,-46,-58,-35);c.moveTo(-19,-45);c.quadraticCurveTo(-43,-35,-50,-20);c.stroke();c.restore()
}
