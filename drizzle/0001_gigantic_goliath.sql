ALTER TABLE "tbl_expenses" DROP CONSTRAINT "tbl_expenses_user_id_tbl_users_id_fk";
--> statement-breakpoint
ALTER TABLE "tbl_expenses" ADD CONSTRAINT "tbl_expenses_user_id_tbl_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."tbl_users"("id") ON DELETE cascade ON UPDATE no action;