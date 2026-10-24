/* Nauka Zosi — silnik gry.
   Plik testu wywołuje: NaukaZosi.test({ ...dane... })
   Pola testu: tytul, przedmiot, zakres, opis,
     abcd:[{t,q,a,w:[3 błędne],e}], pf:[{q,a:true/false,e}],
     pary:[{name,pairs:[[lewa,prawa],...]}], otwarte:[{q,model:[akapity],pts:[elementy]}]
   Każda sekcja jest opcjonalna. */
(function(){
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const store={get(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};

let T, KEY, timer=null;
const S={mcN:20,score:0,streak:0,best:0,tab:"start",done:{},mc:null,tf:null,mt:null,op:null,wrong:[]};

function test(data){
  T=Object.assign({abcd:[],pf:[],pary:[],otwarte:[]},data);
  KEY="nz:"+(new URLSearchParams(location.search).get("t")||T.tytul);
  document.title=T.tytul+" · Nauka Zosi";
  $("#app").innerHTML=`
   <header>
    <a class="back" href="index.html">← Wszystkie testy</a>
    <div class="eyebrow">${esc(T.przedmiot)}${T.zakres?" · "+esc(T.zakres):""}</div>
    <h1><span class="initial">${esc(T.tytul[0])}</span>${esc(T.tytul.slice(1))}</h1>
    ${T.opis?`<p class="sub">${esc(T.opis)}</p>`:""}
   </header>
   <div class="hud"><span class="pill gold" id="score">0 pkt</span><span class="pill" id="streak">Seria: 0</span></div>
   <nav class="tabs" id="tabs" aria-label="Etapy gry"></nav>
   <main id="stage"></main>`;
  hud(); go("start");
}

const ALL=[["start","Start"],["mc","Quiz ABCD"],["tf","Prawda/fałsz"],["mt","Pary"],["op","Pytania otwarte"],["end","Wynik"]];
const has=k=>({mc:T.abcd,tf:T.pf,mt:T.pary,op:T.otwarte})[k]?.length;
const TABS=()=>{let n=0;return ALL.filter(([k])=>k==="start"||k==="end"||has(k)).map(([k,l])=>[k,(k==="start"||k==="end")?l:(++n)+". "+l])};
const nextOf=k=>{const t=TABS().map(x=>x[0]);return t[t.indexOf(k)+1]||"end"};
const maxPts=()=>(T.abcd.length>25?S.mcN:T.abcd.length)*2+T.pf.length+T.pary.reduce((s,p)=>s+p.pairs.length,0)+T.otwarte.reduce((s,o)=>s+o.pts.length,0);

function hud(){ $("#score").textContent=S.score+" pkt"; $("#streak").textContent="Seria: "+S.streak+(S.best?" · rekord "+S.best:""); }
function add(ok,pts){ if(ok){S.streak++;S.best=Math.max(S.best,S.streak);S.score+=pts+(S.streak>=3&&pts?1:0);}else S.streak=0; hud(); }
function tabs(){ $("#tabs").innerHTML=TABS().map(([k,l])=>`<button aria-current="${S.tab===k}" data-t="${k}">${l}${S.done[k]?'<span class="done">✓</span>':''}</button>`).join("");
  $("#tabs").querySelectorAll("button").forEach(b=>b.onclick=()=>go(b.dataset.t)); }
function go(t){ clearInterval(timer); S.tab=t; tabs(); ({start,mc,tf,mt,op,end})[t](); window.scrollTo({top:0,behavior:"smooth"}); }
const stage=h=>$("#stage").innerHTML=h;

function start(){
  const prev=store.get(KEY);
  const steps=[
    has("mc")&&`<div class="step"><b>Quiz ABCD</b><span>${T.abcd.length>25?"losowe pytania z puli "+T.abcd.length:T.abcd.length+" pytań"} · 2 pkt</span></div>`,
    has("tf")&&`<div class="step"><b>Prawda / fałsz</b><span>${T.pf.length} zdań · 10 s na każde · 1 pkt</span></div>`,
    has("mt")&&`<div class="step"><b>Pary</b><span>${T.pary.length} plansz · 1 pkt za parę</span></div>`,
    has("op")&&`<div class="step"><b>Pytania otwarte</b><span>${T.otwarte.length} pytań · samoocena</span></div>`].filter(Boolean).join("");
  stage(`<section class="card"><h2>Jak grać?</h2>
  <p style="margin:0">Za każdą dobrą odpowiedź są punkty. Trzy trafienia z rzędu dają serię i <b>+1 pkt bonusu</b> za każde kolejne. Etapy możesz robić w dowolnej kolejności.</p>
  <div class="intro">${steps}</div>
  ${prev?`<p class="small" style="margin:0">Twój najlepszy wynik na tym urządzeniu: <b>${prev.best} pkt</b> (${prev.pct}%), ostatnio ${esc(prev.date)}.</p>`:""}
  ${T.abcd.length>25?`<div class="row" role="group" aria-label="Długość quizu"><span class="small">Pytań w quizie ABCD:</span>${[20,40,T.abcd.length].map(n=>`<button class="btn ${S.mcN===n?"":"ghost"}" data-n="${n}">${n===T.abcd.length?"wszystkie ("+n+")":n}</button>`).join("")}</div>`:""}
  <div class="row"><button class="btn gold" id="go1">Zaczynamy!</button></div>
  <p class="small" style="margin:0">Na końcu zobaczysz listę pytań, na których się potknęłaś, żeby wrócić do nich przed sprawdzianem.</p></section>`);
  document.querySelectorAll("[data-n]").forEach(b=>b.onclick=()=>{S.mcN=+b.dataset.n;S.mc=null;start()});
  $("#go1").onclick=()=>go(TABS()[1][0]);
}

function mc(){
  if(!S.mc) S.mc={list:shuffle(T.abcd).slice(0,T.abcd.length>25?S.mcN:T.abcd.length),i:0,ok:0};
  const st=S.mc; if(st.i>=st.list.length) return finish("mc",`Quiz ABCD: ${st.ok}/${st.list.length}`);
  const it=st.list[st.i], opts=shuffle([it.a,...it.w]);
  stage(`<section class="card"><div class="meta"><span>Pytanie ${st.i+1} z ${st.list.length}</span><span>Dobrze: ${st.ok}</span></div>
   <div class="bar"><i style="width:${st.i/st.list.length*100}%"></i></div>
   ${it.t?`<div class="topic">${esc(it.t)}</div>`:""}<p class="q">${esc(it.q)}</p>
   <div class="opts">${opts.map((o,n)=>`<button class="opt" data-n="${n}"><span class="k">${"ABCDEF"[n]}</span><span>${esc(o)}</span></button>`).join("")}</div>
   <div id="fb"></div></section>`);
  document.querySelectorAll(".opt").forEach(b=>b.onclick=()=>{
    const ok=opts[b.dataset.n]===it.a;
    document.querySelectorAll(".opt").forEach(x=>{x.disabled=true; if(opts[x.dataset.n]===it.a)x.classList.add("ok")});
    if(!ok){b.classList.add("bad");S.wrong.push(it.q+" → "+it.a)} else st.ok++;
    add(ok,2);
    $("#fb").innerHTML=`<div class="feedback"><b>${ok?"Brawo!":"Nie tym razem."}</b> ${esc(it.e||"")}</div><div class="row" style="margin-top:12px"><button class="btn" id="nx">Dalej</button></div>`;
    $("#nx").focus(); $("#nx").onclick=()=>{st.i++;mc()};
  });
}

function tf(){
  if(!S.tf) S.tf={list:shuffle(T.pf),i:0,ok:0};
  const st=S.tf; if(st.i>=st.list.length) return finish("tf",`Prawda/fałsz: ${st.ok}/${st.list.length}`);
  const it=st.list[st.i]; let left=10;
  stage(`<section class="card"><div class="meta"><span>Zdanie ${st.i+1} z ${st.list.length}</span><span class="timer" id="tm">⏳ ${left} s</span></div>
   <div class="bar"><i id="tb" style="width:100%"></i></div>
   <p class="q">${esc(it.q)}</p>
   <div class="tf"><button class="opt" data-v="1">Prawda</button><button class="opt" data-v="0">Fałsz</button></div><div id="fb"></div></section>`);
  const answer=v=>{ clearInterval(timer); const ok=v===it.a;
    document.querySelectorAll(".opt").forEach(x=>{x.disabled=true; const xv=x.dataset.v==="1"; if(xv===it.a)x.classList.add("ok"); else if(v!==null&&xv===v)x.classList.add("bad")});
    if(ok)st.ok++; else S.wrong.push(it.q+" → "+(it.a?"PRAWDA":"FAŁSZ")); add(ok,1);
    $("#fb").innerHTML=`<div class="feedback"><b>${v===null?"Czas minął!":ok?"Dobrze!":"Pudło."}</b> ${it.a?"Prawda.":"Fałsz."} ${esc(it.e||"")}</div><div class="row" style="margin-top:12px"><button class="btn" id="nx">Dalej</button></div>`;
    $("#nx").focus(); $("#nx").onclick=()=>{st.i++;tf()}; };
  document.querySelectorAll(".opt").forEach(b=>b.onclick=()=>answer(b.dataset.v==="1"));
  timer=setInterval(()=>{left--; const tm=$("#tm"); if(!tm){clearInterval(timer);return}
    tm.textContent="⏳ "+left+" s"; $("#tb").style.width=left*10+"%"; if(left<=0)answer(null);},1000);
}

function mt(){
  if(!S.mt) S.mt={i:0,ok:0,miss:0};
  const st=S.mt; if(st.i>=T.pary.length) return finish("mt",`Pary: ${st.ok} bez pomyłki, pomyłki: ${st.miss}`);
  const set=T.pary[st.i], L=shuffle(set.pairs.map((p,n)=>({n,t:p[0]}))), R=shuffle(set.pairs.map((p,n)=>({n,t:p[1]})));
  let sel=null, found=0; const missed=new Set();
  stage(`<section class="card"><div class="meta"><span>Plansza ${st.i+1} z ${T.pary.length}</span><span>Połącz w pary</span></div>
   <div class="bar"><i style="width:${st.i/T.pary.length*100}%"></i></div>
   <h2>${esc(set.name)}</h2><p class="small" style="margin:0">Kliknij element po lewej, potem jego znaczenie po prawej.</p>
   <div class="match"><div class="col">${L.map(x=>`<button class="tile" data-s="L" data-n="${x.n}">${esc(x.t)}</button>`).join("")}</div>
   <div class="col">${R.map(x=>`<button class="tile" data-s="R" data-n="${x.n}">${esc(x.t)}</button>`).join("")}</div></div><div id="fb"></div></section>`);
  document.querySelectorAll(".tile").forEach(b=>b.onclick=()=>{
    if(b.classList.contains("matched"))return;
    if(b.dataset.s==="L"){document.querySelectorAll('.tile[data-s="L"]').forEach(x=>x.classList.remove("sel"));b.classList.add("sel");sel=b;return}
    if(!sel){b.classList.add("wrong");setTimeout(()=>b.classList.remove("wrong"),400);return}
    if(sel.dataset.n===b.dataset.n){
      sel.classList.remove("sel");sel.classList.add("matched");b.classList.add("matched");sel.disabled=b.disabled=true;
      const clean=!missed.has(sel.dataset.n); if(clean)st.ok++; add(clean,1); sel=null; found++;
      if(found===set.pairs.length){$("#fb").innerHTML=`<div class="feedback"><b>Plansza ukończona!</b></div><div class="row" style="margin-top:12px"><button class="btn" id="nx">Dalej</button></div>`;$("#nx").focus();$("#nx").onclick=()=>{st.i++;mt()}}
    } else {
      if(!missed.has(sel.dataset.n)){missed.add(sel.dataset.n);st.miss++;S.wrong.push(set.name+": "+set.pairs[sel.dataset.n][0]+" → "+set.pairs[sel.dataset.n][1])}
      add(false,0); b.classList.add("wrong");setTimeout(()=>b.classList.remove("wrong"),450)}
  });
}

function op(){
  if(!S.op) S.op={i:0,pts:0,text:{}};
  const st=S.op; if(st.i>=T.otwarte.length) return finish("op",`Pytania otwarte: ${st.pts} pkt`);
  const it=T.otwarte[st.i];
  stage(`<section class="card"><div class="meta"><span>Pytanie otwarte ${st.i+1} z ${T.otwarte.length}</span><span>Napisz 3–5 zdań</span></div>
   <div class="bar"><i style="width:${st.i/T.otwarte.length*100}%"></i></div>
   <p class="q">${esc(it.q)}</p>
   <label for="ans-${st.i}" class="small">Twoja odpowiedź</label>
   <textarea id="ans-${st.i}" placeholder="Napisz własnymi słowami, potem porównaj z wzorem…">${esc(st.text[st.i]||"")}</textarea>
   <div class="row"><button class="btn" id="show">Pokaż wzór i oceń się</button></div><div id="fb"></div></section>`);
  const ta=$("#ans-"+st.i); ta.oninput=()=>st.text[st.i]=ta.value;
  $("#show").onclick=()=>{ $("#show").disabled=true;
    $("#fb").innerHTML=`<div class="model">${it.model.map(p=>`<p>${esc(p)}</p>`).join("")}</div>
     <p class="small" style="margin:0">Zaznacz, co udało Ci się zawrzeć (1 pkt za każdy element):</p>
     <div class="checks">${it.pts.map((p,n)=>`<label><input type="checkbox" id="c${st.i}-${n}"> ${esc(p)}</label>`).join("")}</div>
     <div class="row"><button class="btn" id="nx">Zatwierdź</button></div>`;
    $("#nx").onclick=()=>{ const got=[...document.querySelectorAll(".checks input")].filter(c=>c.checked).length;
      st.pts+=got; S.score+=got; hud(); if(got<it.pts.length)S.wrong.push("Pytanie otwarte: "+it.q); st.i++; op(); };
  };
}

function finish(key,msg){
  S.done[key]=true; tabs(); const next=nextOf(key);
  stage(`<section class="card"><h2>Etap zaliczony!</h2><p class="q">${esc(msg)}</p>
  <div class="row"><button class="btn gold" id="nx">${next==="end"?"Zobacz wynik":"Następny etap"}</button><button class="btn ghost" id="again">Powtórz ten etap</button></div></section>`);
  $("#nx").onclick=()=>go(next); $("#again").onclick=()=>{S[key]=null;go(key)};
}

function end(){
  const max=maxPts(), pct=Math.min(100,Math.round(S.score/max*100));
  const rank=pct>=90?"Mistrzyni!":pct>=75?"Świetnie przygotowana":pct>=50?"Dobra droga, jeszcze trochę":"Warto powtórzyć materiał";
  const uniq=[...new Set(S.wrong)];
  if(S.score>0){ const prev=store.get(KEY)||{best:0};
    store.set(KEY,{best:Math.max(prev.best||0,S.score),pct:Math.max(prev.pct||0,pct),date:new Date().toLocaleDateString("pl-PL")}); }
  stage(`<section class="card"><h2>Twój wynik</h2>
   <div class="big">${S.score}</div><div class="small">punktów (bez bonusów maks. ${max}) · najdłuższa seria: ${S.best}</div>
   <div class="rank">${rank}</div>
   ${uniq.length?`<p style="margin:0"><b>Do powtórki przed sprawdzianem:</b></p><div class="review">${uniq.map(w=>`<div>${esc(w)}</div>`).join("")}</div>`:(S.score?`<p style="margin:0">Bez pomyłek. Jesteś gotowa! 🎉</p>`:`<p style="margin:0">Zrób najpierw któryś etap.</p>`)}
   <div class="row"><button class="btn gold" id="restart">Zagraj jeszcze raz</button><a class="btn ghost" href="index.html" style="text-decoration:none">Inne testy</a></div></section>`);
  $("#restart").onclick=()=>{Object.assign(S,{mcN:S.mcN,score:0,streak:0,best:0,done:{},mc:null,tf:null,mt:null,op:null,wrong:[]});hud();go("start")};
}

window.NaukaZosi={test};

/* Ładowanie testu z adresu: test.html?t=polski/biblia */
const t=new URLSearchParams(location.search).get("t");
if(t && /^[a-z0-9\-\/]+$/.test(t)){
  const s=document.createElement("script"); s.src="testy/"+t+".js";
  s.onerror=()=>{$("#app").innerHTML=`<div class="card"><h2>Nie ma takiego testu</h2><p>Nie znalazłem pliku <code>testy/${esc(t)}.js</code>.</p><a href="index.html">← Wróć do listy testów</a></div>`};
  document.head.appendChild(s);
} else if($("#app")) {
  $("#app").innerHTML=`<div class="card"><h2>Wybierz test</h2><a href="index.html">← Lista testów</a></div>`;
}
})();
