import sqlite3

db = r'D:\BOT-WA-ARA\data\db\settings.db'
conn = sqlite3.connect(db)
conn.execute("UPDATE llm_provider_config SET llm2_model = '@cf/meta/llama-4-scout-17b-16e-instruct' WHERE id = 1")
conn.execute("UPDATE llm_models SET is_default = 0")
conn.execute("INSERT OR IGNORE INTO llm_models (model_id, display_name, description, is_active, is_default, sort_order, vision_support) VALUES ('@cf/meta/llama-4-scout-17b-16e-instruct', 'Llama 4 Scout', 'CF', 1, 1, 0, 0)")
conn.execute("UPDATE llm_models SET is_default = 1 WHERE model_id = '@cf/meta/llama-4-scout-17b-16e-instruct'")
conn.commit()
conn.close()
print('LLAMA MODEL SET')