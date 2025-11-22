CREATE TABLE "monitoring_results" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"messageId" varchar(36) NOT NULL,
	"chatId" varchar(36) NOT NULL,
	"consistency_language" real,
	"consistency_semantics" real,
	"consistency_nli" varchar(50),
	"similarity" real,
	"understandability" real,
	"completed" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "monitoring_results" ADD CONSTRAINT "monitoring_results_messageId_messages_id_fk" FOREIGN KEY ("messageId") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monitoring_results" ADD CONSTRAINT "monitoring_results_chatId_chats_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."chats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "monitoring_results_message_id_idx" ON "monitoring_results" USING btree ("messageId");--> statement-breakpoint
CREATE INDEX "monitoring_results_chat_id_idx" ON "monitoring_results" USING btree ("chatId");--> statement-breakpoint
CREATE INDEX "monitoring_results_completed_idx" ON "monitoring_results" USING btree ("completed");