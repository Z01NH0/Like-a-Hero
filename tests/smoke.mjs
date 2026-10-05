import assert from 'node:assert/strict';
import {Player} from '../src/player.js';
import {BOSS_FACTORIES} from '../src/bosses.js';
import {Projectile} from '../src/entities.js';

class FakeInput{constructor(){this.down=new Set();this.pressed=new Set();this.released=new Set()}held(...c){return c.some(x=>this.down.has(x))}hit(...c){return c.some(x=>this.pressed.has(x))}up(...c){return c.some(x=>this.released.has(x))}}
function makeGame(char='gunner'){
 const input=new FakeInput();
 const g={input,projectiles:[],entities:[],effects:[],boss:null,player:null,
  spawnProjectile(o){const p=new Projectile(o);this.projectiles.push(p);return p},
  after(_delay,fn){fn()},
  damageBoss(n){return this.boss?.damage(n)||0},explode(){},shake(){},toast(){},status(){},floatText(){},onPlayerDied(){},onBossDefeated(b){b.dead=true}};
 g.player=new Player(char,input,g);return g;
}
for(const char of ['gunner','cap','laser_visor','ninja']){
 const g=makeGame(char);g.boss=BOSS_FACTORIES.root(g);
 for(let i=0;i<180;i++){g.player.update(1/60);g.player.updateOutOfBand(1/60);g.boss.update(1/60);for(const p of g.projectiles)p.update(1/60,g);for(const e of g.entities)e.update?.(1/60,g);g.projectiles=g.projectiles.filter(p=>!p.dead);g.entities=g.entities.filter(e=>!e.dead)}
 assert.equal(Number.isFinite(g.player.x),true,`${char}: player x`);
 assert.equal(g.player.maxHealth>=1,true,`${char}: hp`);
}
for(const id of Object.keys(BOSS_FACTORIES)){
 const g=makeGame('gunner');g.boss=BOSS_FACTORIES[id](g);
 for(let i=0;i<900;i++){g.boss.update(1/60);for(const p of g.projectiles)p.update(1/60,g);for(const e of g.entities)e.update?.(1/60,g);g.projectiles=g.projectiles.filter(p=>!p.dead);g.entities=g.entities.filter(e=>!e.dead)}
 assert.equal(Number.isFinite(g.boss.hitX),true,`${id}: hitX`);
 assert.equal(Number.isFinite(g.boss.hitY),true,`${id}: hitY`);
 assert.ok(g.projectiles.length<1000,`${id}: runaway projectiles`);
}
{
 const g=makeGame('gunner');g.boss=BOSS_FACTORIES.root(g);const hp=g.boss.health;g.player.perks.register('faisca_poder','comum');g.player.perks.recalc();const d=g.player.perks.scaled(10);assert.ok(d>=11);g.boss.damage(d);assert.ok(g.boss.health<hp);
}
console.log('Smoke tests OK: 4 personagens, 7 bosses, projéteis e perks simulados.');
