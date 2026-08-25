import sqlite3

db = r'D:\BOT-WA-ARA\data\db\settings.db'
conn = sqlite3.connect(db)

# Hapus model gpt-4.1 dari llm_models
conn.execute("DELETE FROM llm_models WHERE model_id LIKE '%gpt%' OR model_id LIKE '%4.1%'")
conn.execute("DELETE FROM llm_models WHERE model_id = 'gpt-4.1'")

# Set default ke Qwen
conn.execute("UPDATE llm_models SET is_default = 0")
conn.execute("UPDATE llm_models SET is_default = 1 WHERE model_id = '@cf/qwen/qwen3-30b-a3b-fp8'")

# Update provider config
conn.execute("UPDATE llm_provider_config SET llm2_model = '@cf/qwen/qwen3-30b-a3b-fp8' WHERE id = 1")

# Update chat_settings yang masih pake gpt-4.1
conn.execute("UPDATE chat_settings SET llm2_model = '@cf/qwen/qwen3-30b-a3b-fp8' WHERE llm2_model LIKE '%gpt%' OR llm2_model LIKE '%4.1%'")

conn.commit()
conn.close()
print('DONE: gpt-4.1 dihapus, model Qwen di-set sebagai default')