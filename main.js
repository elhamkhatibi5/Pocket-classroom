
// ===== Dark Mode Toggle =====
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  themeToggle.innerHTML = document.body.classList.contains('dark-mode')
    ? '<i class="bi bi-brightness-high"></i> Light'
    : '<i class="bi bi-moon-stars"></i> Dark';
});

// ===== DOM Elements =====
const flashcardDisplay = document.getElementById("flashcardDisplay");
const prevCardBtn = document.getElementById("prevCardBtn");
const nextCardBtn = document.getElementById("nextCardBtn");
const flipCardBtn = document.getElementById("flipCardBtn");

const notesList = document.getElementById("notesList");
const learnSelector = document.getElementById("learnSelector");
const quizContainer = document.getElementById("quizContainer");

const flashcardsList = document.getElementById("flashcardsList");
const addFlashcardBtn = document.getElementById("addFlashcardBtn");
const quizList = document.getElementById("quizList");
const addQuestionBtn = document.getElementById("addQuestionBtn");

const capsuleGrid = document.getElementById("capsuleGrid");

const titleInput = document.getElementById("titleInput");
const subjectInput = document.getElementById("subjectInput");
const levelInput = document.getElementById("levelInput");
const descInput = document.getElementById("descInput");
const notesInput = document.getElementById("notesInput");
const saveCapsuleBtn = document.getElementById("saveCapsuleBtn");

const importInput = document.getElementById("importInput");
const exportBtn = document.getElementById("exportBtn");
const newCapsuleBtn = document.getElementById("newCapsuleBtn");

// ===== State =====
let capsules = JSON.parse(localStorage.getItem("capsules")) || [
  {
    title: "Biology Basics",
    subject: "Biology",
    level: "Beginner",
    description: "Learn the foundation of cells, plants, and life forms.",
    notes: ["Cells are the building blocks of life.", "Photosynthesis creates food for plants.", "Energy flows through food chains."],
    flashcards: [{ question: "What is the powerhouse of the cell?", answer: "Mitochondria" }, { question: "What process do plants use to make food?", answer: "Photosynthesis" }],
    quiz: [{ question: "What is the basic unit of life?", options: ["Cell", "Organ", "Tissue"], answer: "Cell" }]
  }
];

let currentCapsule = capsules[0];
let currentCardIndex = 0;
let showingAnswer = false;

// ===== Helper Functions =====
function saveToStorage() {
  localStorage.setItem("capsules", JSON.stringify(capsules));
}

function renderLibrary() {
  capsuleGrid.innerHTML = "";
  capsules.forEach(c => {
    const col = document.createElement("div");
    col.className = "col-md-4";
    col.innerHTML = `
      <div class="card capsule-card shadow-sm">
        <div class="card-body">
          <h5 class="card-title">${c.title}</h5>
          <p class="card-text text-muted">${c.description}</p>
          <span class="badge bg-success">${c.level}</span>
          <div class="mt-3 text-end">
            <button class="btn btn-outline-primary btn-sm learnBtn"><i class="bi bi-play-circle"></i> Learn</button>
            <button class="btn btn-outline-secondary btn-sm editBtn"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-outline-danger btn-sm delBtn"><i class="bi bi-trash"></i></button>
          </div>
        </div>
      </div>
    `;
    capsuleGrid.appendChild(col);

    col.querySelector(".learnBtn").addEventListener("click", () => selectCapsule(c.title));
    col.querySelector(".editBtn").addEventListener("click", () => {
      selectCapsule(c.title);
      window.scrollTo({top: document.getElementById("author").offsetTop-70, behavior: "smooth"});
    });
    col.querySelector(".delBtn").addEventListener("click", () => {
      if(confirm("Delete " + c.title + "?")) {
        capsules = capsules.filter(x => x.title !== c.title);
        saveToStorage();
        renderLibrary();
        updateLearnSelector();
      }
    });
  });
}

function updateLearnSelector() {
  learnSelector.innerHTML = "";
  capsules.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.title;
    opt.innerText = c.title;
    learnSelector.appendChild(opt);
  });
  learnSelector.value = currentCapsule.title;
}

function selectCapsule(title) {
  currentCapsule = capsules.find(c => c.title === title);
  updateAuthorForm();
  updateLearnMode();
}

// ===== Author Form =====
function updateAuthorForm() {
  titleInput.value = currentCapsule.title;
  subjectInput.value = currentCapsule.subject;
  levelInput.value = currentCapsule.level;
  descInput.value = currentCapsule.description;
  notesInput.value = currentCapsule.notes.join("\n");
  populateAuthorFlashcards();
  populateAuthorQuiz();
}

