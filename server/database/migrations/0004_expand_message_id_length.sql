-- Expand message ID column from varchar(36) to varchar(255) to support client-generated IDs
ALTER TABLE "messages" ALTER COLUMN "id" TYPE varchar(255);

-- Update foreign key references in all monitor tables
ALTER TABLE "monitor_language" ALTER COLUMN "messageId" TYPE varchar(255);
ALTER TABLE "monitor_semantics" ALTER COLUMN "messageId" TYPE varchar(255);
ALTER TABLE "monitor_entailment" ALTER COLUMN "messageId" TYPE varchar(255);
ALTER TABLE "monitor_surprisal" ALTER COLUMN "messageId" TYPE varchar(255);
ALTER TABLE "monitor_reproducibility" ALTER COLUMN "messageId" TYPE varchar(255);
ALTER TABLE "monitor_legibility_coverage" ALTER COLUMN "messageId" TYPE varchar(255);
ALTER TABLE "monitor_adversarial" ALTER COLUMN "messageId" TYPE varchar(255);
ALTER TABLE "monitor_consistency" ALTER COLUMN "messageId" TYPE varchar(255);

-- Also update chatId foreign key in messages table
ALTER TABLE "messages" ALTER COLUMN "chatId" TYPE varchar(255);

-- Update chats table primary key
ALTER TABLE "chats" ALTER COLUMN "id" TYPE varchar(255);
