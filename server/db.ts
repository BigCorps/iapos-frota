import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, profiles, gasStations, vehicles, familyDependents, qrCodes } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================
// User Queries
// ============================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
      // Campos obrigatórios com valores padrão
      accountType: user.accountType || "family",
      role: user.role || "dependent",
    };
    const updateSet: Record<string, unknown> = {};

    // Campos de texto opcionais
    const textFields = ["name", "email"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    }
    if (user.accountType !== undefined) {
      values.accountType = user.accountType;
      updateSet.accountType = user.accountType;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================
// Profile Queries
// ============================================

export async function getProfileById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(profiles).where(eq(profiles.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getProfilesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.select().from(profiles).where(eq(profiles.userId, userId));
  return result;
}

// ============================================
// Gas Station Queries
// ============================================

export async function getGasStationsByNetworkId(networkId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.select().from(gasStations).where(eq(gasStations.networkId, networkId));
  return result;
}

export async function getGasStationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(gasStations).where(eq(gasStations.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================
// Vehicle Queries
// ============================================

export async function getVehiclesByFleetId(fleetId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.select().from(vehicles).where(eq(vehicles.fleetId, fleetId));
  return result;
}

export async function getVehicleById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(vehicles).where(eq(vehicles.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================
// Family Dependent Queries
// ============================================

export async function getDependentsByFamilyId(familyId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.select().from(familyDependents).where(eq(familyDependents.familyId, familyId));
  return result;
}

export async function getDependentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(familyDependents).where(eq(familyDependents.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================
// QR Code Queries
// ============================================

export async function getQRCodeByCode(code: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(qrCodes).where(eq(qrCodes.code, code)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getQRCodesByEntityId(entityId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.select().from(qrCodes).where(eq(qrCodes.entityId, entityId));
  return result;
}

// ============================================
// Gas Station User Queries
// ============================================

import { gasStationUsers, fleetUsers } from "../drizzle/schema";

export async function getGasStationUsersByGasStationId(gasStationId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.select().from(gasStationUsers).where(eq(gasStationUsers.gasStationId, gasStationId));
  return result;
}

// ============================================
// Fleet User Queries
// ============================================

export async function getFleetUsersByFleetId(fleetId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.select().from(fleetUsers).where(eq(fleetUsers.fleetId, fleetId));
  return result;
}

// TODO: add more feature queries here as your schema grows.