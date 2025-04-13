// ThingSpeak Service for fetching and updating data
import fetch from 'node-fetch';
import { InsertReading } from '@shared/schema';
import { 
  THINGSPEAK_BASE_URL,
  THINGSPEAK_CHANNEL_ID, 
  THINGSPEAK_READ_API_KEY,
  THINGSPEAK_WRITE_API_KEY,
  DEFAULT_READING,
  parseThingspeakNumber,
  parseThingspeakBoolean,
  ThingspeakResponse,
  ThingspeakFeedsResponse
} from './thingspeakConfig';

// Set the refresh interval (in milliseconds)
// Atualizado para 5 minutos (300,000ms) para reduzir carga no backend e otimizar gravações no banco
export const REFRESH_INTERVAL = parseInt(process.env.REFRESH_INTERVAL || '300000');

/**
 * Variável para manter o estado mais recente dos dispositivos em memória
 * Esse estado é SEMPRE mais atual que o banco de dados, pois reflete a última ação do usuário
 * mesmo antes da confirmação do ThingSpeak, que pode levar até 30 segundos.
 * 
 * Este estado é usado para fornecer feedback imediato na interface enquanto aguardamos
 * a confirmação do ThingSpeak.
 */
let currentDeviceStatus = {
  pumpStatus: false,
  heaterStatus: false,
  lastUpdate: new Date()
};

export type DeviceStatus = {
  pumpStatus: boolean;
  heaterStatus: boolean;
  lastUpdate: Date;
};

/**
 * Função para garantir consistência dos valores no ThingSpeak
 * Esta função é chamada periodicamente para sincronizar o estado dos dispositivos
 */
async function ensureConsistentDeviceState() {
  try {
    console.log("🔄 [ThingSpeak] Verificando consistência dos valores no ThingSpeak...");
    const timestamp = new Date().getTime();
    
    const response = await fetch(
      `${THINGSPEAK_BASE_URL}/channels/${THINGSPEAK_CHANNEL_ID}/feeds.json?api_key=${THINGSPEAK_READ_API_KEY}&results=1&t=${timestamp}`,
      { 
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }
    
    const data = await response.json() as ThingspeakFeedsResponse;
    
    if (!data.feeds || data.feeds.length === 0) {
      console.log("⚠️ [ThingSpeak] Nenhum dado encontrado no ThingSpeak.");
      return;
    }
    
    const latestFeed = data.feeds[0];
    
    // Verificar se há discrepância entre o valor em memória e o valor do ThingSpeak
    const thingspeakPumpStatus = parseThingspeakBoolean(latestFeed.field3);
    const thingspeakHeaterStatus = parseThingspeakBoolean(latestFeed.field4);
    
    if (thingspeakPumpStatus !== currentDeviceStatus.pumpStatus || 
      thingspeakHeaterStatus !== currentDeviceStatus.heaterStatus) {
      console.log(`⚠️ [ThingSpeak] Discrepância detectada: Memória: Bomba=${currentDeviceStatus.pumpStatus}, Aquecedor=${currentDeviceStatus.heaterStatus} | ThingSpeak: Bomba=${thingspeakPumpStatus}, Aquecedor=${thingspeakHeaterStatus}`);
      
      // Atualizar o estado em memória para refletir os valores reais
      currentDeviceStatus.pumpStatus = thingspeakPumpStatus;
      currentDeviceStatus.heaterStatus = thingspeakHeaterStatus;
      currentDeviceStatus.lastUpdate = new Date();
      
      console.log(`✅ [ThingSpeak] Estado em memória atualizado para: Bomba=${currentDeviceStatus.pumpStatus}, Aquecedor=${currentDeviceStatus.heaterStatus}`);
    } else {
      console.log("✅ [ThingSpeak] Estado dos dispositivos está consistente.");
    }
    
  } catch (error) {
    console.error("❌ Erro ao verificar consistência:", error);
  }
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
export function getCurrentDeviceStatus(): DeviceStatus {
  return { 
    pumpStatus: currentDeviceStatus.pumpStatus,
    heaterStatus: currentDeviceStatus.heaterStatus,
    lastUpdate: new Date(currentDeviceStatus.lastUpdate.getTime())
  } as DeviceStatus;
}

// Helper function to parse numbers safely
function parseNumber(value: any): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'string') {
    return parseFloat(value.replace(',', '.'));
  }
  return parseFloat(value) || 0;
}

