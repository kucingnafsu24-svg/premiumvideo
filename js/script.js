var $=function(s){return document.querySelector(s)};
function esc(t){return String(t).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
var user=null,nid=100,query="",channels=[],videos=[],loadErr=false;
var comments={v1:[{n:"Dewi",t:"Penjelasannya rapi dan mudah diikuti!",r:"user"}],v3:[{n:"Raka",t:"Ditunggu video lanjutannya.",r:"user"}]};

/* ---------- Data: dibaca dari data/posts.json ---------- */
function load(){
  return fetch("data/posts.json").then(function(r){if(!r.ok)throw new Error(r.status);return r.json()}).then(function(d){
    channels=d.channels||[];
    videos=(d.posts||[]).map(function(p){
      var c=channels.find(function(x){return x.id===p.channel})||{id:p.channel,name:p.channel};
      return{id:p.id,t:p.title,cid:c.id,ch:c.name,v:p.views||"0",d:p.duration||"",a:p.date||"",h:p.hue==null?200:p.hue,src:p.src||"",thumb:p.thumb||""}
    })
  }).catch(function(){loadErr=true});
}

/* ---------- Tampilan ---------- */
function bg(v){return v.thumb?"background:url('"+esc(v.thumb)+"') center/cover":"background:linear-gradient(135deg,hsl("+v.h+" 62% 48%),hsl("+(v.h+55)+" 65% 32%))"}
function card(v){return '<div class="vid"><a class="lk" href="#watch-'+esc(v.id)+'"><div class="th" style="'+bg(v)+'"><span class="dur">'+esc(v.d)+'</span></div><h3>'+esc(v.t)+'</h3></a><div class="meta"><a class="ch" href="#channel-'+esc(v.cid)+'">'+esc(v.ch)+'</a> · '+esc(v.v)+' ditonton · '+esc(v.a)+'</div></div>'}
function side(v){return '<a class="vid" href="#watch-'+esc(v.id)+'"><div class="th" style="'+bg(v)+'"></div><div><h3>'+esc(v.t)+'</h3><div class="meta">'+esc(v.ch)+' · '+esc(v.v)+' ditonton</div></div></a>'}
function chips(a){return '<div class="chips"><a class="chip'+(a?'':' on')+'" href="#home">Semua</a>'+channels.map(function(c){return '<a class="chip'+(a===c.id?' on':'')+'" href="#channel-'+esc(c.id)+'">'+esc(c.name)+'</a>'}).join("")+'</div>'}
function filt(list){return list.filter(function(v){return v.t.toLowerCase().indexOf(query.toLowerCase())>-1})}
function grid(list){return list.length?'<div class="grid">'+list.map(card).join("")+'</div>':'<div class="empty">Tidak ada video yang cocok. Coba kata kunci lain.</div>'}

function home(){
  $("#app").innerHTML=chips(null)+grid(filt(videos))+'<p class="note">Prototipe: akun dan komentar masih simulasi di browser ini. Daftar video dibaca dari data/posts.json.</p>';
}
function channel(id){
  var c=channels.find(function(x){return x.id===id});if(!c){location.hash="#home";return}
  var list=videos.filter(function(v){return v.cid===id});
  $("#app").innerHTML=chips(id)+'<div class="chhead"><div class="av big">'+esc(c.name[0].toUpperCase())+'</div><div><h1>'+esc(c.name)+'</h1><div class="meta">'+list.length+' video'+(c.desc?' · '+esc(c.desc):'')+'</div></div></div>'+grid(filt(list));
}
function watch(id){
  var v=videos.find(function(x){return x.id===id});if(!v){location.hash="#home";return}
  var player=v.src?'<video controls src="'+esc(v.src)+'"></video>':'<div><b>Video contoh</b><p>Isi kolom src di posts.json dengan alamat file videomu agar diputar di sini.</p></div>';
  var others=videos.filter(function(x){return x.id!==id}).sort(function(a,b){return (b.cid===v.cid)-(a.cid===v.cid)});
  $("#app").innerHTML='<div class="watch"><section><div class="player" '+(v.src?'':'style="'+bg(v)+'"')+'>'+player+'</div>'+
  '<h2>'+esc(v.t)+'</h2><div class="meta">'+esc(v.v)+' ditonton · '+esc(v.a)+'</div>'+
  '<a class="chrow" href="#channel-'+esc(v.cid)+'"><div class="av">'+esc(v.ch[0].toUpperCase())+'</div>'+esc(v.ch)+'</a><div class="cm" id="cm"></div></section>'+
  '<aside class="side">'+others.map(side).join("")+'</aside></div>';
  drawComments(id);
}

/* ---------- Komentar ---------- */
function drawComments(id){
  var list=comments[id]||[],box=$("#cm");if(!box)return;
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

/* ---------- Routing ---------- */
function draw(){
  if(loadErr){$("#app").innerHTML='<div class="empty">Gagal memuat data/posts.json. Pastikan file ada di folder data/ dan buka situs lewat Vercel atau server lokal, bukan langsung dari file.</div>';return}
  var h=location.hash.slice(1);
  if(h.indexOf("watch-")===0)watch(h.slice(6));else if(h.indexOf("channel-")===0)channel(h.slice(8));else home();
}
function route(){window.scrollTo(0,0);draw()}

/* ---------- Akun SIMULASI: data tersimpan di browser ini saja. Ganti objek Auth dengan backend asli (mis. Supabase Auth) nanti. ---------- */
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
  user={n:users[em].n,e:em,r:"user"};Auth.session(em);$("#aForm").reset();$("#dAuth").close();acct();draw()};

function acct(){
  $("#up").hidden=!(user&&user.r==="admin");
  $("#acct").innerHTML=user?'<div class="me"><div class="av">'+esc(user.n[0].toUpperCase())+'</div><button class="btn sm" id="lo">Keluar</button></div>':'<button class="btn" id="li">Masuk</button>';
  if(user)$("#lo").onclick=function(){user=null;Auth.session(null);acct();draw()};else $("#li").onclick=function(){openAuth("login")};
}

/* ---------- Unggah (disiapkan untuk admin, belum aktif) ---------- */
$("#up").onclick=function(){$("#dUp").showModal()};
$("#cancelUp").onclick=function(){$("#dUp").close()};
$("#doUp").onclick=function(){
  if(!user||user.r!=="admin")return;
  var f=$("#ufile").files[0],t=$("#utitle").value.trim();if(!f||!t){alert("Isi judul dan pilih file video.");return}
  var id="u"+(nid++);videos.unshift({id:id,t:t,cid:"videoku",ch:"Videoku",v:"0",d:"baru",h:Math.floor(Math.random()*360),a:"baru saja",src:URL.createObjectURL(f),thumb:""});
  $("#dUp").close();$("#utitle").value="";$("#ufile").value="";location.hash="#watch-"+id};

$("#q").oninput=function(e){query=e.target.value;if(location.hash.indexOf("watch-")>-1)location.hash="#home";else draw()};
var ss=Auth.getSession(),uu=Auth.load();if(ss&&uu[ss])user={n:uu[ss].n,e:ss,r:"user"};
addEventListener("hashchange",route);acct();load().then(route);
