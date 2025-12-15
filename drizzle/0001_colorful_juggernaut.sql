CREATE TABLE `balance_recharges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`paymentMethod` enum('pix','credit_card','debit_card','transfer') NOT NULL,
	`paymentStatus` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`transactionId` varchar(100),
	`referenceCode` varchar(100) NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `balance_recharges_id` PRIMARY KEY(`id`),
	CONSTRAINT `referenceCode_idx` UNIQUE(`referenceCode`)
);
--> statement-breakpoint
CREATE TABLE `family_dependents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`familyId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`cpf` varchar(20),
	`relationship` enum('spouse','child','parent','sibling','other') NOT NULL,
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`qrCodeId` int,
	`balance` decimal(12,2) NOT NULL DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `family_dependents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fleet_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fleetId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('owner','finance','driver') NOT NULL,
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`assignedVehicles` json,
	`invitedAt` timestamp DEFAULT (now()),
	`acceptedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fleet_users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gas_station_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`gasStationId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('supervisor','manager','cashier','attendant') NOT NULL,
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`invitedAt` timestamp DEFAULT (now()),
	`acceptedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gas_station_users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gas_stations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`networkId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`cnpj` varchar(20) NOT NULL,
	`address` text NOT NULL,
	`city` varchar(100) NOT NULL,
	`state` varchar(2) NOT NULL,
	`zipCode` varchar(10),
	`contactPhone` varchar(20),
	`contactEmail` varchar(320),
	`operatingHours` text,
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gas_stations_id` PRIMARY KEY(`id`),
	CONSTRAINT `cnpj_idx` UNIQUE(`cnpj`)
);
--> statement-breakpoint
CREATE TABLE `invitations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invitedByUserId` int NOT NULL,
	`invitedEmail` varchar(320) NOT NULL,
	`profileId` int NOT NULL,
	`profileType` enum('gas_station','fleet','family') NOT NULL,
	`role` enum('supervisor','manager','cashier','attendant','finance','driver','dependent') NOT NULL,
	`token` varchar(255) NOT NULL,
	`status` enum('pending','accepted','expired','cancelled') NOT NULL DEFAULT 'pending',
	`expiresAt` timestamp NOT NULL,
	`acceptedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invitations_id` PRIMARY KEY(`id`),
	CONSTRAINT `invitations_token_unique` UNIQUE(`token`),
	CONSTRAINT `token_idx` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('fuel_purchase','balance_recharge','withdrawal','user_invitation','system_alert','low_balance') NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`relatedEntityId` int,
	`relatedEntityType` varchar(50),
	`read` boolean NOT NULL DEFAULT false,
	`emailSent` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`profileType` enum('gas_station_network','fleet','family') NOT NULL,
	`name` varchar(255) NOT NULL,
	`cnpjCpf` varchar(20) NOT NULL,
	`legalName` text,
	`contactEmail` varchar(320),
	`contactPhone` varchar(20),
	`address` text,
	`city` varchar(100),
	`state` varchar(2),
	`zipCode` varchar(10),
	`country` varchar(100) DEFAULT 'Brasil',
	`taxId` varchar(50),
	`status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
	`balance` decimal(12,2) NOT NULL DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `cnpjCpf_idx` UNIQUE(`cnpjCpf`)
);
--> statement-breakpoint
CREATE TABLE `qr_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(255) NOT NULL,
	`entityType` enum('vehicle','dependent') NOT NULL,
	`entityId` int NOT NULL,
	`profileId` int NOT NULL,
	`status` enum('active','inactive','expired') NOT NULL DEFAULT 'active',
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	`regeneratedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `qr_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `qr_codes_code_unique` UNIQUE(`code`),
	CONSTRAINT `code_idx` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`qrCodeId` int NOT NULL,
	`gasStationId` int NOT NULL,
	`attendantId` int NOT NULL,
	`fuelType` enum('gasoline','diesel','ethanol','lpg','cng') NOT NULL,
	`liters` decimal(8,2) NOT NULL,
	`amountDebited` decimal(12,2) NOT NULL,
	`unitPrice` decimal(8,2) NOT NULL,
	`totalCost` decimal(12,2) NOT NULL,
	`status` enum('completed','pending','failed','refunded') NOT NULL DEFAULT 'completed',
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fleetId` int NOT NULL,
	`licensePlate` varchar(20) NOT NULL,
	`vehicleType` enum('car','truck','van','motorcycle') NOT NULL,
	`brand` varchar(100),
	`model` varchar(100),
	`year` int,
	`fuelType` enum('gasoline','diesel','ethanol','lpg','cng') NOT NULL,
	`status` enum('active','inactive','maintenance') NOT NULL DEFAULT 'active',
	`qrCodeId` int,
	`balance` decimal(12,2) NOT NULL DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vehicles_id` PRIMARY KEY(`id`),
	CONSTRAINT `licensePlate_idx` UNIQUE(`licensePlate`)
);
--> statement-breakpoint
CREATE TABLE `withdrawals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`networkId` int NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`bankAccount` json,
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`requestedAt` timestamp NOT NULL DEFAULT (now()),
	`processedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `withdrawals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('admin','owner','supervisor','manager','cashier','attendant','finance','driver','responsible','dependent') NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `phoneNumber` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `accountType` enum('admin','gas_station','fleet','family') NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `status` enum('active','inactive','suspended') DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `openId_idx` UNIQUE(`openId`);--> statement-breakpoint
