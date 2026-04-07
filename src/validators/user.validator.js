import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z
      .string({ error: 'El email es requerido' })
      .transform((value) => value.trim().toLowerCase())
      .pipe(z.email({ message: 'Email no válido' })),
    password: z
      .string({ error: 'Lacontraseña es requerida' })
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
  })
});

export const validationSchema = z.object({
  body: z.object({
    code: z
      .string()
      .regex(/^\d{6}$/, 'El código debe tener exactamente 6 dígitos')
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .email({ message: 'Email no válido' })
      .transform((value) => value.trim().toLowerCase()),
    password: z.string()
  })
});

export const registerDataSchema = z.object({
    body: z.object({
      name: z
        .string({ error: 'El nombre es requerido' })
        .trim()
        .min(1, 'El nombre es requerido')
        .max(99, 'Máximo 99 caracteres'),
      lastName: z
        .string({ error: 'El apellido es requerido' })
        .trim()
        .min(1, 'El apellido es requerido')
        .max(99, 'Máximo 99 caracteres'),
      nif: z
        .string()
        .trim()
        .toUpperCase()
        .length(9, 'El NIF debe tener exactamente 9 caracteres')
    })
});

export const companyDataSchema = z.object({
    body: z.discriminatedUnion('isFreelance', [
      z.object({
        isFreelance: z.literal(true)
      }),
      z.object({
        isFreelance: z.literal(false),
        name: z
          .string()
          .trim()
          .min(1, 'El nombre es requerido')
          .max(99, 'Máximo 99 caracteres'),
        cif: z
          .string()
          .trim()
          .toUpperCase()
          .length(9, 'El CIF debe tener exactamente 9 caracteres'),
        address: z.object({
          street: z.string().trim(),
          number: z.string().trim(),
          postal: z.string().trim(),
          city: z.string().trim(),
          province: z.string().trim(),
        })
      })
    ])
});

export const refreshSchema = z.object({
    body: z.object({
      refreshToken: z
        .string()
        .min(1, 'El refresh token es requerido')
    })
});

export const passwordSchema = z.object({
    body: z.object({
      currentPassword: z
        .string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres'),
      newPassword: z
        .string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres'),
    }).refine((data) => data.currentPassword !== data.newPassword, {
      message: 'La nueva contraseña debe ser diferente de la actual',
      path: ['newPassword']
    })
});

export const inviteSchema = z.object({
    body: z.object({
      email: z
        .email({ message: 'Email no válido' })
        .transform((value) => value.trim().toLowerCase())
    })
});