const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../public/Final Crackers Price List.xlsx');
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

const data = XLSX.utils.sheet_to_json(sheet);

console.log(`Total rows in Excel: ${data.length}`);
console.log('Sample row:', data[0]);

const categories = new Set();
data.forEach((row) => {
  const cat = row.subcategory || row.category || 'General Crackers';
  categories.add(String(cat).trim());
});

console.log('\nUnique Subcategories found:');
console.log(Array.from(categories));
