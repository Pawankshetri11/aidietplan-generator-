-- Database Schema for LuxeDiet
-- Improved relationships and constraints to enforce business logic

SET FOREIGN_KEY_CHECKS = 0;

-- DROP TABLES IN CORRECT REVERSE ORDER TO AVOID CONSTRAINT ERRORS
DROP TABLE IF EXISTS `daily_logs`;
DROP TABLE IF EXISTS `daily_diet_plans`;
DROP TABLE IF EXISTS `subscriptions`;
DROP TABLE IF EXISTS `profiles`;
DROP TABLE IF EXISTS `users`;

-- 1. Users Table
CREATE TABLE `users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) DEFAULT NULL,
  `name` VARCHAR(255) NOT NULL,
  `google_id` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `google_id` (`google_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 2. Profiles Table
CREATE TABLE `profiles` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `age` INT(11) NOT NULL,
  `gender` VARCHAR(50) NOT NULL,
  `height` DECIMAL(5,2) NOT NULL,
  `weight` DECIMAL(5,2) NOT NULL,
  `goal` VARCHAR(255) NOT NULL,
  `activity_level` VARCHAR(255) NOT NULL,
  `dietary_restrictions` JSON DEFAULT NULL,
  `allergies` VARCHAR(255) DEFAULT NULL,
  `meal_preference` VARCHAR(255) DEFAULT NULL,
  `extended_data` LONGTEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `fk_profile_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 3. Subscriptions Table
CREATE TABLE `subscriptions` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `profile_id` INT(11) NOT NULL,
  `plan_type` VARCHAR(50) NOT NULL,
  `plan_days` INT(11) NOT NULL,
  `start_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `end_date` DATE NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `payment_method` VARCHAR(50) NOT NULL,
  `payment_status` VARCHAR(50) DEFAULT 'pending',
  `status` ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `profile_id` (`profile_id`),
  KEY `status` (`status`),
  CONSTRAINT `fk_sub_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sub_profile` FOREIGN KEY (`profile_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 4. Daily Diet Plans Table
CREATE TABLE `daily_diet_plans` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `subscription_id` INT(11) NOT NULL,
  `day_number` INT(11) NOT NULL,
  `plan_date` DATE NOT NULL,
  `meal_json` JSON DEFAULT NULL,
  `is_unlocked` TINYINT(1) DEFAULT 0,
  `unlocked_at` DATETIME DEFAULT NULL,
  `user_name` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_day_plan` (`subscription_id`, `day_number`),
  CONSTRAINT `fk_diet_subscription` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 5. Daily Logs
CREATE TABLE `daily_logs` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `subscription_id` INT(11) NOT NULL,
  `day_number` INT(11) NOT NULL,
  `weight_log` DECIMAL(5,2) DEFAULT NULL,
  `mood_log` VARCHAR(255) DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_day_log` (`subscription_id`, `day_number`),
  CONSTRAINT `fk_log_subscription` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
