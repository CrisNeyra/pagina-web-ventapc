export const PASSWORD_MIN_LENGTH = 6;
export const PASSWORD_MAX_LENGTH = 10;

export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{6,10}$/;

export const MENSAJE_REQUISITOS_PASSWORD =
  "La contraseña debe tener entre 6 y 10 caracteres, con al menos una letra y un número.";

export function validarPassword(password: string): boolean {
  return PASSWORD_REGEX.test(password);
}
