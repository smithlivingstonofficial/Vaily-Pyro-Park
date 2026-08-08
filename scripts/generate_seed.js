const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const excelPath = path.join(__dirname, '../public/Final Crackers Price List.xlsx');
const workbook = XLSX.readFile(excelPath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet);

console.log(`Processing ${rows.length} product rows from Excel...`);

// 1. Categories mapping
const categoryMeta = {
  'Sound Crackers': { icon: 'Volume2', order: 1 },
  'Flower Pots': { icon: 'Flame', order: 2 },
  'Ground Chakkaras': { icon: 'RotateCw', order: 3 },
  'Bijili Crackers': { icon: 'Zap', order: 4 },
  'Lar': { icon: 'Volume2', order: 5 },
  'Bomb': { icon: 'Volume2', order: 6 },
  'Rocket': { icon: 'Rocket', order: 7 },
  'Pencil': { icon: 'Sparkles', order: 8 },
  'Kutties Special': { icon: 'Gift', order: 9 },
  'Match Box': { icon: 'Flame', order: 10 },
  'Colorful Nights': { icon: 'Sparkles', order: 11 },
  'New Arrivals (2025)': { icon: 'Sparkles', order: 12 },
  'Amazing Shots': { icon: 'Zap', order: 13 },
  'Fancy Shots': { icon: 'Zap', order: 14 },
  'Sparklers': { icon: 'Sparkles', order: 15 },
};

const uniqueCategories = Array.from(
  new Set(rows.map((r) => String(r.subcategory || r.category || 'General').trim()))
);

// Map categories to deterministic UUIDs
const categoryUUIDs = {};
uniqueCategories.forEach((catName, index) => {
  const catNum = String(index + 1).padStart(12, '0');
  categoryUUIDs[catName] = `11111111-0000-0000-0000-${catNum}`;
});

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function getSoundLevel(catName) {
  const cat = catName.toLowerCase();
  if (cat.includes('sound') || cat.includes('bomb') || cat.includes('lar')) return 'High';
  if (cat.includes('sparkler') || cat.includes('kutties') || cat.includes('match')) return 'Silent';
  if (cat.includes('pot') || cat.includes('chakkara') || cat.includes('pencil')) return 'Low';
  return 'Medium';
}

function getPackSize(title) {
  const match = title.match(/\((.*?)\)/);
  if (match) return match[1];
  if (title.toLowerCase().includes('pcs')) return 'Pack of Pcs';
  return '1 Box';
}

