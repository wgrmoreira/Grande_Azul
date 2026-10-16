# Grande Azul — Expedições

Versão aprimorada do jogo de mergulho enviado em `merguho.zip`.

## Como jogar

1. Extraia **todo o ZIP** para uma pasta.
2. Abra `index.html` em um navegador atualizado, como Edge, Chrome ou Firefox.
3. Clique em **Iniciar mergulho**.

Não é necessário instalar pacotes, criar conta ou ter conexão com a internet. Não abra o HTML de dentro da visualização do ZIP: extraia primeiro. Mantenha as pastas `assets` e os arquivos CSS/JS junto do HTML.

Em celulares, alguns gerenciadores de arquivos mostram apenas uma prévia de HTML e não executam jogos. Nesse caso, abra a pasta por um servidor estático local ou publique os mesmos arquivos em uma hospedagem estática. O jogo não depende de um serviço específico.

Servidor local opcional, caso Python já esteja instalado: abra um terminal nesta pasta, execute `python -m http.server 8000` e acesse `http://localhost:8000`. Isso é opcional no computador.

## Controles

| Ação | Controle |
|---|---|
| Nadar | WASD ou setas |
| Nadar no celular | Arrastar o controle circular |
| Pausar / continuar | Esc, P ou botão Pausar |
| Ligar / desligar som | M ou botão de som |

O jogo pausa ao trocar de janela ou ocultar a aba. Continue pelo botão quando voltar. O som começa desligado; ative-o quando desejar.

## Objetivo e regras

- Encontre moedas de bronze (20 pontos), prata (50) e ouro (100).
- A mochila não tem limite. Os pontos só são garantidos após retornar ao barco, indicado pela bússola e pelo sonar.
- Cada entrega conclui uma descida e sorteia novas posições, alturas, larguras e aparência das rochas, posições e valores dos tesouros, reservas de O₂ e composição do fundo. A velocidade dos tubarões cresce 9% da velocidade inicial a cada mergulho; a quantidade aumenta a cada dois mergulhos, até 12 tubarões, e uma orca passa a acompanhar os níveis a partir da quinta expedição. A exploração é contínua, sem uma fase final obrigatória.
- Somente uma entrega de tesouros no barco recarrega todo o oxigênio, recupera 12 pontos de vida e inicia um novo mergulho. Aproximar-se do barco com a mochila vazia não recarrega o tanque.
- Na superfície, o oxigênio não regenera e não é consumido. Submerso, um tanque cheio dura aproximadamente 38 segundos.
- Há somente duas reservas de O₂ por mergulho. Cada uma recupera 8% do tanque, é consumida uma única vez e não reaparece até a próxima entrega.
- Predadores causam 25 pontos de dano, com 1,6 segundo de proteção após o impacto.
- Sem oxigênio, a vida diminui até encerrar a partida. Tesouros ainda na mochila não entram na pontuação final.
- O sonar mostra você em branco, tesouros em amarelo, o barco em verde e predadores em coral.
- O número de metros é uma escala ilustrativa do jogo, não uma simulação física de mergulho.

Recordes são salvos no navegador após cada entrega e no fim da partida. Se o armazenamento estiver bloqueado, o jogo continua com recordes apenas na sessão. Navegadores, perfis e origens diferentes podem ter recordes diferentes.

## O que foi aprimorado

- Novo fundo pintado de oceano, naufrágio e recifes, mais 12 sprites: mergulhador, barco, tubarão-branco, tubarão-martelo, golfinho, baleia, orca, tartaruga, três peixes e coral sobre rocha.
- Paleta coerente em azul, verde-mar, dourado e coral; transparência real nos sprites e imagens otimizadas para distribuição local.
- Menu, instruções, HUD, pausa e tela final refeitos, com contraste, foco de teclado e avisos em português.
- Câmera contínua, animação de ondas, balanço do barco, plantas, raios de luz, bolhas e partículas de coleta e dano.
- Teclado, controle de toque com captura de ponteiro, bússola, profundidade e sonar.
- Mundo de tamanho fixo e independente do tamanho da janela; rotação e redimensionamento preservam a partida.
- Simulação em passos de 1/60 s, independente da taxa de atualização da tela, com limite para atrasos prolongados.
- Colisões do mergulhador resolvidas por eixo e em pequenos deslocamentos; área de dano dos predadores ajustada ao corpo.
- Recifes renovados com tesouros acima das plataformas, evitando os bolsões fechados da geração sobreposta anterior.
- Fauna preservada: peixes, cardumes, tartarugas, baleia e golfinho que se aproxima e acompanha o jogador. Predadores podem comer peixes, que retornam depois ao cenário.
- Progressão reequilibrada, reservas finitas de oxigênio, recuperação de vida por entrega e avisos de oxigênio crítico.
- Pausa ao perder foco, limpeza dos controles, proteção contra dano imediato ao nascer e tratamento de armazenamento/áudio indisponíveis.
- Preferência do sistema por movimento reduzido respeitada nos efeitos decorativos e no piscar de proteção.

