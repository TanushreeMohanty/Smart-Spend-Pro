import { CATEGORIES } from '../constants';

const loadScript = (src) => new Promise((resolve, reject) => {
  if (document.querySelector(`script[src="${src}"]`)) return resolve();
  const script = document.createElement('script');
  script.src = src; script.onload = resolve; script.onerror = reject;
  document.head.appendChild(script);
});

export const processPdf = async (file, password = '') => {
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
  if (!window.pdfjsLib) throw new Error("PDF Lib Failed");
  
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  
  const ab = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: ab, password }).promise;
  
  let lines = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const rows = [];
    textContent.items.forEach(item => {
      const y = item.transform[5];
      const existing = rows.find(r => Math.abs(r.y - y) < 5);
      if (existing) existing.items.push(item);
      else rows.push({ y, items: [item] });
    });
    rows.sort((a,b) => b.y - a.y).forEach(row => {
      lines.push(row.items.sort((a,b) => a.transform[4] - b.transform[4]).map(i => i.str).join(' '));
    });
  }
  return parseLines(lines);
};

const parseLines = (lines) => {
  return lines.map(line => {
    const dateMatch = line.match(/\b(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})\b/);
    const moneyMatches = line.match(/([\d,]+\.\d{2})/g);
    if (!dateMatch || !moneyMatches) return null;

    const amount = parseFloat(moneyMatches[moneyMatches.length - (moneyMatches.length >= 2 ? 2 : 1)].replace(/,/g, ''));
    const desc = line.replace(dateMatch[0], '').replace(/[\d,]+\.\d{2}/g, '').replace(/[^a-zA-Z0-9\s]/g, ' ').trim();
    
    // Parse Date
    const parts = dateMatch[0].split(/[./-]/);
    let date = parts.length === 3 ? new Date(parts[2].length===2?`20${parts[2]}`:parts[2], parts[1]-1, parts[0]) : new Date(dateMatch[0]);

    // Categorize
    const category = CATEGORIES.find(c => c.keywords.some(k => desc.toLowerCase().includes(k)))?.id || 'other';
    
    return { 
      id: Math.random().toString(36).substr(2,9), 
      date, 
      description: desc, 
      amount: Math.abs(amount), 
      type: line.toLowerCase().includes('cr') ? 'income' : 'expense', 
      category 
    };
  }).filter(Boolean);
};