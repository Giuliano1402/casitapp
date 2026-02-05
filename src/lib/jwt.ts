import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

const base64UrlEncode = (input: Buffer | string): string => {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buffer
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

const base64UrlDecode = (input: string): Buffer => {
  let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padding = 4 - (base64.length % 4);
  if (padding !== 4) {
    base64 += '='.repeat(padding);
  }
  return Buffer.from(base64, 'base64');
};

export interface JwtPayload {
  sub: number;
  email: string;
  iat: number;
  exp: number;
  [key: string]: any;
}

export const signToken = (
  payload: Omit<JwtPayload, 'iat' | 'exp'>,
  expiresInSeconds = 60 * 60 // 1 hora
): string => {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + expiresInSeconds;

  const fullPayload: JwtPayload = {
    ...payload,
    iat: issuedAt,
    exp: expiresAt,
  };

  const headerEncoded = base64UrlEncode(JSON.stringify(header));
  const payloadEncoded = base64UrlEncode(JSON.stringify(fullPayload));
  const data = `${headerEncoded}.${payloadEncoded}`;

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(data)
    .digest();

  const signatureEncoded = base64UrlEncode(signature);

  return `${data}.${signatureEncoded}`;
};

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    const [headerEncoded, payloadEncoded, signatureEncoded] = token.split('.');
    if (!headerEncoded || !payloadEncoded || !signatureEncoded) {
      return null;
    }

    const data = `${headerEncoded}.${payloadEncoded}`;

    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(data)
      .digest();

    const actualSignature = base64UrlDecode(signatureEncoded);

    if (
      expectedSignature.length !== actualSignature.length ||
      !crypto.timingSafeEqual(expectedSignature, actualSignature)
    ) {
      return null;
    }

    const payloadJson = base64UrlDecode(payloadEncoded).toString('utf8');
    const payload = JSON.parse(payloadJson) as JwtPayload;

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
};

