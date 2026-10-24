var KEY="miambox_v1",U=["g","kg","ml","l","pièce","c. à soupe"],STEP={g:100,ml:100,"pièce":1,"c. à soupe":1};
var REPAS=[["pdj","Petit-déj"],["dej","Déjeuner"],["din","Dîner"]];
var ICONS={home:'<svg viewBox="0 0 24 24"><path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10"/></svg>',explorer:'<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',frigo:'<svg viewBox="0 0 24 24"><rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M6 10h12M9 6v2M9 13v3"/></svg>',plan:'<svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',event:'<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.8 3.4-5.5 6.5-5.5s5.7 1.7 6.5 5.5M16 4.8a3.5 3.5 0 010 6.4M18 14.8c2 .6 3.3 2.3 3.8 5.2"/></svg>',profil:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.5 4-6.5 8-6.5s7 2 8 6.5"/></svg>'};
var TABS=[["home","Accueil"],["explorer","Explorer"],["frigo","Frigo"],["plan","Planning"],["event","Événement"],["profil","Profil"]];
var MOIS=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
var $=function(s){return document.querySelector(s)};
var esc=function(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})};
var uid=function(){return Math.random().toString(36).slice(2,9)};
var norm=function(s){return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim()};
function base(q,u){return u==="kg"?{q:q*1000,u:"g"}:u==="l"?{q:q*1000,u:"ml"}:{q:q,u:u}}
var key=function(n,u){return norm(n)+"|"+base(0,u).u};
function fmt(q,u){q=Math.round(q*100)/100;if(u==="g"&&q>=1000)return q/1000+" kg";if(u==="ml"&&q>=1000)return q/1000+" l";return u==="pièce"?"× "+q:q+" "+u}
var col=function(p){return p>=100?"var(--ok)":p>=50?"var(--warn)":"var(--bad)"};
var p2=function(n){return String(n).padStart(2,"0")};
var iso=function(d){return d.getFullYear()+"-"+p2(d.getMonth()+1)+"-"+p2(d.getDate())};
var addJ=function(d,n){var x=new Date(d);x.setDate(x.getDate()+n);return x};
var lundi=function(d){var x=new Date(d);x.setHours(12,0,0,0);return addJ(x,-((x.getDay()+6)%7))};

function exemple(){return{
 fridge:[{id:uid(),nom:"Œufs",q:6,u:"pièce"},{id:uid(),nom:"Tomate",q:4,u:"pièce"},{id:uid(),nom:"Oignon",q:2,u:"pièce"},{id:uid(),nom:"Riz",q:500,u:"g"},{id:uid(),nom:"Huile",q:3,u:"c. à soupe"}],
 recettes:[
  {id:uid(),nom:"Omelette tomate",emo:"🍳",temps:10,cout:"500 FCFA",ing:[{nom:"Œufs",q:3,u:"pièce"},{nom:"Tomate",q:1,u:"pièce"},{nom:"Huile",q:1,u:"c. à soupe"}],etapes:"Battre les œufs.\nCouper la tomate en dés.\nCuire à la poêle avec l'huile."},
  {id:uid(),nom:"Riz sauce tomate",emo:"🍚",temps:35,cout:"1 200 FCFA",ing:[{nom:"Riz",q:200,u:"g"},{nom:"Tomate",q:3,u:"pièce"},{nom:"Oignon",q:1,u:"pièce"},{nom:"Huile",q:2,u:"c. à soupe"},{nom:"Ail",q:2,u:"pièce"}],etapes:"Faire revenir l'oignon.\nAjouter les tomates et laisser mijoter.\nCuire le riz et servir."},
  {id:uid(),nom:"Poulet rôti aux herbes",emo:"🍗",temps:90,cout:"4 500 FCFA",ing:[{nom:"Poulet",q:1,u:"pièce"},{nom:"Herbes",q:1,u:"c. à soupe"},{nom:"Huile",q:2,u:"c. à soupe"},{nom:"Ail",q:3,u:"pièce"}],etapes:"Badigeonner le poulet d'huile, d'ail et d'herbes.\nCuire 1 h 15 au four."}
 ],plan:{},courses:[],fav:[],gens:[],cree:new Date().toISOString()}}
var db=load();
function load(){try{var d=JSON.parse(localStorage.getItem(KEY));if(d&&d.recettes){d.gens=d.gens||[];return d}}catch(e){}return exemple()}
function save(){try{localStorage.setItem(KEY,JSON.stringify(db))}catch(e){}}
var S={tab:"home",sub:null,ctx:null,seg:"frigo",filtre:"tous",q:"",mode:"semaine",ref:new Date(),form:null,reset:false};
var rec=function(id){return db.recettes.find(function(r){return r.id===id})};

function fridgeMap(){var m={};db.fridge.forEach(function(f){var k=key(f.nom,f.u);m[k]=(m[k]||0)+f.q});return m}
function analyse(r,map){
 var rows=r.ing.map(function(i){var b=base(i.q,i.u),have=map[key(i.nom,i.u)]||0;
  return{nom:i.nom,u:b.u,need:b.q,have:Math.min(have,b.q),frac:b.q>0?Math.min(1,have/b.q):1,manque:Math.max(0,b.q-have)}});
 var pct=rows.length?Math.round(100*rows.reduce(function(a,x){return a+x.frac},0)/rows.length):0;
 return{rows:rows,pct:pct}}
function manquantsPlan(dates){
 var map=Object.assign({},fridgeMap()),miss={};
 dates.forEach(function(d){REPAS.forEach(function(m){var r=rec((db.plan[d]||{})[m[0]]);if(!r)return;
  r.ing.forEach(function(i){var b=base(i.q,i.u),k=key(i.nom,i.u),have=map[k]||0,use=Math.min(have,b.q);map[k]=have-use;var mq=b.q-use;
   if(mq>0){miss[k]=miss[k]||{nom:i.nom,q:0,u:b.u};miss[k].q+=mq}})})});
 return Object.keys(miss).map(function(k){return miss[k]})}
function addCourse(nom,q,u){var b=base(q,u),k=key(nom,u),ex=db.courses.find(function(c){return key(c.nom,c.u)===k&&!c.ok});
 if(ex)ex.q+=b.q;else db.courses.push({id:uid(),nom:nom,q:b.q,u:b.u,ok:false})}
