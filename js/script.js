/* Beranda dan halaman channel (index.html) */
var query=new URLSearchParams(location.search).get("q")||"";
function card(v){return '<div class="vid"><a class="lk" href="post.html?id='+esc(v.id)+'"><div class="th" style="'+bg(v)+'"><span class="dur">'+esc(v.d)+'</span></div><h3>'+esc(v.t)+'</h3></a><div class="meta"><a class="ch" href="#channel-'+esc(v.cid)+'">'+esc(v.ch)+'</a> · '+esc(v.v)+' ditonton · '+esc(v.a)+'</div></div>'}
function chips(a){return '<div class="chips"><a class="chip'+(a?'':' on')+'" href="#home">Semua</a>'+channels.map(function(c){return '<a class="chip'+(a===c.id?' on':'')+'" href="#channel-'+esc(c.id)+'">'+esc(c.name)+'</a>'}).join("")+'</div>'}
function filt(list){return list.filter(function(v){return v.t.toLowerCase().indexOf(query.toLowerCase())>-1})}
function grid(list){return list.length?'<div class="grid">'+list.map(card).join("")+'</div>':'<div class="empty">Tidak ada video yang cocok. Coba kata kunci lain.</div>'}
function home(){
  $("#app").innerHTML=chips(null)+grid(filt(videos))+'<p class="note">Prototipe: akun dan komentar masih simulasi di browser ini. Daftar video dibaca dari data/posts.json.</p>';
}
function channel(id){
  var c=channels.find(function(x){return x.id===id});if(!c){location.hash="#home";return}
  var list=videos.filter(function(v){return v.cid===id});
  $("#app").innerHTML=chips(id)+'<div class="chhead"><div class="av big">'+esc(c.name[0].toUpperCase())+'</div><div><h1>'+esc(c.name)+'</h1><div class="meta">'+fmt(c.followers||0)+' pengikut · '+list.length+' video'+(c.desc?' · '+esc(c.desc):'')+'</div></div></div>'+grid(filt(list));
}
function draw(){
  if(loadErr){$("#app").innerHTML='<div class="empty">Gagal memuat data/posts.json. Pastikan file ada di folder data/ dan buka situs lewat Vercel atau server lokal, bukan langsung dari file.</div>';return}
  var h=location.hash.slice(1);
  if(h.indexOf("channel-")===0)channel(h.slice(8));else home();
}
function route(){window.scrollTo(0,0);draw()}
$("#q").value=query;
$("#q").oninput=function(e){query=e.target.value;draw()};
addEventListener("hashchange",route);load().then(route);
