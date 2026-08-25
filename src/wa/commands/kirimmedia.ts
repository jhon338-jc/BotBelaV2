import logger from '../../logger.js';
import config from '../../config.js';
import path from 'path';
import fs from 'fs-extra';
import type { CommandContext, CommandHandler } from '../command/CommandContext.js';

const MEDIA_DIR = path.join(config.dataDir, 'media');
const PAP_DIR = path.join(config.dataDir, 'pap');
const PAP_MEMEK_DIR = path.join(config.dataDir, 'pap_memek');
const PAP_SUSU_DIR = path.join(config.dataDir, 'pap_susu');
const PAP_BUGIL_DIR = path.join(config.dataDir, 'pap_bugil');
const GAMBAR_DIR = path.join(config.dataDir, 'media', 'gambar');
const VIDEO_DIR = path.join(config.dataDir, 'media', 'video');
const AUDIO_DIR = path.join(config.dataDir, 'media', 'audio');

const PAP_CAPTIONS = [
  'Nih pap nya bang, jangan lupa save ya 😊',
  'Pap buat kamu yang lagi kangen... 💕',
  'Ehehe, pap spesial dari Bela~ 😳',
  'Ini dia pap nya, jangan kasih siapa-siapa ya! 🫣',
  'Pap buat bang yang paling gemes... 😘',
  'Bela kirim pap dulu ya, nanti jangan lupa bales! 😊',
  'PAP! Biar kamu makin kangen... 🥺',
  'Nih pap nya bang, semoga suka... 💕',
  'Pap random buat kamu yang lagi butuh... 😉',
  'Ini pap nya, jangan lupa mandi dulu ya bang! 😅',
];

const PAP_MEMEK_CAPTIONS = [
  'Pap memek buat kamu... basah & pink 😳💕',
  'Nih memek Bela, jangan lupa jilat ya... 👅',
  'Memek Bela lagi basah nih, mau? 💦',
  'Pap memek spesial buat kamu... jangan malu! 😘',
  'Ini memeknya, semoga kamu suka... 🫣',
  'Memek Bela siap buat kamu... 🥵',
  'Nih pap memek, jangan lupa bayangin... 😉',
  'Memek pink Bela buat kamu... 💕',
  'Pap memek basah, kamu mau mainin? 👅',
  'Ini memek Bela, cuma buat kamu... 😳',
];

const PAP_SUSU_CAPTIONS = [
  'Pap susu buat kamu... gede & kenyal 😳💕',
  'Nih susu Bela, jangan lupa remas ya... 🫣',
  'Susu Bela buat kamu... mau nenen? 🍼',
  'Pap susu spesial, semoga kamu suka... 😘',
  'Ini susunya, gede banget kan? 😉',
  'Susu Bela siap buat kamu... 🥵',
  'Nih pap susu, jangan lupa bayangin... 💕',
  'Susu putih Bela buat kamu... 😳',
  'Pap susu kenyal, kamu mau mainin? 🫣',
  'Ini susu Bela, cuma buat kamu... 💕',
];

const PAP_BUGIL_CAPTIONS = [
  'Pap bugil buat kamu... jangan lupa puasin ya 😳💕',
  'Nih badan Bela tanpa sehelai benang... 🥵',
  'Bugil Bela buat kamu... mau liat lebih? 🫣',
  'Pap bugil spesial, semoga kamu sange... 😘',
  'Ini badan Bela, jangan lupa bayangin... 😉',
  'Bela bugil buat kamu... 🥵💕',
  'Nih pap bugil, jangan lupa save... 😳',
  'Bugil Bela siap buat kamu... 💦',
  'Pap bugil, kamu mau apa lagi? 🫣',
  'Ini badan Bela, cuma buat kamu... 💕',
];

function randomCaption(type: string): string {
  if (type === 'memek') return PAP_MEMEK_CAPTIONS[Math.floor(Math.random() * PAP_MEMEK_CAPTIONS.length)];
  if (type === 'susu') return PAP_SUSU_CAPTIONS[Math.floor(Math.random() * PAP_SUSU_CAPTIONS.length)];
  if (type === 'bugil') return PAP_BUGIL_CAPTIONS[Math.floor(Math.random() * PAP_BUGIL_CAPTIONS.length)];
  return PAP_CAPTIONS[Math.floor(Math.random() * PAP_CAPTIONS.length)];
}

