CREATE TABLE `projectBudgets` (
	`id` varchar(64) NOT NULL,
	`projectId` varchar(64) NOT NULL,
	`budgetedAmount` varchar(20) NOT NULL,
	`spentAmount` varchar(20) DEFAULT '0',
	`remainingAmount` varchar(20) NOT NULL,
	`currency` varchar(3) DEFAULT 'USD',
	`lastUpdated` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projectBudgets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projectDocuments` (
	`id` varchar(64) NOT NULL,
	`projectId` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`type` enum('drawing','specification','permit','report','contract','other') NOT NULL,
	`fileUrl` text NOT NULL,
	`fileSize` varchar(20),
	`uploadedBy` varchar(64) NOT NULL,
	`uploadedAt` timestamp DEFAULT (now()),
	CONSTRAINT `projectDocuments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projectMilestones` (
	`id` varchar(64) NOT NULL,
	`projectId` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`targetDate` timestamp NOT NULL,
	`completedDate` timestamp,
	`status` enum('pending','in_progress','completed','delayed') NOT NULL DEFAULT 'pending',
	`progress` varchar(3) DEFAULT '0',
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projectMilestones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projectTasks` (
	`id` varchar(64) NOT NULL,
	`projectId` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`status` enum('todo','in_progress','review','completed','blocked') NOT NULL DEFAULT 'todo',
	`priority` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`assignedTo` varchar(64),
	`dueDate` timestamp,
	`completedAt` timestamp,
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projectTasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projectTeamMembers` (
	`id` varchar(64) NOT NULL,
	`projectId` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`role` enum('lead','worker','supervisor','inspector') NOT NULL DEFAULT 'worker',
	`joinedAt` timestamp DEFAULT (now()),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `projectTeamMembers_id` PRIMARY KEY(`id`)
);
