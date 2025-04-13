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
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDb = initializeDb;
var fs_1 = require("fs");
var path_1 = require("path");
var db_1 = require("../db"); // Importando o gerenciador de conexão
var DB_PATH = path_1.default.resolve(process.cwd(), process.env.DB_FILE || 'aquaponia.db');
function initializeDb() {
    return __awaiter(this, void 0, void 0, function () {
        var needsInit, dir, stats, db, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    needsInit = !fs_1.default.existsSync(DB_PATH) || fs_1.default.statSync(DB_PATH).size === 0;
                    if (needsInit) {
                        console.log('📁 Criando ou recriando banco de dados:', DB_PATH);
                        if (fs_1.default.existsSync(DB_PATH)) {
                            fs_1.default.unlinkSync(DB_PATH);
                        }
                        dir = path_1.default.dirname(DB_PATH);
                        if (!fs_1.default.existsSync(dir)) {
                            fs_1.default.mkdirSync(dir, { recursive: true });
                        }
                    }
                    else {
                        stats = fs_1.default.statSync(DB_PATH);
                    }
                    return [4 /*yield*/, (0, db_1.getDb)()];
                case 1:
                    db = _a.sent();
                    console.log('🔄 Connected to database');
                    // Create tables if they don't exist
                    return [4 /*yield*/, db.exec("\n    CREATE TABLE IF NOT EXISTS readings (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      temperature REAL NOT NULL,\n      level REAL NOT NULL,\n      pump_status INTEGER DEFAULT 0,\n      heater_status INTEGER DEFAULT 0,\n      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP\n    );\n\n    CREATE TABLE IF NOT EXISTS setpoints (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      temp_min REAL DEFAULT 20.0 NOT NULL,\n      temp_max REAL DEFAULT 30.0 NOT NULL,\n      level_min INTEGER DEFAULT 60 NOT NULL,\n      level_max INTEGER DEFAULT 90 NOT NULL,\n      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n    );\n\n    CREATE TABLE IF NOT EXISTS settings (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      system_name TEXT DEFAULT 'Aquaponia' NOT NULL,\n      update_interval INTEGER DEFAULT 1 NOT NULL,\n      data_retention INTEGER DEFAULT 30 NOT NULL,\n      email_alerts INTEGER DEFAULT 1 NOT NULL,\n      push_alerts INTEGER DEFAULT 1 NOT NULL,\n      alert_email TEXT,\n      temp_critical_min REAL DEFAULT 18.0 NOT NULL,\n      temp_warning_min REAL DEFAULT 20.0 NOT NULL,\n      temp_warning_max REAL DEFAULT 28.0 NOT NULL,\n      temp_critical_max REAL DEFAULT 30.0 NOT NULL,\n      level_critical_min INTEGER DEFAULT 50 NOT NULL,\n      level_warning_min INTEGER DEFAULT 60 NOT NULL,\n      level_warning_max INTEGER DEFAULT 85 NOT NULL,\n      level_critical_max INTEGER DEFAULT 90 NOT NULL,\n      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n    );\n\n    CREATE INDEX IF NOT EXISTS idx_readings_timestamp ON readings(timestamp);\n  ")];
                case 2:
                    // Create tables if they don't exist
                    _a.sent();
                    console.log('✅ Database tables created successfully');
                    // Insert default setpoints if they don't exist
                    return [4 /*yield*/, db.run("\n    INSERT INTO setpoints (id, temp_min, temp_max, level_min, level_max)\n    SELECT 1, 20.0, 30.0, 60, 90\n    WHERE NOT EXISTS (SELECT 1 FROM setpoints WHERE id = 1);\n  ")];
                case 3:
                    // Insert default setpoints if they don't exist
                    _a.sent();
                    // Insert default settings if they don't exist
                    return [4 /*yield*/, db.run("\n    INSERT INTO settings (id)\n    SELECT 1\n    WHERE NOT EXISTS (SELECT 1 FROM settings WHERE id = 1);\n  ")];
                case 4:
                    // Insert default settings if they don't exist
                    _a.sent();
                    console.log('✅ Database initialized with default values');
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _a.sent();
                    console.error('❌ Error initializing database:', error_1);
                    throw error_1;
                case 6: return [2 /*return*/];
            }
        });
    });
}
