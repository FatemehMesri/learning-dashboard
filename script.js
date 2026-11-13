/*
  PUBLIC LEARNING DASHBOARD
  To update your learning records, edit the arrays below in this file
  through your GitHub repository, then commit the changes.

  Progress values must be numbers from 0 to 100.
  Keep URLs as complete https:// links.
*/

const courses = [
  // Example:
  // {
  //   title: "Introduction to Example Subject",
  //   provider: "Example Learning Platform",
  //   instructor: "Instructor Name",
  //   url: "https://example.com/course",
  //   description: "A short one-line description of the course.",
  //   startDate: "2026-10-01",
  //   targetDate: "2026-12-01",
  //   progress: 35
  // }
];

const books = [
  // Example:
  // {
  //   title: "Example Book Title",
  //   author: "Author Name",
  //   publisher: "Publisher Name",
  //   url: "https://example.com/book",
  //   description: "A short note about what this book covers.",
  //   startDate: "2026-10-01",
  //   targetDate: "2026-12-01",
  //   pagesRead: 80,
  //   totalPages: 240
  // }
];

const safePercent = (value) => Math.max(0, Math.min(100, Number(value) || 0));
const formatDate = (value) => {
  if (!value) return "Not specified";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en", {
    year: "numeric", month: "short", day: "numeric"
  }).format(date);
};
const escapeHTML = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[char]));
const safeURL = (value = "") => {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : "";
  } catch { return ""; }
};

function courseCard(course) {
  const progress = safePercent(course.progress);
  const url = safeURL(course.url);
  return `
    <article class="learning-card">
      <div class="card-top">
        <div><h3>${escapeHTML(course.title)}</h3><p class="provider">${escapeHTML(course.provider || "Provider not specified")}</p></div>
        <span class="percent">${progress}%</span>
      </div>
      <p class="description">${escapeHTML(course.description || "")}</p>
      <div class="meta-grid">
        <div class="meta-item">Instructor<strong>${escapeHTML(course.instructor || "Not specified")}</strong></div>
        <div class="meta-item">Time remaining<strong>${100 - progress}%</strong></div>
        <div class="meta-item">Start date<strong>${formatDate(course.startDate)}</strong></div>
        <div class="meta-item">Target completion<strong>${formatDate(course.targetDate)}</strong></div>
      </div>
      <div class="card-progress-label"><span>Course progress</span><span>${progress}% complete</span></div>
      <div class="progress-track"><span style="width:${progress}%"></span></div>
      ${url ? `<a class="course-link" href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">Visit course website ↗</a>` : ""}
    </article>`;
}

function bookCard(book) {
  const total = Math.max(0, Number(book.totalPages) || 0);
  const read = Math.max(0, Number(book.pagesRead) || 0);
  const progress = total > 0 ? safePercent((read / total) * 100) : 0;
  const url = safeURL(book.url);
  return `
    <article class="learning-card">
      <div class="card-top">
        <div><h3>${escapeHTML(book.title)}</h3><p class="provider">${escapeHTML(book.author || "Author not specified")}</p></div>
        <span class="percent">${Math.round(progress)}%</span>
      </div>
      <p class="description">${escapeHTML(book.description || "")}</p>
      <div class="meta-grid">
        <div class="meta-item">Publisher<strong>${escapeHTML(book.publisher || "Not specified")}</strong></div>
        <div class="meta-item">Pages read<strong>${read} / ${total || "?"}</strong></div>
        <div class="meta-item">Start date<strong>${formatDate(book.startDate)}</strong></div>
        <div class="meta-item">Target completion<strong>${formatDate(book.targetDate)}</strong></div>
      </div>
      <div class="card-progress-label"><span>Reading progress</span><span>${Math.round(progress)}% complete</span></div>
      <div class="progress-track"><span style="width:${progress}%"></span></div>
      ${url ? `<a class="course-link" href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">Book information ↗</a>` : ""}
    </article>`;
}

function renderDashboard() {
  const activeCourses = courses.filter(item => safePercent(item.progress) < 100);
  const activeBooks = books.filter(item => {
    const total = Number(item.totalPages) || 0;
    return total <= 0 || Number(item.pagesRead || 0) < total;
  });
  const completedCourses = courses.filter(item => safePercent(item.progress) >= 100);
  const completedBooks = books.filter(item => Number(item.totalPages) > 0 && Number(item.pagesRead || 0) >= Number(item.totalPages));

  const allProgress = [
    ...courses.map(item => safePercent(item.progress)),
    ...books.map(item => Number(item.totalPages) > 0 ? safePercent((Number(item.pagesRead || 0) / Number(item.totalPages)) * 100) : 0)
  ];
  const overall = allProgress.length ? Math.round(allProgress.reduce((sum, value) => sum + value, 0) / allProgress.length) : 0;

  document.getElementById("active-course-count").textContent = activeCourses.length;
  document.getElementById("active-book-count").textContent = activeBooks.length;
  document.getElementById("completed-count").textContent = completedCourses.length + completedBooks.length;
  document.getElementById("overall-progress").textContent = `${overall}%`;
  document.getElementById("overall-progress-bar").style.width = `${overall}%`;
  document.getElementById("course-count").textContent = `${courses.length} ${courses.length === 1 ? "course" : "courses"}`;
  document.getElementById("book-count").textContent = `${books.length} ${books.length === 1 ? "book" : "books"}`;

  document.getElementById("course-list").innerHTML = courses.filter(item => safePercent(item.progress) < 100).map(courseCard).join("");
  document.getElementById("book-list").innerHTML = books.filter(item => {
    return !(Number(item.totalPages) > 0 && Number(item.pagesRead || 0) >= Number(item.totalPages));
  }).map(bookCard).join("");

  document.getElementById("courses-empty").hidden = courses.some(item => safePercent(item.progress) < 100);
  document.getElementById("books-empty").hidden = books.some(item => !(Number(item.totalPages) > 0 && Number(item.pagesRead || 0) >= Number(item.totalPages)));

  const completedItems = [
    ...completedCourses.map(item => ({ title: item.title, type: "Course" })),
    ...completedBooks.map(item => ({ title: item.title, type: "Book" }))
  ];
  document.getElementById("completed-list").innerHTML = completedItems.map(item => `
    <div class="completed-item"><strong>${escapeHTML(item.title)}</strong><span>${item.type} · Completed</span></div>
  `).join("");
  document.getElementById("completed-empty").hidden = completedItems.length > 0;
}

renderDashboard();