function addFridge(nom,q,u){var b=base(q,u),k=key(nom,u),ex=db.fridge.find(function(f){return key(f.nom,f.u)===k});
 if(ex)ex.q+=b.q;else db.fridge.push({id:uid(),nom:nom,q:b.q,u:b.u})}

/* ---------- navigation ---------- */
function go(t){S.tab=t;S.sub=null;S.reset=false;render();window.scrollTo(0,0)}
function ouvrir(id){S.sub="detail";S.ctx=id;S.dtab="ing";render();window.scrollTo(0,0)}
function retour(){S.sub=null;render()}
function banniere(){
 var ref=db.lastBackup||db.cree;if(!ref){db.cree=new Date().toISOString();save();return""}
 var j=(Date.now()-new Date(ref).getTime())/864e5;if(j<7)return"";
 return'<div class="card" style="border-left:4px solid var(--warn)"><b>Sauvegarde recommandée</b><br><small>'+(db.lastBackup?"Dernière sauvegarde il y a "+Math.floor(j)+" jour(s).":"Aucune sauvegarde n\'a encore été faite.")+'</small><button class="btn" onclick="exporter()">Sauvegarder maintenant</button></div>'}
function render(){
 $("#nav").innerHTML=TABS.map(function(t){return'<button class="'+(S.tab===t[0]?"on":"")+'" onclick="go(\''+t[0]+'\')">'+ICONS[t[0]]+t[1]+'</button>'}).join("");
 var v=S.sub==="detail"?vDetail():S.sub==="form"?vForm():S.sub==="evform"?vEvForm():S.sub==="evdet"?vEvDet():{home:vHome,explorer:vExplorer,frigo:vFrigo,plan:vPlan,event:vEvents,profil:vProfil}[S.tab]();
 $("#app").innerHTML=banniere()+v}
function carte(r,map){var a=analyse(r,map);
 return'<div class="rc" onclick="ouvrir(\''+r.id+'\')"><div class="rimg"><span class="emo">'+esc(r.emo||"🍽️")+'</span><span class="heart" onclick="event.stopPropagation();favTog(\''+r.id+'\')">'+(db.fav.indexOf(r.id)>=0?"♥":"♡")+'</span><div class="ov"><b>'+esc(r.nom)+'</b></div></div><div class="rb"><div class="bar"><i style="width:'+a.pct+'%;background:'+col(a.pct)+'"></i></div><small style="color:'+col(a.pct)+'">'+a.pct+' % réalisable</small></div></div>'}
var logo='<div class="logo"><img src="logo.png" alt="MB"><span class="wm"><span>Miam</span>Box</span></div>';

/* ---------- accueil ---------- */
function vHome(){
 var map=fridgeMap(),best=null,bp=-1;
 db.recettes.forEach(function(r){var a=analyse(r,map);if(a.pct>bp){bp=a.pct;best=r}});
 var pretes=db.recettes.filter(function(r){return analyse(r,map).pct>=100});
 var rapides=db.recettes.filter(function(r){return Number(r.temps)>0&&Number(r.temps)<=30});
 var hs=function(l){return'<div class="hs">'+l.map(function(r){return carte(r,map)}).join("")+'</div>'};
 return logo+(best?'<div class="hero" onclick="ouvrir(\''+best.id+'\')"><span class="emo">'+esc(best.emo||"🍽️")+'</span><div class="ov"><span class="tag">RECETTE DU JOUR</span><b>'+esc(best.nom)+'</b><small>⏱ '+esc(best.temps||"?")+' min  |  '+esc(best.cout||"—")+'</small><div class="bar"><i style="width:'+bp+'%;background:'+col(bp)+'"></i></div><small>'+bp+' % réalisable avec votre frigo</small></div></div>':'<div class="card">Ajoutez une recette dans Explorer.</div>')+
 '<h3 class="up">Recherche rapide</h3><div class="search"><input id="hq" placeholder="Recherche rapide"><button onclick="S.q=$(\'#hq\').value;S.filtre=\'tous\';go(\'explorer\')">'+ICONS.explorer+'</button></div>'+
 '<h3 class="up">Mon frigo rapide</h3><div class="chips">'+db.fridge.slice(0,8).map(function(f){return'<span class="chip">'+esc(f.nom)+' · '+fmt(f.q,f.u)+'</span>'}).join("")+'<button class="chip" onclick="S.seg=\'frigo\';go(\'frigo\')">＋</button></div>'+
 '<h3 class="up">Prêtes à cuisiner ('+pretes.length+')</h3>'+(pretes.length?hs(pretes):'<div class="muted">Aucune recette complète pour le moment. Voyez ce qui manque dans chaque recette.</div>')+
 (rapides.length?'<h3 class="up">Repas rapides</h3>'+hs(rapides):'')}

/* ---------- explorer ---------- */
function vExplorer(){
 var map=fridgeMap(),q=norm(S.q);
 var l=db.recettes.filter(function(r){return(!q||norm(r.nom).indexOf(q)>=0)&&(S.filtre==="tous"||(S.filtre==="fav"&&db.fav.indexOf(r.id)>=0)||(S.filtre==="ok"&&analyse(r,map).pct>=100)||(S.filtre==="pt"&&!conf(r).length))});
 var f=function(k,t){return'<button class="chip '+(S.filtre===k?"on":"")+'" onclick="S.filtre=\''+k+'\';render()">'+t+'</button>'};
 return'<h2>Recettes</h2><input placeholder="Rechercher…" value="'+esc(S.q)+'" oninput="S.q=this.value;var p=this.selectionStart;render();var e=$(\'input\');e.focus();e.setSelectionRange(p,p)">'+
 '<div class="chips" style="margin:12px 0">'+f("tous","Toutes")+f("ok","Réalisables à 100 %")+f("fav","❤ Favoris")+(db.gens.length?f("pt","Pour tous"):"")+'</div>'+
 (l.length?'<div class="grid">'+l.map(function(r){return carte(r,map)}).join("")+'</div>':'<div class="card muted">Aucune recette.</div>')+
 '<button class="btn" onclick="nouvelle()">＋ Nouvelle recette</button>'}

