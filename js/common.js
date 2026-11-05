/* Kode bersama untuk index.html dan post.html */
var $=function(s){return document.querySelector(s)};
function esc(t){return String(t).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
var loadErrs=[];
addEventListener("error",function(e){loadErrs.push("Kesalahan skrip: "+e.message+" ("+String(e.filename||"").split("/").pop()+":"+e.lineno+")");showErrs()});
function showErrs(){
  var b=$("#errs");
  if(!loadErrs.length){if(b)b.hidden=true;return}
  if(!b){b=document.createElement("div");b.id="errs";b.className="errbox";document.querySelector("header").insertAdjacentElement("afterend",b)}
  b.hidden=false;b.innerHTML=loadErrs.map(esc).join("<br>");
}
function store(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}}
function put(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function fmt(n){return n>=1000?(n/1000).toFixed(1).replace(".",",").replace(",0","")+" rb":String(n)}
var user=null,channels=[],videos=[],community=[],loadErr=false;

/* ---------- Data: channels.json, videos.json, live.json, postingan.json ---------- */
function getJSON(name){
  return fetch("data/"+name+".json").then(function(r){
    if(!r.ok)throw new Error("data/"+name+".json tidak ditemukan (kode "+r.status+")");
    return r.json();
  }).then(function(d){
    if(!Array.isArray(d))throw new Error("data/"+name+".json harus berupa daftar yang diawali [ dan diakhiri ]");
    return d;
  }).catch(function(e){
    loadErrs.push(e instanceof SyntaxError?"data/"+name+".json salah format: "+e.message:e.message);
    return [];
  });
}
/* Ubah link atau kode <iframe> menjadi URL embed yang aman (hanya https).
   Mendukung YouTube, Vimeo, Google Drive, Dailymotion; link https lain dipakai apa adanya. */
function embedUrl(raw){
  raw=String(raw||"").trim();if(!raw)return"";
  var m=raw.match(/<iframe[^>]*\ssrc\s*=\s*["']([^"']+)["']/i);if(m)raw=m[1];
  if(raw.indexOf("//")===0)raw="https:"+raw;
  var u;try{u=new URL(raw)}catch(e){return""}
  if(u.protocol!=="https:")return"";
  var h=u.hostname.replace(/^www\.|^m\./,""),id="",ph=typeof location!=="undefined"?location.hostname:"localhost";
  /* Live YouTube berdasarkan channel: https://www.youtube.com/embed/live_stream?channel=UCxxxxxxxxxxxxxxxxxxxxxx */
  if((h==="youtube.com"||h==="youtube-nocookie.com")&&u.pathname==="/embed/live_stream"){var cc=u.searchParams.get("channel")||"";return /^UC[\w-]{20,}$/.test(cc)?"https://www.youtube.com/embed/live_stream?channel="+cc:""}
  if(h==="youtu.be")id=u.pathname.slice(1).split("/")[0];
  else if(h==="youtube.com"||h==="youtube-nocookie.com"){
    if(u.pathname==="/watch")id=u.searchParams.get("v")||"";
    else{var p=u.pathname.match(/^\/(?:shorts|live|embed)\/([\w-]{6,})/);if(p)id=p[1]}
  }
  if(/^[\w-]{6,}$/.test(id))return"https://www.youtube-nocookie.com/embed/"+id;
  if(h==="vimeo.com"){var v=u.pathname.match(/^\/(\d+)/);if(v)return"https://player.vimeo.com/video/"+v[1]}
  if(h==="drive.google.com"){var d=u.pathname.match(/\/file\/d\/([\w-]+)/);if(d)return"https://drive.google.com/file/d/"+d[1]+"/preview"}
  if(h==="dailymotion.com"){var dm=u.pathname.match(/^\/video\/(\w+)/);if(dm)return"https://www.dailymotion.com/embed/video/"+dm[1]}
  /* Twitch wajib memakai parent=domain situsmu */
  if(h==="twitch.tv"){var tw=u.pathname.match(/^\/(\w+)\/?$/);if(tw)return"https://player.twitch.tv/?channel="+tw[1]+"&parent="+ph}
  if(h==="player.twitch.tv"&&!u.searchParams.get("parent")){u.searchParams.set("parent",ph);return u.href}
  return u.href;
}
/* Thumbnail otomatis untuk embed YouTube bila "thumb" kosong */
function embedThumb(e){var m=String(e||"").match(/youtube-nocookie\.com\/embed\/([\w-]+)/);return m?"https://i.ytimg.com/vi/"+m[1]+"/hqdefault.jpg":""}
/* Daftar server per video. Pakai "servers":[{"name":"Server 1","embed":"..."},{"name":"Server 2","src":"..."}]
   atau cukup "embed" / "src" biasa (otomatis jadi Server 1, Server 2). */
function mapServers(p){
  var out=[],add=function(n,e,f){var u=embedUrl(e);if(u||f)out.push({n:n||("Server "+(out.length+1)),embed:u,src:f||""})};
  if(Array.isArray(p.servers))p.servers.forEach(function(s){if(s)add(s.name,s.embed,s.src)});
  else{if(p.embed)add("",p.embed,"");if(p.src)add("","",p.src)}
  return out;
}
function mapVid(p,type){
  var c=chan(p.channel),sv=mapServers(p),em=(sv[0]&&sv[0].embed)||"";
  return{servers:sv,embed:em,id:p.id,t:p.title,cid:c.id,ch:c.name,v:p.views||"0",d:p.duration||"",a:p.date||"",h:p.hue==null?200:p.hue,src:p.src||"",thumb:p.thumb||embedThumb(em),desc:p.desc||"",likes:p.likes||0,type:type,status:p.status||"",akses:p.akses||""};
}
function load(){
  return Promise.all([getJSON("channels"),getJSON("videos"),getJSON("live"),getJSON("postingan")]).then(function(a){
    channels=a[0];community=a[3];
    var vs=a[1].map(function(p){return mapVid(p,"video")}),ls=a[2].map(function(p){return mapVid(p,"live")});
    videos=ls.filter(function(v){return v.status==="live"}).concat(vs,ls.filter(function(v){return v.status!=="live"}));
    loadErr=!channels.length&&!videos.length;
    showErrs();
  });
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
$("#aCancel").onclick=function(){closeDlg($("#dAuth"))};
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
  user={n:users[em].n,e:em,r:"user"};Auth.session(em);$("#aForm").reset();closeDlg($("#dAuth"));changed()};
function acct(){
  var box=$("#acct");
  if(!user){
    box.innerHTML='<button class="acbtn" id="li"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3.2"/><path d="M5.5 18.5c1.5-2.5 3.8-3.5 6.5-3.5s5 1 6.5 3.5"/></svg>Masuk</button>';
    $("#li").onclick=function(){openAuth("login")};return;
  }
  var ini=esc(user.n[0].toUpperCase());
  box.innerHTML='<div class="acwrap"><button class="avb" id="avb" aria-label="Akun" aria-haspopup="true" aria-expanded="false"><span class="av">'+ini+'</span></button>'+
    '<div class="acm" id="acm" role="menu"><div class="acu"><span class="av">'+ini+'</span><div><b>'+esc(user.n)+'</b><div class="meta">'+esc(user.e||"")+'</div></div></div><button class="aci" id="lo" role="menuitem">Keluar</button></div></div>';
  $("#avb").onclick=function(){var on=$("#acm").classList.toggle("show");this.setAttribute("aria-expanded",on)};
  $("#lo").onclick=function(){user=null;Auth.session(null);changed()};
}
function closeAcm(){var m=$("#acm");if(m){m.classList.remove("show");var b=$("#avb");if(b)b.setAttribute("aria-expanded","false")}}
document.addEventListener("click",function(e){if(!e.target.closest(".acwrap"))closeAcm()});
document.addEventListener("keydown",function(e){if(e.key==="Escape")closeAcm()});
function closeDlg(d){if(!d.open)return;d.classList.add("closing");setTimeout(function(){d.classList.remove("closing");d.close()},160)}
function wireDlg(d){
  d.addEventListener("cancel",function(e){e.preventDefault();closeDlg(d)});
  d.addEventListener("click",function(e){var r=d.getBoundingClientRect();if(e.target===d&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))closeDlg(d)});
}
wireDlg($("#dAuth"));
var ss=Auth.getSession(),uu=Auth.load();if(ss&&uu[ss])user={n:uu[ss].n,e:ss,r:"user"};
acct();

