/* Beranda, menu kiri, dan hasil pencarian (index.html) */
var query=new URLSearchParams(location.search).get("q")||"";
var NAV=[["beranda","🏠","Beranda"],["live","📡","Live"],["langganan","📺","Langganan"],["disukai","👍","Disukai"]];
function view(){var h=location.hash.slice(1);return["live","langganan","disukai"].indexOf(h)>-1?h:"beranda"}
function emptyMsg(t,d){return '<div class="empty"><b>'+t+'</b><p>'+d+'</p></div>'}
function needLogin(t){return '<div class="empty"><b>'+t+'</b><p>Masuk untuk melihat halaman ini.</p><button class="btn pri" id="gl">Masuk</button></div>'}
function chRow(c){
  var n=videos.filter(function(v){return v.cid===c.id&&v.type!=="live"}).length;
  return '<a class="chres" href="channel.html?id='+esc(c.id)+'"><div class="av big">'+esc(c.name[0].toUpperCase())+'</div><div><b>'+esc(c.name)+'</b><div class="meta">'+esc(c.handle||"")+' · '+fmt(c.followers||0)+' pengikut · '+n+' video</div><div class="meta">'+esc(c.desc||"")+'</div></div></a>';
}

/* ---------- Menu kiri ---------- */
function navRender(){
  var v=query.trim()?"":view(),live={};
  videos.forEach(function(x){if(x.status==="live")live[x.cid]=1});
  $("#nav").innerHTML=NAV.map(function(i){return '<a class="ni'+(i[0]===v?' on':'')+'" href="#'+i[0]+'"><span class="ic">'+i[1]+'</span>'+i[2]+'</a>'}).join("")+
  '<hr class="nsep"><div class="nh">Channel</div>'+
  channels.map(function(c){return '<a class="ni" href="channel.html?id='+esc(c.id)+'"><span class="av sm">'+esc(c.name[0].toUpperCase())+'</span><span class="nn">'+esc(c.name)+'</span>'+(live[c.id]?'<span class="ldot" title="Sedang live"></span>':'')+'</a>'}).join("");
}
var mq=matchMedia("(max-width:900px)");
function closeNav(){document.body.classList.remove("nav-on")}
$("#menu").onclick=function(){document.body.classList.toggle(mq.matches?"nav-on":"nav-off")};
$("#nav").addEventListener("click",function(e){
  var a=e.target.closest("a");if(!a)return;
  if(a.getAttribute("href").charAt(0)==="#"){query="";$("#q").value="";draw();window.scrollTo(0,0)}
  closeNav();
});

/* ---------- Isi halaman ---------- */
function draw(){
  var app=$("#app"),q=query.trim(),v=view();
  navRender();
  if(loadErr){app.innerHTML='<div class="empty">Gagal memuat data. Pastikan folder data/ berisi channels.json, videos.json, live.json, dan postingan.json, lalu buka situs lewat Vercel atau server lokal, bukan langsung dari file.</div>';return}
  if(q){
    var r=searchAll(q),h='<h1>Hasil untuk “'+esc(q)+'”</h1>';
    if(r.channels.length)h+='<h3 class="sec">Channel</h3>'+r.channels.map(function(x){return chRow(x.c)}).join("");
    if(r.videos.length)h+='<h3 class="sec">Video</h3>'+grid(r.videos.map(function(x){return x.v}));
    if(!r.channels.length&&!r.videos.length)h+='<div class="empty">Tidak ada hasil untuk “'+esc(q)+'”. Coba kata kunci lain atau periksa ejaannya.</div>';
    app.innerHTML=h;return;
  }
  if(v==="live"){
    var on=videos.filter(function(x){return x.status==="live"}),old=videos.filter(function(x){return x.type==="live"&&x.status!=="live"});
    app.innerHTML='<h3 class="sec">Sedang tayang</h3>'+(on.length?grid(on):'<p class="meta">Tidak ada siaran yang sedang tayang.</p>')+'<h3 class="sec">Rekaman siaran</h3>'+grid(old);
  }else if(v==="langganan"){
    if(!user)app.innerHTML=needLogin("Langganan");
    else{var f=mine("vk_follow");app.innerHTML=f.length?'<h3 class="sec">Video dari channel yang kamu ikuti</h3>'+grid(videos.filter(function(x){return f.indexOf(x.cid)>-1})):emptyMsg("Kamu belum mengikuti channel mana pun","Buka halaman sebuah channel lalu tekan Ikuti.")}
  }else if(v==="disukai"){
    if(!user)app.innerHTML=needLogin("Video yang kamu sukai");
    else{var l=mine("vk_likes");app.innerHTML=l.length?'<h3 class="sec">Video yang kamu sukai</h3>'+grid(videos.filter(function(x){return l.indexOf(x.id)>-1})):emptyMsg("Belum ada video yang kamu sukai","Tekan tombol Suka di halaman menonton, dan videonya muncul di sini.")}
  }else app.innerHTML=grid(videos)+'<p class="note">Prototipe: akun dan komentar masih simulasi di browser ini. Daftar video dibaca dari folder data/.</p>';
  var g=$("#gl");if(g)g.onclick=function(){openAuth("login")};
}
function onAuth(){draw()}
$("#q").value=query;
$("#q").oninput=function(e){query=e.target.value;draw()};
addEventListener("hashchange",draw);
load().then(draw);
