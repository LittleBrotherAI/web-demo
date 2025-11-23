ALTER TABLE "monitor_surprisal" RENAME COLUMN "score" TO "surprisal_score";--> statement-breakpoint
ALTER TABLE "monitor_surprisal" ALTER COLUMN "surprisal_score" SET DATA TYPE boolean USING (surprisal_score > 0.5);--> statement-breakpoint
ALTER TABLE "chats" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "chatId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "monitor_adversarial" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "monitor_adversarial" ALTER COLUMN "messageId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "monitor_consistency" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "monitor_consistency" ALTER COLUMN "messageId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "monitor_entailment" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "monitor_entailment" ALTER COLUMN "messageId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "monitor_language" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "monitor_language" ALTER COLUMN "messageId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "monitor_legibility_coverage" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "monitor_legibility_coverage" ALTER COLUMN "messageId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "monitor_reproducibility" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "monitor_reproducibility" ALTER COLUMN "messageId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "monitor_semantics" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "monitor_semantics" ALTER COLUMN "messageId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "monitor_surprisal" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "monitor_surprisal" ALTER COLUMN "messageId" SET DATA TYPE varchar(255);