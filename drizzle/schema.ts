import {
  int,
  varchar,
  text,
  decimal,
  timestamp,
  mysqlEnum,
  mysqlTable,
  boolean,
  json,
  uniqueIndex,
  index,
} from "drizzle-orm/mysql-core";

/**
 * IAPOS - Gestão de Frotas e Rede de Postos
 * Schema Drizzle com todas as tabelas necessárias
 */

// ==================== USERS ====================

/**
 * Tabela de usuários - Armazena informações de autenticação e perfil básico
 */
export const users = mysqlTable(
  "users",
  {
    id: int("id").autoincrement().primaryKey(),
    openId: varchar("openId", { length: 64 }).notNull().unique(),
    email: varchar("email", { length: 320 }),
    name: text("name"),
    phoneNumber: varchar("phoneNumber", { length: 20 }),
    accountType: mysqlEnum("accountType", [
      "admin",
      "gas_station",
      "fleet",
      "family",
    ]).notNull(),
    role: mysqlEnum("role", [
      "admin",
      "owner",
      "supervisor",
      "manager",
      "cashier",
      "attendant",
      "finance",
      "driver",
      "responsible",
      "dependent",
    ]).notNull(),
    status: mysqlEnum("status", ["active", "inactive", "suspended"])
      .notNull()
      .default("active"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  },
  (table) => ({
    openIdIdx: uniqueIndex("openId_idx").on(table.openId),
    emailIdx: index("email_idx").on(table.email),
    accountTypeIdx: index("accountType_idx").on(table.accountType),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ==================== PROFILES ====================

/**
 * Tabela de perfis - Armazena informações de negócio para Redes, Frotas e Famílias
 */
export const profiles = mysqlTable(
  "profiles",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    profileType: mysqlEnum("profileType", [
      "gas_station_network",
      "fleet",
      "family",
    ]).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    cnpjCpf: varchar("cnpjCpf", { length: 20 }).notNull(),
    legalName: text("legalName"),
    contactEmail: varchar("contactEmail", { length: 320 }),
    contactPhone: varchar("contactPhone", { length: 20 }),
    address: text("address"),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 2 }),
    zipCode: varchar("zipCode", { length: 10 }),
    country: varchar("country", { length: 100 }).default("Brasil"),
    taxId: varchar("taxId", { length: 50 }),
    status: mysqlEnum("status", ["active", "inactive", "suspended"])
      .notNull()
      .default("active"),
    balance: decimal("balance", { precision: 12, scale: 2 })
      .notNull()
      .default("0"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("userId_idx").on(table.userId),
    profileTypeIdx: index("profileType_idx").on(table.profileType),
    cnpjCpfIdx: uniqueIndex("cnpjCpf_idx").on(table.cnpjCpf),
  })
);

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;

// ==================== GAS STATIONS ====================

/**
 * Tabela de postos - Armazena informações de cada posto dentro de uma rede
 */
export const gasStations = mysqlTable(
  "gas_stations",
  {
    id: int("id").autoincrement().primaryKey(),
    networkId: int("networkId").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    cnpj: varchar("cnpj", { length: 20 }).notNull(),
    address: text("address").notNull(),
    city: varchar("city", { length: 100 }).notNull(),
    state: varchar("state", { length: 2 }).notNull(),
    zipCode: varchar("zipCode", { length: 10 }),
    contactPhone: varchar("contactPhone", { length: 20 }),
    contactEmail: varchar("contactEmail", { length: 320 }),
    operatingHours: text("operatingHours"),
    status: mysqlEnum("status", ["active", "inactive"])
      .notNull()
      .default("active"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    networkIdIdx: index("networkId_idx").on(table.networkId),
    cnpjIdx: uniqueIndex("cnpj_idx").on(table.cnpj),
  })
);

export type GasStation = typeof gasStations.$inferSelect;
export type InsertGasStation = typeof gasStations.$inferInsert;

// ==================== GAS STATION USERS ====================

/**
 * Tabela de usuários de postos - Relacionamento entre usuários e postos
 */
export const gasStationUsers = mysqlTable(
  "gas_station_users",
  {
    id: int("id").autoincrement().primaryKey(),
    gasStationId: int("gasStationId").notNull(),
    userId: int("userId").notNull(),
    role: mysqlEnum("role", [
      "supervisor",
      "manager",
      "cashier",
      "attendant",
    ]).notNull(),
    status: mysqlEnum("status", ["active", "inactive"])
      .notNull()
      .default("active"),
    invitedAt: timestamp("invitedAt").defaultNow(),
    acceptedAt: timestamp("acceptedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    gasStationIdIdx: index("gasStationId_idx").on(table.gasStationId),
    userIdIdx: index("userId_idx").on(table.userId),
  })
);

export type GasStationUser = typeof gasStationUsers.$inferSelect;
export type InsertGasStationUser = typeof gasStationUsers.$inferInsert;

// ==================== VEHICLES ====================

/**
 * Tabela de veículos - Armazena informações de veículos cadastrados em frotas
 */
export const vehicles = mysqlTable(
  "vehicles",
  {
    id: int("id").autoincrement().primaryKey(),
    fleetId: int("fleetId").notNull(),
    licensePlate: varchar("licensePlate", { length: 20 }).notNull(),
    vehicleType: mysqlEnum("vehicleType", [
      "car",
      "truck",
      "van",
      "motorcycle",
    ]).notNull(),
    brand: varchar("brand", { length: 100 }),
    model: varchar("model", { length: 100 }),
    year: int("year"),
    fuelType: mysqlEnum("fuelType", [
      "gasoline",
      "diesel",
      "ethanol",
      "lpg",
      "cng",
    ]).notNull(),
    status: mysqlEnum("status", ["active", "inactive", "maintenance"])
      .notNull()
      .default("active"),
    qrCodeId: int("qrCodeId"),
    balance: decimal("balance", { precision: 12, scale: 2 })
      .notNull()
      .default("0"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    fleetIdIdx: index("fleetId_idx").on(table.fleetId),
    licensePlateIdx: uniqueIndex("licensePlate_idx").on(table.licensePlate),
    qrCodeIdIdx: index("qrCodeId_idx").on(table.qrCodeId),
  })
);

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = typeof vehicles.$inferInsert;

// ==================== FLEET USERS ====================

/**
 * Tabela de usuários de frota - Relacionamento entre usuários e frotas
 */
export const fleetUsers = mysqlTable(
  "fleet_users",
  {
    id: int("id").autoincrement().primaryKey(),
    fleetId: int("fleetId").notNull(),
    userId: int("userId").notNull(),
    role: mysqlEnum("role", ["owner", "finance", "driver"]).notNull(),
    status: mysqlEnum("status", ["active", "inactive"])
      .notNull()
      .default("active"),
    assignedVehicles: json("assignedVehicles").$type<number[]>(),
    invitedAt: timestamp("invitedAt").defaultNow(),
    acceptedAt: timestamp("acceptedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    fleetIdIdx: index("fleetId_idx").on(table.fleetId),
    userIdIdx: index("userId_idx").on(table.userId),
  })
);

export type FleetUser = typeof fleetUsers.$inferSelect;
export type InsertFleetUser = typeof fleetUsers.$inferInsert;

// ==================== FAMILY DEPENDENTS ====================

/**
 * Tabela de dependentes de família - Armazena informações de dependentes
 */
export const familyDependents = mysqlTable(
  "family_dependents",
  {
    id: int("id").autoincrement().primaryKey(),
    familyId: int("familyId").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    cpf: varchar("cpf", { length: 20 }),
    relationship: mysqlEnum("relationship", [
      "spouse",
      "child",
      "parent",
      "sibling",
      "other",
    ]).notNull(),
    status: mysqlEnum("status", ["active", "inactive"])
      .notNull()
      .default("active"),
    qrCodeId: int("qrCodeId"),
    balance: decimal("balance", { precision: 12, scale: 2 })
      .notNull()
      .default("0"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    familyIdIdx: index("familyId_idx").on(table.familyId),
    qrCodeIdIdx: index("qrCodeId_idx").on(table.qrCodeId),
  })
);

export type FamilyDependent = typeof familyDependents.$inferSelect;
export type InsertFamilyDependent = typeof familyDependents.$inferInsert;

// ==================== QR CODES ====================

/**
 * Tabela de QR codes - Armazena QR codes únicos para identificação
 */
export const qrCodes = mysqlTable(
  "qr_codes",
  {
    id: int("id").autoincrement().primaryKey(),
    code: varchar("code", { length: 255 }).notNull().unique(),
    entityType: mysqlEnum("entityType", ["vehicle", "dependent"]).notNull(),
    entityId: int("entityId").notNull(),
    profileId: int("profileId").notNull(),
    status: mysqlEnum("status", ["active", "inactive", "expired"])
      .notNull()
      .default("active"),
    generatedAt: timestamp("generatedAt").defaultNow().notNull(),
    expiresAt: timestamp("expiresAt"),
    regeneratedAt: timestamp("regeneratedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    codeIdx: uniqueIndex("code_idx").on(table.code),
    entityTypeIdx: index("entityType_idx").on(table.entityType),
    entityIdIdx: index("entityId_idx").on(table.entityId),
    profileIdIdx: index("profileId_idx").on(table.profileId),
  })
);

export type QRCode = typeof qrCodes.$inferSelect;
export type InsertQRCode = typeof qrCodes.$inferInsert;

// ==================== TRANSACTIONS ====================

/**
 * Tabela de transações - Armazena todas as transações de abastecimento
 */
export const transactions = mysqlTable(
  "transactions",
  {
    id: int("id").autoincrement().primaryKey(),
    qrCodeId: int("qrCodeId").notNull(),
    gasStationId: int("gasStationId").notNull(),
    attendantId: int("attendantId").notNull(),
    fuelType: mysqlEnum("fuelType", [
      "gasoline",
      "diesel",
      "ethanol",
      "lpg",
      "cng",
    ]).notNull(),
    liters: decimal("liters", { precision: 8, scale: 2 }).notNull(),
    amountDebited: decimal("amountDebited", { precision: 12, scale: 2 })
      .notNull(),
    unitPrice: decimal("unitPrice", { precision: 8, scale: 2 }).notNull(),
    totalCost: decimal("totalCost", { precision: 12, scale: 2 }).notNull(),
    status: mysqlEnum("status", [
      "completed",
      "pending",
      "failed",
      "refunded",
    ])
      .notNull()
      .default("completed"),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    qrCodeIdIdx: index("qrCodeId_idx").on(table.qrCodeId),
    gasStationIdIdx: index("gasStationId_idx").on(table.gasStationId),
    attendantIdIdx: index("attendantId_idx").on(table.attendantId),
    timestampIdx: index("timestamp_idx").on(table.timestamp),
  })
);

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

