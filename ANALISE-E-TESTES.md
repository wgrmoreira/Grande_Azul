# Inspeção e validação

Data: 15 de outubro de 2026.

## Arquivo de origem

Foi inspecionado o `merguho.zip` anexado à conversa original. O caminho `/mnt/data/merguho.zip` não existe neste ambiente Windows; o mesmo anexo foi recuperado pelo vínculo da conversa.

O pacote continha um HTML com CSS e JavaScript embutidos, 18 imagens e uma faixa MP3. Todo o HTML/CSS/JavaScript foi lido. As 18 imagens foram catalogadas por dimensões e formato e examinadas visualmente em uma folha de contato. O áudio foi mantido como recurso local e seu carregamento foi preservado; não houve avaliação musical ou de licença.

## Conceito preservado

Mergulho livre em um mundo lateral, mochila de tesouros de três valores, entrega automática no barco, descidas sucessivas, oxigênio e vida, perigos marinhos, recargas subaquáticas, recordes locais, música e efeitos sonoros. Fauna inclui os três peixes, cardumes, tubarões, orca, baleia, tartaruga e golfinho que acompanha o jogador.

## Principais achados e tratamento

| Achado na origem | Tratamento |
|---|---|
| Movimento, consumo e timers avançavam por quadro | Simulação fixa em segundos, acumulador e limite de atraso |
| Mundo, posições e raios dependiam da largura/altura da tela | Coordenadas de mundo fixas e câmera responsiva |
| Mudança abrupta entre seis telas | Câmera contínua seguindo o jogador |
| Controle apenas por mouse/toque no painel inferior | Teclado e joystick de toque sobreposto ao cenário |
| Sem pausa ou limpeza adequada ao perder foco/cancelar toque | Pausa automática, captura e cancelamento de ponteiro |
| Leitura e gravação diretas em localStorage | Tratamento de erro e fallback em memória |
| Áudio criado antes de interação e tratamento limitado | Inicialização dos efeitos sob interação e falhas não bloqueantes |
| Múltiplos estilos e espaços transparentes irregulares nos sprites | Novo conjunto visual coerente com sprites recortados e alpha |
| Colisões amplas por distância/retângulo, nem sempre alinhadas ao desenho | Elipse corporal para predadores e círculo contra plataformas |
| Empilhamento aleatório podia dificultar acesso aos tesouros | Plataformas separadas e tesouros acima delas com área livre |
| Aviso de dano desenhado antes da renderização podia ser apagado | Efeito de dano desenhado após a cena |
| Reinício não limpava explicitamente todo o estado transitório | Reset de controles, proteção, mochila, efeitos e progressão |

A implementação foi reorganizada em três arquivos, mantendo o objetivo original e reequilibrando velocidades, recargas, fauna e geração de cenários. Não se trata de um simulador realista de mergulho.

## Verificações aprovadas

1. Todas as 13 imagens finais carregam.
2. Partida inicia com vida e oxigênio completos.
3. Setas movimentam o mergulhador.
4. Oxigênio diminui debaixo d’água.
5. Pausa congela posição e oxigênio.
6. Coleta acumula na mochila, sem pontuar antes de entregar.
7. Entrega garante pontos, renova o nível e recarrega oxigênio.
8. Recorde salvo na entrega.
9. Bolha recarrega oxigênio e entra em recarga.
10. Predador causa 25 de dano.
11. Proteção temporária impede dano repetido imediato.
12. Colisão impede atravessar a plataforma.
13. Redimensionamento mantém dimensões do mundo e entidades.
14. Falta de oxigênio leva ao fim da partida.
15. Reinício restaura vida e limpa placar e descidas.
16. Cem mapas: 22 tesouros por mapa, nenhum dentro das rochas.
17. Controle por ponteiro movimenta o jogador em tela de toque emulada.
18. Tela móvel não transborda horizontalmente.
19. Rotação da tela preserva posição do mundo com a partida pausada.
20. Imagens carregam ao abrir o HTML diretamente, sem servidor.
21. Partida inicia pelo protocolo de arquivo local.
22. Armazenamento bloqueado não impede jogar.
23. Nenhum erro de JavaScript capturado no cenário testado.
24. Nenhum recurso ausente capturado no cenário testado.

Os testes de regras usam instrumentação temporária do código no navegador para controlar posição, passos da simulação e situações de dano. Essa instrumentação não está no jogo entregue. Teclado, botões e ponteiro também foram exercitados como eventos de interface.

## Revisão visual e limites

Capturas revisadas em 1440 × 900, 390 × 844 e 844 × 390, com ajustes após a revisão de câmera, tamanho do jogador, disposição do HUD e textura das plataformas. As telas móveis foram emuladas no Edge: não houve teste em aparelho físico, Safari/iOS ou todos os navegadores. Reprodução de som continua sujeita às preferências do navegador e à ativação pelo usuário. Os testes confirmam os cenários listados, não ausência absoluta de bugs.

## Revisão 2: regras de oxigênio e geração aleatória

As 24 verificações de navegador acima descrevem a primeira entrega. Nesta revisão, foram executadas 10 verificações adicionais diretamente no motor JavaScript, com interface e áudio simulados, sem navegador:

- Superfície mantém o tanque estável, sem consumir ou regenerar.
- Barco com mochila vazia não recarrega nem renova o mapa.
- Tanque dura 38 segundos submerso.
- Reserva concede somente 8% de oxigênio.
- Reservas consumidas não reaparecem após esperar.
- Entrega garante pontos e recarrega o tanque a 100%.
- Entrega sorteia outra composição de fundo e outras rochas.
- Ao longo de 60 mergulhos, a velocidade aumenta em todos e o número de predadores nunca diminui.
- 1.000 mapas distintos: 22 moedas e duas reservas em todos, com área de coleta livre das rochas.
- Em 100 rotas automáticas de referência, sem predadores, nenhuma coletou todas as moedas.

A estratégia automática busca itens próximos e tenta retornar ao barco com reserva de tempo. Não é uma solução ótima e não substitui testes com jogadores. A amostra de balanceamento registrada teve média de aproximadamente 50%, mínimo de 14% e máximo de 95% de moedas coletadas. O objetivo aproximado de 60% depende de habilidade e rota, sem bloqueio artificial da coleta. O motor continua permitindo sobrevivência temporária com perda de vida ao esgotar o oxigênio.

Esta revisão não repetiu os testes em navegador; as mudanças de interface se limitam aos textos das regras.
