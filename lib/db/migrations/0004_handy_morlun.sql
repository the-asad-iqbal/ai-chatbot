CREATE TABLE IF NOT EXISTS "Memory" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"text" text NOT NULL,
	"createdAt" timestamp NOT NULL,
	"userId" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "name" varchar NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Memory" ADD CONSTRAINT "Memory_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
