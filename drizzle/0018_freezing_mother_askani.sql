CREATE TABLE `mobileFieldLogs` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`organizationId` varchar(64) NOT NULL,
	`projectId` varchar(64) NOT NULL,
	`logType` varchar(50) NOT NULL,
	`description` text,
	`photoUrl` text,
	`gpsLocation` varchar(255),
	`duration` varchar(20),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `mobileFieldLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mobileOfflineQueue` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`organizationId` varchar(64) NOT NULL,
	`dataType` varchar(50) NOT NULL,
	`actionType` varchar(20) NOT NULL,
	`payload` text NOT NULL,
	`status` enum('pending','synced','failed') DEFAULT 'pending',
	`syncedAt` timestamp,
	`errorMessage` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `mobileOfflineQueue_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notificationTemplates` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`notificationType` varchar(50) NOT NULL,
	`channel` varchar(20) NOT NULL,
	`subject` varchar(255),
	`template` text NOT NULL,
	`variables` text,
	`isActive` varchar(5) DEFAULT 'true',
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `notificationTemplates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64) NOT NULL,
	`userId` varchar(64),
	`notificationType` varchar(50) NOT NULL,
	`channel` varchar(20) NOT NULL,
	`subject` varchar(255),
	`message` text NOT NULL,
	`status` enum('pending','sent','failed','delivered') DEFAULT 'pending',
	`recipient` varchar(255) NOT NULL,
	`sentAt` timestamp,
	`deliveredAt` timestamp,
	`failureReason` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
