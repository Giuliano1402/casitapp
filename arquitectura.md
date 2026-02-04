# Arquitectura Web con Next.js y PostgreSQL

Te propongo una arquitectura limpia siguiendo MVC y principios de Clean Architecture:

```
project-root/
├── app/                          # Solo layouts y pages (App Router)
│   ├── layout.tsx
│   ├── page.tsx
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   └── profile/
│   │       └── page.tsx
│   └── api/                      # API Routes
│       ├── auth/
│       │   └── route.ts
│       └── users/
│           └── route.ts
│
├── src/
│   ├── controllers/              # Controladores (lógica de rutas API)
│   │   ├── auth.controller.ts
│   │   └── user.controller.ts
│   │
│   ├── services/                 # Lógica de negocio
│   │   ├── auth.service.ts
│   │   └── user.service.ts
│   │
│   ├── models/                   # Modelos de datos y DTOs
│   │   ├── entities/
│   │   │   ├── user.entity.ts
│   │   │   └── post.entity.ts
│   │   └── dto/
│   │       ├── create-user.dto.ts
│   │       └── update-user.dto.ts
│   │
│   ├── repositories/             # Capa de acceso a datos
│   │   ├── base.repository.ts
│   │   └── user.repository.ts
│   │
│   ├── database/                 # Configuración de DB
│   │   ├── connection.ts
│   │   ├── migrations/
│   │   └── seeds/
│   │
│   ├── middleware/               # Middlewares personalizados
│   │   ├── auth.middleware.ts
│   │   └── error.middleware.ts
│   │
│   ├── utils/                    # Utilidades
│   │   ├── validators.ts
│   │   ├── formatters.ts
│   │   └── constants.ts
│   │
│   ├── config/                   # Configuraciones
│   │   ├── env.ts
│   │   └── database.config.ts
│   │
│   ├── types/                    # TypeScript types/interfaces
│   │   ├── api.types.ts
│   │   └── common.types.ts
│   │
│   └── lib/                      # Librerías externas configuradas
│       ├── prisma.ts             # o pg/postgres client
│       └── jwt.ts
│
├── components/                   # Componentes React
│   ├── ui/                       # Componentes base UI
│   │   ├── Button.tsx
│   │   └── Input.tsx
│   ├── forms/                    # Formularios
│   │   └── LoginForm.tsx
│   └── layouts/                  # Layouts compartidos
│       └── Header.tsx
│
├── hooks/                        # Custom React Hooks
│   ├── useAuth.ts
│   └── useUser.ts
│
├── public/                       # Archivos estáticos
│   ├── images/
│   └── icons/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.local
├── .env.example
├── next.config.js
├── tsconfig.json
├── package.json
└── README.md
```

## Flujo de Datos (MVC Pattern)

```
View (Page/Component) 
    ↓
Controller (API Route Handler)
    ↓
Service (Business Logic)
    ↓
Repository (Data Access)
    ↓
Model (Database/PostgreSQL)
```

## Ejemplo de Implementación

**API Route (`app/api/users/route.ts`):**
```typescript
import { userController } from '@/controllers/user.controller';

export async function GET(request: Request) {
  return userController.getUsers(request);
}

export async function POST(request: Request) {
  return userController.createUser(request);
}
```

**Controller (`src/controllers/user.controller.ts`):**
```typescript
import { userService } from '@/services/user.service';
import { NextResponse } from 'next/server';

export const userController = {
  async getUsers(request: Request) {
    try {
      const users = await userService.getAllUsers();
      return NextResponse.json(users);
    } catch (error) {
      return NextResponse.json({ error: 'Error fetching users' }, { status: 500 });
    }
  }
};
```

**Service (`src/services/user.service.ts`):**
```typescript
import { userRepository } from '@/repositories/user.repository';

export const userService = {
  async getAllUsers() {
    return await userRepository.findAll();
  }
};
```

**Repository (`src/repositories/user.repository.ts`):**
```typescript
import { db } from '@/database/connection';

export const userRepository = {
  async findAll() {
    return await db.query('SELECT * FROM users');
  }
};
```

Esta arquitectura mantiene la separación de responsabilidades, facilita el testing y permite escalar la aplicación de manera ordenada.