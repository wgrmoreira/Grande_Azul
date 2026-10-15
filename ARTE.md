# Arte e recursos

Ferramenta utilizada: geração de imagens integrada (`image_gen`), sem API externa configurada pelo usuário. Os desenhos finais foram copiados para o pacote; não há geração de imagens durante o jogo.

## Assets finais

`assets/img/ocean.jpg`: ambiente marinho com recife, naufrágio e arco de pedra.

`assets/img/diver.png`, `boat.png`, `shark.png`, `hammer.png`, `dolphin.png`, `whale.png`, `orca.png`, `turtle.png`, `fish1.png`, `fish2.png`, `fish3.png`, `rock.png`: sprites extraídos de um atlas gerado para esta revisão, com fundo transparente e dimensões ajustadas. O recorte remove fragmentos dos sprites vizinhos e preserva as bordas com alpha.

`assets/music/oceano.mp3`: música do pacote enviado, conservada sem alteração.

Ondas, céu, luz, plantas, estratos rochosos, moedas, sonar e partículas são desenhados pelo próprio jogo em Canvas. A interface usa CSS e fontes do sistema.

## Prompts de geração

### Fundo

> Use case: stylized-concept. Create a premium hand-painted 2D side-scrolling underwater adventure game environment background, wide landscape 1536x1024. Entirely submerged ocean scene with luminous turquoise water at top transitioning to deep navy at bottom. Upper 70 percent is OPEN empty swimmable water, very soft shafts of sunlight, gentle distant ocean silhouettes. Bottom 25 percent richly painted teal rock shelves, small magenta and orange coral, sand, a distant old shipwreck on left and a rocky arch on right. Sophisticated painterly game art, restrained detail, atmospheric depth, cohesive teal blue warm coral palette, delicate caustic light. Flat SIDE VIEW, no perspective floor extending toward camera. NO animals, NO diver, NO text, NO interface, NO bubbles in foreground. This will be an actual scrolling game background, keep the middle extremely readable.

### Atlas

> Use case: stylized-concept. Create a production 2D game SPRITE ATLAS on genuinely transparent background. Image 1536x1024 landscape, exact regular grid 3 columns by 4 rows, each cell 512 wide x 256 tall. Twelve separate full-body game sprites, precisely one centered in each cell, all contained with 35px padding, NO grid lines, NO labels, NO text. Cohesive polished hand-painted illustrated adventure game style, elegant clean outlines, soft dimensional shading, teal/navy/gold/coral accents. All swimming animals and diver face LEFT. Row 1: cell1 horizontal swimming scuba diver with navy wetsuit, golden fins, oxygen tank and cyan mask; cell2 small wooden exploration sailboat side-view, cream sail, orange hull; cell3 full-body great white shark side-view, streamlined and readable. Row 2: cell1 hammerhead shark side-view; cell2 friendly dolphin side-view; cell3 blue whale side-view. Row 3: cell1 orca side-view; cell2 sea turtle side-view; cell3 small orange clownfish side-view. Row 4: cell1 yellow and blue angelfish side-view; cell2 small silver blue sardine side-view; cell3 broad low teal rock with small pink coral and seaweed. Consistent stylization and lighting, no photorealism, no pixel art. Each object wholly isolated within its own exact 512x256 cell, never overlapping adjacent cells. Clear alpha transparency around each sprite.

### Edição do atlas para transparência

> Edit target: the attached 1536x1024 sprite atlas. Remove ALL background completely to genuine alpha transparency. Keep the 12 characters and rock exactly as drawn in their exact positions and sizes. Remove the navy, teal, brown and golden gradient backdrop and ALL colored glow around each object. Background extraction only. All negative space between and around the sprites must be transparent. Preserve fins, tails, outlines, internal details, all sprite artwork. Do not move, redraw or add anything. Exact same canvas dimensions and same 3 column 4 row grid positions. Transparent PNG game asset.
