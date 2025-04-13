"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertSettingsSchema = exports.settings = exports.insertSetpointSchema = exports.setpoints = exports.insertReadingSchema = exports.readings = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
var drizzle_zod_1 = require("drizzle-zod");
// Model for readings from sensors
exports.readings = (0, pg_core_1.pgTable)("readings", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    temperature: (0, pg_core_1.real)("temperature").notNull(),
    level: (0, pg_core_1.real)("level").notNull(),
    pumpStatus: (0, pg_core_1.boolean)("pump_status").default(false).notNull(),
    heaterStatus: (0, pg_core_1.boolean)("heater_status").default(false).notNull(),
    timestamp: (0, pg_core_1.timestamp)("timestamp").defaultNow().notNull(),
});
exports.insertReadingSchema = (0, drizzle_zod_1.createInsertSchema)(exports.readings).omit({
    id: true,
});
// Model for system setpoints/thresholds
exports.setpoints = (0, pg_core_1.pgTable)("setpoints", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    tempMin: (0, pg_core_1.real)("temp_min").default(20.0).notNull(),
    tempMax: (0, pg_core_1.real)("temp_max").default(30.0).notNull(),
    levelMin: (0, pg_core_1.integer)("level_min").default(60).notNull(),
    levelMax: (0, pg_core_1.integer)("level_max").default(90).notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
exports.insertSetpointSchema = (0, drizzle_zod_1.createInsertSchema)(exports.setpoints).omit({
    id: true,
    updatedAt: true,
});
// Model for system settings
exports.settings = (0, pg_core_1.pgTable)("settings", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    systemName: (0, pg_core_1.text)("system_name").default("Aquaponia").notNull(),
    updateInterval: (0, pg_core_1.integer)("update_interval").default(1).notNull(),
    dataRetention: (0, pg_core_1.integer)("data_retention").default(30).notNull(),
    emailAlerts: (0, pg_core_1.boolean)("email_alerts").default(true).notNull(),
    pushAlerts: (0, pg_core_1.boolean)("push_alerts").default(true).notNull(),
    alertEmail: (0, pg_core_1.text)("alert_email"),
    tempCriticalMin: (0, pg_core_1.real)("temp_critical_min").default(18.0).notNull(),
    tempWarningMin: (0, pg_core_1.real)("temp_warning_min").default(20.0).notNull(),
    tempWarningMax: (0, pg_core_1.real)("temp_warning_max").default(28.0).notNull(),
    tempCriticalMax: (0, pg_core_1.real)("temp_critical_max").default(30.0).notNull(),
    levelCriticalMin: (0, pg_core_1.integer)("level_critical_min").default(50).notNull(),
    levelWarningMin: (0, pg_core_1.integer)("level_warning_min").default(60).notNull(),
    levelWarningMax: (0, pg_core_1.integer)("level_warning_max").default(85).notNull(),
    levelCriticalMax: (0, pg_core_1.integer)("level_critical_max").default(90).notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
exports.insertSettingsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.settings).omit({
    id: true,
    updatedAt: true,
});
