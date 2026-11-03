var $=function(s){return document.querySelector(s)};
function esc(t){return String(t).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
var user=null, nid=100, query="";
var videos=[
 {id:"v1",t:"Belajar desain antarmuka yang bersih",ch:"Videoku",v:"1,2 rb",d:"8:24",h:190,a:"2 hari lalu"},
 {id:"v2",t:"Catatan perjalanan: Bromo saat fajar",ch:"Videoku",v:"860",d:"12:05",h:20,a:"5 hari lalu"},
 {id:"v3",t:"Membuat website sendiri dari nol",ch:"Videoku",v:"3,4 rb",d:"21:40",h:160,a:"1 minggu lalu"},
 {id:"v4",t:"Playlist santai untuk bekerja",ch:"Videoku",v:"2,1 rb",d:"45:10",h:285,a:"2 minggu lalu"},
 {id:"v5",t:"Review gadget favorit bulan ini",ch:"Videoku",v:"540",d:"9:12",h:340,a:"3 minggu lalu"},
 {id:"v6",t:"Resep sederhana untuk akhir pekan",ch:"Videoku",v:"1,8 rb",d:"6:48",h:35,a:"1 bulan lalu"}
];
var comments={v1:[{n:"Dewi",t:"Penjelasannya rapi dan mudah diikuti!",r:"user"}],v3:[{n:"Raka",t:"Ditunggu video lanjutannya.",r:"user"}]};

function grad(h){return "background:linear-gradient(135deg,hsl("+h+" 62% 48%),hsl("+(h+55)+" 65% 32%))"}
function card(v){return '<a class="vid" href="#watch-'+v.id+'"><div class="th" style="'+grad(v.h)+'"><span class="dur">'+esc(v.d)+'</span></div><h3>'+esc(v.t)+'</h3><div class="meta">'+esc(v.ch)+' · '+esc(v.v)+' ditonton · '+esc(v.a)+'</div></a>'}
function side(v){return '<a class="vid" href="#watch-'+v.id+'"><div class="th" style="'+grad(v.h)+'"></div><div><h3>'+esc(v.t)+'</h3><div class="meta">'+esc(v.v)+' ditonton</div></div></a>'}

function home(){
  var list=videos.filter(function(v){return v.t.toLowerCase().indexOf(query.toLowerCase())>-1});
  $("#app").innerHTML='<h1>Tonton sesuatu hari ini</h1>'+(list.length?'<div class="grid">'+list.map(card).join("")+'</div>':'<div class="empty">Tidak ada video yang cocok. Coba kata kunci lain.</div>')+
  '<p class="note">Prototipe: akun dan komentar masih simulasi di browser ini. Daftar dengan email apa saja untuk mencoba.</p>';
}
function watch(id){
  var v=videos.find(function(x){return x.id===id}); if(!v){location.hash="#home";return}
  var player=v.src?'<video controls src="'+v.src+'"></video>':'<div><b>Video contoh</b><p>Pada versi asli, di sini diputar file video dari penyimpananmu sendiri.</p></div>';
  var others=videos.filter(function(x){return x.id!==id});
  $("#app").innerHTML='<div class="watch"><section><div class="player" '+(v.src?'':'style="'+grad(v.h)+'"')+'>'+player+'</div>'+
  '<h2>'+esc(v.t)+'</h2><div class="meta">'+esc(v.v)+' ditonton · '+esc(v.a)+'</div><div class="cm" id="cm"></div></section>'+
  '<aside class="side">'+others.map(side).join("")+'</aside></div>';
  drawComments(id);
}
function drawComments(id){
  var list=comments[id]||[], box=$("#cm"); if(!box)return;
  var form=user?'<div class="cform"><div class="av">'+esc(user.n[0].toUpperCase())+'</div><input id="ci" type="text" placeholder="Tulis komentar" maxlength="300" aria-label="Tulis komentar"><button class="btn pri" id="cs">Kirim</button></div>'
    :'<div class="cform"><span class="meta">Masuk dulu untuk berkomentar.</span><button class="btn sm" id="cl">Masuk</button></div>';
  box.innerHTML='<h4>'+list.length+' komentar</h4>'+form+list.map(function(c,i){
    var can=user&&(user.r==="admin"||c.me);
    return '<div class="c"><div class="av">'+esc(c.n[0].toUpperCase())+'</div><div><b>'+esc(c.n)+'</b>'+(c.r==="admin"?' <span class="tag">Admin</span>':'')+(can?' <button class="btn del" data-i="'+i+'">Hapus</button>':'')+'<p>'+esc(c.t)+'</p></div></div>'}).join("");
  var cs=$("#cs"),cl=$("#cl");
  if(cs){var send=function(){var t=$("#ci").value.trim();if(!t)return;(comments[id]=comments[id]||[]).unshift({n:user.n,t:t,r:user.r,me:true});drawComments(id)};cs.onclick=send;$("#ci").onkeydown=function(e){if(e.key==="Enter")send()}}
  if(cl)cl.onclick=function(){openAuth("login")};
  box.querySelectorAll(".del").forEach(function(b){b.onclick=function(){comments[id].splice(+b.dataset.i,1);drawComments(id)}});
}
function route(){var h=location.hash.slice(1);window.scrollTo(0,0);if(h.indexOf("watch-")===0)watch(h.slice(6));else home()}
function acct(){
  $("#up").hidden=!(user&&user.r==="admin");
  $("#acct").innerHTML=user?'<div class="me"><div class="av">'+esc(user.n[0].toUpperCase())+'</div><button class="btn sm" id="lo">Keluar</button></div>':'<button class="btn" id="li">Masuk</button>';
  if(user)$("#lo").onclick=function(){user=null;Auth.session(null);acct();route()};else $("#li").onclick=function(){openAuth("login")};
}
/* Akun SIMULASI: data tersimpan di browser ini saja. Ganti objek Auth dengan backend asli (mis. Supabase Auth) nanti. */
var Auth={
  load:function(){try{return JSON.parse(localStorage.getItem("vk_users")||"{}")}catch(e){return{}}},
  save:function(u){try{localStorage.setItem("vk_users",JSON.stringify(u))}catch(e){}},
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
  user={n:users[em].n,e:em,r:"user"};Auth.session(em);$("#aForm").reset();$("#dAuth").close();acct();route()};
$("#up").onclick=function(){$("#dUp").showModal()};
$("#cancelUp").onclick=function(){$("#dUp").close()};
$("#doUp").onclick=function(){
  if(!user||user.r!=="admin")return;
  var f=$("#ufile").files[0],t=$("#utitle").value.trim();if(!f||!t){alert("Isi judul dan pilih file video.");return}
  var id="u"+(nid++);videos.unshift({id:id,t:t,ch:"Videoku",v:"0",d:"baru",h:Math.floor(Math.random()*360),a:"baru saja",src:URL.createObjectURL(f)});
  $("#dUp").close();$("#utitle").value="";$("#ufile").value="";location.hash="#watch-"+id};
$("#q").oninput=function(e){query=e.target.value;if(location.hash.indexOf("watch-")>-1)location.hash="#home";else home()};
$("#theme").onclick=function(){var r=document.documentElement,dark=r.dataset.theme?r.dataset.theme==="dark":matchMedia("(prefers-color-scheme:dark)").matches;r.dataset.theme=dark?"light":"dark"};
var ss=Auth.getSession(),uu=Auth.load();if(ss&&uu[ss])user={n:uu[ss].n,e:ss,r:"user"};
addEventListener("hashchange",route);acct();route();
