/* Beranda dan hasil pencarian (index.html) */
var query=new URLSearchParams(location.search).get("q")||"";
function chRow(c){
  var n=videos.filter(function(v){return v.cid===c.id&&v.type!=="live"}).length;
  return '<a class="chres" href="channel.html?id='+esc(c.id)+'"><div class="av big">'+esc(c.name[0].toUpperCase())+'</div><div><b>'+esc(c.name)+'</b><div class="meta">'+esc(c.handle||"")+' · '+fmt(c.followers||0)+' pengikut · '+n+' video</div><div class="meta">'+esc(c.desc||"")+'</div></div></a>';
}
function draw(){
  var app=$("#app"),q=query.trim();
  if(loadErr){app.innerHTML='<div class="empty">Gagal memuat data/posts.json. Pastikan file ada di folder data/ dan buka situs lewat Vercel atau server lokal, bukan langsung dari file.</div>';return}
  if(!q){app.innerHTML=grid(videos)+'<p class="note">Prototipe: akun dan komentar masih simulasi di browser ini. Daftar video dibaca dari data/posts.json.</p>';return}
  var r=searchAll(q),h='<h1>Hasil untuk “'+esc(q)+'”</h1>';
  if(r.channels.length)h+='<h3 class="sec">Channel</h3>'+r.channels.map(function(x){return chRow(x.c)}).join("");
  if(r.videos.length)h+='<h3 class="sec">Video</h3>'+grid(r.videos.map(function(x){return x.v}));
  if(!r.channels.length&&!r.videos.length)h+='<div class="empty">Tidak ada hasil untuk “'+esc(q)+'”. Coba kata kunci lain atau periksa ejaannya.</div>';
  app.innerHTML=h;
}
$("#q").value=query;
$("#q").oninput=function(e){query=e.target.value;draw()};
load().then(draw);
