const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, '../supabase/migrations/20260808_clear_db_and_seed_catalog.sql');
const targetPath = path.join(__dirname, '../supabase/production_setup/03_production_seed_data.sql');

const seedContent = fs.readFileSync(seedPath, 'utf8');

const prefix = `-- ==============================================================================
-- Production SQL Script 03: Store Settings, Delivery Zones & Catalog Seed Data
-- Project: Vaily Pyro Park
-- Description: Seeds store settings, delivery zones, 15 categories, and full catalog of 145 products.
-- ==============================================================================

-- 1. SEED STORE SETTINGS
INSERT INTO store_settings (key, value) VALUES
  ('store_name', 'Vaily Pyro Park'),
  ('tagline', 'Sivakasi Direct Fireworks Outlet'),
  ('helpline_mobile', '+91 98401 23456'),
  ('whatsapp_number', '919840123456'),
  ('gstin', '33AAACV1234A1Z5'),
  ('announcement_banner', '⚡ DIWALI PRE-BOOKING OPEN: Get up to 75% OFF Factory Direct Rates!')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 2. SEED REGIONAL DELIVERY ZONES
INSERT INTO delivery_zones (zone_name, state_codes, min_order_amount, delivery_fee, estimated_days) VALUES 
  ('Tamil Nadu (Home Zone)', ARRAY['TN', 'Tamil Nadu'], 3000.00, 0.00, '2-3 Days'),
  ('South India (Puducherry, Kerala, KA, AP, TS)', ARRAY['PY', 'KL', 'KA', 'AP', 'TS', 'Puducherry', 'Kerala', 'Karnataka', 'Andhra Pradesh', 'Telangana'], 4000.00, 150.00, '3-4 Days'),
  ('Rest of India', ARRAY['MH', 'DL', 'GJ', 'RJ', 'UP', 'WB', 'MP', 'HR', 'PB', 'ALL'], 5000.00, 250.00, '5-7 Days')
ON CONFLICT DO NOTHING;

`;

let cleanedSeed = seedContent
  .replace("TRUNCATE TABLE inventory_movements CASCADE;\n", "")
  .replace("TRUNCATE TABLE inventory CASCADE;\n", "");

// Remove INSERT INTO inventory block
const invStartIndex = cleanedSeed.indexOf("-- 4. INSERT INITIAL INVENTORY STOCK");
if (invStartIndex !== -1) {
  const comboStartIndex = cleanedSeed.indexOf("-- 5. INSERT POPULAR FESTIVAL COMBOS");
  if (comboStartIndex !== -1) {
    cleanedSeed = cleanedSeed.substring(0, invStartIndex) + cleanedSeed.substring(comboStartIndex);
  }
}

fs.writeFileSync(targetPath, prefix + cleanedSeed, 'utf8');
console.log('Successfully created 03_production_seed_data.sql without inventory!');
