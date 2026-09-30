(function(){
"use strict";
if(!window.THREE){document.body.innerHTML="<p style='color:white;padding:20px'>3D engine failed to load. Refresh to retry.</p>";return;}
const T=window.THREE, root=document.getElementById("game");
const scene=new T.Scene(); scene.background=new T.Color(0x83b9df); scene.fog=new T.Fog(0x83b9df,75,240);
const camera=new T.PerspectiveCamera(62,innerWidth/innerHeight,.05,500);
const renderer=new T.WebGLRenderer({antialias:true}); renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.setSize(innerWidth,innerHeight); renderer.shadowMap.enabled=true; renderer.shadowMap.type=T.PCFSoftShadowMap; root.appendChild(renderer.domElement);
scene.add(new T.HemisphereLight(0xddeeff,0x496342,1.7));
const sun=new T.DirectionalLight(0xfff0c4,2.2); sun.position.set(-45,70,35); sun.castShadow=true; sun.shadow.mapSize.set(1024,1024); scene.add(sun);
const ground=new T.Mesh(new T.PlaneGeometry(300,300),new T.MeshStandardMaterial({color:0x628e52,roughness:1}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
const roads=[]; function road(x,z,w,d){const m=new T.Mesh(new T.BoxGeometry(w,.08,d),new T.MeshStandardMaterial({color:0x303236,roughness:.95}));m.position.set(x,.035,z);m.receiveShadow=true;scene.add(m);roads.push({x,z,w,d});const line=new T.Mesh(new T.PlaneGeometry(w>.d?1:1,1),new T.MeshBasicMaterial({color:0xf0df83}));}
function makeRoad(x,z,w,d){const m=new T.Mesh(new T.BoxGeometry(w,.08,d),new T.MeshStandardMaterial({color:0x303236,roughness:.95}));m.position.set(x,.04,z);m.receiveShadow=true;scene.add(m);
if(w>d){for(let p=-w/2+8;p<w/2-5;p+=13){const l=new T.Mesh(new T.BoxGeometry(5,.012,.18),new T.MeshBasicMaterial({color:0xf0df83}));l.position.set(x+p,.091,z);scene.add(l)}}else{for(let p=-d/2+8;p<d/2-5;p+=13){const l=new T.Mesh(new T.BoxGeometry(.18,.012,5),new T.MeshBasicMaterial({color:0xf0df83}));l.position.set(x,.091,z+p);scene.add(l)}}}
makeRoad(0,0,18,180);makeRoad(0,0,180,18);makeRoad(55,0,18,180);makeRoad(-55,0,18,180);makeRoad(0,55,180,18);makeRoad(0,-55,180,18);makeRoad(38,38,80,12);makeRoad(-38,-38,80,12);
const matTree=new T.MeshStandardMaterial({color:0x2e6a3e,roughness:1}), matTrunk=new T.MeshStandardMaterial({color:0x5a412c});
function tree(x,z,s=1){const g=new T.Group();const tr=new T.Mesh(new T.CylinderGeometry(.28*s,.4*s,2.2*s,8),matTrunk);tr.position.y=1.1*s;tr.castShadow=true;g.add(tr);const crown=new T.Mesh(new T.SphereGeometry(1.35*s,9,7),matTree);crown.position.y=2.55*s;crown.castShadow=true;g.add(crown);g.position.set(x,0,z);scene.add(g)}
for(let x=-125;x<=125;x+=15){tree(x,-105+(x%4)*2,.8);tree(x,105-(x%5)*2,.9)}for(let z=-90;z<=90;z+=16){tree(-105,z,.8);tree(105,z,.85)}
const buildingMat=new T.MeshStandardMaterial({color:0x8b6651,roughness:.9});
function building(x,z,w,d,h){const b=new T.Mesh(new T.BoxGeometry(w,h,d),buildingMat);b.position.set(x,h/2,z);b.castShadow=true;b.receiveShadow=true;scene.add(b);const roof=new T.Mesh(new T.BoxGeometry(w+.5,.2,d+.5),new T.MeshStandardMaterial({color:0x4c3b37}));roof.position.set(x,h+.1,z);scene.add(roof)}
building(32,-30,22,18,7);building(-34,30,20,24,9);building(74,38,18,20,6);building(-76,-45,24,16,8);
const car=new T.Group();
const bodyMat=new T.MeshStandardMaterial({color:0xd62c35,metalness:.25,roughness:.35});
const body=new T.Mesh(new T.BoxGeometry(2.05,.55,4.2),bodyMat);body.position.y=.72;body.castShadow=true;car.add(body);
const hood=new T.Mesh(new T.BoxGeometry(1.82,.32,1.45),bodyMat);hood.position.set(0,1.02,1.05);hood.castShadow=true;car.add(hood);
const cabin=new T.Mesh(new T.BoxGeometry(1.62,.72,1.75),new T.MeshStandardMaterial({color:0x25353c,metalness:.35,roughness:.25}));cabin.position.set(0,1.15,-.35);cabin.castShadow=true;car.add(cabin);
const front=new T.Mesh(new T.BoxGeometry(1.55,.16,.55),new T.MeshStandardMaterial({color:0x20252a}));front.position.set(0,.96,1.95);car.add(front);
const tireMat=new T.MeshStandardMaterial({color:0x151515,roughness:1});const wheelGeo=new T.CylinderGeometry(.43,.43,.26,18);
[[ -.98,.47,1.35],[.98,.47,1.35],[-.98,.47,-1.35],[.98,.47,-1.35]].forEach(p=>{const w=new T.Mesh(wheelGeo,tireMat);w.rotation.z=Math.PI/2;w.position.set(p[0],p[1],p[2]);w.castShadow=true;car.add(w)});
for(const x of [-.72,.72]){const h=new T.Mesh(new T.BoxGeometry(.28,.13,.08),new T.MeshStandardMaterial({color:0xffef9b,emissive:0x665500}));h.position.set(x,.83,2.13);car.add(h)}
car.position.set(0,.12,38);car.rotation.y=Math.PI;scene.add(car);
const traffic=[];function trafficCar(x,z,c){const g=new T.Group();const b=new T.Mesh(new T.BoxGeometry(1.8,.52,3.7),new T.MeshStandardMaterial({color:c,roughness:.45}));b.position.y=.62;g.add(b);const cab=new T.Mesh(new T.BoxGeometry(1.45,.65,1.55),new T.MeshStandardMaterial({color:0x26343a}));cab.position.set(0,1.02,-.3);g.add(cab);g.position.set(x,.1,z);scene.add(g);traffic.push({g,speed:4+Math.random()*4,axis:Math.abs(x)<10?"z":"x"});}
trafficCar(4,-25,0x3d6fbe);trafficCar(-4,62,0xd8a02d);trafficCar(58,-28,0x6f4bb3);trafficCar(-58,25,0x4d9b68);
let state={x:0,z:38,a:Math.PI,v:0,steer:0,gas:false,brake:false,dist:0,keys:{}};
function bindHold(el,key){el.addEventListener("pointerdown",e=>{e.preventDefault();el.setPointerCapture(e.pointerId);state[key]=true});["pointerup","pointercancel","pointerleave"].forEach(t=>el.addEventListener(t,()=>state[key]=false))}
bindHold(document.getElementById("gas"),"gas");bindHold(document.getElementById("brake"),"brake");
const wheel=document.getElementById("steer");let drag=false,lastX=0;
wheel.addEventListener("pointerdown",e=>{drag=true;lastX=e.clientX;wheel.setPointerCapture(e.pointerId)});
wheel.addEventListener("pointermove",e=>{if(!drag)return;state.steer=Math.max(-1,Math.min(1,state.steer+(e.clientX-lastX)*.018));lastX=e.clientX)});
["pointerup","pointercancel"].forEach(t=>wheel.addEventListener(t,()=>drag=false));
addEventListener("keydown",e=>{state.keys[e.key.toLowerCase()]=true});
addEventListener("keyup",e=>{state.keys[e.key.toLowerCase()]=false});
function roadHere(x,z){const near=Math.abs(x)<9||Math.abs(z)<9||Math.abs(x-55)<9||Math.abs(x+55)<9||Math.abs(z-55)<9||Math.abs(z+55)<9||Math.abs(x-38)<40&&Math.abs(z-38)<6||Math.abs(x+38)<40&&Math.abs(z+38)<6;return near}
function clampWorld(){state.x=Math.max(-96,Math.min(96,state.x));state.z=Math.max(-96,Math.min(96,state.z))}
function update(dt){const k=state.keys;const gas=state.gas||k.w||k.arrowup,brake=state.brake||k.s||k.arrowdown;let steer=state.steer+(k.a||k.arrowleft?-1:0)+(k.d||k.arrowright?1:0);steer=Math.max(-1,Math.min(1,steer));if(gas)state.v+=12*dt;else state.v-=4*dt;if(brake)state.v-=18*dt;state.v=Math.max(-5,Math.min(28,state.v));if(Math.abs(state.v)>.15)state.a-=steer*(state.v/18)*1.35*dt;
const nx=state.x+Math.sin(state.a)*state.v*dt,nz=state.z+Math.cos(state.a)*state.v*dt;state.x=nx;state.z=nz;clampWorld();state.dist+=Math.abs(state.v)*dt/1609;
car.position.x=state.x;car.position.z=state.z;car.rotation.y=state.a;
traffic.forEach(t=>{if(t.axis==="z"){t.g.position.z+=t.speed*dt;if(t.g.position.z>95)t.g.position.z=-95}else{t.g.position.x+=t.speed*dt;if(t.g.position.x>95)t.g.position.x=-95}});
const camBack=8.5,camUp=4.4;const cx=state.x-Math.sin(state.a)*camBack,cz=state.z-Math.cos(state.a)*camBack;camera.position.lerp(new T.Vector3(cx,camUp,cz),1-Math.pow(.001,dt));camera.lookAt(new T.Vector3(state.x,1,state.z));
document.getElementById("speed").textContent=Math.round(Math.abs(state.v)*2.23694);let deg=(state.a*180/Math.PI+360)%360;const dirs=["N","NE","E","SE","S","SW","W","NW"];document.getElementById("heading").textContent=dirs[Math.round(deg/45)%8];document.getElementById("distance").textContent=state.dist.toFixed(2);if(!drag)state.steer*=.9;}
let prev=performance.now();function loop(now){const dt=Math.min(.04,(now-prev)/1000);prev=now;update(dt);renderer.render(scene,camera);requestAnimationFrame(loop)}requestAnimationFrame(loop);
addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
})();