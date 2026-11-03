/* Kode bersama untuk index.html dan post.html */
var $=function(s){return document.querySelector(s)};
function esc(t){return String(t).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function store(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}}
function put(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function fmt(n){return n>=1000?(n/1000).toFixed(1).replace(".",",").replace(",0","")+" rb":String(n)}
var user=null,channels=[],videos=[],community=[],loadErr=false;

/* ---------- Data: dibaca dari data/posts.json ---------- */
function load(){
  return fetch("data/posts.json").then(function(r){if(!r.ok)throw new Error(r.status);return r.json()}).then(function(d){
    channels=d.channels||[];community=d.community||[];
    videos=(d.posts||[]).map(function(p){
      var c=chan(p.channel);
      return{id:p.id,t:p.title,cid:c.id,ch:c.name,v:p.views||"0",d:p.duration||"",a:p.date||"",h:p.hue==null?200:p.hue,src:p.src||"",thumb:p.thumb||"",desc:p.desc||"",likes:p.likes||0,type:p.type||"video",status:p.status||""}
    })
  }).catch(function(){loadErr=true});
}
function chan(id){return channels.find(function(x){return x.id===id})||{id:id,name:id,followers:0}}
function bg(v){return v.thumb?"background:url('"+esc(v.thumb)+"') center/cover":"background:linear-gradient(135deg,hsl("+v.h+" 62% 48%),hsl("+(v.h+55)+" 65% 32%))"}

/* ---------- Akun SIMULASI: data tersimpan di browser ini saja. Ganti objek Auth dengan backend asli (mis. Supabase Auth) nanti. ---------- */
var Auth={
  load:function(){return store("vk_users",{})},
  save:function(u){put("vk_users",u)},
  session:function(em){try{em?localStorage.setItem("vk_session",em):localStorage.removeItem("vk_session")}catch(e){}},
  getSession:function(){try{return localStorage.getItem("vk_session")}catch(e){return null}},
  hash:async function(t){var b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(t));return Array.from(new Uint8Array(b)).map(function(x){return x.toString(16).padStart(2,"0")}).join("")}
};
var mode="login";
function setMode(m){mode=m;var r=m==="register";
  $("#aName").hidden=!r;$("#aTitle").textContent=r?"Buat akun Videoku":"Masuk ke Videoku";
  $("#aSub").textContent=r?"Daftar dengan email dan kata sandi.":"Masuk dengan email dan kata sandimu.";
  $("#aGo").textContent=r?"Daftar":"Masuk";$("#aAsk").textContent=r?"Sudah punya akun?":"Belum punya akun?";
  $("#aSwap").textContent=r?"Masuk":"Daftar";$("#aPass").autocomplete=r?"new-password":"current-password";$("#aErr").textContent=""}
function openAuth(m){setMode(m);$("#dAuth").showModal()}
function changed(){acct();if(typeof onAuth==="function")onAuth()}
$("#aSwap").onclick=function(){setMode(mode==="login"?"register":"login")};
$("#aCancel").onclick=function(){$("#dAuth").close()};
$("#aForm").onsubmit=async function(ev){
  ev.preventDefault();var err=$("#aErr");err.textContent="";
  var n=$("#aName").value.trim(),em=$("#aEmail").value.trim().toLowerCase(),p=$("#aPass").value;
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)){err.textContent="Format email belum benar.";return}
  if(p.length<8){err.textContent="Kata sandi minimal 8 karakter.";return}
  var users=Auth.load(),hh=await Auth.hash(em+":"+p);
  if(mode==="register"){
    if(!n){err.textContent="Isi namamu dulu.";return}
    if(users[em]){err.textContent="Email ini sudah terdaftar. Silakan masuk.";return}
    users[em]={n:n,h:hh};Auth.save(users);
  }else if(!users[em]||users[em].h!==hh){err.textContent="Email atau kata sandi salah.";return}
  user={n:users[em].n,e:em,r:"user"};Auth.session(em);$("#aForm").reset();$("#dAuth").close();changed()};
function acct(){
  $("#acct").innerHTML=user?'<div class="me"><div class="av">'+esc(user.n[0].toUpperCase())+'</div><button class="btn sm" id="lo">Keluar</button></div>':'<button class="btn" id="li">Masuk</button>';
  if(user)$("#lo").onclick=function(){user=null;Auth.session(null);changed()};else $("#li").onclick=function(){openAuth("login")};
}
var ss=Auth.getSession(),uu=Auth.load();if(ss&&uu[ss])user={n:uu[ss].n,e:ss,r:"user"};
acct();

