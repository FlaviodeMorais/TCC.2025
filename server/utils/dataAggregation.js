"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aggregateByMinute = aggregateByMinute;
exports.aggregateByHour = aggregateByHour;
exports.aggregateByWeek = aggregateByWeek;
exports.aggregateReadingsByDateRange = aggregateReadingsByDateRange;
// Constante para o valor de erro do sensor (deve corresponder ao mesmo valor usado no cliente)
var SENSOR_ERROR_VALUE = -127;
/**
 * Agrupa leituras por minuto e calcula médias
 * @param readings Array de leituras a serem agrupadas
 */
function aggregateByMinute(readings) {
    if (!readings || readings.length === 0)
        return [];
    var minuteGroups = {};
    // Agrupar por minuto
    readings.forEach(function (reading) {
        var date = new Date(reading.timestamp);
        var minuteKey = "".concat(date.getFullYear(), "-").concat(date.getMonth(), "-").concat(date.getDate(), "-").concat(date.getHours(), "-").concat(date.getMinutes());
        if (!minuteGroups[minuteKey]) {
            minuteGroups[minuteKey] = {
                temperature: 0,
                temperatureCount: 0,
                level: 0,
                levelCount: 0,
                pumpStatus: false,
                heaterStatus: false,
                timestamp: new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes()),
                count: 0
            };
        }
        // Acumular valores - ignorar valores de erro do sensor
        var temp = reading.temperature || 0;
        if (temp !== SENSOR_ERROR_VALUE && temp !== -127 && temp > -100) {
            minuteGroups[minuteKey].temperature += temp;
            minuteGroups[minuteKey].temperatureCount++;
        }
        var level = reading.level || 0;
        minuteGroups[minuteKey].level += level;
        minuteGroups[minuteKey].levelCount++;
        // Para valores booleanos, consideramos o estado mais frequente
        if (reading.pumpStatus) {
            minuteGroups[minuteKey].pumpStatus = true;
        }
        if (reading.heaterStatus) {
            minuteGroups[minuteKey].heaterStatus = true;
        }
        minuteGroups[minuteKey].count++;
    });
    // Converter grupos em leituras com médias
    var aggregatedReadings = Object.values(minuteGroups)
        .map(function (group) { return ({
        id: 0, // Será ignorado na exibição
        temperature: group.temperatureCount > 0 ? group.temperature / group.temperatureCount : 0,
        level: group.levelCount > 0 ? group.level / group.levelCount : 0,
        pumpStatus: group.pumpStatus,
        heaterStatus: group.heaterStatus,
        timestamp: group.timestamp
    }); })
        .sort(function (a, b) { return a.timestamp.getTime() - b.timestamp.getTime(); });
    console.log("Agregados ".concat(readings.length, " registros em ").concat(aggregatedReadings.length, " m\u00E9dias por minuto"));
    return aggregatedReadings;
}
/**
 * Agrupa leituras por hora e calcula médias
 * @param readings Array de leituras a serem agrupadas
 */
function aggregateByHour(readings) {
    if (!readings || readings.length === 0)
        return [];
    var hourlyGroups = {};
    // Agrupar por hora
    readings.forEach(function (reading) {
        var date = new Date(reading.timestamp);
        var hourKey = "".concat(date.getFullYear(), "-").concat(date.getMonth(), "-").concat(date.getDate(), "-").concat(date.getHours());
        if (!hourlyGroups[hourKey]) {
            hourlyGroups[hourKey] = {
                temperature: 0,
                temperatureCount: 0,
                level: 0,
                levelCount: 0,
                pumpStatus: false,
                heaterStatus: false,
                timestamp: new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()),
                count: 0
            };
        }
        // Acumular valores - ignorar valores de erro do sensor
        var temp = reading.temperature || 0;
        if (temp !== SENSOR_ERROR_VALUE && temp !== -127 && temp > -100) {
            hourlyGroups[hourKey].temperature += temp;
            hourlyGroups[hourKey].temperatureCount++;
        }
        var level = reading.level || 0;
        hourlyGroups[hourKey].level += level;
        hourlyGroups[hourKey].levelCount++;
        // Para valores booleanos, consideramos o estado mais frequente
        if (reading.pumpStatus) {
            hourlyGroups[hourKey].pumpStatus = true;
        }
        if (reading.heaterStatus) {
            hourlyGroups[hourKey].heaterStatus = true;
        }
        hourlyGroups[hourKey].count++;
    });
    // Converter grupos em leituras com médias
    var aggregatedReadings = Object.values(hourlyGroups)
        .map(function (group) { return ({
        id: 0, // Será ignorado na exibição
        temperature: group.temperatureCount > 0 ? group.temperature / group.temperatureCount : 0,
        level: group.levelCount > 0 ? group.level / group.levelCount : 0,
        pumpStatus: group.pumpStatus,
        heaterStatus: group.heaterStatus,
        timestamp: group.timestamp
    }); })
        .sort(function (a, b) { return a.timestamp.getTime() - b.timestamp.getTime(); });
    console.log("Agregados ".concat(readings.length, " registros em ").concat(aggregatedReadings.length, " m\u00E9dias hor\u00E1rias"));
    return aggregatedReadings;
}
/**
 * Agrupa leituras por semana e calcula médias
 * @param readings Array de leituras a serem agrupadas
 */
