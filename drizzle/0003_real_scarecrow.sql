CREATE TABLE `candidates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`short_intro` varchar(255) NOT NULL,
	`gender` enum('male','female'),
	`img` varchar(255),
	`vicinity` varchar(255) NOT NULL,
	`topics_brought` json DEFAULT ('[]'),
	CONSTRAINT `candidates_id` PRIMARY KEY(`id`)
);
