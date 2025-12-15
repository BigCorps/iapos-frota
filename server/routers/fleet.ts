import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import {
  requireActiveStatus,
  isFleetOwner,
  canAccessFleetData,
} from "../_core/authorization";
import {
  getDb,
  getVehicleById,
  getVehiclesByFleetId,
  getFleetUsersByFleetId,
} from "../db";
import { vehicles, fleetUsers, InsertVehicle } from "../../drizzle/schema";

/**
 * Fleet Router - Handles fleet and vehicle management
 */
export const fleetRouter = router({
  /**
   * Get vehicle by ID
   */
  getVehicle: protectedProcedure
    .input((input: unknown) => {
      if (typeof input === "object" && input !== null && "vehicleId" in input) {
        return { vehicleId: (input as { vehicleId: unknown }).vehicleId };
      }
      throw new Error("Invalid input");
    })
    .query(async ({ ctx, input }) => {
      requireActiveStatus(ctx.user);

      const vehicle = await getVehicleById(input.vehicleId as number);
      if (!vehicle) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Vehicle not found",
        });
      }

      // Check authorization
      const canAccess = await canAccessFleetData(ctx.user, vehicle.fleetId);
      if (!canAccess && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this vehicle",
        });
      }

      return {
        id: vehicle.id,
        fleetId: vehicle.fleetId,
        licensePlate: vehicle.licensePlate,
        vehicleType: vehicle.vehicleType,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        fuelType: vehicle.fuelType,
        status: vehicle.status,
        balance: vehicle.balance,
        createdAt: vehicle.createdAt,
      };
    }),

  /**
   * Get all vehicles in a fleet
   */
  getFleetVehicles: protectedProcedure
    .input((input: unknown) => {
      if (typeof input === "object" && input !== null && "fleetId" in input) {
        return { fleetId: (input as { fleetId: unknown }).fleetId };
      }
      throw new Error("Invalid input");
    })
    .query(async ({ ctx, input }) => {
      requireActiveStatus(ctx.user);

      // Check authorization
      const canAccess = await canAccessFleetData(ctx.user, input.fleetId as number);
      if (!canAccess && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this fleet",
        });
      }

      const vehicles_list = await getVehiclesByFleetId(input.fleetId as number);
      return vehicles_list.map((v) => ({
        id: v.id,
        licensePlate: v.licensePlate,
        brand: v.brand,
        model: v.model,
        fuelType: v.fuelType,
        status: v.status,
        balance: v.balance,
      }));
    }),

  /**
   * Create new vehicle
   */
  createVehicle: protectedProcedure
    .input((input: unknown) => {
      if (
        typeof input === "object" &&
        input !== null &&
        "fleetId" in input &&
        "licensePlate" in input &&
        "vehicleType" in input &&
        "fuelType" in input
      ) {
        return {
          fleetId: (input as { fleetId: unknown }).fleetId as number,
          licensePlate: (input as { licensePlate: unknown }).licensePlate as string,
          vehicleType: (input as { vehicleType: unknown }).vehicleType as
            | "car"
            | "truck"
            | "van"
            | "motorcycle",
          fuelType: (input as { fuelType: unknown }).fuelType as
            | "gasoline"
            | "diesel"
            | "ethanol"
            | "lpg"
            | "cng",
          brand: (input as { brand?: unknown }).brand as string | undefined,
          model: (input as { model?: unknown }).model as string | undefined,
          year: (input as { year?: unknown }).year as number | undefined,
        };
      }
      throw new Error("Invalid input");
    })
    .mutation(async ({ ctx, input }) => {
      requireActiveStatus(ctx.user);

      // Check authorization
      const isOwner = await isFleetOwner(ctx.user, input.fleetId);
      if (!isOwner && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to create vehicles",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const newVehicle: InsertVehicle = {
        fleetId: input.fleetId,
        licensePlate: input.licensePlate,
        vehicleType: input.vehicleType,
        fuelType: input.fuelType,
        brand: input.brand || null,
        model: input.model || null,
        year: input.year || null,
        status: "active",
        balance: "0",
      };

      const result = await db.insert(vehicles).values(newVehicle);
      const vehicleId = result[0].insertId as number;

      const created = await getVehicleById(vehicleId);
      if (!created) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create vehicle",
        });
      }

      return {
        id: created.id,
        licensePlate: created.licensePlate,
        brand: created.brand,
        model: created.model,
        status: created.status,
      };
    }),

  /**
   * Update vehicle
   */
  updateVehicle: protectedProcedure
    .input((input: unknown) => {
      if (typeof input === "object" && input !== null && "vehicleId" in input) {
        return {
          vehicleId: (input as { vehicleId: unknown }).vehicleId as number,
          status: (input as { status?: unknown }).status as
            | "active"
            | "inactive"
            | "maintenance"
            | undefined,
        };
      }
      throw new Error("Invalid input");
    })
    .mutation(async ({ ctx, input }) => {
      requireActiveStatus(ctx.user);

      const vehicle = await getVehicleById(input.vehicleId);
      if (!vehicle) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Vehicle not found",
        });
      }

      // Check authorization
      const isOwner = await isFleetOwner(ctx.user, vehicle.fleetId);
      if (!isOwner && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this vehicle",
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
      if (input.status !== undefined) updateData.status = input.status;

      await db
        .update(vehicles)
        .set(updateData)
        .where(eq(vehicles.id, input.vehicleId));

      const updated = await getVehicleById(input.vehicleId);
      return {
        id: updated!.id,
        licensePlate: updated!.licensePlate,
        status: updated!.status,
      };
    }),

  /**
   * Get fleet users
   */
  getFleetUsers: protectedProcedure
    .input((input: unknown) => {
      if (typeof input === "object" && input !== null && "fleetId" in input) {
        return { fleetId: (input as { fleetId: unknown }).fleetId };
      }
      throw new Error("Invalid input");
    })
    .query(async ({ ctx, input }) => {
      requireActiveStatus(ctx.user);

      // Check authorization
      const canAccess = await canAccessFleetData(ctx.user, input.fleetId as number);
      if (!canAccess && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this fleet",
        });
      }

      const users = await getFleetUsersByFleetId(input.fleetId as number);
      return users.map((u) => ({
        id: u.id,
        userId: u.userId,
        role: u.role,
        status: u.status,
        assignedVehicles: u.assignedVehicles || [],
      }));
    }),
});
