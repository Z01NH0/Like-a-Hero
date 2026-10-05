export const W=1280,H=720,FLOOR_Y=585,ARENA_LEFT=70,ARENA_RIGHT=1205;
export const TAU=Math.PI*2;
export const CHARACTERS={
  gunner:{id:'gunner',name:'ATIRADOR',weapon:'pea',desc:'Metralhadora leve',icon:'🔧',maxHealth:5,speed:320,jump:-760},
  cap:{id:'cap',name:'GAROTO DO BONÉ',weapon:'boomerang',desc:'Boné e bumerangue',icon:'🧢',maxHealth:5,speed:320,jump:-760},
  laser_visor:{id:'laser_visor',name:'VISOR',weapon:'laser',desc:'Laser pelos olhos',icon:'🔴',maxHealth:5,speed:320,jump:-760},
  ninja:{id:'ninja',name:'NINJA',weapon:'shuriken',desc:'Shuriken e sombras',icon:'🥷',maxHealth:5,speed:320,jump:-760},
};
export const WEAPONS={pea:{interval:.145},boomerang:{interval:.34},laser:{interval:.38},shuriken:{interval:.31}};
export const COLORS={ink:'#25201f',cream:'#f8efd6',gold:'#f7d46b',red:'#e13e4e'};
