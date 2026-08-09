export const PASSWORD_REGEX = /^(?=(?:.*\d){4})(?=(?:.*[A-Za-z]){2})[A-Za-z\d]{6}$/;

export const MENSAJE_REQUISITOS_PASSWORD =
  "La contraseña debe tener exactamente 6 caracteres: 4 números y 2 letras (mínimo Firebase: 6).";

export function validarPassword(password: string): boolean {
  return PASSWORD_REGEX.test(password);
}
