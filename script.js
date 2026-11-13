const STORAGE_KEY = "learning-journal-items";
const $ = (id) => document.getElementById(id);
let items = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

const dialog = $("item-dialog");
const form = $("item-form");
const progressInput = $("progress");

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  render();
}

function safeDate(value) {
  if (!value) return "Not set";
  return new Date(value + "T00:00:00").toLocaleDateString(undefined, {
    year: "numeric", month: "short", day: "numeric"
  });
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[char]);
}

function openForm(type, item = null) {
  form.reset();
  $("item-type").value = type;
  $("item-id").value = item?.id || "";
  $("form-title").textContent = item ? `Edit ${type}` : `Add a ${type}`;
  $("form-eyebrow").textContent = item ? "UPDATE YOUR LEARNING" : "NEW LEARNING ITEM";
  $("course-fields").hidden = type !== "course";
  $("book-fields").hidden = type !== "book";
  $("title").value = item?.title || "";
  $("description").value = item?.description || "";
  $("start-date").value = item?.startDate || "";
  $("target-date").value = item?.targetDate || "";
  progressInput.value = item?.progress ?? 0;
  $("progress-output").textContent = `${progressInput.value}%`;

  $("provider").value = item?.provider || "";
  $("instructor").value = item?.instructor || "";
  $("url").value = item?.url || "";
  $("author").value = item?.author || "";
  $("book-link").value = item?.bookLink || "";
  $("total-pages").value = item?.totalPages || "";
  $("pages-read").value = item?.pagesRead || "";

  dialog.showModal();
}

function cardHTML(item) {
  const remaining = 100 - item.progress;
  const detailOne = item.type === "course" ? ["Provider", item.provider] : ["Author", item.author];
  const detailTwo = item.type === "course" ? ["Instructor", item.instructor] : ["Pages", item.totalPages ? `${item.pagesRead || 0} / ${item.totalPages}` : "Not set"];
  const link = item.type === "course" ? item.url : item.bookLink;
  return `
    <article class="item-card">
      <div class="card-top">
        <div><h3>${escapeHTML(item.title)}</h3><span class="muted">${item.type === "course" ? "Online course" : "Book / reading"}</span></div>
        <span class="status">${item.progress === 100 ? "Completed" : "In progress"}</span>
      </div>
      <p class="item-description">${escapeHTML(item.description || "No description added yet.")}</p>
      <div class="item-progress-head"><span>Learning progress</span><span>${item.progress}%</span></div>
      <div class="item-progress"><span style="width:${item.progress}%"></span></div>
      <p class="remaining">${remaining}% remaining</p>
      <div class="meta-grid">
        <div><span class="meta-label">${detailOne[0]}</span><span class="meta-value">${escapeHTML(detailOne[1] || "Not set")}</span></div>
        <div><span class="meta-label">${detailTwo[0]}</span><span class="meta-value">${escapeHTML(detailTwo[1] || "Not set")}</span></div>
        <div><span class="meta-label">Started</span><span class="meta-value">${safeDate(item.startDate)}</span></div>
        <div><span class="meta-label">Target finish</span><span class="meta-value">${safeDate(item.targetDate)}</span></div>
      </div>
      ${link ? `<a class="card-link" href="${escapeHTML(link)}" target="_blank" rel="noopener noreferrer">Open ${item.type === "course" ? "course" : "book link"} ↗</a>` : ""}
      <div class="card-actions">
        <button class="small-button" data-edit="${item.id}">Edit</button>
        <button class="small-button" data-delete="${item.id}">Delete</button>
        ${item.progress < 100 ? `<button class="small-button" data-complete="${item.id}">Mark complete</button>` : ""}
      </div>
    </article>`;
}

function render() {
  const activeCourses = items.filter(x => x.type === "course" && x.progress < 100);
  const activeBooks = items.filter(x => x.type === "book" && x.progress < 100);
  const completed = items.filter(x => x.progress === 100);
  const courses = items.filter(x => x.type === "course" && x.progress < 100);
  const books = items.filter(x => x.type === "book" && x.progress < 100);

  $("course-list").innerHTML = courses.map(cardHTML).join("");
  $("book-list").innerHTML = books.map(cardHTML).join("");
  $("empty-courses").hidden = courses.length > 0;
  $("empty-books").hidden = books.length > 0;
  $("active-courses").textContent = activeCourses.length;
  $("active-books").textContent = activeBooks.length;
  $("completed-count").textContent = completed.length;

  const average = items.length ? Math.round(items.reduce((sum, x) => sum + x.progress, 0) / items.length) : 0;
  $("overall-progress").textContent = `${average}%`;
  $("overall-bar").style.width = `${average}%`;

  $("completed-list").innerHTML = completed.map(x =>
    `<div class="completed-row"><span>${escapeHTML(x.title)} <span class="muted">· ${x.type}</span></span><span>✓ Completed</span></div>`
  ).join("");
  $("empty-completed").hidden = completed.length > 0;
  $("last-updated").textContent = items.length ? `${items.length} learning item${items.length === 1 ? "" : "s"} tracked` : "Your personal tracker";
}

document.addEventListener("click", (event) => {
  const openButton = event.target.closest("[data-open-form]");
  if (openButton) openForm(openButton.dataset.openForm);

  const editButton = event.target.closest("[data-edit]");
  if (editButton) {
    const item = items.find(x => x.id === editButton.dataset.edit);
    if (item) openForm(item.type, item);
  }

  const deleteButton = event.target.closest("[data-delete]");
  if (deleteButton) {
    if (confirm("Delete this learning item?")) {
      items = items.filter(x => x.id !== deleteButton.dataset.delete);
      save();
    }
  }

  const completeButton = event.target.closest("[data-complete]");
  if (completeButton) {
    const item = items.find(x => x.id === completeButton.dataset.complete);
    if (item) { item.progress = 100; save(); }
  }
});

progressInput.addEventListener("input", () => {
  $("progress-output").textContent = `${progressInput.value}%`;
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const type = $("item-type").value;
  const id = $("item-id").value || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()));
  const existing = items.find(x => x.id === id);
  const item = {
    id, type,
    title: $("title").value.trim(),
    description: $("description").value.trim(),
    startDate: $("start-date").value,
    targetDate: $("target-date").value,
    progress: Number(progressInput.value),
    provider: $("provider").value.trim(),
    instructor: $("instructor").value.trim(),
    url: $("url").value.trim(),
    author: $("author").value.trim(),
    bookLink: $("book-link").value.trim(),
    totalPages: $("total-pages").value ? Number($("total-pages").value) : "",
    pagesRead: $("pages-read").value ? Number($("pages-read").value) : ""
  };
  if (type === "book" && item.totalPages && item.pagesRead) {
    item.progress = Math.min(100, Math.round(item.pagesRead / item.totalPages * 100));
  }
  if (existing) items = items.map(x => x.id === id ? item : x);
  else items.push(item);
  save();
  dialog.close();
});

$("close-dialog").addEventListener("click", () => dialog.close());
$("cancel-dialog").addEventListener("click", () => dialog.close());
render();
