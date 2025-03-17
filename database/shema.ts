import * as SQLite from 'expo-sqlite';

// Оборачиваем ффункцию в промис, который в итоге возраващет объект бд
//Возвращает базу данных
export const initDatabase = async () : Promise<SQLite.SQLiteDatabase> => {
  try {
    // Открываем базу данных
    const db = await SQLite.openDatabaseAsync('markers.db');

    // Создаем таблицу Marker
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS Marker (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL
      );
    `);
    console.log('Таблица Marker создана');

    // Создаем таблицу Image
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS Image (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uri TEXT NOT NULL,
        markerId INTEGER NOT NULL,
        FOREIGN KEY (markerId) REFERENCES Marker(id) ON DELETE CASCADE
      );
    `);
    console.log('Таблица Image создана');

    return db;
  } catch (error) {
    console.error('Ошибка при инициализации базы данных:', error);
    throw error;
  }
};