/* ---------- détail d'une recette ---------- */
function vDetail(){
 var r=rec(S.ctx);if(!r){S.sub=null;return vExplorer()}
 var a=analyse(r,fridgeMap()),manq=a.rows.filter(function(x){return x.manque>0}),fav=db.fav.indexOf(r.id)>=0,dt=S.dtab||"ing";
 var ing=a.rows.map(function(x){var p=Math.round(x.frac*100);
  return'<div class="li"><div class="n"><b>'+esc(x.nom)+'</b><br><small>besoin '+fmt(x.need,x.u)+' · frigo '+fmt(x.have,x.u)+'</small></div>'+(x.manque>0?'<span class="bad" style="text-align:right">manque '+fmt(x.manque,x.u)+'<br><small>'+p+' %</small></span>':'<span class="ok">✓ 100 %</span>')+'</div>'}).join("");
 var st=r.etapes?r.etapes.split("\n").filter(Boolean).map(function(t,i){return'<div class="li" style="align-items:flex-start"><b>'+(i+1)+'.</b><div class="n">'+esc(t)+'</div></div>'}).join(""):'<div class="muted" style="padding:12px 0">Aucune étape.</div>';
 return'<div class="hero2"><span class="emo">'+esc(r.emo||"🍽️")+'</span><button class="rb1 l" onclick="retour()">‹</button><button class="rb1 r" onclick="favTog(\''+r.id+'\')">'+(fav?"♥":"♡")+'</button></div>'+
 '<div class="sheet"><h2>'+esc(r.nom)+'</h2><div class="meta3"><div>⏱ '+esc(r.temps||"?")+'<small>min</small></div><div>💰 '+esc(r.cout||"—")+'<small>coût approx.</small></div><div style="color:'+col(a.pct)+'">'+a.pct+' %<small>réalisable</small></div></div>'+
 '<div class="bar" style="height:10px"><i style="width:'+a.pct+'%;background:'+col(a.pct)+'"></i></div><small>Moyenne des ingrédients disponibles dans le frigo.</small>'+
 '<button class="btn" '+(a.pct<100?"disabled":"")+' onclick="cuisiner(\''+r.id+'\')">🍽️ Cuisiner (retire du frigo)</button>'+
 (manq.length?'<button class="btn sec" onclick="manqCourses(\''+r.id+'\')">Ajouter à la liste de courses ('+manq.length+' manquant'+(manq.length>1?"s":"")+')</button>':'')+
 '<div class="tabs"><button class="'+(dt==="ing"?"on":"")+'" onclick="S.dtab=\'ing\';render()">Ingrédients</button><button class="'+(dt==="st"?"on":"")+'" onclick="S.dtab=\'st\';render()">Étapes</button></div>'+
 '<div class="card" style="padding-top:4px;padding-bottom:4px">'+(dt==="ing"?ing:st)+'</div>'+
 vPort(r)+qui(r)+'<div class="card"><h3 style="margin-top:0">Planifier</h3><div class="row"><input type="date" id="pd" value="'+iso(new Date())+'"><select id="pm">'+REPAS.map(function(m){return'<option value="'+m[0]+'">'+m[1]+'</option>'}).join("")+'</select></div><button class="btn sec" onclick="planifier(\''+r.id+'\')">Ajouter au planning</button></div>'+
 '<div class="row"><button class="btn sec" onclick="editer(\''+r.id+'\')">Modifier</button><button class="btn sec" onclick="supprimer(\''+r.id+'\')">'+(S.reset==="del"?"Confirmer ?":"Supprimer")+'</button></div></div>'}
function favTog(id){var i=db.fav.indexOf(id);if(i>=0)db.fav.splice(i,1);else db.fav.push(id);save();render()}
function manqCourses(id){var a=analyse(rec(id),fridgeMap());a.rows.forEach(function(x){if(x.manque>0)addCourse(x.nom,x.manque,x.u)});save();S.seg="courses";go("frigo")}
function cuisiner(id){var r=rec(id);r.ing.forEach(function(i){var b=base(i.q,i.u),k=key(i.nom,i.u),reste=b.q;
 db.fridge.forEach(function(f){if(key(f.nom,f.u)===k&&reste>0){var t=Math.min(f.q,reste);f.q-=t;reste-=t}})});
 db.fridge=db.fridge.filter(function(f){return f.q>0});save();render()}
function planifier(id){var d=$("#pd").value,m=$("#pm").value;if(!d)return;db.plan[d]=db.plan[d]||{};db.plan[d][m]=id;save();S.ref=new Date(d+"T12:00:00");S.day=d;S.mode="semaine";go("plan")}
function supprimer(id){if(S.reset!=="del"){S.reset="del";render();return}db.recettes=db.recettes.filter(function(r){return r.id!==id});
 Object.keys(db.plan).forEach(function(d){Object.keys(db.plan[d]).forEach(function(k){if(db.plan[d][k]===id)delete db.plan[d][k]})});evs().forEach(function(e){e.menu=e.menu.filter(function(x){return x!==id})});S.reset=false;save();retour()}

/* ---------- formulaire recette ---------- */
function nouvelle(){S.form={id:null,nom:"",emo:"🍽️",temps:"",cout:"",port:"4",ing:[{nom:"",q:"",u:"g"}],etapes:""};S.sub="form";render()}
function editer(id){var r=rec(id);S.form=JSON.parse(JSON.stringify(r));S.form.port=String(r.port||1);S.sub="form";render()}
function lireForm(){var f=S.form;f.nom=$("#fn").value;f.emo=$("#fe").value;f.temps=$("#ft").value;f.cout=$("#fc").value;f.port=$("#fp").value;f.etapes=$("#fs").value;
 f.ing=Array.prototype.map.call(document.querySelectorAll(".ir"),function(el){return{nom:el.querySelector(".in").value,q:el.querySelector(".iq").value,u:el.querySelector(".iu").value}})}
