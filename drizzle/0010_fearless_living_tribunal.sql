CREATE TABLE `materialAllocations` (
	`id` varchar(64) NOT NULL,
	`projectId` varchar(64) NOT NULL,
	`inventoryItemId` varchar(64) NOT NULL,
	`allocatedQuantity` varchar(20) NOT NULL,
	`usedQuantity` varchar(20) DEFAULT '0',
	`status` enum('reserved','in_use','completed','returned') NOT NULL DEFAULT 'reserved',
	`allocationDate` timestamp DEFAULT (now()),
	`completionDate` timestamp,
	`notes` text,
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `materialAllocations_id` PRIMARY KEY(`id`)
);
