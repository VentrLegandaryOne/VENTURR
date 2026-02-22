CREATE TABLE `price_benchmarks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`project_type` varchar(100) NOT NULL,
	`region` varchar(100) NOT NULL,
	`avg_cost` bigint NOT NULL,
	`min_cost` bigint NOT NULL,
	`max_cost` bigint NOT NULL,
	`sample_size` int NOT NULL,
	`confidence_score` int NOT NULL,
	`last_updated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `price_benchmarks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quote_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` varchar(100) NOT NULL,
	`description` text NOT NULL,
	`specifications` json NOT NULL,
	`compliance_requirements` json NOT NULL,
	`estimated_cost` bigint NOT NULL,
	`usage_count` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quote_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `review_photos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`review_id` int NOT NULL,
	`photo_url` text NOT NULL,
	`caption` varchar(255),
	`display_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `review_photos_id` PRIMARY KEY(`id`)
);
