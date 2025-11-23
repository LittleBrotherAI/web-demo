CREATE TABLE "monitor_factcheck" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"messageId" varchar(255) NOT NULL,
	"correctness_score" real NOT NULL,
	"explanation" varchar(1000) NOT NULL,
	CONSTRAINT "monitor_factcheck_messageId_unique" UNIQUE("messageId")
);
--> statement-breakpoint
ALTER TABLE "monitor_factcheck" ADD CONSTRAINT "monitor_factcheck_messageId_messages_id_fk" FOREIGN KEY ("messageId") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "monitor_factcheck_message_id_idx" ON "monitor_factcheck" USING btree ("messageId");