CREATE INDEX `profileId_idx` ON `balance_recharges` (`profileId`);--> statement-breakpoint
CREATE INDEX `familyId_idx` ON `family_dependents` (`familyId`);--> statement-breakpoint
CREATE INDEX `qrCodeId_idx` ON `family_dependents` (`qrCodeId`);--> statement-breakpoint
CREATE INDEX `fleetId_idx` ON `fleet_users` (`fleetId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `fleet_users` (`userId`);--> statement-breakpoint
CREATE INDEX `gasStationId_idx` ON `gas_station_users` (`gasStationId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `gas_station_users` (`userId`);--> statement-breakpoint
CREATE INDEX `networkId_idx` ON `gas_stations` (`networkId`);--> statement-breakpoint
CREATE INDEX `invitedByUserId_idx` ON `invitations` (`invitedByUserId`);--> statement-breakpoint
CREATE INDEX `invitedEmail_idx` ON `invitations` (`invitedEmail`);--> statement-breakpoint
CREATE INDEX `profileId_idx` ON `invitations` (`profileId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `notifications` (`type`);--> statement-breakpoint
CREATE INDEX `read_idx` ON `notifications` (`read`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `profiles` (`userId`);--> statement-breakpoint
CREATE INDEX `profileType_idx` ON `profiles` (`profileType`);--> statement-breakpoint
CREATE INDEX `entityType_idx` ON `qr_codes` (`entityType`);--> statement-breakpoint
CREATE INDEX `entityId_idx` ON `qr_codes` (`entityId`);--> statement-breakpoint
CREATE INDEX `profileId_idx` ON `qr_codes` (`profileId`);--> statement-breakpoint
CREATE INDEX `qrCodeId_idx` ON `transactions` (`qrCodeId`);--> statement-breakpoint
CREATE INDEX `gasStationId_idx` ON `transactions` (`gasStationId`);--> statement-breakpoint
CREATE INDEX `attendantId_idx` ON `transactions` (`attendantId`);--> statement-breakpoint
CREATE INDEX `timestamp_idx` ON `transactions` (`timestamp`);--> statement-breakpoint
CREATE INDEX `fleetId_idx` ON `vehicles` (`fleetId`);--> statement-breakpoint
CREATE INDEX `qrCodeId_idx` ON `vehicles` (`qrCodeId`);--> statement-breakpoint
CREATE INDEX `networkId_idx` ON `withdrawals` (`networkId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `withdrawals` (`status`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `accountType_idx` ON `users` (`accountType`);--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `loginMethod`;