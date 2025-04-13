"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = registerRoutes;
var http_1 = require("http");
var node_cron_1 = require("node-cron");
var vite_1 = require("./vite");
var thingspeakService_1 = require("./services/thingspeakService");
var backupService_1 = require("./services/backupService");
var schema_1 = require("@shared/schema");
var zod_1 = require("zod");
var index_1 = require("./index");
var index_2 = require("./index");
var storage_1 = require("./storage");
var REFRESH_INTERVAL = 300000;
var logRequest = function (req, res, next) {
    var start = Date.now();
    var path = req.path;
    var capturedJsonResponse = undefined;
    var originalResJson = res.json;
    res.json = function (bodyJson) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, __spreadArray([bodyJson], args, true));
    };
    res.on("finish", function () {
        var duration = Date.now() - start;
        var logLine = "".concat(req.method, " ").concat(path, " ").concat(res.statusCode, " in ").concat(duration, "ms");
        if (capturedJsonResponse) {
            logLine += " :: ".concat(JSON.stringify(capturedJsonResponse));
        }
        (0, vite_1.log)(logLine);
    });
    next();
};
var dataAggregation_1 = require("./utils/dataAggregation");
function registerRoutes(app) {
    return __awaiter(this, void 0, void 0, function () {
        var httpServer, intervalInSeconds, error_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    httpServer = (0, http_1.createServer)(app);
                    intervalInSeconds = Math.max(Math.floor(REFRESH_INTERVAL / 1000), 2);
                    console.log("Configurando coleta de dados a cada ".concat(intervalInSeconds, " segundos (").concat(REFRESH_INTERVAL, "ms)"));
                    node_cron_1.default.schedule("*/".concat(intervalInSeconds, " * * * * *"), function () { return __awaiter(_this, void 0, void 0, function () {
                        var reading, error_2;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 5, , 6]);
                                    console.log('Starting scheduled data collection...');
                                    return [4 /*yield*/, (0, thingspeakService_1.fetchLatestReading)()];
                                case 1:
                                    reading = _a.sent();
                                    if (!reading) return [3 /*break*/, 3];
                                    console.log("\u2705 Confirma\u00E7\u00E3o de atualiza\u00E7\u00E3o recebida do Thingspeak");
                                    return [4 /*yield*/, storage_1.storage.saveReading(reading)];
                                case 2:
                                    _a.sent();
                                    console.log('Data collection cycle completed successfully');
                                    return [3 /*break*/, 4];
                                case 3:
                                    console.log('No data collected in this cycle');
                                    _a.label = 4;
                                case 4: return [3 /*break*/, 6];
                                case 5:
                                    error_2 = _a.sent();
                                    console.error('Error in data collection cycle:', error_2);
                                    return [3 /*break*/, 6];
                                case 6: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Agenda sincronização do backup a cada 30 minutos
                    node_cron_1.default.schedule('*/30 * * * *', function () { return __awaiter(_this, void 0, void 0, function () {
                        var error_3;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    console.log('🔄 Starting scheduled backup sync...');
                                    return [4 /*yield*/, backupService_1.backupService.syncData()];
                                case 1:
                                    _a.sent();
                                    console.log('✅ Scheduled backup completed');
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_3 = _a.sent();
                                    console.error('❌ Error in scheduled backup:', error_3);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, backupService_1.backupService.initialize()];
                case 2:
                    _a.sent();
                    console.log('✅ Backup service initialized');
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error('❌ Error initializing backup service:', error_1);
                    return [3 /*break*/, 4];
                case 4:
                    // API Routes
                    // Get latest readings
                    app.get('/api/readings/latest', logRequest, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var limit, readings, setpoints, stats, error_4;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    console.log("\u2192 GET /api/readings/latest - Request received");
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 4, , 5]);
                                    limit = parseInt(req.query.limit) || 60;
                                    return [4 /*yield*/, storage_1.storage.getLatestReadings(limit)];
                                case 2:
                                    readings = _a.sent();
                                    return [4 /*yield*/, index_1.readingsService.getSetpoints()];
                                case 3:
                                    setpoints = _a.sent();
                                    stats = index_1.readingsService.calculateStatistics(readings);
                                    res.json({
                                        readings: readings,
                                        setpoints: setpoints,
                                    });
                                    return [3 /*break*/, 5];
                                case 4:
                                    error_4 = _a.sent();
                                    console.error("\u274C GET /api/readings/latest - Error:", error_4);
                                    res.status(500).json({ error: 'ERR_READINGS_LATEST: Failed to fetch latest readings' });
                                    return [3 /*break*/, 5];
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Endpoint específico para verificar o status atual dos dispositivos
                    app.get('/api/device/status', logRequest, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var latestReadings, latest, error_5;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    console.log("\u2192 GET /api/device/status - Request received");
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, storage_1.storage.getLatestReadings(1)];
                                case 2:
                                    latestReadings = _a.sent();
                                    if (!latestReadings || latestReadings.length === 0) {
                                        return [2 /*return*/, res.status(404).json({ error: 'No device status data available' })];
                                    }
                                    latest = latestReadings[0];
                                    res.json({
                                        timestamp: latest.timestamp,
                                        pumpStatus: latest.pumpStatus,
                                        heaterStatus: latest.heaterStatus,
                                    });
                                    return [3 /*break*/, 4];
                                case 3:
                                    error_5 = _a.sent();
                                    console.error("\u274C GET /api/device/status - Error:", error_5);
                                    res.status(500).json({ error: 'ERR_DEVICE_STATUS: Failed to fetch device status' });
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Get readings by date range from local database
                    app.get('/api/readings/history', logRequest, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, startDate, endDate, start, end, readings, aggregatedReadings, setpoints, stats, error_6;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    console.log("\u2192 GET /api/readings/history - Request received");
                                    _b.label = 1;
                                case 1:
                                    _b.trys.push([1, 4, , 5]);
                                    _a = req.query, startDate = _a.startDate, endDate = _a.endDate;
                                    if (!startDate || !endDate) {
                                        return [2 /*return*/, res.status(400).json({ error: 'Start and end dates are required' })];
                                    }
                                    start = new Date(startDate);
                                    end = new Date(endDate);
                                    return [4 /*yield*/, index_1.readingsService.getHistoricalReadings('local', { startDate: startDate, endDate: endDate })];
                                case 2:
                                    readings = _b.sent();
                                    if (readings.length === 0)
                                        return [2 /*return*/, res.status(404).json({ error: 'No data found for the selected period', message: 'Não há dados disponíveis para o período selecionado. Por favor, tente outro período.' })];
                                    aggregatedReadings = (0, dataAggregation_1.aggregateReadingsByDateRange)(readings, start, end);
                                    return [4 /*yield*/, index_1.readingsService.getSetpoints()];
                                case 3:
                                    setpoints = _b.sent();
                                    stats = index_1.readingsService.calculateStatistics(aggregatedReadings);
                                    res.json({
                                        readings: aggregatedReadings, // Enviamos os dados agregados
                                        setpoints: setpoints,
                                        stats: stats
                                    });
                                    return [3 /*break*/, 5];
                                case 4:
                                    error_6 = _b.sent();
                                    console.error("\u274C GET /api/readings/history - Error:", error_6);
                                    res.status(500).json({ error: 'ERR_READINGS_HISTORY: Failed to fetch readings history' });
                                    return [3 /*break*/, 5];
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Update setpoints
                    app.post('/api/setpoints', logRequest, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var result, updatedSetpoints, error_7;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    console.log("\u2192 POST /api/setpoints - Request received");
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    result = schema_1.insertSetpointSchema.safeParse(req.body);
                                    if (!result.success) {
                                        return [2 /*return*/, res.status(400).json({ error: 'Invalid setpoint data', details: result.error })];
                                    }
                                    return [4 /*yield*/, storage_1.storage.updateSetpoints(result.data)];
                                case 2:
                                    updatedSetpoints = _a.sent();
                                    res.json(updatedSetpoints);
                                    return [3 /*break*/, 4];
                                case 3:
                                    error_7 = _a.sent();
                                    console.error("\u274C POST /api/setpoints - Error:", error_7);
                                    res.status(500).json({ error: 'ERR_UPDATE_SETPOINTS: Failed to update setpoints' });
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Get settings
                    app.get('/api/settings', logRequest, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var settings, error_8;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    console.log("\u2192 GET /api/settings - Request received");
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, storage_1.storage.getSettings()];
                                case 2:
                                    settings = _a.sent();
                                    res.json(settings);
                                    return [3 /*break*/, 4];
                                case 3:
                                    error_8 = _a.sent();
                                    console.error("\u274C GET /api/settings - Error:", error_8);
                                    res.status(500).json({ error: 'Failed to fetch settings' });
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Update settings
                    app.post('/api/settings', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var result, updatedSettings, error_9;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    result = schema_1.insertSettingsSchema.safeParse(req.body);
                                    if (!result.success) {
                                        return [2 /*return*/, res.status(400).json({ error: 'Invalid settings data', details: result.error })];
                                    }
                                    return [4 /*yield*/, storage_1.storage.updateSettings(result.data)];
                                case 1:
                                    updatedSettings = _a.sent();
                                    res.json(updatedSettings);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_9 = _a.sent();
                                    console.error("\u274C POST /api/settings - Error:", error_9);
                                    res.status(500).json({ error: 'ERR_UPDATE_SETTINGS: Failed to update settings' });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Control pump - otimizado para resposta rápida sem persistência de histórico
                    app.post('/api/control/pump', logRequest, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var schema, result, updateResult, bgError_1, error_10;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    console.log("\u2192 POST /api/control/pump - Request received");
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 6, , 7]);
                                    schema = zod_1.z.object({
                                        status: zod_1.z.boolean()
                                    });
                                    result = schema.safeParse(req.body);
                                    if (!result.success) {
                                        return [2 /*return*/, res.status(400).json({ error: 'Invalid pump control data' })];
                                    }
                                    res.json({ success: true, pumpStatus: result.data.status, pending: true });
                                    _a.label = 2;
                                case 2:
                                    _a.trys.push([2, 4, , 5]);
                                    return [4 /*yield*/, (0, thingspeakService_1.updatePumpStatus)(result.data.status)];
                                case 3:
                                    updateResult = _a.sent();
                                    if (updateResult) {
                                        console.log('✅ Bomba atualizada com sucesso no ThingSpeak:', result.data.status ? 'LIGADA' : 'DESLIGADA');
                                    }
                                    else {
                                        console.log('⚠️ Bomba enviada para ThingSpeak, aguardando confirmação:', result.data.status ? 'LIGADA' : 'DESLIGADA');
                                    }
                                    return [3 /*break*/, 5];
                                case 4:
                                    bgError_1 = _a.sent();
                                    console.error('❌ Erro em segundo plano ao atualizar bomba:', bgError_1);
                                    return [3 /*break*/, 5];
                                case 5: return [3 /*break*/, 7];
                                case 6:
                                    error_10 = _a.sent();
                                    console.error("\u274C POST /api/control/pump - Error:", error_10);
                                    res.status(500).json({ error: 'ERR_CONTROL_PUMP: Failed to control pump' });
                                    return [3 /*break*/, 7];
                                case 7: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Control heater - otimizado para resposta rápida sem persistência de histórico
                    app.post('/api/control/heater', logRequest, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var schema, result, updateResult, bgError_2, error_11;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    console.log("\u2192 POST /api/control/heater - Request received");
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 6, , 7]);
                                    schema = zod_1.z.object({
                                        status: zod_1.z.boolean()
                                    });
                                    result = schema.safeParse(req.body);
                                    if (!result.success) {
                                        return [2 /*return*/, res.status(400).json({ error: 'Invalid heater control data' })];
                                    }
                                    res.json({ success: true, heaterStatus: result.data.status, pending: true });
                                    _a.label = 2;
                                case 2:
                                    _a.trys.push([2, 4, , 5]);
                                    return [4 /*yield*/, (0, thingspeakService_1.updateHeaterStatus)(result.data.status)];
                                case 3:
                                    updateResult = _a.sent();
                                    if (updateResult) {
                                        console.log('✅ Aquecedor atualizado com sucesso no ThingSpeak:', result.data.status ? 'LIGADO' : 'DESLIGADO');
                                    }
                                    else {
                                        console.log('⚠️ Aquecedor enviado para ThingSpeak, aguardando confirmação:', result.data.status ? 'LIGADO' : 'DESLIGADO');
                                    }
                                    return [3 /*break*/, 5];
                                case 4:
                                    bgError_2 = _a.sent();
                                    console.error('❌ Erro em segundo plano ao atualizar aquecedor:', bgError_2);
                                    return [3 /*break*/, 5];
                                case 5: return [3 /*break*/, 7];
                                case 6:
                                    error_11 = _a.sent();
                                    console.error("\u274C POST /api/control/heater - Error:", error_11);
                                    res.status(500).json({ error: 'ERR_CONTROL_HEATER: Failed to control heater' });
                                    return [3 /*break*/, 7];
                                case 7: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Rota para sincronização manual do backup
                    app.post('/api/backup/sync', logRequest, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var error_12;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    console.log("\u2192 POST /api/backup/sync - Request received");
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    console.log('🔄 Manual backup sync requested');
                                    return [4 /*yield*/, backupService_1.backupService.syncData()];
                                case 2:
                                    _a.sent();
                                    res.json({ success: true, message: 'Sincronização realizada com sucesso' });
                                    return [3 /*break*/, 4];
                                case 3:
                                    error_12 = _a.sent();
                                    console.error('Error during manual backup sync:', error_12);
                                    res.status(500).json({
                                        success: false,
                                        error: 'Falha na sincronização do backup',
                                        details: error_12 instanceof Error ? error_12.message : 'Erro desconhecido'
                                    });
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Rota para obter informações sobre o backup
                    app.get('/api/backup/status', logRequest, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var lastBackupInfo, error_13;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    console.log("\u2192 GET /api/backup/status - Request received");
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 5, , 6]);
                                    if (!!backupService_1.backupService.isInitialized) return [3 /*break*/, 3];
                                    return [4 /*yield*/, backupService_1.backupService.initialize()];
                                case 2:
                                    _a.sent();
                                    _a.label = 3;
                                case 3: return [4 /*yield*/, backupService_1.backupService.getLastBackupInfo()];
                                case 4:
                                    lastBackupInfo = _a.sent();
                                    res.json({
                                        success: true,
                                        status: 'online',
                                        message: 'Serviço de backup operacional',
                                        lastSyncId: lastBackupInfo.lastId,
                                        lastSyncDate: lastBackupInfo.lastDate,
                                        totalBackupRecords: lastBackupInfo.totalRecords
                                    });
                                    return [3 /*break*/, 6];
                                case 5:
                                    error_13 = _a.sent();
                                    console.error("\u274C GET /api/backup/status - Error:", error_13);
                                    res.status(500).json({
                                        success: false,
                                        status: 'offline',
                                        error: 'Falha ao verificar status do backup',
                                        details: error_13 instanceof Error ? error_13.message : 'Erro desconhecido'
                                    });
                                    return [3 /*break*/, 6];
                                case 6: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Rota para obter estatísticas do backup
                    app.get('/api/backup/stats', logRequest, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var stats, error_14;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    console.log("\u2192 GET /api/backup/stats - Request received");
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 5, , 6]);
                                    if (!!backupService_1.backupService.isInitialized) return [3 /*break*/, 3];
                                    return [4 /*yield*/, backupService_1.backupService.initialize()];
                                case 2:
                                    _a.sent();
                                    _a.label = 3;
                                case 3: return [4 /*yield*/, backupService_1.backupService.getBackupStats()];
                                case 4:
                                    stats = _a.sent();
                                    res.json({
                                        success: true,
                                        stats: stats
                                    });
                                    return [3 /*break*/, 6];
                                case 5:
                                    error_14 = _a.sent();
                                    console.error("\u274C GET /api/backup/stats - Error:", error_14);
                                    res.status(500).json({
                                        success: false,
                                        error: 'Falha ao obter estatísticas do backup',
                                        details: error_14 instanceof Error ? error_14.message : 'Erro desconhecido'
                                    });
                                    return [3 /*break*/, 6];
                                case 6: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Rota para importar dados históricos do ThingSpeak para o banco de dados local
                    app.post('/api/readings/import-from-thingspeak', logRequest, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var days, error_15;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    console.log("\u2192 POST /api/readings/import-from-thingspeak - Request received");
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    days = parseInt(req.query.days) || 7;
                                    if (isNaN(days) || days <= 0) {
                                        return [2 /*return*/, res.status(400).json({ error: 'Invalid number of days' })];
                                    }
                                    return [4 /*yield*/, index_2.syncService.importFromThingSpeak(days)];
                                case 2:
                                    _a.sent(); // Chamando o serviço
                                    res.json({
                                        success: true,
                                        message: "Importa\u00E7\u00E3o de ".concat(days, " dias de dados iniciada em background."),
                                        count: 0,
                                        background: true
                                    });
                                    return [3 /*break*/, 4];
                                case 3:
                                    error_15 = _a.sent();
                                    console.error("\u274C POST /api/readings/import-from-thingspeak - Error:", error_15);
                                    res.status(500).json({
                                        success: false,
                                        error: 'Falha ao importar dados do ThingSpeak',
                                    });
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/, httpServer];
            }
        });
    });
}
