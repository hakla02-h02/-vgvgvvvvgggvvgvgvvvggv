-- Adicionar coluna page_type na tabela dragon_bio_sites
ALTER TABLE dragon_bio_sites ADD COLUMN IF NOT EXISTS page_type TEXT DEFAULT 'dragonbio';

-- Atualizar sites existentes baseado no slug para determinar o tipo
UPDATE dragon_bio_sites SET page_type = 'presell' WHERE slug LIKE 'presell-%' AND page_type IS NULL;
UPDATE dragon_bio_sites SET page_type = 'conversion' WHERE slug LIKE 'conversion-%' AND page_type IS NULL;
UPDATE dragon_bio_sites SET page_type = 'checkout' WHERE slug LIKE 'checkout-%' AND page_type IS NULL;
UPDATE dragon_bio_sites SET page_type = 'dragonbio' WHERE page_type IS NULL;
