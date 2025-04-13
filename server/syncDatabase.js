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
exports.syncThingspeakToDatabase = syncThingspeakToDatabase;
/**
 * Script para sincronizar dados do ThingSpeak para o banco de dados local
 * Este script importa dados históricos e os salva no banco de dados SQLite
 */
var thingspeakService_1 = require("./services/thingspeakService");
var storage_1 = require("./storage");
var vite_1 = require("./vite");
function syncThingspeakToDatabase() {
    return __awaiter(this, arguments, void 0, function (days) {
        var dbError_1, readings, importedCount, skipCount, errorCount, _i, readings_1, reading, readingToSave, error_1, error_2;
        if (days === void 0) { days = 7; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 14, , 15]);
                    (0, vite_1.log)("\uD83D\uDD04 Iniciando importa\u00E7\u00E3o de ".concat(days, " dias de dados do ThingSpeak para o banco local..."), 'sync');
                    console.log("Fetching ".concat(days, " days of data directly from ThingSpeak..."));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 6]);
                    // Método auxiliar para garantir que o banco está acessível
                    return [4 /*yield*/, storage_1.storage.getLatestReadings(1)];
                case 2:
                    // Método auxiliar para garantir que o banco está acessível
                    _a.sent();
                    return [3 /*break*/, 6];
                case 3:
                    dbError_1 = _a.sent();
                    console.error('Erro ao acessar o banco de dados antes da importação:', dbError_1);
                    (0, vite_1.log)('⚠️ Banco de dados não está acessível. Tentando inicializar...', 'sync');
                    if (!(storage_1.storage instanceof Object && typeof storage_1.storage.ensureInitialized === 'function')) return [3 /*break*/, 5];
                    return [4 /*yield*/, storage_1.storage.ensureInitialized()];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: return [3 /*break*/, 6];
                case 6: return [4 /*yield*/, (0, thingspeakService_1.fetchHistoricalReadings)(days)];
                case 7:
                    readings = _a.sent();
                    if (readings.length === 0) {
                        (0, vite_1.log)('⚠️ Nenhum dado encontrado no ThingSpeak para o período solicitado', 'sync');
                        return [2 /*return*/, 0];
                    }
                    (0, vite_1.log)("\uD83D\uDCCA Encontradas ".concat(readings.length, " leituras no ThingSpeak"), 'sync');
                    importedCount = 0;
                    skipCount = 0;
                    errorCount = 0;
                    _i = 0, readings_1 = readings;
                    _a.label = 8;
                case 8:
                    if (!(_i < readings_1.length)) return [3 /*break*/, 13];
                    reading = readings_1[_i];
                    _a.label = 9;
                case 9:
                    _a.trys.push([9, 11, , 12]);
                    readingToSave = {
                        temperature: reading.temperature,
                        level: reading.level,
                        pumpStatus: typeof reading.pumpStatus === 'boolean' ? reading.pumpStatus : false,
                        heaterStatus: typeof reading.heaterStatus === 'boolean' ? reading.heaterStatus : false,
                        timestamp: reading.timestamp instanceof Date ? reading.timestamp : new Date()
                    };
                    // Salvar no banco de dados local
                    return [4 /*yield*/, storage_1.storage.saveReading(readingToSave)];
                case 10:
                    // Salvar no banco de dados local
                    _a.sent();
                    importedCount++;
                    // Feedback periódico para importações grandes
                    if (importedCount % 100 === 0) {
                        (0, vite_1.log)("\uD83D\uDCE5 Importados ".concat(importedCount, "/").concat(readings.length, " registros..."), 'sync');
                    }
                    return [3 /*break*/, 12];
                case 11:
                    error_1 = _a.sent();
                    // Registro já pode existir no banco de dados, é normal falhar alguns
                    if (error_1 instanceof Error && error_1.message.includes('UNIQUE constraint failed')) {
                        // Ignorar erros de unicidade (registros duplicados)
                        skipCount++;
                        return [3 /*break*/, 12];
                    }
                    else {
                        // Logar outros erros mas continuar a importação
                        errorCount++;
                        console.error('Erro ao importar leitura:', error_1);
                    }
                    return [3 /*break*/, 12];
                case 12:
                    _i++;
                    return [3 /*break*/, 8];
                case 13:
                    (0, vite_1.log)("\u2705 Importa\u00E7\u00E3o conclu\u00EDda. ".concat(importedCount, " registros importados com sucesso."), 'sync');
                    if (skipCount > 0) {
                        (0, vite_1.log)("\u2139\uFE0F ".concat(skipCount, " registros ignorados (j\u00E1 existiam no banco)."), 'sync');
                    }
                    if (errorCount > 0) {
                        (0, vite_1.log)("\u26A0\uFE0F ".concat(errorCount, " erros encontrados durante a importa\u00E7\u00E3o."), 'sync');
                    }
                    return [2 /*return*/, importedCount];
                case 14:
                    error_2 = _a.sent();
                    console.error('❌ Erro durante a sincronização com ThingSpeak:', error_2);
                    (0, vite_1.log)("\u274C Falha na importa\u00E7\u00E3o: ".concat(error_2 instanceof Error ? error_2.message : String(error_2)), 'sync');
                    throw error_2;
                case 15: return [2 /*return*/];
            }
        });
    });
}
