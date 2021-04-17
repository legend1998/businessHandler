CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE "user" (
                        "id" uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4()),
                        "business_id" uuid NOT NULL,
                        "type" varchar(50) NOT NULL,
                        "first_name" varchar(50) NOT NULL,
                        "last_name" varchar(50) NOT NULL,
                        "email" varchar(250) NOT NULL,
                        "password" varchar(100) NOT NULL,
                        "created_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
                        "updated_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
                        "deleted" boolean NOT NULL DEFAULT false
);

CREATE TABLE "business" (
                            "id" uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4()),
                            "owner_id" uuid NOT NULL,
                            "type" varchar(50) NOT NULL,
                            "name" varchar(100) NOT NULL,
                            "currency" varchar(10) NOT NULL,
                            "created_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
                            "updated_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
                            "deleted" boolean NOT NULL DEFAULT false
);

CREATE TABLE "location" (
                            "id" uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4()),
                            "business_id" uuid NOT NULL,
                            "name" varchar(100) NOT NULL,
                            "type" varchar(50) NOT NULL,
                            "latitude" float NOT NULL,
                            "longitude" float NOT NULL,
                            "address" varchar(200) NOT NULL,
                            "postal_code" varchar(50) NOT NULL,
                            "phone_number" varchar(50),
                            "created_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
                            "updated_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
                            "deleted" boolean NOT NULL DEFAULT false
);

CREATE TABLE "item" (
                        "id" uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4()),
                        "business_id" uuid NOT NULL,
                        "name" varchar(100) NOT NULL,
                        "description" varchar(500) NOT NULL,
                        "type" varchar(50) NOT NULL,
                        "image_url" varchar(300),
                        "price" float NOT NULL,
                        "created_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
                        "updated_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
                        "deleted" boolean NOT NULL DEFAULT false
);
CREATE TABLE "location_item" (
                                 "item_id" uuid NOT NULL,
                                 "location_id" uuid NOT NULL,
                                 "variants" varchar(500) NOT NULL DEFAULT '[]',
                                 "quantity" int NOT NULL
);

CREATE TABLE "variant_group" (
                                 "id" uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4()),
                                 "item_id" uuid NOT NULL,
                                 "name" varchar(100) NOT NULL,
                                 "description" varchar(500) NOT NULL,
                                 "created_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
                                 "updated_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
                                 "deleted" boolean NOT NULL DEFAULT false
);

CREATE TABLE "variant" (
                           "id" uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4()),
                           "variant_group_id" uuid NOT NULL,
                           "name" varchar(100) NOT NULL,
                           "created_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
                           "updated_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
                           "deleted" boolean NOT NULL DEFAULT false
);

CREATE TABLE "shipment" (
                            "id" uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4()),
                            "scheduled_shipment_id" uuid,
                            "business_id" uuid NOT NULL,
                            "location_start_id" uuid NOT NULL,
                            "location_end_id" uuid NOT NULL,
                            "type" varchar(50) NOT NULL,
                            "date" date,
                            "time" time,
                            "timezone" varchar(100) NOT NULL,
                            "departed_at" timestamptz,
                            "arrived_at" timestamptz,
                            "created_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
                            "updated_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
                            "deleted" boolean NOT NULL DEFAULT false
);

CREATE TABLE "shipment_item" (
                                 "item_id" uuid NOT NULL,
                                 "shipment_id" uuid NOT NULL,
                                 "variants" varchar(500) NOT NULL DEFAULT '[]',
                                 "quantity" int NOT NULL
);

CREATE TABLE "order" (
                         "id" uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4()),
                         "business_id" uuid NOT NULL,
                         "employee_id" uuid NOT NULL,
                         "customer_id" uuid NOT NULL,
                         "state" varchar(50) NOT NULL,
                         "total_items" int NOT NULL,
                         "subtotal_amount" float NOT NULL,
                         "total_amount" float,
                         "tax_rate" float,
                         "json" varchar,
                         "created_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
                         "deleted" boolean
);

CREATE TABLE "order_item" (
                              "id" uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4()),
                              "order_id" uuid NOT NULL,
                              "item_id" uuid NOT NULL,
                              "variants" varchar(500) NOT NULL DEFAULT '[]',
                              "quantity" int,
                              "unit_price" float
);

CREATE TABLE "transaction" (
                               "id" uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4()),
                               "amount" float NOT NULL,
                               "name" varchar(100),
                               "type" varchar(50),
                               "object_id" uuid,
                               "created_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "customer" (
                            "id" uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4()),
                            "business_id" uuid NOT NULL,
                            "first_name" varchar(50) NOT NULL,
                            "last_name" varchar(50) NOT NULL,
                            "phone_number" varchar(50) NOT NULL,
                            "address" varchar(200) NOT NULL,
                            "postal_code" varchar(50) NOT NULL,
                            "email" varchar(250) NOT NULL
);

CREATE TABLE "system_log" (
                              "severity" varchar(50),
                              "message" varchar,
                              "created_at" timestamptz
);
CREATE TABLE "production_rate" (
                               "id" uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4()),
                               "location_id" uuid NOT NULL,
                               "item_id" uuid PRIMARY KEY NOT NULL,
                              "created_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
                              "updated_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
                              "frequency" varchar(25) NOT NULL,
                              "item_counter" int NOT NULL,
                              "amount" int NOT NULL
);

ALTER TABLE "user" ADD FOREIGN KEY ("id") REFERENCES "business" ("owner_id");

ALTER TABLE "location" ADD FOREIGN KEY ("business_id") REFERENCES "business" ("id");

ALTER TABLE "item" ADD FOREIGN KEY ("business_id") REFERENCES "business" ("id");

ALTER TABLE "user" ADD FOREIGN KEY ("business_id") REFERENCES "business" ("id");

ALTER TABLE "order" ADD FOREIGN KEY ("business_id") REFERENCES "business" ("id");

ALTER TABLE "shipment" ADD FOREIGN KEY ("business_id") REFERENCES "business" ("id");

ALTER TABLE "customer" ADD FOREIGN KEY ("business_id") REFERENCES "business" ("id");

ALTER TABLE "location_item" ADD FOREIGN KEY ("item_id") REFERENCES "item" ("id");

ALTER TABLE "location_item" ADD FOREIGN KEY ("location_id") REFERENCES "location" ("id");

ALTER TABLE "variant_group" ADD FOREIGN KEY ("item_id") REFERENCES "item" ("id");

ALTER TABLE "variant" ADD FOREIGN KEY ("variant_group_id") REFERENCES "variant_group" ("id");

ALTER TABLE "shipment_item" ADD FOREIGN KEY ("item_id") REFERENCES "item" ("id");

ALTER TABLE "shipment_item" ADD FOREIGN KEY ("shipment_id") REFERENCES "shipment" ("id");

ALTER TABLE "shipment" ADD FOREIGN KEY ("id") REFERENCES "shipment" ("scheduled_shipment_id");

ALTER TABLE "location" ADD FOREIGN KEY ("id") REFERENCES "shipment" ("location_start_id");

ALTER TABLE "location" ADD FOREIGN KEY ("id") REFERENCES "shipment" ("location_end_id");

ALTER TABLE "user" ADD FOREIGN KEY ("id") REFERENCES "order" ("employee_id");

ALTER TABLE "customer" ADD FOREIGN KEY ("id") REFERENCES "order" ("customer_id");

ALTER TABLE "order_item" ADD FOREIGN KEY ("order_id") REFERENCES "order" ("id");

ALTER TABLE "order_item" ADD FOREIGN KEY ("item_id") REFERENCES "item" ("id");
