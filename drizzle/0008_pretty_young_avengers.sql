CREATE TABLE `contractor_comparisons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`contractor_id` int NOT NULL,
	`added_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contractor_comparisons_id` PRIMARY KEY(`id`)
);