async function getRandomFileFromDir(dir: string): Promise<string | null> {
  try {
    await fs.ensureDir(dir);
    const entries = await fs.readdir(dir);
    const files = entries.filter((f) => {
      const ext = path.extname(f).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    });
    if (files.length === 0) return null;
    // Fisher-Yates shuffle biar bener-bener random
    for (let i = files.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [files[i], files[j]] = [files[j], files[i]];
    }
    return files[0];
  } catch {
    return null;
  }
}

async function sendPapImages(chatId: string, sock: any, dir: string, type: string, count: number, msg: any): Promise<void> {
  const filesSent: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const randomFile = await getRandomFileFromDir(dir);
    if (randomFile && !filesSent.includes(randomFile)) {
      filesSent.push(randomFile);
      const filePath = path.join(dir, randomFile);
      await sock.sendMessage(chatId, {
        image: { url: filePath },
        caption: randomCaption(type),
      });
    }
  }

  if (filesSent.length === 0) {
    await sock.sendMessage(chatId, { text: 'Maaf bang, PAP belum ada... 😅' });
  }
}

async function handleKirimMedia({ chatId, args, sock, msg, senderIsOwner }: CommandContext): Promise<void> {
  const input = (args || '').trim().toLowerCase();
  const rawText = (msg?.message?.conversation || msg?.message?.extendedTextMessage?.text || '').toLowerCase();

  // GATE: NSFW hanya owner
  if (!senderIsOwner) {
    await sock.sendMessage(chatId, { text: 'Maaf bang, konten NSFW cuma bisa diakses sama owner Bela. 😊' });
    return;
  }

  const isMemek = input.includes('memek') || input.includes('mmk') || rawText.includes('memek') || rawText.includes('mmk');
  const isSusu = input.includes('susu') || input.includes('tt') || rawText.includes('susu') || rawText.includes('paptt') || rawText.includes('papsusu');
  const isBugil = input.includes('bugil') || input.includes('bg') || input.includes('telanjang') || input.includes('baju') || rawText.includes('bugil') || rawText.includes('telanjang') || rawText.includes('baju');

  const countMatch = args?.match(/(\d+)/);
  const count = countMatch ? Math.min(parseInt(countMatch[1]), 10) : 1;

  if (isMemek) {
    await sendPapImages(chatId, sock, PAP_MEMEK_DIR, 'memek', count, msg);
    return;
  }

  if (isSusu) {
    await sendPapImages(chatId, sock, PAP_SUSU_DIR, 'susu', count, msg);
    return;
  }

  if (isBugil) {
    await sendPapImages(chatId, sock, PAP_BUGIL_DIR, 'bugil', count, msg);
    return;
  }

  const isPapCommand = input === 'pap' || input === 'papp' || input === 'paprandom' || rawText.includes('/pap');

  if (isPapCommand) {
    await sendPapImages(chatId, sock, PAP_DIR, 'biasa', count, msg);
    return;
  }

  if (input === 'gambar' || input === 'gambar random') {
    const randomFile = await getRandomFileFromDir(GAMBAR_DIR);
    if (!randomFile) {
      await sock.sendMessage(chatId, { text: 'Belum ada gambar di folder bang... 😅' });
      return;
    }
    const filePath = path.join(GAMBAR_DIR, randomFile);
    await sock.sendMessage(chatId, { image: { url: filePath }, caption: 'Gambar random buat bang! 🖼️' });
    return;
  }

  if (!input) {
    await sock.sendMessage(chatId, { text: 'Ketik /pap, /papmmk, /paptt, atau /papbugil' });
    return;
  }
}

export const kirimMediaCommand: CommandHandler = {
  commands: ['kirim-media', 'media', 'pap', 'papp', 'paprandom', 'gambar', 'pap memek', 'pap susu', 'pap bugil', 'papsusu', 'paptt', 'papmmk', 'papmk', 'papbugil', 'papbg', 'papmemek'],
  description: 'Kirim PAP random atau media dari folder.',
  permission: 'owner',
  run: (_sock, _message, ctx) => handleKirimMedia(ctx),
};