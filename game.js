(function(){
var $=function(id){return document.getElementById(id)};
var canvas=$("c"), ctx=canvas.getContext("2d");
if(!ctx){document.body.innerHTML="<p style='padding:24px;color:#e8b86d'>This browser cannot draw the game.</p>";return;}
var W=320,H=180, touch=("ontouchstart"in window)||navigator.maxTouchPoints>0;
function size(){
  var r=Math.min(2, window.devicePixelRatio||1);
  W=Math.max(280, Math.floor(window.innerWidth));
  H=Math.max(160, Math.floor(window.innerHeight));
  canvas.width=Math.floor(W*r); canvas.height=Math.floor(H*r);
  canvas.style.width=W+"px"; canvas.style.height=H+"px";
  ctx.setTransform(r,0,0,r,0,0);
}
size(); window.addEventListener("resize", size);
var MAPS=[
  {tag:"M1 // DOCKSIDE", title:"DOCKSIDE RECON", code:"FILE 01 / 03", brief:"Azraq docks went dark. Sweep the warehouse yard.", done:"Crate empty. Coordinates point inland.", w:24,h:24, spawn:[3.5,3.5], ext:[20.5,20.5], enemies:8, pal:{ceil:"#6f7f88",floor:"#2a2e28",wall:"#4a4e46",wall2:"#3a4240"}},
  {tag:"M2 // RAILSPUR", title:"COMPOUND BREACH", code:"FILE 02 / 03", brief:"Ghost Three is in the inner block. Streets are tight.", done:"He said one word: tower.", w:22,h:22, spawn:[2.5,19.5], ext:[11,2.5], enemies:10, pal:{ceil:"#5a5048",floor:"#2c2622",wall:"#4a4038",wall2:"#3e3832"}},
  {tag:"M3 // SPIRE", title:"SHADOWLINE", code:"FILE 03 / 03", brief:"The tower is last. End the garrison.", done:"Device safed. Tower silent.", w:22,h:22, spawn:[11,20.5], ext:[11,2.5], enemies:12, pal:{ceil:"#3a3540",floor:"#242428",wall:"#3a3a44",wall2:"#2e2e38"}}
];
function carve(m){
  var g=[],x,y,i;
  for(y=0;y<m.h;y++){g[y]=[];for(x=0;x<m.w;x++) g[y][x]=(x===0||y===0||x===m.w-1||y===m.h-1)?1:0;}
  for(i=0;i<18;i++){
    var bw=2+(i*3)%4, bh=2+(i*5)%5, bx=2+(i*5)%(m.w-6), by=2+(i*7)%(m.h-6);
    if(Math.abs(bx-m.spawn[0])<3&&Math.abs(by-m.spawn[1])<3) continue;
    if(Math.abs(bx-m.ext[0])<3&&Math.abs(by-m.ext[1])<3) continue;
    for(y=0;y<bh;y++) for(x=0;x<bw;x++) if(by+y<m.h-1&&bx+x<m.w-1) g[by+y][bx+x]=(i%2)?1:2;
  }
  for(x=0;x<m.w;x++){ g[m.h>>1][x]=0; g[m.spawn[1]|0][x]=0; }
  for(y=0;y<m.h;y++){ g[y][m.w>>1]=0; g[y][m.spawn[0]|0]=0; }
  g[m.spawn[1]|0][m.spawn[0]|0]=0; g[m.ext[1]|0][m.ext[0]|0]=0; m.grid=g;
}
MAPS.forEach(carve);
var S={mode:"title",mi:0,hp:100,mag:30,res:90,reload:0,aim:0,x:3.5,y:3.5,z:0,vz:0,yaw:0.2,pitch:0,t:0,last:0,lastHurt:0,kills:0,live:false};
var IN={sx:0,sy:0,fire:0,aim:0,jump:0,f:0,b:0,l:0,r:0};
var foes=[];
function toast(m){var e=$("toast");e.textContent=m;e.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(function(){e.classList.remove("show")},1800)}
function show(id){document.querySelectorAll(".screen").forEach(function(s){s.classList.add("hidden")});if(id)$(id).classList.remove("hidden")}
function hud(){$("hp").style.width=Math.max(0,S.hp)+"%";$("mag").textContent=S.mag;$("res").textContent=S.res;$("tag").textContent=MAPS[S.mi].tag;var left=foes.filter(function(f){return f.a}).length;$("obj").textContent=S.live?"REACH EXTRACT":("HOSTILES "+left);}
function spawn(){var m=MAPS[S.mi];foes=[];var n=m.enemies,tries=0;while(foes.length<n&&tries++<80){var fx=2+Math.random()*(m.w-4),fy=2+Math.random()*(m.h-4);if(m.grid[fy|0][fx|0])continue;if(Math.hypot(fx-m.spawn[0],fy-m.spawn[1])<5)continue;foes.push({x:fx,y:fy,a:1,hp:70,cd:1+Math.random()});}}
function start(i){S.mi=i;S.mode="play";S.hp=100;S.mag=30;S.res=90;S.reload=0;S.aim=0;S.x=MAPS[i].spawn[0];S.y=MAPS[i].spawn[1];S.z=0;S.vz=0;S.yaw=0.3;S.pitch=0;S.live=false;S.last=0;S.kills=0;spawn();hud();$("hud").classList.remove("hidden");if(touch)$("touch").classList.remove("hidden");show(null);toast(MAPS[i].title);}
function brief(i){S.mi=i;S.mode="brief";$("hud").classList.add("hidden");$("touch").classList.add("hidden");$("bcode").textContent=MAPS[i].code;$("btitle").textContent=MAPS[i].title;$("bbody").textContent=MAPS[i].brief;show("brief");}
function finish(){S.mode="done";$("hud").classList.add("hidden");$("touch").classList.add("hidden");$("dcode").textContent="MISSION "+(S.mi+1)+" COMPLETE";$("dtitle").textContent=MAPS[S.mi].title;$("dbody").textContent=MAPS[S.mi].done;$("next").textContent=S.mi>=2?"CLOSE THE FILE":"NEXT MISSION";show("done");}
function cell(x,y){var m=MAPS[S.mi].grid,ix=x|0,iy=y|0;if(iy<0||ix<0||iy>=m.length||ix>=m[0].length)return 1;return m[iy][ix];}
function move(nx,ny){if(!cell(nx,S.y))S.x=nx;if(!cell(S.x,ny))S.y=ny;}
function fire(){if(S.mode!=="play"||S.reload>0)return;if(S.t-S.last<0.12)return;if(S.mag<=0){toast("RELOAD");return;}S.last=S.t;S.mag--;var ca=Math.cos(S.yaw),sa=Math.sin(S.yaw),hit=null,best=14;for(var i=0;i<foes.length;i++){var f=foes[i];if(!f.a)continue;var dx=f.x-S.x,dy=f.y-S.y,along=dx*ca+dy*sa;if(along<0.35||along>best)continue;var px=S.x+ca*along,py=S.y+sa*along,off=Math.hypot(f.x-px,f.y-py);if(off<0.55&&Math.abs(S.pitch)<0.45){best=along;hit=f;}}if(hit){hit.hp-=52;toast("HIT");if(hit.hp<=0){hit.a=0;S.kills++;toast("HOSTILE DOWN");}if(!foes.some(function(f){return f.a})){S.live=true;toast("EXTRACT IS LIVE");}}if(S.mag===0&&S.res>0)startReload();hud();}
function startReload(){if(S.reload||S.res<=0||S.mag>=30)return;S.reload=1.2;toast("RELOADING");}
function hurt(n){if(S.t-S.lastHurt<0.55)return;S.lastHurt=S.t;S.hp-=n;if(S.hp<=0){S.hp=0;S.mode="dead";$("hud").classList.add("hidden");$("touch").classList.add("hidden");show("dead");}hud();}
function tick(dt){S.t+=dt;if(S.reload>0){S.reload-=dt;if(S.reload<=0){var take=Math.min(30-S.mag,S.res);S.mag+=take;S.res-=take;hud();}}S.aim=IN.aim;var sp=S.aim?2.6:4.6,ix=0,iy=0;if(touch){ix=IN.sx;iy=-IN.sy;}else{iy+=IN.f;iy-=IN.b;ix+=IN.r;ix-=IN.l;}var m=Math.hypot(ix,iy);if(m>1){ix/=m;iy/=m;}var ca=Math.cos(S.yaw),sa=Math.sin(S.yaw);move(S.x+(ca*iy-sa*ix)*sp*dt,S.y+(sa*iy+ca*ix)*sp*dt);if(IN.jump&&S.z===0)S.vz=4.2;S.vz-=14*dt;S.z+=S.vz*dt;if(S.z<0){S.z=0;S.vz=0;}if(IN.fire)fire();var mdata=MAPS[S.mi];for(var i=0;i<foes.length;i++){var f=foes[i];if(!f.a)continue;var dx=S.x-f.x,dy=S.y-f.y,d=Math.hypot(dx,dy);if(d>0.9){f.x+=dx/d*1.5*dt;f.y+=dy/d*1.5*dt;if(cell(f.x,f.y)){f.x-=dx/d*1.5*dt;f.y-=dy/d*1.5*dt;}}f.cd-=dt;if(d<12&&f.cd<=0){f.cd=1.2+Math.random();if(d<1.1)hurt(3);else if(Math.random()<0.35)hurt(2);}}if(S.live&&Math.hypot(S.x-mdata.ext[0],S.y-mdata.ext[1])<1.2)finish();}
function shadeHex(hex,s){var n=parseInt(hex.slice(1),16),r=(n>>16)&255,g=(n>>8)&255,b=n&255;return "rgb("+((r*s)|0)+","+((g*s)|0)+","+((b*s)|0)+")";}
function draw(){var pal=MAPS[S.mi].pal;ctx.fillStyle=pal.ceil;ctx.fillRect(0,0,W,H/2);ctx.fillStyle=pal.floor;ctx.fillRect(0,H/2,W,H/2);var fov=S.aim?0.62:0.95,rays=Math.min(140,W/3|0),zbuf=[],c;for(c=0;c<rays;c++){var ang=S.yaw+(c/rays-0.5)*fov,ca=Math.cos(ang),sa=Math.sin(ang),dist=0,hit=0;while(dist<16){dist+=0.08;hit=cell(S.x+ca*dist,S.y+sa*dist);if(hit)break;}var z=dist*Math.cos(ang-S.yaw);zbuf[c]=z;var colH=Math.min(H,(H*1.05)/Math.max(0.2,z)),shade=Math.max(0.25,1-dist/16);ctx.fillStyle=hit===2?shadeHex(pal.wall2,shade):shadeHex(pal.wall,shade);ctx.fillRect(c*(W/rays),(H-colH)/2-S.pitch*90+S.z*18,Math.ceil(W/rays)+1,colH);}var list=[];for(var i=0;i<foes.length;i++)if(foes[i].a)list.push(foes[i]);if(S.live)list.push({x:MAPS[S.mi].ext[0],y:MAPS[S.mi].ext[1],ext:1,a:1});list.sort(function(a,b){return Math.hypot(S.x-b.x,S.y-b.y)-Math.hypot(S.x-a.x,S.y-a.y)});for(i=0;i<list.length;i++){var f=list[i],dx=f.x-S.x,dy=f.y-S.y,dist=Math.hypot(dx,dy);if(dist<0.2)continue;var ang=Math.atan2(dy,dx)-S.yaw;while(ang>Math.PI)ang-=Math.PI*2;while(ang<-Math.PI)ang+=Math.PI*2;if(Math.abs(ang)>fov)continue;var sx=(0.5+ang/fov)*W,col=((sx/W)*rays)|0;if(col>=0&&col<zbuf.length&&zbuf[col]+0.15<dist)continue;var sh=(H*0.9)/dist,bob=S.z*18-S.pitch*90;if(f.ext){ctx.fillStyle="#7dffb3";ctx.globalAlpha=0.7;ctx.fillRect(sx-sh*0.2,H/2+sh*0.3+bob,sh*0.4,8);ctx.globalAlpha=1;}else{ctx.fillStyle="#4a3028";ctx.fillRect(sx-sh*0.16,H/2-sh*0.35+bob,sh*0.32,sh*0.7);ctx.fillStyle="#1e1814";ctx.fillRect(sx-sh*0.1,H/2-sh*0.5+bob,sh*0.2,sh*0.16);}}ctx.fillStyle="#161814";var gx=S.aim?W*0.48:W*0.62,gy=(S.aim?H*0.62:H*0.72)+(IN.fire?6:0);ctx.fillRect(gx,gy,18,70);ctx.fillRect(gx+6,gy-40,8,46);ctx.fillStyle="#6a5a3a";ctx.fillRect(gx-8,gy+28,16,36);}
var last=performance.now();
function loop(now){var dt=Math.min(0.05,(now-last)/1000);last=now;if(S.mode==="play"){tick(dt);draw();}requestAnimationFrame(loop);}
requestAnimationFrame(loop);
window.addEventListener("keydown",function(e){if(e.code==="KeyW"||e.code==="ArrowUp")IN.f=1;if(e.code==="KeyS"||e.code==="ArrowDown")IN.b=1;if(e.code==="KeyA"||e.code==="ArrowLeft")IN.l=1;if(e.code==="KeyD"||e.code==="ArrowRight")IN.r=1;if(e.code==="Space")IN.jump=1;if(e.code==="KeyR")startReload();});
window.addEventListener("keyup",function(e){if(e.code==="KeyW"||e.code==="ArrowUp")IN.f=0;if(e.code==="KeyS"||e.code==="ArrowDown")IN.b=0;if(e.code==="KeyA"||e.code==="ArrowLeft")IN.l=0;if(e.code==="KeyD"||e.code==="ArrowRight")IN.r=0;if(e.code==="Space")IN.jump=0;});
window.addEventListener("mousedown",function(e){if(S.mode==="play"&&e.button===0)IN.fire=1;if(e.button===2)IN.aim=1;});
window.addEventListener("mouseup",function(e){if(e.button===0)IN.fire=0;if(e.button===2)IN.aim=0;});
window.addEventListener("contextmenu",function(e){e.preventDefault();});
window.addEventListener("mousemove",function(e){if(S.mode!=="play"||touch)return;S.yaw+=e.movementX*0.0025;S.pitch+=e.movementY*0.002;if(S.pitch>0.6)S.pitch=0.6;if(S.pitch<-0.6)S.pitch=-0.6;});
var lookId=null,lx=0,ly=0;
window.addEventListener("pointerdown",function(e){if(!touch||S.mode!=="play")return;var el=e.target;if(el.closest&&(el.closest("#stick")||el.closest("#touch button")||el.closest(".cta")||el.closest(".ghost")))return;lookId=e.pointerId;lx=e.clientX;ly=e.clientY;});
window.addEventListener("pointermove",function(e){if(e.pointerId!==lookId)return;S.yaw+=(e.clientX-lx)*0.005;S.pitch+=(e.clientY-ly)*0.004;if(S.pitch>0.6)S.pitch=0.6;if(S.pitch<-0.6)S.pitch=-0.6;lx=e.clientX;ly=e.clientY;});
window.addEventListener("pointerup",function(e){if(e.pointerId===lookId)lookId=null;});
var stick=$("stick"),knob=$("knob"),sid=null;
function setStick(cx,cy){var r=stick.getBoundingClientRect(),dx=cx-(r.left+r.width/2),dy=cy-(r.top+r.height/2),max=40,m=Math.hypot(dx,dy);if(m>max){dx*=max/m;dy*=max/m;}knob.style.transform="translate("+dx+"px,"+dy+"px)";IN.sx=dx/max;IN.sy=dy/max;}
function endStick(){sid=null;knob.style.transform="translate(0,0)";IN.sx=0;IN.sy=0;}
stick.addEventListener("pointerdown",function(e){sid=e.pointerId;stick.setPointerCapture(e.pointerId);setStick(e.clientX,e.clientY);});
stick.addEventListener("pointermove",function(e){if(e.pointerId===sid)setStick(e.clientX,e.clientY);});
stick.addEventListener("pointerup",endStick);stick.addEventListener("pointercancel",endStick);
function hold(btn,key){btn.addEventListener("pointerdown",function(e){e.preventDefault();IN[key]=1;if(key==="rld")startReload();});var off=function(){if(key!=="rld")IN[key]=0;};btn.addEventListener("pointerup",off);btn.addEventListener("pointercancel",off);btn.addEventListener("pointerleave",off);}
hold($("fire"),"fire");hold($("aim"),"aim");hold($("rld"),"rld");hold($("jmp"),"jump");
$("start").onclick=function(){brief(0);};
$("deploy").onclick=function(){start(S.mi);};
$("next").onclick=function(){if(S.mi>=2){S.mode="win";show("win");}else brief(S.mi+1);};
$("retry").onclick=function(){start(S.mi);};
$("abort").onclick=function(){S.mode="title";show("title");};
$("home").onclick=function(){S.mode="title";show("title");};
})();
