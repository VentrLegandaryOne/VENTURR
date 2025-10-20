CREATE TABLE `measurements` (
	`id` varchar(64) NOT NULL,
	`projectId` varchar(64) NOT NULL,
	`deviceId` varchar(100),
	`measurementData` text,
	`drawingData` text,
	`scale` varchar(20),
	`notes` text,
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `measurements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `memberships` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`organizationId` varchar(64) NOT NULL,
	`role` enum('owner','admin','member') NOT NULL DEFAULT 'member',
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `memberships_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`ownerId` varchar(64) NOT NULL,
	`subscriptionPlan` enum('starter','pro','growth','enterprise') NOT NULL DEFAULT 'starter',
	`subscriptionStatus` enum('active','trialing','canceled','incomplete','past_due') NOT NULL DEFAULT 'trialing',
	`stripeCustomerId` varchar(255),
	`stripeSubscriptionId` varchar(255),
	`currentPeriodEnd` timestamp,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `organizations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`address` text,
	`clientName` varchar(255),
	`clientEmail` varchar(320),
	`clientPhone` varchar(50),
	`propertyType` enum('residential','commercial','industrial') DEFAULT 'residential',
	`status` enum('draft','quoted','approved','in_progress','completed','canceled') NOT NULL DEFAULT 'draft',
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quotes` (
	`id` varchar(64) NOT NULL,
	`projectId` varchar(64) NOT NULL,
	`quoteNumber` varchar(50) NOT NULL,
	`version` varchar(10) DEFAULT '1',
	`subtotal` varchar(20) NOT NULL,
	`gst` varchar(20) NOT NULL,
	`total` varchar(20) NOT NULL,
	`deposit` varchar(20),
	`validUntil` timestamp,
	`status` enum('draft','sent','viewed','accepted','rejected') NOT NULL DEFAULT 'draft',
	`items` text,
	`terms` text,
	`notes` text,
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `takeoffs` (
	`id` varchar(64) NOT NULL,
	`projectId` varchar(64) NOT NULL,
	`roofLength` varchar(20),
	`roofWidth` varchar(20),
	`roofArea` varchar(20),
	`roofType` varchar(100),
	`roofPitch` varchar(50),
	`wastePercentage` varchar(10),
	`labourRate` varchar(20),
	`profitMargin` varchar(10),
	`includeGst` varchar(10),
	`materials` text,
	`calculations` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `takeoffs_id` PRIMARY KEY(`id`)
);
