-- External SISCON identifiers are opaque strings, never cross-system foreign keys.
ALTER TABLE "work_orders" RENAME COLUMN "incident_id" TO "source_incident_id";
ALTER TABLE "work_orders" RENAME COLUMN "incident_code" TO "source_incident_code";
ALTER TABLE "work_orders" ALTER COLUMN "source_incident_id" TYPE VARCHAR(128) USING "source_incident_id"::text;
ALTER TABLE "work_orders" ALTER COLUMN "source_incident_code" TYPE VARCHAR(64);
ALTER TABLE "work_orders" ALTER COLUMN "zone_id" DROP NOT NULL;
ALTER TABLE "work_orders" ALTER COLUMN "zone_id" TYPE VARCHAR(128) USING "zone_id"::text;
ALTER TABLE "work_orders" ALTER COLUMN "supply_id" TYPE VARCHAR(128) USING "supply_id"::text;
ALTER TABLE "work_orders" ALTER COLUMN "meter_id" TYPE VARCHAR(128) USING "meter_id"::text;
ALTER TABLE "work_orders"
  ADD COLUMN "source_incident_type" VARCHAR(100),
  ADD COLUMN "detected_at" TIMESTAMP(3),
  ADD COLUMN "source_zone_id" VARCHAR(128),
  ADD COLUMN "source_zone_name" VARCHAR(200),
  ADD COLUMN "source_supply_id" VARCHAR(128),
  ADD COLUMN "source_supply_code" VARCHAR(128),
  ADD COLUMN "source_meter_id" VARCHAR(128),
  ADD COLUMN "source_meter_code" VARCHAR(128),
  ADD COLUMN "address_snapshot" VARCHAR(500);
CREATE UNIQUE INDEX "work_orders_source_system_source_incident_id_key" ON "work_orders"("source_system", "source_incident_id");

CREATE TABLE "integration_inbox" (
  "id" UUID NOT NULL,
  "source_system" VARCHAR(20) NOT NULL,
  "operation" VARCHAR(100) NOT NULL,
  "idempotency_key" VARCHAR(128) NOT NULL,
  "payload_hash" VARCHAR(64) NOT NULL,
  "status_code" INTEGER,
  "response_body" JSONB,
  "work_order_id" UUID,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "integration_inbox_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "integration_inbox_source_system_operation_idempotency_key_key" ON "integration_inbox"("source_system", "operation", "idempotency_key");
ALTER TABLE "integration_inbox" ADD CONSTRAINT "integration_inbox_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TYPE "OutboxStatus" AS ENUM ('PENDING', 'PROCESSING', 'DELIVERED', 'DEAD');
CREATE TABLE "integration_outbox" (
  "id" UUID NOT NULL,
  "event_type" VARCHAR(100) NOT NULL,
  "work_order_id" UUID NOT NULL,
  "payload" JSONB NOT NULL,
  "status" "OutboxStatus" NOT NULL DEFAULT 'PENDING',
  "attempt_count" INTEGER NOT NULL DEFAULT 0,
  "next_attempt_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "locked_at" TIMESTAMP(3),
  "lock_token" UUID,
  "delivered_at" TIMESTAMP(3),
  "last_error" VARCHAR(1000),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "integration_outbox_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "integration_outbox_event_type_work_order_id_key" ON "integration_outbox"("event_type", "work_order_id");
CREATE INDEX "integration_outbox_status_next_attempt_at_idx" ON "integration_outbox"("status", "next_attempt_at");
ALTER TABLE "integration_outbox" ADD CONSTRAINT "integration_outbox_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
