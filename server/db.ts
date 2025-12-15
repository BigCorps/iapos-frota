import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  users,
  profiles,
  gasStations,
  gasStationUsers,
  vehicles,
  fleetUsers,
  familyDependents,
  qrCodes,
  transactions,
  balanceRecharges,
  withdrawals,
  notifications,
  invitations,
  InsertUser,
  User,
  Profile,
  InsertProfile,
  GasStation,
  Vehicle,
  FleetUser,
  FamilyDependent,
  QRCode,
  Transaction,
  BalanceRecharge,
  Withdrawal,
  Notification,
  Invitation,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

/**
 * Lazily create the drizzle instance so local tooling can run without a DB.
 */
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

/**
 * Upsert user - Create or update user based on openId
 */
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
      accountType: user.accountType || "fleet",
      role: user.role || "user",
    };

    const updateSet: Record<string, unknown> = {};

    // Handle text fields
    const textFields = ["email", "name", "phoneNumber"] as const;
    textFields.forEach((field) => {
      if (user[field] !== undefined) {
        const normalized = user[field] ?? null;
        values[field] = normalized;
        updateSet[field] = normalized;
      }
    });

    // Handle enum fields
    if (user.accountType !== undefined) {
      values.accountType = user.accountType;
      updateSet.accountType = user.accountType;
    }

    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    }

    if (user.status !== undefined) {
      values.status = user.status;
      updateSet.status = user.status;
    }

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    // Set admin role for owner
    if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
      values.accountType = "admin";
      updateSet.accountType = "admin";
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

/**
 * Get user by openId
 */
export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get user by ID
 */
export async function getUserById(id: number): Promise<User | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get profile by ID
 */
export async function getProfileById(id: number): Promise<Profile | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get profile: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get profiles by user ID
 */
export async function getProfilesByUserId(userId: number): Promise<Profile[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get profiles: database not available");
    return [];
  }

  return await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId));
}

/**
 * Create profile
 */
export async function createProfile(profile: InsertProfile): Promise<Profile> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(profiles).values(profile);
  const id = result[0].insertId as number;

  const created = await getProfileById(id);
  if (!created) {
    throw new Error("Failed to create profile");
  }

  return created;
}

/**
 * Get gas station by ID
 */
export async function getGasStationById(
  id: number
): Promise<GasStation | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get gas station: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(gasStations)
    .where(eq(gasStations.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get gas stations by network ID
 */
export async function getGasStationsByNetworkId(
  networkId: number
): Promise<GasStation[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get gas stations: database not available");
    return [];
  }

  return await db
    .select()
    .from(gasStations)
    .where(eq(gasStations.networkId, networkId));
}

/**
 * Get vehicle by ID
 */
export async function getVehicleById(id: number): Promise<Vehicle | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get vehicle: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(vehicles)
    .where(eq(vehicles.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get vehicles by fleet ID
 */
export async function getVehiclesByFleetId(fleetId: number): Promise<Vehicle[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get vehicles: database not available");
    return [];
  }

  return await db
    .select()
    .from(vehicles)
    .where(eq(vehicles.fleetId, fleetId));
}

/**
 * Get QR code by code
 */
export async function getQRCodeByCode(code: string): Promise<QRCode | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get QR code: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(qrCodes)
    .where(eq(qrCodes.code, code))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get QR code by ID
 */
export async function getQRCodeById(id: number): Promise<QRCode | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get QR code: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(qrCodes)
    .where(eq(qrCodes.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get transactions by QR code ID
 */
export async function getTransactionsByQRCodeId(
  qrCodeId: number
): Promise<Transaction[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get transactions: database not available");
    return [];
  }

  return await db
    .select()
    .from(transactions)
    .where(eq(transactions.qrCodeId, qrCodeId));
}

/**
 * Get transactions by gas station ID
 */
export async function getTransactionsByGasStationId(
  gasStationId: number
): Promise<Transaction[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get transactions: database not available");
    return [];
  }

  return await db
    .select()
    .from(transactions)
    .where(eq(transactions.gasStationId, gasStationId));
}

/**
 * Get balance recharges by profile ID
 */
export async function getBalanceRechargesByProfileId(
  profileId: number
): Promise<BalanceRecharge[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get balance recharges: database not available");
    return [];
  }

  return await db
    .select()
    .from(balanceRecharges)
    .where(eq(balanceRecharges.profileId, profileId));
}

/**
 * Get notifications by user ID
 */
export async function getNotificationsByUserId(
  userId: number
): Promise<Notification[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get notifications: database not available");
    return [];
  }

  return await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId));
}

/**
 * Get invitation by token
 */
export async function getInvitationByToken(
  token: string
): Promise<Invitation | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get invitation: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(invitations)
    .where(eq(invitations.token, token))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get family dependents by family ID
 */
export async function getFamilyDependentsByFamilyId(
  familyId: number
): Promise<FamilyDependent[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get family dependents: database not available");
    return [];
  }

  return await db
    .select()
    .from(familyDependents)
    .where(eq(familyDependents.familyId, familyId));
}

/**
 * Get fleet users by fleet ID
 */
export async function getFleetUsersByFleetId(
  fleetId: number
): Promise<FleetUser[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get fleet users: database not available");
    return [];
  }

  return await db
    .select()
    .from(fleetUsers)
    .where(eq(fleetUsers.fleetId, fleetId));
}

/**
 * Get gas station users by gas station ID
 */
export async function getGasStationUsersByGasStationId(
  gasStationId: number
): Promise<typeof gasStationUsers.$inferSelect[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get gas station users: database not available");
    return [];
  }

  return await db
    .select()
    .from(gasStationUsers)
    .where(eq(gasStationUsers.gasStationId, gasStationId));
}

// TODO: Add more feature queries as your schema grows
