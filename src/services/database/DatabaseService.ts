import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

const DB_NAME = 'weatherguard.db';

class DatabaseService {
  private db: SQLiteDatabase | null = null;
  private opening: Promise<SQLiteDatabase> | null = null;

  async open(): Promise<SQLiteDatabase> {
    if (this.db) return this.db;
    if (this.opening) return this.opening;

    this.opening = (async () => {
      const db = await SQLite.openDatabase({
        name: DB_NAME,
        location: 'default',
      });
      this.db = db;
      await this.createTables();
      return db;
    })();

    try {
      return await this.opening;
    } catch (error) {
      this.db = null;
      throw error;
    } finally {
      this.opening = null;
    }
  }

  private async createTables(): Promise<void> {
    const db = this.db!;

    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'resident',
        home_zone_id TEXT DEFAULT 'zone_village_a_ward_3',
        home_zone_name TEXT DEFAULT 'Village A (Ward 3)',
        avatar_color TEXT DEFAULT '#00D4FF',
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );
    `);

    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        token TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY,
        zone_id TEXT NOT NULL,
        severity TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        is_read INTEGER DEFAULT 0
      );
    `);

    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS settings (
        user_id TEXT PRIMARY KEY,
        notifications_enabled INTEGER DEFAULT 1,
        dark_mode INTEGER DEFAULT 1,
        alert_sound INTEGER DEFAULT 1,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

    // Remove known prototype fixture alerts from existing local databases.
    // Real alerts must come from a configured source or an explicit user action.
    await db.executeSql(
      "DELETE FROM alerts WHERE id IN ('alert_001', 'alert_002', 'alert_003', 'alert_004', 'alert_005', 'alert_006')"
    );
  }

  // ─── Simple hash (djb2 variant) ────────────────────────────
  hashPassword(password: string): string {
    let hash = 5381;
    for (let i = 0; i < password.length; i++) {
      hash = ((hash << 5) + hash) + password.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  generateToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = 'wg_';
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  generateId(): string {
    return 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
  }

  // ─── Auth Operations ──────────────────────────────────────
  async signUp(name: string, email: string, password: string): Promise<{ userId: string; token: string } | null> {
    const db = await this.open();

    // Check if email already exists
    const [existing] = await db.executeSql('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return null; // Email already in use
    }

    const userId = this.generateId();
    const passwordHash = this.hashPassword(password);
    const token = this.generateToken();

    await db.executeSql(
      `INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)`,
      [userId, name, email.toLowerCase(), passwordHash]
    );

    // This app supports one active local session per device. Clear any older
    // session before saving the new account so a later launch cannot restore
    // a different user's stale session.
    await db.executeSql('DELETE FROM sessions');
    await db.executeSql(
      `INSERT INTO sessions (user_id, token) VALUES (?, ?)`,
      [userId, token]
    );

    await db.executeSql(
      `INSERT INTO settings (user_id) VALUES (?)`,
      [userId]
    );

    return { userId, token };
  }

  async login(email: string, password: string): Promise<{ userId: string; token: string } | null> {
    const db = await this.open();
    const passwordHash = this.hashPassword(password);

    const [result] = await db.executeSql(
      'SELECT id FROM users WHERE email = ? AND password_hash = ?',
      [email.toLowerCase(), passwordHash]
    );

    if (result.rows.length === 0) return null;

    const userId = result.rows.item(0).id;
    const token = this.generateToken();

    // Keep only the session for the account currently signing in.
    await db.executeSql('DELETE FROM sessions');
    await db.executeSql(
      'INSERT INTO sessions (user_id, token) VALUES (?, ?)',
      [userId, token]
    );

    return { userId, token };
  }

  async getUserById(userId: string): Promise<any | null> {
    const db = await this.open();
    const [result] = await db.executeSql('SELECT * FROM users WHERE id = ?', [userId]);
    if (result.rows.length === 0) return null;
    return result.rows.item(0);
  }

  async getActiveSession(): Promise<{ userId: string; token: string } | null> {
    const db = await this.open();
    const [result] = await db.executeSql(
      'SELECT user_id, token FROM sessions ORDER BY id DESC LIMIT 1'
    );
    if (result.rows.length === 0) return null;
    const row = result.rows.item(0);
    return { userId: row.user_id, token: row.token };
  }

  async logout(): Promise<void> {
    const db = await this.open();
    // A single-device session is used; deleting only by user can leave an old
    // account's session behind and silently sign it back in after this logout.
    await db.executeSql('DELETE FROM sessions');
  }

  async updateUser(userId: string, updates: { name?: string; email?: string; home_zone_id?: string; home_zone_name?: string; avatar_color?: string }): Promise<void> {
    const db = await this.open();
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
    if (updates.email !== undefined) { fields.push('email = ?'); values.push(updates.email.toLowerCase()); }
    if (updates.home_zone_id !== undefined) { fields.push('home_zone_id = ?'); values.push(updates.home_zone_id); }
    if (updates.home_zone_name !== undefined) { fields.push('home_zone_name = ?'); values.push(updates.home_zone_name); }
    if (updates.avatar_color !== undefined) { fields.push('avatar_color = ?'); values.push(updates.avatar_color); }

    if (fields.length === 0) return;

    fields.push("updated_at = datetime('now')");
    values.push(userId);

    await db.executeSql(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  // ─── Alerts Operations ────────────────────────────────────
  async getAlerts(zoneId?: string): Promise<any[]> {
    const db = await this.open();
    const query = zoneId
      ? 'SELECT * FROM alerts WHERE zone_id = ? ORDER BY created_at DESC'
      : 'SELECT * FROM alerts ORDER BY created_at DESC';
    const params = zoneId ? [zoneId] : [];
    const [result] = await db.executeSql(query, params);
    const alerts: any[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      alerts.push(result.rows.item(i));
    }
    return alerts;
  }

  async markAlertRead(alertId: string): Promise<void> {
    const db = await this.open();
    await db.executeSql('UPDATE alerts SET is_read = 1 WHERE id = ?', [alertId]);
  }

  async addAlert(alert: {
    id?: string;
    zone_id?: string;
    severity: string;
    title: string;
    description: string;
  }): Promise<void> {
    const db = await this.open();
    const id = alert.id || 'alert_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const zoneId = alert.zone_id || 'zone_live';
    await db.executeSql(
      'INSERT INTO alerts (id, zone_id, severity, title, description) VALUES (?, ?, ?, ?, ?)',
      [id, zoneId, alert.severity, alert.title, alert.description]
    );
  }

  async getUnreadAlertCount(): Promise<number> {
    const db = await this.open();
    const [result] = await db.executeSql('SELECT COUNT(*) as count FROM alerts WHERE is_read = 0');
    return result.rows.item(0).count;
  }

  // ─── Settings Operations ──────────────────────────────────
  async getSettings(userId: string): Promise<any | null> {
    const db = await this.open();
    const [result] = await db.executeSql('SELECT * FROM settings WHERE user_id = ?', [userId]);
    if (result.rows.length === 0) return null;
    return result.rows.item(0);
  }

  async updateSettings(userId: string, updates: { notifications_enabled?: number; dark_mode?: number; alert_sound?: number }): Promise<void> {
    const db = await this.open();
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.notifications_enabled !== undefined) { fields.push('notifications_enabled = ?'); values.push(updates.notifications_enabled); }
    if (updates.dark_mode !== undefined) { fields.push('dark_mode = ?'); values.push(updates.dark_mode); }
    if (updates.alert_sound !== undefined) { fields.push('alert_sound = ?'); values.push(updates.alert_sound); }

    if (fields.length === 0) return;
    values.push(userId);

    await db.executeSql(`UPDATE settings SET ${fields.join(', ')} WHERE user_id = ?`, values);
  }

}

export const databaseService = new DatabaseService();