function vForm(){var f=S.form;
 return'<h2>'+(f.id?"Modifier":"Nouvelle")+' recette</h2><div class="card"><label>Nom</label><input id="fn" value="'+esc(f.nom)+'">'+
 '<div class="row" style="margin-top:8px"><div><label>Emoji</label><input id="fe" value="'+esc(f.emo)+'"></div><div><label>Temps (min)</label><input id="ft" inputmode="numeric" value="'+esc(f.temps)+'"></div></div>'+
 '<label style="margin-top:8px;display:block">Coût approximatif</label><input id="fc" placeholder="ex. 1 500 FCFA" value="'+esc(f.cout)+'">'+
 '<label style="margin-top:8px;display:block">Portions (nombre de personnes servies par cette recette)</label><input id="fp" inputmode="numeric" value="'+esc(f.port)+'"><small>Les quantités ci-dessous correspondent à ce nombre de portions.</small>'+
  '<h3>Ingrédients</h3>'+f.ing.map(function(i,n){return'<div class="row ir" style="margin-bottom:8px"><input class="in" placeholder="Ingrédient" value="'+esc(i.nom)+'"><input class="iq fix" style="width:70px" inputmode="decimal" placeholder="Qté" value="'+esc(i.q)+'"><select class="iu fix" style="width:96px">'+U.map(function(u){return'<option'+(u===i.u?" selected":"")+'>'+u+'</option>'}).join("")+'</select><button class="qb fix" onclick="lireForm();S.form.ing.splice('+n+',1);render()">✕</button></div>'}).join("")+
 '<button class="btn sec" onclick="lireForm();S.form.ing.push({nom:\'\',q:\'\',u:\'g\'});render()">＋ Ingrédient</button>'+
 '<h3>Étapes (une par ligne)</h3><textarea id="fs">'+esc(f.etapes)+'</textarea></div>'+
 '<button class="btn" onclick="sauverForm()">Enregistrer la recette</button><button class="btn sec" onclick="retour()">Annuler</button>'}
function sauverForm(){lireForm();var f=S.form;if(!f.nom.trim())return alert("Indiquez le nom de la recette.");
 var ing=[];for(var k=0;k<f.ing.length;k++){var i=f.ing[k];if(!i.nom.trim()&&i.q==="")continue;var q=Number(String(i.q).replace(",","."));
  if(!i.nom.trim()||!(q>0))return alert("Ingrédient "+(k+1)+" : indiquez un nom et une quantité positive.");ing.push({nom:i.nom.trim(),q:q,u:i.u})}
 if(!ing.length)return alert("Ajoutez au moins un ingrédient.");
  var po=Number(String(f.port).replace(",","."));if(!(po>0))return alert("Indiquez le nombre de portions de la recette.");
 var r={id:f.id||uid(),nom:f.nom.trim(),emo:f.emo||"🍽️",temps:f.temps,cout:f.cout,ing:ing,etapes:f.etapes,port:po,unit:unit({ing:ing,port:po})};
 if(f.id)db.recettes[db.recettes.findIndex(function(x){return x.id===f.id})]=r;else db.recettes.push(r);
 save();S.sub="detail";S.ctx=r.id;render()}

/* ---------- frigo et courses ---------- */
function vFrigo(){
 var seg='<div class="chips" style="margin-bottom:12px"><button class="chip '+(S.seg==="frigo"?"on":"")+'" onclick="S.seg=\'frigo\';render()">🧊 Mon frigo</button><button class="chip '+(S.seg==="courses"?"on":"")+'" onclick="S.seg=\'courses\';render()">🛒 Liste de courses ('+db.courses.filter(function(c){return!c.ok}).length+')</button></div>';
 var add=function(act){return'<div class="card"><input id="an" placeholder="Nom de l\'ingrédient"><div class="row" style="margin-top:8px"><input id="aq" inputmode="decimal" placeholder="Quantité"><select id="au">'+U.map(function(u){return'<option>'+u+'</option>'}).join("")+'</select></div><button class="btn" onclick="'+act+'">Ajouter</button></div>'};
 if(S.seg==="frigo")return'<h2>Mon frigo</h2>'+seg+add("ajouter('fridge')")+'<div class="card">'+(db.fridge.length?db.fridge.map(function(f){var st=STEP[f.u]||1;
  return'<div class="li"><div class="n"><b>'+esc(f.nom)+'</b><br><small>'+fmt(f.q,f.u)+'</small></div><button class="qb" onclick="qte(\''+f.id+'\',-'+st+')">−</button><button class="qb" onclick="qte(\''+f.id+'\','+st+')">＋</button><button class="qb" onclick="supF(\''+f.id+'\')">✕</button></div>'}).join(""):'<span class="muted">Le frigo est vide.</span>')+'</div>';
 return'<h2>Liste de courses</h2>'+seg+add("ajouter('courses')")+'<div class="card">'+(db.courses.length?db.courses.map(function(c){
  return'<div class="li"><input type="checkbox" style="width:22px;height:22px" '+(c.ok?"checked":"")+' onchange="cocher(\''+c.id+'\')"><div class="n" style="'+(c.ok?"text-decoration:line-through;opacity:.6":"")+'"><b>'+esc(c.nom)+'</b><br><small>'+fmt(c.q,c.u)+'</small></div><button class="qb" onclick="supC(\''+c.id+'\')">✕</button></div>'}).join(""):'<span class="muted">La liste est vide.</span>')+
  '<button class="btn" onclick="achetes()">Mettre les articles cochés au frigo</button><button class="btn sec" onclick="db.courses=[];save();render()">Vider la liste</button></div>'}
function ajouter(w){var n=$("#an").value.trim(),q=Number(String($("#aq").value).replace(",",".")),u=$("#au").value;
 if(!n||!(q>0))return alert("Indiquez un nom et une quantité positive.");if(w==="fridge")addFridge(n,q,u);else addCourse(n,q,u);save();render()}
function qte(id,d){var f=db.fridge.find(function(x){return x.id===id});f.q=Math.max(0,Math.round((f.q+d)*100)/100);if(f.q===0)db.fridge=db.fridge.filter(function(x){return x.id!==id});save();render()}
function supF(id){db.fridge=db.fridge.filter(function(x){return x.id!==id});save();render()}
function supC(id){db.courses=db.courses.filter(function(x){return x.id!==id});save();render()}
function cocher(id){var c=db.courses.find(function(x){return x.id===id});c.ok=!c.ok;save();render()}
function achetes(){db.courses.filter(function(c){return c.ok}).forEach(function(c){addFridge(c.nom,c.q,c.u)});db.courses=db.courses.filter(function(c){return!c.ok});save();S.seg="frigo";render()}

/* ---------- planning ---------- */
function periode(){var d=[];if(S.mode==="semaine"){var l=lundi(S.ref);for(var i=0;i<7;i++)d.push(iso(addJ(l,i)))}
 else{var n=new Date(S.ref.getFullYear(),S.ref.getMonth()+1,0).getDate();for(var j=1;j<=n;j++)d.push(S.ref.getFullYear()+"-"+p2(S.ref.getMonth()+1)+"-"+p2(j))}return d}
