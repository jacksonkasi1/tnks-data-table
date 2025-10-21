CREATE TABLE "tbl_orders" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tbl_orders_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"order_id" varchar(50) NOT NULL,
	"customer_name" varchar(255) NOT NULL,
	"customer_email" varchar(255) NOT NULL,
	"order_date" timestamp DEFAULT now() NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"total_items" integer DEFAULT 0 NOT NULL,
	"total_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"shipping_address" varchar(500) NOT NULL,
	"payment_method" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tbl_orders_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
CREATE TABLE "tbl_order_items" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tbl_order_items_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"order_id" varchar(50) NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"quantity" integer NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" varchar(50) NOT NULL,
	"customer_name" varchar(255) NOT NULL,
	"customer_email" varchar(255) NOT NULL,
	"customer_phone" varchar(50),
	"pickup_location" text NOT NULL,
	"delivery_location" text NOT NULL,
	"booking_date" timestamp NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"total_stops" integer DEFAULT 0 NOT NULL,
	"total_distance" numeric(10, 2),
	"total_amount" numeric(12, 2) NOT NULL,
	"driver_name" varchar(255),
	"vehicle_number" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bookings_booking_id_unique" UNIQUE("booking_id")
);
--> statement-breakpoint
CREATE TABLE "booking_stops" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" varchar(50) NOT NULL,
	"stop_number" integer NOT NULL,
	"stop_type" varchar(50) NOT NULL,
	"location_name" varchar(255) NOT NULL,
	"location_address" text NOT NULL,
	"location_city" varchar(100),
	"location_state" varchar(100),
	"location_zip" varchar(20),
	"contact_name" varchar(255),
	"contact_phone" varchar(50),
	"scheduled_time" timestamp,
	"actual_arrival_time" timestamp,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"notes" text,
	"distance_from_previous" numeric(10, 2),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tbl_tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" varchar(50) NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"customer_name" varchar(100) NOT NULL,
	"customer_email" varchar(100) NOT NULL,
	"priority" varchar(20) NOT NULL,
	"status" varchar(20) NOT NULL,
	"category" varchar(50),
	"assigned_to" varchar(100),
	"total_comments" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tbl_tickets_ticket_id_unique" UNIQUE("ticket_id")
);
--> statement-breakpoint
CREATE TABLE "tbl_ticket_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" varchar(50) NOT NULL,
	"comment_number" integer NOT NULL,
	"author_name" varchar(100) NOT NULL,
	"author_email" varchar(100) NOT NULL,
	"author_role" varchar(50),
	"comment_text" text NOT NULL,
	"is_internal" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tbl_order_items" ADD CONSTRAINT "tbl_order_items_order_id_tbl_orders_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."tbl_orders"("order_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_ticket_comments" ADD CONSTRAINT "tbl_ticket_comments_ticket_id_tbl_tickets_ticket_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tbl_tickets"("ticket_id") ON DELETE no action ON UPDATE no action;