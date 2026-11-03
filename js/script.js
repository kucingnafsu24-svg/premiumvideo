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
  '<p class="note">Prototipe: login, komentar, dan unggah masih simulasi di browser. Coba masuk sebagai admin untuk melihat tombol unggah.</p>';
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
  if(cl)cl.onclick=function(){$("#dLogin").showModal()};
  box.querySelectorAll(".del").forEach(function(b){b.onclick=function(){comments[id].splice(+b.dataset.i,1);drawComments(id)}});
}
function route(){var h=location.hash.slice(1);window.scrollTo(0,0);if(h.indexOf("watch-")===0)watch(h.slice(6));else home()}
function acct(){
  $("#up").hidden=!(user&&user.r==="admin");
  $("#acct").innerHTML=user?'<div class="me"><div class="av">'+esc(user.n[0].toUpperCase())+'</div><button class="btn sm" id="lo">Keluar</button></div>':'<button class="btn" id="li">Masuk</button>';
  if(user)$("#lo").onclick=function(){user=null;acct();route()};else $("#li").onclick=function(){$("#dLogin").showModal()};
}
$("#dLogin").addEventListener("click",function(e){var r=e.target.dataset&&e.target.dataset.role;if(!r)return;
  if(r!=="cancel"){user={n:$("#uname").value.trim()||(r==="admin"?"Admin":"Tamu"),r:r};acct();route()}
  $("#dLogin").close()});
$("#up").onclick=function(){$("#dUp").showModal()};
$("#cancelUp").onclick=function(){$("#dUp").close()};
$("#doUp").onclick=function(){
  if(!user||user.r!=="admin")return;
  var f=$("#ufile").files[0],t=$("#utitle").value.trim();if(!f||!t){alert("Isi judul dan pilih file video.");return}
  var id="u"+(nid++);videos.unshift({id:id,t:t,ch:"Videoku",v:"0",d:"baru",h:Math.floor(Math.random()*360),a:"baru saja",src:URL.createObjectURL(f)});
  $("#dUp").close();$("#utitle").value="";$("#ufile").value="";location.hash="#watch-"+id};
$("#q").oninput=function(e){query=e.target.value;if(location.hash.indexOf("watch-")>-1)location.hash="#home";else home()};
$("#theme").onclick=function(){var r=document.documentElement,dark=r.dataset.theme?r.dataset.theme==="dark":matchMedia("(prefers-color-scheme:dark)").matches;r.dataset.theme=dark?"light":"dark"};
addEventListener("hashchange",route);acct();route();