// ===== Learn Mode =====
function updateLearnMode() {
  // Notes
  notesList.innerHTML = "";
  currentCapsule.notes.forEach(note => {
    const li = document.createElement("li");
    li.className = "list-group-item";
    li.innerText = note;
    notesList.appendChild(li);
  });

  // Flashcards reset
  currentCardIndex = 0;
  showingAnswer = false;
  showFlashcard();

  // Quiz
  renderQuiz();
}

function showFlashcard() {
  if (!currentCapsule.flashcards.length) {
    flashcardDisplay.innerText = "No flashcards";
    return;
  }
  const card = currentCapsule.flashcards[currentCardIndex];
  flashcardDisplay.innerText = showingAnswer ? card.answer : card.question;
}

function renderQuiz() {
  if (!currentCapsule.quiz.length) {
    quizContainer.innerHTML = "<p>No quiz questions</p>";
    return;
  }
  const q = currentCapsule.quiz[0];
  quizContainer.innerHTML = `<p><strong>Q1:</strong> ${q.question}</p>`;
  const div = document.createElement("div");
  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "btn btn-outline-primary btn-sm me-2";
    btn.innerText = opt;
    btn.addEventListener("click", () => {
      alert(opt === q.answer ? "✅ Correct!" : "❌ Wrong!");
    });
    div.appendChild(btn);
  });
  quizContainer.appendChild(div);
}

// ===== Author Lists =====
function populateAuthorFlashcards() {
  flashcardsList.innerHTML = "";
  currentCapsule.flashcards.forEach(fc => {
    const div = document.createElement("div");
    div.className = "list-group-item d-flex justify-content-between align-items-center";
    div.innerText = `${fc.question} → ${fc.answer}`;
    flashcardsList.appendChild(div);
  });
}

function populateAuthorQuiz() {
  quizList.innerHTML = "";
  currentCapsule.quiz.forEach(q => {
    const div = document.createElement("div");
    div.className = "list-group-item d-flex justify-content-between align-items-center";
    div.innerText = `${q.question} → ${q.answer}`;
    quizList.appendChild(div);
  });
}

// ===== Events =====
flashcardDisplay.addEventListener("click", () => { showingAnswer = !showingAnswer; showFlashcard(); });
flipCardBtn.addEventListener("click", () => { showingAnswer = !showingAnswer; showFlashcard(); });
prevCardBtn.addEventListener("click", () => {
  currentCardIndex = (currentCardIndex - 1 + currentCapsule.flashcards.length) % currentCapsule.flashcards.length;
  showingAnswer = false;
  showFlashcard();
});
nextCardBtn.addEventListener("click", () => {
  currentCardIndex = (currentCardIndex + 1) % currentCapsule.flashcards.length;
  showingAnswer = false;
  showFlashcard();
});
learnSelector.addEventListener("change", (e) => selectCapsule(e.target.value));

addFlashcardBtn.addEventListener("click", () => {
  const q = prompt("Enter flashcard question:");
  if(!q) return;
  const a = prompt("Enter flashcard answer:");
  if(!a) return;
  currentCapsule.flashcards.push({question:q, answer:a});
  populateAuthorFlashcards();
  updateLearnMode();
  saveToStorage();
});

addQuestionBtn.addEventListener("click", () => {
  const question = prompt("Enter quiz question:");
  if(!question) return;
  const answer = prompt("Enter correct answer:");
  if(!answer) return;
  const opts = prompt("Enter options separated by comma:").split(",");
  currentCapsule.quiz.push({question, answer, options: opts});
  populateAuthorQuiz();
  updateLearnMode();
  saveToStorage();
});

saveCapsuleBtn.addEventListener("click", () => {
  currentCapsule.title = titleInput.value;
  currentCapsule.subject = subjectInput.value;
  currentCapsule.level = levelInput.value;
  currentCapsule.description = descInput.value;
  currentCapsule.notes = notesInput.value.split("\n").filter(n => n.trim() !== "");
  saveToStorage();
  renderLibrary();
  updateLearnSelector();
  alert("Capsule saved!");
});

// New Capsule
newCapsuleBtn.addEventListener("click", () => {
  const newCap = { title:"New Capsule", subject:"", level:"Beginner", description:"", notes:[], flashcards:[], quiz:[] };
  capsules.push(newCap);
  saveToStorage();
  renderLibrary();
  selectCapsule(newCap.title);
});

// Export JSON
exportBtn.addEventListener("click", () => {
  const dataStr = JSON.stringify(capsules, null, 2);
  const blob = new Blob([dataStr], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "capsules.json";
  a.click();
  URL.revokeObjectURL(url);
});

// Import JSON
importInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const imported = JSON.parse(ev.target.result);
      capsules = imported;
      saveToStorage();
      renderLibrary();
      selectCapsule(capsules[0].title);
      alert("Import successful!");
    } catch(err) {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(file);
});

// ===== Initialize =====
renderLibrary();
updateLearnMode();
