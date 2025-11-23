ALTER TABLE "monitor_consistency" ADD COLUMN "isConsistent" boolean NOT NULL;--> statement-breakpoint
ALTER TABLE "monitor_consistency" ADD COLUMN "confidence" real NOT NULL;--> statement-breakpoint
ALTER TABLE "monitor_consistency" ADD COLUMN "explanation" varchar(1000) NOT NULL;--> statement-breakpoint
ALTER TABLE "monitor_consistency" DROP COLUMN "score";