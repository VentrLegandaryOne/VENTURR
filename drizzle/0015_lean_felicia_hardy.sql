CREATE TABLE `customerDocuments` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64) NOT NULL,
	`clientId` varchar(64) NOT NULL,
	`projectId` varchar(64) NOT NULL,
	`documentName` varchar(255) NOT NULL,
	`documentType` varchar(50) NOT NULL,
	`fileUrl` text NOT NULL,
	`fileSize` varchar(20),
	`uploadedAt` timestamp DEFAULT (now()),
	CONSTRAINT `customerDocuments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customerInvoices` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64) NOT NULL,
	`clientId` varchar(64) NOT NULL,
	`projectId` varchar(64) NOT NULL,
	`invoiceNumber` varchar(50),
	`amount` varchar(20) NOT NULL,
	`currency` varchar(5) DEFAULT 'AUD',
	`status` enum('draft','sent','viewed','overdue','paid','canceled') DEFAULT 'draft',
	`issueDate` timestamp DEFAULT (now()),
	`dueDate` timestamp,
	`paidDate` timestamp,
	`notes` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customerInvoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `customerInvoices_invoiceNumber_unique` UNIQUE(`invoiceNumber`)
);
--> statement-breakpoint
CREATE TABLE `customerPortalAccess` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64) NOT NULL,
	`clientId` varchar(64) NOT NULL,
	`accessToken` varchar(255),
	`expiresAt` timestamp,
	`isActive` varchar(5) DEFAULT 'true',
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `customerPortalAccess_id` PRIMARY KEY(`id`),
	CONSTRAINT `customerPortalAccess_accessToken_unique` UNIQUE(`accessToken`)
);
