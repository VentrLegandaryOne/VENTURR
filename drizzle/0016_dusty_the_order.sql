CREATE TABLE `analyticsMetrics` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64) NOT NULL,
	`metricType` varchar(50) NOT NULL,
	`metricName` varchar(255) NOT NULL,
	`metricValue` varchar(50) NOT NULL,
	`period` varchar(20) NOT NULL,
	`periodDate` timestamp NOT NULL,
	`trend` varchar(10),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `analyticsMetrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `kpiDashboard` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64) NOT NULL,
	`totalRevenue` varchar(20) DEFAULT '0',
	`totalProjects` varchar(20) DEFAULT '0',
	`activeProjects` varchar(20) DEFAULT '0',
	`averageProjectValue` varchar(20) DEFAULT '0',
	`profitMargin` varchar(10) DEFAULT '0',
	`laborCostPercentage` varchar(10) DEFAULT '0',
	`materialCostPercentage` varchar(10) DEFAULT '0',
	`customerSatisfaction` varchar(5) DEFAULT '0',
	`lastUpdated` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `kpiDashboard_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `revenueTrends` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64) NOT NULL,
	`month` varchar(20) NOT NULL,
	`revenue` varchar(20) NOT NULL,
	`projectedRevenue` varchar(20),
	`costs` varchar(20) NOT NULL,
	`profit` varchar(20) NOT NULL,
	`projectCount` varchar(20) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `revenueTrends_id` PRIMARY KEY(`id`)
);
