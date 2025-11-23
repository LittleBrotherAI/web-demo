ALTER TABLE "monitor_legibility_coverage" ADD COLUMN "legibility_score" real NOT NULL;--> statement-breakpoint
ALTER TABLE "monitor_legibility_coverage" ADD COLUMN "coverage_score" real NOT NULL;--> statement-breakpoint
ALTER TABLE "monitor_legibility_coverage" DROP COLUMN "score";