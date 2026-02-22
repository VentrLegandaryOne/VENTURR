CREATE TABLE `quote_comparison_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`comparison_id` int NOT NULL,
	`quote_id` int NOT NULL,
	`display_order` int NOT NULL DEFAULT 0,
	`pricing_rank` int,
	`materials_rank` int,
	`compliance_rank` int,
	`warranty_rank` int,
	`overall_rank` int,
	`is_recommended` boolean NOT NULL DEFAULT false,
	`is_best_value` boolean NOT NULL DEFAULT false,
	`is_cheapest` boolean NOT NULL DEFAULT false,
	`notes` text,
	`added_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quote_comparison_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quote_comparisons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`project_type` varchar(100),
	`project_address` text,
	`status` enum('draft','completed','archived') NOT NULL DEFAULT 'draft',
	`recommended_quote_id` int,
	`comparison_results` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quote_comparisons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shared_comparisons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`comparison_id` int NOT NULL,
	`share_token` varchar(64) NOT NULL,
	`shared_by` int NOT NULL,
	`shared_with` varchar(320),
	`access_level` enum('view','comment') NOT NULL DEFAULT 'view',
	`expires_at` timestamp,
	`view_count` int NOT NULL DEFAULT 0,
	`last_viewed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `shared_comparisons_id` PRIMARY KEY(`id`),
	CONSTRAINT `shared_comparisons_share_token_unique` UNIQUE(`share_token`)
);
