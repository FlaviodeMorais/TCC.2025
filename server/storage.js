"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.SqliteStorage = exports.MemStorage = void 0;
var databaseService_1 = require("./services/databaseService");
var index_1 = require("./index");
var MemStorage = /** @class */ (function () {
    function MemStorage() {
        this.readings = [];
        this.readingId = 1;
        // Initialize with default values
        this.setpoints = {
            id: 1,
            tempMin: 20.0,
            tempMax: 30.0,
            levelMin: 60,
            levelMax: 90,
            updatedAt: new Date()
        };
        this.settings = {
            id: 1,
            systemName: "Aquaponia",
            updateInterval: 1,
            dataRetention: 30,
            emailAlerts: true,
            pushAlerts: true,
            alertEmail: null,
            tempCriticalMin: 18.0,
            tempWarningMin: 20.0,
            tempWarningMax: 28.0,
            tempCriticalMax: 30.0,
            levelCriticalMin: 50,
            levelWarningMin: 60,
            levelWarningMax: 85,
            levelCriticalMax: 90,
            updatedAt: new Date()
        };
    }
    MemStorage.prototype.getLatestReadings = function (limit) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.readings
                        .sort(function (a, b) { return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(); })
                        .slice(0, limit)];
            });
        });
    };
    MemStorage.prototype.getReadingsByDateRange = function (startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var start, end;
            return __generator(this, function (_a) {
                start = new Date(startDate);
                end = new Date(endDate);
                return [2 /*return*/, this.readings.filter(function (reading) {
                        var readingDate = new Date(reading.timestamp);
                        return readingDate >= start && readingDate <= end;
                    }).sort(function (a, b) { return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(); })];
            });
        });
    };
    MemStorage.prototype.saveReading = function (reading) {
        return __awaiter(this, void 0, void 0, function () {
            var newReading;
            var _a, _b;
            return __generator(this, function (_c) {
                newReading = __assign(__assign({ id: this.readingId++ }, reading), { pumpStatus: (_a = reading.pumpStatus) !== null && _a !== void 0 ? _a : false, heaterStatus: (_b = reading.heaterStatus) !== null && _b !== void 0 ? _b : false, timestamp: reading.timestamp || new Date() });
                this.readings.push(newReading);
                return [2 /*return*/, newReading];
            });
        });
    };
    MemStorage.prototype.getSetpoints = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.setpoints];
            });
        });
    };
    MemStorage.prototype.updateSetpoints = function (setpoints) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.setpoints = __assign(__assign(__assign({}, this.setpoints), setpoints), { updatedAt: new Date() });
                return [2 /*return*/, this.setpoints];
            });
        });
    };
    MemStorage.prototype.getSettings = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.settings];
            });
        });
    };
    MemStorage.prototype.updateSettings = function (settings) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.settings = __assign(__assign(__assign({}, this.settings), settings), { updatedAt: new Date() });
                return [2 /*return*/, this.settings];
            });
        });
    };
    MemStorage.prototype.getTemperatureStats = function (readings) {
        if (readings.length === 0) {
            return { avg: 0, min: 0, max: 0, stdDev: 0 };
        }
        var temperatures = readings.map(function (r) { return r.temperature; });
        var avg = temperatures.reduce(function (sum, t) { return sum + t; }, 0) / temperatures.length;
        var min = Math.min.apply(Math, temperatures);
        var max = Math.max.apply(Math, temperatures);
        // Calculate standard deviation
        var squareDiffs = temperatures.map(function (value) { return Math.pow(value - avg, 2); });
        var avgSquareDiff = squareDiffs.reduce(function (sum, diff) { return sum + diff; }, 0) / squareDiffs.length;
        var stdDev = Math.sqrt(avgSquareDiff);
        return { avg: avg, min: min, max: max, stdDev: stdDev };
    };
    MemStorage.prototype.getLevelStats = function (readings) {
        if (readings.length === 0) {
            return { avg: 0, min: 0, max: 0, stdDev: 0 };
        }
        var levels = readings.map(function (r) { return r.level; });
        var avg = levels.reduce(function (sum, l) { return sum + l; }, 0) / levels.length;
        var min = Math.min.apply(Math, levels);
        var max = Math.max.apply(Math, levels);
        // Calculate standard deviation
        var squareDiffs = levels.map(function (value) { return Math.pow(value - avg, 2); });
        var avgSquareDiff = squareDiffs.reduce(function (sum, diff) { return sum + diff; }, 0) / squareDiffs.length;
        var stdDev = Math.sqrt(avgSquareDiff);
        return { avg: avg, min: min, max: max, stdDev: stdDev };
    };
    return MemStorage;
}());
exports.MemStorage = MemStorage;
var db_1 = require("./db");
var SqliteStorage = /** @class */ (function () {
    function SqliteStorage() {
        this.initialized = false;
        this.init();
    }
    SqliteStorage.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        _a = this;
                        return [4 /*yield*/, (0, db_1.getDb)()];
                    case 1:
                        _a.db = _b.sent(); // Usando getDb para obter a conexão
                        return [4 /*yield*/, (0, databaseService_1.initializeDb)()];
                    case 2:
                        _b.sent(); // Inicializando as tabelas, se necessário
                        this.initialized = true;
                        console.log('✅ SqliteStorage initialized successfully');
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _b.sent();
                        console.error('❌ Error initializing SqliteStorage database:', error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SqliteStorage.prototype.ensureInitialized = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(!this.initialized || !this.db)) return [3 /*break*/, 2];
                        console.log('🔄 Reinitializing database connection...');
                        return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    SqliteStorage.prototype.getLatestReadings = function (limit) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureInitialized()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.db.all("SELECT * FROM readings \n       ORDER BY timestamp DESC \n       LIMIT ?", [limit])];
                }
            });
        });
    };
    SqliteStorage.prototype.getReadingsByDateRange = function (startDate_1, endDate_1) {
        return __awaiter(this, arguments, void 0, function (startDate, endDate, maxResults) {
            var adjustedEndDate, adjustedEndDateString, tableCheck, countResult, readings, formattedReadings, error_2;
            if (maxResults === void 0) { maxResults = 1000; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureInitialized()];
                    case 1:
                        _a.sent();
                        console.log("SQL Query: Buscando leituras entre ".concat(startDate, " e ").concat(endDate, " (max: ").concat(maxResults, ")"));
                        adjustedEndDate = new Date(endDate);
                        adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
                        adjustedEndDateString = adjustedEndDate.toISOString().split('T')[0];
                        console.log("Data inicial: ".concat(startDate, ", Data final ajustada: ").concat(adjustedEndDateString));
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 8, , 9]);
                        return [4 /*yield*/, this.db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='readings'")];
                    case 3:
                        tableCheck = _a.sent();
                        if (!!tableCheck) return [3 /*break*/, 5];
                        console.log("Tabela 'readings' não encontrada, recriando esquema...");
                        // Recreate schema if needed
                        return [4 /*yield*/, this.db.exec("\n          CREATE TABLE IF NOT EXISTS readings (\n            id INTEGER PRIMARY KEY AUTOINCREMENT,\n            temperature REAL NOT NULL,\n            level REAL NOT NULL,\n            pump_status INTEGER DEFAULT 0,\n            heater_status INTEGER DEFAULT 0,\n            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP\n          );\n          CREATE INDEX IF NOT EXISTS idx_readings_timestamp ON readings(timestamp);\n        ")];
                    case 4:
                        // Recreate schema if needed
                        _a.sent();
                        return [2 /*return*/, []];
                    case 5: return [4 /*yield*/, this.db.get('SELECT COUNT(*) as count FROM readings')];
                    case 6:
                        countResult = _a.sent();
                        console.log("Total de leituras no banco: ".concat(countResult ? countResult.count : 0));
                        return [4 /*yield*/, this.db.all("SELECT * FROM readings \n         WHERE datetime(timestamp) >= datetime(?) AND datetime(timestamp) <= datetime(?) \n         ORDER BY timestamp ASC\n         LIMIT ?", [startDate + 'T00:00:00.000Z', adjustedEndDateString + 'T23:59:59.999Z', maxResults])];
                    case 7:
                        readings = _a.sent();
                        console.log("Encontradas ".concat(readings.length, " leituras no banco de dados para o per\u00EDodo especificado."));
                        formattedReadings = readings.map(function (reading) { return (__assign(__assign({}, reading), { pumpStatus: reading.pump_status === 1, heaterStatus: reading.heater_status === 1, timestamp: new Date(reading.timestamp) })); });
                        return [2 /*return*/, formattedReadings];
                    case 8:
                        error_2 = _a.sent();
                        console.error("Erro ao buscar leituras do banco:", error_2);
                        return [2 /*return*/, []];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    SqliteStorage.prototype.saveReading = function (reading) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureInitialized()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.db.run("INSERT INTO readings (temperature, level, pump_status, heater_status, timestamp) VALUES (?, ?, ?, ?, ?)", [reading.temperature, reading.level, reading.pumpStatus ? 1 : 0, reading.heaterStatus ? 1 : 0, reading.timestamp.toISOString()])];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, index_1.readingsService.checkDuplicateAndSave(reading)];
                }
            });
        });
    };
    SqliteStorage.prototype.getSetpoints = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureInitialized()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.db.get('SELECT * FROM setpoints WHERE id = 1')];
                }
            });
        });
    };
    SqliteStorage.prototype.updateSetpoints = function (setpoints) {
        return __awaiter(this, void 0, void 0, function () {
            var columns, values;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureInitialized()];
                    case 1:
                        _a.sent();
                        columns = Object.keys(setpoints).map(function (key) { return "".concat(_this.toSnakeCase(key), " = ?"); }).join(', ');
                        values = Object.values(setpoints);
                        return [4 /*yield*/, this.db.run("UPDATE setpoints\n       SET ".concat(columns, ", updated_at = CURRENT_TIMESTAMP \n       WHERE id = 1"), values)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, this.getSetpoints()];
                }
            });
        });
    };
    SqliteStorage.prototype.getSettings = function () {
        return __awaiter(this, void 0, void 0, function () {
            var settings;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureInitialized()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.db.get('SELECT * FROM settings WHERE id = 1')];
                    case 2:
                        settings = _a.sent();
                        if (settings)
                            return [2 /*return*/, settings];
                        // Create default settings if they don't exist
                        return [4 /*yield*/, this.db.run("\n      INSERT INTO settings (id) VALUES (1)\n    ")];
                    case 3:
                        // Create default settings if they don't exist
                        _a.sent();
                        return [2 /*return*/, this.db.get('SELECT * FROM settings WHERE id = 1')];
                }
            });
        });
    };
    SqliteStorage.prototype.updateSettings = function (settings) {
        return __awaiter(this, void 0, void 0, function () {
            var columns, values;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureInitialized()];
                    case 1:
                        _a.sent();
                        columns = Object.keys(settings).map(function (key) { return "".concat(_this.toSnakeCase(key), " = ?"); }).join(', ');
                        values = Object.values(settings);
                        return [4 /*yield*/, this.db.run("UPDATE settings SET ".concat(columns, ", updated_at = CURRENT_TIMESTAMP WHERE id = 1"), values)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, this.getSettings()];
                }
            });
        });
    };
    SqliteStorage.prototype.toSnakeCase = function (str) {
        return str.replace(/([A-Z])/g, '_$1').toLowerCase();
    };
    SqliteStorage.prototype.getTemperatureStats = function (readings) {
        if (readings.length === 0) {
            return { avg: 0, min: 0, max: 0, stdDev: 0 };
        }
        var temperatures = readings.map(function (r) { return r.temperature; });
        var avg = temperatures.reduce(function (sum, t) { return sum + t; }, 0) / temperatures.length;
        var min = Math.min.apply(Math, temperatures);
        var max = Math.max.apply(Math, temperatures);
        // Calculate standard deviation
        var squareDiffs = temperatures.map(function (value) { return Math.pow(value - avg, 2); });
        var avgSquareDiff = squareDiffs.reduce(function (sum, diff) { return sum + diff; }, 0) / squareDiffs.length;
        var stdDev = Math.sqrt(avgSquareDiff);
        return { avg: avg, min: min, max: max, stdDev: stdDev };
    };
    SqliteStorage.prototype.getLevelStats = function (readings) {
        if (readings.length === 0) {
            return { avg: 0, min: 0, max: 0, stdDev: 0 };
        }
        var levels = readings.map(function (r) { return r.level; });
        var avg = levels.reduce(function (sum, l) { return sum + l; }, 0) / levels.length;
        var min = Math.min.apply(Math, levels);
        var max = Math.max.apply(Math, levels);
        // Calculate standard deviation
        var squareDiffs = levels.map(function (value) { return Math.pow(value - avg, 2); });
        var avgSquareDiff = squareDiffs.reduce(function (sum, diff) { return sum + diff; }, 0) / squareDiffs.length;
        var stdDev = Math.sqrt(avgSquareDiff);
        return { avg: avg, min: min, max: max, stdDev: stdDev };
    };
    return SqliteStorage;
}());
exports.SqliteStorage = SqliteStorage;
// Use SQLite storage by default
exports.storage = new SqliteStorage();