function pctJour(d,map){var ps=REPAS.map(function(m){var r=rec((db.plan[d]||{})[m[0]]);return r?analyse(r,map).pct:null}).filter(function(x){return x!==null});return ps.length?Math.round(ps.reduce(function(a,b){return a+b},0)/ps.length):null}
function vPlan(){
 var map=fridgeMap(),dates=periode(),T=iso(new Date()),titre,corps;
 if(!S.day)S.day=iso(S.ref);
 var tg='<div class="chips" style="margin-bottom:12px"><button class="chip '+(S.mode==="semaine"?"on":"")+'" onclick="S.mode=\'semaine\';render()">Semaine</button><button class="chip '+(S.mode==="mois"?"on":"")+'" onclick="S.mode=\'mois\';render()">Mois</button></div>';
 if(S.mode==="semaine"){titre="Semaine du "+dates[0].slice(8)+"/"+dates[0].slice(5,7);
  if(dates.indexOf(S.day)<0)S.day=dates[0];
  var dd0=new Date(S.day+"T12:00:00");
  corps='<div class="strip">'+dates.map(function(d){var dd=new Date(d+"T12:00:00"),pj=pctJour(d,map);
   return'<button class="dc '+(d===S.day?"on":"")+'" onclick="S.day=\''+d+'\';render()"><small>'+["L","M","M","J","V","S","D"][(dd.getDay()+6)%7]+'</small><b>'+Number(d.slice(8))+'</b><i class="dot" style="background:'+(pj!==null?col(pj):"transparent")+'"></i></button>'}).join("")+'</div>'+
  '<h3 style="margin-top:0">'+["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"][dd0.getDay()]+" "+S.day.slice(8)+"/"+S.day.slice(5,7)+(S.day===T?" · aujourd'hui":"")+'</h3>'+
  REPAS.map(function(m){var id=(db.plan[S.day]||{})[m[0]],r=rec(id),a=r?analyse(r,map).pct:null;
   return'<div class="card meal" style="padding:12px"><span class="ml">'+m[1]+'</span><select onchange="setPlan(\''+S.day+'\',\''+m[0]+'\',this.value)"><option value="">— Choisir —</option>'+db.recettes.map(function(x){return'<option value="'+x.id+'"'+(x.id===id?" selected":"")+'>'+esc((x.emo||"")+" "+x.nom+(conf(x).length?" ⚠":""))+'</option>'}).join("")+'</select>'+(db.alea!==false?'<button class="qb fix" onclick="hasard(\''+S.day+'\',\''+m[0]+'\')">🎲</button>':'')+(a!==null?'<b style="color:'+col(a)+';width:52px;text-align:right;font-size:.85rem">'+a+' %</b>':'')+'</div>'}).join("")+confJour(S.day)}
 else{titre=MOIS[S.ref.getMonth()]+" "+S.ref.getFullYear();
  var prem=new Date(S.ref.getFullYear(),S.ref.getMonth(),1,12),dec=(prem.getDay()+6)%7;
  corps='<div class="cal">'+["L","M","M","J","V","S","D"].map(function(x){return'<div class="h">'+x+'</div>'}).join("")+Array(dec).fill('<div class="o"></div>').join("")+
  dates.map(function(d){var pj=pctJour(d,map);return'<div class="'+(d===T?"t":"")+'" onclick="S.mode=\'semaine\';S.day=\''+d+'\';S.ref=new Date(\''+d+'T12:00:00\');render()">'+Number(d.slice(8))+(pj!==null?'<i class="dot" style="background:'+col(pj)+'"></i>':'<i class="dot" style="opacity:0"></i>')+'</div>'}).join("")+'</div><p class="muted">Touchez un jour pour le détailler. Le point indique le pourcentage réalisable moyen des repas planifiés.</p>'}
 var mq=manquantsPlan(dates),nb=dates.reduce(function(a,d){return a+REPAS.filter(function(m){return(db.plan[d]||{})[m[0]]}).length},0);
 return'<h2>Planning des repas</h2>'+tg+panneauAlea()+'<div class="row" style="margin-bottom:12px"><button class="btn sec sm fix" onclick="nav(-1)">‹</button><b style="text-align:center">'+titre+'</b><button class="btn sec sm fix" onclick="nav(1)">›</button></div>'+corps+
 '<div class="card" style="margin-top:12px"><b>'+nb+' repas planifié(s) sur la période</b><br><small>'+(mq.length?mq.length+' ingrédient(s) manquant(s) (en tenant compte du frigo)':'Rien ne manque pour la période.')+'</small>'+
 (mq.length?'<button class="btn" onclick="courseP()">Ajouter les manquants à la liste de courses</button>':'')+'</div>'}
function nav(n){if(S.mode==="semaine")S.ref=addJ(S.ref,7*n);else S.ref=new Date(S.ref.getFullYear(),S.ref.getMonth()+n,1,12);render()}
function setPlan(d,m,id){db.plan[d]=db.plan[d]||{};if(id)db.plan[d][m]=id;else delete db.plan[d][m];save();render()}
function courseP(){manquantsPlan(periode()).forEach(function(x){addCourse(x.nom,x.q,x.u)});save();S.seg="courses";go("frigo")}