// ==================== BALANCE RECHARGES ====================

/**
 * Tabela de recargas de saldo - Armazena histórico de recargas
 */
export const balanceRecharges = mysqlTable(
  "balance_recharges",
  {
    id: int("id").autoincrement().primaryKey(),
    profileId: int("profileId").notNull(),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    paymentMethod: mysqlEnum("paymentMethod", [
      "pix",
      "credit_card",
      "debit_card",
      "transfer",
    ]).notNull(),
    paymentStatus: mysqlEnum("paymentStatus", [
      "pending",
      "completed",
      "failed",
      "refunded",
    ])
      .notNull()
      .default("pending"),
    transactionId: varchar("transactionId", { length: 100 }),
    referenceCode: varchar("referenceCode", { length: 100 }).notNull(),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    completedAt: timestamp("completedAt"),
  },
  (table) => ({
    profileIdIdx: index("profileId_idx").on(table.profileId),
    referenceCodeIdx: uniqueIndex("referenceCode_idx").on(table.referenceCode),
  })
);

export type BalanceRecharge = typeof balanceRecharges.$inferSelect;
export type InsertBalanceRecharge = typeof balanceRecharges.$inferInsert;

// ==================== WITHDRAWALS ====================

/**
 * Tabela de resgates - Armazena histórico de resgates de valores
 */
