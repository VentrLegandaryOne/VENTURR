CREATE TABLE `compliance_requirements` (
	`id` varchar(64) NOT NULL,
	`standard` varchar(100) NOT NULL,
	`section` varchar(100) NOT NULL,
	`requirement` text NOT NULL,
	`category` varchar(100) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `compliance_requirements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fasteners` (
	`id` varchar(64) NOT NULL,
	`screwType` varchar(100) NOT NULL,
	`material` varchar(100) NOT NULL,
	`class` varchar(50) NOT NULL,
	`application` text NOT NULL,
	`environment` text NOT NULL,
	`distanceFromOcean` varchar(50),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `fasteners_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `material_specs` (
	`id` varchar(64) NOT NULL,
	`productName` varchar(255) NOT NULL,
	`profile` varchar(100) NOT NULL,
	`thickness` varchar(20) NOT NULL,
	`coating` varchar(100) NOT NULL,
	`color` varchar(100),
	`spanRating` int NOT NULL,
	`coverWidth` int NOT NULL,
	`applications` text NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `material_specs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wind_classifications` (
	`id` varchar(64) NOT NULL,
	`region` varchar(10) NOT NULL,
	`terrainCategory` varchar(10) NOT NULL,
	`shieldingClass` varchar(10) NOT NULL,
	`topography` varchar(10) NOT NULL,
	`windSpeed` int NOT NULL,
	`classification` varchar(10) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `wind_classifications_id` PRIMARY KEY(`id`)
);
