CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`subscription_id` int,
	`quote_id` int,
	`amount_in_cents` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'AUD',
	`status` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`payment_method` enum('card','paypal','bank_transfer') NOT NULL DEFAULT 'card',
	`stripe_payment_intent_id` varchar(255),
	`stripe_charge_id` varchar(255),
	`receipt_url` text,
	`receipt_number` varchar(64),
	`refunded_at` timestamp,
	`refund_reason` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `report_purchases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`email` varchar(320) NOT NULL,
	`quote_id` int NOT NULL,
	`payment_id` int,
	`price_in_cents` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'AUD',
	`access_token` varchar(64) NOT NULL,
	`access_expires_at` timestamp,
	`report_delivered_at` timestamp,
	`download_count` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `report_purchases_id` PRIMARY KEY(`id`),
	CONSTRAINT `report_purchases_access_token_unique` UNIQUE(`access_token`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`plan_type` enum('single_report','household','tradie_verified') NOT NULL,
	`status` enum('active','cancelled','expired','past_due') NOT NULL DEFAULT 'active',
	`price_in_cents` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'AUD',
	`billing_cycle` enum('one_time','monthly','yearly') NOT NULL,
	`start_date` timestamp NOT NULL DEFAULT (now()),
	`end_date` timestamp,
	`cancelled_at` timestamp,
	`stripe_customer_id` varchar(255),
	`stripe_subscription_id` varchar(255),
	`checks_used` int NOT NULL DEFAULT 0,
	`checks_limit` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tradie_verification` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`contractor_id` int,
	`status` enum('pending','verified','suspended','rejected') NOT NULL DEFAULT 'pending',
	`verified_at` timestamp,
	`badge_code` varchar(64),
	`badge_expires_at` timestamp,
	`business_name` varchar(255) NOT NULL,
	`abn` varchar(20) NOT NULL,
	`license_number` varchar(100),
	`insurance_provider` varchar(255),
	`insurance_expires_at` timestamp,
	`subscription_id` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tradie_verification_id` PRIMARY KEY(`id`),
	CONSTRAINT `tradie_verification_badge_code_unique` UNIQUE(`badge_code`)
);
--> statement-breakpoint
CREATE INDEX `payments_user_id_idx` ON `payments` (`user_id`);--> statement-breakpoint
CREATE INDEX `payments_subscription_id_idx` ON `payments` (`subscription_id`);--> statement-breakpoint
CREATE INDEX `payments_status_idx` ON `payments` (`status`);--> statement-breakpoint
CREATE INDEX `report_purchases_email_idx` ON `report_purchases` (`email`);--> statement-breakpoint
CREATE INDEX `report_purchases_quote_id_idx` ON `report_purchases` (`quote_id`);--> statement-breakpoint
CREATE INDEX `report_purchases_access_token_idx` ON `report_purchases` (`access_token`);--> statement-breakpoint
CREATE INDEX `subscriptions_user_id_idx` ON `subscriptions` (`user_id`);--> statement-breakpoint
CREATE INDEX `subscriptions_status_idx` ON `subscriptions` (`status`);--> statement-breakpoint
CREATE INDEX `subscriptions_plan_type_idx` ON `subscriptions` (`plan_type`);--> statement-breakpoint
CREATE INDEX `tradie_verification_user_id_idx` ON `tradie_verification` (`user_id`);--> statement-breakpoint
CREATE INDEX `tradie_verification_status_idx` ON `tradie_verification` (`status`);--> statement-breakpoint
CREATE INDEX `tradie_verification_badge_code_idx` ON `tradie_verification` (`badge_code`);