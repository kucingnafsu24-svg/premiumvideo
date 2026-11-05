/* Halaman channel (channel.html?id=...) */
var cid=new URLSearchParams(location.search).get("id"),cur=null;
var TABS=[["beranda","Beranda"],["video","Video"],["live","Live"],["postingan","Postingan"]];
var BRANDS={"instagram.com":["instagram","linear-gradient(45deg,#f9a03f,#dd2a7b 55%,#5851db)"],"tiktok.com":["tiktok","#000"],"discord.gg":["discord","#5865f2"],"discord.com":["discord","#5865f2"],"x.com":["x","#000"],"twitter.com":["x","#000"],"youtube.com":["youtube","#f00"],"youtu.be":["youtube","#f00"],"facebook.com":["facebook","#1877f2"],"github.com":["github","#24292f"],"twitch.tv":["twitch","#9146ff"]};
function host(u){return String(u).replace(/^https?:\/\/(www\.)?/i,"").replace(/\/$/,"")}
function safe(u){return /^https?:\/\//i.test(u)?u:"#"}
function logo(u,small){
  var h=host(u).split("/")[0].toLowerCase(),k=Object.keys(BRANDS).find(function(d){return h===d||h.endsWith("."+d)}),sm=small?" sm":"";
  if(!k)return '<span class="dic'+sm+'">🔗</span>';
  var b=BRANDS[k];
  return '<span class="dic brand'+sm+'" style="background:'+b[1]+'"><img class="bi" src="https://cdn.simpleicons.org/'+b[0]+'/ffffff" alt="" width="18" height="18"></span>';
}
function fixLogos(root){root.querySelectorAll("img.bi").forEach(function(i){i.onerror=function(){var p=this.parentNode;p.style.background="none";p.style.border="0";p.textContent="🔗"}})}
function tabName(){var h=location.hash.slice(1);return TABS.some(function(t){return t[0]===h})?h:"beranda"}
function postCard(p){return '<article class="cpost"><div class="av">'+esc(cur.name[0].toUpperCase())+'</div><div><b>'+esc(cur.name)+'</b> <span class="meta">'+esc(p.date)+'</span><p>'+esc(p.text)+'</p>'+(p.image?'<img class="pimg" src="'+esc(p.image)+'" alt="'+esc(p.alt||"")+'" loading="lazy">':'')+'<div class="meta">👍 '+fmt(p.likes||0)+' · 💬 '+fmt(p.comments||0)+'</div></div></article>'}
function section(t,body){return '<h3 class="sec">'+t+'</h3>'+body}
function vcount(){return videos.filter(function(v){return v.cid===cid&&v.type!=="live"}).length}

/* ---------- Dialog "Tentang channel" ---------- */
var dlg=document.createElement("dialog");dlg.id="dAbout";document.body.appendChild(dlg);wireDlg(dlg);
function row(ic,t){return '<div class="drow"><span class="dic">'+ic+'</span><div>'+esc(t)+'</div></div>'}
function openAbout(){
  var c=cur,links=c.links||[],f=mine("vk_follow").indexOf(cid)>-1;
  dlg.innerHTML='<button class="dclose" id="dx" aria-label="Tutup">✕</button><h3>'+esc(c.name)+'</h3>'+
  '<h4 class="dh">Deskripsi</h4><p class="dtext">'+esc(c.about||c.desc||"Belum ada deskripsi.")+'</p>'+
  (links.length?'<h4 class="dh">Link</h4>'+links.map(function(l){return '<a class="dlink" href="'+esc(safe(l.url))+'" target="_blank" rel="noopener noreferrer">'+logo(l.url)+'<div><b>'+esc(l.title||host(l.url))+'</b><div class="u">'+esc(host(l.url))+'</div></div></a>'}).join(""):"")+
  '<h4 class="dh">Info selengkapnya</h4>'+
  row("🔗",location.origin+location.pathname+"?id="+encodeURIComponent(c.id))+
  (c.country?row("🌐",c.country):"")+(c.joined?row("ℹ","Bergabung pada "+c.joined):"")+
  row("👥",fmt((c.followers||0)+(f?1:0))+" pengikut")+row("▶",vcount()+" video");
  fixLogos(dlg);
  $("#dx").onclick=function(){closeDlg(dlg)};
  dlg.showModal();
}

/* ---------- Isi tab ---------- */
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
  if(loadErr){app.innerHTML='<div class="empty">Gagal memuat data. Buka situs lewat Vercel atau server lokal, bukan langsung dari file.</div>';return}
  var c=channels.find(function(x){return x.id===cid});
  if(!c){app.innerHTML='<div class="empty">Channel tidak ditemukan. <a class="ch" style="text-decoration:underline" href="index.html">Kembali ke beranda</a></div>';return}
  cur=c;document.title=c.name+" - Videoku";
  var hue=c.hue==null?200:c.hue,links=c.links||[],l0=links[0];
  var banner=c.banner?"background:url('"+esc(c.banner)+"') center/cover":"background:linear-gradient(120deg,hsl("+hue+" 55% 35%),hsl("+(hue+60)+" 60% 20%))";
  app.innerHTML='<div class="cbanner" style="'+banner+'"></div>'+
  '<div class="chead2"><div class="av huge">'+esc(c.name[0].toUpperCase())+'</div><div class="cinfo"><h1>'+esc(c.name)+'</h1>'+
  '<div class="meta">'+esc(c.handle||"")+' · <span id="fc"></span> · '+vcount()+' video</div>'+
  (c.desc?'<button class="cdesc" id="more"><span class="cdt">'+esc(c.desc)+'</span><b class="cmore">…selengkapnya</b></button>':'')+
  (l0?'<button class="clink" id="more2">'+logo(l0.url,1)+'<span>'+esc(host(l0.url))+'</span>'+(links.length>1?'<span class="cn"> dan '+(links.length-1)+' link lainnya</span>':'')+'</button>':'')+
  '<div class="cbtns"><button class="btn pri" id="fb"></button></div></div></div>'+
  '<nav class="tabs">'+TABS.map(function(t){return '<a class="tab" data-t="'+t[0]+'" href="#'+t[0]+'">'+t[1]+'</a>'}).join("")+'</nav><div id="tc"></div>';
  fixLogos(app);
  ["more","more2"].forEach(function(id){var b=$("#"+id);if(b)b.onclick=openAbout});
  $("#fb").onclick=function(){if(!user){openAuth("login");return}flip("vk_follow",cid);paint()};
  paint();showTab();
}
function onAuth(){if(cur)paint()}
$("#q").onkeydown=function(e){if(e.key==="Enter")location.href="index.html?q="+encodeURIComponent(this.value)};
addEventListener("hashchange",function(){if(cur)showTab()});
load().then(draw);
