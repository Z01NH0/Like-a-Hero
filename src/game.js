import {W,H,FLOOR_Y,ARENA_LEFT,ARENA_RIGHT,CHARACTERS} from './constants.js';
import {Input,KEYS} from './input.js';
import {clamp,dist} from './utils.js';
import {Player} from './player.js';
import {Projectile,Burst,FloatingText} from './entities.js';
import {BOSS_FACTORIES} from './bosses.js';
import {drawBackground,drawArenaFrame} from './backgrounds.js';

const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d');
const ui={
  charScreen:document.querySelector('#character-screen'),charCards:document.querySelector('#character-cards'),perkScreen:document.querySelector('#perk-screen'),perkCards:document.querySelector('#perk-cards'),pause:document.querySelector('#pause-screen'),end:document.querySelector('#end-screen'),restart:document.querySelector('#restart-button'),endTitle:document.querySelector('#end-title'),endCopy:document.querySelector('#end-copy'),
  playerFill:document.querySelector('#player-health-fill'),playerText:document.querySelector('#player-health-text'),charName:document.querySelector('#character-name'),ammoCard:document.querySelector('#ammo-card'),ammoFill:document.querySelector('#ammo-fill'),ammoText:document.querySelector('#ammo-text'),bossHud:document.querySelector('#top-center'),bossFill:document.querySelector('#boss-health-fill'),bossName:document.querySelector('#boss-name'),blood:document.querySelector('#blood-panel'),status:document.querySelector('#status'),toast:document.querySelector('#toast'),skip:document.querySelector('#skip-fill'),abilities:[...document.querySelectorAll('.ability')]
};

