CREATE TABLE `push_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`endpoint` text NOT NULL,
	`p256dh` text NOT NULL,
	`auth` text NOT NULL,
	`user_agent` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `push_subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quote_annotations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quote_id` int NOT NULL,
	`user_id` int NOT NULL,
	`content` text NOT NULL,
	`section` varchar(64),
	`color` varchar(20) DEFAULT 'yellow',
	`is_pinned` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quote_annotations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `push_sub_user_id_idx` ON `push_subscriptions` (`user_id`);--> statement-breakpoint
CREATE INDEX `annotation_quote_id_idx` ON `quote_annotations` (`quote_id`);--> statement-breakpoint
CREATE INDEX `annotation_user_id_idx` ON `quote_annotations` (`user_id`);