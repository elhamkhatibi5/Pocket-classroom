
// ===== main.js =====

// ===== Shortcuts ===== const $ = s => document.querySelector(s); const $$ = s => document.querySelectorAll(s);

// ===== State ===== let capsules = [ { title: "Biology Basics", subject: "Biology", level: "Beginner", description: "Learn the foundation of cells, plants, and life forms.", notes: [ "Cells are the building blocks of life.", "Photosynthesis creates food for plants.", "Energy flows through food chains." ], flashcards: [ { question: "What is the powerhouse of the cell?", answer: "Mitochondria" }, { question: "What process do plants use to make food?", answer: "Photosynthesis" }, { question: "Cells divide by?", answer: "Mitosis" } ], quiz: [ { question: "What is the basic unit of life?", options: ["Cell", "Organ", "Tissue"], answer: "Cell" }, { question: "Photosynthesis occurs in?", options: ["Mitochondria", "Chloroplast", "Nucleus"], answer: "Chloroplast" }, { question: "DNA stands for?", options: ["Deoxyribonucleic Acid", "Ribonucleic Acid", "Protein"], answer: "Deoxyribonucleic Acid" } ] }, { title: "Math Geometry", subject: "Math", level: "Intermediate", description: "Shapes, theorems, and geometry principles made simple.", notes: ["Triangles have 3 sides.", "Pythagoras theorem."], flashcards: [ { question: "Sum of angles in triangle?", answer: "180°" }, { question: "Diagonal of square formula?", answer: "side*sqrt(2)" } ], quiz: [ { question: "A square has how many sides?", options: ["3", "4", "5"], answer: "4" }, { question: "Theorem: a²+b²=?", options: ["c²", "a²", "b²"], answer: "c²" } ] }, { title: "English Grammar", subject: "English", level: "Beginner", description: "Master sentence structure and tenses quickly.", notes: ["A sentence has a subject and predicate.", "Tenses describe time."], flashcards: [ { question: "Past tense of 'go'?", answer: "went" }, { question: "Plural of 'child'?", answer: "children" } ], quiz: [ { question: "She ____ happy.", options: ["is", "are", "am"], answer: "is" }, { question: "I ___ to school yesterday.", options: ["go", "went", "gone"], answer: "went" } ] } ];

let currentCapsule = capsules[0]; let currentCardIndex = 0; let showingAnswer = false; let currentQuizIndex = 0;

// ===== Elements ===== const flashcardDisplay = $('#flashcardDisplay'); const prevCardBtn = $('#prevCardBtn'); const nextCardBtn = $('#nextCardBtn'); const flipCardBtn = $('#flipCardBtn'); const notesList = $('#notesList'); const learnSelector = $('#learnSelector'); const quizContainer = $('#quizContainer'); const flashcardsList = $('#flashcardsList'); const addFlashcardBtn = $('#addFlashcardBtn'); const quizList = $('#quizList'); const addQuestionBtn = $('#addQuestionBtn');

// Progress bars const flashcardProgress = document.createElement('div'); flashcardProgress.className = 'progress mb-2'; flashcardProgress.innerHTML = '<div class="progress-bar" role="progressbar" style="width:0%"></div>'; flashcardDisplay.parentNode.insertBefore(flashcardProgress, flashcardDisplay);

const quizProgress = document.createElement('div'); quizProgress.className = 'progress mb-2'; quizProgress.innerHTML = '<div class="progress-bar bg-success" role="progressbar" style="width:0%"></div>'; quizContainer.parentNode.insertBefore(quizProgress, quizContainer);

// ===== Functions ===== function updateLearnMode() { // Notes notesList.innerHTML = ''; currentCapsule.notes.forEach(note => { const li = document.createElement('li'); li.className = 'list-group-item'; li.innerText = note; notesList.appendChild(li); });

// Flashcards reset currentCardIndex = 0; showingAnswer = false; showFlashcard();

// Quiz reset currentQuizIndex = 0; renderQuiz(); }

