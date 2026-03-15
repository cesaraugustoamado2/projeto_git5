/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "@prisma/client";
export * from "./_core/errors";

// Re-export common Prisma types for convenience
export type { Prisma } from "@prisma/client";
