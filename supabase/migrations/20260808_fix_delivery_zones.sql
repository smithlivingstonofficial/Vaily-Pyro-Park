-- Migration: 20260808_fix_delivery_zones_and_language.sql
-- Removes "Express" labelling from delivery zones and cleans up zone descriptions

UPDATE delivery_zones
SET estimated_days = '1-2 Days'
WHERE estimated_days ILIKE '%express%';

UPDATE delivery_zones
SET estimated_days = '2-4 Days'
WHERE estimated_days ILIKE '%fast lorry%';

UPDATE delivery_zones
SET estimated_days = '4-7 Days'
WHERE estimated_days ILIKE '%national transport%';

-- Also clean the zone names to be friendlier
UPDATE delivery_zones
SET zone_name = 'Tamil Nadu'
WHERE zone_name ILIKE '%tamil nadu%home%';

UPDATE delivery_zones
SET zone_name = 'South India (Kerala, Karnataka, AP, Telangana, Puducherry)'
WHERE zone_name ILIKE '%south india%';

UPDATE delivery_zones
SET zone_name = 'Rest of India'
WHERE zone_name ILIKE '%rest of india%';
