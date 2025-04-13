import type { Express } from "express";
import { createServer, type Server } from "http";
import cron from "node-cron";
import { zodResolver } from '@hookform/resolvers/zod';
import { log } from "./vite";
import {
  fetchLatestReading,
  updatePumpStatus,
  updateHeaterStatus,
  fetchHistoricalReadings,
  getCurrentDeviceStatus,
} from "./services/thingspeakService";
import { backupService } from "./services/backupService";
import { insertSetpointSchema, insertSettingsSchema } from "@shared/schema";
import { z } from "zod";
import { readingsService } from "./index";
import { syncService } from "./index";
import { storage } from "./storage";

const REFRESH_INTERVAL = 300000;

const logRequest = (req: any, res: any, next: any) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json as typeof res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
    if (capturedJsonResponse) {
      logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
    }
    log(logLine);
  });
  next();
};

import { aggregateReadingsByDateRange } from "./utils/dataAggregation";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Schedule data collection using the configured REFRESH_INTERVAL (5 minutes)
  // Calcular o intervalo em segundos para o cron a partir do REFRESH_INTERVAL em ms
  const intervalInSeconds = Math.max(Math.floor(REFRESH_INTERVAL / 1000), 2);
  console.log(`Configurando coleta de dados a cada ${intervalInSeconds} segundos (${REFRESH_INTERVAL}ms)`);
  
  cron.schedule(`*/${intervalInSeconds} * * * * *`, async () => {
    try {
      console.log('Starting scheduled data collection...');
      const reading = await fetchLatestReading();
      if (reading) {
        
        console.log(`✅ Confirmação de atualização recebida do Thingspeak`);
        await storage.saveReading(reading);
        console.log('Data collection cycle completed successfully');
      } else {
        console.log('No data collected in this cycle');
      }
    } catch (error) {
      console.error('Error in data collection cycle:', error);
    }
  });

  // Agenda sincronização do backup a cada 30 minutos
  cron.schedule('*/30 * * * *', async () => {
    try {
      console.log('🔄 Starting scheduled backup sync...');
      await backupService.syncData();
      console.log('✅ Scheduled backup completed');
    } catch (error) {
      console.error('❌ Error in scheduled backup:', error);
    }
  });

  // Inicializar o serviço de backup
  try {
    await backupService.initialize();
    console.log('✅ Backup service initialized');
  } catch (error) {
    console.error('❌ Error initializing backup service:', error);
  }

  // API Routes
  
  // Get latest readings
  app.get('/api/readings/latest', logRequest, async (req, res) => {
    console.log(`→ GET /api/readings/latest - Request received`);
    try {
      
      const limit = parseInt(req.query.limit as string) || 60;
      const readings = await storage.getLatestReadings(limit);
      const setpoints = await readingsService.getSetpoints();
      const stats = readingsService.calculateStatistics(readings);
      res.json({
        readings,
        setpoints,
      });
    } catch (error) {
      console.error(`❌ GET /api/readings/latest - Error:`, error);
      res.status(500).json({ error: 'ERR_READINGS_LATEST: Failed to fetch latest readings' });
    }
  });
  
  // Endpoint específico para verificar o status atual dos dispositivos
  app.get('/api/device/status', logRequest, async (req, res) => {
    console.log(`→ GET /api/device/status - Request received`);
    try {
      const latestReadings = await storage.getLatestReadings(1);
      if (!latestReadings || latestReadings.length === 0) {
        return res.status(404).json({ error: 'No device status data available' });
      }

      const latest = latestReadings[0];
      res.json({
        timestamp: latest.timestamp,
        pumpStatus: latest.pumpStatus,
        heaterStatus: latest.heaterStatus,
      });
    } catch (error) {
      console.error(`❌ GET /api/device/status - Error:`, error);
      res.status(500).json({ error: 'ERR_DEVICE_STATUS: Failed to fetch device status' });
    }
  }); 

  // Get readings by date range from local database
  app.get('/api/readings/history', logRequest, async (req, res) => {
    console.log(`→ GET /api/readings/history - Request received`);
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start and end dates are required' });
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      const readings = await readingsService.getHistoricalReadings('local', { startDate, endDate });

      if (readings.length === 0) return res.status(404).json({ error: 'No data found for the selected period', message: 'Não há dados disponíveis para o período selecionado. Por favor, tente outro período.' });


      const aggregatedReadings = aggregateReadingsByDateRange(readings, start, end);
      const setpoints = await readingsService.getSetpoints();
      const stats = readingsService.calculateStatistics(aggregatedReadings);

      res.json({
        readings: aggregatedReadings, // Enviamos os dados agregados
        setpoints,
        stats
      });
    } catch (error) {
      console.error(`❌ GET /api/readings/history - Error:`, error);
      res.status(500).json({ error: 'ERR_READINGS_HISTORY: Failed to fetch readings history' });
    }
  });
  
  // Update setpoints
  app.post('/api/setpoints', logRequest, async (req, res) => {
    console.log(`→ POST /api/setpoints - Request received`);
    try {
      const result = insertSetpointSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ error: 'Invalid setpoint data', details: result.error });
      }
      
      const updatedSetpoints = await storage.updateSetpoints(result.data);
      res.json(updatedSetpoints);
    } catch (error) {
      console.error(`❌ POST /api/setpoints - Error:`, error);
      res.status(500).json({ error: 'ERR_UPDATE_SETPOINTS: Failed to update setpoints' });
    }
  });

  // Get settings
  app.get('/api/settings', logRequest, async (req, res) => {
    console.log(`→ GET /api/settings - Request received`);
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      console.error(`❌ GET /api/settings - Error:`, error);
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  });

  // Update settings
  app.post('/api/settings', async (req, res) => {
    try {
      const result = insertSettingsSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ error: 'Invalid settings data', details: result.error });
      }
      
      const updatedSettings = await storage.updateSettings(result.data);
      res.json(updatedSettings);
    } catch (error) {
      console.error(`❌ POST /api/settings - Error:`, error);
      res.status(500).json({ error: 'ERR_UPDATE_SETTINGS: Failed to update settings' });
    }
  });

  // Control pump - otimizado para resposta rápida sem persistência de histórico
  app.post('/api/control/pump', logRequest, async (req, res) => {
    console.log(`→ POST /api/control/pump - Request received`);
    try {
      const schema = z.object({
        status: z.boolean()
      });
      
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ error: 'Invalid pump control data' });
      }
      
      res.json({ success: true, pumpStatus: result.data.status, pending: true });

      // Processar atualização em segundo plano sem bloquear a resposta
      try {

        // Update ThingSpeak - usando o método individual da bomba
        const updateResult = await updatePumpStatus(result.data.status);
        
        if (updateResult) {
          console.log('✅ Bomba atualizada com sucesso no ThingSpeak:', result.data.status ? 'LIGADA' : 'DESLIGADA');
        } else {
          console.log('⚠️ Bomba enviada para ThingSpeak, aguardando confirmação:', result.data.status ? 'LIGADA' : 'DESLIGADA');
        }
      } catch (bgError) {
        console.error('❌ Erro em segundo plano ao atualizar bomba:', bgError);
      }
    } catch (error) {
      console.error(`❌ POST /api/control/pump - Error:`, error);
      res.status(500).json({ error: 'ERR_CONTROL_PUMP: Failed to control pump' });
    }
  });

  // Control heater - otimizado para resposta rápida sem persistência de histórico
  app.post('/api/control/heater', logRequest, async (req, res) => {
    console.log(`→ POST /api/control/heater - Request received`);
    try {
      const schema = z.object({
        status: z.boolean()
      });
      
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ error: 'Invalid heater control data' });
      }
      
      res.json({ success: true, heaterStatus: result.data.status, pending: true });
      
      // Processar atualização em segundo plano sem bloquear a resposta
      try {
        // Update ThingSpeak - usando o método individual do aquecedor
        const updateResult = await updateHeaterStatus(result.data.status);
        
        if (updateResult) {
          console.log('✅ Aquecedor atualizado com sucesso no ThingSpeak:', result.data.status ? 'LIGADO' : 'DESLIGADO');
        } else {
          console.log('⚠️ Aquecedor enviado para ThingSpeak, aguardando confirmação:', result.data.status ? 'LIGADO' : 'DESLIGADO');
        }
      } catch (bgError) {
        console.error('❌ Erro em segundo plano ao atualizar aquecedor:', bgError);
      }
    } catch (error) {
      console.error(`❌ POST /api/control/heater - Error:`, error);
      res.status(500).json({ error: 'ERR_CONTROL_HEATER: Failed to control heater' });
    }
  });

  // Rota para sincronização manual do backup
  app.post('/api/backup/sync', logRequest, async (req, res) => {
    console.log(`→ POST /api/backup/sync - Request received`);
    try {
      console.log('🔄 Manual backup sync requested');
      await backupService.syncData();
      res.json({ success: true, message: 'Sincronização realizada com sucesso' });
    } catch (error) {
      console.error('Error during manual backup sync:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Falha na sincronização do backup',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  // Rota para obter informações sobre o backup
  app.get('/api/backup/status', logRequest, async (req, res) => {
    console.log(`→ GET /api/backup/status - Request received`);
    try {
      // Inicializar o serviço de backup se necessário
      if (!backupService.isInitialized) {
        await backupService.initialize();
      }
      
      // Obter o último ID sincronizado
      const lastBackupInfo = await backupService.getLastBackupInfo();
      
      res.json({ 
        success: true,
        status: 'online',
        message: 'Serviço de backup operacional',
        lastSyncId: lastBackupInfo.lastId,
        lastSyncDate: lastBackupInfo.lastDate,
        totalBackupRecords: lastBackupInfo.totalRecords
      });
    } catch (error) {
      console.error(`❌ GET /api/backup/status - Error:`, error);
      res.status(500).json({ 
        success: false, 
        status: 'offline',
        error: 'Falha ao verificar status do backup',
        details: error instanceof Error ? error.message : 'Erro desconhecido' 
      });
    }
  });
  
  // Rota para obter estatísticas do backup
  app.get('/api/backup/stats', logRequest, async (req, res) => {
    console.log(`→ GET /api/backup/stats - Request received`);
    try {
      if (!backupService.isInitialized) {
        await backupService.initialize();
      }
      
      const stats = await backupService.getBackupStats();
      res.json({ 
        success: true,
        stats
      });
    } catch (error) {
      console.error(`❌ GET /api/backup/stats - Error:`, error);
      res.status(500).json({ 
        success: false, 
        error: 'Falha ao obter estatísticas do backup',
        details: error instanceof Error ? error.message : 'Erro desconhecido' 
      });
    }
  });

  // Rota para importar dados históricos do ThingSpeak para o banco de dados local
  app.post('/api/readings/import-from-thingspeak', logRequest, async (req, res) => { // Renomeando a rota
    console.log(`→ POST /api/readings/import-from-thingspeak - Request received`);
    try {
      const days = parseInt(req.query.days as string) || 7;
      if (isNaN(days) || days <= 0) {
        return res.status(400).json({ error: 'Invalid number of days' });
      }

      await syncService.importFromThingSpeak(days); // Chamando o serviço
      res.json({
        success: true,
        message: `Importação de ${days} dias de dados iniciada em background.`,
        
        count: 0,
        background: true
      });
    } catch (error) {
      console.error(`❌ POST /api/readings/import-from-thingspeak - Error:`, error);
      res.status(500).json({
        success: false,
        error: 'Falha ao importar dados do ThingSpeak',
      });
    }
  });

  return httpServer;
}

