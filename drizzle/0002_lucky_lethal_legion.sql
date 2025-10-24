ALTER TABLE `projects` ADD `location` text;--> statement-breakpoint
ALTER TABLE `projects` ADD `coastalDistance` varchar(20);--> statement-breakpoint
ALTER TABLE `projects` ADD `windRegion` enum('A','B','C','D');--> statement-breakpoint
ALTER TABLE `projects` ADD `balRating` enum('BAL-LOW','BAL-12.5','BAL-19','BAL-29','BAL-40','BAL-FZ');--> statement-breakpoint
ALTER TABLE `projects` ADD `saltExposure` varchar(10);--> statement-breakpoint
ALTER TABLE `projects` ADD `cycloneRisk` varchar(10);