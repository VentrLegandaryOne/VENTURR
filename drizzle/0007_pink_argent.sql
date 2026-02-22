CREATE TABLE `contractor_certifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contractor_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`issuing_body` varchar(255) NOT NULL,
	`certificate_number` varchar(100),
	`issue_date` timestamp,
	`expiry_date` timestamp,
	`certificate_url` text,
	`is_verified` boolean NOT NULL DEFAULT false,
	`category` enum('license','insurance','qualification','membership','award') NOT NULL,
	`display_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contractor_certifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `portfolio_projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contractor_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`project_type` varchar(100) NOT NULL,
	`location` varchar(255),
	`before_photo_url` text,
	`after_photo_url` text NOT NULL,
	`additional_photos` json,
	`completion_date` timestamp,
	`project_cost` bigint,
	`duration` int,
	`client_testimonial` text,
	`display_order` int NOT NULL DEFAULT 0,
	`is_public` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `portfolio_projects_id` PRIMARY KEY(`id`)
);
