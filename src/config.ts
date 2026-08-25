import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { config as dotenvConfig } from 'dotenv';

const ENV_PATH = path.resolve(process.cwd(), '.env');
const SUPERVISOR_PY_BIN = (process.env.PY_BIN || '').trim();
dotenvConfig({ path: ENV_PATH });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, 'data');
const AUTH_DIR = path.join(DATA_DIR, 'auth');
const MEDIA_DIR = process.env.MEDIA_DIR || path.join(DATA_DIR, 'media');
const STICKERS_DIR = process.env.STICKERS_DIR || path.join(DATA_DIR, 'stickers');
const SETTINGS_DB_PATH = process.env.SETTINGS_DB_PATH || path.join(DATA_DIR, 'settings.db');
const STATS_DB_PATH = process.env.STATS_DB_PATH || path.join(DATA_DIR, 'stats.db');
const MODERATION_DB_PATH = process.env.MODERATION_DB_PATH || path.join(DATA_DIR, 'moderation.db');
const SUBAGENT_DB_PATH = process.env.SUBAGENT_DB_PATH || path.join(DATA_DIR, 'subagent.db');
const STICKER_UPLOAD_DIR = process.env.STICKER_UPLOAD_DIR || path.join(DATA_DIR, 'stickers_user');
const STICKERS_DB_PATH = process.env.BOT_STICKERS_DB_PATH
  || process.env.STICKERS_DB_PATH
  || path.join(DATA_DIR, 'stickers.db');

fs.ensureDirSync(AUTH_DIR);
fs.ensureDirSync(MEDIA_DIR);
fs.ensureDirSync(STICKERS_DIR);

function positiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.floor(parsed));
}

function nonNegativeInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, Math.floor(parsed));
}

function booleanEnv(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
  return fallback;
}

function normalizeOwnerJid(raw: string): string[] {
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return [];
  if (trimmed.includes('@')) return [trimmed];
  return [`${trimmed}@s.whatsapp.net`];
}

function parseJidList(raw: string | undefined): string[] {
  if (!raw || typeof raw !== 'string') return [];
  return raw
    .split(',')
    .flatMap(normalizeOwnerJid)
    .filter(Boolean);
}

export interface Config {
  instanceId: string;
  pythonBin: string;
  pairingNumber: string | null;
  pairingRetryCooldownMs: number;
  wsListenPort: number;
  wsBindHost: string;
  wsMaxPayloadBytes: number;
  wsToken: string | null;
  dataDir: string;
  settingsDbPath: string;
  statsDbPath: string;
  moderationDbPath: string;
  subagentDbPath: string;
  wsHeartbeatIntervalMs: number;
  authDir: string;
  mediaDir: string;
  stickersDir: string;
  stickerUploadDir: string;
  stickersDbPath: string;
  logLevel: string;
  logColor: string;
  baileysLogLevel: string;
  groupMetadataTimeoutMs: number;
  downloadTimeoutMs: number;
  sendTimeoutMs: number;
  upsertConcurrency: number;
  staleMessageMaxAgeMs: number;
  perfLogEnabled: boolean;
  perfLogThresholdMs: number;
  assistantName: string;
  botOwnerJids: string[];
  llmReplyInteractive: boolean;
  llmReplyFooter: string;
  stickerMaxDurationSec: number;
  stickerMaxSizeKb: number;
  stickerFps: number;
  stickerQuality: number;
  stickerPackName: string;
  stickerEmoji: string;
  requireActivation: boolean;
  activationNoticeEnabled: boolean;
  privateChatEnabled: boolean;
  subagentEnabledDefault: boolean;
  llm1Configured: boolean;
  subagentConfigured: boolean;
  controlPanelEnabled: boolean;
  controlPanelHost: string;
  controlPanelPort: number;
  controlPanelToken: string | null;
  controlPanelMaxBodyBytes: number;
}

