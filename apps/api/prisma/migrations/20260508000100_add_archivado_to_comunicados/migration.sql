-- Migración: Agregar campo archivado a comunicados
-- Issue: #103 F4b-003
-- Fecha: 2026-05-08
-- Descripción: Agrega soft delete (archivado) al modelo Comunicado

ALTER TABLE "comunicados" ADD COLUMN "archivado" BOOLEAN NOT NULL DEFAULT false;
