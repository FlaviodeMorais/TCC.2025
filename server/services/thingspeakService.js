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
exports.REFRESH_INTERVAL = void 0;
exports.getCurrentDeviceStatus = getCurrentDeviceStatus;
exports.fetchLatestReading = fetchLatestReading;
exports.updateField = updateField;
exports.updatePumpStatus = updatePumpStatus;
exports.updateHeaterStatus = updateHeaterStatus;
exports.fetchHistoricalReadings = fetchHistoricalReadings;
// ThingSpeak Service for fetching and updating data
var node_fetch_1 = require("node-fetch");
var thingspeakConfig_1 = require("./thingspeakConfig");
// Set the refresh interval (in milliseconds)
// Atualizado para 5 minutos (300,000ms) para reduzir carga no backend e otimizar gravações no banco
exports.REFRESH_INTERVAL = parseInt(process.env.REFRESH_INTERVAL || '300000');
/**
 * Variável para manter o estado mais recente dos dispositivos em memória
 * Esse estado é SEMPRE mais atual que o banco de dados, pois reflete a última ação do usuário
 * mesmo antes da confirmação do ThingSpeak, que pode levar até 30 segundos.
 *
 * Este estado é usado para fornecer feedback imediato na interface enquanto aguardamos
 * a confirmação do ThingSpeak.
 */
var currentDeviceStatus = {
    pumpStatus: false,
    heaterStatus: false,
    lastUpdate: new Date()
};
/**
 * Função para garantir consistência dos valores no ThingSpeak
 * Esta função é chamada periodicamente para sincronizar o estado dos dispositivos
 */
