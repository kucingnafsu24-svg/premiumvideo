/* Kode bersama untuk index.html dan post.html */
var $=function(s){return document.querySelector(s)};
function esc(t){return String(t).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function store(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}}
function put(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function fmt(n){return n>=1000?(n/1000).toFixed(1).replace(".",",").replace(",0","")+" rb":String(n)}
var user=null,channels=[],videos=[],loadErr=false;

/* ---------- Data: dibaca dari data/posts.json ---------- */
function load(){
  return fetch("data/posts.json").then(function(r){if(!r.ok)throw new Error(r.status);return r.json()}).then(function(d){
    channels=d.channels||[];
    videos=(d.posts||[]).map(function(p){
      var c=chan(p.channel);
      return{id:p.id,t:p.title,cid:c.id,ch:c.name,v:p.views||"0",d:p.duration||"",a:p.date||"",h:p.hue==null?200:p.hue,src:p.src||"",thumb:p.thumb||"",desc:p.desc||"",likes:p.likes||0}
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
