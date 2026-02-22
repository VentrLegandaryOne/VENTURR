CREATE TABLE `comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quote_id` int NOT NULL,
	`user_id` int NOT NULL,
	`section` varchar(64) NOT NULL,
	`content` text NOT NULL,
	`parent_id` int,
	`is_resolved` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `negotiations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quote_id` int NOT NULL,
	`proposed_by` int NOT NULL,
	`original_price` int NOT NULL,
	`proposed_price` int NOT NULL,
	`status` enum('pending','accepted','rejected','countered') NOT NULL DEFAULT 'pending',
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `negotiations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shared_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quote_id` int NOT NULL,
	`share_token` varchar(64) NOT NULL,
	`shared_by` int NOT NULL,
	`shared_with` varchar(320),
	`access_level` enum('view','comment','negotiate') NOT NULL DEFAULT 'view',
	`expires_at` timestamp,
	`view_count` int NOT NULL DEFAULT 0,
	`last_viewed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `shared_reports_id` PRIMARY KEY(`id`),
	CONSTRAINT `shared_reports_share_token_unique` UNIQUE(`share_token`)
);
