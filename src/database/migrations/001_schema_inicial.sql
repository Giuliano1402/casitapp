-- ============================================================
-- Migración 001 - Schema inicial
-- Proyecto: casitapp
-- Ejecutar con: psql -U zeus -d casitapp -f 001_schema_inicial.sql
-- ============================================================

-- -----------------------------------------------
-- TIPOS ENUM
-- -----------------------------------------------
CREATE TYPE tipo_transaccion AS ENUM ('INGRESO', 'GASTO');

CREATE TYPE metodo_pago AS ENUM (
  'EFECTIVO',
  'TRANSFERENCIA',
  'TARJETA_DEBITO',
  'TARJETA_CREDITO',
  'CHEQUE',
  'OTRO'
);

CREATE TYPE tipo_notificacion AS ENUM (
  'PRESUPUESTO_EXCEDIDO',
  'PROXIMA_RECURRENTE',
  'META_ALCANZADA',
  'SALDO_BAJO',
  'OTRO'
);

-- -----------------------------------------------
-- TABLA: usuarios
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id             SERIAL PRIMARY KEY,
  nombre         VARCHAR(100)  NOT NULL,
  email          VARCHAR(100)  UNIQUE NOT NULL,
  password_hash  VARCHAR(255)  NOT NULL,
  fecha_registro TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  activo         BOOLEAN       DEFAULT TRUE
);

-- -----------------------------------------------
-- TABLA: categorias
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS categorias (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(50)  NOT NULL,
  descripcion TEXT,
  color       VARCHAR(7),           -- formato hex: #RRGGBB
  icono       VARCHAR(50),
  activa      BOOLEAN DEFAULT TRUE
);

-- -----------------------------------------------
-- TABLA: transacciones
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS transacciones (
  id                 SERIAL PRIMARY KEY,
  usuario_id         INTEGER         NOT NULL REFERENCES usuarios(id)   ON DELETE CASCADE,
  categoria_id       INTEGER         NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
  tipo               tipo_transaccion NOT NULL,
  monto              DECIMAL(15, 2)  NOT NULL CHECK (monto > 0),
  descripcion        TEXT,
  fecha_transaccion  DATE            NOT NULL,
  fecha_registro     TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  es_recurrente      BOOLEAN         DEFAULT FALSE,
  metodo_pago        metodo_pago
);

-- -----------------------------------------------
-- TABLA: notificaciones
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS notificaciones (
  id             SERIAL PRIMARY KEY,
  usuario_id     INTEGER          NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo           tipo_notificacion NOT NULL,
  titulo         VARCHAR(150)     NOT NULL,
  mensaje        TEXT             NOT NULL,
  leida          BOOLEAN          DEFAULT FALSE,
  fecha_creacion TIMESTAMP        DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------
-- SEEDS: categorías por defecto
-- -----------------------------------------------
INSERT INTO categorias (nombre, descripcion, color, icono) VALUES
  ('Alimentación',   'Supermercado, restaurantes y comida',     '#FF6B6B', 'utensils'),
  ('Transporte',     'Combustible, taxi, transporte público',   '#4ECDC4', 'car'),
  ('Vivienda',       'Alquiler, servicios, mantenimiento',      '#45B7D1', 'home'),
  ('Salud',          'Médicos, medicamentos, seguros',          '#96CEB4', 'heart-pulse'),
  ('Educación',      'Cursos, libros, suscripciones',           '#FFEAA7', 'book'),
  ('Entretenimiento','Cine, juegos, salidas',                   '#DDA0DD', 'gamepad-2'),
  ('Ropa',           'Vestimenta y calzado',                    '#F0A500', 'shirt'),
  ('Salario',        'Ingresos por trabajo',                    '#6BCB77', 'briefcase'),
  ('Otros',          'Gastos varios no categorizados',          '#B0B0B0', 'ellipsis')
ON CONFLICT DO NOTHING;
