CREATE TABLE `comparison_groups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`status` enum('draft','analyzing','completed') NOT NULL DEFAULT 'draft',
	`recommendation` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `comparison_groups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `comparison_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`group_id` int NOT NULL,
	`quote_id` int NOT NULL,
	`position` int NOT NULL,
	`label` varchar(100),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `comparison_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contractor_projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contractor_id` int NOT NULL,
	`project_type` varchar(100) NOT NULL,
	`project_value` int NOT NULL,
	`completed_date` timestamp NOT NULL,
	`location` varchar(255),
	`description` text,
	`images` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contractor_projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contractor_reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contractor_id` int NOT NULL,
	`user_id` int NOT NULL,
	`quote_id` int,
	`rating` int NOT NULL,
	`quality_score` int,
	`value_score` int,
	`communication_score` int,
	`timeliness_score` int,
	`title` varchar(255),
	`comment` text,
	`project_type` varchar(100),
	`project_value` int,
	`project_date` timestamp,
	`is_verified` boolean NOT NULL DEFAULT false,
	`would_recommend` boolean NOT NULL DEFAULT true,
	`contractor_response` text,
	`contractor_response_at` timestamp,
	`helpful_count` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contractor_reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contractors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`business_name` varchar(255),
	`abn` varchar(20),
	`email` varchar(320),
	`phone` varchar(20),
	`website` varchar(500),
	`address` text,
	`specialties` json,
	`service_areas` json,
	`license_number` varchar(100),
	`insurance_verified` boolean NOT NULL DEFAULT false,
	`is_verified` boolean NOT NULL DEFAULT false,
	`avg_score` int NOT NULL DEFAULT 0,
	`total_reviews` int NOT NULL DEFAULT 0,
	`total_projects` int NOT NULL DEFAULT 0,
	`total_value` int NOT NULL DEFAULT 0,
	`badges` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contractors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notification_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`email_enabled` boolean NOT NULL DEFAULT true,
	`email_digest_frequency` enum('instant','daily','weekly','never') NOT NULL DEFAULT 'instant',
	`push_enabled` boolean NOT NULL DEFAULT false,
	`categories` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `notification_preferences_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`type` enum('verification_complete','unusual_pricing','compliance_warning','comparison_ready','contractor_review','system_alert') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`action_url` varchar(500),
	`action_label` varchar(100),
	`metadata` json,
	`is_read` boolean NOT NULL DEFAULT false,
	`read_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