/**
 * Fetches the latest reading from ThingSpeak
 */
export async function fetchLatestReading(retries = 3): Promise<InsertReading | null> {
  const timeout = 2000; // 2 seconds timeout para resposta mais rápida
  
  // Primeiro tenta buscar o último dado
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const startTime = Date.now(); // Start time for measuring total fetch time
      console.log(`📡 [ThingSpeak] Iniciando busca de dados (tentativa ${attempt}/${retries})...`);
      
      const controller = new AbortController();
      
      // Define um timeout para a requisição
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      // Busca os dados mais recentes com o parâmetro results=1 para melhor desempenho
      // Adiciona timestamp para evitar cache do navegador/proxy
      const timestamp = new Date().getTime();
      const response = await fetch(
        `${THINGSPEAK_BASE_URL}/channels/${THINGSPEAK_CHANNEL_ID}/feeds.json?api_key=${THINGSPEAK_READ_API_KEY}&results=1&t=${timestamp}`,
        { 
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`[ThingSpeak] HTTP Error! Status: ${response.status}`);
      }
      
      const text = await response.text();
      console.log('📩 Raw ThingSpeak response:', text.substring(0, 200) + '...');
      
      let feedsData: ThingspeakFeedsResponse;
      try {
        feedsData = JSON.parse(text);
      } catch (e) {
        console.error('❌ [ThingSpeak] Error parsing JSON:', e);
        throw new Error('[ThingSpeak] Invalid ThingSpeak response');
      }
      
      if (!feedsData || !feedsData.feeds || feedsData.feeds.length === 0) {
        console.warn('⚠️ [ThingSpeak] Nenhum dado recebido do ThingSpeak');
        return getDefaultReading(); // Retorna leitura padrão
      }
      
      // Buscar o dado mais recente que tenha temperatura ou nível não nulo
      let data: ThingspeakResponse | null = null;
      
      // Primeiro tenta encontrar um registro com campo1 (temperatura) não nulo
      for (const feed of feedsData.feeds) {
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

      // Usar o timestamp do ThingSpeak, se disponível, ou a data atual como fallback
      const readingTimestamp = data.created_at
        ? new Date(data.created_at)
        : new Date();
      
        
      // Criar leitura com valores do ThingSpeak, mas sempre com um timestamp atual
      // para garantir dados que pareçam estar em tempo real
      
      // Verificação explícita se os valores estão presentes antes de processá-los
      // Isso garante consistência no estado dos dispositivos
      const pumpStatus = data.field3 !== undefined && data.field3 !== null 
        ? parseThingspeakBoolean(data.field3) 
        : false;
        
      const heaterStatus = data.field4 !== undefined && data.field4 !== null 
        ? parseThingspeakBoolean(data.field4) 
        : false;
      
      const reading: InsertReading = {
        temperature: parseThingspeakNumber(data.field1),
        level: parseThingspeakNumber(data.field2),
        pumpStatus: pumpStatus,
        heaterStatus: heaterStatus,
        timestamp: readingTimestamp // Usar o timestamp original do ThingSpeak ou o atual como fallback
      };
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      console.log(`✅ [ThingSpeak] Leitura formatada recebida em ${duration}ms`, reading);
      return reading;
      
    } catch (error) {
      console.error(`❌ [ThingSpeak] Tentativa ${attempt} falhou:`, error);
      if (attempt === retries) {
        console.error('⚠️ [ThingSpeak] Todas as tentativas falharam. Usando valores padrão.');
        return getDefaultReading();// Retorna leitura padrão
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  
  return getDefaultReading();
}

/**
 * Updates a single field on ThingSpeak
 * Similar to the updateField function in the reference code
 */
export async function updateField(field: string, value: string | number): Promise<boolean> {
  try {
    const startTime = Date.now();
    // Adicionar timestamp para evitar cache
    const timestamp = new Date().getTime();
    
    const url = new URL(`${THINGSPEAK_BASE_URL}/update`);
    url.searchParams.append('api_key', THINGSPEAK_WRITE_API_KEY);
    url.searchParams.append(field, value.toString());
    url.searchParams.append('t', timestamp.toString());
    
    console.log(`➡️ [ThingSpeak] Enviando requisição para ThingSpeak: ${field}=${value}`);
    
    // Usar um timeout mais curto para atualizações
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }
    
    const updateResult = await response.text();
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`✅ [ThingSpeak] Atualização do campo ${field} para ${value} em ${duration}ms | Resultado: ${updateResult} | Timestamp: ${new Date().toISOString()}`);
    return updateResult !== '0';
    
  } catch (error) {
    console.error(`❌ [ThingSpeak] Erro ao atualizar o campo ${field} no ThingSpeak:`, error);
    
    return false;
  }
}

