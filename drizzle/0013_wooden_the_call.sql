CREATE TABLE `purchaseOrderItems` (
	`id` varchar(64) NOT NULL,
	`purchaseOrderId` varchar(64) NOT NULL,
	`inventoryItemId` varchar(64) NOT NULL,
	`quantity` varchar(20) NOT NULL,
	`unitPrice` varchar(20) NOT NULL,
	`lineTotal` varchar(20) NOT NULL,
	`receivedQuantity` varchar(20) DEFAULT '0',
	`status` enum('pending','partial','received','canceled') DEFAULT 'pending',
	CONSTRAINT `purchaseOrderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `purchaseOrders` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64) NOT NULL,
	`supplierId` varchar(64) NOT NULL,
	`poNumber` varchar(50),
	`status` enum('draft','sent','confirmed','shipped','received','canceled') DEFAULT 'draft',
	`orderDate` timestamp DEFAULT (now()),
	`expectedDeliveryDate` timestamp,
	`actualDeliveryDate` timestamp,
	`totalAmount` varchar(20) NOT NULL,
	`notes` text,
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `purchaseOrders_id` PRIMARY KEY(`id`),
	CONSTRAINT `purchaseOrders_poNumber_unique` UNIQUE(`poNumber`)
);
--> statement-breakpoint
CREATE TABLE `supplierPricing` (
	`id` varchar(64) NOT NULL,
	`supplierId` varchar(64) NOT NULL,
	`inventoryItemId` varchar(64) NOT NULL,
	`price` varchar(20) NOT NULL,
	`currency` varchar(5) DEFAULT 'AUD',
	`minimumQuantity` varchar(20) DEFAULT '1',
	`effectiveFrom` timestamp DEFAULT (now()),
	`effectiveTo` timestamp,
	`isActive` varchar(5) DEFAULT 'true',
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `supplierPricing_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320),
	`phone` varchar(20),
	`address` text,
	`city` varchar(100),
	`state` varchar(50),
	`zipCode` varchar(20),
	`country` varchar(100),
	`leadTime` varchar(50),
	`minimumOrderQuantity` varchar(20),
	`paymentTerms` varchar(100),
	`rating` varchar(5) DEFAULT '0',
	`isActive` varchar(5) DEFAULT 'true',
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `suppliers_id` PRIMARY KEY(`id`)
);
