CREATE TABLE `clients` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320),
	`phone` varchar(50),
	`company` varchar(255),
	`address` text,
	`city` varchar(100),
	`state` varchar(100),
	`postcode` varchar(20),
	`notes` text,
	`tags` text,
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);