function ensureConsistentDeviceState() {
    return __awaiter(this, void 0, void 0, function () {
        var timestamp, response, data, latestFeed, thingspeakPumpStatus, thingspeakHeaterStatus, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    console.log("🔄 [ThingSpeak] Verificando consistência dos valores no ThingSpeak...");
                    timestamp = new Date().getTime();
                    return [4 /*yield*/, (0, node_fetch_1.default)("".concat(thingspeakConfig_1.THINGSPEAK_BASE_URL, "/channels/").concat(thingspeakConfig_1.THINGSPEAK_CHANNEL_ID, "/feeds.json?api_key=").concat(thingspeakConfig_1.THINGSPEAK_READ_API_KEY, "&results=1&t=").concat(timestamp), {
                            headers: {
                                'Cache-Control': 'no-cache, no-store, must-revalidate',
                                'Pragma': 'no-cache'
                            }
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("HTTP Error! Status: ".concat(response.status));
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    if (!data.feeds || data.feeds.length === 0) {
                        console.log("⚠️ [ThingSpeak] Nenhum dado encontrado no ThingSpeak.");
                        return [2 /*return*/];
                    }
                    latestFeed = data.feeds[0];
                    thingspeakPumpStatus = (0, thingspeakConfig_1.parseThingspeakBoolean)(latestFeed.field3);
                    thingspeakHeaterStatus = (0, thingspeakConfig_1.parseThingspeakBoolean)(latestFeed.field4);
                    if (thingspeakPumpStatus !== currentDeviceStatus.pumpStatus ||
                        thingspeakHeaterStatus !== currentDeviceStatus.heaterStatus) {
                        console.log("\u26A0\uFE0F [ThingSpeak] Discrep\u00E2ncia detectada: Mem\u00F3ria: Bomba=".concat(currentDeviceStatus.pumpStatus, ", Aquecedor=").concat(currentDeviceStatus.heaterStatus, " | ThingSpeak: Bomba=").concat(thingspeakPumpStatus, ", Aquecedor=").concat(thingspeakHeaterStatus));
                        // Atualizar o estado em memória para refletir os valores reais
                        currentDeviceStatus.pumpStatus = thingspeakPumpStatus;
                        currentDeviceStatus.heaterStatus = thingspeakHeaterStatus;
                        currentDeviceStatus.lastUpdate = new Date();
                        console.log("\u2705 [ThingSpeak] Estado em mem\u00F3ria atualizado para: Bomba=".concat(currentDeviceStatus.pumpStatus, ", Aquecedor=").concat(currentDeviceStatus.heaterStatus));
                    }
                    else {
                        console.log("✅ [ThingSpeak] Estado dos dispositivos está consistente.");
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error("❌ Erro ao verificar consistência:", error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Executar a verificação de consistência a cada 2 minutos
setInterval(ensureConsistentDeviceState, 2 * 60 * 1000);
// Executar uma verificação inicial após 10 segundos
setTimeout(ensureConsistentDeviceState, 10000);
/**
 * Retorna o estado atual dos dispositivos em memória (cópia para evitar modificação externa)
 *
 * IMPORTANTE: Este estado reflete a última ação solicitada pelo usuário e é mais recente
 * que o estado no banco ou no ThingSpeak. Use-o para feedback imediato na interface.
 */
function getCurrentDeviceStatus() {
    return {
        pumpStatus: currentDeviceStatus.pumpStatus,
        heaterStatus: currentDeviceStatus.heaterStatus,
        lastUpdate: new Date(currentDeviceStatus.lastUpdate.getTime())
    };
}
// Helper function to parse numbers safely
function parseNumber(value) {
    if (value === null || value === undefined)
        return 0;
    if (typeof value === 'string') {
        return parseFloat(value.replace(',', '.'));
    }
    return parseFloat(value) || 0;
}
/**
 * Fetches the latest reading from ThingSpeak
 */
function fetchLatestReading() {
    return __awaiter(this, arguments, void 0, function (retries) {
        var timeout, _loop_1, attempt, state_1;
        if (retries === void 0) { retries = 3; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    timeout = 2000;
                    _loop_1 = function (attempt) {
                        var startTime, controller_1, timeoutId, timestamp, response, text, feedsData, data, _i, _b, feed, readingTimestamp, pumpStatus, heaterStatus, reading, endTime, duration, error_2;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    _c.trys.push([0, 3, , 5]);
                                    startTime = Date.now();
                                    console.log("\uD83D\uDCE1 [ThingSpeak] Iniciando busca de dados (tentativa ".concat(attempt, "/").concat(retries, ")..."));
                                    controller_1 = new AbortController();
                                    timeoutId = setTimeout(function () { return controller_1.abort(); }, timeout);
                                    timestamp = new Date().getTime();
                                    return [4 /*yield*/, (0, node_fetch_1.default)("".concat(thingspeakConfig_1.THINGSPEAK_BASE_URL, "/channels/").concat(thingspeakConfig_1.THINGSPEAK_CHANNEL_ID, "/feeds.json?api_key=").concat(thingspeakConfig_1.THINGSPEAK_READ_API_KEY, "&results=1&t=").concat(timestamp), {
                                            signal: controller_1.signal,
                                            headers: {
                                                'Cache-Control': 'no-cache, no-store, must-revalidate',
                                                'Pragma': 'no-cache'
                                            }
                                        })];
                                case 1:
                                    response = _c.sent();
                                    clearTimeout(timeoutId);
                                    if (!response.ok) {
                                        throw new Error("[ThingSpeak] HTTP Error! Status: ".concat(response.status));
                                    }
                                    return [4 /*yield*/, response.text()];
                                case 2:
                                    text = _c.sent();
                                    console.log('📩 Raw ThingSpeak response:', text.substring(0, 200) + '...');
                                    feedsData = void 0;
                                    try {
                                        feedsData = JSON.parse(text);
                                    }
                                    catch (e) {
                                        console.error('❌ [ThingSpeak] Error parsing JSON:', e);
                                        throw new Error('[ThingSpeak] Invalid ThingSpeak response');
                                    }
                                    if (!feedsData || !feedsData.feeds || feedsData.feeds.length === 0) {
                                        console.warn('⚠️ [ThingSpeak] Nenhum dado recebido do ThingSpeak');
                                        return [2 /*return*/, { value: getDefaultReading() }];
                                    }
                                    data = null;
                                    // Primeiro tenta encontrar um registro com campo1 (temperatura) não nulo
                                    for (_i = 0, _b = feedsData.feeds; _i < _b.length; _i++) {
                                        feed = _b[_i];
                                        if (feed.field1 !== null && feed.field1 !== undefined) {
                                            data = feed;
                                            break;
                                        }
                                    }
                                    // Se não encontrou com temperatura, usa o último registro
                                    if (!data) {
                                        data = feedsData.feeds[feedsData.feeds.length - 1];
                                    }
                                    console.log('📊 [ThingSpeak] Dados originais recebidos:', data);
                                    readingTimestamp = data.created_at
                                        ? new Date(data.created_at)
                                        : new Date();
                                    pumpStatus = data.field3 !== undefined && data.field3 !== null
                                        ? (0, thingspeakConfig_1.parseThingspeakBoolean)(data.field3)
                                        : false;
                                    heaterStatus = data.field4 !== undefined && data.field4 !== null
                                        ? (0, thingspeakConfig_1.parseThingspeakBoolean)(data.field4)
                                        : false;
                                    reading = {
                                        temperature: (0, thingspeakConfig_1.parseThingspeakNumber)(data.field1),
                                        level: (0, thingspeakConfig_1.parseThingspeakNumber)(data.field2),
                                        pumpStatus: pumpStatus,
                                        heaterStatus: heaterStatus,
                                        timestamp: readingTimestamp // Usar o timestamp original do ThingSpeak ou o atual como fallback
                                    };
                                    endTime = Date.now();
                                    duration = endTime - startTime;
                                    console.log("\u2705 [ThingSpeak] Leitura formatada recebida em ".concat(duration, "ms"), reading);
                                    return [2 /*return*/, { value: reading }];
                                case 3:
                                    error_2 = _c.sent();
                                    console.error("\u274C [ThingSpeak] Tentativa ".concat(attempt, " falhou:"), error_2);
                                    if (attempt === retries) {
                                        console.error('⚠️ [ThingSpeak] Todas as tentativas falharam. Usando valores padrão.');
                                        return [2 /*return*/, { value: getDefaultReading() }];
                                    }
                                    // Wait before retrying (exponential backoff)
                                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000 * attempt); })];
                                case 4:
                                    // Wait before retrying (exponential backoff)
                                    _c.sent();
                                    return [3 /*break*/, 5];
                                case 5: return [2 /*return*/];
                            }
                        });
                    };
                    attempt = 1;
                    _a.label = 1;
                case 1:
                    if (!(attempt <= retries)) return [3 /*break*/, 4];
                    return [5 /*yield**/, _loop_1(attempt)];
                case 2:
                    state_1 = _a.sent();
                    if (typeof state_1 === "object")
                        return [2 /*return*/, state_1.value];
                    _a.label = 3;
                case 3:
                    attempt++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, getDefaultReading()];
            }
        });
    });
}
/**
 * Updates a single field on ThingSpeak
 * Similar to the updateField function in the reference code
 */
