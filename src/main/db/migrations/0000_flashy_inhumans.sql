CREATE TABLE `app_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `event_cocktail_mix` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`recipe_id` text NOT NULL,
	`percentage` real NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `event_financial_snapshot` (
	`event_id` text PRIMARY KEY NOT NULL,
	`total_revenue` real NOT NULL,
	`ingredient_cost` real NOT NULL,
	`operational_cost` real NOT NULL,
	`total_cost` real NOT NULL,
	`net_profit` real NOT NULL,
	`margin` real NOT NULL,
	`computed_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`event_date` text NOT NULL,
	`status` text DEFAULT 'Planning' NOT NULL,
	`pax` integer NOT NULL,
	`drinks_per_pax` real NOT NULL,
	`ticket_price` real NOT NULL,
	`staff_cost` real DEFAULT 0 NOT NULL,
	`ice_cost` real DEFAULT 0 NOT NULL,
	`transport_cost` real DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ingredients` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`supplier` text NOT NULL,
	`cost_per_bottle` real NOT NULL,
	`bottle_size_ml` real NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `recipe_ingredients` (
	`id` text PRIMARY KEY NOT NULL,
	`recipe_id` text NOT NULL,
	`ingredient_id` text NOT NULL,
	`amount_ml` real NOT NULL,
	FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `recipes` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`glass_type` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `shopping_list_items` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`ingredient_id` text NOT NULL,
	`total_ml_needed` real NOT NULL,
	`bottles_needed` integer NOT NULL,
	`total_cost` real NOT NULL,
	`purchased` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `shopping_list_event_ingredient_idx` ON `shopping_list_items` (`event_id`,`ingredient_id`);