import assert from 'node:assert/strict';
import {Player} from '../src/player.js';
import {RootBoss} from '../src/bosses.js';
import {Projectile} from '../src/entities.js';
class I{held(){return false}hit(){return false}up(){return false}}
function setup(id){const queue=[];const g={input:new I(),projectiles:[],entities:[],effects:[],boss:null,player:null,spawnProjectile(o){const p=new Projectile(o);this.projectiles.push(p);return p},after(t,fn){queue.push({t,fn})},step(dt){for(let i=queue.length-1;i>=0;i--){queue[i].t-=dt;if(queue[i].t<=0){const q=queue.splice(i,1)[0];q.fn()}}},damageBoss(n){return this.boss.damage(n)},explode(){},shake(){},toast(){},status(){},floatText(){},onPlayerDied(){},onBossDefeated(b){b.dead=true}};g.player=new Player(id,g.input,g);g.boss=new RootBoss(g);return g}
for(const id of ['gunner','cap','laser_visor','ninja']){
 const g=setup(id),p=g.player;
 p.skill1();p.skill2();
 assert.ok(g.projectiles.length+g.entities.length>=1,`${id} skills should spawn gameplay entity`);
 p.ultimateCharge=1;p.startUltimate();assert.equal(p.ultimateCharge,0,`${id} ult consumes charge`);
 for(let i=0;i<400;i++){g.step(1/60);p.updateUltimate?.(1/60);for(const e of g.entities)e.update?.(1/60,g);for(const q of g.projectiles)q.update(1/60,g)}
 assert.ok(Number.isFinite(p.health),`${id} remains valid`);
}
console.log('Ability smoke OK: skills e ultimates dos 4 personagens executam sem exceções.');
