dwareimport sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import { Reading } from '@shared/schema';

// Caminho correto para os arquivos de banco de dados
const MAIN_DB_PATH = path.resolve(process.cwd(), 'aquaponia.db');
const BACKUP_DB_PATH = path.resolve(process.cwd(), 'aquaponia_backup.db');

// Interfaces para uso do serviço
interface LastBackupInfo {
  lastId: number;
  lastDate: string;
  totalRecords: number;
}


interface BackupStats {
  dailyStats: {
    date: string;
    minTemperature: number;
    maxTemperature: number;
    avgTemperature: number;
    readingCount: number;
  }[];
  alertCount: number;
  criticalAlertsCount: number;
  /**
   * TODO: Criar tabela sync_history para armazenar histórico real
   * Em uma implementação real, você poderia ter uma tabela para registrar 
   * eventos de sincronização.
   */
  syncHistory: {
    success: boolean;
    timestamp: string;
    recordCount: number;
  }[];
}

/**
 * Serviço para sincronização entre o banco principal e o banco de backup
 */
export class BackupService {
  private mainDb: Database<sqlite3.Database, sqlite3.Statement> | null = null;
  private backupDb: Database<sqlite3.Database, sqlite3.Statement> | null = null;
  public isInitialized = false;
  private isSyncing = false;

