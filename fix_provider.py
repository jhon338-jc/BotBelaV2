import sqlite3

db = r'D:\BOT-WA-ARA\data\db\settings.db'
conn = sqlite3.connect(db)
conn.execute('DELETE FROM llm_provider_config')
conn.commit()
conn.close()
print('DONE')