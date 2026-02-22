CREATE TABLE `comparison_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`comparison_group_id` int NOT NULL,
	`alert_type` enum('pricing_outlier','compliance_gap','missing_info','recommendation') NOT NULL,
	`severity` enum('low','medium','high','critical') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`details` json,
	`email_sent` boolean NOT NULL DEFAULT false,
	`email_sent_at` timestamp,
	`sms_sent` boolean NOT NULL DEFAULT false,
	`sms_sent_at` timestamp,
	`is_read` boolean NOT NULL DEFAULT false,
	`read_at` timestamp,
	`is_dismissed` boolean NOT NULL DEFAULT false,
	`dismissed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `comparison_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100) NOT NULL,
	`source_quote_id` int,
	`specifications` json NOT NULL,
	`compliance_requirements` json NOT NULL,
	`estimated_cost` bigint NOT NULL,
	`usage_count` int NOT NULL DEFAULT 0,
	`is_public` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_templates_id` PRIMARY KEY(`id`)
);
