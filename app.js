// ChromebookNotes app.js - vanilla JS module
const DB_NAME = "chromebook-notes-db";
const STORE = "notes";
let db;
let currentId = null;
const notesList = document.getElementById("notesList");
const noteTitle = document.getElementById("noteTitle");
const noteBody = document.getElementById("noteBody");
const saveBtn = document.getElementById("saveBtn");
const deleteBtn = document.getElementById("deleteBtn");
const newNoteBtn = document.getElementById("newNote");
const searchInput = document.getElementById("search");
const preview = document.getElementById("preview");
const status = document.getElementById("status");
const installBtn = document.getElementById("installBtn");

function setStatus(text){
  status.textContent = text;
  setTimeout(()=> status.textContent = "Idle", 1500);
}

// Simple markdown-lite renderer
function renderPreview(md){
  if(!md) return "<em>Preview</em>";
  let html = md
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/gim, "<em>$1</em>")
    .replace(/\n/g, "<br/>");
  return html;
}

noteBody.addEventListener("input", ()=> {
  preview.innerHTML = renderPreview(noteBody.value);
  autoSaveDraft();
});

noteTitle.addEventListener("input", autoSaveDraft);

let draftTimer;
function autoSaveDraft(){
  setStatus("Typing...");
  clearTimeout(draftTimer);
  draftTimer = setTimeout(()=> {
    if(currentId) saveNote().then(()=> setStatus("Saved draft"));
  }, 800);
}

// IndexedDB helpers
function openDB(){
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if(!db.objectStoreNames.contains(STORE)){
        db.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
      }
    };
    req.onsuccess = e => { db = e.target.result; resolve(db); };
    req.onerror = e => reject(e);
  });
}

function idbGetAll(){
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);
    const req = store.getAll();
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}

function idbGet(id){
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);
    const req = store.get(id);
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}

function idbPut(note){
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const req = store.put(note);
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}

function idbDelete(id){
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const req = store.delete(id);
    req.onsuccess = () => res();
    req.onerror = () => rej(req.error);
  });
}

// UI functions
async function refreshList(filter=""){
  const all = await idbGetAll();
  const filtered = all.filter(n => {
    const q = filter.trim().toLowerCase();
    if(!q) return true;
    return (n.title || "").toLowerCase().includes(q) || (n.body || "").toLowerCase().includes(q);
  }).sort((a,b)=> (b.updatedAt||b.createdAt) - (a.updatedAt||a.createdAt));
  notesList.innerHTML = "";
  for(const n of filtered){
    const li = document.createElement("li");
    li.className = "note-item";
    li.dataset.id = n.id;
    li.innerHTML = `<strong>${escapeHtml(n.title || "Untitled")}</strong><div class="meta">${new Date(n.updatedAt||n.createdAt).toLocaleString()}</div>`;
    li.addEventListener("click", ()=> loadNote(n.id));
    notesList.appendChild(li);
  }
}

function escapeHtml(s){ return s ? s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])) : ""; }

async function loadNote(id){
  const n = await idbGet(Number(id));
  if(!n) return;
  currentId = n.id;
  noteTitle.value = n.title || "";
  noteBody.value = n.body || "";
  preview.innerHTML = renderPreview(noteBody.value);
  setStatus("Loaded");
}

async function saveNote(){
  const now = Date.now();
  const note = {
    id: currentId || undefined,
    title: noteTitle.value.trim(),
    body: noteBody.value,
    updatedAt: now,
    createdAt: currentId ? undefined : now
  };
  const savedId = await idbPut(note);
  if(!currentId) currentId = savedId;
  await refreshList(searchInput.value);
  setStatus("Saved");
  return savedId;
}

async function deleteCurrent(){
  if(!currentId) return;
  if(!confirm("Delete this note?")) return;
  await idbDelete(Number(currentId));
  currentId = null;
  noteTitle.value = "";
  noteBody.value = "";
  preview.innerHTML = renderPreview("");
  await refreshList(searchInput.value);
  setStatus("Deleted");
}

// events
saveBtn.addEventListener("click", saveNote);
deleteBtn.addEventListener("click", deleteCurrent);
newNoteBtn.addEventListener("click", ()=> {
  currentId = null;
  noteTitle.value = "";
  noteBody.value = "";
  preview.innerHTML = renderPreview("");
  setStatus("New note");
});

searchInput.addEventListener("input", ()=> refreshList(searchInput.value));

// install prompt handling
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.hidden = false;
});
installBtn.addEventListener('click', async () => {
  if(!deferredPrompt) return;
  deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.hidden = true;
});

// register service worker
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('sw.js').catch(()=> console.warn("SW registration failed"));
}

// init
(async function init(){
  await openDB();
  await refreshList();
  preview.innerHTML = renderPreview("");
  setStatus("Ready");
})();
