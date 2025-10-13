
document.addEventListener("DOMContentLoaded", () => {
  // ===== Shortcuts =====
  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  // ===== State =====
  let capsules = [
    {
      id: crypto.randomUUID(),
      meta: { title: "Biology Basics", subject: "Biology", level: "Beginner", desc: "Foundation of cells, plants, life." },
      notes: ["Cells are building blocks of life.", "Photosynthesis creates food.", "Energy flows in food chains."],
      flashcards: [
        { q: "Basic unit of life?", a: "Cell" },
        { q: "Process creating food in plants?", a: "Photosynthesis" }
      ],
      quiz: [
        { q: "What is the basic unit of life?", options: ["Cell","Organ","Tissue"], correct: "Cell" },
        { q: "Photosynthesis produces?", options: ["Food","Water","Air"], correct: "Food" }
      ]
    }
  ];
  let currentCapsuleId = null;
  let learnIndex = 0;
  let flashcardFlipped = false;

  // ===== DOM Elements =====
  const capsuleGrid = $("#capsuleGrid");
  const newCapsuleBtn = $("#newCapsuleBtn");
  const saveCapsuleBtn = $("#saveCapsuleBtn");
  const addFlashcardBtn = $("#addFlashcardBtn");
  const addQuestionBtn = $("#addQuestionBtn");
  const titleInput = $("#titleInput");
  const subjectInput = $("#subjectInput");
  const levelInput = $("#levelInput");
  const descInput = $("#descInput");
  const notesInput = $("#notesInput");
  const flashcardsList = $("#flashcardsList");
  const quizList = $("#quizList");
  const learnSelector = $("#learnSelector");
  const notesList = $("#notesList");
  const flashcardDisplay = $("#flashcardDisplay");
  const prevCardBtn = $("#prevCardBtn");
  const nextCardBtn = $("#nextCardBtn");
  const flipCardBtn = $("#flipCardBtn");
  const quizContainer = $("#quizContainer");

  // ===== Utils =====
  const saveToStorage = () => localStorage.setItem("capsules", JSON.stringify(capsules));
  const loadFromStorage = () => {
    const data = localStorage.getItem("capsules");
    if(data) capsules = JSON.parse(data);
  }

  // ===== Render Library =====
  function renderLibrary() {
    capsuleGrid.innerHTML = "";
    capsules.forEach(c => {
      const col = document.createElement("div");
      col.className = "col-md-4";
      col.innerHTML = `
        <div class="card capsule-card shadow-sm">
          <div class="card-body">
            <h5 class="card-title">${c.meta.title}</h5>
            <p class="card-text text-muted">${c.meta.desc}</p>
            <span class="badge bg-success">${c.meta.level}</span>
            <div class="mt-3 text-end">
              <button class="btn btn-outline-primary btn-sm learnBtn"><i class="bi bi-play-circle"></i> Learn</button>
              <button class="btn btn-outline-secondary btn-sm editBtn"><i class="bi bi-pencil"></i></button>
              <button class="btn btn-outline-danger btn-sm deleteBtn"><i class="bi bi-trash"></i></button>
            </div>
          </div>
        </div>`;
      capsuleGrid.appendChild(col);

      // Attach Event Listeners
      col.querySelector(".editBtn").addEventListener("click", () => openEditCapsule(c.id));
      col.querySelector(".deleteBtn").addEventListener("click", () => {
        if(confirm("Delete this capsule?")) {
          capsules = capsules.filter(cap => cap.id !== c.id);
          saveToStorage();
          renderLibrary();
          renderLearnSelector();
        }
      });
      col.querySelector(".learnBtn").addEventListener("click", () => {
        learnSelector.value = c.meta.title;
        openLearn(c.id);
        document.querySelector("#learn").scrollIntoView({behavior: "smooth"});
      });
    });
  }

  // ===== Render Learn Selector =====
  function renderLearnSelector() {
    learnSelector.innerHTML = "";
    capsules.forEach(c => {
      const opt = document.createElement("option");
      opt.textContent = c.meta.title;
      learnSelector.appendChild(opt);
    });
  }

  // ===== Open Learn =====
  function openLearn(id) {
    const c = capsules.find(x => x.id === id);
    if(!c) return;
    currentCapsuleId = id;
    learnIndex = 0;
    flashcardFlipped = false;
    // Notes
    notesList.innerHTML = "";
    c.notes.forEach(n => {
      const li = document.createElement("li");
      li.className = "list-group-item";
      li.textContent = n;
      notesList.appendChild(li);
    });
    // Flashcards
    updateFlashcardDisplay();
    // Quiz
    renderQuiz();
  }

  // ===== Flashcard Controls =====
  function updateFlashcardDisplay() {
    const c = capsules.find(x => x.id === currentCapsuleId);
    if(!c || c.flashcards.length===0) {
      flashcardDisplay.textContent = "No Flashcards";
      return;
    }
    const card = c.flashcards[learnIndex];
    flashcardDisplay.textContent = flashcardFlipped ? card.a : card.q;
  }

  prevCardBtn.addEventListener("click", () => {
    const c = capsules.find(x => x.id === currentCapsuleId);
    if(!c) return;
    learnIndex = (learnIndex -1 + c.flashcards.length)%c.flashcards.length;
    flashcardFlipped = false;
    updateFlashcardDisplay();
  });
  nextCardBtn.addEventListener("click", () => {
    const c = capsules.find(x => x.id === currentCapsuleId);
    if(!c) return;
    learnIndex = (learnIndex +1)%c.flashcards.length;
    flashcardFlipped = false;
    updateFlashcardDisplay();
  });
  flipCardBtn.addEventListener("click", () => {
    flashcardFlipped = !flashcardFlipped;
    updateFlashcardDisplay();
  });
  flashcardDisplay.addEventListener("click", () => {
    flashcardFlipped = !flashcardFlipped;
    updateFlashcardDisplay();
  });

  // ===== Quiz =====
  function renderQuiz() {
    const c = capsules.find(x => x.id === currentCapsuleId);
    if(!c) return;
    quizContainer.innerHTML = "";
    c.quiz.forEach((q, idx) => {
      const div = document.createElement("div");
      div.className = "mb-3";
      div.innerHTML = `<p><strong>Q${idx+1}:</strong> ${q.q}</p>`;
      const btnDiv = document.createElement("div");
      q.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.className = "btn btn-outline-primary btn-sm me-2 mb-1";
        btn.textContent = opt;
        btn.addEventListener("click", () => {
          if(opt === q.correct) {
            btn.classList.add("btn-success");
          } else {
            btn.classList.add("btn-danger");
          }
          Array.from(btnDiv.children).forEach(b=>b.disabled=true);
        });
        btnDiv.appendChild(btn);
      });
      div.appendChild(btnDiv);
      quizContainer.appendChild(div);
    });
  }

  // ===== New / Edit Capsule =====
  newCapsuleBtn.addEventListener("click", () => {
    currentCapsuleId = null;
    titleInput.value = "";
    subjectInput.value = "";
    levelInput.value = "Beginner";
    descInput.value = "";
    notesInput.value = "";
    flashcardsList.innerHTML = "";
    quizList.innerHTML = "";
  });

  function openEditCapsule(id) {
    const c = capsules.find(x=>x.id===id);
    if(!c) return;
    currentCapsuleId = id;
    titleInput.value = c.meta.title;
    subjectInput.value = c.meta.subject;
    levelInput.value = c.meta.level;
    descInput.value = c.meta.desc;
    notesInput.value = c.notes.join("\n");
    // Flashcards
    flashcardsList.innerHTML = "";
    c.flashcards.forEach((f, i) => {
      const li = document.createElement("div");
      li.className = "input-group mb-2";
      li.innerHTML = `<input class="form-control form-control-sm flashQ" value="${f.q}" placeholder="Question">
                      <input class="form-control form-control-sm flashA" value="${f.a}" placeholder="Answer">
                      <button class="btn btn-outline-danger btn-sm removeFlash">X</button>`;
      li.querySelector(".removeFlash").addEventListener("click", ()=>li.remove());
      flashcardsList.appendChild(li);
    });
    // Quiz
    quizList.innerHTML = "";
    c.quiz.forEach((q,i)=>{
      const li = document.createElement("div");
      li.className = "input-group mb-2";
      li.innerHTML = `<input class="form-control form-control-sm quizQ" value="${q.q}" placeholder="Question">
                      <input class="form-control form-control-sm quizCorrect" value="${q.correct}" placeholder="Correct answer">
                      <input class="form-control form-control-sm quizOptions" value="${q.options.join(",")}" placeholder="Options comma-separated">
                      <button class="btn btn-outline-danger btn-sm removeQuiz">X</button>`;
      li.querySelector(".removeQuiz").addEventListener("click", ()=>li.remove());
      quizList.appendChild(li);
    });
  }

  addFlashcardBtn.addEventListener("click", () => {
    const li = document.createElement("div");
    li.className = "input-group mb-2";
    li.innerHTML = `<input class="form-control form-control-sm flashQ" placeholder="Question">
                    <input class="form-control form-control-sm flashA" placeholder="Answer">
                    <button class="btn btn-outline-danger btn-sm removeFlash">X</button>`;
    li.querySelector(".removeFlash").addEventListener("click", ()=>li.remove());
    flashcardsList.appendChild(li);
  });

  addQuestionBtn.addEventListener("click", () => {
    const li = document.createElement("div");
    li.className = "input-group mb-2";
    li.innerHTML = `<input class="form-control form-control-sm quizQ" placeholder="Question">
                    <input class="form-control form-control-sm quizCorrect" placeholder="Correct answer">
                    <input class="form-control form-control-sm quizOptions" placeholder="Options comma-separated">
                    <button class="btn btn-outline-danger btn-sm removeQuiz">X</button>`;
    li.querySelector(".removeQuiz").addEventListener("click", ()=>li.remove());
    quizList.appendChild(li);
  });

  // ===== Save Capsule =====
  saveCapsuleBtn.addEventListener("click", () => {
    const meta = {
      title: titleInput.value.trim(),
      subject: subjectInput.value.trim(),
      level: levelInput.value,
      desc: descInput.value.trim()
    };
    const notes = notesInput.value.split("\n").filter(n=>n.trim()!=="");
    const flashcards = Array.from($$(".flashQ")).map((el,i)=>({q:el.value,a:$$(".flashA")[i].value}));
    const quiz = Array.from($$(".quizQ")).map((el,i)=>({
      q: el.value,
      correct: $$(".quizCorrect")[i].value,
      options: $$(".quizOptions")[i].value.split(",").map(x=>x.trim())
    }));

    if(currentCapsuleId){
      // Edit
      const c = capsules.find(x=>x.id===currentCapsuleId);
      c.meta = meta;
      c.notes = notes;
      c.flashcards = flashcards;
      c.quiz = quiz;
    } else {
      // New
      capsules.push({id: crypto.randomUUID(), meta, notes, flashcards, quiz});
    }

    saveToStorage();
    renderLibrary();
    renderLearnSelector();
    alert("Capsule saved successfully!");
  });

  // ===== Learn Selector Change =====
  learnSelector.addEventListener("change", () => {
    const title = learnSelector.value;
    const c = capsules.find(x=>x.meta.title===title);
    if(c) openLearn(c.id);
  });

  // ===== Initial Load =====
  loadFromStorage();
  renderLibrary();
  renderLearnSelector();
  if(capsules.length>0) openLearn(capsules[0].id);
});
