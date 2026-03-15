import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

let _db: PrismaClient | null = null;

// Lazily create the Prisma instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
      });
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// Disconnect from database
export async function disconnectDb() {
  if (_db) {
    await _db.$disconnect();
    _db = null;
  }
}

// ============================================================================
// MULTI-TENANT HELPERS
// ============================================================================

/**
 * Validates that the autoescolaId belongs to the current user/tenant context.
 * This should be called in every query to ensure data isolation.
 */
export function validateTenantAccess(autoescolaId: string, userAutoescolaId: string): void {
  if (autoescolaId !== userAutoescolaId) {
    throw new Error("Unauthorized: Tenant mismatch");
  }
}

/**
 * Get autoescola by ID with full context
 */
export async function getAutoescolaById(autoescolaId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get autoescola: database not available");
    return null;
  }

  return db.autoescola.findUnique({
    where: { id: autoescolaId },
    include: {
      configuracoes: true,
    },
  });
}

/**
 * Get cliente by ID with tenant isolation
 */
export async function getClienteById(autoescolaId: string, clienteId: string) {
  const db = await getDb();
  if (!db) return null;

  return db.cliente.findFirst({
    where: {
      id: clienteId,
      autoescolaId, // CRITICAL: Always filter by tenant
    },
  });
}

/**
 * Get or create cliente by WhatsApp ID
 */
export async function getOrCreateClienteByWhatsappId(
  autoescolaId: string,
  whatsappId: string,
  clienteData?: { nome?: string; telefone?: string; email?: string }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Try to find existing cliente
  let cliente = await db.cliente.findFirst({
    where: {
      autoescolaId,
      whatsappId,
    },
  });

  // Create if doesn't exist
  if (!cliente && clienteData) {
    cliente = await db.cliente.create({
      data: {
        autoescolaId,
        whatsappId,
        nome: clienteData.nome || "Cliente",
        telefone: clienteData.telefone || "",
        email: clienteData.email,
        statusInteresse: "novo",
      },
    });
  }

  return cliente;
}

/**
 * Get or create conversa by cliente
 */
export async function getOrCreateConversa(autoescolaId: string, clienteId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let conversa = await db.conversa.findFirst({
    where: {
      autoescolaId,
      clienteId,
    },
  });

  if (!conversa) {
    conversa = await db.conversa.create({
      data: {
        autoescolaId,
        clienteId,
        mensagens: [],
        statusConversa: "ativa",
      },
    });
  }

  return conversa;
}

/**
 * Add message to conversa history
 */
export async function addMensagemToConversa(
  autoescolaId: string,
  conversaId: string,
  mensagem: {
    role: "user" | "assistant";
    content: string;
    tipo?: "texto" | "funcao";
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conversa = await db.conversa.findFirst({
    where: {
      id: conversaId,
      autoescolaId, // CRITICAL: Validate tenant
    },
  });

  if (!conversa) {
    throw new Error("Conversa not found or unauthorized");
  }

  const mensagens = Array.isArray(conversa.mensagens) ? conversa.mensagens : [];
  const novasMensagens = [
    ...mensagens,
    {
      ...mensagem,
      timestamp: new Date().toISOString(),
    },
  ];

  return db.conversa.update({
    where: { id: conversaId },
    data: {
      mensagens: novasMensagens,
      ultimaMensagemEm: new Date(),
    },
  });
}

/**
 * Create venda record
 */
export async function createVenda(
  autoescolaId: string,
  clienteId: string,
  conversaId: string,
  vendaData: {
    tipoServico: string;
    valor: number;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Validate tenant access
  const cliente = await getClienteById(autoescolaId, clienteId);
  if (!cliente) {
    throw new Error("Cliente not found or unauthorized");
  }

  return db.venda.create({
    data: {
      autoescolaId,
      clienteId,
      conversaId,
      tipoServico: vendaData.tipoServico,
      valor: vendaData.valor,
      statusVenda: "pendente",
    },
  });
}

/**
 * Get conversas by autoescola with pagination
 */
export async function getConversasByAutoescola(
  autoescolaId: string,
  skip: number = 0,
  take: number = 20
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.conversa.findMany({
    where: { autoescolaId },
    include: {
      cliente: true,
    },
    skip,
    take,
    orderBy: { ultimaMensagemEm: "desc" },
  });
}

/**
 * Get vendas by autoescola with pagination
 */
export async function getVendasByAutoescola(
  autoescolaId: string,
  skip: number = 0,
  take: number = 20
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.venda.findMany({
    where: { autoescolaId },
    include: {
      cliente: true,
    },
    skip,
    take,
    orderBy: { dataVenda: "desc" },
  });
}

/**
 * Get clientes by autoescola with search and pagination
 */
export async function getClientesByAutoescola(
  autoescolaId: string,
  search?: string,
  skip: number = 0,
  take: number = 20
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const where: any = { autoescolaId };

  if (search) {
    where.OR = [
      { nome: { contains: search, mode: "insensitive" } },
      { telefone: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  return db.cliente.findMany({
    where,
    skip,
    take,
    orderBy: { criadoEm: "desc" },
  });
}

/**
 * Count clientes by autoescola
 */
export async function countClientesByAutoescola(autoescolaId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.cliente.count({
    where: { autoescolaId },
  });
}

/**
 * Count vendas by autoescola
 */
export async function countVendasByAutoescola(autoescolaId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.venda.count({
    where: { autoescolaId },
  });
}

/**
 * Get vendas by date range for dashboard
 */
export async function getVendasByDateRange(
  autoescolaId: string,
  dataInicio: Date,
  dataFim: Date
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.venda.findMany({
    where: {
      autoescolaId,
      dataVenda: {
        gte: dataInicio,
        lte: dataFim,
      },
    },
    include: {
      cliente: true,
    },
  });
}

// ============================================================================
// USER MANAGEMENT (for OAuth integration)
// ============================================================================

/**
 * Get user by OpenId
 */
export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.user.findUnique({
    where: { openId },
  });

  return result || undefined;
}

/**
 * Upsert user (create or update)
 */
export async function upsertUser(user: {
  openId: string;
  name?: string | null;
  email?: string | null;
  loginMethod?: string | null;
  lastSignedIn?: Date;
  role?: string;
}): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const updateData: any = {};

    if (user.name !== undefined) updateData.name = user.name;
    if (user.email !== undefined) updateData.email = user.email;
    if (user.loginMethod !== undefined) updateData.loginMethod = user.loginMethod;
    if (user.lastSignedIn !== undefined) updateData.lastSignedIn = user.lastSignedIn;
    if (user.role !== undefined) updateData.role = user.role;

    // Always update lastSignedIn if not provided
    if (!updateData.lastSignedIn) {
      updateData.lastSignedIn = new Date();
    }

    await db.user.upsert({
      where: { openId: user.openId },
      update: updateData,
      create: {
        openId: user.openId,
        name: user.name,
        email: user.email,
        loginMethod: user.loginMethod,
        lastSignedIn: user.lastSignedIn || new Date(),
        role: user.role || "user",
      },
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
