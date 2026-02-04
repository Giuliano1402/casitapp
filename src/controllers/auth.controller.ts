/**
 * Auth Controller
 * Controlador que maneja las rutas de autenticación
 */

import { NextRequest, NextResponse } from 'next/server';
import { CreateUserDto } from '../models/dto/create-user.dto';
import { authService } from '../services/auth.service';

export const authController = {
  /**
   * Maneja el registro de un nuevo usuario
   */
  async register(request: NextRequest) {
    try {
      // Valida que sea una solicitud POST
      if (request.method !== 'POST') {
        return NextResponse.json(
          { error: 'Método no permitido' },
          { status: 405 }
        );
      }

      // Obtiene el body de la solicitud
      const body = await request.json();

      // Valida que los campos requeridos estén presentes
      if (!body.nombre || !body.email || !body.password || !body.confirmPassword) {
        return NextResponse.json(
          { error: 'Faltan campos requeridos: nombre, email, password, confirmPassword' },
          { status: 400 }
        );
      }

      // Crea el DTO
      const createUserDto: CreateUserDto = {
        nombre: body.nombre.trim(),
        email: body.email.trim().toLowerCase(),
        password: body.password,
        confirmPassword: body.confirmPassword,
      };

      // Llama al servicio para registrar el usuario
      const user = await authService.register(createUserDto);

      // Retorna la respuesta exitosa
      return NextResponse.json(
        {
          message: 'Usuario registrado exitosamente',
          user,
        },
        { status: 201 }
      );
    } catch (error: any) {
      console.error('Error en registro:', error);

      // Maneja errores específicos
      if (error.message.includes('El email ya está registrado')) {
        return NextResponse.json(
          { error: error.message },
          { status: 409 } // Conflict
        );
      }

      if (error.message.includes('contraseña') || error.message.includes('nombre')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      // Error genérico
      return NextResponse.json(
        { error: 'Error al registrar el usuario' },
        { status: 500 }
      );
    }
  },

  /**
   * Valida las credenciales de un usuario
   */
  async validateLogin(request: NextRequest) {
    try {
      if (request.method !== 'POST') {
        return NextResponse.json(
          { error: 'Método no permitido' },
          { status: 405 }
        );
      }

      const body = await request.json();

      if (!body.email || !body.password) {
        return NextResponse.json(
          { error: 'Email y contraseña son requeridos' },
          { status: 400 }
        );
      }

      const isValid = await authService.validateCredentials(
        body.email.trim().toLowerCase(),
        body.password
      );

      if (!isValid) {
        return NextResponse.json(
          { error: 'Email o contraseña incorrectos' },
          { status: 401 }
        );
      }

      const user = await authService.getUserByEmail(body.email.trim().toLowerCase());

      return NextResponse.json(
        {
          message: 'Login exitoso',
          user,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error en login:', error);
      return NextResponse.json(
        { error: 'Error al validar credenciales' },
        { status: 500 }
      );
    }
  },
};