function buildConfig(): Config {
  return {
  instanceId: process.env.INSTANCE_ID || 'default',
  pythonBin: SUPERVISOR_PY_BIN || (process.env.PY_BIN || '').trim()
    || (process.platform === 'win32' ? 'python' : 'python3'),
  pairingNumber: (process.env.WA_PAIRING_NUMBER || '').replace(/\D/g, '') || null,
  // Cooldown pairing CEPAT biar ga rate limit — 2 menit aja
  pairingRetryCooldownMs: positiveInt(
    process.env.WA_PAIRING_RETRY_COOLDOWN_MS,
    2 * 60 * 1000,
  ),
  wsListenPort: positiveInt(process.env.WS_LISTEN_PORT, 3000),
  wsBindHost: process.env.WS_BIND_HOST || '127.0.0.1',
  wsMaxPayloadBytes: positiveInt(process.env.WS_MAX_PAYLOAD_BYTES, 8 * 1024 * 1024),
  wsToken: process.env.LLM_WS_TOKEN || null,
  dataDir: DATA_DIR,
  settingsDbPath: SETTINGS_DB_PATH,
  statsDbPath: STATS_DB_PATH,
  moderationDbPath: MODERATION_DB_PATH,
  subagentDbPath: SUBAGENT_DB_PATH,
  wsHeartbeatIntervalMs: positiveInt(process.env.WS_HEARTBEAT_INTERVAL_MS, 20000),
  authDir: AUTH_DIR,
  mediaDir: MEDIA_DIR,
  stickersDir: STICKERS_DIR,
  stickerUploadDir: STICKER_UPLOAD_DIR,
  stickersDbPath: STICKERS_DB_PATH,
  logLevel: process.env.LOG_LEVEL || 'info',
  logColor: process.env.LOG_COLOR || 'auto',
  baileysLogLevel: process.env.BAILEYS_LOG_LEVEL || 'warn',
  groupMetadataTimeoutMs: positiveInt(process.env.GROUP_METADATA_TIMEOUT_MS, 8000),
  downloadTimeoutMs: positiveInt(process.env.DOWNLOAD_TIMEOUT_MS, 60000),
  sendTimeoutMs: positiveInt(process.env.SEND_TIMEOUT_MS, 60000),
  upsertConcurrency: positiveInt(process.env.UPSERT_CONCURRENCY, 2),
  staleMessageMaxAgeMs: nonNegativeInt(process.env.STALE_MESSAGE_MAX_AGE_MS, 5000),
  perfLogEnabled: process.env.PERF_LOG_ENABLED !== '0',
  perfLogThresholdMs: nonNegativeInt(process.env.PERF_LOG_THRESHOLD_MS, 400),
  assistantName: (process.env.ASSISTANT_NAME || 'LLM').trim() || 'LLM',
  botOwnerJids: parseJidList(process.env.BOT_OWNER_JIDS),
  llmReplyInteractive: process.env.LLM_REPLY_INTERACTIVE === 'true',
  llmReplyFooter: process.env.LLM_REPLY_FOOTER || '',
  stickerMaxDurationSec: positiveInt(process.env.STICKER_MAX_DURATION_SEC, 6),
  stickerMaxSizeKb: positiveInt(process.env.STICKER_MAX_SIZE_KB, 1024),
  stickerFps: positiveInt(process.env.STICKER_FPS, 15),
  stickerQuality: positiveInt(process.env.STICKER_QUALITY, 75),
  stickerPackName: process.env.STICKER_PACK_NAME || 'BelaSayank',
  stickerEmoji: process.env.STICKER_EMOJI || '🤖',
  requireActivation: process.env.REQUIRE_ACTIVATION !== 'false',
  activationNoticeEnabled: process.env.ACTIVATION_NOTICE_ENABLED !== 'false',
  privateChatEnabled: booleanEnv(process.env.PRIVATE_CHAT_ENABLED, false),
  subagentEnabledDefault: process.env.SUBAGENT_ENABLED_DEFAULT === 'true',
  llm1Configured: Boolean(
    (process.env.LLM1_ENDPOINT || '').trim() ||
    (process.env.LLM1_FALLBACK_ENDPOINT || '').trim(),
  ),
  subagentConfigured: Boolean((process.env.SUBAGENT_URL || '').trim()),
  controlPanelEnabled: booleanEnv(process.env.CONTROL_PANEL_ENABLED, true),
  controlPanelHost: (process.env.CONTROL_PANEL_HOST || '').trim() || '127.0.0.1',
  controlPanelPort: positiveInt(process.env.CONTROL_PANEL_PORT, 8080),
  controlPanelToken: (process.env.CONTROL_PANEL_TOKEN || '').trim() || null,
  controlPanelMaxBodyBytes: positiveInt(
    process.env.CONTROL_PANEL_MAX_BODY_BYTES,
    2 * 1024 * 1024,
  ),
  };
}

const config: Config = buildConfig();

function validateConfig(c: Config): void {
  if (!Number.isInteger(c.wsListenPort) || c.wsListenPort < 1 || c.wsListenPort > 65535) {
    throw new Error(`Invalid WS_LISTEN_PORT`);
  }
  if (!Number.isInteger(c.controlPanelPort) || c.controlPanelPort < 1 || c.controlPanelPort > 65535) {
    throw new Error(`Invalid CONTROL_PANEL_PORT`);
  }
}

validateConfig(config);

export function reloadConfigFromEnv(): void {
  dotenvConfig({ path: ENV_PATH, override: true });
  const nextConfig = buildConfig();
  validateConfig(nextConfig);
  Object.assign(config, nextConfig);
}

try {
  fs.watch(ENV_PATH, () => {
    try {
      reloadConfigFromEnv();
    } catch {
      // keep last-good config
    }
  });
} catch {
  // .env absent — nothing to watch
}

export default config;