
document.addEventListener("DOMContentLoaded", () => {
  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  let capsules = JSON.parse(localStorage.getItem("capsules")) || [
    {
      id: crypto.randomUUID(),
      meta: { title: "Biology Basics", subject: "Biology", level: "Beginner", desc: "Introduction to cells and life." },
      notes: ["Cells are the basic unit of life.", "DNA contains genetic information.", "Photosynthesis occurs in chloroplasts."],
      flashcards: [
        { question: "What is the powerhouse of the cell?", options: ["Nucleus","Mitochondria","Ribosome"], answer: "Mitochondria" },
        { question: "Which organelle contains DNA?", options: ["Nucleus","Mitochondria","Lysosome"], answer: "Nucleus" }
      ],
      quiz: [
        { question: "Photosynthesis occurs in?", options: ["Chloroplast","Mitochondria","Nucleus"], answer: "Chloroplast" }
      ]
    },
    {
      id: crypto.randomUUID(),
      meta: { title: "Basic Algebra", subject: "Math", level: "Beginner", desc: "Introduction to algebraic expressions." },
      notes: ["Variables represent unknown values.", "Equations balance both sides.", "Simplify expressions to combine like terms."],
      flashcards: [
        { question: "Solve x + 5 = 12. x = ?", options: ["5","7","12"], answer: "7" },
        { question: "Simplify 2x + 3x", options: ["5x","6x","x"], answer: "5x" }
      ],
      quiz: [
        { question: "2(x + 3) = ?", options: ["2x + 3","2x + 6","x + 6"], answer: "2x + 6" }
      ]
    },
    {
      id: crypto.randomUUID(),
      meta: { title: "World History", subject: "History", level: "Intermediate", desc: "Key events of the 20th century." },
      notes: ["WWI began in 1914.", "The Great Depression started in 1929.", "WWII ended in 1945."],
      flashcards: [
        { question: "When did WWI start?", options: ["1914","1918","1939"], answer: "1914" },
        { question: "When did WWII end?", options: ["1945","1939","1918"], answer: "1945" }
      ],
      quiz: [
        { question: "The Great Depression began in?", options: ["1929","1914","1945"], answer: "1929" }
      ]
    }
  ];

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

  function loadCapsuleToAuthor(id) {
    const c = capsules.find(c => c.id === id);
    if (!c) return;
    currentCapsuleId = id;
    titleInput.value = c.meta.title;
    subjectInput.value = c.meta.subject;
    levelInput.value = c.meta.level;
    descInput.value = c.meta.desc;
    notesInput.value = c.notes.join("\n");
    renderFlashcardsList(c.flashcards);
    renderQuizList(c.quiz);
  }

  function renderFlashcardsList(flashcards) {
    flashcardsList.innerHTML = "";
    flashcards.forEach((f, idx) => {
      const item = document.createElement("div");
      item.className = "list-group-item d-flex justify-content-between align-items-start";
      item.innerHTML = `
        <div>
          <strong>Q:</strong> ${f.question} <br>
          <strong>Options:</strong> ${f.options.join(", ")} | <strong>Answer:</strong> ${f.answer}
        </div>
        <div class="btn-group btn-group-sm">
          <button class="btn btn-warning edit-flash">Edit</button>
          <button class="btn btn-danger del-flash">Del</button>
        </div>
      `;
      item.querySelector(".edit-flash").addEventListener("click", () => editFlashcard(idx));
      item.querySelector(".del-flash").addEventListener("click", () => {
        capsules.find(c => c.id === currentCapsuleId).flashcards.splice(idx, 1);
        saveToStorage();
        renderFlashcardsList(capsules.find(c => c.id === currentCapsuleId).flashcards);
      });
      flashcardsList.appendChild(item);
    });
  }

  function renderQuizList(quiz) {
    quizList.innerHTML = "";
    quiz.forEach((q, idx) => {
      const item = document.createElement("div");
      item.className = "list-group-item d-flex justify-content-between align-items-start";
      item.innerHTML = `
        <div>
          <strong>Q:</strong> ${q.question} <br>
          <strong>Options:</strong> ${q.options.join(", ")} | <strong>Answer:</strong> ${q.answer}
        </div>
        <div class="btn-group btn-group-sm">
          <button class="btn btn-warning edit-quiz">Edit</button>
          <button class="btn btn-danger del-quiz">Del</button>
        </div>
      `;
      item.querySelector(".edit-quiz").addEventListener("click", () => editQuiz(idx));
      item.querySelector(".del-quiz").addEventListener("click", () => {
        capsules.find(c => c.id === currentCapsuleId).quiz.splice(idx, 1);
        saveToStorage();
        renderQuizList(capsules.find(c => c.id === currentCapsuleId).quiz);
      });
      quizList.appendChild(item);
    });
  }

  function addFlashcard() {
    if (!currentCapsuleId) {
      alert("Save capsule first!");
      return;
    }
    const question = prompt("Enter flashcard question:");
    if (!question) return;
    const options = prompt("Enter options separated by comma:").split(",").map(s=>s.trim());
    if (options.length < 2) return alert("Need at least 2 options!");
    const answer = prompt(`Enter correct answer (must match one of options):`);
    if (!options.includes(answer)) return alert("Answer must be one of options!");
    const flashcard = { question, options, answer };
    capsules.find(c => c.id === currentCapsuleId).flashcards.push(flashcard);
    saveToStorage();
    renderFlashcardsList(capsules.find(c => c.id === currentCapsuleId).flashcards);
  }

  function editFlashcard(idx) {
    const c = capsules.find(c => c.id === currentCapsuleId);
    const f = c.flashcards[idx];
    const question = prompt("Edit question:", f.question);
    if (!question) return;
    const options = prompt("Edit options (comma separated):", f.options.join(",")).split(",").map(s=>s.trim());
    if (options.length < 2) return alert("Need at least 2 options!");
    const answer = prompt("Edit correct answer:", f.answer);
    if (!options.includes(answer)) return alert("Answer must be one of options!");
    c.flashcards[idx] = { question, options, answer };
    saveToStorage();
    renderFlashcardsList(c.flashcards);
  }

  function addQuiz() {
    if (!currentCapsuleId) {
      alert("Save capsule first!");
      return;
    }
    const question = prompt("Enter quiz question:");
    if (!question) return;
    const options = prompt("Enter options separated by comma:").split(",").map(s=>s.trim());
    if (options.length < 2) return alert("Need at least 2 options!");
    const answer = prompt(`Enter correct answer (must match one of options):`);
    if (!options.includes(answer)) return alert("Answer must be one of options!");
    const quizItem = { question, options, answer };
    capsules.find(c => c.id === currentCapsuleId).quiz.push(quizItem);
    saveToStorage();
    renderQuizList(capsules.find(c => c.id === currentCapsuleId).quiz);
  }

  function editQuiz(idx) {
    const c = capsules.find(c => c.id === currentCapsuleId);
    const q = c.quiz[idx];
    const question = prompt("Edit question:", q.question);
    if (!question) return;
    const options = prompt("Edit options (comma separated):", q.options.join(",")).split(",").map(s=>s.trim());
    if (options.length < 2) return alert("Need at least 2 options!");
    const answer = prompt("Edit correct answer:", q.answer);
    if (!options.includes(answer)) return alert("Answer must be one of options!");
    c.quiz[idx] = { question, options, answer };
    saveToStorage();
    renderQuizList(c.quiz);
  }

  function saveCapsule() {
    const meta = {
      title: titleInput.value.trim(),
      subject: subjectInput.value.trim(),
      level: levelInput.value,
      desc: descInput.value.trim()
    };
    const notes = notesInput.value.split("\n").filter(n => n.trim() !== "");
    if (!meta.title) return alert("Title required!");

    if (currentCapsuleId) {
      const c = capsules.find(c => c.id === currentCapsuleId);
      c.meta = meta;
      c.notes = notes;
    } else {
      const id = crypto.randomUUID();
      capsules.push({
        id,
        meta,
        notes,
        flashcards: [],
        quiz: []
      });
      currentCapsuleId = id;
    }
    saveToStorage();
    renderLibrary(searchCapsule.value);
    renderLearnSelector();
    alert("Capsule saved!");
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

  function renderQuiz(quiz) {
    quizContainer.innerHTML = "";
    if (quiz.length === 0) {
      quizContainer.textContent = "No quiz questions";
      return;
    }
    quiz.forEach((q, idx) => {
      const card = document.createElement("div");
      card.className = "card mb-2 p-2";
      card.innerHTML = `<strong>${q.question}</strong>`;
      q.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.className = "btn btn-sm btn-outline-primary m-1";
        btn.textContent = opt;
        btn.addEventListener("click", () => {
          if (opt === q.answer) {
            btn.classList.remove("btn-outline-primary");
            btn.classList.add("btn-success");
          } else {
            btn.classList.remove("btn-outline-primary");
            btn.classList.add("btn-danger");
          }
        });
        card.appendChild(btn);
      });
      quizContainer.appendChild(card);
    });
  }

  // ===== Events =====
  newCapsuleBtn.addEventListener("click", clearAuthorForm);
  saveCapsuleBtn.addEventListener("click", saveCapsule);
  searchCapsule.addEventListener("input", () => renderLibrary(searchCapsule.value));
  addFlashcardBtn.addEventListener("click", addFlashcard);
  addQuestionBtn.addEventListener("click", addQuiz);

  prevCardBtn.addEventListener("click", prevFlash);
  nextCardBtn.addEventListener("click", nextFlash);
  flipCardBtn.addEventListener("click", flipFlash);

  exportBtn.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(capsules, null, 2)], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "capsules.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  importInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        if (Array.isArray(imported)) {
          capsules = imported;
          saveToStorage();
          renderLibrary(searchCapsule.value);
          renderLearnSelector();
          alert("Import successful!");
        } else alert("Invalid JSON!");
      } catch(err) {
        alert("Error parsing JSON!");
      }
    };
    reader.readAsText(file);
  });

  // ===== Init =====
  saveToStorage();
  renderLibrary();
  renderLearnSelector();
});