class Game{
  constructor(){this.input=new Input();this.phase='select';this.theme='garden';this.player=null;this.boss=null;this.projectiles=[];this.entities=[];this.effects=[];this.last=performance.now();this.acc=0;this.shakeT=0;this.shakeAmp=0;this.toastT=0;this.skipHeld=0;this.encounterIndex=0;this.forestCleared=false;this.farmCleared=false;this.perkChoices=[];this.transition=0;this.transitionText='';this.mapPlayer={x:260,y:470};this.mapPulse=0;this.pendingBoss=null;this.debug=false;this.scheduled=[];this.setupCharacterCards();ui.restart.onclick=()=>this.restartRun();requestAnimationFrame(t=>this.frame(t));window.__LIKE_A_HERO__=this}
  setupCharacterCards(){for(const [id,ch] of Object.entries(CHARACTERS)){const b=document.createElement('button');b.className='character-card';b.innerHTML=`<span class="portrait">${ch.icon}</span><strong>${ch.name}</strong><small>${ch.desc}</small>`;b.onclick=()=>this.startRun(id);ui.charCards.appendChild(b)}window.addEventListener('keydown',e=>{if(this.phase==='select'&&/^Digit[1-4]$/.test(e.code)){const id=Object.keys(CHARACTERS)[Number(e.code.slice(-1))-1];if(id)this.startRun(id)}})}
  startRun(id){this.scheduled.length=0;this.player=new Player(id,this.input,this);this.projectiles=[];this.entities=[];this.effects=[];this.encounterIndex=0;this.forestCleared=false;this.farmCleared=false;this.mapPlayer={x:260,y:470};ui.charScreen.classList.remove('visible');ui.end.classList.remove('visible');this.startBoss('root','garden')}
  restartRun(){if(this.player)this.startRun(this.player.characterId);else{this.phase='select';ui.charScreen.classList.add('visible');ui.end.classList.remove('visible')}}
  startBoss(id,theme){this.phase='arena';this.theme=theme;this.projectiles.length=0;this.entities.length=0;this.effects.length=0;this.boss=BOSS_FACTORIES[id](this);this.pendingBoss=null;this.player.x=220;this.player.y=FLOOR_Y;this.player.vx=this.player.vy=0;this.player.dead=false;this.player.controlLocked=.35;this.status(this.boss.name,.8);ui.bossHud.classList.remove('hidden')}
  nextAfterBoss(id){
    const flow={root:['onion','garden','onion'],onion:['carrot','garden','carrot'],carrot:[null,'map','route'],nut:['squirrel','forest','squirrel'],squirrel:['tree','forest','tree'],tree:[null,'map','forest_done'],scarecrow:[null,'map','farm_done']};const next=flow[id];if(!next)return;
    if(next[2]==='forest_done')this.forestCleared=true;if(next[2]==='farm_done')this.farmCleared=true;this.pendingBoss=next[0]?{id:next[0],theme:next[1]}:null;this.pendingAfterPerk=next[2];this.showPerks();
  }
  showPerks(){this.phase='perk';this.projectiles.length=0;this.entities.length=0;this.perkChoices=this.player.perks.roll(3);ui.perkCards.innerHTML='';this.perkChoices.forEach((p,i)=>{const b=document.createElement('button');b.className=`perk-card ${p.rarity==='incomum'?'uncommon':p.rarity==='raro'?'rare':'common'}`;b.innerHTML=`<span class="rarity">${p.rarity.toUpperCase()}</span><strong>${i+1}. ${p.title}</strong><small>${p.description}</small>`;b.onclick=()=>this.choosePerk(i);ui.perkCards.appendChild(b)});ui.perkScreen.classList.add('visible')}
  choosePerk(i){const p=this.perkChoices[i];if(!p)return;this.player.perks.apply(p);ui.perkScreen.classList.remove('visible');this.toast(p.title);if(this.pendingBoss){const n=this.pendingBoss;this.pendingBoss=null;this.startBoss(n.id,n.theme)}else this.enterMap()}
  enterMap(){this.phase='map';this.theme='map';this.projectiles.length=0;this.entities.length=0;this.boss=null;ui.bossHud.classList.add('hidden');this.player.controlLocked=0;this.status('MAPA',.7);this.mapPlayer.x=this.forestCleared?760:260;this.mapPlayer.y=this.forestCleared?350:470}
  onBossDefeated(b){this.player.perks.onBossDefeated();this.projectiles.length=0;this.entities=this.entities.filter(e=>e.player===this.player||e.owner===this.player);this.effects.push(new Burst(b.hitX,b.hitY,'#ffe781',.9,150));this.shake(18);this.status('DERROTADO!',1.15);this.phase='victory';this.after(.95,()=>{if(this.phase==='victory')this.nextAfterBoss(b.id)})}
  onPlayerDied(){this.phase='dead';ui.endTitle.textContent='DERROTADO';ui.endCopy.textContent='A horta ganhou. Humilhante, mas botanicamente impressionante.';ui.end.classList.add('visible');ui.bossHud.classList.add('hidden')}
  winRun(){this.phase='dead';ui.endTitle.textContent='RUN COMPLETA';ui.endCopy.textContent='Você derrubou a horta, a floresta e a fazenda. A agricultura jamais se recuperará financeiramente.';ui.end.classList.add('visible');ui.bossHud.classList.add('hidden')}
  after(delay,fn){this.scheduled.push({t:delay,fn})}
  updateScheduled(dt){for(let i=this.scheduled.length-1;i>=0;i--){const s=this.scheduled[i];s.t-=dt;if(s.t<=0){this.scheduled.splice(i,1);try{s.fn()}catch(err){console.error('Scheduled callback failed',err)}}}}
  spawnProjectile(o){const p=new Projectile(o);this.projectiles.push(p);return p}
  floatText(x,y,t,color,size){this.effects.push(new FloatingText(x,y,t,color,size))}
  explode(x,y,r,damage){this.effects.push(new Burst(x,y,'#ffd35e',.42,r));this.shake(7);if(this.boss&&!this.boss.dead&&dist(x,y,this.boss.hitX,this.boss.hitY)<r+this.boss.hitRadius)this.damageBoss(damage,false)}
  damageBoss(n,primary=false){if(!this.boss||this.boss.dead)return 0;const dealt=this.boss.damage(n);if(dealt){this.player.addUltCharge(this.player.characterId==='gunner'?.005:.012);this.shake(Math.min(4,dealt*.2))}return dealt}
  shake(a){this.shakeT=.18;this.shakeAmp=Math.max(this.shakeAmp,a)}
  toast(t,d=1.4){ui.toast.textContent=t;ui.toast.classList.remove('hidden');this.toastT=d}
  status(t,d=.7){ui.status.textContent=t;this.statusT=d}
  frame(now){let dt=Math.min(.033,(now-this.last)/1000||0);this.last=now;this.update(dt);this.draw();this.input.endFrame();requestAnimationFrame(t=>this.frame(t))}
  update(dt){
    if(this.toastT>0){this.toastT-=dt;if(this.toastT<=0)ui.toast.classList.add('hidden')}if(this.statusT>0){this.statusT-=dt;if(this.statusT<=0)ui.status.textContent=''}if(this.shakeT>0){this.shakeT-=dt;if(this.shakeT<=0)this.shakeAmp=0}
    if(this.phase==='select'||this.phase==='dead')return;
    if(this.input.hit(...KEYS.pause)&&this.phase!=='perk'){if(this.phase==='pause')this.resumeFromPause();else if(['arena','map','victory'].includes(this.phase)){this.prevPhase=this.phase;this.phase='pause';ui.pause.classList.add('visible')}return}
    if(this.phase==='pause'){if(this.input.held(...KEYS.debugSkip)){this.skipHeld+=dt;ui.skip.style.width=`${clamp(this.skipHeld/3,0,1)*100}%`;if(this.skipHeld>=3){this.skipHeld=0;ui.skip.style.width='0';ui.pause.classList.remove('visible');this.enterMap()}}else{this.skipHeld=0;ui.skip.style.width='0'}return}
    if(this.phase==='perk'){if(this.input.hit('Digit1'))this.choosePerk(0);else if(this.input.hit('Digit2'))this.choosePerk(1);else if(this.input.hit('Digit3'))this.choosePerk(2);return}
    this.updateScheduled(dt);
    if(this.phase==='map'){this.updateMap(dt);this.updateEffects(dt);this.updateHud();return}
    if(this.phase==='victory'){this.updateEffects(dt);this.updateHud();return}
    this.player.update(dt);this.player.updateOutOfBand(dt);this.boss?.update(dt);for(const p of this.projectiles)p.update(dt,this);for(const e of this.entities)e.update?.(dt,this);this.collisions();this.projectiles=this.projectiles.filter(p=>!p.dead);this.entities=this.entities.filter(e=>!e.dead);this.updateEffects(dt);this.updateHud();
  }
  resumeFromPause(){this.phase=this.prevPhase||'arena';ui.pause.classList.remove('visible');this.skipHeld=0;ui.skip.style.width='0'}
  collisions(){
    if(!this.player||!this.boss)return;
    for(const p of this.projectiles){if(p.dead)continue;if(p.owner==='player'&&!this.boss.dead&&dist(p.x,p.y,this.boss.hitX,this.boss.hitY)<p.r+this.boss.hitRadius){if(p.style==='grenade'){p.kill(this,true)}else{this.damageBoss(p.damage,true);this.player.addUltCharge(this.player.characterId==='gunner'?.005:.015);if(!p.pierce)p.dead=true}}
      else if(p.owner==='boss'&&!this.player.dead&&dist(p.x,p.y,this.player.x,this.player.centerY)<p.r+Math.max(this.player.colliderW,this.player.colliderH)*.32){this.player.takeDamage(p.damage||1,p.x);p.dead=true}}
    for(const p of this.projectiles){if(p.dead||p.owner!=='player')continue;for(const q of this.projectiles){if(q.dead||q.owner!=='boss')continue;if(dist(p.x,p.y,q.x,q.y)<=p.r+q.r){if(q.breakableByPlayer){q.dead=true;if(!p.pierce)p.dead=true;q.source?.onMinionDestroyed?.();this.effects.push(new Burst(q.x,q.y,'#d7f58f',.3,34))}else if(p.destroyEnemyProjectiles){q.dead=true;this.effects.push(new Burst(q.x,q.y,'#dff7ff',.25,28))}}}}
  }
  updateEffects(dt){for(const e of this.effects)e.update(dt,this);this.effects=this.effects.filter(e=>!e.dead)}
  updateMap(dt){
    this.mapPulse+=dt;let ax=this.input.axis(KEYS.left,KEYS.right),ay=this.input.axis(KEYS.up,KEYS.down);let l=Math.hypot(ax,ay)||1;this.mapPlayer.x=clamp(this.mapPlayer.x+ax/l*260*dt,150,1110);this.mapPlayer.y=clamp(this.mapPlayer.y+ay/l*260*dt,105,560);if(this.input.hit('Space','Enter','KeyJ')){if(!this.forestCleared&&dist(this.mapPlayer.x,this.mapPlayer.y,790,335)<76){this.startBoss('nut','forest');return}if(this.forestCleared&&!this.farmCleared&&dist(this.mapPlayer.x,this.mapPlayer.y,1050,170)<76){this.startBoss('scarecrow','farm');return}if(this.farmCleared&&dist(this.mapPlayer.x,this.mapPlayer.y,1050,170)<95)this.winRun()}}
  updateHud(){
    const p=this.player;if(!p)return;ui.charName.textContent=p.name;ui.playerFill.style.width=`${100*p.health/p.maxHealth}%`;ui.playerText.textContent=`${p.health} / ${p.maxHealth}`;ui.ammoCard.classList.toggle('hidden',p.characterId!=='gunner');if(p.characterId==='gunner'){ui.ammoFill.style.width=`${100*p.gunnerAmmo/p.gunnerMaxAmmo}%`;ui.ammoText.textContent=p.reloadTimer>0?'REC...':`${p.gunnerAmmo} / ${p.gunnerMaxAmmo}`}
    if(this.boss&&!this.boss.dead){ui.bossHud.classList.remove('hidden');ui.bossName.textContent=this.boss.name;ui.bossFill.style.width=`${100*this.boss.health/this.boss.maxHealth}%`}else ui.bossHud.classList.add('hidden');
    const cooldowns={shoot:p.fireCd,skill1:p.skill1Cd,skill2:p.skill2Cd,ultimate:1-p.ultimateCharge};for(const el of ui.abilities){const slot=el.dataset.slot,v=slot==='ultimate'?p.ultimateCharge:(cooldowns[slot]>0?Math.min(1,cooldowns[slot]/(slot==='skill1'?4:slot==='skill2'?8:1)):0);const fill=el.querySelector('i'),em=el.querySelector('em');if(slot==='ultimate'){fill.style.height=`${p.ultimateCharge*100}%`;el.classList.toggle('ready',p.ultimateCharge>=1);em.textContent=`${Math.floor(p.ultimateCharge*100)}%`}else{fill.style.height=`${v*100}%`;el.classList.toggle('ready',cooldowns[slot]<=0);em.textContent=cooldowns[slot]>0?cooldowns[slot].toFixed(1):''}}
    ui.blood.classList.toggle('hidden',p.characterId!=='ninja');if(p.characterId==='ninja'){ui.blood.innerHTML='';for(let i=0;i<5;i++){const q=document.createElement('i');q.className=i<(p.ninjaBloodShots>0?p.ninjaBloodShots:p.ninjaBloodCharge)?'on':'';ui.blood.appendChild(q)}}
  }
  draw(){
    ctx.save();if(this.shakeT>0)ctx.translate((Math.random()*2-1)*this.shakeAmp,(Math.random()*2-1)*this.shakeAmp);drawBackground(ctx,this.theme,performance.now()/1000);if(this.phase==='map')this.drawMap();else{drawArenaFrame(ctx,this.theme);for(const p of this.projectiles)p.draw(ctx);for(const e of this.entities)e.draw?.(ctx);this.boss?.draw(ctx);this.player?.draw(ctx);for(const e of this.effects)e.draw(ctx)}ctx.restore();
  }
  drawMap(){
    const c=ctx;c.save();c.lineCap='round';c.strokeStyle='#d3bf76';c.lineWidth=24;c.globalAlpha=.9;c.beginPath();c.moveTo(260,470);c.quadraticCurveTo(480,400,790,335);c.quadraticCurveTo(910,265,1050,170);c.stroke();c.globalAlpha=1;
    this.node(c,260,470,'HORTA',true,'#8ab04d');this.node(c,790,335,'FLORESTA',true,'#3c7f54');this.node(c,1050,170,'FAZENDA',this.forestCleared,'#c99b4c');
    c.fillStyle='#1b2520cc';c.strokeStyle='#604d35';c.lineWidth=4;c.roundRect(365,45,550,72,18);c.fill();c.stroke();c.fillStyle='#fff0b7';c.font='900 36px system-ui';c.textAlign='center';c.fillText('MAPA DA AVENTURA',640,91);
    c.save();c.translate(this.mapPlayer.x,this.mapPlayer.y);c.fillStyle='#ffe470';c.strokeStyle='#3d3221';c.lineWidth=4;c.beginPath();c.arc(0,0,18+Math.sin(this.mapPulse*5)*2,0,Math.PI*2);c.fill();c.stroke();c.fillStyle='#3e3322';c.beginPath();c.moveTo(0,30);c.lineTo(-9,13);c.lineTo(9,13);c.closePath();c.fill();c.restore();
    c.fillStyle='#fff6d4';c.font='800 18px system-ui';c.fillText(this.forestCleared?(this.farmCleared?'ENTER/J na fazenda para concluir':'ENTER/J na fazenda para enfrentar o Espantalho'):'ENTER/J na floresta para continuar',640,670);c.restore();
  }
  node(c,x,y,label,enabled,color){c.save();c.globalAlpha=enabled?1:.34;c.fillStyle=color;c.strokeStyle='#3b3023';c.lineWidth=5;c.beginPath();c.arc(x,y,46,0,Math.PI*2);c.fill();c.stroke();c.fillStyle='#fff0bd';c.font='900 15px system-ui';c.textAlign='center';c.fillText(label,x,y+72);if(!enabled){c.fillStyle='#382e28';c.font='900 28px system-ui';c.fillText('🔒',x,y+10)}c.restore()}
}

new Game();
