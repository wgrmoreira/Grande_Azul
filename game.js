/* Grande Azul — motor local, sem bibliotecas ou requisições externas. */
'use strict';
(() => {
const $=id=>document.getElementById(id), canvas=$('ocean'), ctx=canvas.getContext('2d'), map=$('map'), mc=map.getContext('2d');
const WORLD={w:3000,h:1700,surface:180}, STEP=1/60, TAU=Math.PI*2;
const OXYGEN={seconds:38,bubbleGain:8,bubbles:2};
let scenery={flip:false,cropX:0,cropY:0,cropScale:1,hue:0};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), rnd=(a,b)=>a+Math.random()*(b-a), distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let state='menu', previous=0, accumulator=0, simTime=0, visualTime=0, vw=0,vh=0,scale=1,dpr=1;
let camera={x:900,y:0}, player, rocks=[],treasures=[],air=[],animals=[],enemies=[],particles=[];
let score=0,carrying=0,bagValue=0,dives=0,deposited=0,elapsed=0,invincible=0,toastTime=0,lastBeep=0,damageFlash=0,saveWarning=false;
let keys=new Set(),pointer=null,joy={x:0,y:0},audioContext=null,muted=true,loaded=false;
const boat={x:1500,y:WORLD.surface-2,w:225,h:135};
const nightCanvas=document.createElement('canvas'),nightCtx=nightCanvas.getContext('2d');
const isNight=()=> (dives+1)%3===0;
const music=new Audio('assets/music/oceano.mp3');music.loop=true;music.volume=.24;
const images={},records={score:0,dives:0};
try {records.score=Number(localStorage.getItem('grandeAzul_score'))||0;records.dives=Number(localStorage.getItem('grandeAzul_dives'))||0;}catch(e){saveWarning=true;}
const sources={background:'ocean.jpg',diver:'diver.png',boat:'boat.png',shark:'shark.png',hammer:'hammer.png',dolphin:'dolphin.png',whale:'whale.png',orca:'orca.png',turtle:'turtle.png',fish1:'fish1.png',fish2:'fish2.png',fish3:'fish3.png',rock:'rock.png'};
const ready=Promise.all(Object.entries(sources).map(([key,path])=>new Promise(resolve=>{const im=new Image();images[key]=im;im.onload=()=>resolve(true);im.onerror=()=>{console.warn('Asset indisponível:',path);resolve(false)};im.src='assets/img/'+path}))).then(results=>{loaded=true;$('start').disabled=false;$('loading').textContent=results.every(Boolean)?'Pronto para explorar. Sem instalação. Sem conexão.':'Algumas imagens não carregaram. Os elementos de segurança continuam disponíveis.';return results;});
$('start').disabled=true;
function updateRecords(){$('record').textContent=records.score.toLocaleString('pt-BR');$('recordDives').textContent=records.dives;}
updateRecords();
function persist(){records.score=Math.max(records.score,score);records.dives=Math.max(records.dives,dives);try{localStorage.setItem('grandeAzul_score',records.score);localStorage.setItem('grandeAzul_dives',records.dives)}catch(e){saveWarning=true}updateRecords();}
function toast(text){$('toast').textContent=text;$('toast').classList.add('show');toastTime=4;}
function beep(type){if(muted)return;try{audioContext ||= new (window.AudioContext||window.webkitAudioContext)();audioContext.resume().catch(()=>{});let osc=audioContext.createOscillator(),gain=audioContext.createGain(),now=audioContext.currentTime;const settings={coin:[650,1100,.14],deposit:[400,1300,.5],air:[250,700,.3],damage:[140,45,.3],warn:[800,650,.1]};const [from,to,duration]=settings[type]||settings.coin;osc.type=type==='damage'?'triangle':'sine';osc.frequency.setValueAtTime(from,now);osc.frequency.exponentialRampToValueAtTime(to,now+duration);gain.gain.setValueAtTime(.08,now);gain.gain.exponentialRampToValueAtTime(.001,now+duration);osc.connect(gain);gain.connect(audioContext.destination);osc.start();osc.stop(now+duration);osc.onended=()=>{osc.disconnect();gain.disconnect()}}catch(e){/* A jogabilidade independe do áudio. */}}
function syncMusic(){if(!muted&&state==='playing'&&player.y>WORLD.surface+20)music.play().catch(()=>{});else music.pause();}
function toggleSound(){muted=!muted;$('sound').textContent=muted?'Som desligado':'Som ligado';$('sound').setAttribute('aria-label',muted?'Ativar som':'Desativar som');beep('air');syncMusic()}
function resize(){vw=innerWidth;vh=innerHeight;dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(vw*dpr);canvas.height=Math.round(vh*dpr);nightCanvas.width=canvas.width;nightCanvas.height=canvas.height;scale=clamp(Math.min(vw/1100,vh/720),.65,1.8);ctx.setTransform(dpr,0,0,dpr,0,0);}
addEventListener('resize',resize);resize();
function circleRect(x,y,r,b){let nx=clamp(x,b.x,b.x+b.w),ny=clamp(y,b.y,b.y+b.h);return (x-nx)**2+(y-ny)**2<r*r;}
function clearAt(x,y,r=25){return !rocks.some(b=>circleRect(x,y,r,b));}
function predatorFloor(e){return Math.min(1080,...rocks.filter(r=>e.x+e.w*.4>r.x&&e.x-e.w*.4<r.x+r.w).map(r=>r.y-e.h*.5-12));}
function buildLevel(){
 rocks=[];treasures=[];air=[];enemies=[];animals=[];particles=[];
 // Colunas independentes com corredores livres; alturas, larguras e posições são sorteadas novamente.
 scenery={flip:Math.random()<.5,cropX:Math.random(),cropY:Math.random(),cropScale:rnd(.76,1),hue:rnd(-16,16)};
 const cells=17,cell=WORLD.w/cells;
 for(let i=0;i<cells;i++){let w=rnd(88,128),x=i*cell+rnd(15,cell-w-12),y=rnd(920,1500);rocks.push({x,y,w,h:WORLD.h-y+50,variant:Math.floor(rnd(0,3))});}
 const values=[20,50,100];
 rocks.forEach(r=>{let value=values[Math.floor(rnd(0,3))];treasures.push({x:r.x+r.w*rnd(.3,.7),y:r.y-rnd(38,65),r:13,value,collected:false,phase:rnd(0,TAU)});});
 // Moedas em água aberta também mudam de lugar e de valor a cada entrega.
 for(let i=0;i<5;i++){let x=(i+.5)*WORLD.w/5+rnd(-160,160),y=rnd(480,850);treasures.push({x,y,r:13,value:values[Math.floor(rnd(0,3))],collected:false,phase:rnd(0,TAU)});}
 // Reservas pequenas, finitas e sem reaparecimento: esperar no fundo não produz oxigênio infinito.
 for(let i=0;i<OXYGEN.bubbles;i++){let x=rnd(150+i*1500,1350+i*1500),y=rnd(700,1250);while(!clearAt(x,y,55))y-=35;air.push({x,y,r:23,active:true});}
 const count=Math.min(12,2+Math.floor(dives/2)),dangerSpeed=65*(1+dives*.09);
 for(let i=0;i<count;i++){let x=rnd(180,2820),y=rnd(470,1050);enemies.push({x,y,w:i%2?170:190,h:72,vx:(Math.random()<.5?-1:1)*dangerSpeed,vy:0,kind:i%2?'hammer':'shark',phase:rnd(0,TAU)});}
 if(dives>=4)enemies.push({x:rnd(180,2820),y:rnd(600,1000),w:215,h:92,vx:-dangerSpeed*1.15,vy:0,kind:'orca',phase:0});
 for(const e of enemies){e.y=Math.min(e.y,predatorFloor(e));e.baseSpeed=Math.abs(e.vx);e.detection=220+dives*28;e.mode='wander';e.chaseLeft=0;e.cooldown=0;e.turnLeft=0;e.targetX=e.x;e.targetY=e.y;}
 for(let i=0;i<42;i++)animals.push({kind:'fish'+(i%3+1),x:rnd(40,2960),y:rnd(320,1220),w:rnd(34,62),h:30,vx:rnd(18,40)*(i%2?1:-1),phase:rnd(0,TAU),eaten:0});
 for(let school=0;school<3;school++)for(let i=0;i<8;i++)animals.push({kind:'fish3',x:450+school*850+i*28,y:570+school*170+(i%3)*23,w:35,h:19,vx:32*(school%2?-1:1),phase:school,eaten:0});
 for(let i=0;i<3;i++)animals.push({kind:'turtle',x:rnd(200,2800),y:rnd(500,1100),w:95,h:45,vx:i%2?-27:27,phase:rnd(0,TAU)});
 animals.push({kind:'whale',x:2300,y:570,w:420,h:155,vx:-22,phase:1});
 animals.push({kind:'dolphin',x:1350,y:520,w:145,h:62,vx:55,phase:2,mode:'wander',timer:0});
 invincible=2;lastBeep=0;
}
function resetInput(){keys.clear();joy.x=joy.y=0;pointer=null;$('thumb').style.transform='';}
function start(){if(!loaded)return;resetInput();score=carrying=bagValue=dives=deposited=elapsed=0;player={x:1460,y:WORLD.surface+10,r:19,vx:0,vy:0,health:100,oxygen:100,facing:1};state='playing';buildLevel();camera={x:player.x-vw/scale/2,y:0};for(const id of ['menu','pauseScreen','gameover'])$(id).classList.add('hidden');for(const id of ['hud','radar','dock'])$(id).classList.remove('hidden');$('pause').disabled=false;damageFlash=0;toast('Siga os brilhos. Entregue os tesouros no barco.');syncMusic();updateHUD();if(saveWarning)toast('Armazenamento indisponível: recordes valem somente nesta sessão.');canvas.focus();}
function pause(){if(state!=='playing')return;state='paused';resetInput();$('pauseScreen').classList.remove('hidden');music.pause();$('resume').focus();}
function resume(){if(state!=='paused')return;state='playing';$('pauseScreen').classList.add('hidden');resetInput();syncMusic();}
function die(){state='gameover';persist();music.pause();resetInput();$('cause').textContent=player.oxygen<=0?'O oxigênio acabou durante o mergulho.':'Os predadores encerraram esta expedição.';$('finalScore').textContent=score.toLocaleString('pt-BR');$('finalDives').textContent=dives;$('lost').textContent=carrying?`${carrying} tesouros ficaram na mochila. Entregue no barco para garantir os pontos.`:'Seus pontos entregues estão garantidos.';$('gameover').classList.remove('hidden');$('restart').focus();}
function toMenu(){state='menu';music.pause();resetInput();$('pause').disabled=true;for(const id of ['hud','radar','dock','gameover','pauseScreen'])$(id).classList.add('hidden');$('menu').classList.remove('hidden');$('start').focus();}
function burst(x,y,color,count=12){if(reduced)count=3;for(let i=0;i<count;i++)particles.push({x,y,vx:rnd(-55,55),vy:rnd(-85,10),life:rnd(.5,1.2),max:1.2,r:rnd(2,5),color});}
function movePlayer(dt,axis,speed){let delta=axis==='x'?player.vx:player.vy;if(!delta)return;let steps=Math.max(1,Math.ceil(Math.abs(delta*dt)/10));for(let i=0;i<steps;i++){player[axis]+=delta*dt/steps;for(const b of rocks)if(circleRect(player.x,player.y,player.r,b)){if(axis==='x')player.x=delta>0?b.x-player.r:b.x+b.w+player.r;else player.y=delta>0?b.y-player.r:b.y+b.h+player.r;}}player.x=clamp(player.x,player.r,WORLD.w-player.r);player.y=clamp(player.y,WORLD.surface+10,WORLD.h-player.r);}
function updatePredator(e,dt){
 e.phase+=dt;e.cooldown=Math.max(0,e.cooldown-dt);
 if(e.mode==='chase'){
  e.chaseLeft=Math.max(0,e.chaseLeft-dt);
  if(e.chaseLeft<=0){e.mode='wander';e.cooldown=4;e.turnLeft=0;}
 }else if(e.cooldown<=0&&player.y>WORLD.surface+26&&distance(e,player)<e.detection){e.mode='chase';e.chaseLeft=3;}
 if(e.mode==='chase'){e.targetX=player.x;e.targetY=player.y;}
 else{e.turnLeft-=dt;if(e.turnLeft<=0||Math.hypot(e.targetX-e.x,e.targetY-e.y)<65){e.turnLeft=rnd(1.4,3.8);e.targetX=rnd(100,WORLD.w-100);e.targetY=rnd(WORLD.surface+100,WORLD.h-100);for(let n=0;n<30&&!clearAt(e.targetX,e.targetY,e.h*.55);n++){e.targetX=rnd(100,WORLD.w-100);e.targetY=rnd(WORLD.surface+100,WORLD.h-100);}}}
 const angle=Math.atan2(e.targetY-e.y,e.targetX-e.x),speed=e.baseSpeed*(e.mode==='chase'?1.55:1),blend=Math.min(1,dt*2.6);
 e.vx+=(Math.cos(angle)*speed-e.vx)*blend;e.vy+=(Math.sin(angle)*speed-e.vy)*blend;
 const oldX=e.x,oldY=e.y;e.x=clamp(e.x+e.vx*dt,e.w*.45,WORLD.w-e.w*.45);
 if(rocks.some(r=>circleRect(e.x,e.y,e.h*.43,r))){e.x=oldX;e.vx*=-.5;e.turnLeft=0;}
 e.y=clamp(e.y+e.vy*dt,WORLD.surface+75,WORLD.h-e.h*.5);
 if(rocks.some(r=>circleRect(e.x,e.y,e.h*.43,r))){e.y=oldY;e.vy*=-.5;e.turnLeft=0;}
}
function drawNight(){
 const x=(player.x-camera.x)*scale,y=(player.y-camera.y)*scale;
 nightCtx.setTransform(dpr,0,0,dpr,0,0);nightCtx.globalCompositeOperation='source-over';nightCtx.clearRect(0,0,vw,vh);nightCtx.fillStyle='rgba(0,5,17,.975)';nightCtx.fillRect(0,0,vw,vh);
 nightCtx.globalCompositeOperation='destination-out';
 const halo=nightCtx.createRadialGradient(x,y,15*scale,x,y,155*scale);halo.addColorStop(0,'rgba(0,0,0,.98)');halo.addColorStop(.35,'rgba(0,0,0,.85)');halo.addColorStop(1,'rgba(0,0,0,0)');nightCtx.fillStyle=halo;nightCtx.fillRect(x-155*scale,y-155*scale,310*scale,310*scale);
 const aim=Math.atan2(player.vy,Math.abs(player.vx)+30),direction=player.facing===-1?aim:Math.PI-aim,radius=340*scale;
 nightCtx.save();nightCtx.beginPath();nightCtx.moveTo(x,y);nightCtx.arc(x,y,radius,direction-.48,direction+.48);nightCtx.closePath();nightCtx.clip();
 const beam=nightCtx.createRadialGradient(x,y,10,x,y,radius);beam.addColorStop(0,'rgba(0,0,0,.92)');beam.addColorStop(.4,'rgba(0,0,0,.72)');beam.addColorStop(1,'rgba(0,0,0,0)');nightCtx.fillStyle=beam;nightCtx.fillRect(x-radius,y-radius,radius*2,radius*2);nightCtx.restore();nightCtx.globalCompositeOperation='source-over';ctx.drawImage(nightCanvas,0,0,vw,vh);
}
function update(dt){
 simTime+=dt;
 if(state!=='playing')return;
 elapsed+=dt;invincible=Math.max(0,invincible-dt);damageFlash=Math.max(0,damageFlash-dt*2);
 let ix=joy.x+(keys.has('arrowright')||keys.has('d')?1:0)-(keys.has('arrowleft')||keys.has('a')?1:0),iy=joy.y+(keys.has('arrowdown')||keys.has('s')?1:0)-(keys.has('arrowup')||keys.has('w')?1:0),len=Math.hypot(ix,iy);if(len>1){ix/=len;iy/=len;}
 const depth=clamp((player.y-WORLD.surface)/(WORLD.h-WORLD.surface),0,1),speed=240*(1-depth*.25);
 player.vx+=(ix*speed-player.vx)*Math.min(1,dt*9);player.vy+=(iy*speed-player.vy)*Math.min(1,dt*9);
 if(Math.abs(player.vx)>8)player.facing=player.vx>0?-1:1;
 movePlayer(dt,'x',speed);movePlayer(dt,'y',speed);
 const atBoat=Math.abs(player.x-boat.x)<boat.w*.55&&player.y<WORLD.surface+72;
 if(atBoat&&carrying){score+=bagValue;deposited+=carrying;dives++;let gain=bagValue;carrying=bagValue=0;player.oxygen=100;player.health=Math.min(100,player.health+12);persist();buildLevel();player.x=1460;player.y=WORLD.surface+10;player.vx=player.vy=0;resetInput();beep('deposit');toast(`Entrega: +${gain} pontos · O₂ completo · Mergulho ${dives+1} mais perigoso`);burst(player.x,player.y,'#b3f6d9',22);}
 else if(player.y>WORLD.surface+26)player.oxygen=Math.max(0,player.oxygen-dt*100/OXYGEN.seconds);
 // Na superfície o tanque fica estável, mesmo junto ao barco sem tesouros.
 if(player.oxygen<=0&&player.y>WORLD.surface+26)player.health=Math.max(0,player.health-dt*7);
 if(player.oxygen<30&&elapsed-lastBeep>4){lastBeep=elapsed;beep('warn');if(player.oxygen<15)toast('Oxigênio crítico. Volte ao barco ou encontre uma bolha de O₂.');}
 for(const t of treasures)if(!t.collected&&distance(player,t)<player.r+t.r+5){t.collected=true;carrying++;bagValue+=t.value;beep('coin');burst(t.x,t.y,t.value===100?'#f4cf80':'#c4edf0');if(carrying===1)toast('Tesouro encontrado! Volte ao barco para garantir os pontos.');}
 for(const b of air){if(b.active&&distance(player,b)<player.r+b.r){player.oxygen=Math.min(100,player.oxygen+OXYGEN.bubbleGain);b.active=false;beep('air');burst(b.x,b.y,'#b0f4ff');toast(`+${OXYGEN.bubbleGain}% de oxigênio · Reserva consumida`);}}
 for(const a of animals){a.phase+=dt;if(a.eaten>0){a.eaten-=dt;if(a.eaten<=0){a.x=a.vx>0?-a.w:WORLD.w+a.w;a.y=rnd(320,1150);}continue;}a.x+=a.vx*dt;if(a.x<-a.w)a.x=WORLD.w+a.w;if(a.x>WORLD.w+a.w)a.x=-a.w;
 if(a.kind==='dolphin'){a.timer-=dt;if(a.mode==='wander'&&distance(a,player)<340){a.mode='follow';a.timer=7;}if(a.mode==='follow'){a.x+=(player.x-100-a.x)*dt*.45;a.y+=(player.y-45-a.y)*dt*.6;if(a.timer<=0){a.mode='leave';a.timer=9;}}else if(a.mode==='leave'&&a.timer<=0)a.mode='wander';a.y=clamp(a.y,WORLD.surface+100,1180);}}
 for(const e of enemies){updatePredator(e,dt);
 for(const a of animals)if(a.kind.startsWith('fish')&&!a.eaten&&Math.abs(a.x-(e.x+Math.sign(e.vx)*e.w*.34))<28&&Math.abs(a.y-e.y)<28)a.eaten=12;
 // Elipse alinhada ao corpo, independente do retângulo transparente do sprite.
 if(invincible<=0&&((player.x-e.x)/(e.w*.39+player.r))**2+((player.y-e.y)/(e.h*.3+player.r))**2<1){player.health=Math.max(0,player.health-25);invincible=1.6;damageFlash=.5;player.vx+=(player.x<e.x?-1:1)*170;beep('damage');burst(player.x,player.y,'#ef9e89');toast('Cuidado com os predadores! −25 de vida');}}
 if(!reduced&&Math.random()<dt*7&&player.y>WORLD.surface+40)particles.push({x:player.x+player.facing*28,y:player.y-9,vx:rnd(-9,9),vy:-rnd(25,50),life:2,max:2,r:rnd(2,4),color:'#c4f5ff'});
 if(player.health<=0)die();
}
function updateHUD(){if(!player)return;$('mission').classList.toggle('hidden',player.y>WORLD.surface+26);$('dayPhase').textContent=`${isNight()?'NOITE':'DIA'} · ${dives+1}`;const oxy=Math.ceil(player.oxygen),health=Math.ceil(player.health);$('oxygenLabel').textContent=oxy+'%';$('oxygen').style.width=oxy+'%';$('oxygen').style.background=oxy<30?'#ef9f88':'#a6edd1';$('health').style.width=health+'%';$('healthLabel').textContent=health;$('score').textContent=score.toLocaleString('pt-BR');$('bag').textContent=carrying;$('bagValue').textContent=bagValue;$('zone').textContent=player.y>1100?'RECIFE PROFUNDO':player.y>550?'O GRANDE AZUL':'ÁGUAS RASAS';$('objective').textContent=carrying?'Volte ao barco para garantir os pontos.':'Encontre tesouros entre os recifes.';$('expedition').textContent=`Expedição ${String(dives+1).padStart(2,'0')} · ${deposited} entregues`;$('depth').textContent=Math.max(0,Math.round((player.y-WORLD.surface)/12))+' m';$('boatDistance').textContent=Math.round(distance(player,boat)/12)+' m';const angle=Math.atan2(boat.y-player.y,boat.x-player.x);const arrows=['→','↘','↓','↙','←','↖','↑','↗'];$('compass').firstChild.textContent=arrows[(Math.round(angle/(Math.PI/4))+8)%8]+' BARCO ';}
function sprite(kind,x,y,w,h,flip=1,angle=0,alpha=1){const im=images[kind];ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(flip,1);ctx.globalAlpha=alpha;if(im&&im.complete&&im.naturalWidth){let aspect=im.naturalWidth/im.naturalHeight,dh=Math.min(h,w/aspect),dw=dh*aspect;ctx.drawImage(im,-dw/2,-dh/2,dw,dh);}else{ctx.fillStyle=kind==='diver'?'#f6c66c':kind==='boat'?'#bd815a':'#77afb7';ctx.beginPath();ctx.ellipse(0,0,w/2,h/2,0,0,TAU);ctx.fill();}ctx.restore();}
function glow(x,y,r,color){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);}
function drawRock(r){
 ctx.save();ctx.beginPath();ctx.roundRect(r.x,r.y,r.w,r.h,[12,14,0,0]);ctx.clip();
 const g=ctx.createLinearGradient(r.x,r.y,r.x+r.w,WORLD.h);g.addColorStop(0,['#286779','#356d79','#3b5f73'][r.variant]);g.addColorStop(1,'#092b40');ctx.fillStyle=g;ctx.fillRect(r.x,r.y,r.w,r.h);
 // Estratos e fendas determinísticos tornam os pilares legíveis sem esconder a área sólida.
 for(let j=0;j<16;j++){let y=r.y+30+j*37,shift=Math.sin(j*7+r.x)*15;ctx.fillStyle=j%2?'#061b3635':'#87b6b815';ctx.beginPath();ctx.moveTo(r.x,y);ctx.lineTo(r.x+r.w*.4,y+shift);ctx.lineTo(r.x+r.w,y-7);ctx.lineTo(r.x+r.w,y+13);ctx.lineTo(r.x+r.w*.45,y+18+shift);ctx.lineTo(r.x,y+11);ctx.fill();ctx.strokeStyle='#a2d0c51a';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(r.x,y);ctx.lineTo(r.x+r.w*.4,y+shift);ctx.lineTo(r.x+r.w,y-7);ctx.stroke();}
 ctx.fillStyle='#03192c33';ctx.beginPath();ctx.moveTo(r.x+r.w*.72,r.y);ctx.lineTo(r.x+r.w*.58,r.y+90);ctx.lineTo(r.x+r.w*.8,r.y+140);ctx.lineTo(r.x+r.w*.68,WORLD.h);ctx.lineTo(r.x+r.w,WORLD.h);ctx.lineTo(r.x+r.w,r.y);ctx.fill();ctx.restore();
 sprite('rock',r.x+r.w/2,r.y+10,r.w+20,88);
 for(let j=0;j<3;j++){let x=r.x+18+j*r.w*.28;ctx.strokeStyle=j%2?'#6ba9a1':'#4a9a91';ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,r.y);ctx.quadraticCurveTo(x-12,r.y-25,x+Math.sin(visualTime+j+r.x)*9,r.y-48-j*7);ctx.stroke();}
}
function drawWorld(){
 if(state==='menu'){ctx.setTransform(dpr,0,0,dpr,0,0);const bg=images.background;if(bg&&bg.complete&&bg.naturalWidth){const ratio=Math.max(vw/bg.naturalWidth,vh/bg.naturalHeight);ctx.drawImage(bg,(vw-bg.naturalWidth*ratio)/2,(vh-bg.naturalHeight*ratio)/2,bg.naturalWidth*ratio,bg.naturalHeight*ratio);}else{ctx.fillStyle='#07354b';ctx.fillRect(0,0,vw,vh);}sprite('whale',vw*.79,vh*.48+Math.sin(visualTime*.5)*7,Math.min(vw*.46,620),210,1,-.04,.88);sprite('diver',vw*.72,vh*.27,145,74,1,-.13);sprite('turtle',vw*.87,vh*.75,110,70,1,.12);for(let i=0;i<7;i++)sprite('fish3',vw*.63+i*28,vh*.66+Math.sin(i)*16,30,15,-1);return;}
 const viewW=vw/scale,viewH=vh/scale;
 let targetX=state==='menu'?900:player.x-viewW/2,targetY=state==='menu'?190:player.y-viewH*.5;
 camera.x=clamp(camera.x+(targetX-camera.x)*(reduced?1:.09),0,Math.max(0,WORLD.w-viewW));const minY=-Math.max(90,viewH*.5-WORLD.surface);camera.y=clamp(camera.y+(targetY-camera.y)*(reduced?1:.09),minY,Math.max(minY,WORLD.h-viewH+65));
 ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,vw,vh);
 const water=ctx.createLinearGradient(0,0,0,vh);water.addColorStop(0,'#187c91');water.addColorStop(.5,'#07516a');water.addColorStop(1,'#03273f');ctx.fillStyle=water;ctx.fillRect(0,0,vw,vh);
 ctx.save();ctx.scale(scale,scale);ctx.translate(-camera.x,-camera.y);
 const bg=images.background;if(bg&&bg.complete&&bg.naturalWidth){ctx.save();ctx.filter=`hue-rotate(${scenery.hue}deg)`;if(scenery.flip){ctx.translate(WORLD.w,0);ctx.scale(-1,1);}const sw=bg.naturalWidth*scenery.cropScale,sh=bg.naturalHeight*scenery.cropScale;ctx.drawImage(bg,(bg.naturalWidth-sw)*scenery.cropX,(bg.naturalHeight-sh)*scenery.cropY,sw,sh,0,WORLD.surface,WORLD.w,WORLD.h-WORLD.surface);ctx.restore();}
 // Atmosfera e luz com paralaxe; o fundo não participa das colisões.
 let dark=ctx.createLinearGradient(0,WORLD.surface,0,WORLD.h);dark.addColorStop(0,'#062f4d00');dark.addColorStop(1,'#001a3c55');ctx.fillStyle=dark;ctx.fillRect(0,WORLD.surface,WORLD.w,WORLD.h);
 ctx.save();ctx.beginPath();ctx.rect(0,WORLD.surface,WORLD.w,WORLD.h);ctx.clip();for(let i=0;i<9;i++){let x=i*410+Math.sin(visualTime*.12+i)*40;ctx.fillStyle=i%2?'#b9ffe007':'#beeff60a';ctx.beginPath();ctx.moveTo(x,160);ctx.lineTo(x+85,160);ctx.lineTo(x+500,1650);ctx.lineTo(x+140,1650);ctx.fill();}ctx.restore();
 ctx.fillStyle='#91cbd2';ctx.fillRect(0,-1000,WORLD.w,WORLD.surface+1000);let sky=ctx.createLinearGradient(0,-500,0,WORLD.surface);sky.addColorStop(0,'#3c8099');sky.addColorStop(1,'#c4e4dc');ctx.fillStyle=sky;ctx.fillRect(0,-1000,WORLD.w,WORLD.surface+1000);
 ctx.fillStyle='#2d7c8c55';for(let i=0;i<6;i++){ctx.beginPath();ctx.moveTo(i*630-200,180);ctx.lineTo(i*630+90,60+i%2*30);ctx.lineTo(i*630+270,180);ctx.fill();}
 for(let j=0;j<3;j++){ctx.beginPath();for(let x=0;x<=WORLD.w+15;x+=15){let y=WORLD.surface+Math.sin(x*.017+visualTime*.8+j)*6+j*5;if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.strokeStyle=['#e2fff585','#5cbccc66','#29869b55'][j];ctx.lineWidth=j===0?2:5;ctx.stroke();}
 sprite('boat',boat.x,boat.y-50+Math.sin(visualTime)*3,boat.w,boat.h,1,Math.sin(visualTime*.8)*.025);
 ctx.strokeStyle='#c5e8d755';ctx.lineWidth=2;ctx.setLineDash([5,9]);ctx.beginPath();ctx.moveTo(boat.x,WORLD.surface);ctx.lineTo(boat.x,WORLD.surface+90);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#c7fae7';ctx.font='11px system-ui';ctx.textAlign='center';ctx.fillText('↑ BARCO · ENTREGA + O₂',boat.x,WORLD.surface+119);
 for(const a of animals){if(a.kind==='whale')sprite(a.kind,a.x,a.y+Math.sin(a.phase)*9,a.w,a.h,a.vx>0?-1:1,Math.sin(a.phase)*.02,.6);}
 // Rochas com silhueta correspondente às caixas de colisão, recobertas por coral.
 for(const r of rocks)drawRock(r);
 for(const a of animals)if(a.kind!=='whale'&&!a.eaten)sprite(a.kind,a.x,a.y+Math.sin(a.phase*1.8)*8,a.w,a.h,a.vx>0?-1:1,Math.sin(a.phase)*.035);
 for(const b of air)if(b.active){let y=b.y+Math.sin(visualTime*2+b.x)*7;glow(b.x,y,55,'#9aeaff35');ctx.strokeStyle='#b8effecc';ctx.lineWidth=2;ctx.fillStyle='#8be5f322';ctx.beginPath();ctx.arc(b.x,y,b.r,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='#e0ffff';ctx.font='bold 12px system-ui';ctx.textAlign='center';ctx.fillText('O₂',b.x,y+4);ctx.beginPath();ctx.arc(b.x-8,y-8,4,0,TAU);ctx.fill();}
 for(const t of treasures)if(!t.collected){let bob=reduced?0:Math.sin(visualTime*2.2+t.phase)*5,y=t.y+bob;const color=t.value===100?'#f6d68d':t.value===50?'#daedf4':'#dc9c7e';glow(t.x,y,42,color+'45');ctx.save();ctx.translate(t.x,y);ctx.scale(reduced?1:.8+Math.abs(Math.cos(visualTime+t.phase))*.2,1);ctx.fillStyle=color;ctx.strokeStyle='#fff0be';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,12,0,TAU);ctx.fill();ctx.stroke();ctx.strokeStyle='#614f3877';ctx.beginPath();ctx.arc(0,0,8,0,TAU);ctx.stroke();ctx.fillStyle='#65543f';ctx.font='bold 11px Georgia';ctx.textAlign='center';ctx.fillText('✦',0,4);ctx.restore();}
 for(const e of enemies){sprite(e.kind,e.x,e.y,e.w,e.h,e.vx>0?-1:1);if(player&&state==='playing'&&e.mode==='chase'){ctx.fillStyle='#f3a694';ctx.font='bold 16px system-ui';ctx.textAlign='center';ctx.fillText('!',e.x,e.y-e.h*.55);}}
 if(state!=='menu'&&player){glow(player.x,player.y,65,'#bcf6e825');sprite('diver',player.x,player.y,106,58,player.facing,clamp(player.vy/800,-.25,.25)*player.facing,invincible>0&&!reduced?.72+Math.sin(simTime*12)*.2:1);}
 for(const p of particles){ctx.globalAlpha=clamp(p.life/p.max,0,1);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,TAU);ctx.fill();}ctx.globalAlpha=1;
 // Partículas ambientais determinísticas, sem alocação por quadro.
 if(!reduced){ctx.fillStyle='#d0f6ff40';for(let i=0;i<45;i++){let x=(i*173.7+Math.sin(visualTime*.3+i)*20)%WORLD.w,y=250+(i*97.3-visualTime*8)%1300;if(y>WORLD.surface){ctx.beginPath();ctx.arc(x,y,1.5,0,TAU);ctx.fill();}}}
 ctx.restore();if(isNight()&&player)drawNight();if(damageFlash>0){ctx.fillStyle=`rgba(229,100,80,${damageFlash*.3})`;ctx.fillRect(0,0,vw,vh);}if(player&&player.oxygen<20&&state==='playing'){ctx.strokeStyle='#eeb18a66';ctx.lineWidth=9;ctx.strokeRect(0,0,vw,vh);}
}
function drawMap(){mc.clearRect(0,0,220,120);mc.fillStyle='#16495b';mc.fillRect(0,0,220,120);const sx=220/WORLD.w,sy=120/WORLD.h;mc.fillStyle='#8bc9c21a';mc.fillRect(camera.x*sx,camera.y*sy,vw/scale*sx,vh/scale*sy);mc.strokeStyle='#6dadaa55';mc.lineWidth=1;mc.strokeRect(camera.x*sx,camera.y*sy,vw/scale*sx,vh/scale*sy);mc.fillStyle='#7eb7b355';for(const r of rocks)mc.fillRect(r.x*sx,r.y*sy,r.w*sx,r.h*sy);const dot=(x,y,r,c)=>{mc.fillStyle=c;mc.beginPath();mc.arc(x*sx,y*sy,r,0,TAU);mc.fill()};for(const t of treasures)if(!t.collected)dot(t.x,t.y,1.7,'#f4d18a');for(const e of enemies)dot(e.x,e.y,2,'#f1a08c');dot(boat.x,boat.y,3,'#a6edd1');if(player)dot(player.x,player.y,3,'#fff');}
let hudTimer=0;
function frame(timestamp){let delta=previous?Math.min(.1,(timestamp-previous)/1000):0;previous=timestamp;const active=state!=='paused'&&state!=='gameover';if(active){visualTime+=delta;accumulator+=delta;while(accumulator>=STEP){update(STEP);accumulator-=STEP;}for(let i=particles.length-1;i>=0;i--){let p=particles[i];p.life-=delta;p.x+=p.vx*delta;p.y+=p.vy*delta;if(p.life<=0)particles.splice(i,1);}if(toastTime>0){toastTime-=delta;if(toastTime<=0)$('toast').classList.remove('show');}}else accumulator=0;drawWorld();hudTimer+=delta;if(hudTimer>.1){hudTimer=0;updateHUD();drawMap();if(state==='playing')syncMusic();}requestAnimationFrame(frame);}
function bind(id,fn){$(id).addEventListener('click',fn)}
bind('start',start);bind('restart',start);bind('pause',()=>state==='paused'?resume():pause());bind('resume',resume);bind('sound',toggleSound);bind('back',toMenu);$('home').addEventListener('click',e=>{e.preventDefault();pause()});
addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();if(e.repeat)return;if(k==='escape'||k==='p'){state==='playing'?pause():resume();return}if(k==='m'){toggleSound();return}if(state==='playing')keys.add(k)});addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
addEventListener('blur',()=>{resetInput();pause()});document.addEventListener('visibilitychange',()=>{if(document.hidden){resetInput();pause();}});
const stick=$('stick');function updateStick(e){const rect=stick.getBoundingClientRect(),radius=rect.width*.34;let x=e.clientX-rect.left-rect.width/2,y=e.clientY-rect.top-rect.height/2,len=Math.hypot(x,y);if(len>radius){x*=radius/len;y*=radius/len}joy.x=Math.abs(x)<3?0:x/radius;joy.y=Math.abs(y)<3?0:y/radius;$('thumb').style.transform=`translate(${x}px,${y}px)`;}
stick.addEventListener('pointerdown',e=>{if(state!=='playing'||pointer!==null)return;pointer=e.pointerId;stick.setPointerCapture(pointer);updateStick(e);e.preventDefault()});stick.addEventListener('pointermove',e=>{if(pointer===e.pointerId)updateStick(e)});for(const event of ['pointerup','pointercancel','lostpointercapture'])stick.addEventListener(event,e=>{if(pointer===e.pointerId){pointer=null;joy.x=joy.y=0;$('thumb').style.transform=''}});
// Exposição somente de leitura para diagnóstico e testes; nenhuma dependência em produção.
window.GrandeAzul={ready,snapshot:()=>({state,score,carrying,bagValue,dives,deposited,player:player?{...player}:null,world:{...WORLD},oxygenRules:{...OXYGEN},night:isNight(),scenery:{...scenery},treasures:treasures.map(t=>({...t})),air:air.map(b=>({...b})),enemies:enemies.map(e=>({...e})),rocks:rocks.map(r=>({...r})),camera:{...camera},muted})};
buildLevel();$('pause').disabled=true;requestAnimationFrame(frame);
})();
