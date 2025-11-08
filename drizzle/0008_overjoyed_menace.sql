CREATE TABLE `inventoryItems` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`sku` varchar(100) NOT NULL,
	`category` varchar(100) NOT NULL,
	`description` text,
	`unitPrice` varchar(20) NOT NULL,
	`costPrice` varchar(20) NOT NULL,
	`currentStock` varchar(20) DEFAULT '0',
	`minimumStock` varchar(20) DEFAULT '10',
	`maximumStock` varchar(20) DEFAULT '1000',
	`reorderPoint` varchar(20) DEFAULT '20',
	`unit` varchar(50) NOT NULL,
	`supplier` varchar(255),
	`lastRestockDate` timestamp,
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventoryItems_id` PRIMARY KEY(`id`),
	CONSTRAINT `inventoryItems_sku_unique` UNIQUE(`sku`)
);
--> statement-breakpoint
CREATE TABLE `reorderOrders` (
	`id` varchar(64) NOT NULL,
	`inventoryItemId` varchar(64) NOT NULL,
	`organizationId` varchar(64) NOT NULL,
	`quantity` varchar(20) NOT NULL,
	`status` enum('pending','ordered','received','canceled') DEFAULT 'pending',
	`orderDate` timestamp DEFAULT (now()),
	`expectedDelivery` timestamp,
	`actualDelivery` timestamp,
	`supplier` varchar(255),
	`cost` varchar(20),
	`notes` text,
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `reorderOrders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stockAlerts` (
	`id` varchar(64) NOT NULL,
	`inventoryItemId` varchar(64) NOT NULL,
	`alertType` enum('low_stock','overstock','expired','reorder_needed') NOT NULL,
	`severity` enum('low','medium','high','critical') DEFAULT 'medium',
	`message` text NOT NULL,
	`isResolved` varchar(5) DEFAULT 'false',
	`resolvedAt` timestamp,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `stockAlerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stockMovements` (
	`id` varchar(64) NOT NULL,
	`inventoryItemId` varchar(64) NOT NULL,
	`type` enum('in','out','adjustment','damage','return') NOT NULL,
	`quantity` varchar(20) NOT NULL,
	`reason` varchar(255),
	`reference` varchar(100),
	`notes` text,
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `stockMovements_id` PRIMARY KEY(`id`)
);
