CREATE TABLE `feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`type` enum('bug','feature','improvement','general','praise') NOT NULL,
	`category` enum('quote_upload','verification','comparison','market_rates','credentials','reports','dashboard','mobile','performance','other') NOT NULL,
	`title` varchar(256) NOT NULL,
	`description` text NOT NULL,
	`rating` int,
	`page_url` varchar(500),
	`user_agent` text,
	`screen_size` varchar(32),
	`screenshot_key` varchar(500),
	`screenshot_url` text,
	`status` enum('new','reviewing','in_progress','resolved','wont_fix') NOT NULL DEFAULT 'new',
	`admin_notes` text,
	`resolved_at` timestamp,
	`resolved_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `feedback_user_id_idx` ON `feedback` (`user_id`);--> statement-breakpoint
CREATE INDEX `feedback_type_idx` ON `feedback` (`type`);--> statement-breakpoint
CREATE INDEX `feedback_status_idx` ON `feedback` (`status`);--> statement-breakpoint
CREATE INDEX `feedback_created_at_idx` ON `feedback` (`created_at`);