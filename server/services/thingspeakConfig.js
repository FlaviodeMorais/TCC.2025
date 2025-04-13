"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_READING = exports.THINGSPEAK_FIELD_MAPPINGS = exports.THINGSPEAK_BASE_URL = exports.THINGSPEAK_CHANNEL_ID = exports.THINGSPEAK_WRITE_API_KEY = exports.THINGSPEAK_READ_API_KEY = void 0;
exports.parseThingspeakNumber = parseThingspeakNumber;
exports.parseThingspeakBoolean = parseThingspeakBoolean;
// ThingSpeak configuration and types
var dotenv_1 = require("dotenv");
dotenv_1.default.config();
// ThingSpeak API keys and settings
exports.THINGSPEAK_READ_API_KEY = process.env.THINGSPEAK_READ_API_KEY || '5UWNQD21RD2A7QHG';
exports.THINGSPEAK_WRITE_API_KEY = process.env.THINGSPEAK_WRITE_API_KEY || '9NG6QLIN8UXLE2AH';
exports.THINGSPEAK_CHANNEL_ID = process.env.THINGSPEAK_CHANNEL_ID || '2840207';
exports.THINGSPEAK_BASE_URL = 'https://api.thingspeak.com';
// Field mappings for ThingSpeak fields
exports.THINGSPEAK_FIELD_MAPPINGS = {
    temperature: 'field1',
    level: 'field2',
    pumpStatus: 'field3',
    heaterStatus: 'field4'
};
// Default values when ThingSpeak data is missing
exports.DEFAULT_READING = {
    temperature: 25.0,
    level: 75.0,
    pumpStatus: false,
    heaterStatus: false,
    timestamp: new Date()
};
// Helper function to parse numbers from ThingSpeak
function parseThingspeakNumber(value) {
    // Se valor nulo ou indefinido, retorna 0
    if (value === null || value === undefined)
        return 0;
    // Lida com valores do tipo string
    if (typeof value === 'string') {
        var parsedValue_1 = parseFloat(value.replace(',', '.'));
        return !isNaN(parsedValue_1) ? parsedValue_1 : 0;
    }
    // Processa valores numéricos 
    var parsedValue = parseFloat(String(value));
    return !isNaN(parsedValue) ? parsedValue : 0;
}
// Helper to parse boolean values (0/1) from ThingSpeak
function parseThingspeakBoolean(value) {
    // Valores nulos, indefinidos ou vazios são sempre FALSE
    if (value === null || value === undefined || value === '')
        return false;
    // Valores de string específicos '0', 'false' são FALSE
    if (typeof value === 'string') {
        var normalizedValue = value.trim().toLowerCase();
        if (normalizedValue === '0' || normalizedValue === 'false') {
            return false;
        }
        return normalizedValue === '1' || normalizedValue === 'true';
    }
    // Para zero numérico retornamos FALSE, para outros números como 1 retornamos TRUE
    if (typeof value === 'number') {
        return value !== 0;
    }
    // Para qualquer outro tipo, convertemos para booleano
    return !!value;
}
