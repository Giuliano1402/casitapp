-- Tipos ENUM personalizados
CREATE TYPE tipo_transaccion AS ENUM ('INGRESO', 'GASTO');
CREATE TYPE metodo_pago AS ENUM ('EFECTIVO', 'TRANSFERENCIA', 'TARJETA_DEBITO', 'TARJETA_CREDITO', 'CHEQUE', 'OTRO');
CREATE TYPE tipo_notificacion AS ENUM ('PRESUPUESTO_EXCEDIDO', 'PROXIMA_RECURRENTE', 'META_ALCANZADA', 'SALDO_BAJO', 'OTRO');
Tabla usuarios
CREATE TABLE usuarios (  
    id SERIAL PRIMARY KEY,    
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,    
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    
    activo BOOLEAN DEFAULT TRUE
);
Tabla categorias
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT,
    color VARCHAR(7),
    icono VARCHAR(50),
    activa BOOLEAN DEFAULT TRUE
);
Tabla transacciones
CREATE TABLE transacciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    categoria_id INTEGER NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
    tipo tipo_transaccion NOT NULL,
    monto DECIMAL(15, 2) NOT NULL CHECK (monto > 0),
    descripcion TEXT,
    fecha_transaccion DATE NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    es_recurrente BOOLEAN DEFAULT FALSE,
    metodo_pago metodo_pago,
);
Tabla notificaciones
CREATE TABLE notificaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo tipo_notificacion NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    mensaje TEXT NOT NULL,
    leida BOOLEAN DEFAULT FALSE,
   fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);