/* ---------- exceptions alimentaires ---------- */
function nn(s){return norm(s).replace(/œ/g,"oe")}
function why(p,r){for(var k=0;k<p.excl.length;k++){var x=nn(p.excl[k]);if(!x)continue;if(nn(r.nom).indexOf(x)>=0)return"repas : "+p.excl[k];var m=r.ing.some(function(i){var n=nn(i.nom);return n&&(n.indexOf(x)>=0||x.indexOf(n)>=0)});if(m)return"sans "+p.excl[k]}return null}
function conf(r){return db.gens.filter(function(p){return why(p,r)})}
function qui(r){if(!db.gens.length)return"";return'<div class="card"><h3 style="margin-top:0">Qui mange ce repas</h3>'+db.gens.map(function(p){var w=why(p,r);return'<div class="li"><div class="n"><b>'+esc(p.nom)+'</b></div>'+(w?'<span class="bad">✗ '+esc(w)+'</span>':'<span class="ok">✓ mange</span>')+'</div>'}).join("")+'</div>'}
function confJour(d){var t=REPAS.map(function(m){var r=rec((db.plan[d]||{})[m[0]]);if(!r)return"";var c=db.gens.map(function(p){var w=why(p,r);return w?p.nom+" ("+w+")":""}).filter(Boolean);return c.length?m[1]+" : "+c.join(", ")+" ne mange(nt) pas ce repas":""}).filter(Boolean);return t.length?'<div class="card" style="border-left:4px solid var(--warn)"><b>Exceptions</b>'+t.map(function(x){return'<br><small>'+esc(x)+'</small>'}).join("")+'</div>':""}
function vGens(){return'<h3 class="up">Exceptions alimentaires</h3><div class="card"><small>Indiquez pour chaque personne les ingrédients ou repas qu\'elle ne mange pas.</small><input id="gn" placeholder="Prénom de la personne" style="margin-top:8px"><button class="btn" onclick="addG()">Ajouter la personne</button></div>'+db.gens.map(function(p){
 var ok=db.recettes.filter(function(r){return!why(p,r)}).map(function(r){return esc(r.nom)}),ko=db.recettes.filter(function(r){return why(p,r)}).map(function(r){return esc(r.nom)});
 return'<div class="card"><div class="li" style="padding-top:0"><div class="n"><b>'+esc(p.nom)+'</b></div><button class="btn sec sm" onclick="supG(\''+p.id+'\')">'+(S.reset==="g"+p.id?"Confirmer ?":"Supprimer")+'</button></div>'+
 '<div class="chips" style="margin:8px 0">'+(p.excl.length?p.excl.map(function(x,n){return'<span class="chip">'+esc(x)+' <span style="cursor:pointer" onclick="supX(\''+p.id+'\','+n+')">✕</span></span>'}).join(""):'<span class="muted">Aucune exception : mange de tout.</span>')+'</div>'+
 '<div class="row"><input id="gx'+p.id+'" placeholder="Ex. poisson, arachides, un repas…"><button class="btn sm fix" onclick="addX(\''+p.id+'\')">Ajouter</button></div>'+
 '<small style="display:block;margin-top:10px">Peut manger : '+(ok.join(", ")||"—")+'</small>'+(ko.length?'<small style="display:block;margin-top:4px">Évite : '+ko.join(", ")+'</small>':'')+'</div>'}).join("")}
function gen(id){return db.gens.find(function(x){return x.id===id})}
function addG(){var n=$("#gn").value.trim();if(!n)return alert("Indiquez un prénom.");db.gens.push({id:uid(),nom:n,excl:[]});save();render()}
function supG(id){if(S.reset!=="g"+id){S.reset="g"+id;render();return}db.gens=db.gens.filter(function(x){return x.id!==id});S.reset=false;save();render()}
function addX(id){var v=$("#gx"+id).value.trim();if(!v)return;var p=gen(id);if(!p.excl.some(function(x){return nn(x)===nn(v)}))p.excl.push(v);save();render()}
function supX(id,n){gen(id).excl.splice(n,1);save();render()}

/* ---------- choix aléatoire ---------- */
function togAlea(){db.alea=db.alea===false;save();render()}
function togM(id){var c=S.mange||db.gens.map(function(p){return p.id}),i=c.indexOf(id);if(i>=0)c.splice(i,1);else c.push(id);S.mange=c;render()}
function convives(){var s=S.mange||db.gens.map(function(p){return p.id});return db.gens.filter(function(p){return s.indexOf(p.id)>=0})}
function compat(r){return convives().every(function(p){return!why(p,r)})}
function conso(r,map){r.ing.forEach(function(i){var b=base(i.q,i.u),k=key(i.nom,i.u);map[k]=Math.max(0,(map[k]||0)-b.q)})}
function jourCtx(d,sauf){var map=Object.assign({},fridgeMap()),used={};REPAS.forEach(function(m){var r=rec((db.plan[d]||{})[m[0]]);if(r&&m[0]!==sauf){conso(r,map);used[r.id]=1}});return{map:map,used:used}}
function tirer(map,used){var l=db.recettes.filter(compat);if(!l.length)return null;var n=l.filter(function(r){return!used[r.id]});if(n.length)l=n;
 var A=l.map(function(r){return{r:r,p:analyse(r,map).pct}}),c;
 if(db.aleaMode==="manque"){c=A.filter(function(x){return x.p<100});if(!c.length)c=A}
 else{var f=A.filter(function(x){return x.p>=100});if(f.length)c=f;else{var mx=Math.max.apply(null,A.map(function(x){return x.p}));c=A.filter(function(x){return x.p===mx})}}
 return c[Math.floor(Math.random()*c.length)].r}
function hasard(d,m){var c=jourCtx(d,m),r=tirer(c.map,c.used);if(!r)return alert("Aucune recette ne convient à tous les convives choisis.");setPlan(d,m,r.id)}
function remplir(){var d=S.day,c=jourCtx(d),vides=REPAS.filter(function(m){return!(db.plan[d]||{})[m[0]]}),ok=true;
 if(!vides.length)return alert("Tous les repas de ce jour sont déjà planifiés.");
 vides.forEach(function(m){var r=tirer(c.map,c.used);if(!r){ok=false;return}c.used[r.id]=1;conso(r,c.map);db.plan[d]=db.plan[d]||{};db.plan[d][m[0]]=r.id});
 save();render();if(!ok)alert("Aucune recette ne convient à tous les convives choisis.")}
