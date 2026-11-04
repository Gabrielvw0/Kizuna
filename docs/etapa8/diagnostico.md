# Etapa 8 — Diagnóstico visual (estado em `pre-etapa8`)

Capturas em 1440 × 900 das 30 cenas. Pastas: `antes/` (estado da Etapa 7) e `depois/` (amostra).

## Problemas que se repetem em toda a apresentação

| # | Problema | Onde aparece |
|---|---|---|
| 1 | **Mesmo arranjo em quase todas as telas**: rótulo + título no canto superior esquerdo, linha de 2–4 cartões arredondados escuros e um cartão largo embaixo. | 02, 03, 04, 06, 07, 08, 09, 11 |
| 2 | **Títulos pequenos para um palco**: no máximo 36 px em 1440 px, sem contraste de escala com o corpo. | todas, exceto 01 e 12 |
| 3 | **Leitura a distância fraca**: corpo de 12–14 px, selos de 9 px, rótulos em fonte mono de 10–11 px. | todas |
| 4 | **Conteúdo espremido numa faixa central** (≈ 30 % a 72 % da altura): o terço superior e o inferior ficam vazios, sem função narrativa. | 02, 03, 04, 06, 07, 10, 11 |
| 5 | **3D atravessando o texto**: o anel da fusão (03.5), o tubo do fio vermelho (04), as barras (08.2), o trilho do trem (09.1) e o cone do funil (09.4) passam por cima de títulos e cartões. | 03.5, 04, 08.2, 09.1, 09.4 |
| 6 | **3D só decorativo**: esferas soltas (10), losangos (11) e cubos aramados (08.1) não dizem nada sobre o conteúdo. | 08.1, 10, 11 |
| 7 | **Cores demais**: rosa, esmeralda, céu, âmbar, roxo e laranja disputam atenção; o rosa (#f43f5e) puxa para o neon, não para o vermelho japonês. | todas |
| 8 | **Estética de painel técnico**: rótulos mono em caixa alta por toda parte, brilhos neon e o aviso "NEXT SCREEN ██████" depois de cada troca. | chrome e telas |
| 9 | **Transições iguais**: o mesmo fade com desfoque em todas as trocas; não há variação de ritmo entre impacto, narrativa e evidência. | todas |

## Diagnóstico por tela

| Tela | Problemas | Proposta | Família |
|---|---|---|---|
| 01 Abertura | Bom impacto, mas título em sans genérico; slogan dentro de uma "pílula" de botão. | Título editorial em serifa, 絆 maior, slogan entre dois fios vermelhos, véu de leitura sobre o globo. | A |
| 02.1 PMEs | Números dentro de cartões; números grandes, mas em fonte mono. | Números de impacto sem caixa, cada um aberto por um fio vermelho; fonte e selo legíveis. | C |
| 02.2 1908 | Um cartão sozinho com muito vazio em volta. | "1908" domina em dourado vazado; a afirmação fica à direita, separada por um fio. | A |
| 03.1–03.4 Portas | Quatro cartões + dois cartões iguais aos das telas 02 e 04; texto principal em 16–18 px. | Índice vertical das portas à esquerda (kanji grande) e leitura à direita: "espera" → fio vermelho → "exige". | B |
| 03.5 Síntese | Anel 3D passa por trás de cartões e corta o título. | Tríptico: Global à esquerda, Local à direita, a fusão 3D livre no centro como elemento dominante. | A |
| 04 Start | Mesma linha de 4 cartões da tela 03; tubo 3D cruza o texto; preço pequeno no canto. | Lista numerada 01–04 sem cartões; preço como figura editorial à direita; véu de leitura. | B |
| 05 Demonstração | Funciona bem; guia lateral com textos de 12 px. | Manter a interface (aprovada). Só tipografia do guia e cores do chrome. | C |
| 06 Adaptação | Dois cartões grandes iguais, com um quadro 3D vazio atrás. | Composição "antes/depois" em duas colunas assimétricas; japonês grande como protagonista. | B |
| 07 Confiança | Quatro cartões em linha; o portão 3D fica atrás do texto. | Fluxo em linha horizontal com o fio vermelho ligando as etapas; botão Hanko destacado como único vermelho sólido. | B/A |
| 08.1 Planos | Cubos aramados decorativos; anéis pequenos. | Anéis grandes à esquerda como elemento dominante; escopo em lista editorial. | C |
| 08.2 Receita | Barras 3D atravessam a nota de rodapé; muitos cartões. | Dois números grandes (MRR, ARR) e três itens em linha; nota fora da área das barras. | C |
| 09.1–09.3 Rota | Trilho 3D corta o título; estações pequenas. | Título no alto; estações sobre o trilho como linha do tempo; véu de leitura. | B |
| 09.4 Aquisição | Cone 3D atrás do funil; canais em botões pequenos. | Funil maior e legível à direita; canais como lista. | C |
| 10 Posicionamento | Esferas 3D decorativas; matriz pequena. | Matriz grande ocupando 60 % da tela; comparação ao lado. | C |
| 11 Riscos e marcos | Losangos decorativos; quatro cartões de novo. | Riscos em lista com destaque lateral; marcos em linha do tempo horizontal. | B/C |
| 12 Encerramento | Três cartões soltos; muitos botões. | Frase final como protagonista; síntese em uma linha; botões discretos. | A |

## Direção visual adotada

- **Cores** (`tailwind.config.js`): `sumi` (preto/grafite), `washi` (branco papel), `beni` (vermelho japonês, assinatura), `kin` (dourado) e `ai` (índigo) só como apoio.
- **Tipografia**: títulos e números em serifa editorial (Noto Serif JP, já carregada); corpo em Inter, sem caixa alta mono.
- **Akai ito**: fio vermelho fino com um nó, usado como divisor, marcador e conector entre ideias.
- **Profundidade controlada**: véu escuro só atrás do texto; o 3D continua visível e, quando narra algo (fusão da 03.5), fica no centro livre.
- **Telas baixas**: variante `short:` (altura ≤ 780 px) compacta a composição em 800 × 600 e 1024 × 768.
- **Componentes**: `src/components/strategic/Editorial.tsx` (`Kicker`, `DisplayTitle`, `Accent`, `Classification`, `AkaiIto`, `LegibilityVeil`).

## Amostra implementada (telas 01–04)

Mostra as três famílias: A (01, 02.2, 03.5), B (03.1–03.4, 04) e C (02.1).
As telas 05–12 continuam como estavam até a validação desta amostra.