/**
 * Updates pump status on ThingSpeak (field3)
 */
export async function updatePumpStatus(status: boolean): Promise<boolean> {
  // Atualizar variável em memória com o status atual
  console.log(`➡️ [ThingSpeak] Atualizando status da bomba para ${status ? 'LIGADO' : 'DESLIGADO'}...`);
  currentDeviceStatus.pumpStatus = status;
  currentDeviceStatus.lastUpdate = new Date();
  
  const result = await updateField('field3', status ? '1' : '0');
  console.log(`✅ [ThingSpeak] Bomba atualizada para ${status ? 'LIGADO' : 'DESLIGADO'}`, result ? 'com sucesso' : 'com falha')
  return updateField('field3', status ? '1' : '0');
}

/**
 * Updates heater status on ThingSpeak (field4)
 */
export async function updateHeaterStatus(status: boolean): Promise<boolean> {
  // Atualizar variável em memória com o status atual
  console.log(`➡️ [ThingSpeak] Atualizando status do aquecedor para ${status ? 'LIGADO' : 'DESLIGADO'}...`);
  currentDeviceStatus.heaterStatus = status;
  currentDeviceStatus.lastUpdate = new Date();
  
  const result = await updateField('field4', status ? '1' : '0');
  console.log(`✅ [ThingSpeak] Aquecedor atualizado para ${status ? 'LIGADO' : 'DESLIGADO'}`, result ? 'com sucesso' : 'com falha')
  return updateField('field4', status ? '1' : '0');
}

/**
 * Fetches historical readings from ThingSpeak
 * @param days Number of days to fetch (default: 7)
 */
export async function fetchHistoricalReadings(days = 7): Promise<InsertReading[]> {
  try {
    // Calcular período de datas
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const startDateStr = startDate.toISOString();
    const endDateStr = endDate.toISOString();
    
    // Adicionar timestamp para evitar cache
    const timestamp = new Date().getTime();
    
    const url = new URL(`${THINGSPEAK_BASE_URL}/channels/${THINGSPEAK_CHANNEL_ID}/feeds.json`);
    url.searchParams.append('api_key', THINGSPEAK_READ_API_KEY);
    url.searchParams.append('start', startDateStr);
    url.searchParams.append('end', endDateStr);
    url.searchParams.append('results', '8000'); // Maximum allowed
    url.searchParams.append('t', timestamp.toString());
    
    // Usar timeout mais longo para dados históricos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos
    
    console.log(`📡 [ThingSpeak] Iniciando busca de dados históricos (timeout de 10s) | ${days} dias de dados...`);
    
    const response = await fetch(url.toString(), {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }  
    const data = await response.json() as ThingspeakFeedsResponse;    
    if (!data.feeds || data.feeds.length === 0) {
      console.warn('⚠️ [ThingSpeak] Nenhum dado recebido do ThingSpeak para o período especificado');
      return [];
    }else{
      console.log(`✅ [ThingSpeak] Busca de dados concluída, ${data.feeds.length} registros recebidos`);
      
    }
    
    // Para dados históricos, mantemos os timestamps originais
    return data.feeds.map(feed => {
      // Verificação explícita e tratamento de campos para garantir consistência nos dados
      const pumpStatus = feed.field3 !== undefined && feed.field3 !== null 
        ? parseThingspeakBoolean(feed.field3) 
        : false;
        
      const heaterStatus = feed.field4 !== undefined && feed.field4 !== null 
        ? parseThingspeakBoolean(feed.field4) 
        : false;
        
      return {
        temperature: parseThingspeakNumber(feed.field1),
        level: parseThingspeakNumber(feed.field2),
        pumpStatus: pumpStatus,
        heaterStatus: heaterStatus,
        timestamp: feed.created_at ? new Date(feed.created_at) : new Date()
      };
    });
    
  } catch (error) {
    console.error('❌ [ThingSpeak] Error fetching historical data from ThingSpeak:', error);
    return [];
  }
}

/**
 * Get default reading when ThingSpeak fails
 */
function getDefaultReading(): InsertReading {
  return {
    ...DEFAULT_READING,
    timestamp: new Date()
  };
}