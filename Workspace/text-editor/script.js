const editor = document.getElementById("editor");
const openBtn = document.getElementById("openBtn");
const saveBtn = document.getElementById("saveBtn");
const title = document.getElementById("title");
const langSelect = document.getElementById("langSelect");

langSelect.addEventListener("change", (e) => {
  applyLanguage(e.target.value);
})

const translations = {
  en:{
    defaultTitle: "Simple Web Text Editor",
    open: "Open",
    save: "Save",
    saveSuccess: "Saved successfully!",
    saveFail: "Save failed...",
  },
  ja:{
    defaultTitle: "Simple Web Text Editor",
    open: "開く",
    save: "保存",
    saveSuccess: "保存成功！",
    saveFail: "保存失敗...",
  }
};

let currentLang = "en";
let currentFileHandle = null;
let isFileOpened = false;

function applyLanguage(lang){
  currentLang = lang;
  openBtn.textContent = translations[lang].open;
  saveBtn.textContent = translations[lang].save;
  if (!isFileOpened){
    title.textContent = transtations[lang].defaultTitle;
  }
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 4000);
}

// Open
openBtn.addEventListener("click", async () => {
  try {
    const [handle] = await window.showOpenFilePicker({
      types: [{
        description: "Text Files",
        accept: { "text/plain": [".txt", ".html", ".js", ".css"] }
      }],
      multiple: false
    });

    const file = await handle.getFile();
    const contents = await file.text();

    editor.value = contents;
    currentFileHandle = handle;
    title.textContent = file.name;
    isFileOpened = ture;
  } catch (err) {
    console.log("Open cancelled or error:", err);
  }
});

// Save
saveBtn.addEventListener("click", async () => {
  try {
    // ã¾ã ãƒ•ã‚¡ã‚¤ãƒ«ã‚’é–‹ã„ã¦ã„ãªã„å ´åˆ
    if (!currentFileHandle) {
      currentFileHandle = await window.showSaveFilePicker({
        suggestedName: "untitled.txt",
        types: [{
          description: "Text Files",
          accept: { "text/plain": [".txt"] }
        }]
      });
    }

    const writable = await currentFileHandle.createWritable();
    await writable.write(editor.value);
    await writable.close();

    const file = await currentFileHandle.getFile();
    title.textContent = file.name;
    
    showToast(translations[currentLang].saveSuccess)

  } catch (err) {
    console.log("Save cancelled or error:", err);
    showToast(translations[currentLang].saveFail)
  }
});
