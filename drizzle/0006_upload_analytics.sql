CREATE TABLE `upload_analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`quote_id` int,
	`file_name` varchar(500) NOT NULL,
	`file_size` int NOT NULL,
	`file_type` varchar(100) NOT NULL,
	`upload_started_at` bigint NOT NULL,
	`upload_completed_at` bigint,
	`processing_started_at` bigint,
	`processing_completed_at` bigint,
	`status` enum('uploading','processing','completed','failed') NOT NULL DEFAULT 'uploading',
	`error_type` varchar(255),
	`error_message` text,
	`upload_duration_ms` int,
	`processing_duration_ms` int,
	`total_duration_ms` int,
	`retry_count` int NOT NULL DEFAULT 0,
	`created_at` bigint NOT NULL,
	CONSTRAINT `upload_analytics_id` PRIMARY KEY(`id`)
);

CREATE INDEX `upload_analytics_user_id_idx` ON `upload_analytics` (`user_id`);
CREATE INDEX `upload_analytics_quote_id_idx` ON `upload_analytics` (`quote_id`);
CREATE INDEX `upload_analytics_status_idx` ON `upload_analytics` (`status`);
CREATE INDEX `upload_analytics_created_at_idx` ON `upload_analytics` (`created_at`);
CREATE INDEX `upload_analytics_error_type_idx` ON `upload_analytics` (`error_type`);