function showFlashcard() { if (!currentCapsule.flashcards.length) { flashcardDisplay.innerText = 'No flashcards'; flashcardProgress.firstElementChild.style.width = '0%'; return; } const card = currentCapsule.flashcards[currentCardIndex]; flashcardDisplay.innerText = showingAnswer ? card.answer : card.question; flashcardProgress.firstElementChild.style.width = ${((currentCardIndex+1)/currentCapsule.flashcards.length)*100}%; }

function renderQuiz() { if (!currentCapsule.quiz.length) { quizContainer.innerHTML = '<p>No quiz questions</p>'; quizProgress.firstElementChild.style.width = '0%'; return; } const q = currentCapsule.quiz[currentQuizIndex]; quizContainer.innerHTML = <p><strong>Q${currentQuizIndex+1}:</strong> ${q.question}</p>; const div = document.createElement('div'); q.options.forEach(opt => { const btn = document.createElement('button'); btn.className = 'btn btn-outline-primary btn-sm me-2 mb-1'; btn.innerText = opt; btn.addEventListener('click', () => { if(opt === q.answer) alert('✅ Correct!'); else alert('❌ Wrong!'); currentQuizIndex = (currentQuizIndex+1) % currentCapsule.quiz.length; renderQuiz(); }); div.appendChild(btn); }); quizContainer.appendChild(div); quizProgress.firstElementChild.style.width = ${((currentQuizIndex)/currentCapsule.quiz.length)*100}%; }

function populateAuthorFlashcards() { flashcardsList.innerHTML = ''; currentCapsule.flashcards.forEach(fc => { const div = document.createElement('div'); div.className = 'list-group-item d-flex justify-content-between align-items-center'; div.innerText = ${fc.question} → ${fc.answer}; flashcardsList.appendChild(div); }); }

function populateAuthorQuiz() { quizList.innerHTML = ''; currentCapsule.quiz.forEach(q => { const div = document.createElement('div'); div.className = 'list-group-item d-flex justify-content-between align-items-center'; div.innerText = ${q.question} → ${q.answer}; quizList.appendChild(div); }); }

function selectCapsule(title) { currentCapsule = capsules.find(c => c.title === title); updateLearnMode(); populateAuthorFlashcards(); populateAuthorQuiz(); learnSelector.value = currentCapsule.title; }

// ===== Events ===== flashcardDisplay.addEventListener('click', () => { showingAnswer = !showingAnswer; showFlashcard(); }); flipCardBtn.addEventListener('click', () => { showingAnswer = !showingAnswer; showFlashcard(); }); prevCardBtn.addEventListener('click', () => { currentCardIndex = (currentCardIndex - 1 + currentCapsule.flashcards.length) % currentCapsule.flashcards.length; showingAnswer=false; showFlashcard(); }); nextCardBtn.addEventListener('click', () => { currentCardIndex = (currentCardIndex + 1) % currentCapsule.flashcards.length; showingAnswer=false; showFlashcard(); });

learnSelector.addEventListener('change', e => selectCapsule(e.target.value));

addFlashcardBtn.addEventListener('click', () => { const q = prompt('Enter flashcard question:'); if(!q) return; const a = prompt('Enter flashcard answer:'); if(!a) return; currentCapsule.flashcards.push({question:q, answer:a}); populateAuthorFlashcards(); updateLearnMode(); });

addQuestionBtn.addEventListener('click', () => { const question = prompt('Enter quiz question:'); if(!question) return; const answer = prompt('Enter correct answer:'); if(!answer) return; const opts = prompt('Enter options separated by comma:').split(','); currentCapsule.quiz.push({question, answer, options: opts}); populateAuthorQuiz(); updateLearnMode(); });

// Library card buttons document.querySelectorAll('.capsule-card').forEach(card => { const title = card.querySelector('.card-title').innerText; card.querySelector('.btn-outline-primary').addEventListener('click', () => selectCapsule(title)); card.querySelector('.btn-outline-secondary').addEventListener('click', () => { selectCapsule(title); window.scrollTo({top: $('#author').offsetTop-70, behavior:'smooth'}); }); card.querySelector('.btn-outline-danger').addEventListener('click', () => { if(confirm('Delete '+title+'?')) { capsules = capsules.filter(c=>c.title!==title); card.parentElement.remove(); } }); });

// Initial setup populateAuthorFlashcards(); populateAuthorQuiz(); updateLearnMode();

