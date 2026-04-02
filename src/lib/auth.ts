export const PASSWORD_REGEX = /^(?=(?:.*\d){4})(?=(?:.*[A-Za-z]){2})[A-Za-z\d]{6}$/;

export function validarPassword(password: string): boolean {
  return PASSWORD_REGEX.test(password);
}
