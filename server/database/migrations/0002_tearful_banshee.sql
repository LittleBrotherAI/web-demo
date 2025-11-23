CREATE TABLE "monitor_adversarial" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"messageId" varchar(36) NOT NULL,
	"score" real NOT NULL,
	CONSTRAINT "monitor_adversarial_messageId_unique" UNIQUE("messageId")
);
--> statement-breakpoint
CREATE TABLE "monitor_consistency" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"messageId" varchar(36) NOT NULL,
	"score" real NOT NULL,
	CONSTRAINT "monitor_consistency_messageId_unique" UNIQUE("messageId")
);
--> statement-breakpoint
CREATE TABLE "monitor_entailment" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"messageId" varchar(36) NOT NULL,
	"score" real NOT NULL,
	"label" varchar(50) NOT NULL,
	CONSTRAINT "monitor_entailment_messageId_unique" UNIQUE("messageId")
);
--> statement-breakpoint
CREATE TABLE "monitor_language" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"messageId" varchar(36) NOT NULL,
	"score" real NOT NULL,
	CONSTRAINT "monitor_language_messageId_unique" UNIQUE("messageId")
);
--> statement-breakpoint
CREATE TABLE "monitor_legibility_coverage" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"messageId" varchar(36) NOT NULL,
	"score" real NOT NULL,
	CONSTRAINT "monitor_legibility_coverage_messageId_unique" UNIQUE("messageId")
);
--> statement-breakpoint
CREATE TABLE "monitor_reproducibility" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"messageId" varchar(36) NOT NULL,
	"score" real NOT NULL,
	CONSTRAINT "monitor_reproducibility_messageId_unique" UNIQUE("messageId")
);
--> statement-breakpoint
CREATE TABLE "monitor_semantics" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"messageId" varchar(36) NOT NULL,
	"score" real NOT NULL,
	CONSTRAINT "monitor_semantics_messageId_unique" UNIQUE("messageId")
);
--> statement-breakpoint
CREATE TABLE "monitor_surprisal" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"messageId" varchar(36) NOT NULL,
	"score" real NOT NULL,
	CONSTRAINT "monitor_surprisal_messageId_unique" UNIQUE("messageId")
);
--> statement-breakpoint
DROP TABLE "monitoring_results" CASCADE;--> statement-breakpoint
ALTER TABLE "monitor_adversarial" ADD CONSTRAINT "monitor_adversarial_messageId_messages_id_fk" FOREIGN KEY ("messageId") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monitor_consistency" ADD CONSTRAINT "monitor_consistency_messageId_messages_id_fk" FOREIGN KEY ("messageId") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monitor_entailment" ADD CONSTRAINT "monitor_entailment_messageId_messages_id_fk" FOREIGN KEY ("messageId") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monitor_language" ADD CONSTRAINT "monitor_language_messageId_messages_id_fk" FOREIGN KEY ("messageId") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monitor_legibility_coverage" ADD CONSTRAINT "monitor_legibility_coverage_messageId_messages_id_fk" FOREIGN KEY ("messageId") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monitor_reproducibility" ADD CONSTRAINT "monitor_reproducibility_messageId_messages_id_fk" FOREIGN KEY ("messageId") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monitor_semantics" ADD CONSTRAINT "monitor_semantics_messageId_messages_id_fk" FOREIGN KEY ("messageId") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monitor_surprisal" ADD CONSTRAINT "monitor_surprisal_messageId_messages_id_fk" FOREIGN KEY ("messageId") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "monitor_adversarial_message_id_idx" ON "monitor_adversarial" USING btree ("messageId");--> statement-breakpoint
CREATE INDEX "monitor_consistency_message_id_idx" ON "monitor_consistency" USING btree ("messageId");--> statement-breakpoint
CREATE INDEX "monitor_entailment_message_id_idx" ON "monitor_entailment" USING btree ("messageId");--> statement-breakpoint
CREATE INDEX "monitor_language_message_id_idx" ON "monitor_language" USING btree ("messageId");--> statement-breakpoint
CREATE INDEX "monitor_legibility_coverage_message_id_idx" ON "monitor_legibility_coverage" USING btree ("messageId");--> statement-breakpoint
CREATE INDEX "monitor_reproducibility_message_id_idx" ON "monitor_reproducibility" USING btree ("messageId");--> statement-breakpoint
CREATE INDEX "monitor_semantics_message_id_idx" ON "monitor_semantics" USING btree ("messageId");--> statement-breakpoint
CREATE INDEX "monitor_surprisal_message_id_idx" ON "monitor_surprisal" USING btree ("messageId");