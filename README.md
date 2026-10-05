# Like A Hero — Web

Port web independente do protótipo Godot **Like A Hero**. Esta versão não carrega, exporta nem incorpora o runtime da Godot: o jogo foi reorganizado em HTML, CSS e JavaScript ES Modules com renderização em Canvas 2D.

## Rodando

Como o projeto usa módulos JavaScript, sirva a pasta por HTTP em vez de abrir `index.html` via `file://`.

```bash
python3 -m http.server 8000
```

Depois abra `http://localhost:8000`. Para Vercel, GitHub Pages, Netlify ou outro host estático, publique esta pasta diretamente. Não há build obrigatório e não há dependências de produção.

## Controles

- **A / D** ou **← / →**: mover
- **W / ↑ / Espaço**: pular
- **S / ↓**: agachar no chão / mirar para baixo no ar
- **J**: ataque primário
- **K**: Skill 1
- **N**: Skill 2
- **M**: Ultimate
- **Shift**: dash
- **Esc**: pausa
- **Z segurado por 3s durante a pausa**: pular encontro e voltar ao mapa
- **1 / 2 / 3**: escolher perk

## Arquitetura web

- `src/game.js`: state machine da run, mapa, HUD, loop principal e colisões de alto nível.
- `src/player.js`: movimento, combate, habilidades e estados dos quatro heróis.
- `src/bosses.js`: sete chefes e seus padrões de ataque.
- `src/entities.js`: projéteis, hazards, efeitos e entidades temporárias.
- `src/perks.js`: pool e aplicação dos perks implementados no projeto original.
- `src/backgrounds.js`: cenários procedurais de Horta, Floresta, Fazenda e mapa.
- `src/input.js`: teclado.
- `src/utils.js` / `src/constants.js`: primitivas e configuração.
- `tests/`: smoke tests de personagens, bosses, habilidades e bootstrap da interface.

## Testes

```bash
npm test
```

O `package.json` existe apenas para declarar ES Modules e facilitar os testes. O jogo no navegador não baixa pacote nenhum.
