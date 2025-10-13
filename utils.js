export const $ = s => document.querySelector(s);
export const $$ = s => Array.from(document.querySelectorAll(s));
export function escapeHTML(str){ if(!str) return ''; return String(str).replace(/[&<>'"]/g,t=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[t])); }
export function timeAgo(dateStr){ if(!dateStr) return ''; const diff=(Date.now()-new Date(dateStr))/1000; if(diff<60)return Math.floor(diff)+'s ago'; if(diff<3600)return Math.floor(diff/60)+'m ago'; if(diff<86400)return Math.floor(diff/3600)+'h ago'; return Math.floor(diff/86400)+'d ago'; }
export function generateId(prefix='pc_'){ return prefix + Math.random().toString(36).slice(2,9); }
