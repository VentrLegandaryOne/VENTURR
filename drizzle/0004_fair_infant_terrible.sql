CREATE TABLE `certification_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(64) NOT NULL,
	`document_type` varchar(128) NOT NULL,
	`project_name` varchar(256),
	`certified_by` varchar(256) NOT NULL,
	`certification_date` timestamp NOT NULL,
	`compliance_status` enum('compliant','non-compliant','pending') NOT NULL,
	`original_document_url` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `certification_log_id` PRIMARY KEY(`id`),
	CONSTRAINT `certification_log_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `compliance_rules_library` (
	`id` int AUTO_INCREMENT NOT NULL,
	`rule_id` varchar(64) NOT NULL,
	`category` enum('building_code','safety','supplier_spec') NOT NULL,
	`trade` enum('roofing','plumbing','electrical','general') NOT NULL,
	`state` enum('nsw','vic','qld','sa','wa','tas','nt','act','national') NOT NULL,
	`title` varchar(256) NOT NULL,
	`summary` text NOT NULL,
	`full_text` text,
	`ncc_reference` varchar(128),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `compliance_rules_library_id` PRIMARY KEY(`id`),
	CONSTRAINT `compliance_rules_library_rule_id_unique` UNIQUE(`rule_id`)
);