  // Prefixo padrão para erros de backup
  private getFormattedDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'America/Sao_Paulo'
    };
    return new Intl.DateTimeFormat('pt-BR', options).format(date);
  }


  // Prefixo padrão para erros de backup
  private readonly ERROR_PREFIX = '[BACKUP_ERROR]';

  /**
   * Garante que o banco de dados esteja inicializado.
   * @throws {Error} Se o banco de dados não estiver inicializado.
   */
  private async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initialize();
    }
    if (!this.backupDb) {
      throw new Error(`${this.ERROR_PREFIX} Backup database is not initialized`);

    }
  }
  /**
   * Inicializa a conexão com os bancos de dados.
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      this.mainDb = await open({
        filename: MAIN_DB_PATH,
        driver: sqlite3.Database
      });

      this.backupDb = await open({
        filename: BACKUP_DB_PATH,
        driver: sqlite3.Database
      });

      // Criando tabelas no banco de backup se não existirem
      await this.createBackupTables();

      this.isInitialized = true;
      console.info('✅ Backup service initialized');
    } catch (error) {
      console.error(
        `${this.ERROR_PREFIX} ❌ Error initializing backup service:`,
        error
      );
      throw error;
    } 
  }  

  /**
   * Cria as tabelas necessárias no banco de backup
   */
  private async createBackupTables() {

    
    try {
      // Tabela readings com campos adicionais
      if (this.backupDb) {
        await this.backupDb.exec(`
        CREATE TABLE IF NOT EXISTS readings (
          id INTEGER PRIMARY KEY,
          temperature REAL NOT NULL,
          level REAL NOT NULL,
          pump_status INTEGER NOT NULL,
          heater_status INTEGER NOT NULL,
          timestamp TEXT NOT NULL,
          temperature_trend REAL DEFAULT 0,
          level_trend REAL DEFAULT 0,
        timestamp TEXT NOT NULL,
        temperature_trend REAL DEFAULT 0,
        level_trend REAL DEFAULT 0,
        is_temp_critical INTEGER DEFAULT 0,
        is_level_critical INTEGER DEFAULT 0,
        data_source TEXT DEFAULT 'thingspeak',
        data_quality REAL DEFAULT 1.0
      )
    `);}
      }
  

    // Tabela de setpoints (igual à principal)
      if(this.backupDb){
        await this.backupDb.exec(`
          CREATE TABLE IF NOT EXISTS setpoints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            temp_min REAL DEFAULT 25.0,
            temp_max REAL DEFAULT 28.0,
            level_min REAL DEFAULT 60.0,
            level_max REAL DEFAULT 80.0,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
          )
        `);}
      }
    
      // Tabela de setpoints (igual à principal)
      if(this.backupDb){
        await this.backupDb.exec(`
          CREATE TABLE IF NOT EXISTS setpoints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            temp_min REAL DEFAULT 25.0,
            temp_max REAL DEFAULT 28.0,
          level_min REAL DEFAULT 60.0,
          level_max REAL DEFAULT 80.0,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `);}
      }

      // Tabela de configurações (compatível com o banco principal)
      if(this.backupDb){
        await this.backupDb.exec(`
          CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            system_name TEXT DEFAULT 'Aquaponia',
            update_interval INTEGER DEFAULT 1,
            data_retention INTEGER DEFAULT 30,
            email_alerts INTEGER DEFAULT 1,
            push_alerts INTEGER DEFAULT 1,
            alert_email TEXT DEFAULT NULL,
            temp_critical_min REAL DEFAULT 18.0,
            temp_warning_min REAL DEFAULT 20.0,
            temp_warning_max REAL DEFAULT 28.0,
            temp_critical_max REAL DEFAULT 30.0,
            level_critical_min INTEGER DEFAULT 50,
            level_warning_min INTEGER DEFAULT 60,
            level_warning_max INTEGER DEFAULT 85,
            level_critical_max INTEGER DEFAULT 90,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `);}
    
      // Verificar se a coluna 'key' existe na tabela settings
      // Esta verificação é necessária para compatibilidade com a versão
      // utilizada no Render e em outros ambientes de hospedagem
      try {
        // Consultar informações da tabela settings        
        const tableInfo = await this.backupDb.all("PRAGMA table_info(settings)");
        
        // Verificar se a coluna 'key' existe
        const hasKeyColumn = tableInfo.some((col: any) => col.name === 'key');
        const hasValueColumn = tableInfo.some((col: any) => col.name === 'value');       
        // Se a coluna 'key' não existir, adicioná-la
        if (!hasKeyColumn) {
          console.warn('⚠️ Coluna \"key\" não encontrada na tabela settings. Adicionando...');
          await this.backupDb?.exec('ALTER TABLE settings ADD COLUMN key TEXT');
        }
       
        // Se a coluna 'value' não existir, adicioná-la
        if (!hasValueColumn) {
          console.log('⚠️ Coluna \"value\" não encontrada na tabela settings. Adicionando...');
          await this.backupDb?.exec('ALTER TABLE settings ADD COLUMN value TEXT');
        }
        
        console.info('✅ Verificação e correção do esquema da tabela settings concluída');
      } catch (schemaError) {
        console.error(
          `${this.ERROR_PREFIX} ❌ Erro ao verificar ou modificar o esquema da tabela settings:`,
          schemaError
        );
        // Continuar a execução, não interromper todo o processo por causa deste erro
      }      
    
      // Tabela de alertas (nova tabela para backup)
      if(this.backupDb){
        await this.backupDb.exec( `
          CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            severity TEXT NOT NULL,
            message TEXT NOT NULL,
            reading_id INTEGER NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            is_acknowledged INTEGER DEFAULT 0,
            FOREIGN KEY (reading_id) REFERENCES readings (id)
          )
        `);}
      }

      // Tabela de estatísticas diárias (nova tabela para backup)
      // Verificar se a tabela daily_stats já existe
      const tableExists = await this.backupDb.get(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='daily_stats'"
      );
    
      if (tableExists) {
        // Verificar se a coluna last_sync_timestamp existe
        const tableInfo = await this.backupDb.all("PRAGMA table_info(daily_stats)");
        const hasLastSyncTimestampColumn = tableInfo.some(
          (col: any) => col.name === "last_sync_timestamp"
        );
    
        // Adicionar a coluna se ela não existir
        if (!hasLastSyncTimestampColumn) {
          console.log('⚠️ Coluna \"last_sync_timestamp\" não encontrada na tabela daily_stats. Adicionando...');
          if(this.backupDb){
           await this.backupDb.exec('ALTER TABLE daily_stats ADD COLUMN last_sync_timestamp TEXT');
            console.info('✅ Coluna \"last_sync_timestamp\" adicionada na tabela daily_stats');
          }
        }
      } else {
        // Criar a tabela com a nova coluna
        if(this.backupDb){
          await this.backupDb.exec(`
            CREATE TABLE IF NOT EXISTS daily_stats (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              date TEXT UNIQUE NOT NULL,
              min_temperature REAL NOT NULL,
              max_temperature REAL NOT NULL,
              avg_temperature REAL NOT NULL,
            reading_count INTEGER NOT NULL,
            last_sync_timestamp TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
          )`);
        `);
      }
    } catch (error) {
      console.error(
        `${this.ERROR_PREFIX} ❌ Error creating backup tables:`,
        error
      );
      throw error;
    }

     // Inserir configurações padrão se a tabela estiver vazia
    const settings = await this.backupDb?.get('SELECT COUNT(*) as count FROM settings');
    if(this.backupDb) {
      if (settings?.count === 0) {
        await this.backupDb?.run(
          "INSERT INTO settings (key, value) VALUES (?, ?)",
          ['temperature_thresholds', JSON.stringify({
            tempCriticalMin: 18.0,
            tempCriticalMax: 30.0,
            levelCriticalMin: 50,
            levelCriticalMax: 90  
          })]
        );
      }
    }

    // Inserir setpoints padrão se a tabela estiver vazia
    const setpoints = await this.backupDb.get('SELECT COUNT(*) as count FROM setpoints');
    if (setpoints.count === 0) {
      await this.backupDb?.run(
        "INSERT INTO setpoints (temp_min, temp_max, level_min, level_max) VALUES (?, ?, ?, ?)",
        [25.0, 28.0, 60.0, 80.0]
      );
    }

    console.info('✅ Backup database schema created successfully');
  }

  /**
   * Sincroniza os dados do banco principal para o banco de backup
   */
  async syncData() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.isSyncing) {
      console.info('⏳ Sync already in progress, skipping...');
      return;
    }

    if (!this.mainDb || !this.backupDb) {
      console.error(`${this.ERROR_PREFIX} ❌ Data bases are not initialized`);
      await this.initialize();
      // Esta verificação é feita após a nova tentativa de inicialização
      // Se não foi possível, dispara um erro.
      // Lembre-se que não está repetindo o erro de 'initialize', mas gerando um novo
      if (!this.mainDb || !this.backupDb) {
        throw new Error('Não foi possível inicializar os bancos de dados');
      }
    }

    this.isSyncing = true;    
    console.log('🔄 Starting database sync...');
    const startTime = Date.now();
    try {
      // Obter o último ID sincronizado no banco de backup
      const lastBackupReading = await this.backupDb?.get(
        'SELECT MAX(id) as last_id FROM readings'
      );     
      
      const lastId = lastBackupReading?.last_id || 0;
      
      // Buscar novas leituras no banco principal
      let newReadings: Reading[] = [];
      if(this.mainDb) {
        newReadings = await this.mainDb.all(
          'SELECT * FROM readings WHERE id > ? ORDER BY id ASC LIMIT 1000',
          [lastId]
        );
      }
      
      if (newReadings.length === 0) {
        console.info('✅ No new readings to sync');
        return;
      }

      console.log(`🔄 Syncing ${newReadings.length} new readings...`);
      
      // Iniciar transação para garantir consistência
      await this.backupDb?.run('BEGIN TRANSACTION');
      
      // Processar e inserir cada nova leitura
      for (const reading of newReadings) {
        await this.processAndInsertReading(reading);
      }

      // Verificar se há necessidade de gerar estatísticas diárias
      await this.generateDailyStats();

      // Confirmar transação
      await this.backupDb?.run('COMMIT');      
     const endTime = Date.now();
      const duration = endTime - startTime;
      console.info(
        `✅ Successfully synced ${newReadings.length} readings in ${duration}ms`
      );
      
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const now = new Date().toISOString(); // Timestamp atual

      // Tentar atualizar o registro do dia atual
      await this.backupDb?.run(
        `UPDATE daily_stats SET last_sync_timestamp = ? WHERE date = ?`,
        [now, today]
      );

      // Se nenhum registro foi atualizado (dia atual não existe), inserir um novo
      if ((this.backupDb?.changes || 0) === 0) {
        await this.backupDb?.run(
          `INSERT INTO daily_stats (date, last_sync_timestamp, min_temperature, max_temperature, avg_temperature, min_level, max_level, avg_level, reading_count) VALUES (?, ?, 0, 0, 0, 0, 0, 0, 0)`, // Inserir valores padrão para as outras colunas
          [today, now]
        );
      }
    } catch (error: any) {
      console.error(
        `${this.ERROR_PREFIX} ❌ Error during sync:`,
        error.message,
        error.cause,
        error.name
      );
      // Reverter alterações em caso de erro
      await this.backupDb?.run('ROLLBACK');      
      // Relançar o erro para que a camada superior também trate
      throw error;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Processa uma leitura e calcula campos adicionais antes de inserir no backup
   */
  private async processAndInsertReading(reading: Reading) {
    try {
      const processStartTime = Date.now();     

      // Buscar leitura anterior para calcular tendências
      const previousReading = await this.backupDb?.get(
        'SELECT temperature, level FROM readings ORDER BY id DESC LIMIT 1'
      );     

      // Calcular tendências (se houver leitura anterior)
      const temperatureTrend = previousReading 
        ? reading.temperature - previousReading.temperature 
        : 0;
      
      const levelTrend = previousReading 
        ? reading.level - previousReading.level 
        : 0;

      // Valores fixos para limites críticos para detectar condições de alerta
      // Valores padrão fixos para limites
      const tempCriticalMin = 18.0;
      const tempCriticalMax = 30.0;
      const levelCriticalMin = 50;
      const levelCriticalMax = 90;
      
      // Determinar condições críticas
      const isTempCritical = 
        reading.temperature < tempCriticalMin || 
        reading.temperature > tempCriticalMax;
      
      const isLevelCritical = 
        reading.level < levelCriticalMin || 
        reading.level > levelCriticalMax;
  
      // Inserir leitura com campos adicionais  
      if(this.backupDb) {
        await this.backupDb.run(
          `INSERT INTO readings (
            id, temperature, level, pump_status, heater_status, timestamp,
            temperature_trend, level_trend, is_temp_critical, is_level_critical,
            data_source, data_quality
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
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
          ]      
        );
      }
  
      // Se condição crítica, gerar alerta
      if (isTempCritical || isLevelCritical) {
        await this.generateAlert(reading.id, isTempCritical, isLevelCritical);
      }
      const processEndTime = Date.now();
      const processDuration = processEndTime - processStartTime;      
      console.debug(`✅ Reading ${reading.id} processed and inserted in ${processDuration}ms`);
    } catch (error: any) {      
      console.error(
        `${this.ERROR_PREFIX} ❌ Error processing reading for backup:`,
        error.message, error.cause, error.name
      );
      // Relançar para que o erro seja tratado no método que chamou
        throw error;
    }

  }

  /**
   * Gera um alerta para condições críticas
   */
  private async generateAlert(readingId: number, isTempCritical: boolean, isLevelCritical: boolean) {
    if (isTempCritical) {
      if(this.backupDb) {
        await this.backupDb?.run(
          `INSERT INTO alerts (type, severity, message, reading_id) 
          VALUES (?, ?, ?, ?)`,        
          [
            'temperature',
            'critical',          
            'Temperatura fora dos limites críticos!',
            readingId
          ]
        );
      }
    }

    if (isLevelCritical) {
      if(this.backupDb) {
        await this.backupDb?.run(
          `INSERT INTO alerts (type, severity, message, reading_id) 
          VALUES (?, ?, ?, ?)`,        
          [ 'water_level', 'critical', 'Nível da água fora dos limites críticos!', readingId]
        );
      }
    }
  }

  /**
   * Gera estatísticas diárias se não existirem para o dia atual
   */
  private async generateDailyStats() {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    if(this.backupDb){
      // Verificar se já existem estatísticas para hoje
      const existingStats = await this.backupDb?.get(
        'SELECT id FROM daily_stats WHERE date = ?',
        [today]
      );
  
      if (existingStats) {
        return; // Estatísticas já existem para hoje
      }
  
      // Calcular estatísticas para as leituras de hoje
      const stats = await this.backupDb?.get(
        `SELECT 
          MIN(temperature) as min_temperature,
          MAX(temperature) as max_temperature,
          AVG(temperature) as avg_temperature,
          MIN(level) as min_level,
          MAX(level) as max_level,
          AVG(level) as avg_level,
          SUM(CASE WHEN pump_status = 1 THEN 1 ELSE 0 END) as pump_active_count,
          SUM(CASE WHEN heater_status = 1 THEN 1 ELSE 0 END) as heater_active_count,
          COUNT(*) as reading_count
        FROM readings 
        WHERE date(timestamp) = ?`,
        [today]
      );
  
      if (!stats || stats.reading_count === 0) {
        return; // Sem leituras para hoje
      }
  
      // Cada leitura representa aproximadamente 5 minutos (considerando intervalo padrão)
      // então multiplicamos por 5 para ter o tempo em minutos
      const pumpActiveTime = stats.pump_active_count * 5;
      const heaterActiveTime = stats.heater_active_count * 5;
  
      // Inserir estatísticas diárias
      await this.backupDb?.run(
        `INSERT INTO daily_stats (
          date, min_temperature, max_temperature, avg_temperature,
          min_level, max_level, avg_level,
          pump_active_time, heater_active_time, reading_count
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          today, stats.min_temperature, stats.max_temperature, stats.avg_temperature,
          stats.min_level, stats.max_level, stats.avg_level,
          pumpActiveTime, heaterActiveTime, stats.reading_count
        ]
      );
    }

    console.info(`📊 Generated daily stats for ${today}`);
  }

  /**
   * Obtém informações sobre o último backup
   */
  async getLastBackupInfo(): Promise<LastBackupInfo> {
    if (!this.isInitialized) {
      await this.initialize();
    }    
    if (!this.backupDb) {
      throw new Error(`${this.ERROR_PREFIX} Backup database is not initialized`);
    }
    
    try {
      if(!this.backupDb) throw new Error('Erro ao acessar o banco de dados');
       // Obter última leitura
      

      const lastReading = await this.backupDb?.get(
        'SELECT id, timestamp FROM readings ORDER BY id DESC LIMIT 1'
      );
      
      // Obter contagem total de registros
      const totalCount = await this.backupDb.get(
        'SELECT COUNT(*) as count FROM readings'
      );
      
      // Obter data/hora atual formatada com fuso horário de Brasília (UTC-3)
      const now = new Date();
      // Subtrai 3 horas para ajustar para o fuso horário de Brasília (UTC-3)
      const brasiliaTime = new Date(now.getTime() - 3 * 60 * 60 * 1000);
      
      // Usar o Intl.DateTimeFormat para garantir o formato brasileiro
      const options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'America/Sao_Paulo'
      };      
      
      const formattedNow = new Intl.DateTimeFormat('pt-BR', options).format(now);
      
      return {
        lastId: lastReading?.id || 0,
        lastDate: formattedNow,
        totalRecords: totalCount?.count || 0
      };
    } catch (error) {
      console.error(
        `${this.ERROR_PREFIX} Error getting backup information:`, error
      );
      // Obter data/hora atual formatada para casos de erro (usando Intl.DateTimeFormat)
      const now = new Date();
      
      // Usar o Intl.DateTimeFormat para garantir o formato brasileiro
      const options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'America/Sao_Paulo'
      };
      
      const formattedNow = new Intl.DateTimeFormat('pt-BR', options).format(now);
      return {
        lastId: 0,
        lastDate: formattedNow,
        totalRecords: 0
      };
    }    
  }
  
  /**
   * Obtém estatísticas do banco de backup
   */
  async getBackupStats(): Promise<BackupStats> {
    await this.ensureInitialized();
    if (!this.backupDb) {
      throw new Error(`${this.ERROR_PREFIX} Backup database is not initialized`); 
    }    
       
    try {      
      if(!this.backupDb) throw new Error('Erro ao acessar o banco de dados');
      // Obter estatísticas diárias mais recentes (últimos 7 dias)
      let latestTimestamp: string | null = null;
      if (this.backupDb) {
        const result = await this.backupDb.get(
          `SELECT last_sync_timestamp FROM daily_stats ORDER BY date DESC LIMIT 1`
        );
        latestTimestamp = result?.last_sync_timestamp || null;
      }
      const dailyStats = await this.backupDb?.all(
        `SELECT 
          date, 
          min_temperature, 
          max_temperature,
          avg_temperature,         
          reading_count,
          last_sync_timestamp
          FROM daily_stats
          ORDER BY date DESC
          LIMIT 7`
        );
      // Formatar para a interface
      const formattedDailyStats = dailyStats.map(stat => ({
        date: stat.date,
        minTemperature: stat.min_temperature,
        maxTemperature: stat.max_temperature,
        avgTemperature: stat.avg_temperature,
        readingCount: stat.reading_count
      }));
      
      // Obter contagem de alertas    
      const alertCount = await this.backupDb?.get(
        'SELECT COUNT(*) as count FROM alerts'        
      );
      
      // Obter contagem de alertas críticos      
      const criticalAlertsCount = await this.backupDb.get(
        'SELECT COUNT(*) as count FROM alerts WHERE severity = "critical"'
      );
      
      //TODO: Substituir por leitura real do banco de dados
      //Em uma implementação real, você deveria ter uma tabela para registrar
      //eventos de sincronização, e realizar a consulta dos registros desta tabela
      const syncHistory = [
        //TODO: Remover dados fictícios
        {
          success: true,                    
          timestamp: this.getFormattedDate(new Date()),
          recordCount: 12
        },
        {
          success: true,                    
          timestamp: this.getFormattedDate(new Date(Date.now() - 60 * 60 * 1000)),          
          recordCount: 8
        }
      ];
      
      return {
        dailyStats: formattedDailyStats,
        alertCount: alertCount?.count || 0,
        criticalAlertsCount: criticalAlertsCount?.count || 0,
        syncHistory
      };
    } catch (error) {      
      console.error(
        `${this.ERROR_PREFIX} Error getting backup statistics:`,
        error
      );
      return {
        dailyStats: [],
        alertCount: 0,
        criticalAlertsCount: 0,
        syncHistory: []
      };
    }
  }
  
  /**
   * Fecha as conexões dos bancos de dados
   */
  async close() {
    if (this.mainDb) {
      await this.mainDb.close();
    }
    
    if (this.backupDb) {
      await this.backupDb.close();
    }
    
    this.isInitialized = false;
    console.info('🔄 Backup service closed');
  }
}

// Instância global do serviço
export const backupService = new BackupService();