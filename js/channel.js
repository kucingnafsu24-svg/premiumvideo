/* Halaman channel (channel.html?id=...) */
var cid=new URLSearchParams(location.search).get("id"),cur=null;
var TABS=[["beranda","Beranda"],["video","Video"],["live","Live"],["postingan","Postingan"]];
function tabName(){var h=location.hash.slice(1);return TABS.some(function(t){return t[0]===h})?h:"beranda"}
function postCard(p){return '<article class="cpost"><div class="av">'+esc(cur.name[0].toUpperCase())+'</div><div><b>'+esc(cur.name)+'</b> <span class="meta">'+esc(p.date)+'</span><p>'+esc(p.text)+'</p>'+(p.image?'<img class="pimg" src="'+esc(p.image)+'" alt="'+esc(p.alt||"")+'" loading="lazy">':'')+'<div class="meta">👍 '+fmt(p.likes||0)+' · 💬 '+fmt(p.comments||0)+'</div></div></article>'}
function section(t,body){return '<h3 class="sec">'+t+'</h3>'+body}
function showTab(){
  var t=tabName(),all=videos.filter(function(v){return v.cid===cid}),
  lives=all.filter(function(v){return v.type==="live"}),vids=all.filter(function(v){return v.type!=="live"}),
  posts=community.filter(function(p){return p.channel===cid}),h="";
  document.querySelectorAll(".tab").forEach(function(a){a.className="tab"+(a.dataset.t===t?" on":"")});
  if(t==="beranda"){
    var on=lives.filter(function(v){return v.status==="live"});
    h=(on.length?section("Sedang live",grid(on,true)):"")+section("Video terbaru",grid(vids.slice(0,4),true))+(posts.length?section("Postingan terbaru",posts.slice(0,2).map(postCard).join("")):"");
  }else if(t==="video")h=grid(vids,true);
  else if(t==="live")h=grid(lives,true);
  else h=posts.length?posts.map(postCard).join(""):'<div class="empty">Belum ada postingan.</div>';
  $("#tc").innerHTML=h;
}
function paint(){
  var f=mine("vk_follow").indexOf(cid)>-1;
  $("#fc").textContent=fmt((cur.followers||0)+(f?1:0))+" pengikut";
  $("#fb").textContent=f?"Mengikuti":"Ikuti";$("#fb").className="btn"+(f?"":" pri");
}
function draw(){
  var app=$("#app");
  if(loadErr){app.innerHTML='<div class="empty">Gagal memuat data/posts.json. Buka situs lewat Vercel atau server lokal, bukan langsung dari file.</div>';return}
  var c=channels.find(function(x){return x.id===cid});
  if(!c){app.innerHTML='<div class="empty">Channel tidak ditemukan. <a class="ch" style="text-decoration:underline" href="index.html">Kembali ke beranda</a></div>';return}
  cur=c;document.title=c.name+" - Videoku";
  var n=videos.filter(function(v){return v.cid===cid&&v.type!=="live"}).length,hue=c.hue==null?200:c.hue;
  app.innerHTML='<div class="cbanner" style="background:linear-gradient(120deg,hsl('+hue+' 55% 35%),hsl('+(hue+60)+' 60% 20%))"></div>'+
  '<div class="chead2"><div class="av huge">'+esc(c.name[0].toUpperCase())+'</div><div class="cinfo"><h1>'+esc(c.name)+'</h1><div class="meta">'+esc(c.handle||"")+' · <span id="fc"></span> · '+n+' video</div><div class="meta">'+esc(c.desc||"")+'</div></div><button class="btn pri" id="fb"></button></div>'+
  '<nav class="tabs">'+TABS.map(function(t){return '<a class="tab" data-t="'+t[0]+'" href="#'+t[0]+'">'+t[1]+'</a>'}).join("")+'</nav><div id="tc"></div>';
  $("#fb").onclick=function(){if(!user){openAuth("login");return}flip("vk_follow",cid);paint()};
  paint();showTab();
}
function onAuth(){if(cur)paint()}
$("#q").onkeydown=function(e){if(e.key==="Enter")location.href="index.html?q="+encodeURIComponent(this.value)};
addEventListener("hashchange",function(){if(cur)showTab()});
load().then(draw);
