export interface AuthUser {
  /** ID estable del usuario (UUID Prisma). */
  uid: string;
  email: string | null;
  role?: string;
}

export const AURA_TOKEN_COOKIE = "aura_token";