/* ---------- Pengikut, suka, dan kartu video ---------- */
function mine(k){return user?(store(k,{})[user.e]||[]):[]}
function flip(k,val){var a=store(k,{}),l=a[user.e]||[],i=l.indexOf(val);if(i>-1)l.splice(i,1);else l.push(val);a[user.e]=l;put(k,a)}
function badge(v){return v.status==="live"?'<span class="dur live">LIVE</span>':'<span class="dur">'+esc(v.d)+'</span>'}
function card(v,noCh){
  var views=esc(v.v)+(v.status==="live"?' menonton':' ditonton');
  return '<div class="vid"><a class="lk" href="post.html?id='+esc(v.id)+'"><div class="th" style="'+bg(v)+'">'+badge(v)+accBadge(v)+'</div><h3>'+esc(v.t)+'</h3></a><div class="meta">'+(noCh?'':'<a class="ch" href="channel.html?id='+esc(v.cid)+'">'+esc(v.ch)+'</a> · ')+views+' · '+esc(v.a)+'</div></div>';
}
function grid(list,noCh){return list.length?'<div class="grid">'+list.map(function(v){return card(v,noCh)}).join("")+'</div>':'<div class="empty">Belum ada konten di sini.</div>'}

/* ---------- Pencarian: tidak peduli huruf besar/kecil, mentoleransi salah ketik ---------- */
function norm(t){return String(t).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9\s]/g," ").replace(/\s+/g," ").trim()}
function lev(a,b){var m=a.length,n=b.length,p=[],i,j;for(j=0;j<=n;j++)p[j]=j;for(i=1;i<=m;i++){var prev=p[0];p[0]=i;for(j=1;j<=n;j++){var t=p[j];p[j]=Math.min(p[j]+1,p[j-1]+1,prev+(a[i-1]===b[j-1]?0:1));prev=t}}return p[n]}
function tokScore(q,w){
  if(w===q)return 4;
  if(w.indexOf(q)===0)return 3;
  if(q.length>1&&w.indexOf(q)>-1)return 2;
  if(q.length>=3){var t=q.length>=7?2:1,d=q.length===3?lev(q,w):Math.min(lev(q,w),lev(q,w.slice(0,q.length)));if(d<=t)return 1.5-d*0.3}
  return 0;
}
function score(q,text){
  var nq=norm(q);if(!nq)return 0;
  var nt=norm(text),qs=nq.split(" "),ws=nt.split(" "),tot=0,cq=nq.replace(/ /g,"");
  if(cq.length>1&&nt.replace(/ /g,"").indexOf(cq)>-1)return 6;
  for(var i=0;i<qs.length;i++){var b=0;for(var j=0;j<ws.length;j++){var s=tokScore(qs[i],ws[j]);if(s>b)b=s}if(!b)return 0;tot+=b}
  return tot/qs.length;
}
function searchAll(q){
  var cs=[],vs=[],by=function(a,b){return b.s-a.s||a.i-b.i};
  channels.forEach(function(c,i){var s=score(q,c.name+" "+(c.handle||""));if(s>0)cs.push({c:c,s:s,i:i})});
  videos.forEach(function(v,i){var s=score(q,v.t+" "+v.ch);if(s>0)vs.push({v:v,s:s,i:i})});
  return{channels:cs.sort(by),videos:vs.sort(by)};
}
function showSug(){
  var q=$("#q").value.trim(),box=$("#sug");
  if(!q){box.hidden=true;return}
  var r=searchAll(q),h='<a class="si" href="index.html?q='+encodeURIComponent(q)+'"><span class="mi">🔍</span><div>Cari “'+esc(q)+'”</div></a>';
  r.channels.slice(0,3).forEach(function(x){h+='<a class="si" href="channel.html?id='+esc(x.c.id)+'">'+avHTML(x.c,"sm","span")+'<div><div>'+esc(x.c.name)+'</div><div class="meta">Channel · '+fmt(x.c.followers||0)+' pengikut</div></div></a>'});
  r.videos.slice(0,5).forEach(function(x){h+='<a class="si" href="post.html?id='+esc(x.v.id)+'"><span class="mi">▶</span><div><div>'+esc(x.v.t)+'</div><div class="meta">'+esc(x.v.ch)+'</div></div></a>'});
  box.innerHTML=h;box.hidden=false;
}
$("#q").addEventListener("input",showSug);
$("#q").addEventListener("focus",showSug);
$("#q").addEventListener("blur",function(){$("#sug").hidden=true});
$("#q").addEventListener("keydown",function(e){if(e.key==="Escape"||e.key==="Enter")$("#sug").hidden=true});
$("#sug").addEventListener("mousedown",function(e){e.preventDefault()});

