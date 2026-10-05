export const PASSWORD_MIN_LENGTH = 10;

export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{10,72}$/;

export const MENSAJE_REQUISITOS_PASSWORD =
  "La contraseña debe tener entre 10 y 72 caracteres, con al menos una letra y un número.";

export function validarPassword(password: string): boolean {
  return PASSWORD_REGEX.test(password);
}
