CREATE TABLE `terms_acceptance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`terms_version` varchar(32) NOT NULL,
	`accepted_at` timestamp NOT NULL DEFAULT (now()),
	`ip_address` varchar(45),
	`user_agent` text,
	CONSTRAINT `terms_acceptance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `terms_acceptance` (`user_id`);--> statement-breakpoint
CREATE INDEX `version_idx` ON `terms_acceptance` (`terms_version`);