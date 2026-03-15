import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { getDb } from '../db';

/**
 * Serviço de autenticação 2FA usando TOTP (Time-based One-Time Password)
 * Implementa Google Authenticator, Microsoft Authenticator, Authy, etc.
 */

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface TwoFactorVerification {
  isValid: boolean;
  message: string;
}

/**
 * Gera um novo segredo 2FA e código QR
 */
export async function generateTwoFactorSecret(
  userEmail: string,
  autoescolaName: string
): Promise<TwoFactorSetup> {
  const secret = speakeasy.generateSecret({
    name: `Autoescola SaaS (${autoescolaName}) - ${userEmail}`,
    issuer: 'Autoescola SaaS',
    length: 32,
  });

  if (!secret.otpauth_url) {
    throw new Error('Falha ao gerar secret 2FA');
  }

  // Gerar código QR
  const qrCode = await QRCode.toDataURL(secret.otpauth_url);

  // Gerar códigos de backup (10 códigos de 8 dígitos)
  const backupCodes = Array.from({ length: 10 }, () =>
    Math.random().toString(36).substring(2, 10).toUpperCase()
  );

  return {
    secret: secret.base32,
    qrCode,
    backupCodes,
  };
}

/**
 * Verifica se o token TOTP é válido
 */
export function verifyTwoFactorToken(
  secret: string,
  token: string,
  window: number = 2
): TwoFactorVerification {
  try {
    const isValid = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window,
    });

    return {
      isValid: !!isValid,
      message: isValid ? 'Token válido' : 'Token inválido ou expirado',
    };
  } catch (error) {
    return {
      isValid: false,
      message: 'Erro ao verificar token',
    };
  }
}

/**
 * Verifica se o código de backup é válido
 */
export function verifyBackupCode(
  backupCode: string,
  storedBackupCodes: string[]
): boolean {
  return storedBackupCodes.includes(backupCode.toUpperCase());
}

/**
 * Habilita 2FA para um usuário
 */
export async function enableTwoFactor(
  userId: number,
  secret: string,
  backupCodes: string[]
): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  // Aqui você salvaria no banco de dados
  // await db.user.update({
  //   where: { id: userId },
  //   data: {
  //     twoFactorSecret: secret,
  //     twoFactorBackupCodes: backupCodes,
  //     twoFactorEnabled: true,
  //   },
  // });
}

/**
 * Desabilita 2FA para um usuário
 */
export async function disableTwoFactor(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  // await db.user.update({
  //   where: { id: userId },
  //   data: {
  //     twoFactorSecret: null,
  //     twoFactorBackupCodes: [],
  //     twoFactorEnabled: false,
  //   },
  // });
}

/**
 * Gera novos códigos de backup
 */
export function generateNewBackupCodes(): string[] {
  return Array.from({ length: 10 }, () =>
    Math.random().toString(36).substring(2, 10).toUpperCase()
  );
}
