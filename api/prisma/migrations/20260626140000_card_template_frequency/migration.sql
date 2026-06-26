-- AlterTable
ALTER TABLE `card_templates` ADD COLUMN `frequency` ENUM('MONTHLY', 'YEARLY') NOT NULL DEFAULT 'MONTHLY';

-- AlterTable
ALTER TABLE `cards` ADD COLUMN `cardTemplateId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `cards_cardTemplateId_idx` ON `cards`(`cardTemplateId`);

-- AddForeignKey
ALTER TABLE `cards` ADD CONSTRAINT `cards_cardTemplateId_fkey` FOREIGN KEY (`cardTemplateId`) REFERENCES `card_templates`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
