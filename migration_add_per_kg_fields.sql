-- ============================================
-- Migration: Adicionar campos para produtos por quilo
-- Data: 2026-01-12
-- Descrição: Adiciona 3 campos na tabela products
--            para suportar produtos vendidos por kg
-- ============================================

-- Adicionar coluna para indicar produto por kg
ALTER TABLE products
ADD COLUMN IF NOT EXISTS is_per_kg BOOLEAN DEFAULT false;

-- Adicionar coluna para peso em kg
ALTER TABLE products
ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(10,3) DEFAULT NULL;

-- Adicionar coluna para preço por kg
ALTER TABLE products
ADD COLUMN IF NOT EXISTS price_per_kg DECIMAL(10,2) DEFAULT NULL;

-- Comentários das colunas (opcional, para documentação)
COMMENT ON COLUMN products.is_per_kg IS 'Indica se o produto é vendido por quilo';
COMMENT ON COLUMN products.weight_kg IS 'Peso em quilogramas (usado quando is_per_kg = true)';
COMMENT ON COLUMN products.price_per_kg IS 'Preço por quilograma (usado quando is_per_kg = true)';
