CREATE TABLE `comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`newsId` int NOT NULL,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `comments_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_comments_news_id` UNIQUE(`id`),
	CONSTRAINT `idx_comments_user_id` UNIQUE(`id`)
);
--> statement-breakpoint
ALTER TABLE `comments` ADD CONSTRAINT `comments_newsId_news_id_fk` FOREIGN KEY (`newsId`) REFERENCES `news`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comments` ADD CONSTRAINT `comments_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;