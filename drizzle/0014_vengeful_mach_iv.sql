CREATE TABLE `laborCostsSummary` (
	`id` varchar(64) NOT NULL,
	`projectId` varchar(64) NOT NULL,
	`totalHours` varchar(10) DEFAULT '0',
	`totalCost` varchar(20) DEFAULT '0',
	`averageHourlyRate` varchar(20) DEFAULT '0',
	`budgetedHours` varchar(10) DEFAULT '0',
	`variance` varchar(10) DEFAULT '0',
	`lastUpdated` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `laborCostsSummary_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `laborTimesheets` (
	`id` varchar(64) NOT NULL,
	`projectId` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`date` timestamp NOT NULL,
	`hoursWorked` varchar(10) NOT NULL,
	`hourlyRate` varchar(20) NOT NULL,
	`totalCost` varchar(20) NOT NULL,
	`taskDescription` text,
	`status` enum('draft','submitted','approved','invoiced','paid') DEFAULT 'draft',
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `laborTimesheets_id` PRIMARY KEY(`id`)
);
