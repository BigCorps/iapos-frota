import { TRPCError } from "@trpc/server";
import { eq, and } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import {
  requireActiveStatus,
  isGasStationNetworkOwner,
  canManageGasStation,
} from "../_core/authorization";
import {
  getDb,
  getGasStationById,
  getGasStationsByNetworkId,
  getGasStationUsersByGasStationId,
} from "../db";
import { gasStations, gasStationUsers, InsertGasStation } from "../../drizzle/schema";

/**
 * Gas Station Router - Handles gas station network management
 */
export const gasStationRouter = router({
  /**
   * Get gas station by ID
   */
  getStation: protectedProcedure
    .input((input: unknown) => {
      if (typeof input === "object" && input !== null && "stationId" in input) {
        return { stationId: (input as { stationId: unknown }).stationId };
      }
      throw new Error("Invalid input");
    })
    .query(async ({ ctx, input }) => {
      requireActiveStatus(ctx.user);

      const station = await getGasStationById(input.stationId as number);
      if (!station) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Gas station not found",
        });
      }

      // Check authorization
      const canManage = await canManageGasStation(
        ctx.user,
        station.id,
        station.networkId
      );
      if (!canManage && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this gas station",
        });
      }

      return {
        id: station.id,
        networkId: station.networkId,
        name: station.name,
        cnpj: station.cnpj,
        address: station.address,
        city: station.city,
        state: station.state,
        zipCode: station.zipCode,
        contactPhone: station.contactPhone,
        contactEmail: station.contactEmail,
        operatingHours: station.operatingHours,
        status: station.status,
        createdAt: station.createdAt,
      };
    }),

  /**
   * Get all gas stations in a network
   */
  getNetworkStations: protectedProcedure
    .input((input: unknown) => {
      if (typeof input === "object" && input !== null && "networkId" in input) {
        return { networkId: (input as { networkId: unknown }).networkId };
      }
      throw new Error("Invalid input");
    })
    .query(async ({ ctx, input }) => {
      requireActiveStatus(ctx.user);

      // Check authorization
      const isOwner = await isGasStationNetworkOwner(
        ctx.user,
        input.networkId as number
      );
      if (!isOwner && ctx.user.role !== "admin" && ctx.user.role !== "supervisor") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this network",
        });
      }

      const stations = await getGasStationsByNetworkId(input.networkId as number);
      return stations.map((s) => ({
        id: s.id,
        name: s.name,
        city: s.city,
        state: s.state,
        status: s.status,
        contactPhone: s.contactPhone,
      }));
    }),

  /**
   * Create new gas station
   */
  createStation: protectedProcedure
    .input((input: unknown) => {
      if (
        typeof input === "object" &&
        input !== null &&
        "networkId" in input &&
        "name" in input &&
        "cnpj" in input &&
        "address" in input &&
        "city" in input &&
        "state" in input
      ) {
        return {
          networkId: (input as { networkId: unknown }).networkId as number,
          name: (input as { name: unknown }).name as string,
          cnpj: (input as { cnpj: unknown }).cnpj as string,
          address: (input as { address: unknown }).address as string,
          city: (input as { city: unknown }).city as string,
          state: (input as { state: unknown }).state as string,
          zipCode: (input as { zipCode?: unknown }).zipCode as string | undefined,
          contactPhone: (input as { contactPhone?: unknown }).contactPhone as
            | string
            | undefined,
          contactEmail: (input as { contactEmail?: unknown }).contactEmail as
            | string
            | undefined,
          operatingHours: (input as { operatingHours?: unknown })
            .operatingHours as string | undefined,
        };
      }
      throw new Error("Invalid input");
    })
    .mutation(async ({ ctx, input }) => {
      requireActiveStatus(ctx.user);

      // Check authorization
      const isOwner = await isGasStationNetworkOwner(ctx.user, input.networkId);
      if (!isOwner && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to create gas stations",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const newStation: InsertGasStation = {
        networkId: input.networkId,
        name: input.name,
        cnpj: input.cnpj,
        address: input.address,
        city: input.city,
        state: input.state,
        zipCode: input.zipCode || null,
        contactPhone: input.contactPhone || null,
        contactEmail: input.contactEmail || null,
        operatingHours: input.operatingHours || null,
        status: "active",
      };

      const result = await db.insert(gasStations).values(newStation);
      const stationId = result[0].insertId as number;

      const created = await getGasStationById(stationId);
      if (!created) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create gas station",
        });
      }

      return {
        id: created.id,
        name: created.name,
        city: created.city,
        status: created.status,
      };
    }),

  /**
   * Update gas station
   */
  updateStation: protectedProcedure
    .input((input: unknown) => {
      if (typeof input === "object" && input !== null && "stationId" in input) {
        return {
          stationId: (input as { stationId: unknown }).stationId as number,
          name: (input as { name?: unknown }).name as string | undefined,
          address: (input as { address?: unknown }).address as string | undefined,
          city: (input as { city?: unknown }).city as string | undefined,
          state: (input as { state?: unknown }).state as string | undefined,
          contactPhone: (input as { contactPhone?: unknown }).contactPhone as
            | string
            | undefined,
          contactEmail: (input as { contactEmail?: unknown }).contactEmail as
            | string
            | undefined,
          operatingHours: (input as { operatingHours?: unknown })
            .operatingHours as string | undefined,
        };
      }
      throw new Error("Invalid input");
    })
    .mutation(async ({ ctx, input }) => {
      requireActiveStatus(ctx.user);

      const station = await getGasStationById(input.stationId);
      if (!station) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Gas station not found",
        });
      }

      // Check authorization
      const canManage = await canManageGasStation(
        ctx.user,
        station.id,
        station.networkId
      );
      if (!canManage && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this gas station",
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
      if (input.address !== undefined) updateData.address = input.address;
      if (input.city !== undefined) updateData.city = input.city;
      if (input.state !== undefined) updateData.state = input.state;
      if (input.contactPhone !== undefined)
        updateData.contactPhone = input.contactPhone;
      if (input.contactEmail !== undefined)
        updateData.contactEmail = input.contactEmail;
      if (input.operatingHours !== undefined)
        updateData.operatingHours = input.operatingHours;

      await db
        .update(gasStations)
        .set(updateData)
        .where(eq(gasStations.id, input.stationId));

      const updated = await getGasStationById(input.stationId);
      return {
        id: updated!.id,
        name: updated!.name,
        status: updated!.status,
      };
    }),

  /**
   * Get gas station users
   */
  getStationUsers: protectedProcedure
    .input((input: unknown) => {
      if (typeof input === "object" && input !== null && "stationId" in input) {
        return { stationId: (input as { stationId: unknown }).stationId };
      }
      throw new Error("Invalid input");
    })
    .query(async ({ ctx, input }) => {
      requireActiveStatus(ctx.user);

      const station = await getGasStationById(input.stationId as number);
      if (!station) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Gas station not found",
        });
      }

      // Check authorization
      const canManage = await canManageGasStation(
        ctx.user,
        station.id,
        station.networkId
      );
      if (!canManage && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this gas station",
        });
      }

      const users = await getGasStationUsersByGasStationId(input.stationId as number);
      return users.map((u) => ({
        id: u.id,
        userId: u.userId,
        role: u.role,
        status: u.status,
        acceptedAt: u.acceptedAt,
      }));
    }),
});