export const withdrawals = mysqlTable(
  "withdrawals",
  {
    id: int("id").autoincrement().primaryKey(),
    networkId: int("networkId").notNull(),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    bankAccount: json("bankAccount").$type<{
      accountHolder: string;
      bankCode: string;
      accountNumber: string;
      accountType: string;
    }>(),
    status: mysqlEnum("status", [
      "pending",
      "processing",
      "completed",
      "failed",
    ])
      .notNull()
      .default("pending"),
    requestedAt: timestamp("requestedAt").defaultNow().notNull(),
    processedAt: timestamp("processedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    networkIdIdx: index("networkId_idx").on(table.networkId),
    statusIdx: index("status_idx").on(table.status),
  })
);

export type Withdrawal = typeof withdrawals.$inferSelect;
export type InsertWithdrawal = typeof withdrawals.$inferInsert;

// ==================== NOTIFICATIONS ====================

/**
 * Tabela de notificações - Armazena notificações do sistema
 */
export const notifications = mysqlTable(
  "notifications",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    type: mysqlEnum("type", [
      "fuel_purchase",
      "balance_recharge",
      "withdrawal",
      "user_invitation",
      "system_alert",
      "low_balance",
    ]).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(),
    relatedEntityId: int("relatedEntityId"),
    relatedEntityType: varchar("relatedEntityType", { length: 50 }),
    read: boolean("read").notNull().default(false),
    emailSent: boolean("emailSent").notNull().default(false),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("userId_idx").on(table.userId),
    typeIdx: index("type_idx").on(table.type),
    readIdx: index("read_idx").on(table.read),
  })
);

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// ==================== INVITATIONS ====================

/**
 * Tabela de convites - Armazena convites para novos usuários
 */
export const invitations = mysqlTable(
  "invitations",
  {
    id: int("id").autoincrement().primaryKey(),
    invitedByUserId: int("invitedByUserId").notNull(),
    invitedEmail: varchar("invitedEmail", { length: 320 }).notNull(),
    profileId: int("profileId").notNull(),
    profileType: mysqlEnum("profileType", [
      "gas_station",
      "fleet",
      "family",
    ]).notNull(),
    role: mysqlEnum("role", [
      "supervisor",
      "manager",
      "cashier",
      "attendant",
      "finance",
      "driver",
      "dependent",
    ]).notNull(),
    token: varchar("token", { length: 255 }).notNull().unique(),
    status: mysqlEnum("status", [
      "pending",
      "accepted",
      "expired",
      "cancelled",
    ])
      .notNull()
      .default("pending"),
    expiresAt: timestamp("expiresAt").notNull(),
    acceptedAt: timestamp("acceptedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    invitedByUserIdIdx: index("invitedByUserId_idx").on(table.invitedByUserId),
    invitedEmailIdx: index("invitedEmail_idx").on(table.invitedEmail),
    profileIdIdx: index("profileId_idx").on(table.profileId),
    tokenIdx: uniqueIndex("token_idx").on(table.token),
  })
);

export type Invitation = typeof invitations.$inferSelect;
export type InsertInvitation = typeof invitations.$inferInsert;
