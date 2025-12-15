import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import {
  requireActiveStatus,
  requireAccountType,
  isFleetOwner,
  isFamilyResponsible,
  isGasStationNetworkOwner,
} from "../_core/authorization";
import { getDb, getProfileById, getProfilesByUserId } from "../db";
import { profiles, InsertProfile } from "../../drizzle/schema";

/**
 * Profile Router - Handles profile management for networks, fleets, and families
 */
export const profileRouter = router({
  /**
   * Get profile by ID
   */
  getProfile: protectedProcedure
    .input((input: unknown) => {
      if (typeof input === "object" && input !== null && "profileId" in input) {
        return { profileId: (input as { profileId: unknown }).profileId };
      }
      throw new Error("Invalid input");
    })
    .query(async ({ ctx, input }) => {
      requireActiveStatus(ctx.user);

      const profile = await getProfileById(input.profileId as number);
      if (!profile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Profile not found",
        });
      }

      // Check if user has access to this profile
      const userProfiles = await getProfilesByUserId(ctx.user.id);
      const hasAccess = userProfiles.some((p) => p.id === profile.id);

      if (!hasAccess && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this profile",
        });
      }

      return {
        id: profile.id,
        profileType: profile.profileType,
        name: profile.name,
        cnpjCpf: profile.cnpjCpf,
        legalName: profile.legalName,
        contactEmail: profile.contactEmail,
        contactPhone: profile.contactPhone,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        zipCode: profile.zipCode,
        status: profile.status,
        balance: profile.balance,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      };
    }),

  /**
   * Get all user profiles
   */
  getMyProfiles: protectedProcedure.query(async ({ ctx }) => {
    requireActiveStatus(ctx.user);

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
   * Create new profile (network, fleet, or family)
   */
  createProfile: protectedProcedure
    .input((input: unknown) => {
      if (
        typeof input === "object" &&
        input !== null &&
        "profileType" in input &&
        "name" in input &&
        "cnpjCpf" in input
      ) {
        return {
          profileType: (input as { profileType: unknown }).profileType as
            | "gas_station_network"
            | "fleet"
            | "family",
          name: (input as { name: unknown }).name as string,
          cnpjCpf: (input as { cnpjCpf: unknown }).cnpjCpf as string,
          legalName: (input as { legalName?: unknown }).legalName as
            | string
            | undefined,
          contactEmail: (input as { contactEmail?: unknown }).contactEmail as
            | string
            | undefined,
          contactPhone: (input as { contactPhone?: unknown }).contactPhone as
            | string
            | undefined,
          address: (input as { address?: unknown }).address as
            | string
            | undefined,
          city: (input as { city?: unknown }).city as string | undefined,
          state: (input as { state?: unknown }).state as string | undefined,
          zipCode: (input as { zipCode?: unknown }).zipCode as
            | string
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

      // Validate profile type matches user account type
      const profileTypeToAccountType: Record<string, string> = {
        gas_station_network: "gas_station",
        fleet: "fleet",
        family: "family",
      };

      const requiredAccountType = profileTypeToAccountType[input.profileType];
      if (ctx.user.accountType !== requiredAccountType) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Your account type doesn't match this profile type`,
        });
      }

      const newProfile: InsertProfile = {
        userId: ctx.user.id,
        profileType: input.profileType,
        name: input.name,
        cnpjCpf: input.cnpjCpf,
        legalName: input.legalName || null,
        contactEmail: input.contactEmail || null,
        contactPhone: input.contactPhone || null,
        address: input.address || null,
        city: input.city || null,
        state: input.state || null,
        zipCode: input.zipCode || null,
        status: "active",
        balance: "0",
      };

      const result = await db.insert(profiles).values(newProfile);
      const profileId = result[0].insertId as number;

      const created = await getProfileById(profileId);
      if (!created) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create profile",
        });
      }

      return {
        id: created.id,
        profileType: created.profileType,
        name: created.name,
        status: created.status,
        balance: created.balance,
      };
    }),

  /**
   * Update profile
   */
  updateProfile: protectedProcedure
    .input((input: unknown) => {
      if (typeof input === "object" && input !== null && "profileId" in input) {
        return {
          profileId: (input as { profileId: unknown }).profileId as number,
          name: (input as { name?: unknown }).name as string | undefined,
          contactEmail: (input as { contactEmail?: unknown })
            .contactEmail as string | undefined,
          contactPhone: (input as { contactPhone?: unknown })
            .contactPhone as string | undefined,
          address: (input as { address?: unknown }).address as
            | string
            | undefined,
          city: (input as { city?: unknown }).city as string | undefined,
          state: (input as { state?: unknown }).state as string | undefined,
          zipCode: (input as { zipCode?: unknown }).zipCode as
            | string
            | undefined,
        };
      }
      throw new Error("Invalid input");
    })
    .mutation(async ({ ctx, input }) => {
      requireActiveStatus(ctx.user);

      const profile = await getProfileById(input.profileId);
      if (!profile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Profile not found",
        });
      }

      // Only owner can update profile
      if (profile.userId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this profile",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const updateData: Record<string, unknown> = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.contactEmail !== undefined)
        updateData.contactEmail = input.contactEmail;
      if (input.contactPhone !== undefined)
        updateData.contactPhone = input.contactPhone;
      if (input.address !== undefined) updateData.address = input.address;
      if (input.city !== undefined) updateData.city = input.city;
      if (input.state !== undefined) updateData.state = input.state;
      if (input.zipCode !== undefined) updateData.zipCode = input.zipCode;

      await db
        .update(profiles)
        .set(updateData)
        .where(eq(profiles.id, input.profileId));

      const updated = await getProfileById(input.profileId);
      return {
        id: updated!.id,
        name: updated!.name,
        status: updated!.status,
        balance: updated!.balance,
      };
    }),

  /**
   * Get profile balance
   */
  getBalance: protectedProcedure
    .input((input: unknown) => {
      if (typeof input === "object" && input !== null && "profileId" in input) {
        return { profileId: (input as { profileId: unknown }).profileId };
      }
      throw new Error("Invalid input");
    })
    .query(async ({ ctx, input }) => {
      requireActiveStatus(ctx.user);

      const profile = await getProfileById(input.profileId as number);
      if (!profile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Profile not found",
        });
      }

      // Check access
      const userProfiles = await getProfilesByUserId(ctx.user.id);
      const hasAccess = userProfiles.some((p) => p.id === profile.id);

      if (!hasAccess && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this profile",
        });
      }

      return {
        profileId: profile.id,
        balance: profile.balance,
        currency: "BRL",
      };
    }),
});