function aggregateByWeek(readings) {
    if (!readings || readings.length === 0)
        return [];
    var weeklyGroups = {};
    // Agrupar por semana
    readings.forEach(function (reading) {
        var date = new Date(reading.timestamp);
        // Obter o início da semana (domingo)
        var startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        var weekKey = "".concat(startOfWeek.getFullYear(), "-").concat(startOfWeek.getMonth(), "-").concat(startOfWeek.getDate());
        if (!weeklyGroups[weekKey]) {
            weeklyGroups[weekKey] = {
                temperature: 0,
                temperatureCount: 0,
                level: 0,
                levelCount: 0,
                pumpStatus: false,
                heaterStatus: false,
                timestamp: new Date(startOfWeek),
                count: 0
            };
        }
        // Acumular valores - ignorar valores de erro do sensor
        var temp = reading.temperature || 0;
        if (temp !== SENSOR_ERROR_VALUE && temp !== -127 && temp > -100) {
            weeklyGroups[weekKey].temperature += temp;
            weeklyGroups[weekKey].temperatureCount++;
        }
        var level = reading.level || 0;
        weeklyGroups[weekKey].level += level;
        weeklyGroups[weekKey].levelCount++;
        // Para valores booleanos, consideramos o estado mais frequente
        if (reading.pumpStatus) {
            weeklyGroups[weekKey].pumpStatus = true;
        }
        if (reading.heaterStatus) {
            weeklyGroups[weekKey].heaterStatus = true;
        }
        weeklyGroups[weekKey].count++;
    });
    // Converter grupos em leituras com médias
    var aggregatedReadings = Object.values(weeklyGroups)
        .map(function (group) { return ({
        id: 0, // Será ignorado na exibição
        temperature: group.temperatureCount > 0 ? group.temperature / group.temperatureCount : 0,
        level: group.levelCount > 0 ? group.level / group.levelCount : 0,
        pumpStatus: group.pumpStatus,
        heaterStatus: group.heaterStatus,
        timestamp: group.timestamp
    }); })
        .sort(function (a, b) { return a.timestamp.getTime() - b.timestamp.getTime(); });
    console.log("Agregados ".concat(readings.length, " registros em ").concat(aggregatedReadings.length, " m\u00E9dias semanais"));
    return aggregatedReadings;
}
/**
 * Agrega leituras com base no período especificado
 * @param readings Array de leituras
 * @param startDate Data de início do período
 * @param endDate Data de fim do período
 */
function aggregateReadingsByDateRange(readings, startDate, endDate) {
    if (!readings || readings.length === 0)
        return [];
    // Calcular a diferença em dias
    var diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    var diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    console.log("Per\u00EDodo de consulta: ".concat(diffDays, " dias (").concat(diffHours, " horas)"));
    // Aplicar a estratégia de agregação com base no período
    if (diffDays <= 1) {
        // Exatamente 24 horas: media por minuto
        return aggregateByMinute(readings);
    }
    else if (diffDays < 7) {
        // Para períodos curtos (1-7 dias): média por hora
        return aggregateByHour(readings);
    }
    else {
        // Para períodos longos (7+ dias): média por semana
        return aggregateByWeek(readings);
    }
}
