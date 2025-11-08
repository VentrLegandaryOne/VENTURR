CREATE TABLE `projectBudgetTracking` (
	`id` varchar(64) NOT NULL,
	`projectId` varchar(64) NOT NULL,
	`budgetedAmount` varchar(20) NOT NULL,
	`actualAmount` varchar(20) DEFAULT '0',
	`variance` varchar(20) DEFAULT '0',
	`variancePercentage` varchar(10) DEFAULT '0',
	`status` enum('on_track','at_risk','over_budget','under_budget') DEFAULT 'on_track',
	`lastUpdated` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projectBudgetTracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projectCosts` (
	`id` varchar(64) NOT NULL,
	`projectId` varchar(64) NOT NULL,
	`costType` enum('material','labor','equipment','subcontractor','other') NOT NULL,
	`description` varchar(255) NOT NULL,
	`amount` varchar(20) NOT NULL,
	`quantity` varchar(20),
	`unitPrice` varchar(20),
	`allocationId` varchar(64),
	`invoiceId` varchar(64),
	`status` enum('estimated','actual','invoiced','paid') DEFAULT 'estimated',
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projectCosts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projectProfitability` (
	`id` varchar(64) NOT NULL,
	`projectId` varchar(64) NOT NULL,
	`quoteAmount` varchar(20) NOT NULL,
	`invoicedAmount` varchar(20) DEFAULT '0',
	`totalCosts` varchar(20) DEFAULT '0',
	`grossProfit` varchar(20) DEFAULT '0',
	`profitMargin` varchar(10) DEFAULT '0',
	`status` enum('profitable','break_even','loss') DEFAULT 'profitable',
	`lastCalculated` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projectProfitability_id` PRIMARY KEY(`id`)
);
