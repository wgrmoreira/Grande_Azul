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

## Segundo fundo — revisão 4

Arquivo final: `assets/img/ocean-ruins.jpg`. Gerado pela ferramenta integrada de imagens e otimizado como JPEG local. Chave, baú e águas-vivas são desenhos animados pelo motor em Canvas, sem imagens ou bibliotecas remotas.

Prompt utilizado:

> Use case: stylized-concept. Production game background, wide landscape 1536x1024. A beautiful hand-painted side-view underwater kelp forest and ancient submerged stone ruins, distinct from a coral shipwreck scene. Turquoise and deep teal water, distant sunken carved stone columns and weathered arch fragments in bottom quarter, emerald kelp, violet and warm orange small corals. Upper 65 percent mostly empty open water for readable gameplay. Soft cinematic light shafts, polished illustrated 2D adventure game style with gentle dimensional shading. Layered atmospheric depth, refined blue-green palette. Entirely submerged. No animals, diver, boats, treasure chests, keys, text or UI. No perspective floor dominating view. This is a scenery backdrop for a side-scrolling scuba game. All decorative ruins are distant background at bottom, not giant foreground obstacles.

## Revisão 5 — novos sprites

Gerados com a ferramenta integrada de imagens e preparados em PNG com alpha:

- `assets/img/chest-closed.png`: baú fechado, 512 × 512.
- `assets/img/chest-open.png`: o mesmo baú aberto, 512 × 512, com base alinhada.
- `assets/img/diver-kick.png`: pose alternativa, 506 × 196, compatível com o sprite original.

O baú substitui o desenho geométrico em Canvas da versão anterior. O mergulhador original foi preservado como primeiro quadro. Não há geração de imagens em tempo de execução.

### Prompt do baú fechado

> Use case: stylized-concept. Reference image is STYLE REFERENCE ONLY: match its polished hand-painted 2D adventure game rendering, crisp dark outlines, richly shaded surfaces, teal and warm gold palette. Create one CLOSED treasure chest game sprite, fully isolated on genuinely transparent alpha background. Medium close side/three-quarter view, lid shut. A charming rounded wooden underwater treasure chest with dark warm mahogany planks, aged golden brass bands, a clear small central keyhole latch, subtle turquoise patina on metal, tiny coral detail at the base. Elegant richly illustrated dimensional game prop, coherent with reference coral rock. No pixel art, no photorealism, no ground, no scene, no text, no colored backdrop or glow. Entire chest fully visible with 10 percent transparent padding all around, landscape composition about 4:3. Intended to display small in a scuba exploration game, strong clean silhouette and clear brass lock.

### Prompt do baú aberto

> Edit target: this exact treasure chest game sprite. Create the OPENED state of the same chest. Raise its curved wooden lid on the back hinges to reveal a modest pile of golden coins inside, no magical effects. Keep the lower box, lock brass hardware, coral decorations, wood grain, viewpoint, palette, painterly outlines and dimensions of lower chest identical. Camera and base position fixed. Complete lid and complete base both fully visible with padding. Genuine transparent alpha background, no backdrop, no floor, no text or glow. Match exactly the same illustrated game style.

### Prompt da pose alternativa escolhida

> Edit this exact scuba diver sprite into a second swim animation pose. The head, hair, mask, tank, torso, arms and hands MUST remain identical. Change the two legs and fins visibly: CLOSE THE SCISSOR KICK. Bring both yellow fins close together near the horizontal centerline behind the hips, almost parallel, one slightly above the other. The high fin must move noticeably DOWN and the low fin must move noticeably UP, with both knees less bent. Keep all limbs present. Keep head and torso fixed, original left-facing side view, exact same character, colors and rendering. Maintain full original canvas proportions and original head/body scale. No added objects. TRUE alpha transparency around the isolated sprite. Do not reproduce the original wide separated fin pose.
