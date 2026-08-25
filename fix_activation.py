import sqlite3

db = r'D:\BOT-WA-ARA\data\db\settings.db'
conn = sqlite3.connect(db)
conn.execute("UPDATE bot_config SET value='on' WHERE key='require_activation'")
conn.execute("INSERT OR IGNORE INTO bot_config (key, value) VALUES ('require_activation', 'on')")
conn.commit()
conn.close()
print('Activation ON - bot sekarang butuh /boton per chat')