import {ARENA_LEFT,ARENA_RIGHT,FLOOR_Y,W,CHARACTERS,WEAPONS} from './constants.js';
import {clamp,moveToward,normalize,dist} from './utils.js';
import {PerkManager} from './perks.js';
import {Projectile,Burst,FloatingText,Aura,OrbitBoomerang,Slash,ShadowClone,HatUltimate,LaserBeam,drawGunner,drawCap,drawVisor,drawNinja} from './entities.js';

export class Player{
  constructor(characterId,input,game){
    const cfg=CHARACTERS[characterId];this.game=game;this.input=input;this.characterId=characterId;this.name=cfg.name;this.baseMaxHealth=cfg.maxHealth;this.maxHealth=cfg.maxHealth;this.health=this.maxHealth;this.baseSpeed=cfg.speed;this.speed=cfg.speed;this.baseJump=cfg.jump;this.jumpVelocity=cfg.jump;this.x=250;this.y=FLOOR_Y;this.vx=0;this.vy=0;this.facing=1;this.colliderW=34;this.colliderH=76;this.crouching=false;this.onFloor=true;this.dead=false;
    this.gravity=1750;this.coyote=.1;this.coyoteTimer=.1;this.jumpBuffer=0;this.dashBuffer=0;this.dashTimer=0;this.dashCooldown=0;this.dashDuration=.17;this.invuln=0;this.invulnDuration=.95;this.controlLocked=0;this.fireCd=0;this.skill1Cd=0;this.skill2Cd=0;this.ultimateCharge=0;this.ultimateActive=0;this.ultimateMax=1;this.skillCooldownMultiplier=1;this.fireRateMultiplier=1;this.generalDamageBonus=0;this.primaryDamageBonus=0;this.primarySpeedMultiplier=1;this.diagonalBonus=0;this.critChance=0;this.rageTimer=0;this.stationary=0;this.coldBlood=false;
    this.gunnerMaxAmmo=30;this.gunnerAmmo=30;this.reloadTimer=0;this.grenadeCharges=1;this.buffer=null;
    this.visorCharge=1;this.visorActive=false;this.visorStopDelay=0;
    this.ninjaBloodCharge=0;this.ninjaBloodShots=0;this.katanaCharges=2;this.katanaRecharge=[];this.clone=null;this.bleedBank=0;
    this.sniperShots=0;this.sniperShotCd=0;this.sniperReturn=0;this.ninjaUlt=null;this.beamTick=0;this.ultBeamTick=0;
    this.perks=new PerkManager(this);this.perks.recalc();
  }
  get centerY(){return this.y-this.colliderH/2}
  update(dt){
    if(this.dead)return;this.invuln=Math.max(0,this.invuln-dt);this.controlLocked=Math.max(0,this.controlLocked-dt);this.fireCd=Math.max(0,this.fireCd-dt);this.skill1Cd=Math.max(0,this.skill1Cd-dt);this.skill2Cd=Math.max(0,this.skill2Cd-dt);this.dashCooldown=Math.max(0,this.dashCooldown-dt);this.rageTimer=Math.max(0,this.rageTimer-dt);
    if(this.characterId==='ninja')this.updateNinjaCharges(dt);
    if(this.ultimateActive>0){this.updateUltimate(dt);return}
    if(this.controlLocked>0){this.physics(dt,0);return}
    const left=this.input.held('KeyA','ArrowLeft'),right=this.input.held('KeyD','ArrowRight');let axis=(right?1:0)-(left?1:0);if(axis)this.facing=axis;
    if(this.input.hit('Space','KeyW','ArrowUp'))this.jumpBuffer=.12;else this.jumpBuffer=Math.max(0,this.jumpBuffer-dt);
    if(this.input.hit('ShiftLeft','ShiftRight'))this.dashBuffer=.20;else this.dashBuffer=Math.max(0,this.dashBuffer-dt);
    if(this.onFloor)this.coyoteTimer=.1;else this.coyoteTimer=Math.max(0,this.coyoteTimer-dt);
    this.crouching=this.onFloor&&this.input.held('KeyS','ArrowDown')&&this.dashTimer<=0;this.colliderH=this.crouching?45:76;
    if(this.dashBuffer>0&&this.dashCooldown<=0){this.startDash();this.dashBuffer=0}
    if(this.dashTimer>0){this.dashTimer-=dt;this.vx=this.facing*(890*(1+.15*this.perks.count('cap_elastic_wind')));this.vy=0}
    else{
      const slow=this.visorActive?.55:1;this.vx=moveToward(this.vx,axis*this.speed*slow,2400*dt);
      if(!axis)this.vx=moveToward(this.vx,0,3000*dt);
      if(this.jumpBuffer>0&&this.coyoteTimer>0){this.vy=this.jumpVelocity*(this.visorActive?.68:1);this.onFloor=false;this.jumpBuffer=0;this.coyoteTimer=0}
      if(this.input.up('Space','KeyW','ArrowUp')&&this.vy<-190)this.vy=-190;
      this.vy+=this.gravity*dt;
    }
    this.stationary=(Math.abs(axis)<.1&&this.onFloor)?this.stationary+dt:0;this.coldBlood=this.stationary>=1;
    this.handleAttack(dt);
    this.physics(dt,axis);
  }
  physics(dt){
    this.x+=this.vx*dt;this.y+=this.vy*dt;this.x=clamp(this.x,ARENA_LEFT+this.colliderW/2,ARENA_RIGHT-this.colliderW/2);if(this.y>=FLOOR_Y){this.y=FLOOR_Y;this.vy=0;this.onFloor=true}else this.onFloor=false;
  }
  aimDir(){let x=this.facing,y=0;if(this.input.held('KeyW','ArrowUp'))y=-1;else if(this.input.held('KeyS','ArrowDown')&&!this.onFloor)y=1;return normalize(x,y)}
  handleAttack(dt){
    if(this.characterId==='laser_visor')this.handleVisorBeam(dt);
    if(this.input.held('KeyJ'))this.shoot();
    if(this.input.hit('KeyK'))this.skill1();
    if(this.input.hit('KeyN'))this.skill2();
    if(this.input.hit('KeyM')&&this.ultimateCharge>=1)this.startUltimate();
  }
  startDash(){this.dashTimer=this.dashDuration/(1+.15*this.perks.count('cap_elastic_wind'));this.dashCooldown=.42;this.game.effects.push(new Burst(this.x,this.centerY,'#e7f5ef',.22,34));if(this.characterId==='cap'&&this.perks.count('cap_reserve_wind'))this.reserveShots=(this.reserveShots||0)+this.perks.count('cap_reserve_wind')}
  shoot(){
    if(this.fireCd>0||this.ultimateActive>0)return;const dir=this.aimDir();const weapon=WEAPONS[CHARACTERS[this.characterId].weapon];let interval=weapon.interval*this.fireRateMultiplier;
    if(this.characterId==='gunner'){
      if(this.reloadTimer>0||this.gunnerAmmo<=0){this.reload();return}this.gunnerAmmo--;if(this.gunnerAmmo<=0)this.reloadTimer=this.buffer&&this.buffer.contains(this)?.4:1;const dmg=this.perks.scaled(1,true,dir);this.spawnPrimary(dir,780,dmg,7,'pea',1.6,false);this.fireCd=interval*(this.buffer&&this.buffer.contains(this)?.55:1);this.addUltCharge(.005);return;
    }
    if(this.characterId==='cap'){
      const count=1+(this.reserveShots||0);this.reserveShots=0;for(let i=0;i<count;i++){const off=(i-(count-1)/2)*.14,ang=Math.atan2(dir.y,dir.x)+off,d={x:Math.cos(ang),y:Math.sin(ang)};this.spawnPrimary(d,620*(1+.1*this.perks.count('cap_fast_return')),this.perks.scaled(3,true,d),14*Math.pow(1.08,this.perks.count('cap_gigarang')),'boomerang',3,true)}this.fireCd=interval;this.addUltCharge(interval/11.5);return;
    }
    if(this.characterId==='laser_visor'){this.spawnPrimary(dir,1280,this.perks.scaled(3,true,dir),10,'laser',.55*Math.pow(1.15,this.perks.count('visor_ruby_amplifier')),true);this.fireCd=interval;this.addUltCharge(interval/11.5);return}
    if(this.characterId==='ninja'){
      let blood=this.ninjaBloodShots>0;if(blood)this.ninjaBloodShots--;const base=blood?4*(1+.1*this.perks.count('ninja_blood_precision')):2;this.spawnPrimary(dir,blood?2100:1050,this.perks.scaled(base,true,dir),blood?13:9,blood?'blood_shuriken':'shuriken',1.4,false);this.fireCd=interval;this.addUltCharge(interval/11.5);if(blood&&this.ninjaBloodShots<=0)this.ninjaBloodCharge=0;
      if(this.clone&&!this.clone.dead)this.clone.copyShot(this.game,dir);
    }
  }
  spawnPrimary(dir,speed,damage,r,style,life,pierce){const s=speed*this.primarySpeedMultiplier;this.game.spawnProjectile({x:this.x+dir.x*30,y:this.centerY+dir.y*8,vx:dir.x*s,vy:dir.y*s,r,damage,life,owner:'player',style,pierce})}
  reload(){if(this.reloadTimer<=0)this.reloadTimer=this.buffer&&this.buffer.contains(this)?.4:1}
  updateReload(dt){if(this.characterId!=='gunner')return;if(this.reloadTimer>0){let mult=1;if(this.perks.has('gunner_idle_reload')&&Math.abs(this.vx)<3&&this.fireCd<=0)mult=2;this.reloadTimer-=dt*mult;if(this.reloadTimer<=0){this.gunnerAmmo=this.gunnerMaxAmmo;this.reloadTimer=0;this.game.toast('RECARREGADO')}}}
  skill1(){
    if(this.skill1Cd>0)return;const g=this.game,dir=this.aimDir();
    if(this.characterId==='gunner'){
      if(this.grenadeCharges<=0)return;this.grenadeCharges--;const dmg=this.perks.scaled(5*Math.pow(.8,this.perks.count('gunner_unstable_bomb')));const fragments=3*this.perks.count('gunner_compact_lead');const p=new Projectile({x:this.x+this.facing*28,y:this.centerY-10,vx:this.facing*520,vy:-360,r:13,damage:dmg,life:1.05,gravity:820,owner:'player',style:'grenade',onDeath:(q,game)=>{game.explode(q.x,q.y,104,dmg);for(const e of game.projectiles)if(!e.dead&&e.owner==='boss'&&dist({x:q.x,y:q.y},e)<86)e.dead=true;for(let i=0;i<fragments;i++){const a=(i/(fragments||1))*Math.PI*2,spd=420;game.spawnProjectile({x:q.x,y:q.y,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,r:5,damage:Math.max(1,Math.round(dmg*.35)),life:.75,owner:'player',style:'pea'})}}});g.projectiles.push(p);this.skill1Cd=3.5*this.skillCooldownMultiplier;g.after(3.5*this.skillCooldownMultiplier,()=>{if(!this.dead)this.grenadeCharges=Math.min(this.grenadeCharges+1,1+this.perks.count('gunner_unstable_bomb'))});return;
    }
    if(this.characterId==='cap'){for(const oy of[-28,0,28])g.spawnProjectile({x:this.x+this.facing*24,y:this.centerY+oy,vx:this.facing*650,vy:oy*.9,r:13,damage:this.perks.scaled(3),life:3.2,owner:'player',style:'boomerang',pierce:true});this.skill1Cd=4*this.skillCooldownMultiplier;return}
    if(this.characterId==='laser_visor'){return}
    if(this.characterId==='ninja'){
      if(this.katanaCharges<=0)return;this.katanaCharges--;this.katanaRecharge.push(3.2*this.skillCooldownMultiplier);const size=Math.pow(1.08,this.perks.count('ninja_extended_blade'));g.entities.push(new Slash({x:this.x+this.facing*58,y:this.centerY,facing:this.facing,w:132*size,h:96*size,damage:this.perks.scaled(7),source:'katana'}));if(this.clone&&!this.clone.dead)this.clone.copySlash(g);if(this.perks.has('ninja_blood_blade'))this.applyBleed();return;
    }
  }
  skill2(){
    if(this.skill2Cd>0)return;const g=this.game,dir=this.aimDir();
    if(this.characterId==='gunner'){this.buffer=new Aura({x:clamp(this.x+this.facing*110,120,W-120),y:FLOOR_Y-42,r:155*Math.pow(1.1,this.perks.count('gunner_lithium_battery')),life:5.5,maxLife:5.5,owner:this});g.entities.push(this.buffer);this.skill2Cd=11*this.skillCooldownMultiplier;return}
    if(this.characterId==='cap'){g.entities.push(new OrbitBoomerang(this,72,14*Math.pow(1.1,this.perks.count('cap_extended_defense'))));this.skill2Cd=5*this.skillCooldownMultiplier;return}
    if(this.characterId==='laser_visor'){g.spawnProjectile({x:this.x+this.facing*35,y:this.centerY,vx:this.facing*1200,vy:0,r:48,damage:this.perks.scaled(8),life:.95,owner:'player',style:'visor_hadouken',pierce:true,destroyEnemyProjectiles:true});this.skill2Cd=7*this.skillCooldownMultiplier;return}
    if(this.characterId==='ninja'){this.clone=new ShadowClone(this);g.entities.push(this.clone);this.skill2Cd=8.5*this.skillCooldownMultiplier*Math.pow(.9,this.perks.count('ninja_shadow_flow'));return}
  }
  handleVisorBeam(dt){
    if(this.characterId!=='laser_visor')return;const want=this.input.held('KeyK')&&this.visorCharge>0;const cap=1+.1*this.perks.count('visor_stable_beam');if(want){this.visorActive=true;this.visorStopDelay=.9;this.beamTick=Math.max(0,this.beamTick-dt);this.visorCharge=Math.max(0,this.visorCharge-dt*.34/cap);const power=1-this.visorCharge/cap,len=495+255*power*(1+.1*this.perks.count('visor_extended_heat')),width=28+16*power*(1+.1*this.perks.count('visor_extended_heat'));let dmg=0;if(this.beamTick<=0){dmg=this.perks.scaled(1+Math.floor(power*3*(1+.1*this.perks.count('visor_scalding_heat'))));this.beamTick=.16}this.game.entities.push(new LaserBeam({x:this.x+this.facing*26,y:this.centerY-2,dir:this.facing,length:len,width,damage,tick:.16,life:.05}));if(this.visorCharge<=0)this.visorActive=false}else{this.visorActive=false;this.visorStopDelay=Math.max(0,this.visorStopDelay-dt);if(this.visorStopDelay<=0)this.visorCharge=Math.min(cap,this.visorCharge+dt*.42*(1+.08*this.perks.count('visor_scarlet_turbine')))}
  }
  startUltimate(){
    this.ultimateCharge=0;this.game.effects.push(new Burst(this.x,this.centerY,'#fff2a4',.5,95));
    if(this.characterId==='gunner'){this.ultimateActive=.95+3*.62+.55;this.controlLocked=this.ultimateActive;this.sniperShots=3;this.sniperShotCd=.95;return}
    if(this.characterId==='cap'){this.ultimateActive=.9;this.controlLocked=.9;this.game.after(.9,()=>{if(!this.dead)this.game.entities.push(new HatUltimate(this,this.perks.scaled(10)))});return}
    if(this.characterId==='laser_visor'){this.ultimateActive=4.15;this.controlLocked=4.15;this._visorUltIntro=1.15;return}
    if(this.characterId==='ninja'){this.ultimateActive=4.4;this.controlLocked=4.4;this.invuln=4.4;this.ninjaUlt={t:0,slash:0,next:1};return}
  }
  updateUltimate(dt){
    this.ultimateActive-=dt;this.sniperShotCd-=dt;
    if(this.characterId==='gunner'&&this.sniperShots>0&&this.sniperShotCd<=0){this.sniperShotCd=.62;this.sniperShots--;this.game.spawnProjectile({x:this.x+this.facing*42,y:this.centerY-4,vx:this.facing*2650,vy:0,r:18,damage:this.perks.scaled(20),life:.8,owner:'player',style:'sniper',pierce:true});this.game.shake(6)}
    if(this.characterId==='laser_visor'){if(this._visorUltIntro>0)this._visorUltIntro-=dt;else{this.ultBeamTick=Math.max(0,this.ultBeamTick-dt);let dmg=0;if(this.ultBeamTick<=0){dmg=this.perks.scaled(2.688);this.ultBeamTick=.12}this.game.entities.push(new LaserBeam({x:this.x+this.facing*20,y:this.centerY-10,dir:this.facing,length:1450,width:310,damage:dmg,tick:.12,life:.06,ultimate:true,color:'#ff2e50'}))}}
    if(this.characterId==='ninja'&&this.ninjaUlt){const u=this.ninjaUlt;u.t+=dt;if(u.t>=u.next&&u.slash<12){u.next+=.115;u.slash++;const y=100+((u.slash*47)%420),x=this.facing>0?220:1060;this.game.entities.push(new Slash({x,y,facing:this.facing,w:900,h:70,damage:this.perks.scaled(2.8),source:'ult',destroysProjectiles:true}));this.game.shake(4)}if(u.t>2.4&&u.t<4.2){const axis=(this.input.held('KeyD','ArrowRight')?1:0)-(this.input.held('KeyA','ArrowLeft')?1:0);this.x=clamp(this.x+axis*this.speed*2*dt,ARENA_LEFT,ARENA_RIGHT)}}
    this.physics(dt,0);if(this.ultimateActive<=0){this.ultimateActive=0;this.controlLocked=0;if(this.characterId==='ninja'){this.applyBleed();this.invuln=.35;this.ninjaUlt=null}}
  }
  updateNinjaCharges(dt){for(let i=this.katanaRecharge.length-1;i>=0;i--){this.katanaRecharge[i]-=dt;if(this.katanaRecharge[i]<=0){this.katanaRecharge.splice(i,1);this.katanaCharges=Math.min(2,this.katanaCharges+1)}}}
  onKatanaProjectileOrBossHit(){if(this.characterId!=='ninja'||this.ninjaBloodShots>0)return;this.ninjaBloodCharge=Math.min(5,this.ninjaBloodCharge+1);if(this.ninjaBloodCharge>=5)this.ninjaBloodShots=5}
  applyBleed(){if(!this.game.boss||this.game.boss.dead)return;this.game.boss.bleedTime=Math.max(this.game.boss.bleedTime||0,7);this.game.boss.bleedRate=Math.max(this.game.boss.bleedRate||0,this.game.boss.maxHealth*.004*(1+.15*this.perks.count('ninja_deep_cut')))}
  addUltCharge(v){if(this.ultimateActive<=0)this.ultimateCharge=clamp(this.ultimateCharge+v,0,1)}
  takeDamage(amount,sourceX=this.x){if(this.dead||this.invuln>0)return false;this.health-=amount;this.invuln=this.invulnDuration;this.vx+=(this.x<sourceX?-1:1)*260;this.vy=-220;this.game.shake(12);this.game.effects.push(new Burst(this.x,this.centerY,'#ff735f',.32,45));this.game.effects.push(new FloatingText(this.x,this.centerY-35,`-${amount}`,'#ff6c63',28));this.rageTimer=3;if(this.perks.count('cicatriz_radical'))this.addUltCharge(.12*this.perks.count('cicatriz_radical'));if(this.health<=0){this.health=0;this.dead=true;this.game.onPlayerDied()}return true}
  heal(n){const before=this.health;this.health=Math.min(this.maxHealth,this.health+n);if(this.health>before&&this.game)this.game.effects.push(new FloatingText(this.x,this.centerY-45,`+${this.health-before}`,'#79e37e',25))}
  onPerkApplied(id){if(id==='gunner_extended_mag'){this.gunnerMaxAmmo=30+10*this.perks.count(id);this.gunnerAmmo=this.gunnerMaxAmmo}if(id==='gunner_unstable_bomb')this.grenadeCharges=1+this.perks.count(id)}
  updateOutOfBand(dt){this.updateReload(dt);if(this.buffer?.dead)this.buffer=null}
  draw(c){
    if(this.dead)return;c.save();c.translate(this.x,this.y);c.scale(this.facing,this.crouching?.74:1);if(this.invuln>0&&Math.floor(this.invuln*18)%2===0)c.globalAlpha=.35;if(this.dashTimer>0)c.globalAlpha=.7;if(this.characterId==='gunner')drawGunner(c);else if(this.characterId==='cap')drawCap(c);else if(this.characterId==='laser_visor')drawVisor(c);else drawNinja(c);c.restore();
    if(this.characterId==='laser_visor'&&this.visorActive){c.save();c.strokeStyle='#ff415b';c.lineWidth=3;c.globalAlpha=.55;c.beginPath();c.arc(this.x,this.centerY,32+Math.sin(performance.now()/70)*5,0,Math.PI*2);c.stroke();c.restore()}
  }
}
