# Módulo de Registro de Usuarios

## Descripción
Módulo completo para el registro de usuarios siguiendo la arquitectura MVC con Next.js y PostgreSQL.

## Estructura

```
src/
├── controllers/
│   └── auth.controller.ts          # Controlador de autenticación
├── services/
│   └── auth.service.ts             # Lógica de negocio de autenticación
├── repositories/
│   └── user.repository.ts          # Capa de acceso a datos de usuarios
├── models/
│   ├── entities/
│   │   └── user.entity.ts          # Entidad de usuario
│   └── dto/
│       └── create-user.dto.ts      # DTOs para crear usuario
├── utils/
│   └── validators.ts               # Funciones de validación
└── lib/
    └── db.ts                       # Conexión a PostgreSQL

app/
└── api/
    └── auth/
        └── register/
            └── route.ts            # Ruta API POST /api/auth/register
```

## Flujo de Datos

```
POST /api/auth/register
    ↓
authController.register()
    ↓
authService.register()
    ↓
Validaciones (email, password, nombre)
    ↓
userRepository.create()
    ↓
INSERT en BD
```

## Uso

### 1. Configurar variables de entorno

Copia el archivo `.env.example` a `.env.local` y configura:

```bash
cp .env.example .env.local
```

### 2. Instalar dependencias

Se requiere el paquete `pg` para PostgreSQL:

```bash
npm install pg
npm install -D @types/pg
```

### 3. Crear la tabla de usuarios en PostgreSQL

Ejecuta el siguiente SQL en tu base de datos:

```sql
CREATE TABLE usuarios (  
    id SERIAL PRIMARY KEY,    
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,    
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    
    activo BOOLEAN DEFAULT TRUE
);
```

### 4. Hacer una solicitud de registro

#### Endpoint
```
POST /api/auth/register
Content-Type: application/json
```

#### Body
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

#### Respuesta exitosa (201)
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "fecha_registro": "2026-02-04T10:30:00Z",
    "activo": true
  }
}
```

#### Errores

**Email duplicado (409)**
```json
{
  "error": "El email ya está registrado"
}
```

**Validación de contraseña (400)**
```json
{
  "error": "La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales"
}
```

**Contraseñas no coinciden (400)**
```json
{
  "error": "Las contraseñas no coinciden"
}
```

## Requisitos de Contraseña

- Mínimo 8 caracteres
- Al menos una mayúscula
- Al menos una minúscula
- Al menos un número
- Al menos un carácter especial (!@#$%^&*()_+-=[]{}...etc)

## Validaciones

### Email
- Formato válido de email

### Nombre
- Mínimo 2 caracteres
- Máximo 100 caracteres

### Password
- Cumple con requisitos de seguridad

## Seguridad

⚠️ **IMPORTANTE**: Este módulo utiliza `pbkdf2` para el hash de contraseñas. 
Para producción, se recomienda usar **bcrypt** o **argon2**:

```bash
npm install bcrypt
npm install -D @types/bcrypt
```

Luego modificar `src/services/auth.service.ts`:

```typescript
import bcrypt from 'bcrypt';

const hashPassword = (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

const verifyPassword = (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
```

## Extensiones Futuras

- [ ] Ruta para login
- [ ] JWT tokens
- [ ] Middleware de autenticación
- [ ] Ruta para cambiar contraseña
- [ ] Ruta para actualizar perfil
- [ ] Confirmación de email
- [ ] Recuperación de contraseña
- [ ] Rate limiting

