-- NORI OS — eliminar el módulo de chat NORI AI (T-014)
-- Decisión del fundador (2026-07-04): la app es una herramienta de control
-- operativo, sin IA. Las tablas de chat estaban vacías en producción.

drop table if exists chat_messages;
drop table if exists chat_conversations;
