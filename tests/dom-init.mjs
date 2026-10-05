import assert from 'node:assert/strict';
class CL{constructor(){this.s=new Set()}add(...x){x.forEach(v=>this.s.add(v))}remove(...x){x.forEach(v=>this.s.delete(v))}toggle(x,v){if(v===undefined)v=!this.s.has(x);v?this.s.add(x):this.s.delete(x);return v}contains(x){return this.s.has(x)}}
class El{
 constructor(id=''){this.id=id;this.classList=new CL();this.style={};this.children=[];this.dataset={};this.textContent='';this._innerHTML='';this.onclick=null;this._q={}}
 appendChild(x){this.children.push(x);return x}addEventListener(){}focus(){}set innerHTML(v){this._innerHTML=v;if(v==='')this.children=[]}get innerHTML(){return this._innerHTML}
 querySelector(q){if(!this._q[q])this._q[q]=new El(q);return this._q[q]}
}
const map=new Map();const get=s=>{if(!map.has(s))map.set(s,new El(s));return map.get(s)};
const abilities=['shoot','skill1','skill2','ultimate'].map(slot=>{const e=new El();e.dataset.slot=slot;return e});
const fakeCtx=new Proxy({save(){},restore(){},translate(){},scale(){},rotate(){},beginPath(){},closePath(){},moveTo(){},lineTo(){},quadraticCurveTo(){},bezierCurveTo(){},arc(){},ellipse(){},fill(){},stroke(){},fillRect(){},strokeRect(){},clearRect(){},roundRect(){},fillText(){},strokeText(){},setLineDash(){},createLinearGradient(){return{addColorStop(){}}},createRadialGradient(){return{addColorStop(){}}}}, {get(t,p){if(p in t)return t[p];return ()=>{}} ,set(t,p,v){t[p]=v;return true}});
const canvas=get('#game');canvas.getContext=()=>fakeCtx;
globalThis.document={querySelector:get,querySelectorAll:s=>s==='.ability'?abilities:[],createElement:()=>new El()};
globalThis.window={addEventListener(){},removeEventListener(){},__LIKE_A_HERO__:null};
globalThis.requestAnimationFrame=()=>1;
await import('../src/game.js');
const g=window.__LIKE_A_HERO__;assert.ok(g,'game instance');assert.equal(g.phase,'select');
g.startRun('gunner');assert.equal(g.phase,'arena');assert.equal(g.boss.id,'root');
for(let i=0;i<120;i++)g.update(1/60);
assert.ok(g.player.health>0);assert.ok(Number.isFinite(g.player.x));
g.enterMap();assert.equal(g.phase,'map');g.update(1/60);g.draw();
console.log('DOM/bootstrap smoke OK: interface, criação da run, arena e mapa inicializam sem erro.');
