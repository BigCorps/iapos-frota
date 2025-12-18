import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb, getUserById, getProfilesByUserId } from "../db";

/**
 * Auth Router - Handles authentication and user profile management
 */
export const authRouter = router({
  /**
   * Get current user info
   */
  me: publicProcedure.query(({ ctx }) => {
    if (!ctx.user) {
      return null;
    }
    return {
      id: ctx.user.id,
      openId: ctx.user.openId,
      email: ctx.user.email,
      name: ctx.user.name,
      phoneNumber: ctx.user.phoneNumber,
      accountType: ctx.user.accountType,
      role: ctx.user.role,
      status: ctx.user.status,
      createdAt: ctx.user.createdAt,
      lastSignedIn: ctx.user.lastSignedIn,
    };
  }),

  /**
   * Get user profiles (Rede de Postos, Frota, Família)
   */
  getMyProfiles: protectedProcedure.query(async ({ ctx }) => {
    const profiles = await getProfilesByUserId(ctx.user.id);
    return profiles.map((p) => ({
      id: p.id,
      profileType: p.profileType,
      name: p.name,
      cnpjCpf: p.cnpjCpf,
      status: p.status,
      balance: p.balance,
      createdAt: p.createdAt,
    }));
  }),

  /**
   * Logout - Clear session (Vercel serverless compatible)
   * Note: In serverless, session clearing is handled client-side
   */
  logout: publicProcedure.mutation(() => {
    // Em ambiente serverless, o cookie deve ser limpo no cliente
    // Retornamos success para o cliente fazer o logout
    return { success: true };
  }),

  /**
   * Get user by ID (admin only)
   */
  getUserById: protectedProcedure
    .input((input: unknown) => {
      if (typeof input === "object" && input !== null && "userId" in input) {
        return { userId: (input as { userId: unknown }).userId };
      }
      throw new Error("Invalid input");
    })
    .query(async ({ ctx, input }) => {
      // Only admins can view other users
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can view user details",
        });
      }

      const user = await getUserById(input.userId as number);
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return {
        id: user.id,
        openId: user.openId,
        email: user.email,
        name: user.name,
        accountType: user.accountType,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        lastSignedIn: user.lastSignedIn,
      };
    }),

  /**
   * Suspend user (admin only)
   */
  suspendUser: protectedProcedure
    .input((input: unknown) => {
      if (typeof input === "object" && input !== null && "userId" in input) {
        return { userId: (input as { userId: unknown }).userId };
      }
      throw new Error("Invalid input");
    })
    .mutation(async ({ ctx, input }) => {
      // Only admins can suspend users
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can suspend users",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const userId = input.userId as number;

      // Cannot suspend self
      if (userId === ctx.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot suspend your own account",
        });
      }

      await db
        .update(users)
        .set({ status: "suspended" })
        .where(eq(users.id, userId));

      return { success: true };
    }),

  /**
   * Activate user (admin only)
   */
  activateUser: protectedProcedure
    .input((input: unknown) => {
      if (typeof input === "object" && input !== null && "userId" in input) {
        return { userId: (input as { userId: unknown }).userId };
      }
      throw new Error("Invalid input");
    })
    .mutation(async ({ ctx, input }) => {
      // Only admins can activate users
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can activate users",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const userId = input.userId as number;

      await db
        .update(users)
        .set({ status: "active" })
        .where(eq(users.id, userId));

      return { success: true };
    }),
});

// Import users table for mutations
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";