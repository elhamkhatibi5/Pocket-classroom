
document.addEventListener("DOMContentLoaded", () => {
  // ===== SHORTCUTS =====
  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  // ===== DOM ELEMENTS =====
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
  const exportBtn = $("#exportBtn");
  const importInput = $("#importInput");

  // ===== STATE =====
  let capsules = JSON.parse(localStorage.getItem("capsules")) || [
    {
      id: crypto.randomUUID(),
      meta: { title: "Biology Basics", subject: "Biology", level: "Beginner", desc: "Learn the foundation of cells, plants, and life forms." },
      notes: ["Cells are the building blocks of life.", "Photosynthesis creates food for plants.", "Energy flows through food chains."],
      flashcards: [
        { q: "What is the powerhouse of the cell?", a: "Mitochondria" },
        { q: "What process do plants use to make food?", a: "Photosynthesis" }
      ],
      quiz: [
        { q: "What is the basic unit of life?", options: ["Cell","Organ","Tissue"], correct: "Cell" }
      ]
    }
  ];
  let currentCapsuleId = capsules[0].id;
  let flashIndex = 0;
  let flashFlipped = false;

  // ===== UTILS =====
  const save = () => localStorage.setItem("capsules", JSON.stringify(capsules));
  const findCapsule = id => capsules.find(c => c.id === id);

  // ===== RENDER LIBRARY =====
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

      col.querySelector(".editBtn").addEventListener("click", () => openEdit(c.id));
      col.querySelector(".deleteBtn").addEventListener("click", () => {
        if(confirm("Delete this capsule?")) {
          capsules = capsules.filter(cap => cap.id !== c.id);
          save();
          renderLibrary();
          renderSelector();
        }
      });
      col.querySelector(".learnBtn").addEventListener("click", () => {
        learnSelector.value = c.meta.title;
        openLearn(c.id);
        document.querySelector("#learn").scrollIntoView({behavior:"smooth"});
      });
    });
  }

  // ===== RENDER LEARN SELECTOR =====
  function renderSelector() {
    learnSelector.innerHTML = "";
    capsules.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.meta.title;
      learnSelector.appendChild(opt);
    });
  }

  // ===== LEARN MODE =====
  function openLearn(id) {
    const c = findCapsule(id);
    if(!c) return;
    currentCapsuleId = id;
    flashIndex = 0;
    flashFlipped = false;

    // Notes
    notesList.innerHTML = "";
    c.notes.forEach(n => {
      const li = document.createElement("li");
      li.className = "list-group-item";
      li.textContent = n;
      notesList.appendChild(li);
    });

    // Flashcards
    updateFlashcard();

    // Quiz
    renderQuiz();
  }

  function updateFlashcard() {
    const c = findCapsule(currentCapsuleId);
    if(!c || c.flashcards.length === 0) {
      flashcardDisplay.textContent = "No Flashcards";
      return;
    }
    const card = c.flashcards[flashIndex];
    flashcardDisplay.textContent = flashFlipped ? card.a : card.q;
  }

  prevCardBtn.addEventListener("click", () => {
    const c = findCapsule(currentCapsuleId);
    if(!c) return;
    flashIndex = (flashIndex - 1 + c.flashcards.length) % c.flashcards.length;
    flashFlipped = false;
    updateFlashcard();
  });

  nextCardBtn.addEventListener("click", () => {
    const c = findCapsule(currentCapsuleId);
    if(!c) return;
    flashIndex = (flashIndex + 1) % c.flashcards.length;
    flashFlipped = false;
    updateFlashcard();
  });

  flipCardBtn.addEventListener("click", () => {
    flashFlipped = !flashFlipped;
    updateFlashcard();
  });
  flashcardDisplay.addEventListener("click", () => {
    flashFlipped = !flashFlipped;
    updateFlashcard();
  });

  function renderQuiz() {
    const c = findCapsule(currentCapsuleId);
    if(!c) return;
    quizContainer.innerHTML = "";
    c.quiz.forEach((q, idx) => {
      const div = document.createElement("div");
      div.className = "mb-2";
      div.innerHTML = `<p><strong>Q${idx+1}:</strong> ${q.q}</p>`;
      const btnDiv = document.createElement("div");
      q.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.className = "btn btn-outline-primary btn-sm me-2 mb-1";
        btn.textContent = opt;
        btn.addEventListener("click", () => {
          if(opt === q.correct) btn.classList.replace("btn-outline-primary","btn-success");
          else btn.classList.replace("btn-outline-primary","btn-danger");
          Array.from(btnDiv.children).forEach(b=>b.disabled=true);
        });
        btnDiv.appendChild(btn);
      });
      div.appendChild(btnDiv);
      quizContainer.appendChild(div);
    });
  }

  // ===== AUTHOR MODE =====
  function openEdit(id) {
    const c = findCapsule(id);
    if(!c) return;
    currentCapsuleId = id;

    titleInput.value = c.meta.title;
    subjectInput.value = c.meta.subject;
    levelInput.value = c.meta.level;
    descInput.value = c.meta.desc;
    notesInput.value = c.notes.join("\n");

    // Flashcards
    flashcardsList.innerHTML = "";
    c.flashcards.forEach(f=>{
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
    c.quiz.forEach(q=>{
      const li = document.createElement("div");
      li.className = "input-group mb-2";
      li.innerHTML = `<input class="form-control form-control-sm quizQ" value="${q.q}" placeholder="Question">
                      <input class="form-control form-control-sm quizCorrect" value="${q.correct}" placeholder="Correct">
                      <input class="form-control form-control-sm quizOptions" value="${q.options.join(",")}" placeholder="Options comma-separated">
                      <button class="btn btn-outline-danger btn-sm removeQuiz">X</button>`;
      li.querySelector(".removeQuiz").addEventListener("click", ()=>li.remove());
      quizList.appendChild(li);
    });
    window.scrollTo({top: document.getElementById("author").offsetTop-70, behavior: "smooth"});
  }

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
      const c = findCapsule(currentCapsuleId);
      c.meta = meta;
      c.notes = notes;
      c.flashcards = flashcards;
      c.quiz = quiz;
    } else {
      capsules.push({id: crypto.randomUUID(), meta, notes, flashcards, quiz});
    }

    save();
    renderLibrary();
    renderSelector();
    alert("Capsule saved successfully!");
  });

  learnSelector.addEventListener("change", e => openLearn(e.target.value));

  // ===== EXPORT/IMPORT =====
  exportBtn.addEventListener("click", () => {
    const dataStr = JSON.stringify(capsules,null,2);
    const blob = new Blob([dataStr],{type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "capsules.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  importInput.addEventListener("change", (e)=>{
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try{
        capsules = JSON.parse(reader.result);
        save();
        renderLibrary();
        renderSelector();
        if(capsules.length>0) openLearn(capsules[0].id);
      }catch(err){alert("Invalid JSON");}
    };
    reader.readAsText(file);
  });

  // ===== INITIALIZE =====
  renderLibrary();
  renderSelector();
  if(capsules.length>0) openLearn(capsules[0].id);
});