## Estrutura

```
index.html        Interface e telas
style.css         Aparência e adaptação a telas
game.js           Simulação, renderização, áudio e controles
assets/img/       13 imagens usadas pelo jogo
assets/music/     Música original fornecida
LEIA-ME.md        Este guia
ANALISE-E-TESTES.md
ARTE.md           Origem dos assets e instruções de geração
```

HTML, CSS e JavaScript são editáveis. Não há bibliotecas, fontes, CDNs, rastreadores, serviços remotos ou etapa de compilação. `window.GrandeAzul.snapshot()` oferece uma cópia do estado para diagnóstico; as funções que alteram o estado usadas nos testes não fazem parte do pacote final.

## Áudio e arte

A música `oceano.mp3` veio do arquivo enviado e foi mantida. Os novos desenhos foram gerados com a ferramenta de imagens integrada; detalhes em `ARTE.md`. A procedência/licença do áudio original não foi fornecida e não foi reinterpretada nesta revisão.

## Validação

Na versão inicial foram aprovadas 24 verificações automatizadas no Microsoft Edge, incluindo abertura direta por arquivo, partida, teclado, toque em tela emulada, pausa, coleta, entrega, dano, oxigênio, colisões, reinício, recordes e 100 mapas gerados. Também houve revisão visual em desktop e celular retrato/paisagem. Veja os detalhes e limites em `ANALISE-E-TESTES.md`.

## Revisão 2 — oxigênio e imprevisibilidade

Esta revisão acrescenta 10 verificações de regras executadas diretamente no motor, incluindo 1.000 mapas distintos e progressão por 60 mergulhos. Em uma amostra de 100 mapas, a rota automática de referência coletou em média cerca de 50% das moedas (máximo de cerca de 95%), sem predadores. É uma estratégia simples, não uma busca da rota ótima. A intenção é exigir escolhas e retorno antecipado, tendo aproximadamente 60% como referência de coleta parcial; não há um bloqueio artificial que impeça uma moeda após essa porcentagem. Resultados de jogadores reais variam conforme o mapa e a rota.

## Revisão 3 — patrulhas e mergulho noturno

- O mergulhador começa na superfície tanto ao iniciar/reiniciar quanto após cada entrega, sem consumo de oxigênio enquanto permanecer ali.
- Predadores escolhem destinos aleatórios em duas dimensões, respeitando os limites do mundo e as rochas. Ao detectar o mergulhador submerso, seguem sua posição por 3 segundos, com velocidade de perseguição 55% maior, e depois retomam a patrulha por pelo menos 4 segundos antes de poder detectar novamente.
- O raio de detecção começa em 220 unidades do mundo e aumenta 28 unidades a cada mergulho, além da progressão de velocidade e quantidade já existente.
- O painel de Águas Rasas desaparece quando o jogador submerge e volta ao retornar à superfície.
- O sonar ocupa a posição superior central. Pontos entregues, mochila e distância do barco ficam em instrumentos menores agrupados na parte inferior.
- As fases 3, 6, 9, 12 e assim por diante são noturnas. Uma máscara escurece o cenário; o mergulhador ilumina uma área próxima e projeta um facho na direção do nado. Os instrumentos continuam legíveis. A fase seguinte volta a ser diurna.

As 14 verificações desta revisão estão registradas em `TESTES-V3.json`. Foram repetidas também as 10 verificações de regras da revisão anterior. Elas executam o motor com DOM e Canvas simulados; não houve nova revisão visual em navegador nesta versão.