function modeAlea(m){db.aleaMode=m;save();render()}
function courseJ(){manquantsPlan([S.day]).forEach(function(x){addCourse(x.nom,x.q,x.u)});save();S.seg="courses";go("frigo")}
function panneauAlea(){var on=db.alea!==false,sel=convives().map(function(p){return p.id}),mq=manquantsPlan([S.day]),man=db.aleaMode==="manque";
 return'<div class="card"><div class="li" style="padding:0;border:0"><div class="n"><b>🎲 Choix aléatoire</b><br><small>Pas le temps de réfléchir : l\'appli choisit les repas du jour à votre place.</small></div><button class="chip '+(on?"on":"")+'" onclick="togAlea()">'+(on?"Activé":"Désactivé")+'</button></div>'+
 (on?'<small style="display:block;margin-top:12px">Selon quoi ?</small><div class="chips" style="margin-top:6px"><button class="chip '+(man?"":"on")+'" onclick="modeAlea(\'frigo\')">Ce que j\'ai au frigo</button><button class="chip '+(man?"on":"")+'" onclick="modeAlea(\'manque\')">Ce qui me manque</button></div><small style="display:block;margin-top:6px">'+(man?"Recettes pour lesquelles il manque des ingrédients : vous pourrez les ajouter à la liste de courses.":"Recettes réalisables avec votre frigo ; à défaut, les plus proches.")+'</small>'+
  (db.gens.length?'<small style="display:block;margin-top:12px">Qui mange ? (les exceptions sont respectées)</small><div class="chips" style="margin-top:6px">'+db.gens.map(function(p){return'<button class="chip '+(sel.indexOf(p.id)>=0?"on":"")+'" onclick="togM(\''+p.id+'\')">'+esc(p.nom)+'</button>'}).join("")+'</div>':'<small style="display:block;margin-top:10px">Ajoutez des personnes dans Profil pour tenir compte de leurs exceptions.</small>')+
  (S.mode==="semaine"?'<button class="btn" onclick="remplir()">🎲 Choisir les repas du '+S.day.slice(8)+'/'+S.day.slice(5,7)+'</button><small style="display:block;margin-top:8px">Seuls les repas vides du jour sont tirés. Touchez 🎲 à côté d\'un repas pour le tirer seul.</small>'+
   (mq.length?'<small style="display:block;margin-top:10px">Il manque pour ce jour : '+mq.map(function(x){return esc(x.nom)+" ("+fmt(x.q,x.u)+")"}).join(", ")+'</small><button class="btn sec" onclick="courseJ()">Ajouter ces manquants à la liste de courses</button>':''):'<small style="display:block;margin-top:10px">Touchez un jour du calendrier pour tirer ses repas.</small>'):'')+'</div>'}

/* ---------- portionnage et événements ---------- */
function evs(){if(!db.events)db.events=[];return db.events}
function nport(r){return Number(r.port)>0?Number(r.port):1}
function unit(r){if(r.unit&&r.unit.length)return r.unit;var p=nport(r);return r.ing.map(function(i){var b=base(i.q,i.u);return{nom:i.nom,q:b.q/p,u:b.u}})}
function pour(i,n){return Math.ceil(i.q*n-1e-9)}
function vPort(r){var p=nport(r);return'<div class="card"><h3 style="margin-top:0">Portionnage</h3><small>La recette donne <b>'+p+'</b> portion'+(p>1?"s":"")+'. Menu unitaire (par personne) :</small>'+
 unit(r).map(function(i){return'<div class="li"><div class="n">'+esc(i.nom)+'</div><b>'+fmt(Math.round(i.q*100)/100,i.u)+'</b></div>'}).join("")+
 '<label style="display:block;margin-top:10px">Pour combien de personnes ?</label><input inputmode="numeric" id="pn'+r.id+'" placeholder="Nombre de personnes" oninput="calcPort(\''+r.id+'\')"><div id="pc'+r.id+'" style="margin-top:8px"></div></div>'}
function calcPort(id){var r=rec(id),n=Number($("#pn"+id).value);$("#pc"+id).innerHTML=n>0?'<small>Soit '+Math.round(n/nport(r)*100)/100+' fois la recette :</small>'+unit(r).map(function(i){return'<div class="li"><div class="n">'+esc(i.nom)+'</div><b>'+fmt(pour(i,n),i.u)+'</b></div>'}).join(""):""}
function evBesoins(e){var t={};e.menu.forEach(function(id){var r=rec(id);if(!r)return;unit(r).forEach(function(i){var k=key(i.nom,i.u);t[k]=t[k]||{nom:i.nom,u:i.u,q:0};t[k].q+=i.q*e.pers})});return Object.keys(t).map(function(k){var x=t[k];x.q=Math.ceil(x.q-1e-9);return x})}
function evFind(id){return evs().find(function(x){return x.id===id})}
function vEvents(){var l=evs().slice().sort(function(a,b){return String(a.date).localeCompare(String(b.date))});
 return'<h2>Événements</h2>'+(l.length?l.map(function(e){return'<div class="card" onclick="evOuvrir(\''+e.id+'\')"><b>'+esc(e.nom)+'</b><br><small>'+(e.date?new Date(e.date+"T12:00:00").toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})+" · ":"")+e.pers+' personnes</small><div class="muted" style="margin-top:6px">'+e.menu.map(function(id){var r=rec(id);return r?esc(r.nom):""}).filter(Boolean).join(", ")+'</div></div>'}).join(""):'<div class="card muted">Aucun événement. Créez-en un pour calculer les quantités selon le nombre de personnes à nourrir.</div>')+
 '<button class="btn" onclick="evNouveau()">＋ Nouvel événement</button>'}
function evNouveau(){S.ef={id:null,nom:"",date:iso(new Date()),pers:"10",menu:[]};S.sub="evform";render();window.scrollTo(0,0)}
function evEdit(id){var e=evFind(id);S.ef=JSON.parse(JSON.stringify(e));S.ef.pers=String(e.pers);S.sub="evform";render();window.scrollTo(0,0)}
function evLire(){var f=S.ef;f.nom=$("#en").value;f.date=$("#ed").value;f.pers=$("#ep").value}
function evTogR(id){evLire();var i=S.ef.menu.indexOf(id);if(i>=0)S.ef.menu.splice(i,1);else S.ef.menu.push(id);render()}
function vEvForm(){var f=S.ef;return'<h2>'+(f.id?"Modifier":"Nouvel")+' événement</h2><div class="card"><label>Nom</label><input id="en" placeholder="ex. Anniversaire, mariage…" value="'+esc(f.nom)+'">'+
 '<div class="row" style="margin-top:8px"><div><label>Date</label><input type="date" id="ed" value="'+esc(f.date)+'"></div><div><label>Personnes à nourrir</label><input id="ep" inputmode="numeric" value="'+esc(f.pers)+'"></div></div>'+
 '<h3>Menu</h3><div class="chips">'+db.recettes.map(function(r){return'<button class="chip '+(f.menu.indexOf(r.id)>=0?"on":"")+'" onclick="evTogR(\''+r.id+'\')">'+esc((r.emo||"")+" "+r.nom)+'</button>'}).join("")+'</div><small style="display:block;margin-top:8px">Les quantités sont calculées à partir du portionnage de chaque recette.</small></div>'+
 '<button class="btn" onclick="evSauver()">Enregistrer l\'événement</button><button class="btn sec" onclick="retour()">Annuler</button>'}
