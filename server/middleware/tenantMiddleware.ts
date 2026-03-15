import type { Request, Response, NextFunction } from "express";
import { jwtVerify } from "jose";
import { ENV } from "../_core/env";

/**
 * Tenant Context attached to request
 */
export interface TenantContext {
  autoescolaId: string;
  userId: string;
  role: string;
}

/**
 * Extend Express Request to include tenant context
 */
declare global {
  namespace Express {
    interface Request {
      tenant?: TenantContext;
    }
  }
}

/**
 * Extract JWT token from Authorization header
 */
function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Verify and decode JWT token
 */
async function verifyToken(token: string): Promise<any> {
  try {
    const secret = new TextEncoder().encode(ENV.jwtSecret);
    const verified = await jwtVerify(token, secret);
    return verified.payload;
  } catch (error) {
    console.error("[TenantMiddleware] Token verification failed:", error);
    return null;
  }
}

/**
 * Middleware para identificar e validar tenant via JWT
 * 
 * O token JWT deve conter:
 * - autoescolaId: ID da autoescola
 * - userId: ID do usuário
 * - role: Papel do usuário (admin, user)
 */
export async function tenantMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractToken(req);

    if (!token) {
      res.status(401).json({ error: "Missing or invalid authorization token" });
      return;
    }

    const payload = await verifyToken(token);

    if (!payload) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    // Validate required fields
    if (!payload.autoescolaId || !payload.userId) {
      res.status(401).json({ error: "Invalid token payload: missing required fields" });
      return;
    }

    // Attach tenant context to request
    req.tenant = {
      autoescolaId: payload.autoescolaId,
      userId: payload.userId,
      role: payload.role || "user",
    };

    next();
  } catch (error) {
    console.error("[TenantMiddleware] Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Middleware para garantir que o usuário é admin
 */
export function adminMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.tenant) {
    res.status(401).json({ error: "Unauthorized: tenant context not found" });
    return;
  }

  if (req.tenant.role !== "admin") {
    res.status(403).json({ error: "Forbidden: admin role required" });
    return;
  }

  next();
}

/**
 * Validar que o autoescolaId na query/params corresponde ao tenant do usuário
 */
export function validateTenantAccess(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.tenant) {
    res.status(401).json({ error: "Unauthorized: tenant context not found" });
    return;
  }

  // Get autoescolaId from query, params, or body
  const autoescolaId =
    req.query.autoescolaId ||
    req.params.autoescolaId ||
    req.body?.autoescolaId;

  if (autoescolaId && autoescolaId !== req.tenant.autoescolaId) {
    res.status(403).json({
      error: "Forbidden: you do not have access to this resource",
    });
    return;
  }

  next();
}

/**
 * Gerar JWT token para um tenant
 */
export async function generateTenantToken(
  autoescolaId: string,
  userId: string,
  role: string = "user"
): Promise<string> {
  try {
    const secret = new TextEncoder().encode(ENV.jwtSecret);
    const token = await new (await import("jose")).SignJWT({
      autoescolaId,
      userId,
      role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .sign(secret);

    return token;
  } catch (error) {
    console.error("[TenantMiddleware] Failed to generate token:", error);
    throw error;
  }
}