function updateField(field, value) {
    return __awaiter(this, void 0, void 0, function () {
        var startTime, timestamp, url, controller_2, timeoutId, response, updateResult, endTime, duration, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    startTime = Date.now();
                    timestamp = new Date().getTime();
                    url = new URL("".concat(thingspeakConfig_1.THINGSPEAK_BASE_URL, "/update"));
                    url.searchParams.append('api_key', thingspeakConfig_1.THINGSPEAK_WRITE_API_KEY);
                    url.searchParams.append(field, value.toString());
                    url.searchParams.append('t', timestamp.toString());
                    console.log("\u27A1\uFE0F [ThingSpeak] Enviando requisi\u00E7\u00E3o para ThingSpeak: ".concat(field, "=").concat(value));
                    controller_2 = new AbortController();
                    timeoutId = setTimeout(function () { return controller_2.abort(); }, 1500);
                    return [4 /*yield*/, (0, node_fetch_1.default)(url.toString(), {
                            method: 'POST',
                            headers: {
                                'Cache-Control': 'no-cache, no-store, must-revalidate',
                                'Pragma': 'no-cache'
                            },
                            signal: controller_2.signal
                        })];
                case 1:
                    response = _a.sent();
                    clearTimeout(timeoutId);
                    if (!response.ok) {
                        throw new Error("HTTP Error! Status: ".concat(response.status));
                    }
                    return [4 /*yield*/, response.text()];
                case 2:
                    updateResult = _a.sent();
                    endTime = Date.now();
                    duration = endTime - startTime;
                    console.log("\u2705 [ThingSpeak] Atualiza\u00E7\u00E3o do campo ".concat(field, " para ").concat(value, " em ").concat(duration, "ms | Resultado: ").concat(updateResult, " | Timestamp: ").concat(new Date().toISOString()));
                    return [2 /*return*/, updateResult !== '0'];
                case 3:
                    error_3 = _a.sent();
                    console.error("\u274C [ThingSpeak] Erro ao atualizar o campo ".concat(field, " no ThingSpeak:"), error_3);
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Updates pump status on ThingSpeak (field3)
 */
function updatePumpStatus(status) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Atualizar variável em memória com o status atual
                    console.log("\u27A1\uFE0F [ThingSpeak] Atualizando status da bomba para ".concat(status ? 'LIGADO' : 'DESLIGADO', "..."));
                    currentDeviceStatus.pumpStatus = status;
                    currentDeviceStatus.lastUpdate = new Date();
                    return [4 /*yield*/, updateField('field3', status ? '1' : '0')];
                case 1:
                    result = _a.sent();
                    console.log("\u2705 [ThingSpeak] Bomba atualizada para ".concat(status ? 'LIGADO' : 'DESLIGADO'), result ? 'com sucesso' : 'com falha');
                    return [2 /*return*/, updateField('field3', status ? '1' : '0')];
            }
        });
    });
}
/**
 * Updates heater status on ThingSpeak (field4)
 */
