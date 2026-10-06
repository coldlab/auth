CREATE TABLE "users" (
	"id" uuid DEFAULT gen_random_uuid(),
	"email" varchar NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
