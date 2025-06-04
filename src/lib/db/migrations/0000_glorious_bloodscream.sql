CREATE TABLE "ingestion_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"portfolio_id" uuid,
	"file_name" text NOT NULL,
	"extract_date" date NOT NULL,
	"rows_processed" integer NOT NULL,
	"status" text NOT NULL,
	"error_message" text,
	"processed_at" timestamp with time zone DEFAULT now(),
	"processed_by" text
);
--> statement-breakpoint
CREATE TABLE "portfolio" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"client_email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "portfolio_client_email_unique" UNIQUE("client_email")
);
--> statement-breakpoint
CREATE TABLE "portfolio_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"portfolio_id" uuid NOT NULL,
	"extract_date" date NOT NULL,
	"balance" numeric(18, 2),
	"label" text,
	"currency" varchar(3),
	"valuation_eur" numeric(18, 2),
	"weight_pct" numeric(6, 3),
	"isin" varchar(12),
	"book_price_eur" numeric(18, 2),
	"fees_eur" numeric(18, 2),
	"asset_name" text,
	"strategy" text,
	"bucket" text
);
--> statement-breakpoint
ALTER TABLE "ingestion_log" ADD CONSTRAINT "ingestion_log_portfolio_id_portfolio_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolio"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_data" ADD CONSTRAINT "portfolio_data_portfolio_id_portfolio_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolio"("id") ON DELETE cascade ON UPDATE no action;