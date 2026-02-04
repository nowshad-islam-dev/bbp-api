CREATE TABLE `news_to_tags` (
	`newsId` int NOT NULL,
	`tagId` int NOT NULL,
	CONSTRAINT `news_to_tags_newsId_tagId_pk` PRIMARY KEY(`newsId`,`tagId`)
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	CONSTRAINT `tags_id` PRIMARY KEY(`id`),
	CONSTRAINT `tags_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
ALTER TABLE `news_to_tags` ADD CONSTRAINT `news_to_tags_newsId_news_id_fk` FOREIGN KEY (`newsId`) REFERENCES `news`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `news_to_tags` ADD CONSTRAINT `news_to_tags_tagId_tags_id_fk` FOREIGN KEY (`tagId`) REFERENCES `tags`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `news` DROP COLUMN `tags`;