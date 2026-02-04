ALTER TABLE `candidates` MODIFY COLUMN `name` varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE `candidates` MODIFY COLUMN `img` text;--> statement-breakpoint
ALTER TABLE `candidates` MODIFY COLUMN `vicinity` varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE `news` MODIFY COLUMN `img` text;--> statement-breakpoint
ALTER TABLE `candidates` ADD `age` int NOT NULL;--> statement-breakpoint
ALTER TABLE `candidates` ADD `type` enum('possible','eligible','withdrawn','elected','nonelected');--> statement-breakpoint
ALTER TABLE `candidates` ADD `political_party` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `candidates` ADD `division` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `candidates` ADD `district` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `candidates` ADD CONSTRAINT `age_check_candidate` CHECK (`candidates`.`age` > 24);--> statement-breakpoint
ALTER TABLE `candidates` DROP COLUMN `short_intro`;--> statement-breakpoint
ALTER TABLE `candidates` DROP COLUMN `topics_brought`;