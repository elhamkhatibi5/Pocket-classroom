
// utils.js
export function generateUUID() {
    // تولید شناسه یکتا برای هر کپسول یا Flashcard/Quiz
    return 'xxxxxx-xxxx-4xxx-yxxx-xxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// LocalStorage helpers
export function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

export function loadFromStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

// Dark/Light Mode
export function toggleTheme(currentMode) {
    const body = document.body;
    if (currentMode === 'light') {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        return 'dark';
    } else {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        return 'light';
    }
}

// پیشرفت یادگیری (Learn Progress)
export function saveProgress(capsuleId, progress) {
    const allProgress = loadFromStorage('learnProgress') || {};
    allProgress[capsuleId] = progress;
    saveToStorage('learnProgress', allProgress);
}

export function loadProgress(capsuleId) {
    const allProgress = loadFromStorage('learnProgress') || {};
    return allProgress[capsuleId] || { knownCards: [], unknownCards: [] };
}

// کمک برای فیلتر و جستجو
export function filterByQuery(items, query, field) {
    if (!query) return items;
    return items.filter(item => item[field]?.toLowerCase().includes(query.toLowerCase()));
}
