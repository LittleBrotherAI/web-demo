ALTER TABLE "monitor_adversarial" ADD COLUMN "isAdversarial" boolean NOT NULL;--> statement-breakpoint
ALTER TABLE "monitor_adversarial" ADD COLUMN "explanation" varchar(1000) NOT NULL;--> statement-breakpoint
ALTER TABLE "monitor_adversarial" ADD COLUMN "severity" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "monitor_adversarial" DROP COLUMN "score";