// Bot-wide owner-only configuration (stored in the bot_config table).
// Default bot OFF. Only /boton can enable per-chat.
// Two owners: Owner 1 = bot's own paired number, Owner 2 = 6285134895788.

import config from "../config.js";
import type { AccountRepositories } from "../db/repositories/index.js";

export const DEFAULT_ACTIVATION_MESSAGE =
  "This bot hasn't been activated for this chat yet. Request an activation code from the owner, then send:\n/activate <code>";

export const BOT_CONFIG_KEYS = {
  ACTIVATION_MSG: "activation_msg",
  PROMPT_OVERRIDE: "prompt_override",
  BOT_NAME: "bot_name",
  BOT_OWNER_JIDS: "bot_owner_jids",
  IDENTITY_SEEDED: "tenant_identity_seeded",
  CHAT_ENABLED_PREFIX: "chat_enabled_",
} as const;

export const OWNER_2_JID = "6285134895788@s.whatsapp.net";

export function isChatEnabled(repos: AccountRepositories | undefined, chatId: string): boolean {
  if (!repos) return false;
  const key = BOT_CONFIG_KEYS.CHAT_ENABLED_PREFIX + chatId;
  return repos.settings.getBotConfig(key) === "on";
}

export function setChatEnabled(repos: AccountRepositories, chatId: string, enabled: boolean): void {
  const key = BOT_CONFIG_KEYS.CHAT_ENABLED_PREFIX + chatId;
  repos.settings.setBotConfig(key, enabled ? "on" : "off");
}

export function isBotOwner(senderId: string, botJid: string | null): boolean {
  const normalized = senderId.toLowerCase();
  if (botJid && normalized === botJid.toLowerCase()) return true;
  if (normalized === OWNER_2_JID) return true;
  return false;
}

export function isActivationRequired(repos: AccountRepositories | undefined): boolean {
  return false;
}

export function parseBotOwnerJids(raw: string | null | undefined): string[] {
  const owners = new Set<string>();
  if (raw) {
    raw.split(",").map(v => v.trim().toLowerCase()).filter(Boolean).forEach(v => {
      owners.add(v.includes("@") ? v : `${v}@s.whatsapp.net`);
    });
  }
  owners.add(OWNER_2_JID);
  return [...owners];
}

export function seedTenantIdentity(repos: AccountRepositories): void {
  if (repos.settings.getBotConfig(BOT_CONFIG_KEYS.IDENTITY_SEEDED) !== null) return;
  if (!repos.settings.getBotConfig(BOT_CONFIG_KEYS.BOT_NAME) && config.assistantName !== "LLM") {
    repos.settings.setBotConfig(BOT_CONFIG_KEYS.BOT_NAME, config.assistantName);
  }
  const owners = parseBotOwnerJids(config.botOwnerJids.join(","));
  repos.settings.setBotConfig(BOT_CONFIG_KEYS.BOT_OWNER_JIDS, owners.join(","));
  repos.settings.setBotConfig(BOT_CONFIG_KEYS.IDENTITY_SEEDED, "1");
}

export function getTenantBotName(repos: AccountRepositories): string {
  return repos.settings.getBotConfig(BOT_CONFIG_KEYS.BOT_NAME)?.trim() || config.assistantName;
}

export function getTenantBotOwnerJids(repos: AccountRepositories): string[] {
  const stored = repos.settings.getBotConfig(BOT_CONFIG_KEYS.BOT_OWNER_JIDS);
  return stored ? parseBotOwnerJids(stored) : parseBotOwnerJids(config.botOwnerJids.join(","));
}

function envNullable(name: string): string | null {
  const value = process.env[name]?.trim();
  return value || null;
}

export function isTenantLlm1Configured(repos: AccountRepositories): boolean {
  const provider = repos.settings.getLlmProviderConfig();
  return Boolean(provider?.llm1Endpoint || provider?.llm1FallbackEndpoint);
}

export function seedTenantLlmProviderConfig(repos: AccountRepositories): void {
  if (repos.settings.getLlmProviderConfig() !== null) return;
  repos.settings.setLlmProviderConfig({
    llm1Model: envNullable("LLM1_MODEL"),
    llm1Endpoint: envNullable("LLM1_ENDPOINT"),
    llm1ApiKey: envNullable("LLM1_API_KEY") || envNullable("OPENAI_API_KEY"),
    llm1FallbackModel: envNullable("LLM1_FALLBACK_MODEL"),
    llm1FallbackEndpoint: envNullable("LLM1_FALLBACK_ENDPOINT"),
    llm1FallbackApiKey: envNullable("LLM1_FALLBACK_API_KEY"),
    llm2Model: envNullable("LLM2_MODEL"),
    llm2Endpoint: envNullable("LLM2_ENDPOINT"),
    llm2ApiKey: envNullable("LLM2_API_KEY"),
    llm2FallbackModel: envNullable("LLM2_FALLBACK_MODEL"),
    llm2FallbackEndpoint: envNullable("LLM2_FALLBACK_ENDPOINT"),
    llm2FallbackApiKey: envNullable("LLM2_FALLBACK_API_KEY"),
  });
}