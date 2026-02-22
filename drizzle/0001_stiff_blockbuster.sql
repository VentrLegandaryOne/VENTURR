CREATE TABLE `complianceRules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ruleCode` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`category` varchar(100) NOT NULL,
	`authority` varchar(255) NOT NULL,
	`applicableRegions` json,
	`requirements` json,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `complianceRules_id` PRIMARY KEY(`id`),
	CONSTRAINT `complianceRules_ruleCode_unique` UNIQUE(`ruleCode`)
);
--> statement-breakpoint
CREATE TABLE `materials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` varchar(100) NOT NULL,
	`supplier` varchar(255),
	`specifications` json,
	`unitPrice` int,
	`unit` varchar(50),
	`installationRequirements` text,
	`complianceNotes` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `materials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`fileUrl` text NOT NULL,
	`fileType` varchar(50),
	`fileSize` int,
	`extractedData` json,
	`status` enum('uploaded','processing','completed','failed') NOT NULL DEFAULT 'uploaded',
	`progressPercentage` int NOT NULL DEFAULT 0,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`processedAt` timestamp,
	CONSTRAINT `quotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`verificationId` int NOT NULL,
	`pdfKey` varchar(500) NOT NULL,
	`pdfUrl` text NOT NULL,
	`pdfSize` int,
	`sharedWith` json,
	`downloadCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	CONSTRAINT `reports_id` PRIMARY KEY(`id`),
	CONSTRAINT `reports_verificationId_unique` UNIQUE(`verificationId`)
);
--> statement-breakpoint
CREATE TABLE `verifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quoteId` int NOT NULL,
	`overallScore` int NOT NULL,
	`pricingScore` int NOT NULL,
	`materialsScore` int NOT NULL,
	`complianceScore` int NOT NULL,
	`warrantyScore` int NOT NULL,
	`statusBadge` enum('green','amber','red') NOT NULL,
	`pricingDetails` json,
	`materialsDetails` json,
	`complianceDetails` json,
	`warrantyDetails` json,
	`flags` json,
	`recommendations` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `verifications_id` PRIMARY KEY(`id`),
	CONSTRAINT `verifications_quoteId_unique` UNIQUE(`quoteId`)
);
