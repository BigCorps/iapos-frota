import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import {
  requireActiveStatus,
  isFamilyResponsible,
  canAccessFamilyData,
} from "../_core/authorization";
import {
  getDb,
  getFamilyDependentsByFamilyId,
} from "../db";
import { familyDependents, InsertFamilyDependent } from "../../drizzle/schema";

/**
 * Family Router - Handles family and dependent management
 */
export const familyRouter = router({
  /**
   * Get all dependents in a family
   */
  getFamilyDependents: protectedProcedure
    .input((input: unknown) => {
      if (typeof input === "object" && input !== null && "familyId" in input) {
        return { familyId: (input as { familyId: unknown }).familyId };
      }
      throw new Error("Invalid input");
    })
    .query(async ({ ctx, input }) => {
      requireActiveStatus(ctx.user);

      // Check authorization
      const canAccess = await canAccessFamilyData(ctx.user, input.familyId as number);
      if (!canAccess && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this family",
        });
      }

      const dependents = await getFamilyDependentsByFamilyId(input.familyId as number);
      return dependents.map((d) => ({
        id: d.id,
        name: d.name,
        relationship: d.relationship,
        status: d.status,
        balance: d.balance,
        createdAt: d.createdAt,
      }));
    }),

  /**
   * Create new dependent
   */
  createDependent: protectedProcedure
    .input((input: unknown) => {
      if (
        typeof input === "object" &&
        input !== null &&
        "familyId" in input &&
        "name" in input &&
        "relationship" in input
      ) {
        return {
          familyId: (input as { familyId: unknown }).familyId as number,
          name: (input as { name: unknown }).name as string,
          relationship: (input as { relationship: unknown }).relationship as
            | "spouse"
            | "child"
            | "parent"
            | "sibling"
            | "other",
          cpf: (input as { cpf?: unknown }).cpf as string | undefined,
        };
      }
      throw new Error("Invalid input");
    })
    .mutation(async ({ ctx, input }) => {
      requireActiveStatus(ctx.user);

      // Check authorization
      const isResponsible = await isFamilyResponsible(ctx.user, input.familyId);
      if (!isResponsible && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to create dependents",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const newDependent: InsertFamilyDependent = {
        familyId: input.familyId,
        name: input.name,
        relationship: input.relationship,
        cpf: input.cpf || null,
        status: "active",
        balance: "0",
      };

      const result = await db.insert(familyDependents).values(newDependent);
      const dependentId = result[0].insertId as number;

      const dependents = await getFamilyDependentsByFamilyId(input.familyId);
      const created = dependents.find((d) => d.id === dependentId);

      if (!created) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create dependent",
        });
      }

      return {
        id: created.id,
        name: created.name,
        relationship: created.relationship,
        status: created.status,
      };
    }),

  /**
   * Update dependent
   */
  updateDependent: protectedProcedure
    .input((input: unknown) => {
      if (typeof input === "object" && input !== null && "dependentId" in input) {
        return {
          dependentId: (input as { dependentId: unknown }).dependentId as number,
          name: (input as { name?: unknown }).name as string | undefined,
          status: (input as { status?: unknown }).status as
            | "active"
            | "inactive"
            | undefined,
        };
      }
      throw new Error("Invalid input");
    })
    .mutation(async ({ ctx, input }) => {
      requireActiveStatus(ctx.user);

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Get dependent to check family
      const result = await db
        .select()
        .from(familyDependents)
        .where(eq(familyDependents.id, input.dependentId));

      if (result.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Dependent not found",
        });
      }

      const dependent = result[0];

      // Check authorization
      const isResponsible = await isFamilyResponsible(ctx.user, dependent.familyId);
      if (!isResponsible && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this dependent",
        });
      }

      const updateData: Record<string, unknown> = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.status !== undefined) updateData.status = input.status;

      await db
        .update(familyDependents)
        .set(updateData)
        .where(eq(familyDependents.id, input.dependentId));

      const updated = await db
        .select()
        .from(familyDependents)
        .where(eq(familyDependents.id, input.dependentId));

      return {
        id: updated[0].id,
        name: updated[0].name,
        status: updated[0].status,
      };
    }),

  /**
   * Get dependent balance
   */
  getDependentBalance: protectedProcedure
    .input((input: unknown) => {
      if (typeof input === "object" && input !== null && "dependentId" in input) {
        return { dependentId: (input as { dependentId: unknown }).dependentId };
      }
      throw new Error("Invalid input");
    })
    .query(async ({ ctx, input }) => {
      requireActiveStatus(ctx.user);

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const result = await db
        .select()
        .from(familyDependents)
        .where(eq(familyDependents.id, input.dependentId as number));

      if (result.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Dependent not found",
        });
      }

      const dependent = result[0];

      // Check authorization
      const canAccess = await canAccessFamilyData(ctx.user, dependent.familyId);
      if (!canAccess && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this dependent",
        });
      }

      return {
        dependentId: dependent.id,
        name: dependent.name,
        balance: dependent.balance,
        currency: "BRL",
      };
    }),
});