/* ---------- Avatar channel: foto jika ada kolom "avatar", huruf awal jika tidak ---------- */
function avHTML(c,cls,tag,attrs){
  tag=tag||"div";
  var st=c.avatar?' style="background:url(\''+esc(c.avatar)+'\') center/cover"':'';
  return '<'+tag+' class="av'+(cls?' '+cls:'')+'"'+(attrs?' '+attrs:'')+st+'>'+(c.avatar?'':esc(c.name[0].toUpperCase()))+'</'+tag+'>';
}

/* ---------- Teks dengan link yang bisa diklik (https://... atau www....) ---------- */
function linkify(t){
  return esc(t).replace(/(?:https?:\/\/|www\.)[^\s<]+/gi,function(m){
    var u=m.replace(/(?:[.,;:!?)\]]|&quot;|&#39;)+$/,""),tail=m.slice(u.length);
    var href=/^www\./i.test(u)?"https://"+u:u;
    return '<a class="al" href="'+href+'" target="_blank" rel="noopener noreferrer">'+u+'</a>'+tail;
  });
}

/* ---------- Penanda akses video: "akses": "member" atau "langganan" (hanya label, video tetap bisa ditonton) ---------- */
function accBadge(v,inline){
  var t={"member":"Khusus member","langganan":"Langganan"}[v.akses];
  return t?'<span class="acc '+esc(v.akses)+(inline?' in':'')+'">'+t+'</span>':'';
}
