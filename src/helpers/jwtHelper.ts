import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';

export interface AppJwtPayload extends JwtPayload {
  id: string;
  role: string;
  email?: string;
  sessionId?: string;
}

// ✅ Create Token
const createToken = (
  payload: object,
  secret: Secret,
  expireTime: string
) => {
  return jwt.sign(payload, secret, {
    expiresIn: expireTime,
  } as SignOptions);
};

// ✅ Verify Token (SAFE TYPING)
const verifyToken = <T extends object = AppJwtPayload>(
  token: string,
  secret: Secret
): T => {
  return jwt.verify(token, secret) as T;
};

export const jwtHelper = {
  createToken,
  verifyToken,
};