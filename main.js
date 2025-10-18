
// ===============================
// Pocket Classroom - Main Script
// ===============================

// Section references
const librarySection = document.getElementById("library");
const authorSection = document.getElementById("author");
const learnSection = document.getElementById("learn");

// Navbar links
const navLinks = document.querySelectorAll(".nav-link");

// Theme toggle button
const themeToggle = document.getElementById("themeToggle");
const body = document.body;

// Capsule storage
let capsules = JSON.parse(localStorage.getItem("pc_capsules")) || [];
let currentCapsule = null;

// ====== SECTION HANDLING ======
function showSection(section) {
  [librarySection, authorSection, learnSection].forEach(s => s.style.display = "none");
  section.style.display = "block";
}

navLinks.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const target = link.getAttribute("href");
    if (target === "#library") showSection(librarySection);
    if (target === "#author") showSection(authorSection);
    if (target === "#learn") showSection(learnSection);
  });
});

// ====== THEME HANDLING ======
function loadTheme() {
  const saved = localStorage.getItem("pc_theme") || "light-mode";
  body.className = saved;
  updateThemeButton();
}

function toggleTheme() {
  if (body.classList.contains("light-mode")) {
    body.className = "dark-mode";
  } else {
    body.className = "light-mode";
  }
  localStorage.setItem("pc_theme", body.className);
  updateThemeButton();
}

function updateThemeButton() {
  themeToggle.innerHTML = body.classList.contains("light-mode")
    ? '<i class="bi bi-moon-stars"></i> Dark'
    : '<i class="bi bi-sun"></i> Light';
}

themeToggle.addEventListener("click", toggleTheme);

// ====== CAPSULE MANAGEMENT ======
function saveCapsules() {
  localStorage.setItem("pc_capsules", JSON.stringify(capsules));
  renderLibrary();
}

// ====== LIBRARY VIEW ======
function renderLibrary() {
  const container = document.getElementById("capsuleList");
  if (!container) return;
  container.innerHTML = "";

  if (capsules.length === 0) {
    container.innerHTML = '<p class="text-muted">No capsules yet. Create one in Author tab!</p>';
    return;
  }

  capsules.forEach((cap, index) => {
    const card = document.createElement("div");
    card.className = "card mb-3 shadow-sm";
    card.innerHTML = `
      <div class="card-body">
        <h5 class="card-title">${cap.title}</h5>
        <p class="card-text small text-secondary">${cap.subject} | ${cap.level}</p>
        <p class="card-text">${cap.description}</p>
        <div class="d-flex justify-content-between">
          <button class="btn btn-outline-primary btn-sm" onclick="editCapsule(${index})">Edit</button>
          <button class="btn btn-outline-success btn-sm" onclick="learnCapsule(${index})">Learn</button>
          <i class="bi bi-heart like-btn" role="button" title="Like"></i>
        </div>
      </div>`;
    container.appendChild(card);
  });
}

// ====== AUTHOR ======
function editCapsule(index) {
  currentCapsule = capsules[index];
  showSection(authorSection);

  document.getElementById("capsuleTitle").value = currentCapsule.title;
  document.getElementById("capsuleSubject").value = currentCapsule.subject;
  document.getElementById("capsuleLevel").value = currentCapsule.level;
  document.getElementById("capsuleDescription").value = currentCapsule.description;

  renderFlashcards();
  renderQuiz();
}

function newCapsule() {
  currentCapsule = {
    title: "",
    subject: "",
    level: "Beginner",
    description: "",
    notes: "",
    flashcards: [],
    quiz: []
  };
  showSection(authorSection);
  document.getElementById("authorForm").reset();
  renderFlashcards();
  renderQuiz();
}

