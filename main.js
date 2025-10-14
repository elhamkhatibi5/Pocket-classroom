
document.addEventListener("DOMContentLoaded", () => {
  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  // ===== Load Capsules =====
  let storedCapsules = JSON.parse(localStorage.getItem("capsules"));
  if(!storedCapsules || storedCapsules.length === 0){
    // Add sample capsules if empty
    storedCapsules = [
      {
        id: crypto.randomUUID(),
        meta: { title: "Biology Basics", subject: "Biology", level: "Beginner", desc: "Intro to cells and life." },
        notes: ["Cells are the basic unit of life.", "DNA contains genetic info.", "Photosynthesis occurs in chloroplasts."],
        flashcards: [
          { question: "Powerhouse of the cell?", options: ["Nucleus","Mitochondria","Ribosome"], answer: "Mitochondria" },
          { question: "Which organelle contains DNA?", options: ["Nucleus","Mitochondria","Lysosome"], answer: "Nucleus" }
        ],
        quiz: [
          { question: "Photosynthesis occurs in?", options: ["Chloroplast","Mitochondria","Nucleus"], answer: "Chloroplast" }
        ]
      },
      {
        id: crypto.randomUUID(),
        meta: { title: "Basic Algebra", subject: "Math", level: "Beginner", desc: "Intro to algebra expressions." },
        notes: ["Variables represent unknowns.", "Equations balance both sides.", "Simplify expressions to combine like terms."],
        flashcards: [
          { question: "Solve x+5=12. x=?", options: ["5","7","12"], answer: "7" },
          { question: "Simplify 2x + 3x", options: ["5x","6x","x"], answer: "5x" }
        ],
        quiz: [
          { question: "2(x+3) = ?", options: ["2x+3","2x+6","x+6"], answer: "2x+6" }
        ]
      }
    ];
    localStorage.setItem("capsules", JSON.stringify(storedCapsules));
  }

  let capsules = storedCapsules;
  let currentCapsuleId = null;
  let currentFlashIndex = 0;
  let flashSide = "front";

  // ===== Elements =====
  const capsuleGrid = $("#capsuleGrid");
  const newCapsuleBtn = $("#newCapsuleBtn");
  const saveCapsuleBtn = $("#saveCapsuleBtn");
  const searchCapsule = $("#searchCapsule");
  const importInput = $("#importInput");
  const exportBtn = $("#exportBtn");

  const titleInput = $("#titleInput");
  const subjectInput = $("#subjectInput");
  const levelInput = $("#levelInput");
  const descInput = $("#descInput");

  const notesInput = $("#notesInput");
  const flashcardsList = $("#flashcardsList");
  const addFlashcardBtn = $("#addFlashcardBtn");

  const quizList = $("#quizList");
  const addQuestionBtn = $("#addQuestionBtn");

  const learnSelector = $("#learnSelector");
  const notesList = $("#notesList");
  const flashcardDisplay = $("#flashcardDisplay");
  const prevCardBtn = $("#prevCardBtn");
  const flipCardBtn = $("#flipCardBtn");
  const nextCardBtn = $("#nextCardBtn");
  const quizContainer = $("#quizContainer");

  // ===== Helpers =====
  function saveToStorage() {
    localStorage.setItem("capsules", JSON.stringify(capsules));
  }

  function clearAuthorForm() {
    currentCapsuleId = null;
    titleInput.value = "";
    subjectInput.value = "";
    levelInput.value = "Beginner";
    descInput.value = "";
    notesInput.value = "";
    flashcardsList.innerHTML = "";
    quizList.innerHTML = "";
  }

  function renderLibrary(filter = "") {
    capsuleGrid.innerHTML = "";
    const filtered = capsules.filter(c => c.meta.title.toLowerCase().includes(filter.toLowerCase()));
    if (filtered.length === 0) {
      capsuleGrid.innerHTML = `<p class="text-muted">No capsules found.</p>`;
      return;
    }
    filtered.forEach(c => {
      const col = document.createElement("div");
      col.className = "col-md-4";
      col.innerHTML = `
        <div class="card shadow-sm h-100">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${c.meta.title}</h5>
            <p class="card-text mb-1"><strong>Subject:</strong> ${c.meta.subject}</p>
            <p class="card-text mb-1"><strong>Level:</strong> ${c.meta.level}</p>
            <p class="card-text text-truncate">${c.meta.desc}</p>
            <div class="mt-auto d-flex justify-content-between">
              <button class="btn btn-sm btn-primary view-btn"><i class="bi bi-eye"></i> Learn</button>
              <button class="btn btn-sm btn-warning edit-btn"><i class="bi bi-pencil-square"></i> Edit</button>
              <button class="btn btn-sm btn-danger del-btn"><i class="bi bi-trash"></i> Delete</button>
            </div>
          </div>
        </div>
      `;
      col.querySelector(".view-btn").addEventListener("click", () => selectLearn(c.id));
      col.querySelector(".edit-btn").addEventListener("click", () => loadCapsuleToAuthor(c.id));
      col.querySelector(".del-btn").addEventListener("click", () => {
        if (confirm("Delete this capsule?")) {
          capsules = capsules.filter(x => x.id !== c.id);
          saveToStorage();
          renderLibrary(searchCapsule.value);
          renderLearnSelector();
        }
      });
      capsuleGrid.appendChild(col);
    });
  }

  function renderLearnSelector() {
    learnSelector.innerHTML = `<option value="">Select Capsule</option>`;
    capsules.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.meta.title;
      learnSelector.appendChild(opt);
    });
  }

  function selectLearn(id) {
    learnSelector.value = id;
    renderLearn(id);
  }

  function renderLearn(id) {
    const c = capsules.find(c => c.id === id);
    if (!c) return;
    currentCapsuleId = id;

    // Notes
    notesList.innerHTML = "";
    c.notes.forEach(n => {
      const li = document.createElement("li");
      li.className = "list-group-item";
      li.textContent = n;
      notesList.appendChild(li);
    });

    // Flashcards
    currentFlashIndex = 0;
    flashSide = "front";
    renderFlashcard();

    // Quiz
    renderQuiz(c.quiz);
  }

  function renderFlashcard() {
    if (!currentCapsuleId) return;
    const c = capsules.find(c => c.id === currentCapsuleId);
    if (c.flashcards.length === 0) {
      flashcardDisplay.textContent = "No flashcards";
      return;
    }
    const f = c.flashcards[currentFlashIndex];
    flashcardDisplay.textContent = flashSide === "front" ? f.question : f.answer;
  }

  function nextFlash() {
    if (!currentCapsuleId) return;
    const c = capsules.find(c => c.id === currentCapsuleId);
    if (c.flashcards.length === 0) return;
    currentFlashIndex = (currentFlashIndex + 1) % c.flashcards.length;
    flashSide = "front";
    renderFlashcard();
  }

  function prevFlash() {
    if (!currentCapsuleId) return;
    const c = capsules.find(c => c.id === currentCapsuleId);
    if (c.flashcards.length === 0) return;
    currentFlashIndex = (currentFlashIndex -1 + c.flashcards.length) % c.flashcards.length;
    flashSide = "front";
    renderFlashcard();
  }

  function flipFlash() {
    flashSide = flashSide === "front" ? "back" : "front";
    renderFlashcard();
  }

  // ===== Initial Render =====
  renderLibrary();
  renderLearnSelector();
});
