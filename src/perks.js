import {choice,clamp} from './utils.js';

export const PERKS=[
{id:'faisca_poder',title:'FAÍSCA DO PODER',description:'Ganha +10% de dano geral.',rarity:'comum'},
{id:'pernas_atleta',title:'PERNAS DE ATLETA',description:'Ganha +15% de velocidade de movimento.',rarity:'comum'},
{id:'meia_mola',title:'MEIA MOLA',description:'Pula 20% mais alto.',rarity:'comum'},
{id:'gatilho_rapido',title:'GATILHO RÁPIDO',description:'Ganha +15% de cadência de disparo.',rarity:'comum'},
{id:'coracao_indolor',title:'CORAÇÃO INDOLOR',description:'Aumenta +1 na vida máxima.',rarity:'comum'},
{id:'tecnica_pressa',title:'TÉCNICA DA PRESSA',description:'Skills recarregam 15% mais rápido.',rarity:'comum'},
{id:'folego_extra',title:'FÔLEGO EXTRA',description:'Aumenta em 25% a distância do dash.',rarity:'comum'},
{id:'lanche_bolso',title:'LANCHE DE BOLSO',description:'Cura 2 de vida.',rarity:'comum'},
{id:'precisao_agucada',title:'PRECISÃO AGUÇADA',description:'Ganha +15% de chance de crítico.',rarity:'comum'},
{id:'saco_bugigangas',title:'SACO DE BUGIGANGAS',description:'Ganha +5% de dano no disparo por Perk Comum.',rarity:'comum'},
{id:'prisma_comum',title:'PRISMA ESPELHADO',description:'Duplica uma Perk Comum que você já tenha.',rarity:'comum'},
{id:'fogo_cruzado',title:'FOGO CRUZADO',description:'Disparos na diagonal ganham +30% de dano.',rarity:'incomum'},
{id:'cicatriz_radical',title:'CICATRIZ RADICAL',description:'Tomar dano carrega um pouco a Ultimate.',rarity:'incomum'},
{id:'casca_grossa',title:'CASCA GROSSA',description:'Aumenta o tempo intangível após dano.',rarity:'incomum'},
{id:'sangue_frio',title:'SANGUE FRIO',description:'Ficar 1s parado dá +30% de dano de disparo até se mover.',rarity:'incomum'},
{id:'bala_pesada',title:'BALA PESADA',description:'Disparos primários causam +30% de dano, mas viajam mais devagar.',rarity:'incomum'},
{id:'raiva_racional',title:'RAIVA RACIONAL',description:'Depois de levar dano, ganha +20% de dano geral por 3s.',rarity:'incomum'},
{id:'cacos_vidro',title:'CACOS DE VIDRO',description:'-1 vida máxima, +30% de dano geral.',rarity:'incomum'},
{id:'medalha_honra',title:'MEDALHA DE HONRA',description:'Ganha +10% de dano geral para cada boss derrotado.',rarity:'incomum'},
{id:'medalha_gloria',title:'MEDALHA DE GLÓRIA',description:'Cura +1 de vida quando derrota um boss.',rarity:'incomum'},
{id:'prisma_incomum',title:'PRISMA ESPELHADO',description:'Duplica uma Perk Incomum que você já tenha.',rarity:'incomum'},
{id:'gunner_extended_mag',title:'PENTE ESTENDIDO',description:'Aumenta em +10 a munição máxima.',rarity:'comum',character:'gunner'},
{id:'gunner_lithium_battery',title:'BATERIA DE LÍTIO',description:'Aumenta em +10% a área do Buffer.',rarity:'comum',character:'gunner'},
{id:'gunner_idle_reload',title:'RECARGA OCIOSA',description:'Parado e sem atirar, recarrega a arma no dobro da velocidade.',rarity:'comum',character:'gunner'},
{id:'gunner_compact_lead',title:'CHUMBO COMPACTO',description:'Quando a granada explode, dispara +3 projéteis pequenos.',rarity:'incomum',character:'gunner'},
{id:'gunner_unstable_bomb',title:'BOMBA INSTÁVEL',description:'Ganha +1 carga de granada, mas granadas causam -20% de dano.',rarity:'incomum',character:'gunner'},
{id:'cap_fast_return',title:'RETORNO RÁPIDO',description:'Velocidade do projétil do disparo +10%.',rarity:'comum',character:'cap'},
{id:'cap_extended_defense',title:'DEFESA ESTENDIDA',description:'Aumenta em +10% o tamanho do bumerangue orbitante.',rarity:'comum',character:'cap'},
{id:'cap_gigarang',title:'GIGARANGUE',description:'Aumenta em +8% o tamanho do projétil do disparo.',rarity:'comum',character:'cap'},
{id:'cap_reserve_wind',title:'VENTANIA RESERVA',description:'Após dar dash, o próximo disparo ganha +1 projétil.',rarity:'incomum',character:'cap'},
{id:'cap_elastic_wind',title:'VENTO ELÁSTICO',description:'Aumenta a velocidade do dash em +15% sem mudar a distância.',rarity:'incomum',character:'cap'},
{id:'visor_stable_beam',title:'FEIXE ESTÁVEL',description:'Aumenta a carga total do Laser Contínuo em +10%.',rarity:'comum',character:'laser_visor'},
{id:'visor_ruby_amplifier',title:'AMPLIFICADOR DE RUBI',description:'Aumenta em +15% a distância do disparo.',rarity:'comum',character:'laser_visor'},
{id:'visor_scarlet_turbine',title:'TURBINA ESCARLATE',description:'Aumenta em +8% a recarga do Laser Contínuo.',rarity:'comum',character:'laser_visor'},
{id:'visor_scalding_heat',title:'CALOR ESCALDANTE',description:'Aumenta em +10% o crescimento de dano do Laser Contínuo.',rarity:'incomum',character:'laser_visor'},
{id:'visor_extended_heat',title:'CALOR ESTENDIDO',description:'Aumenta em +10% o tamanho do Laser Contínuo conforme fica ativo.',rarity:'incomum',character:'laser_visor'},
{id:'ninja_shadow_flow',title:'FLUXO SOMBRIO',description:'Reduz em 10% o tempo de recarga do Clone.',rarity:'comum',character:'ninja'},
{id:'ninja_blood_precision',title:'PRECISÃO DE SANGUE',description:'Aumenta em +10% o dano da Shuriken de Sangue.',rarity:'comum',character:'ninja'},
{id:'ninja_extended_blade',title:'LÂMINA ESTENDIDA',description:'Aumenta em +8% a área do Corte de Katana.',rarity:'comum',character:'ninja'},
{id:'ninja_blood_blade',title:'LÂMINA DE SANGUE',description:'Corte de Katana causa sangramento leve.',rarity:'incomum',character:'ninja',unique:true},
{id:'ninja_deep_cut',title:'CORTE PROFUNDO',description:'Aumenta em +15% o dano do sangramento.',rarity:'incomum',character:'ninja'},
];

