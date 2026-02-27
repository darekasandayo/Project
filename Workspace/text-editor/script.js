const editor = document.getElementById("editor");
const openBtn = document.getElementById("openBtn");
const saveBtn = document.getElementById("saveBtn");
const title = document.getElementById("title");

let currentFileHandle = null;

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

  } catch (err) {
    console.log("Open cancelled or error:", err);
  }
});

// Save
saveBtn.addEventListener("click", async () => {
  try {
    // まだファイルを開いていない場合
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
    
    showToast("保存成功！")

  } catch (err) {
    console.log("Save cancelled or error:", err);
    showToast("保存失敗...")
  }
});