function escapeSql(str) {
  if (!str) return "''";
  return "'" + String(str).replace(/'/g, "''") + "'";
}

// Prepare CSV data rows
const csvHeader = 'name,sku,pack_size,mrp,selling_price,sound_level,stock,category,description\n';
let csvContent = csvHeader;

// Prepare SQL Migration Content
let sql = `-- Migration: 20260808_clear_db_and_seed_catalog.sql
-- Clears transactional & product DB tables (keeps admin user, store_settings, delivery_zones)
-- Seeds full catalog of 145 products from official price list

-- 1. CLEAR EXISTING DATA (EXCEPT ADMIN USER & SYSTEM SETTINGS)
TRUNCATE TABLE order_items CASCADE;
TRUNCATE TABLE orders CASCADE;
TRUNCATE TABLE inventory_movements CASCADE;
TRUNCATE TABLE inventory CASCADE;
TRUNCATE TABLE combo_items CASCADE;
TRUNCATE TABLE combos CASCADE;
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE categories CASCADE;

-- 2. INSERT CATEGORIES
INSERT INTO categories (id, name, slug, description, icon_name, display_order, is_active) VALUES
`;

const categorySqlLines = uniqueCategories.map((catName) => {
  const id = categoryUUIDs[catName];
  const slug = slugify(catName);
  const meta = categoryMeta[catName] || { icon: 'Sparkles', order: 99 };
  return `  ('${id}', ${escapeSql(catName)}, '${slug}', ${escapeSql(catName + ' Sivakasi Collection')}, '${meta.icon}', ${meta.order}, true)`;
});

sql += categorySqlLines.join(',\n') + ';\n\n';

// 3. INSERT PRODUCTS & INVENTORY
sql += `-- 3. INSERT PRODUCTS
INSERT INTO products (id, category_id, name, slug, sku, description, pack_size, mrp, selling_price, image_url, is_active, is_featured, is_best_seller, sound_level) VALUES
`;

let productSqlLines = [];
let inventorySqlLines = [];

rows.forEach((row, idx) => {
  const prodNum = String(idx + 1).padStart(12, '0');
  const prodId = `22222222-0000-0000-0000-${prodNum}`;
  const catName = String(row.subcategory || row.category || 'General').trim();
  const catId = categoryUUIDs[catName] || categoryUUIDs[uniqueCategories[0]];

  const name = String(row.title || `Product ${idx + 1}`).trim();
  let slug = slugify(name);
  if (!slug) slug = `prod-${idx + 1}`;
  slug = `${slug}-${idx + 1}`;

  const skuPrefix = catName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'PRD');
  const sku = `${skuPrefix}-${String(idx + 1).padStart(3, '0')}`;

  const desc = String(row.description || `${name} - Authentic Sivakasi Fireworks.`).trim();
  const packSize = getPackSize(name);
  const mrp = Number(row.originalPrice) || 100;
  const sellingPrice = Number(row.discountedPrice) || Math.round(mrp * 0.2); // 80% discount default if zero
  const soundLevel = getSoundLevel(catName);
  const imageUrl = row.imageUrls ? String(row.imageUrls).trim() : null;

  const isFeatured = idx < 12;
  const isBestSeller = idx % 3 === 0;

  // Append SQL for product
  productSqlLines.push(
    `  ('${prodId}', '${catId}', ${escapeSql(name)}, '${slug}', '${sku}', ${escapeSql(desc)}, ${escapeSql(packSize)}, ${mrp}, ${sellingPrice}, ${imageUrl ? escapeSql(imageUrl) : 'NULL'}, true, ${isFeatured}, ${isBestSeller}, '${soundLevel}')`
  );

  // Append SQL for inventory
  inventorySqlLines.push(
    `  ('${prodId}', 150, 0, 10, NOW())`
  );

  // Append to CSV
  // name,sku,pack_size,mrp,selling_price,sound_level,stock,category,description
  const cleanName = `"${name.replace(/"/g, '""')}"`;
  const cleanDesc = `"${desc.replace(/"/g, '""')}"`;
  const cleanCategory = `"${catName.replace(/"/g, '""')}"`;
  csvContent += `${cleanName},${sku},"${packSize}",${mrp},${sellingPrice},${soundLevel},150,${cleanCategory},${cleanDesc}\n`;
});

sql += productSqlLines.join(',\n') + ';\n\n';

sql += `-- 4. INSERT INITIAL INVENTORY STOCK
INSERT INTO inventory (product_id, available_stock, reserved_stock, safety_threshold, updated_at) VALUES
`;
sql += inventorySqlLines.join(',\n') + ';\n\n';

// 5. INSERT INITIAL COMBOS
sql += `-- 5. INSERT POPULAR FESTIVAL COMBOS
INSERT INTO combos (id, name, slug, description, price, mrp, image_url, is_active) VALUES
  ('44444444-0000-0000-0000-000000000001', 'Diwali Family Grand Celebration Pack', 'diwali-family-grand-pack', 'Complete 25-variety Sivakasi celebration gift box with sparklers, flower pots, rockets, and aerial shots.', 3990, 15000, NULL, true),
  ('44444444-0000-0000-0000-000000000002', 'Kids Safe & Joyful Sparkle Box', 'kids-safe-joyful-pack', 'Child-safe low noise gift box with colorful sparklers, ground chakkaras, and flower pots.', 1890, 7500, NULL, true)
ON CONFLICT (id) DO NOTHING;
`;

// Write output files
const sqlPath = path.join(__dirname, '../supabase/migrations/20260808_clear_db_and_seed_catalog.sql');
fs.writeFileSync(sqlPath, sql, 'utf8');

const csvPath = path.join(__dirname, '../public/products_catalog.csv');
fs.writeFileSync(csvPath, csvContent, 'utf8');

console.log(`\nSUCCESS! Created:`);
console.log(` 1. SQL Migration: ${sqlPath}`);
console.log(` 2. CSV Catalog File: ${csvPath}`);
console.log(`Total Products seeded: ${rows.length}`);
console.log(`Total Categories seeded: ${uniqueCategories.length}`);
