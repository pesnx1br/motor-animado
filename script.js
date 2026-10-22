(function(){
var $=function(i){return document.getElementById(i)};
function num(id){var s=$(id).value.trim().replace(/\s/g,'').replace(',','.');return s===''?NaN:Number(s)}
function fmt(x,d){if(!isFinite(x))return '–';var a=Math.abs(x);if(d===undefined)d=a>=1000?1:a>=100?2:a>=1?3:5;return x.toLocaleString('pt-BR',{maximumFractionDigits:d})}
function sci(x){var a=Math.abs(x);if(a>=1)return fmt(x,3)+' F';if(a>=1e-3)return fmt(x*1e3,2)+' mF';return fmt(x*1e6,1)+' µF'}
function step(n,t,f,r){return '<div class="step"><div class="t">'+n+'. '+t+'</div><div class="f">'+f+'</div><div class="r">'+r+'</div></div>'}
var M=null,on=false,mix=0;

function calc(){
 var pu=num('pu')*Number($('un').value),eta=num('eta')/100,V=num('v'),fr=num('f'),fp1=num('fp1'),fp2=num('fp2'),lig=$('lig').value,pol=Number($('pol').value),e='';
 if(!(pu>0))e='Informe uma potência útil maior que zero.';
 else if(!(eta>0&&eta<=1))e='O rendimento deve estar entre 0 e 100%.';
 else if(!(V>0))e='Informe a tensão em volts.';
 else if(!(fr>0))e='Informe a frequência em hertz.';
 else if(!(fp1>0&&fp1<=1))e='O FP atual deve estar entre 0 e 1.';
 else if(!(fp2>0&&fp2<=1))e='O FP desejado deve estar entre 0 e 1.';
 else if(fp2<=fp1)e='O FP desejado precisa ser maior que o FP atual.';
 $('err').textContent=e;
 if(e){M=null;$('steps').innerHTML='';$('final').innerHTML='';$('note').textContent='';return}
 var P=pu/eta,S1=P/fp1,Q1=Math.sqrt(Math.max(S1*S1-P*P,0)),S2=P/fp2,Q2=Math.sqrt(Math.max(S2*S2-P*P,0));
 var phi1=Math.acos(fp1),phi2=Math.acos(fp2),Qc=Q1-Q2,k=lig==='mono'?1:3,Vc=lig==='tri_y'?V/Math.sqrt(3):V;
 var Qcap=Qc/k,Xc=Vc*Vc/Qcap,C=1/(2*Math.PI*fr*Xc);
 var q=lig==='mono'?1:Math.sqrt(3),I1=S1/(q*V),I2=S2/(q*V),ns=120*fr/pol;
 M={pu:pu,P:P,fp1:fp1,fp2:fp2,phi1:phi1,phi2:phi2,Qc:Qc,C:C,I1:I1,I2:I2,ns:ns,pol:pol,k:k,fr:fr};
 $('steps').innerHTML=
  step(1,'Potência ativa absorvida','P = P<sub>útil</sub> / η',fmt(P)+' W')+
  step(2,'Potência aparente (situação 1)','S = P / FP = '+fmt(P)+' / '+fmt(fp1,4),fmt(S1)+' VA')+
  step(3,'Potência reativa (situação 1)','Q = √(S² − P²)',fmt(Q1)+' VAr')+
  step(4,'Potência aparente (situação 2)','S = P / FP = '+fmt(P)+' / '+fmt(fp2,4),fmt(S2)+' VA')+
  step(5,'Potência reativa (situação 2)','Q = √(S² − P²)',fmt(Q2)+' VAr')+
  step(6,'Potência do capacitor','Q<sub>c</sub> = Q₁ − Q₂',fmt(Qc)+' VAr'+(k===3?' total · '+fmt(Qcap)+' por fase':''))+
  step(7,'Reatância capacitiva','X<sub>c</sub> = V² / Q<sub>c</sub> = '+fmt(Vc)+'² / '+fmt(Qcap),fmt(Xc)+' Ω')+
  step(8,'Capacitância','C = 1 / (2·π·f·X<sub>c</sub>)',sci(C)+(k===3?' por fase':''));
 $('final').innerHTML=
  '<div class="box"><small>Banco</small><b>'+fmt(Qc/1000,2)+' kVAr</b></div>'+
  '<div class="box"><small>Capacitância'+(k===3?' por fase':'')+'</small><b>'+sci(C)+'</b></div>'+
  '<div class="box"><small>Corrente antes</small><b>'+fmt(I1,2)+' A</b></div>'+
  '<div class="box"><small>Corrente depois</small><b>'+fmt(I2,2)+' A</b></div>';
 $('note').textContent='Ângulo φ: '+fmt(phi1*180/Math.PI,1)+'° antes, '+fmt(phi2*180/Math.PI,1)+'° depois. Velocidade síncrona do campo: '+fmt(ns,0)+' rpm. A animação é em câmera lenta.';
}

function setup(c,h){var dpr=window.devicePixelRatio||1,w=c.parentNode.clientWidth-32;if(w<200)w=200;
 if(c._w!==w||c._h!==h){c.width=w*dpr;c.height=h*dpr;c.style.height=h+'px';c._w=w;c._h=h}
 var x=c.getContext('2d');x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,w,h);return {x:x,w:w,h:h}}
function col(n){return getComputedStyle(document.documentElement).getPropertyValue(n).trim()}

function drawMotor(th){
 var g=setup($('cm'),270),x=g.x,W=g.w,H=g.h,acc=col('--acc'),bad=col('--bad'),ink=col('--ink'),mut=col('--mut'),line=col('--line'),card=col('--card');
 var cx=W*0.4,cy=H*0.47,R=Math.min(H*0.42,W*0.3),h=M.pol/2;
 // caixa do estator
 x.fillStyle=line;x.beginPath();x.arc(cx,cy,R,0,7);x.fill();
 x.fillStyle=card;x.beginPath();x.arc(cx,cy,R*0.72,0,7);x.fill();
 // ranhuras: brilho gira com o campo, cor = polo N ou S
 for(var i=0;i<24;i++){var a=i/24*2*Math.PI,v=Math.cos(h*a-th),px=cx+Math.cos(a)*R*0.86,py=cy+Math.sin(a)*R*0.86;
  x.globalAlpha=0.12+0.88*Math.abs(v);x.fillStyle=v>=0?acc:bad;x.beginPath();x.arc(px,py,R*0.07,0,7);x.fill()}
 x.globalAlpha=1;
 // rotor
 var ra=th/h*0.97;
 x.save();x.translate(cx,cy);x.rotate(ra);
 x.fillStyle=mut;x.globalAlpha=0.25;x.beginPath();x.arc(0,0,R*0.62,0,7);x.fill();x.globalAlpha=1;
 x.strokeStyle=ink;x.lineWidth=2;
 for(var j=0;j<16;j++){x.save();x.rotate(j/16*2*Math.PI);x.beginPath();x.moveTo(R*0.2,0);x.lineTo(R*0.58,0);x.stroke();x.restore()}
 x.fillStyle=ink;x.beginPath();x.arc(0,0,R*0.16,0,7);x.fill();
 x.fillStyle=card;x.fillRect(R*0.02,-R*0.025,R*0.14,R*0.05);
 x.restore();
 // seta do campo girante
 x.strokeStyle=acc;x.lineWidth=3;var fa=th/h;x.beginPath();x.moveTo(cx,cy);x.lineTo(cx+Math.cos(fa)*R*0.66,cy+Math.sin(fa)*R*0.66);x.stroke();
 // bobinas conectadas aos capacitores
 var bx=cx+R+16;x.strokeStyle=on?acc:line;x.lineWidth=2;x.setLineDash(on?[]:[4,4]);
 x.globalAlpha=0.35+0.65*mix;
 var cap=[-50,0,50];
 x.beginPath();x.moveTo(cx+R,cy);x.lineTo(bx,cy);x.moveTo(bx,cy-50);x.lineTo(bx,cy+50);x.stroke();
 var capx=W*0.82;
 cap.forEach(function(dy,n){var y=cy+dy;x.beginPath();x.moveTo(bx,y);x.lineTo(capx-6,y);x.moveTo(capx+6,y);x.lineTo(capx+30,y);x.stroke();
  var s=Math.abs(Math.sin(th-n*2.094));
  x.fillStyle=acc;x.globalAlpha=(0.15+0.7*s)*mix;x.fillRect(capx-6,y-14,4,28);x.fillRect(capx+2,y-14,4,28);
  x.globalAlpha=0.35+0.65*mix;x.setLineDash([]);x.lineWidth=3;x.beginPath();x.moveTo(capx-6,y-14);x.lineTo(capx-6,y+14);x.moveTo(capx+6,y-14);x.lineTo(capx+6,y+14);x.stroke();x.lineWidth=2;x.setLineDash(on?[]:[4,4])});
 x.setLineDash([]);x.globalAlpha=1;
 x.fillStyle=mut;x.font='13px "IBM Plex Sans",sans-serif';x.textAlign='center';
 x.fillText(fmt(M.pu/1000,2)+' kW no eixo · '+M.pol+' polos',cx,H-6);
 x.fillStyle=on?acc:mut;x.fillText(on?fmt(M.Qc/1000,2)+' kVAr · '+sci(M.C)+(M.k===3?' por fase':''):'banco desligado',capx,cy+82);
}

function drawWave(th,phi,amp){
 var g=setup($('cw'),210),x=g.x,W=g.w,H=g.h,acc=col('--acc'),cur=col('--cur'),bad=col('--bad'),line=col('--line'),mut=col('--mut'),mid=H/2,A=H*0.4;
 x.strokeStyle=line;x.lineWidth=1;x.beginPath();x.moveTo(0,mid);x.lineTo(W,mid);x.stroke();
 function ang(px){return th-(1-px/W)*4*Math.PI}
 // potência instantânea
 for(var px=0;px<W;px+=2){var a=ang(px),p=Math.sin(a)*amp*Math.sin(a-phi);x.fillStyle=p>=0?acc:bad;x.globalAlpha=0.3;x.fillRect(px,p>=0?mid-p*A:mid,2,Math.abs(p)*A)}
 x.globalAlpha=1;x.lineWidth=2.5;
 x.strokeStyle=acc;x.beginPath();for(var px2=0;px2<=W;px2+=2){var y=mid-Math.sin(ang(px2))*A;px2?x.lineTo(px2,y):x.moveTo(px2,y)}x.stroke();
 x.strokeStyle=cur;x.beginPath();for(var px3=0;px3<=W;px3+=2){var y2=mid-amp*Math.sin(ang(px3)-phi)*A;px3?x.lineTo(px3,y2):x.moveTo(px3,y2)}x.stroke();
 x.fillStyle=acc;x.beginPath();x.arc(W-4,mid-Math.sin(ang(W))*A,5,0,7);x.fill();
 x.fillStyle=cur;x.beginPath();x.arc(W-4,mid-amp*Math.sin(ang(W)-phi)*A,5,0,7);x.fill();
 x.fillStyle=mut;x.font='13px "IBM Plex Sans",sans-serif';x.textAlign='left';
 x.fillText('φ = '+fmt(phi*180/Math.PI,1)+'°   FP = '+fmt(Math.cos(phi),3)+'   corrente '+fmt(amp*100,0)+'% da original',8,16);
}

var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
function frame(ts){
 if(M){var sp=Number($('sp').value)*(reduce?0.3:1),th=ts/1000*sp*2*Math.PI;
  mix+=((on?1:0)-mix)*0.07;
  var phi=M.phi1+(M.phi2-M.phi1)*mix,amp=1+(M.fp1/M.fp2-1)*mix;
  drawMotor(th);drawWave(th,phi,amp)}
 requestAnimationFrame(frame)}

function setOn(v){on=v;$('b0').setAttribute('aria-pressed',String(!v));$('b1').setAttribute('aria-pressed',String(v))}
$('b0').addEventListener('click',function(){setOn(false)});
$('b1').addEventListener('click',function(){setOn(true)});
['pu','un','eta','v','f','fp1','fp2','pol','lig'].forEach(function(i){$(i).addEventListener('input',calc);$(i).addEventListener('change',calc)});
$('theme').addEventListener('click',function(){var r=document.documentElement,d=r.getAttribute('data-theme')?r.getAttribute('data-theme')==='dark':matchMedia('(prefers-color-scheme:dark)').matches;r.setAttribute('data-theme',d?'light':'dark')});
calc();requestAnimationFrame(frame);
})();