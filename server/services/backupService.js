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
exports.backupService = exports.BackupService = void 0;
var sqlite3_1 = require("sqlite3");
var sqlite_1 = require("sqlite");
var path_1 = require("path");
// Caminho correto para os arquivos de banco de dados
var MAIN_DB_PATH = path_1.default.resolve(process.cwd(), 'aquaponia.db');
var BACKUP_DB_PATH = path_1.default.resolve(process.cwd(), 'aquaponia_backup.db');
/**
 * Serviço para sincronização entre o banco principal e o banco de backup
 */
var BackupService = /** @class */ (function () {
    function BackupService() {
        this.mainDb = null;
        this.backupDb = null;
        this.isInitialized = false;
        this.isSyncing = false;
        // Prefixo padrão para erros de backup
        this.ERROR_PREFIX = '[BACKUP_ERROR]';
    }
    /**
     * Garante que o banco de dados esteja inicializado.
     * @throws {Error} Se o banco de dados não estiver inicializado.
     */
    BackupService.prototype.ensureInitialized = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.isInitialized) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.initialize()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!this.backupDb) {
                            throw new Error("".concat(this.ERROR_PREFIX, " Backup database is not initialized"));
                        }
                        _a.label = 3;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Inicializa a conexão com os bancos de dados.
     */
    BackupService.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (this.isInitialized)
                            return [2 /*return*/];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 5, , 6]);
                        _a = this;
                        return [4 /*yield*/, (0, sqlite_1.open)({
                                filename: MAIN_DB_PATH,
                                driver: sqlite3_1.default.Database
                            })];
                    case 2:
                        _a.mainDb = _c.sent();
                        _b = this;
                        return [4 /*yield*/, (0, sqlite_1.open)({
                                filename: BACKUP_DB_PATH,
                                driver: sqlite3_1.default.Database
                            })];
                    case 3:
                        _b.backupDb = _c.sent();
                        // Criando tabelas no banco de backup se não existirem
                        return [4 /*yield*/, this.createBackupTables()];
                    case 4:
                        // Criando tabelas no banco de backup se não existirem
                        _c.sent();
                        this.isInitialized = true;
                        console.info('✅ Backup service initialized');
                        return [3 /*break*/, 6];                       
                    case 5:
                        error_1 = _c.sent();
                        console.error("".concat(this.ERROR_PREFIX, " \u274C Error initializing backup service:"), error_1);
                        throw error_1;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Cria as tabelas necessárias no banco de backup
     */
    BackupService.prototype.createBackupTables = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tableInfo, hasKeyColumn, hasValueColumn, schemaError_1, error_2, settings, setpoints;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 14, , 15]);
                        // Tabela readings com campos adicionais
                        return [4 /*yield*/, this.backupDb.exec("\n        CREATE TABLE IF NOT EXISTS readings (\n          id INTEGER PRIMARY KEY,\n          temperature REAL NOT NULL,\n          level REAL NOT NULL,\n          pump_status INTEGER NOT NULL,\n          heater_status INTEGER NOT NULL,\n          timestamp TEXT NOT NULL,\n          temperature_trend REAL DEFAULT 0,\n          level_trend REAL DEFAULT 0,\n          is_temp_critical INTEGER DEFAULT 0,\n          is_level_critical INTEGER DEFAULT 0,\n          data_source TEXT DEFAULT 'thingspeak',\n          data_quality REAL DEFAULT 1.0\n        )\n      ")];
                    case 1:
                        // Tabela readings com campos adicionais
                        _a.sent();
                        // Tabela de setpoints (igual à principal)
                        return [4 /*yield*/, this.backupDb.exec("\n        CREATE TABLE IF NOT EXISTS setpoints (\n          id INTEGER PRIMARY KEY AUTOINCREMENT,\n          temp_min REAL DEFAULT 25.0,\n          temp_max REAL DEFAULT 28.0,\n          level_min REAL DEFAULT 60.0,\n          level_max REAL DEFAULT 80.0,\n          updated_at TEXT DEFAULT CURRENT_TIMESTAMP\n        )\n      ")];
                    case 2:
                        // Tabela de setpoints (igual à principal)
                        _a.sent();
                        // Tabela de configurações (compatível com o banco principal)
                        return [4 /*yield*/, this.backupDb.exec("\n        CREATE TABLE IF NOT EXISTS settings (\n          id INTEGER PRIMARY KEY AUTOINCREMENT,\n          system_name TEXT DEFAULT 'Aquaponia',\n          update_interval INTEGER DEFAULT 1,\n          data_retention INTEGER DEFAULT 30,\n          email_alerts INTEGER DEFAULT 1,\n          push_alerts INTEGER DEFAULT 1,\n          alert_email TEXT DEFAULT NULL,\n          temp_critical_min REAL DEFAULT 18.0,\n          temp_warning_min REAL DEFAULT 20.0,\n          temp_warning_max REAL DEFAULT 28.0,\n          temp_critical_max REAL DEFAULT 30.0,\n          level_critical_min INTEGER DEFAULT 50,\n          level_warning_min INTEGER DEFAULT 60,\n          level_warning_max INTEGER DEFAULT 85,\n          level_critical_max INTEGER DEFAULT 90,\n          updated_at TEXT DEFAULT CURRENT_TIMESTAMP\n        )\n      ")];
                    case 3:
                        // Tabela de configurações (compatível com o banco principal)
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 10, , 11]);
                        return [4 /*yield*/, this.backupDb.all("PRAGMA table_info(settings)")];
                    case 5:
                        tableInfo = _a.sent();
                        hasKeyColumn = tableInfo.some(function (col) { return col.name === 'key'; });
                        hasValueColumn = tableInfo.some(function (col) { return col.name === 'value'; });
                        if (!!hasKeyColumn) return [3 /*break*/, 7];
                        console.warn('⚠️ Coluna "key" não encontrada na tabela settings. Adicionando...');
                        return [4 /*yield*/, this.backupDb.exec('ALTER TABLE settings ADD COLUMN key TEXT')];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        if (!!hasValueColumn) return [3 /*break*/, 9];
                        console.log('⚠️ Coluna "value" não encontrada na tabela settings. Adicionando...');
                        return [4 /*yield*/, this.backupDb.exec('ALTER TABLE settings ADD COLUMN value TEXT')];
                    case 8:
                        _a.sent();
                        _a.label = 9;
                    case 9:
                        console.info('✅ Verificação e correção do esquema da tabela settings concluída');
                        return [3 /*break*/, 11];
                    case 10:
                        schemaError_1 = _a.sent();
                        return [3 /*break*/, 11];
                    case 11: 
                        // Tabela de alertas (nova tabela para backup)
                        return [4 /*yield*/, this.backupDb.exec("\n        CREATE TABLE IF NOT EXISTS alerts (\n          id INTEGER PRIMARY KEY AUTOINCREMENT,\n          type TEXT NOT NULL,\n          severity TEXT NOT NULL,\n          message TEXT NOT NULL,\n          reading_id INTEGER NOT NULL,\n          created_at TEXT DEFAULT CURRENT_TIMESTAMP,\n          is_acknowledged INTEGER DEFAULT 0,\n          FOREIGN KEY (reading_id) REFERENCES readings (id)\n        )\n      ")];
                    case 12:
                        // Tabela de alertas (nova tabela para backup)
                        _a.sent();
                        // Tabela de estatísticas diárias (nova tabela para backup)
                        return [4 /*yield*/, this.backupDb.exec("\n        CREATE TABLE IF NOT EXISTS daily_stats (\n          id INTEGER PRIMARY KEY AUTOINCREMENT,\n          date TEXT UNIQUE NOT NULL,\n          min_temperature REAL NOT NULL,\n          max_temperature REAL NOT NULL,\n          avg_temperature REAL NOT NULL,\n          min_level REAL NOT NULL,\n          max_level REAL NOT NULL,\n          avg_level REAL NOT NULL,\n          pump_active_time INTEGER DEFAULT 0,\n          heater_active_time INTEGER DEFAULT 0,\n          reading_count INTEGER NOT NULL,\n          created_at TEXT DEFAULT CURRENT_TIMESTAMP\n        )\n      ")];
                    case 13:
                        // Tabela de estatísticas diárias (nova tabela para backup)
                        _a.sent();
                        // Tabela de histórico de sincronizações (nova tabela para backup)
                        _a.label = 14;
                    case 14: return [4 /*yield*/, this.backupDb.exec("\n        CREATE TABLE IF NOT EXISTS sync_history (\n          id INTEGER PRIMARY KEY AUTOINCREMENT,\n          timestamp TEXT NOT NULL,\n          success INTEGER NOT NULL,\n          record_count INTEGER NOT NULL,\n          error_message TEXT\n        )\n      ")];
                    case 15: 
                        // Tabela de histórico de sincronizações (nova tabela para backup)
                        _a.sent();                
                        return [3 /*break*/,16];
                    case 16:
                       _a.trys.push([16,16,16,16])
                        error_2 = _a.sent();
                        console.error("".concat(this.ERROR_PREFIX, " \u274C Error creating backup tables:"), error_2);
                        throw error_2;                       
                    case 17: return [4 /*yield*/, this.backupDb.get('SELECT COUNT(*) as count FROM settings')];                        
                    case 18:                       
                        settings = _a.sent();
                        if (!(settings.count === 0)) return [3 /*break*/, 20];
                        return [4 /*yield*/, this.backupDb.run("INSERT INTO settings (key, value) VALUES (?, ?)", ['temperature_thresholds', JSON.stringify({                                    
                                    tempCriticalMin: 18.0,
                                    tempCriticalMax: 30.0,
                                    levelCriticalMin: 50,                                    levelCriticalMax: 90                                
                                })])];                      
                    case 19:
                         _a.sent();
                        _a.label = 20;
                        
                        return [3/*break*/,22]
                   
                    case 20: 

                    case 19: return [4 /*yield*/, this.backupDb.get('SELECT COUNT(*) as count FROM setpoints')];
                    case 20:
                        setpoints = _a.sent();
                        if (!(setpoints.count === 0)) return [3 /*break*/, 22];
                        return [4 /*yield*/, this.backupDb.run("INSERT INTO setpoints (temp_min, temp_max, level_min, level_max) VALUES (?, ?, ?, ?)", [25.0, 28.0, 60.0, 80.0])];
                    case 21:
                        _a.sent();
                        _a.label = 22;
                    case 22:
                        console.info('✅ Backup database schema created successfully');
                        return [2 /*return*/];
                        break;                        
                    }
            });
        });
    };
    /**
     * Sincroniza os dados do banco principal para o banco de backup
     */
    BackupService.prototype.syncData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, lastBackupReading, lastId, newReadings, _i, newReadings_1, reading, endTime, duration, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.isInitialized) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.initialize()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (this.isSyncing) {
                            console.info('⏳ Sync already in progress, skipping...');
                            return [2 /*return*/];
                            break;
                        }
                        if (!(!this.mainDb || !this.backupDb)) return [3 /*break*/, 4];
                        console.error("".concat(this.ERROR_PREFIX, " \u274C Data bases are not initialized"));
                        return [4 /*yield*/, this.initialize()];
                    case 3:
                        _a.sent();
                        // Esta verificação é feita após a nova tentativa de inicialização
                        // Se não foi possível, dispara um erro.
                        // Lembre-se que não está repetindo o erro de 'initialize', mas gerando um novo
                        
                        if (!this.mainDb || !this.backupDb) {
                            throw new Error('Não foi possível inicializar os bancos de dados');
                        }
                        _a.label = 4;
                    case 4:
                        this.isSyncing = true;
                        console.log('🔄 Starting database sync...');
                        startTime = Date.now();
                        _a.label = 5;                        
                    case 5:
                        _a.trys.push([5, 15, 17, 18]);
                        return [4 /*yield*/, this.backupDb.get('SELECT MAX(id) as last_id FROM readings')];
                    case 6:
                        lastBackupReading = _a.sent();
                        lastId = (lastBackupReading === null || lastBackupReading === void 0 ? void 0 : lastBackupReading.last_id) || 0;
                        return [4 /*yield*/, this.mainDb.all('SELECT * FROM readings WHERE id > ? ORDER BY id ASC LIMIT 1000', [lastId])];
                    case 7:
                        
                        newReadings = _a.sent();
                        if (newReadings.length === 0) {
                            console.info('✅ No new readings to sync');
                            this.isSyncing = false;
                            return [2 /*return*/];
                            break;
                        }
                        console.log("\uD83D\uDD04 Syncing ".concat(newReadings.length, " new readings..."));
                        // Iniciar transação para garantir consistência
                        return [4 /*yield*/, this.backupDb.run('BEGIN TRANSACTION')];
                    case 8:
                        // Iniciar transação para garantir consistência
                        _a.sent();
                        _i = 0, newReadings_1 = newReadings;
                        _a.label = 9;
                    case 9:
                        if (!(_i < newReadings_1.length)) return [3 /*break*/, 12];
                        reading = newReadings_1[_i];
                        return [4 /*yield*/, this.processAndInsertReading(reading)];
                    case 10:
                        _a.sent();
                        _a.label = 11;
                    case 11:
                        _i++;
                        return [3 /*break*/, 9];
                    case 12: 
                    // Verificar se há necessidade de gerar estatísticas diárias
                    return [4 /*yield*/, this.generateDailyStats()];
                    case 13:
                        // Verificar se há necessidade de gerar estatísticas diárias
                        _a.sent();
                        // Confirmar transação
                        return [4 /*yield*/, this.backupDb.run('COMMIT')];
                    case 14:
                        // Confirmar transação
                        _a.sent();
                        endTime = Date.now();
                        duration = endTime - startTime;
                        console.info("\u2705 Successfully synced ".concat(newReadings.length, " readings in ").concat(duration, "ms"));
                        return [3 /*break*/, 18];
                    case 15:
                        error_3 = _a.sent();
                        console.error("".concat(this.ERROR_PREFIX, " \u274C Error during sync:"), error_3.message, error_3.cause, error_3.name);
                        // Reverter alterações em caso de erro
                        return [4 /*yield*/, this.backupDb.run('ROLLBACK')];
                    case 16:
                        // Reverter alterações em caso de erro
                        _a.sent();
                        // Relançar o erro para que a camada superior também trate
                        throw error_3;
                    case 17:
                        this.isSyncing = false;
                        return [7 /*endfinally*/];
                    case 18: return [2 /*return*/];
                }
            });
            
        });
    };
    /**
     * Processa uma leitura e calcula campos adicionais antes de inserir no backup
     */
    BackupService.prototype.processAndInsertReading = function (reading) {
        return __awaiter(this, void 0, void 0, function () {
            var processStartTime, previousReading, temperatureTrend, levelTrend, thresholds, tempCriticalMin, tempCriticalMax, levelCriticalMin, levelCriticalMax, isTempCritical, isLevelCritical, processEndTime, processDuration, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        processStartTime = Date.now();
                        return [4 /*yield*/, this.backupDb.get('SELECT temperature, level FROM readings ORDER BY id DESC LIMIT 1')];
                    case 1:
                        previousReading = _a.sent();
                        temperatureTrend = previousReading
                            ? reading.temperature - previousReading.temperature
                            : 0;
                        levelTrend = previousReading
                        ? reading.level - previousReading.level
                        : 0;
                        thresholds = {temp_critical_min:18.0, temp_critical_max:30.0, level_critical_min:50, level_critical_max:90};
                        tempCriticalMin = thresholds.temp_critical_min;
                        tempCriticalMax = thresholds.temp_critical_max;
                            : 0;
                                          
                        levelCriticalMin = 50;
                        levelCriticalMax = 90;
                        isTempCritical = reading.temperature < tempCriticalMin ||
                            reading.temperature > tempCriticalMax;
                        isLevelCritical = reading.level < levelCriticalMin ||
                        
                            reading.level > levelCriticalMax;
                        // Inserir leitura com campos adicionais
                        return [4 /*yield*/, this.backupDb.run("INSERT INTO readings (\n          id, temperature, level, pump_status, heater_status, timestamp,\n          temperature_trend, level_trend, is_temp_critical, is_level_critical,\n          data_source, data_quality\n        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                                reading.id,
                                reading.temperature,
                                reading.level,
                                reading.pumpStatus ? 1 : 0,
                                reading.heaterStatus ? 1 : 0,
                                reading.timestamp,
                                temperatureTrend,
                                levelTrend,
                                isTempCritical ? 1 : 0,
                                isLevelCritical ? 1 : 0,
                                'thingspeak',
                                1.0 // qualidade padrão para dados do ThingSpeak
                            ])];
                    case 3:
                        // Inserir leitura com campos adicionais
                        _a.sent();
                        if (!(isTempCritical || isLevelCritical)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.generateAlert(reading.id, isTempCritical, isLevelCritical)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        processEndTime = Date.now();
                        processDuration = processEndTime - processStartTime;
                        console.debug("\u2705 Reading ".concat(reading.id, " processed and inserted in ").concat(processDuration, "ms"));
                        return [3 /*break*/, 6];
                    case 5:
                        error_4 = _a.sent();
                        console.error("".concat(this.ERROR_PREFIX, " \u274C Error processing reading for backup:"), error_4.message, error_4.cause, error_4.name);
                        // Relançar para que o erro seja tratado no método que chamou
                        throw error_4;
                    case 6: return [2 /*return*/];
                         break;
                }
            });
        });
    };
    /**
     * Gera um alerta para condições críticas
     */
    BackupService.prototype.generateAlert = function (readingId, isTempCritical, isLevelCritical) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!isTempCritical) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.backupDb.run("INSERT INTO alerts (type, severity, message, reading_id) \n         VALUES (?, ?, ?, ?)", [
                                'temperature',
                                'critical',
                                'Temperatura fora dos limites críticos!',
                                readingId
                            ])];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!isLevelCritical) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.backupDb.run("INSERT INTO alerts (type, severity, message, reading_id) \n         VALUES (?, ?, ?, ?)", [
                                'water_level',
                                'critical',
                                'Nível da água fora dos limites críticos!',
                                readingId
                            ])];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
                break;
                
            });
        });
    };
    /**
     * Gera estatísticas diárias se não existirem para o dia atual
     */
    BackupService.prototype.generateDailyStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            var today, existingStats, stats, pumpActiveTime, heaterActiveTime;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        today = new Date().toISOString().split('T')[0];
                        return [4 /*yield*/, this.backupDb.get('SELECT id FROM daily_stats WHERE date = ?', [today])];
                    case 1:
                        existingStats = _a.sent();
                        
                        if (existingStats) {
                            return [2 /*return*/]; // Estatísticas já existem para hoje
                            break;
                        }
                        return [4 /*yield*/, this.backupDb.get("SELECT \n        MIN(temperature) as min_temperature,\n        MAX(temperature) as max_temperature,\n        AVG(temperature) as avg_temperature,\n        MIN(level) as min_level,\n        MAX(level) as max_level,\n        AVG(level) as avg_level,\n        SUM(CASE WHEN pump_status = 1 THEN 1 ELSE 0 END) as pump_active_count,\n        SUM(CASE WHEN heater_status = 1 THEN 1 ELSE 0 END) as heater_active_count,\n        COUNT(*) as reading_count\n      FROM readings \n      WHERE date(timestamp) = ?", [today])];
                    case 2:
                        stats = _a.sent();
                        if (!stats || stats.reading_count === 0) {
                            return [2 /*return*/]; // Sem leituras para hoje
                            
                        }    break;
                        pumpActiveTime = stats.pump_active_count * 5;
                        heaterActiveTime = stats.heater_active_count * 5;
                        // Inserir estatísticas diárias
                        return [4 /*yield*/, this.backupDb.run("INSERT INTO daily_stats (\n        date, min_temperature, max_temperature, avg_temperature,\n        min_level, max_level, avg_level,\n        pump_active_time, heater_active_time, reading_count\n      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                                today,
                                stats.min_temperature,
                                stats.max_temperature,
                                stats.avg_temperature,
                                stats.min_level,
                                stats.max_level,
                                stats.avg_level,
                                pumpActiveTime,
                                heaterActiveTime,
                                stats.reading_count
                            ])];
                    case 3:
                        // Inserir estatísticas diárias
                        _a.sent();
                        console.info("\uD83D\uDCCA Generated daily stats for ".concat(today));
                        return [2 /*return*/];
                        break;
                }
            });
        });
    };
    /**
     * Obtém informações sobre o último backup
     */
    BackupService.prototype.getLastBackupInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            var lastReading, totalCount, now, brasiliaTime, options, formattedNow, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.isInitialized) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.initialize()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!this.backupDb) {
                            throw new Error("".concat(this.ERROR_PREFIX, " Backup database is not initialized"));
                        }
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 6, , 7]);
                        return [4 /*yield*/, this.backupDb.get('SELECT id, timestamp FROM readings ORDER BY id DESC LIMIT 1')];
                    case 4:
                        lastReading = _a.sent();
                        return [4 /*yield*/, this.backupDb.get('SELECT COUNT(*) as count FROM readings')];
                    case 5:
                        totalCount = _a.sent();
                        now = new Date();
                        brasiliaTime = new Date(now.getTime() - 3 * 60 * 60 * 1000);
                        options = {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false,
                            timeZone: 'America/Sao_Paulo'
                        };
                        formattedNow = new Intl.DateTimeFormat('pt-BR', options).format(now);
                        return [2 /*return*/, {
                                lastId: (lastReading === null || lastReading === void 0 ? void 0 : lastReading.id) || 0,
                                lastDate: formattedNow,
                                totalRecords: (totalCount === null || totalCount === void 0 ? void 0 : totalCount.count) || 0
                            }];
                    case 6:
                        error_5 = _a.sent();
                        console.error("".concat(this.ERROR_PREFIX, " Error getting backup information:"), error_5);
                        options = {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false,
                            timeZone: 'America/Sao_Paulo'
                        };
                        formattedNow = new Intl.DateTimeFormat('pt-BR', options).format(now);
                        return [2 /*return*/, {
                                lastId: 0,
                                lastDate: formattedNow,
                                totalRecords: 0
                            }];
                    case 7: return [2 /*return*/];
                           break;
                }
            });
        });
    };
    /**
     * Obtém estatísticas do banco de backup
     */
    BackupService.prototype.getBackupStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            var dailyStats, formattedDailyStats, alertCount, criticalAlertsCount, syncHistory, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureInitialized()];
                    case 1:
                        _a.sent();
                        if (!this.backupDb) {
                            throw new Error("".concat(this.ERROR_PREFIX, " Backup database is not initialized"));
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 7]);
                        return [4 /*yield*/, this.backupDb.all("SELECT \n          date, \n          min_temperature, \n          max_temperature, \n          avg_temperature,\n          reading_count\n        FROM daily_stats\n        ORDER BY date DESC\n        LIMIT 7")];
                    case 3:
                        dailyStats = _a.sent();
                        formattedDailyStats = dailyStats.map(function (stat) { return ({
                            date: stat.date,
                            minTemperature: stat.min_temperature,
                            maxTemperature: stat.max_temperature,
                            avgTemperature: stat.avg_temperature,
                            readingCount: stat.reading_count
                        }); });
                        return [4 /*yield*/, this.backupDb.get('SELECT COUNT(*) as count FROM alerts')];
                    case 4:
                        alertCount = _a.sent();
                        return [4 /*yield*/, this.backupDb.get('SELECT COUNT(*) as count FROM alerts WHERE severity = "critical"')];
                    case 5:
                        criticalAlertsCount = _a.sent();
                        syncHistory = [
                            //TODO: Remover dados fictícios
                            {
                                success: true,                                
                                timestamp: nowFormatted,
                                recordCount: 12
                            },
                            {
                                success: true,
                                timestamp: oneHourAgoFormatted,
                                recordCount: 8
                            }
                        ];
                        return [2 /*return*/, {
                                dailyStats: formattedDailyStats,
                                alertCount: (alertCount === null || alertCount === void 0 ? void 0 : alertCount.count) || 0,
                                criticalAlertsCount: (criticalAlertsCount === null || criticalAlertsCount === void 0 ? void 0 : criticalAlertsCount.count) || 0,
                                syncHistory: syncHistory
                            }];
                    case 6:
                        error_6 = _a.sent();
                        console.error("".concat(this.ERROR_PREFIX, " Error getting backup statistics:"), error_6);
                        return [2 /*return*/, {
                                dailyStats: [],
                                alertCount: 0,
                                criticalAlertsCount: 0,
                                syncHistory: []
                            }];
                    case 7: return [2 /*return*/];
                    break;
                }
            });
        });
    };
    /**
     * Fecha as conexões dos bancos de dados
     */
    BackupService.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.mainDb) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.mainDb.close()];
                        
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!this.backupDb) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.backupDb.close()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        this.isInitialized = false;
                        console.info('🔄 Backup service closed');
                        return [2 /*return*/];
                        break;
                }
            });
        });
    };
    return BackupService;
}());
exports.BackupService = BackupService;
// Instância global do serviço
exports.backupService = new BackupService();
