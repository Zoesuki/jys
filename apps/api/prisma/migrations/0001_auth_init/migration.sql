-- CreateTable
CREATE TABLE `user` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(254) NOT NULL,
    `password_hash` VARCHAR(100) NOT NULL,
    `nickname` VARCHAR(24) NOT NULL,
    `avatar_file_id` BIGINT NULL,
    `signature` VARCHAR(200) NULL,
    `attendance_visible` BOOLEAN NOT NULL DEFAULT true,
    `status` ENUM('pending_activation', 'active_no_member', 'normal', 'muted', 'banned', 'deactivation_cooling', 'deactivated') NOT NULL DEFAULT 'pending_activation',
    `status_reason` VARCHAR(200) NULL,
    `muted_until` DATETIME(3) NULL,
    `xp_total` INTEGER NOT NULL DEFAULT 0,
    `point_total` INTEGER NOT NULL DEFAULT 0,
    `makeup_cards` INTEGER NOT NULL DEFAULT 0,
    `rank_text` VARCHAR(30) NULL,
    `admin_2fa_passed_at` DATETIME(3) NULL,
    `deactivated_at` DATETIME(3) NULL,
    `anonymized_at` DATETIME(3) NULL,
    `email_verified_at` DATETIME(3) NULL,
    `ext_json` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `user_email_key`(`email`),
    INDEX `user_status_idx`(`status`),
    INDEX `user_nickname_idx`(`nickname`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_role` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `role` ENUM('moderator', 'organizer', 'admin') NOT NULL,
    `board_id` BIGINT NULL,
    `granted_by` BIGINT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `user_role_role_board_id_idx`(`role`, `board_id`),
    UNIQUE INDEX `user_role_user_id_role_board_id_key`(`user_id`, `role`, `board_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_role` ADD CONSTRAINT `user_role_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