function updateHeaterStatus(status) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Atualizar variável em memória com o status atual
                    console.log("\u27A1\uFE0F [ThingSpeak] Atualizando status do aquecedor para ".concat(status ? 'LIGADO' : 'DESLIGADO', "..."));
                    currentDeviceStatus.heaterStatus = status;
                    currentDeviceStatus.lastUpdate = new Date();
                    return [4 /*yield*/, updateField('field4', status ? '1' : '0')];
                case 1:
                    result = _a.sent();
                    console.log("\u2705 [ThingSpeak] Aquecedor atualizado para ".concat(status ? 'LIGADO' : 'DESLIGADO'), result ? 'com sucesso' : 'com falha');
                    return [2 /*return*/, updateField('field4', status ? '1' : '0')];
            }
        });
    });
}
/**
 * Fetches historical readings from ThingSpeak
 * @param days Number of days to fetch (default: 7)
 */
function fetchHistoricalReadings() {
    return __awaiter(this, arguments, void 0, function (days) {
        var endDate, startDate, startDateStr, endDateStr, timestamp, url, controller_3, timeoutId, response, data, error_4;
        if (days === void 0) { days = 7; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    endDate = new Date();
                    startDate = new Date();
                    startDate.setDate(startDate.getDate() - days);
                    startDateStr = startDate.toISOString();
                    endDateStr = endDate.toISOString();
                    timestamp = new Date().getTime();
                    url = new URL("".concat(thingspeakConfig_1.THINGSPEAK_BASE_URL, "/channels/").concat(thingspeakConfig_1.THINGSPEAK_CHANNEL_ID, "/feeds.json"));
                    url.searchParams.append('api_key', thingspeakConfig_1.THINGSPEAK_READ_API_KEY);
                    url.searchParams.append('start', startDateStr);
                    url.searchParams.append('end', endDateStr);
                    url.searchParams.append('results', '8000'); // Maximum allowed
                    url.searchParams.append('t', timestamp.toString());
                    controller_3 = new AbortController();
                    timeoutId = setTimeout(function () { return controller_3.abort(); }, 10000);
                    console.log("\uD83D\uDCE1 [ThingSpeak] Iniciando busca de dados hist\u00F3ricos (timeout de 10s) | ".concat(days, " dias de dados..."));
                    return [4 /*yield*/, (0, node_fetch_1.default)(url.toString(), {
                            headers: {
                                'Cache-Control': 'no-cache, no-store, must-revalidate',
                                'Pragma': 'no-cache'
                            },
                            signal: controller_3.signal
                        })];
                case 1:
                    response = _a.sent();
                    clearTimeout(timeoutId);
                    if (!response.ok) {
                        throw new Error("HTTP Error! Status: ".concat(response.status));
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    if (!data.feeds || data.feeds.length === 0) {
                        console.warn('⚠️ [ThingSpeak] Nenhum dado recebido do ThingSpeak para o período especificado');
                        return [2 /*return*/, []];
                    }
                    else {
                        console.log("\u2705 [ThingSpeak] Busca de dados conclu\u00EDda, ".concat(data.feeds.length, " registros recebidos"));
                    }
                    // Para dados históricos, mantemos os timestamps originais
                    return [2 /*return*/, data.feeds.map(function (feed) {
                            // Verificação explícita e tratamento de campos para garantir consistência nos dados
                            var pumpStatus = feed.field3 !== undefined && feed.field3 !== null
                                ? (0, thingspeakConfig_1.parseThingspeakBoolean)(feed.field3)
                                : false;
                            var heaterStatus = feed.field4 !== undefined && feed.field4 !== null
                                ? (0, thingspeakConfig_1.parseThingspeakBoolean)(feed.field4)
                                : false;
                            return {
                                temperature: (0, thingspeakConfig_1.parseThingspeakNumber)(feed.field1),
                                level: (0, thingspeakConfig_1.parseThingspeakNumber)(feed.field2),
                                pumpStatus: pumpStatus,
                                heaterStatus: heaterStatus,
                                timestamp: feed.created_at ? new Date(feed.created_at) : new Date()
                            };
                        })];
                case 3:
                    error_4 = _a.sent();
                    console.error('❌ [ThingSpeak] Error fetching historical data from ThingSpeak:', error_4);
                    return [2 /*return*/, []];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get default reading when ThingSpeak fails
 */
function getDefaultReading() {
    return __assign(__assign({}, thingspeakConfig_1.DEFAULT_READING), { timestamp: new Date() });
}
