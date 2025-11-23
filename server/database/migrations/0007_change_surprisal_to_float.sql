-- Change surprisal_score from boolean to real (float)
ALTER TABLE "monitor_surprisal" ALTER COLUMN "surprisal_score" TYPE real USING (CASE WHEN "surprisal_score" = true THEN 1.0 ELSE 0.0 END);
