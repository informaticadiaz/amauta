-- ==================================
-- Script de Inicialización de PostgreSQL
-- ==================================
--
-- Este script se ejecuta automáticamente cuando se crea el contenedor
-- de PostgreSQL por primera vez.
--
-- Orden de ejecución: Los scripts se ejecutan en orden alfabético.

-- ==================================
-- Configuración de Base de Datos
-- ==================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- Para generar UUIDs
CREATE EXTENSION IF NOT EXISTS "pg_trgm";         -- Para búsqueda fuzzy
CREATE EXTENSION IF NOT EXISTS "unaccent";        -- Para búsqueda sin acentos

-- Configurar búsqueda en español
CREATE TEXT SEARCH CONFIGURATION es (COPY = spanish);

-- ==================================
-- Funciones Útiles
-- ==================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para búsqueda full-text en español
CREATE OR REPLACE FUNCTION es_search(text)
RETURNS tsvector AS $$
BEGIN
  RETURN to_tsvector('spanish', unaccent($1));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ==================================
-- Configuración de Performance
-- ==================================

-- Ajustar parámetros de conexión
ALTER DATABASE amauta_dev SET timezone TO 'America/Lima';
ALTER DATABASE amauta_dev SET client_encoding TO 'UTF8';
ALTER DATABASE amauta_dev SET default_text_search_config TO 'spanish';

-- ==================================
-- Mensaje de Confirmación
-- ==================================

DO $$
BEGIN
  RAISE NOTICE '✅ Base de datos amauta_dev inicializada correctamente';
  RAISE NOTICE '📦 Extensiones habilitadas: uuid-ossp, pg_trgm, unaccent';
  RAISE NOTICE '🔍 Configuración de búsqueda: spanish';
  RAISE NOTICE '🕐 Timezone: America/Lima';
END $$;
