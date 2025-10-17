
// library.js
import { loadFromStorage, saveToStorage } from "./utils.js";

let capsules = loadFromStorage("capsules") || [];

const capsuleGrid = document.getElementById("capsuleGrid");

export function renderLibrary() {
  capsuleGrid.innerHTML = "";
  capsules.forEach((cap, index) => {
    const card = document.createElement("div");
    card.className = "col-md-3";
    card.innerHTML = `
      <div class="card shadow-sm p-2 h-100">
        <h5>${cap.title}</h5>
        <p class="text-muted">${cap.subject} | ${cap.level}</p>
        <button class="btn btn-sm btn-primary w-100" data-index="${index}">Edit</button>
      </div>
    `;
    capsuleGrid.appendChild(card);
  });
}

// افزودن کپسول جدید
export function addCapsule(cap) {
  capsules.push(cap);
  saveToStorage("capsules", capsules);
  renderLibrary();
}

// ویرایش یک کپسول
export function getCapsule(index) {
  return capsules[index];
}

export function updateCapsule(index, cap) {
  capsules[index] = cap;
  saveToStorage("capsules", capsules);
  renderLibrary();
}
