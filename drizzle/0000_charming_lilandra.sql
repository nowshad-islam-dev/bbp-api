CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`first_name` varchar(255) NOT NULL,
	`last_name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`phone` varchar(11),
	`role` enum('volunteer','user','admin') DEFAULT 'user',
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `email_idx` UNIQUE(`email`),
	CONSTRAINT `phone_length_check` CHECK(char_length(`users`.`phone`) = 11)
);
