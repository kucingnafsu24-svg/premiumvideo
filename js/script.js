/* Beranda (index.html) */
var query=new URLSearchParams(location.search).get("q")||"";
function filt(list){return list.filter(function(v){return v.t.toLowerCase().indexOf(query.toLowerCase())>-1})}
function draw(){
  if(loadErr){$("#app").innerHTML='<div class="empty">Gagal memuat data/posts.json. Pastikan file ada di folder data/ dan buka situs lewat Vercel atau server lokal, bukan langsung dari file.</div>';return}
  var list=filt(videos);
  $("#app").innerHTML='<h1>Tonton sesuatu hari ini</h1>'+(list.length?grid(list):'<div class="empty">Tidak ada video yang cocok. Coba kata kunci lain.</div>')+'<p class="note">Prototipe: akun dan komentar masih simulasi di browser ini. Daftar video dibaca dari data/posts.json.</p>';
}
$("#q").value=query;
$("#q").oninput=function(e){query=e.target.value;draw()};
load().then(draw);
