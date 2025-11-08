CREATE TABLE `clientCommunications` (
	`id` varchar(64) NOT NULL,
	`clientId` varchar(64) NOT NULL,
	`type` enum('call','email','sms','visit','quote','invoice','note') NOT NULL,
	`subject` varchar(255),
	`content` text,
	`outcome` varchar(100),
	`nextFollowUp` timestamp,
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `clientCommunications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crmClients` (
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
	`clientType` enum('residential','commercial','industrial','government') DEFAULT 'residential',
	`status` enum('lead','prospect','active','inactive','vip') DEFAULT 'prospect',
	`totalSpent` varchar(20) DEFAULT '0',
	`projectCount` varchar(10) DEFAULT '0',
	`lastProjectDate` timestamp,
	`preferredContactMethod` varchar(50),
	`notes` text,
	`tags` text,
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crmClients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64) NOT NULL,
	`projectId` varchar(64),
	`category` enum('materials','labor','equipment','travel','other') NOT NULL,
	`description` varchar(255) NOT NULL,
	`amount` varchar(20) NOT NULL,
	`currency` varchar(3) DEFAULT 'AUD',
	`date` timestamp NOT NULL,
	`receipt` text,
	`status` enum('pending','approved','rejected') DEFAULT 'pending',
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `expenses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `financialReports` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64) NOT NULL,
	`reportType` enum('profit_loss','cash_flow','tax_summary','project_profitability') NOT NULL,
	`period` varchar(50) NOT NULL,
	`totalRevenue` varchar(20) DEFAULT '0',
	`totalExpenses` varchar(20) DEFAULT '0',
	`netProfit` varchar(20) DEFAULT '0',
	`taxAmount` varchar(20) DEFAULT '0',
	`data` text,
	`generatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `financialReports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `intelligentInsights` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64) NOT NULL,
	`insightType` enum('low_stock_warning','project_overbudget','overdue_invoice','high_profit_opportunity','team_utilization','cash_flow_warning','seasonal_trend','cost_optimization') NOT NULL,
	`severity` enum('info','warning','critical') DEFAULT 'info',
	`title` varchar(255) NOT NULL,
	`description` text,
	`recommendation` text,
	`metadata` text,
	`isActionable` varchar(5) DEFAULT 'true',
	`isResolved` varchar(5) DEFAULT 'false',
	`createdAt` timestamp DEFAULT (now()),
	`resolvedAt` timestamp,
	CONSTRAINT `intelligentInsights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64) NOT NULL,
	`projectId` varchar(64),
	`clientId` varchar(64) NOT NULL,
	`invoiceNumber` varchar(50) NOT NULL,
	`status` enum('draft','sent','viewed','paid','overdue','canceled') DEFAULT 'draft',
	`subtotal` varchar(20) NOT NULL,
	`tax` varchar(20) DEFAULT '0',
	`total` varchar(20) NOT NULL,
	`amountPaid` varchar(20) DEFAULT '0',
	`dueDate` timestamp,
	`paidDate` timestamp,
	`currency` varchar(3) DEFAULT 'AUD',
	`notes` text,
	`items` text,
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_invoiceNumber_unique` UNIQUE(`invoiceNumber`)
);
