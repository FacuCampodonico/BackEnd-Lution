import { compare, hash } from 'bcryptjs';

const RONDAS_BCRYPT = 10;

export function hashearPassword(password: string): Promise<string> {
  return hash(password, RONDAS_BCRYPT);
}

export function verificarPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return compare(password, passwordHash);
}
