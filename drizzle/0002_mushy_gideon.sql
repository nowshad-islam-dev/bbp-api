CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`excerpt` varchar(255) NOT NULL,
	`text` text NOT NULL,
	`date` datetime NOT NULL,
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` DROP CONSTRAINT `phone_length_check`;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `phone_length_check` CHECK ((`users`.`phone` IS NULL OR CHAR_LENGTH(`users`.`phone`) = 11));