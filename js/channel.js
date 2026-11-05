/* Halaman channel (channel.html?id=...) */
var cid=new URLSearchParams(location.search).get("id"),cur=null;
var TABS=[["beranda","Beranda"],["video","Video"],["live","Live"],["postingan","Postingan"]];
var BRANDS={"instagram.com":["instagram","linear-gradient(45deg,#f9a03f,#dd2a7b 55%,#5851db)"],"tiktok.com":["tiktok","#000"],"discord.gg":["discord","#5865f2"],"discord.com":["discord","#5865f2"],"x.com":["x","#000"],"twitter.com":["x","#000"],"youtube.com":["youtube","#f00"],"youtu.be":["youtube","#f00"],"facebook.com":["facebook","#1877f2"],"github.com":["github","#24292f"],"twitch.tv":["twitch","#9146ff"]};
function host(u){return String(u).replace(/^https?:\/\/(www\.)?/i,"").replace(/\/$/,"")}
function safe(u){return /^https?:\/\//i.test(u)?u:"#"}
/* Ikon yang digambar dengan kode (SVG), tanpa file gambar. Format: "domain": [warna latar, SVG]. Boleh diganti dengan SVG logo aslinya. */
var INLINE={"tako.id":["#2f7df6",'<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="9.2" rx="5.6" ry="5" fill="#fff"/><g fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round"><path d="M8.6 12.5Q8 16.5 5 17.5"/><path d="M10.7 13.5Q10.5 17.5 8.5 19"/><path d="M13.3 13.5Q13.5 17.5 15.5 19"/><path d="M15.4 12.5Q16 16.5 19 17.5"/></g><circle cx="9.9" cy="9.4" r="1.15" fill="#2f7df6"/><circle cx="14.1" cy="9.4" r="1.15" fill="#2f7df6"/></svg>'],
"trakteer.id":["#ef5b50",'<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="13.2" rx="6.4" ry="5.6" fill="#fff"/><path fill="#fff" d="M5.8 11.5L6.3 4.2L11.2 8.4ZM18.2 11.5L17.7 4.2L12.8 8.4Z"/><circle cx="9.4" cy="13" r="1.05" fill="#ef5b50"/><circle cx="14.6" cy="13" r="1.05" fill="#ef5b50"/><path fill="#ef5b50" d="M11.1 15H12.9L12 16.1Z"/></svg>']};
function logo(u,small,custom){
  var h=host(u).split("/")[0].toLowerCase(),sm=small?" sm":"";
  var match=function(m){return Object.keys(m).find(function(d){return h===d||h.endsWith("."+d)})};
  if(custom)return '<span class="dic brand pic'+sm+'"><img class="bi" src="'+esc(custom)+'" alt=""></span>';
  var ik=match(INLINE);
  if(ik)return '<span class="dic brand'+sm+'" style="background:'+INLINE[ik][0]+'">'+INLINE[ik][1]+'</span>';
  var k=match(BRANDS);
  if(!k)return '<span class="dic'+sm+'">🔗</span>';
  return '<span class="dic brand'+sm+'" style="background:'+BRANDS[k][1]+'"><img class="bi" src="https://cdn.simpleicons.org/'+BRANDS[k][0]+'/ffffff" alt="" width="18" height="18"></span>';
}
function fixLogos(root){root.querySelectorAll("img.bi").forEach(function(i){i.onerror=function(){var p=this.parentNode;p.style.background="none";p.style.border="0";p.textContent="🔗"}})}
function tabName(){var h=location.hash.slice(1);return TABS.some(function(t){return t[0]===h})?h:"beranda"}
function postCard(p){return '<article class="cpost">'+avHTML(cur)+'<div><b>'+esc(cur.name)+'</b> <span class="meta">'+esc(p.date)+'</span>'+accBadge(p,1)+'<p>'+linkify(p.text)+'</p>'+(p.image?'<img class="pimg" src="'+esc(p.image)+'" alt="'+esc(p.alt||"")+'" loading="lazy">':'')+'<div class="meta">👍 '+fmt(p.likes||0)+' · 💬 '+fmt(p.comments||0)+'</div></div></article>'}
function section(t,body){return '<h3 class="sec">'+t+'</h3>'+body}
function vcount(){return videos.filter(function(v){return v.cid===cid&&v.type!=="live"}).length}

/* ---------- Dialog "Tentang channel" ---------- */
var dlg=document.createElement("dialog");dlg.id="dAbout";document.body.appendChild(dlg);wireDlg(dlg);
function row(ic,t){return '<div class="drow"><span class="dic">'+ic+'</span><div>'+esc(t)+'</div></div>'}
function openAbout(){
  var c=cur,links=c.links||[],f=mine("vk_follow").indexOf(cid)>-1;
  dlg.innerHTML='<button class="dclose" id="dx" aria-label="Tutup">✕</button><h3>'+esc(c.name)+'</h3>'+
  '<h4 class="dh">Deskripsi</h4><p class="dtext">'+linkify(c.about||c.desc||"Belum ada deskripsi.")+'</p>'+
  (links.length?'<h4 class="dh">Link</h4>'+links.map(function(l){return '<a class="dlink" href="'+esc(safe(l.url))+'" target="_blank" rel="noopener noreferrer">'+logo(l.url,0,l.icon)+'<div><b>'+esc(l.title||host(l.url))+'</b><div class="u">'+esc(host(l.url))+'</div></div></a>'}).join(""):"")+
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
  '<div class="chead2">'+avHTML(c,"huge")+'<div class="cinfo"><h1>'+esc(c.name)+'</h1>'+
  '<div class="meta">'+esc(c.handle||"")+' · <span id="fc"></span> · '+vcount()+' video</div>'+
  (c.desc?'<button class="cdesc" id="more"><span class="cdt">'+esc(c.desc)+'</span><b class="cmore">…selengkapnya</b></button>':'')+
  (l0?'<button class="clink" id="more2">'+logo(l0.url,1,l0.icon)+'<span>'+esc(host(l0.url))+'</span>'+(links.length>1?'<span class="cn"> dan '+(links.length-1)+' link lainnya</span>':'')+'</button>':'')+
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
