CREATE TABLE `fieldActivityLogs` (
	`id` varchar(64) NOT NULL,
	`projectId` varchar(64) NOT NULL,
	`allocationId` varchar(64),
	`activityType` enum('material_usage','task_completion','photo_capture','location_update','issue_report') NOT NULL,
	`description` text,
	`quantity` varchar(20),
	`latitude` varchar(20),
	`longitude` varchar(20),
	`photoUrl` text,
	`offlineSync` varchar(5) DEFAULT 'false',
	`syncedAt` timestamp,
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `fieldActivityLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `offlineDataQueue` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`projectId` varchar(64) NOT NULL,
	`dataType` varchar(100) NOT NULL,
	`payload` text NOT NULL,
	`status` enum('pending','synced','failed') DEFAULT 'pending',
	`syncAttempts` varchar(5) DEFAULT '0',
	`lastError` text,
	`createdAt` timestamp DEFAULT (now()),
	`syncedAt` timestamp,
	CONSTRAINT `offlineDataQueue_id` PRIMARY KEY(`id`)
);
