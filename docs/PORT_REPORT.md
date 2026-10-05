# Relatório do port Godot → Web

## Estrutura original analisada

O ZIP original contém 167 arquivos e aproximadamente 9 mil linhas de GDScript. A cena principal é `scenes/Main.tscn`, com o fluxo geral concentrado em `scripts/main.gd` e sistemas de jogador, projéteis, HUD, perks, mapa e bosses separados em scripts menores.

A característica decisiva para o port é que quase toda a arte jogável é **procedural**, desenhada por código. O projeto não depende de uma coleção significativa de sprites, tiles ou áudio externo. Por isso, foi possível preservar a linguagem visual por Canvas 2D sem empacotar a Godot no navegador.

## Conteúdo preservado

- Quatro personagens: Atirador, Garoto do Boné, Visor e Ninja.
- Movimento com gravidade, coyote time, jump buffer, dash buffer, dash e agachamento.
- Ataques primários específicos, recarga e munição do Atirador, bumerangue, laser, shuriken e Shuriken de Sangue.
- Skills e Ultimates dos quatro personagens, incluindo Buffer, granada, bumerangue orbital, laser contínuo, Hadouken, clone, katana, sniper, superlaser e sequência de cortes.
- Perks globais e específicos que realmente existem no pool implementado do original.
- Sete bosses: Raiz, Cebola, Cenoura Psíquica, Noz Blindada, Esquilo Ladrão, Árvore Ancestral e Espantalho.
- Rotas Horta → Floresta → Fazenda e seleção de perks após os encontros.
- Hazards como lágrimas, projéteis com gravidade, rolagem, cenouras teleguiadas quebráveis, vento, folhas, corvos e espinhos.
- HUD de vida, munição, cooldowns, Ultimate, carga de sangue do Ninja, barra do boss, pause e skip de encontro.

## Mudanças arquiteturais

A árvore de `Node2D`, `CharacterBody2D`, `Area2D`, sinais e timers da Godot foi substituída por um runtime pequeno orientado a objetos. O loop usa `requestAnimationFrame`; colisões são calculadas diretamente; timers de gameplay usam um scheduler baseado em `dt`, então respeitam pausa; renderização é feita em Canvas e a interface fica em HTML/CSS.

Essa separação evita uma tradução literal de GDScript para JavaScript. A lógica de gameplay não precisa conhecer DOM, o HUD não decide regras de combate, e bosses não dependem de uma scene tree externa. É uma base bem mais adequada para continuar evoluindo como jogo web.

## Observações de fidelidade

O projeto original contém suporte conceitual a raridade `raro`, mas o pool efetivamente implementado não possui perks raros. O port preserva o comportamento real, em vez de inventar perks ausentes. O ZIP também não traz uma biblioteca relevante de áudio externo, então o port não fabrica efeitos sonoros que não faziam parte dos arquivos fornecidos.