/* ---------- Pengikut, suka, dan kartu video ---------- */
function mine(k){return user?(store(k,{})[user.e]||[]):[]}
function flip(k,val){var a=store(k,{}),l=a[user.e]||[],i=l.indexOf(val);if(i>-1)l.splice(i,1);else l.push(val);a[user.e]=l;put(k,a)}
function badge(v){return v.status==="live"?'<span class="dur live">LIVE</span>':'<span class="dur">'+esc(v.d)+'</span>'}
function card(v,noCh){
  var views=esc(v.v)+(v.status==="live"?' menonton':' ditonton');
  return '<div class="vid"><a class="lk" href="post.html?id='+esc(v.id)+'"><div class="th" style="'+bg(v)+'">'+badge(v)+'</div><h3>'+esc(v.t)+'</h3></a><div class="meta">'+(noCh?'':'<a class="ch" href="channel.html?id='+esc(v.cid)+'">'+esc(v.ch)+'</a> · ')+views+' · '+esc(v.a)+'</div></div>';
}
function grid(list,noCh){return list.length?'<div class="grid">'+list.map(function(v){return card(v,noCh)}).join("")+'</div>':'<div class="empty">Belum ada konten di sini.</div>'}

/* ---------- Pencarian: tidak peduli huruf besar/kecil, mentoleransi salah ketik ---------- */
function norm(t){return String(t).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9\s]/g," ").replace(/\s+/g," ").trim()}
function lev(a,b){var m=a.length,n=b.length,p=[],i,j;for(j=0;j<=n;j++)p[j]=j;for(i=1;i<=m;i++){var prev=p[0];p[0]=i;for(j=1;j<=n;j++){var t=p[j];p[j]=Math.min(p[j]+1,p[j-1]+1,prev+(a[i-1]===b[j-1]?0:1));prev=t}}return p[n]}
function tokScore(q,w){
  if(w===q)return 4;
  if(w.indexOf(q)===0)return 3;
  if(q.length>1&&w.indexOf(q)>-1)return 2;
  if(q.length>=3){var t=q.length>=7?2:1,d=q.length===3?lev(q,w):Math.min(lev(q,w),lev(q,w.slice(0,q.length)));if(d<=t)return 1.5-d*0.3}
  return 0;
}
function score(q,text){
  var nq=norm(q);if(!nq)return 0;
  var nt=norm(text),qs=nq.split(" "),ws=nt.split(" "),tot=0,cq=nq.replace(/ /g,"");
  if(cq.length>1&&nt.replace(/ /g,"").indexOf(cq)>-1)return 6;
  for(var i=0;i<qs.length;i++){var b=0;for(var j=0;j<ws.length;j++){var s=tokScore(qs[i],ws[j]);if(s>b)b=s}if(!b)return 0;tot+=b}
  return tot/qs.length;
}
function searchAll(q){
  var cs=[],vs=[],by=function(a,b){return b.s-a.s||a.i-b.i};
  channels.forEach(function(c,i){var s=score(q,c.name+" "+(c.handle||""));if(s>0)cs.push({c:c,s:s,i:i})});
  videos.forEach(function(v,i){var s=score(q,v.t+" "+v.ch);if(s>0)vs.push({v:v,s:s,i:i})});
  return{channels:cs.sort(by),videos:vs.sort(by)};
}
function showSug(){
  var q=$("#q").value.trim(),box=$("#sug");
  if(!q){box.hidden=true;return}
  var r=searchAll(q),h='<a class="si" href="index.html?q='+encodeURIComponent(q)+'"><span class="mi">🔍</span><div>Cari “'+esc(q)+'”</div></a>';
  r.channels.slice(0,3).forEach(function(x){h+='<a class="si" href="channel.html?id='+esc(x.c.id)+'"><span class="av sm">'+esc(x.c.name[0].toUpperCase())+'</span><div><div>'+esc(x.c.name)+'</div><div class="meta">Channel · '+fmt(x.c.followers||0)+' pengikut</div></div></a>'});
  r.videos.slice(0,5).forEach(function(x){h+='<a class="si" href="post.html?id='+esc(x.v.id)+'"><span class="mi">▶</span><div><div>'+esc(x.v.t)+'</div><div class="meta">'+esc(x.v.ch)+'</div></div></a>'});
  box.innerHTML=h;box.hidden=false;
}
$("#q").addEventListener("input",showSug);
$("#q").addEventListener("focus",showSug);
$("#q").addEventListener("blur",function(){$("#sug").hidden=true});
$("#q").addEventListener("keydown",function(e){if(e.key==="Escape"||e.key==="Enter")$("#sug").hidden=true});
$("#sug").addEventListener("mousedown",function(e){e.preventDefault()});
