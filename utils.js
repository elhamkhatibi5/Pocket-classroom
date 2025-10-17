// utils.js
// ===== Utility Functions =====

// Short selector
export const $ = (s) => document.querySelector(s);
export const $$ = (s) => document.querySelectorAll(s);

// Generate unique ID
export const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

// Time ago formatting
export const timeAgo = (dateString) => {
  const now = new Date();
  const past = new Date(dateString);
  const diff = Math.floor((now - past) / 1000); // seconds

  if(diff < 60) return `${diff}s ago`;
  if(diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if(diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

// Save to LocalStorage
export const saveToStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
}

// Load from LocalStorage
export const loadFromStorage = (key) => {
  const data = localStorage.getItem(key);
  try {
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("JSON parse error", e);
    return null;
  }
}

// Download JSON file
export const downloadJSON = (data, filename='capsule.json') => {
  const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