function evSauver(){evLire();var f=S.ef,n=Math.round(Number(f.pers));if(!f.nom.trim())return alert("Indiquez le nom de l'événement.");if(!(n>0))return alert("Indiquez le nombre de personnes à nourrir.");if(!f.menu.length)return alert("Choisissez au moins un plat au menu.");
 var e={id:f.id||uid(),nom:f.nom.trim(),date:f.date,pers:n,menu:f.menu};if(f.id)evs()[evs().findIndex(function(x){return x.id===f.id})]=e;else evs().push(e);save();S.sub="evdet";S.ctx=e.id;render()}
function evOuvrir(id){S.sub="evdet";S.ctx=id;S.reset=false;render();window.scrollTo(0,0)}
function evPers(id){var n=Math.round(Number($("#epn").value));if(!(n>0))return;evFind(id).pers=n;save();render()}
function evCourses(id){var map=fridgeMap();evBesoins(evFind(id)).forEach(function(x){var m=x.q-Math.min(map[key(x.nom,x.u)]||0,x.q);if(m>0)addCourse(x.nom,m,x.u)});save();S.seg="courses";go("frigo")}
function evSupp(id){if(S.reset!=="evdel"){S.reset="evdel";render();return}db.events=evs().filter(function(x){return x.id!==id});S.reset=false;save();retour()}
function vEvDet(){var e=evFind(S.ctx);if(!e){S.sub=null;return vEvents()}var map=fridgeMap(),manque=0;
 var rows=evBesoins(e).map(function(x){var have=Math.min(map[key(x.nom,x.u)]||0,x.q),m=x.q-have;if(m>0)manque++;
  return'<div class="li"><div class="n"><b>'+esc(x.nom)+'</b><br><small>besoin '+fmt(x.q,x.u)+' · frigo '+fmt(have,x.u)+'</small></div>'+(m>0?'<span class="bad">manque '+fmt(m,x.u)+'</span>':'<span class="ok">✓</span>')+'</div>'}).join("");
 var plats=e.menu.map(function(id){var r=rec(id);if(!r)return"";var p=nport(r);
  return'<div class="card"><b>'+esc((r.emo||"")+" "+r.nom)+'</b><br><small>Recette de base : '+p+' portion'+(p>1?"s":"")+' · pour '+e.pers+' personnes : <b>'+Math.round(e.pers/p*100)/100+' fois la recette</b></small>'+
  unit(r).map(function(i){return'<div class="li"><div class="n">'+esc(i.nom)+'</div><b>'+fmt(pour(i,e.pers),i.u)+'</b></div>'}).join("")+'</div>'}).join("");
 return'<h2>'+esc(e.nom)+'</h2><small>'+(e.date?new Date(e.date+"T12:00:00").toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"}):"")+'</small>'+
 '<div class="card" style="margin-top:12px"><label>Personnes à nourrir</label><input id="epn" inputmode="numeric" value="'+e.pers+'" onchange="evPers(\''+e.id+'\')"><small>Les quantités se recalculent automatiquement.</small></div>'+
 '<h3 class="up">Portionnage par plat</h3>'+plats+
 '<h3 class="up">À prévoir au total</h3><div class="card" style="padding-top:4px;padding-bottom:4px">'+rows+'</div>'+
 (manque?'<button class="btn" onclick="evCourses(\''+e.id+'\')">Ajouter les manquants à la liste de courses ('+manque+')</button>':'<div class="card ok">Tout est déjà au frigo.</div>')+
 '<div class="row"><button class="btn sec" onclick="evEdit(\''+e.id+'\')">Modifier</button><button class="btn sec" onclick="evSupp(\''+e.id+'\')">'+(S.reset==="evdel"?"Confirmer ?":"Supprimer")+'</button></div><button class="btn sec" onclick="retour()">Retour</button>'}

/* ---------- profil ---------- */
function vProfil(){
 return'<h2>Profil et sauvegarde</h2><div class="card"><b>'+db.recettes.length+'</b> recettes · <b>'+db.fridge.length+'</b> ingrédients au frigo<br><small>Les données sont enregistrées sur cet appareil, sans connexion. Ce n\'est pas une sauvegarde infaillible : exportez régulièrement.</small><br><small>Dernière sauvegarde : '+(db.lastBackup?new Date(db.lastBackup).toLocaleString("fr-FR"):"aucune")+' · Stockage protégé : '+(persiste===null?"non vérifié":persiste?"oui":"non")+'</small>'+
 '<button class="btn" onclick="exporter()">Exporter la sauvegarde (JSON)</button><label style="display:block;margin-top:12px">Restaurer un fichier JSON</label><input type="file" accept=".json,application/json" onchange="importer(this)"></div>'+
 vGens()+'<div class="card"><button class="btn sec" onclick="reinit()">'+(S.reset==="all"?"Confirmer : tout effacer":"Réinitialiser (exemples)")+'</button></div>'}
function exporter(){db.lastBackup=new Date().toISOString();save();var a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(db,null,2)],{type:"application/json"}));a.download="miambox-"+iso(new Date())+".json";document.body.appendChild(a);a.click();a.remove();render()}
function importer(inp){var f=inp.files[0];if(!f)return;var rd=new FileReader();rd.onload=function(){try{var d=JSON.parse(rd.result);if(!d||!d.recettes||!d.fridge)throw 1;db=d;db.gens=db.gens||[];save();go("home")}catch(e){alert("Fichier invalide.")}};rd.readAsText(f)}
function reinit(){if(S.reset!=="all"){S.reset="all";render();return}db=exemple();S.reset=false;save();go("home")}

var persiste=null;
if(navigator.storage&&navigator.storage.persist){navigator.storage.persist().then(function(ok){persiste=ok;if(S.tab==='profil'&&!S.sub)render()}).catch(function(){})}
render();
setTimeout(function(){var s=$("#splash");s.style.opacity=0;setTimeout(function(){s.remove()},400)},1100);
