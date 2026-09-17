/**
 * MultiBot Panel — dán token bot, chạy online, 200+ lệnh
 * npm install && npm start → http://localhost:3000
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const {
  Client,
  GatewayIntentBits,
  Partials,
  ActivityType
} = require('discord.js');
const { handleMessage, commands, PREFIX } = require('./bot/commands');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

let client = null;
let botInfo = null;
const logs = [];
const sseClients = new Set();

function pushLog(type, text) {
  const entry = { type, text: String(text), time: Date.now() };
  logs.push(entry);
  if (logs.length > 250) logs.shift();
  const payload = `data: ${JSON.stringify(entry)}\n\n`;
  for (const res of sseClients) {
    try { res.write(payload); } catch {}
  }
}

function destroyClient() {
  if (client) {
    try { client.destroy(); } catch {}
    client = null;
  }
  botInfo = null;
}

async function startBot(token) {
  destroyClient();
  client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildModeration
    ],
    partials: [Partials.Channel]
  });

  client.once('ready', () => {
    botInfo = {
      tag: client.user.tag,
      id: client.user.id,
      avatar: client.user.displayAvatarURL({ size: 128 }),
      guilds: client.guilds.cache.size,
      commands: Object.keys(commands).length
    };
    try {
      client.user.setActivity(`${PREFIX}help | ${Object.keys(commands).length} cmds`, {
        type: ActivityType.Listening
      });
    } catch {}
    pushLog('ok', `Online: ${client.user.tag} · ${Object.keys(commands).length} lệnh`);
  });

  client.on('messageCreate', (msg) => handleMessage(msg, client));
  client.on('error', (e) => pushLog('err', e.message));

  await client.login(token);
}

app.get('/api/status', (req, res) => {
  res.json({
    running: !!(client && client.isReady()),
    bot: botInfo,
    commandCount: Object.keys(commands).length,
    prefix: PREFIX
  });
});

app.get('/api/commands', (req, res) => {
  const list = Object.entries(commands).map(([name, c]) => ({
    name, desc: c.desc, cat: c.cat
  }));
  res.json(list);
});

app.get('/api/logs', (req, res) => res.json(logs));

app.get('/api/logs/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  logs.slice(-40).forEach(e => res.write(`data: ${JSON.stringify(e)}\n\n`));
  sseClients.add(res);
  req.on('close', () => sseClients.delete(res));
});

app.post('/api/start', async (req, res) => {
  const token = (req.body.token || '').trim();
  if (!token || token.length < 50) {
    return res.status(400).json({ error: 'Token không hợp lệ' });
  }
  if (client && client.isReady()) {
    return res.status(400).json({ error: 'Bot đang chạy' });
  }
  pushLog('sys', 'Đang login...');
  try {
    await startBot(token);
    res.json({ success: true });
  } catch (e) {
    destroyClient();
    pushLog('err', 'Login fail: ' + e.message);
    res.status(401).json({
      error: 'Token sai hoặc thiếu Intent (Message Content / Members).'
    });
  }
});

app.post('/api/stop', (req, res) => {
  if (!client) return res.status(400).json({ error: 'Bot không chạy' });
  destroyClient();
  pushLog('sys', 'Đã stop');
  res.json({ success: true });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\nMultiBot → http://localhost:${PORT}`);
  console.log(`Commands loaded: ${Object.keys(commands).length}\n`);
});
