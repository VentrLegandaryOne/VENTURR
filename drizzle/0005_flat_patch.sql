CREATE TABLE `auditLogs` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`organizationId` varchar(64),
	`action` varchar(100) NOT NULL,
	`resourceType` varchar(100) NOT NULL,
	`resourceId` varchar(64) NOT NULL,
	`changes` text,
	`metadata` text,
	`ipAddress` varchar(50),
	`userAgent` text,
	`status` enum('success','failure') NOT NULL DEFAULT 'success',
	`errorMessage` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