function saveCapsule() {
  if (!currentCapsule) return;

  currentCapsule.title = document.getElementById("capsuleTitle").value;
  currentCapsule.subject = document.getElementById("capsuleSubject").value;
  currentCapsule.level = document.getElementById("capsuleLevel").value;
  currentCapsule.description = document.getElementById("capsuleDescription").value;

  const existingIndex = capsules.findIndex(c => c.title === currentCapsule.title);
  if (existingIndex >= 0) capsules[existingIndex] = currentCapsule;
  else capsules.push(currentCapsule);

  saveCapsules();
  alert("Capsule saved!");
}

// ====== FLASHCARDS ======
function renderFlashcards() {
  const list = document.getElementById("flashcardList");
  if (!list) return;
  list.innerHTML = "";

  (currentCapsule.flashcards || []).forEach((fc, i) => {
    list.innerHTML += `
      <div class="card p-2 mb-2">
        <strong>Q:</strong> ${fc.q}<br>
        <strong>A:</strong> ${fc.a}
      </div>`;
  });
}

function addFlashcard() {
  const q = prompt("Enter question:");
  const a = prompt("Enter answer:");
  if (!q || !a) return;
  currentCapsule.flashcards.push({ q, a });
  renderFlashcards();
}

// ====== QUIZ ======
function renderQuiz() {
  const list = document.getElementById("quizList");
  if (!list) return;
  list.innerHTML = "";

  (currentCapsule.quiz || []).forEach((qz, i) => {
    list.innerHTML += `
      <div class="card p-2 mb-2">
        <strong>${qz.q}</strong><br>
        <small>Answer: ${qz.answer}</small>
      </div>`;
  });
}

function addQuiz() {
  const q = prompt("Enter quiz question:");
  const a = prompt("Enter correct answer:");
  if (!q || !a) return;
  currentCapsule.quiz.push({ q, answer: a });
  renderQuiz();
}

// ====== EXPORT / IMPORT ======
function exportCapsules() {
  const blob = new Blob([JSON.stringify(capsules, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "pocket_capsules.json";
  link.click();
}

function importCapsules(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const imported = JSON.parse(e.target.result);
      capsules = imported;
      saveCapsules();
      alert("Capsules imported successfully!");
    } catch (err) {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(file);
}

// ====== LEARN MODE ======
function learnCapsule(index) {
  currentCapsule = capsules[index];
  showSection(learnSection);
  const learnTitle = document.getElementById("learnTitle");
  learnTitle.textContent = currentCapsule.title;

  // show notes, flashcards, quiz
  const learnFlash = document.getElementById("learnFlashcards");
  learnFlash.innerHTML = (currentCapsule.flashcards || [])
    .map(f => `<div class="card p-2 mb-2"><strong>${f.q}</strong><br>${f.a}</div>`)
    .join("");

  const learnQuiz = document.getElementById("learnQuiz");
  learnQuiz.innerHTML = (currentCapsule.quiz || [])
    .map(q => `<div class="card p-2 mb-2"><strong>${q.q}</strong></div>`)
    .join("");
}

// ====== LIKE BUTTON ======
document.addEventListener("click", e => {
  if (e.target.classList.contains("like-btn")) {
    e.target.classList.toggle("text-danger");
    e.target.classList.toggle("bi-heart");
    e.target.classList.toggle("bi-heart-fill");
  }
});

// ====== INITIAL LOAD ======
document.addEventListener("DOMContentLoaded", () => {
  showSection(librarySection);
  loadTheme();
  renderLibrary();

  // Button bindings
  document.getElementById("newCapsuleBtn")?.addEventListener("click", newCapsule);
  document.getElementById("saveCapsuleBtn")?.addEventListener("click", saveCapsule);
  document.getElementById("addFlashcardBtn")?.addEventListener("click", addFlashcard);
  document.getElementById("addQuizBtn")?.addEventListener("click", addQuiz);
  document.getElementById("exportBtn")?.addEventListener("click", exportCapsules);
  document.getElementById("importFile")?.addEventListener("change", importCapsules);
});
