import { InsertReading, Reading } from '@shared/schema';
import { storage } from '../storage';

export const ReadingService = {
  async checkDuplicateAndSave(reading: InsertReading): Promise<Reading> {
    const timestamp = reading.timestamp || new Date();
    const timestampMs = timestamp.getTime();
    const minTime = new Date(timestampMs - 5000); // 5 segundos antes
    const maxTime = new Date(timestampMs + 5000); // 5 segundos depois

    // Código para verificar duplicidade (movido do SqliteStorage)
    const existingReading = await storage.getReadingsByDateRange(minTime.toISOString(), maxTime.toISOString(), 10)
      .then(readings => 
        readings.find(r =>
          Math.abs(r.timestamp.getTime() - timestampMs) <= 5000 &&
          r.pumpStatus === reading.pumpStatus &&
          r.heaterStatus === reading.heaterStatus &&
          Math.abs(r.temperature - reading.temperature) < 0.1 &&
          Math.abs(r.level - reading.level) < 0.1
        )
      );

    if (existingReading) {
      console.log(`⚠️ [${new Date().toLocaleTimeString()}] Detectada leitura similar recente (ID: ${existingReading.id}), evitando duplicação`);
      return existingReading;
    }

    return storage.saveReading(reading);
  },
};