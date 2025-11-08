CREATE TABLE `workflowAutomations` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`trigger` varchar(50) NOT NULL,
	`triggerCondition` text,
	`action` varchar(50) NOT NULL,
	`actionData` text,
	`isActive` varchar(5) DEFAULT 'true',
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workflowAutomations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workflowExecutionLogs` (
	`id` varchar(64) NOT NULL,
	`workflowId` varchar(64) NOT NULL,
	`organizationId` varchar(64) NOT NULL,
	`status` enum('pending','running','success','failed') DEFAULT 'pending',
	`triggeredBy` varchar(64),
	`executedAt` timestamp,
	`result` text,
	`errorMessage` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `workflowExecutionLogs_id` PRIMARY KEY(`id`)
);
