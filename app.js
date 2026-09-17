const $=s=>document.querySelector(s);
const KEY="fileforum_local_v1";
let posts=JSON.parse(localStorage.getItem(KEY)||"[]");
const pseudo=$('#pseudo'),title=$('#title'),message=$('#message'),file=$('#file');

file.addEventListener('change',()=>{
  const n=file.files.length;
  $('#fileInfo').textContent=n?`${n} fichier${n>1?'s':''} sélectionné${n>1?'s':''}`:"Aucun fichier sélectionné";
});

function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function typeOf(name,mime=""){
  const ext=name.split('.').pop().toLowerCase();
  if(mime.startsWith('audio/')||['mp3','wav','ogg','m4a'].includes(ext))return'audio';
  if(mime.startsWith('video/')||['mp4','webm','mov'].includes(ext))return'video';
  if(ext==='html'||ext==='htm')return'html';
  if(mime.startsWith('image/'))return'image';
  return'other';
}
function fmt(bytes){if(bytes<1024)return bytes+' o';let n=bytes/1024;if(n<1024)return n.toFixed(1)+' Ko';n/=1024;if(n<1024)return n.toFixed(1)+' Mo';return(n/1024).toFixed(1)+' Go'}

async function addPost(){
  if(!message.value.trim()&&!file.files.length)return alert("Écris un message ou ajoute un fichier.");
  const attachments=[];
  for(const f of file.files){
    if(f.size>15*1024*1024)return alert(`Le fichier ${f.name} dépasse 15 Mo dans cette version locale.`);
    const data=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(f)});
    attachments.push({name:f.name,size:f.size,mime:f.type,data,type:typeOf(f.name,f.type)});
  }
  posts.unshift({id:crypto.randomUUID(),author:(pseudo.value.trim()||"Anonyme").slice(0,30),title:title.value.trim()||"Sans titre",body:message.value.trim(),date:new Date().toISOString(),files:attachments});
  try{localStorage.setItem(KEY,JSON.stringify(posts))}catch(e){alert("Stockage local plein. Supprime quelques messages/fichiers.");posts.shift();return}
  title.value=message.value="";file.value="";$('#fileInfo').textContent="Aucun fichier sélectionné";render();
}
$('#postBtn').onclick=addPost;

function render(){
  const q=$('#search').value.toLowerCase(), filter=$('#filter').value;
  const visible=posts.filter(p=>{
    const text=(p.title+" "+p.body+" "+p.author+" "+p.files.map(x=>x.name).join(" ")).toLowerCase();
    const types=p.files.map(x=>x.type);
    return text.includes(q)&&(filter==="all"||types.includes(filter));
  });
  $('#empty').style.display=visible.length?'none':'block';
  $('#feed').innerHTML=visible.map(p=>`
    <article class="post">
      <button class="delete" onclick="removePost('${p.id}')">✕</button>
      <div class="meta"><span class="author">👤 ${esc(p.author)}</span><span>${new Date(p.date).toLocaleString('fr-FR')}</span></div>
      <h2>${esc(p.title)}</h2>
      ${p.body?`<div class="body">${esc(p.body)}</div>`:""}
      ${p.files.map((f,i)=>`
        <div class="file">
          <div class="filetop"><span class="filename">${icon(f.type)} ${esc(f.name)} <span class="size">(${fmt(f.size)})</span></span><a class="download" download="${esc(f.name)}" href="${f.data}">⬇ Télécharger</a></div>
          ${f.type==='audio'?`<audio controls src="${f.data}"></audio>`:""}
          ${f.type==='video'?`<video controls src="${f.data}"></video>`:""}
          ${f.type==='image'?`<img src="${f.data}" style="max-width:100%;max-height:400px;border-radius:8px;margin-top:10px">`:""}
          ${f.type==='html'?`<iframe class="preview" sandbox srcdoc="${esc(decodeURIComponent(escape(atob(f.data.split(',')[1]))))}"></iframe>`:""}
        </div>`).join("")}
    </article>`).join("");
}
function icon(t){return{audio:"🎵",video:"🎬",html:"🌐",image:"🖼️",other:"📁"}[t]}
function removePost(id){posts=posts.filter(p=>p.id!==id);localStorage.setItem(KEY,JSON.stringify(posts));render()}
window.removePost=removePost;
$('#search').oninput=render;$('#filter').onchange=render;
$('#clearBtn').onclick=()=>{if(confirm("Effacer tous les messages enregistrés sur cet appareil ?")){posts=[];localStorage.removeItem(KEY);render()}};
render();
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');
