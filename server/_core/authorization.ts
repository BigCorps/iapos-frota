import { TRPCError } from "@trpc/server";
import type { User } from "../../drizzle/schema";
import {
  getProfileById,
  getGasStationUsersByGasStationId,
  getFleetUsersByFleetId,
} from "../db";

/**
 * Authorization helpers for IAPOS multi-level access control
 */

/**
 * Check if user is admin
 */
export function isAdmin(user: User): boolean {
  return user.role === "admin" && user.accountType === "admin";
}

/**
 * Check if user is owner of a gas station network
 */
export async function isGasStationNetworkOwner(
  user: User,
  networkId: number
): Promise<boolean> {
  if (user.accountType !== "gas_station") {
    return false;
  }

  const profile = await getProfileById(networkId);
  if (!profile || profile.profileType !== "gas_station_network") {
    return false;
  }

  return profile.userId === user.id && user.role === "owner";
}

/**
 * Check if user is supervisor of a gas station network
 */
export async function isGasStationNetworkSupervisor(
  user: User,
  networkId: number
): Promise<boolean> {
  if (user.accountType !== "gas_station") {
    return false;
  }

  const profile = await getProfileById(networkId);
  if (!profile || profile.profileType !== "gas_station_network") {
    return false;
  }

  return (
    (profile.userId === user.id && user.role === "owner") ||
    user.role === "supervisor"
  );
}

/**
 * Check if user can manage a specific gas station
 */
export async function canManageGasStation(
  user: User,
  gasStationId: number,
  networkId: number
): Promise<boolean> {
  // Owner can manage all stations in their network
  if (await isGasStationNetworkOwner(user, networkId)) {
    return true;
  }

  // Supervisor can manage all stations
  if (user.role === "supervisor") {
    return true;
  }

  // Manager can only manage their assigned station
  if (user.role === "manager") {
    const stationUsers = await getGasStationUsersByGasStationId(gasStationId);
    return stationUsers.some((su) => su.userId === user.id);
  }

  return false;
}

/**
 * Check if user is owner of a fleet
 */
export async function isFleetOwner(
  user: User,
  fleetId: number
): Promise<boolean> {
  if (user.accountType !== "fleet") {
    return false;
  }

  const profile = await getProfileById(fleetId);
  if (!profile || profile.profileType !== "fleet") {
    return false;
  }

  return profile.userId === user.id && user.role === "owner";
}

/**
 * Check if user can access fleet data
 */
export async function canAccessFleetData(
  user: User,
  fleetId: number
): Promise<boolean> {
  if (user.accountType !== "fleet") {
    return false;
  }

  const profile = await getProfileById(fleetId);
  if (!profile || profile.profileType !== "fleet") {
    return false;
  }

  // Owner and Finance can access all fleet data
  if (user.role === "owner" || user.role === "finance") {
    const fleetUsers = await getFleetUsersByFleetId(fleetId);
    return fleetUsers.some((fu) => fu.userId === user.id);
  }

  // Driver can only access their assigned vehicles
  if (user.role === "driver") {
    const fleetUsers = await getFleetUsersByFleetId(fleetId);
    return fleetUsers.some((fu) => fu.userId === user.id);
  }

  return false;
}

/**
 * Check if user is owner of a family
 */
export async function isFamilyResponsible(
  user: User,
  familyId: number
): Promise<boolean> {
  if (user.accountType !== "family") {
    return false;
  }

  const profile = await getProfileById(familyId);
  if (!profile || profile.profileType !== "family") {
    return false;
  }

  return profile.userId === user.id && user.role === "responsible";
}

/**
 * Check if user can access family data
 */
export async function canAccessFamilyData(
  user: User,
  familyId: number
): Promise<boolean> {
  if (user.accountType !== "family") {
    return false;
  }

  const profile = await getProfileById(familyId);
  if (!profile || profile.profileType !== "family") {
    return false;
  }

  // Responsible can access all family data
  if (user.role === "responsible") {
    return profile.userId === user.id;
  }

  // Dependent can only access their own data
  if (user.role === "dependent") {
    return profile.userId === user.id;
  }

  return false;
}

/**
 * Check if user is attendant (frentista)
 */
export function isAttendant(user: User): boolean {
  return user.role === "attendant" && user.accountType === "gas_station";
}

/**
 * Check if user is driver
 */
export function isDriver(user: User): boolean {
  return user.role === "driver" && user.accountType === "fleet";
}

/**
 * Check if user is dependent
 */
export function isDependent(user: User): boolean {
  return user.role === "dependent" && user.accountType === "family";
}

/**
 * Throw error if user doesn't have required role
 */
export function requireRole(
  user: User,
  ...roles: typeof user.role[]
): void {
  if (!roles.includes(user.role)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `This action requires one of these roles: ${roles.join(", ")}`,
    });
  }
}

/**
 * Throw error if user doesn't have required account type
 */
export function requireAccountType(
  user: User,
  ...types: typeof user.accountType[]
): void {
  if (!types.includes(user.accountType)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `This action requires one of these account types: ${types.join(", ")}`,
    });
  }
}

/**
 * Throw error if user is not admin
 */
export function requireAdmin(user: User): void {
  if (!isAdmin(user)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "This action requires admin privileges",
    });
  }
}

/**
 * Throw error if user status is not active
 */
export function requireActiveStatus(user: User): void {
  if (user.status !== "active") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Your account is not active",
    });
  }
}
