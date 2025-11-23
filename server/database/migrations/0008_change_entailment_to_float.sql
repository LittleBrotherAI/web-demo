-- Migration: Change entailment from varchar label to real score
-- Drop the old label column and add a new score column

ALTER TABLE "monitor_entailment" DROP COLUMN "label";
ALTER TABLE "monitor_entailment" ADD COLUMN "score" real NOT NULL;
