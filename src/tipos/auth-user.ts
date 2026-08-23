export interface AuthUser {
  /** ID estable (Nest UUID o Firebase uid). */
  uid: string;
  email: string | null;
  role?: string;
}

export const AURA_TOKEN_COOKIE = "aura_token";
