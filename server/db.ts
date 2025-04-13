import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

const DB_PATH = path.resolve(process.cwd(), process.env.DB_FILE || 'aquaponia.db');

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (!db) {
    try {
      db = await open({
        filename: DB_PATH,
        driver: sqlite3.Database,
      });
      console.log('🔄 Connected to database');
    } catch (error) {
      console.error('❌ Error connecting to database:', error);
      throw error; // Relança o erro para ser tratado em outro lugar
    }
  }
  return db;
}