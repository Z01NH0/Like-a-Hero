export class Input{
  constructor(target=window){this.down=new Set();this.pressed=new Set();this.released=new Set();this.block=new Set(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space']);target.addEventListener('keydown',e=>{if(this.block.has(e.code))e.preventDefault();if(!this.down.has(e.code))this.pressed.add(e.code);this.down.add(e.code)});target.addEventListener('keyup',e=>{if(this.block.has(e.code))e.preventDefault();this.down.delete(e.code);this.released.add(e.code)});window.addEventListener('blur',()=>this.down.clear())}
  held(...codes){return codes.some(c=>this.down.has(c))}
  hit(...codes){return codes.some(c=>this.pressed.has(c))}
  up(...codes){return codes.some(c=>this.released.has(c))}
  axis(neg,pos){return(this.held(...pos)?1:0)-(this.held(...neg)?1:0)}
  endFrame(){this.pressed.clear();this.released.clear()}
}
export const KEYS={left:['KeyA','ArrowLeft'],right:['KeyD','ArrowRight'],up:['KeyW','ArrowUp'],down:['KeyS','ArrowDown'],jump:['Space'],shoot:['KeyJ'],dash:['ShiftLeft','ShiftRight'],skill1:['KeyK'],skill2:['KeyN'],ultimate:['KeyM'],pause:['Escape'],debugSkip:['KeyZ'],debugPerk:['KeyO'],debugReroll:['KeyP'],restart:['KeyR','Enter']};
