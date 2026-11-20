
CREATE TABLE "refresh_token_families" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "revoked_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

--> statement-breakpoint

ALTER TABLE "refresh_token_families"
ADD CONSTRAINT "refresh_token_families_user_id_users_id_fk"
FOREIGN KEY ("user_id")
REFERENCES "public"."users"("id")
ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint

CREATE INDEX "refresh_token_families_user_id_idx"
ON "refresh_token_families" USING btree ("user_id");

--> statement-breakpoint

INSERT INTO "refresh_token_families" ("id", "user_id")
SELECT DISTINCT "family_id", "user_id"
FROM "refresh_tokens"
ON CONFLICT ("id") DO NOTHING;

--> statement-breakpoint

ALTER TABLE "refresh_tokens"
ADD CONSTRAINT "refresh_tokens_family_id_refresh_token_families_id_fk"
FOREIGN KEY ("family_id")
REFERENCES "public"."refresh_token_families"("id")
ON DELETE cascade ON UPDATE no action;