export class PerkManager{
  constructor(player){this.p=player;this.counts=new Map();this.rarities=new Map();this.bossDefeated=0}
  count(id){return this.counts.get(id)||0}
  has(id){return this.count(id)>0}
  hasDuplicate(r){for(const[id,n]of this.counts){if(n>0&&!id.startsWith('prisma_')&&this.rarities.get(id)===r&&id!=='ninja_blood_blade')return true}return false}
  roll(n=3){const out=[],used=new Set();for(let i=0;i<n;i++){let r='comum',q=Math.random();if(q<.08&&this.available('raro').length)r='raro';else if(q<.32)r='incomum';let pool=this.available(r).filter(x=>!used.has(x.id));if(!pool.length){pool=['comum','incomum','raro'].flatMap(k=>this.available(k)).filter(x=>!used.has(x.id))}if(!pool.length)break;const p=choice(pool);used.add(p.id);out.push({...p})}return out}
  available(r){return PERKS.filter(x=>x.rarity===r&&(!x.character||x.character===this.p.characterId)&&(!x.unique||!this.has(x.id))&&(x.id!=='prisma_comum'||this.hasDuplicate('comum'))&&(x.id!=='prisma_incomum'||this.hasDuplicate('incomum')))}
  apply(perk){if(!perk)return;const id=perk.id;if(id==='prisma_comum'||id==='prisma_incomum'){const r=id==='prisma_comum'?'comum':'incomum';this.register(id,r);const candidates=[...this.counts.keys()].filter(k=>!k.startsWith('prisma_')&&this.rarities.get(k)===r&&k!=='ninja_blood_blade');if(candidates.length)this.register(choice(candidates),r)}else this.register(id,perk.rarity||'comum');if(id==='lanche_bolso')this.p.heal(2);this.recalc();this.p.onPerkApplied(id)}
  register(id,r){this.counts.set(id,this.count(id)+1);this.rarities.set(id,r)}
  onBossDefeated(){this.bossDefeated++;this.recalc();const n=this.count('medalha_gloria');if(n)this.p.heal(n)}
  commonCount(){let n=0;for(const[id,c]of this.counts)if(this.rarities.get(id)==='comum')n+=c;return n}
  recalc(){const p=this.p;p.maxHealth=Math.max(1,p.baseMaxHealth+this.count('coracao_indolor')-this.count('cacos_vidro'));p.health=Math.min(p.health,p.maxHealth);p.speed=p.baseSpeed*(1+.15*this.count('pernas_atleta'));p.jumpVelocity=p.baseJump*(1+.2*this.count('meia_mola'));p.dashDuration=.17*(1+.25*this.count('folego_extra'));p.fireRateMultiplier=1/(1+.15*this.count('gatilho_rapido'));p.skillCooldownMultiplier=1/(1+.15*this.count('tecnica_pressa'));p.invulnDuration=.95+.22*this.count('casca_grossa');p.generalDamageBonus=.1*this.count('faisca_poder')+.3*this.count('cacos_vidro')+.1*this.count('medalha_honra')*this.bossDefeated;p.primaryDamageBonus=.3*this.count('bala_pesada')+.05*this.count('saco_bugigangas')*this.commonCount();p.diagonalBonus=.3*this.count('fogo_cruzado');p.primarySpeedMultiplier=Math.max(.55,1-.15*this.count('bala_pesada'));p.critChance=clamp(.15*this.count('precisao_agucada'),0,.95);p.gunnerAmmo=Math.min(p.gunnerAmmo,p.gunnerMaxAmmo)}
  scaled(base,primary=false,dir={x:1,y:0}){let bonus=this.p.generalDamageBonus+(this.p.rageTimer>0?.2*this.count('raiva_racional'):0);if(primary){bonus+=this.p.primaryDamageBonus;if(Math.abs(dir.x)>.1&&Math.abs(dir.y)>.1)bonus+=this.p.diagonalBonus;if(this.p.coldBlood)bonus+=.3*this.count('sangue_frio')}let v=base*Math.max(.1,1+bonus);if(Math.random()<this.p.critChance)v*=2;return Math.max(1,Math.round(v))}
}
