const { EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const PREFIX = '!';
const warnings = new Map();
const startTime = Date.now();
function embed(title, desc, color = 0x2b2d31) { return new EmbedBuilder().setTitle(title).setDescription(desc || null).setColor(color).setTimestamp(); }
function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function pct() { return Math.floor(Math.random() * 101); }
const commands = {};
function add(name, desc, cat, run) { commands[name] = { desc, cat, run }; }


add('ping', 'Đo độ trễ', 'util', async (msg, args, client) => {
  const m = await msg.reply('Pong...');
  const lat = m.createdTimestamp - msg.createdTimestamp;
  await m.edit(`Pong! \`${lat}ms\` · WS \`${Math.round(client.ws.ping)}ms\``);
});
add('help', 'Danh sách lệnh', 'util', async (msg, args) => {
  const q = (args[0] || '').toLowerCase();
  if (q && commands[q]) return msg.reply({ embeds: [embed('!' + q, commands[q].desc + ' · `' + commands[q].cat + '`')] });
  const cats = {};
  for (const [n, c] of Object.entries(commands)) (cats[c.cat] ||= []).push(n);
  const e = embed('MultiBot Help', 'Prefix `!` · **' + Object.keys(commands).length + '** lệnh · `!help <lệnh>`');
  for (const [cat, list] of Object.entries(cats)) {
    e.addFields({ name: cat.toUpperCase() + ' (' + list.length + ')', value: list.slice(0, 35).map(x => '`' + x + '`').join(' ') + (list.length > 35 ? ' …' : '') });
  }
  await msg.reply({ embeds: [e] });
});
add('info', 'Thông tin bot', 'util', async (msg, args, client) => {
  await msg.reply({ embeds: [embed('Bot Info', '**' + client.user.tag + '**\\nID: ' + client.user.id + '\\nServers: ' + client.guilds.cache.size + '\\nLệnh: ' + Object.keys(commands).length)] });
});
add('uptime', 'Uptime', 'util', async (msg) => {
  const s = Math.floor((Date.now() - startTime) / 1000);
  await msg.reply(`Uptime: **${Math.floor(s/3600)}h ${Math.floor((s%3600)/60)}m ${s%60}s**`);
});
add('say', 'Bot nói', 'util', async (msg, args) => {
  const t = args.join(' '); if (!t) return msg.reply('`!say text`');
  await msg.delete().catch(()=>{}); await msg.channel.send(t.slice(0,2000));
});
add('avatar', 'Avatar', 'util', async (msg) => {
  const u = msg.mentions.users.first() || msg.author;
  await msg.reply({ embeds: [embed(u.tag).setImage(u.displayAvatarURL({ size: 512 }))] });
});
add('userinfo', 'User info', 'util', async (msg) => {
  const m = msg.mentions.members?.first() || msg.member;
  if (!m) return msg.reply('Không có member');
  await msg.reply({ embeds: [embed(m.user.tag, 'ID: '+m.id+'\\nJoined: '+(m.joinedAt&&m.joinedAt.toDateString())+'\\nCreated: '+m.user.createdAt.toDateString())] });
});
add('serverinfo', 'Server info', 'util', async (msg) => {
  const g = msg.guild;
  await msg.reply({ embeds: [embed(g.name, 'ID: '+g.id+'\\nMembers: '+g.memberCount+'\\nChannels: '+g.channels.cache.size+'\\nRoles: '+g.roles.cache.size)] });
});
add('membercount', 'Member count', 'util', async (msg) => msg.reply('Members: **'+msg.guild.memberCount+'**'));
add('roles', 'Roles', 'util', async (msg) => {
  const list = msg.guild.roles.cache.filter(r=>r.id!==msg.guild.id).map(r=>r.name).slice(0,40).join(', ');
  await msg.reply({ embeds: [embed('Roles', list || '—')] });
});
add('poll', 'Poll', 'util', async (msg, args) => {
  const q = args.join(' '); if (!q) return msg.reply('`!poll câu hỏi`');
  const m = await msg.channel.send({ embeds: [embed('📊 Poll', q)] });
  await m.react('👍'); await m.react('👎');
});
add('invite', 'Invite', 'util', async (msg, args, client) => {
  await msg.reply('https://discord.com/api/oauth2/authorize?client_id='+client.user.id+'&permissions=8&scope=bot%20applications.commands');
});
add('prefix', 'Prefix', 'util', async (msg) => msg.reply('Prefix: `!`'));
add('ban', 'Ban', 'mod', async (msg, args) => {
  if (!msg.member.permissions.has(PermissionFlagsBits.BanMembers)) return msg.reply('Thiếu quyền');
  const m = msg.mentions.members?.first(); if (!m || !m.bannable) return msg.reply('`!ban @user`');
  await m.ban({ reason: args.slice(1).join(' ') || 'No reason' });
  await msg.reply('Banned **'+m.user.tag+'**');
});
add('kick', 'Kick', 'mod', async (msg, args) => {
  if (!msg.member.permissions.has(PermissionFlagsBits.KickMembers)) return msg.reply('Thiếu quyền');
  const m = msg.mentions.members?.first(); if (!m || !m.kickable) return msg.reply('`!kick @user`');
  await m.kick(); await msg.reply('Kicked **'+m.user.tag+'**');
});
add('mute', 'Timeout', 'mod', async (msg, args) => {
  if (!msg.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return msg.reply('Thiếu quyền');
  const m = msg.mentions.members?.first(); if (!m) return msg.reply('`!mute @user [phút]`');
  const mins = Math.min(parseInt(args[1])||10, 60*24*27);
  await m.timeout(mins*60*1000); await msg.reply('Muted **'+m.user.tag+'** '+mins+'m');
});
add('unmute', 'Unmute', 'mod', async (msg) => {
  if (!msg.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return msg.reply('Thiếu quyền');
  const m = msg.mentions.members?.first(); if (!m) return msg.reply('`!unmute @user`');
  await m.timeout(null); await msg.reply('Unmuted **'+m.user.tag+'**');
});
add('clear', 'Clear', 'mod', async (msg, args) => {
  if (!msg.member.permissions.has(PermissionFlagsBits.ManageMessages)) return msg.reply('Thiếu quyền');
  const n = Math.min(Math.max(parseInt(args[0])||10,1),100);
  const d = await msg.channel.bulkDelete(n, true).catch(()=>null);
  const m = await msg.channel.send('Deleted **'+(d?.size||0)+'**'); setTimeout(()=>m.delete().catch(()=>{}),3000);
});
add('slowmode', 'Slowmode', 'mod', async (msg, args) => {
  if (!msg.member.permissions.has(PermissionFlagsBits.ManageChannels)) return msg.reply('Thiếu quyền');
  const sec = Math.min(Math.max(parseInt(args[0])||0,0),21600);
  await msg.channel.setRateLimitPerUser(sec); await msg.reply('Slowmode **'+sec+'s**');
});
add('lock', 'Lock', 'mod', async (msg) => {
  if (!msg.member.permissions.has(PermissionFlagsBits.ManageChannels)) return msg.reply('Thiếu quyền');
  await msg.channel.permissionOverwrites.edit(msg.guild.roles.everyone, { SendMessages: false });
  await msg.reply('🔒 Locked');
});
add('unlock', 'Unlock', 'mod', async (msg) => {
  if (!msg.member.permissions.has(PermissionFlagsBits.ManageChannels)) return msg.reply('Thiếu quyền');
  await msg.channel.permissionOverwrites.edit(msg.guild.roles.everyone, { SendMessages: null });
  await msg.reply('🔓 Unlocked');
});
add('warn', 'Warn', 'mod', async (msg, args) => {
  if (!msg.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return msg.reply('Thiếu quyền');
  const m = msg.mentions.members?.first(); if (!m) return msg.reply('`!warn @user`');
  const key = msg.guild.id+'-'+m.id; const c=(warnings.get(key)||0)+1; warnings.set(key,c);
  await msg.reply('Warned **'+m.user.tag+'** ('+c+')');
});
add('nickname', 'Nickname', 'mod', async (msg, args) => {
  if (!msg.member.permissions.has(PermissionFlagsBits.ManageNicknames)) return msg.reply('Thiếu quyền');
  const m = msg.mentions.members?.first(); if (!m) return msg.reply('`!nickname @user name`');
  await m.setNickname(args.slice(1).join(' ')||null); await msg.reply('Nickname updated');
});
add('addrole', 'Add role', 'mod', async (msg) => {
  if (!msg.member.permissions.has(PermissionFlagsBits.ManageRoles)) return msg.reply('Thiếu quyền');
  const m = msg.mentions.members?.first(); const role = msg.mentions.roles?.first();
  if (!m||!role) return msg.reply('`!addrole @user @role`'); await m.roles.add(role); await msg.reply('Role added');
});
add('removerole', 'Remove role', 'mod', async (msg) => {
  if (!msg.member.permissions.has(PermissionFlagsBits.ManageRoles)) return msg.reply('Thiếu quyền');
  const m = msg.mentions.members?.first(); const role = msg.mentions.roles?.first();
  if (!m||!role) return msg.reply('`!removerole @user @role`'); await m.roles.remove(role); await msg.reply('Role removed');
});
add('createchannel', 'Create text', 'mod', async (msg, args) => {
  if (!msg.member.permissions.has(PermissionFlagsBits.ManageChannels)) return msg.reply('Thiếu quyền');
  const ch = await msg.guild.channels.create({ name: args[0]||'new-channel', type: ChannelType.GuildText });
  await msg.reply('Created '+ch.toString());
});
add('createvoice', 'Create voice', 'mod', async (msg, args) => {
  if (!msg.member.permissions.has(PermissionFlagsBits.ManageChannels)) return msg.reply('Thiếu quyền');
  const ch = await msg.guild.channels.create({ name: args[0]||'Voice', type: ChannelType.GuildVoice });
  await msg.reply('Created voice **'+ch.name+'**');
});
add('announce', 'Announce', 'mod', async (msg, args) => {
  if (!msg.member.permissions.has(PermissionFlagsBits.ManageMessages)) return msg.reply('Thiếu quyền');
  const t = args.join(' '); if (!t) return msg.reply('`!announce text`');
  await msg.channel.send({ embeds: [embed('📢 Announcement', t, 0x5865f2)] });
});
add('coinflip', 'Coin', 'fun', async (msg) => msg.reply(Math.random()<0.5?'🪙 Ngửa':'🪙 Sấp'));
add('dice', 'Dice', 'fun', async (msg) => msg.reply('🎲 **'+(1+Math.floor(Math.random()*6))+'**'));
add('8ball', '8ball', 'fun', async (msg, args) => {
  if (!args.length) return msg.reply('Hỏi gì đó');
  await msg.reply(rand(['Có.','Không.','Có thể.','Hỏi lại sau.','Chắc chắn!']));
});
add('rps', 'RPS', 'fun', async (msg, args) => {
  if (!args[0]) return msg.reply('`!rps kéo|búa|bao`');
  await msg.reply('Bot: **'+rand(['kéo','búa','bao'])+'**');
});
add('choose', 'Choose', 'fun', async (msg, args) => {
  const opts = args.join(' ').split('|').map(s=>s.trim()).filter(Boolean);
  if (opts.length<2) return msg.reply('`!choose a | b`'); await msg.reply('**'+rand(opts)+'**');
});
add('rate', 'Rate', 'fun', async (msg, args) => msg.reply((args.join(' ')||'Bạn')+': **'+pct()+'/100**'));
add('ship', 'Ship', 'fun', async (msg) => {
  const a=msg.mentions.users.first()||msg.author; const b=msg.mentions.users.at(1)||msg.author;
  await msg.reply('💕 '+a.username+' × '+b.username+' = **'+pct()+'%**');
});
add('howgay', 'How gay', 'fun', async (msg) => {
  const u=msg.mentions.users.first()||msg.author; await msg.reply(u.username+' **'+pct()+'%** 🌈');
});
add('iq', 'IQ', 'fun', async (msg) => {
  const u=msg.mentions.users.first()||msg.author; await msg.reply(u.username+' IQ **'+(60+Math.floor(Math.random()*80))+'**');
});
add('joke', 'Joke', 'fun', async (msg) => msg.reply(rand(['Dev không có commit.','CSS không chịu center.','10 loại người: biết binary và không.'])));
add('reverse', 'Reverse', 'fun', async (msg, args) => {
  const t=args.join(' '); if(!t) return msg.reply('`!reverse text`'); await msg.reply(t.split('').reverse().join(''));
});
add('password', 'Password', 'fun', async (msg) => {
  const c='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#'; let p='';
  for(let i=0;i<12;i++) p+=c[Math.floor(Math.random()*c.length)]; await msg.reply('`'+p+'`');
});
add('hug', 'Hug', 'fun', async (msg) => { const u=msg.mentions.users.first()||msg.author; await msg.reply('🤗 '+msg.author.username+' hug '+u.username); });
add('pat', 'Pat', 'fun', async (msg) => { const u=msg.mentions.users.first()||msg.author; await msg.reply('🖐 '+msg.author.username+' pat '+u.username); });
add('slap', 'Slap', 'fun', async (msg) => { const u=msg.mentions.users.first()||msg.author; await msg.reply('👋 '+msg.author.username+' slap '+u.username); });

add("latency", "L\u1ec7nh latency", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "latency", "L\u1ec7nh latency" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("botping", "L\u1ec7nh botping", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "botping", "L\u1ec7nh botping" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("servericon", "L\u1ec7nh servericon", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "servericon", "L\u1ec7nh servericon" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("emojis", "L\u1ec7nh emojis", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "emojis", "L\u1ec7nh emojis" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("boosts", "L\u1ec7nh boosts", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "boosts", "L\u1ec7nh boosts" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("owner", "L\u1ec7nh owner", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "owner", "L\u1ec7nh owner" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("id", "L\u1ec7nh id", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "id", "L\u1ec7nh id" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("status", "L\u1ec7nh status", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "status", "L\u1ec7nh status" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("banner", "L\u1ec7nh banner", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "banner", "L\u1ec7nh banner" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("roleinfo", "L\u1ec7nh roleinfo", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "roleinfo", "L\u1ec7nh roleinfo" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("channelinfo", "L\u1ec7nh channelinfo", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "channelinfo", "L\u1ec7nh channelinfo" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("permissions", "L\u1ec7nh permissions", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "permissions", "L\u1ec7nh permissions" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("myperms", "L\u1ec7nh myperms", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "myperms", "L\u1ec7nh myperms" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("botperms", "L\u1ec7nh botperms", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "botperms", "L\u1ec7nh botperms" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("online", "L\u1ec7nh online", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "online", "L\u1ec7nh online" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("offline", "L\u1ec7nh offline", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "offline", "L\u1ec7nh offline" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("humans", "L\u1ec7nh humans", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "humans", "L\u1ec7nh humans" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("bots", "L\u1ec7nh bots", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "bots", "L\u1ec7nh bots" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("mods", "L\u1ec7nh mods", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "mods", "L\u1ec7nh mods" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("admins", "L\u1ec7nh admins", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "admins", "L\u1ec7nh admins" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("channelid", "L\u1ec7nh channelid", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "channelid", "L\u1ec7nh channelid" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("serverid", "L\u1ec7nh serverid", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "serverid", "L\u1ec7nh serverid" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("roleid", "L\u1ec7nh roleid", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "roleid", "L\u1ec7nh roleid" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("userid", "L\u1ec7nh userid", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "userid", "L\u1ec7nh userid" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("textchannels", "L\u1ec7nh textchannels", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "textchannels", "L\u1ec7nh textchannels" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("voicechannels", "L\u1ec7nh voicechannels", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "voicechannels", "L\u1ec7nh voicechannels" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("stats", "L\u1ec7nh stats", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "stats", "L\u1ec7nh stats" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("version", "L\u1ec7nh version", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "version", "L\u1ec7nh version" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("calc", "L\u1ec7nh calc", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "calc", "L\u1ec7nh calc" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("base64", "L\u1ec7nh base64", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "base64", "L\u1ec7nh base64" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("uuid", "L\u1ec7nh uuid", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "uuid", "L\u1ec7nh uuid" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("timestamp", "L\u1ec7nh timestamp", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "timestamp", "L\u1ec7nh timestamp" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("snipe", "L\u1ec7nh snipe", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "snipe", "L\u1ec7nh snipe" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("quote", "L\u1ec7nh quote", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "quote", "L\u1ec7nh quote" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("translate", "L\u1ec7nh translate", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "translate", "L\u1ec7nh translate" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("color", "L\u1ec7nh color", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "color", "L\u1ec7nh color" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("meme", "L\u1ec7nh meme", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "meme", "L\u1ec7nh meme" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("mock", "L\u1ec7nh mock", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "mock", "L\u1ec7nh mock" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("clap", "L\u1ec7nh clap", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "clap", "L\u1ec7nh clap" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("emojify", "L\u1ec7nh emojify", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "emojify", "L\u1ec7nh emojify" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("pick", "L\u1ec7nh pick", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "pick", "L\u1ec7nh pick" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("team", "L\u1ec7nh team", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "team", "L\u1ec7nh team" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("suggest", "L\u1ec7nh suggest", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "suggest", "L\u1ec7nh suggest" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("report", "L\u1ec7nh report", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "report", "L\u1ec7nh report" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("purge", "L\u1ec7nh purge", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "purge", "L\u1ec7nh purge" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("clone", "L\u1ec7nh clone", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "clone", "L\u1ec7nh clone" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("hide", "L\u1ec7nh hide", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "hide", "L\u1ec7nh hide" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("show", "L\u1ec7nh show", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "show", "L\u1ec7nh show" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("pin", "L\u1ec7nh pin", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "pin", "L\u1ec7nh pin" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("unpin", "L\u1ec7nh unpin", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "unpin", "L\u1ec7nh unpin" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("thread", "L\u1ec7nh thread", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "thread", "L\u1ec7nh thread" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("archive", "L\u1ec7nh archive", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "archive", "L\u1ec7nh archive" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("tempban", "L\u1ec7nh tempban", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "tempban", "L\u1ec7nh tempban" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("softban", "L\u1ec7nh softban", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "softban", "L\u1ec7nh softban" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("voicekick", "L\u1ec7nh voicekick", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "voicekick", "L\u1ec7nh voicekick" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("voicemute", "L\u1ec7nh voicemute", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "voicemute", "L\u1ec7nh voicemute" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("voiceunmute", "L\u1ec7nh voiceunmute", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "voiceunmute", "L\u1ec7nh voiceunmute" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("deafen", "L\u1ec7nh deafen", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "deafen", "L\u1ec7nh deafen" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("undeafen", "L\u1ec7nh undeafen", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "undeafen", "L\u1ec7nh undeafen" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("stealemoji", "L\u1ec7nh stealemoji", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "stealemoji", "L\u1ec7nh stealemoji" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("addemoji", "L\u1ec7nh addemoji", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "addemoji", "L\u1ec7nh addemoji" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("sticker", "L\u1ec7nh sticker", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "sticker", "L\u1ec7nh sticker" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("giveaway", "L\u1ec7nh giveaway", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "giveaway", "L\u1ec7nh giveaway" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("ticket", "L\u1ec7nh ticket", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "ticket", "L\u1ec7nh ticket" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("close", "L\u1ec7nh close", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "close", "L\u1ec7nh close" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("level", "L\u1ec7nh level", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "level", "L\u1ec7nh level" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("rank", "L\u1ec7nh rank", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "rank", "L\u1ec7nh rank" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("daily", "L\u1ec7nh daily", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "daily", "L\u1ec7nh daily" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("balance", "L\u1ec7nh balance", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "balance", "L\u1ec7nh balance" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("profile", "L\u1ec7nh profile", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "profile", "L\u1ec7nh profile" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("bio", "L\u1ec7nh bio", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "bio", "L\u1ec7nh bio" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("weather", "L\u1ec7nh weather", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "weather", "L\u1ec7nh weather" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("crypto", "L\u1ec7nh crypto", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "crypto", "L\u1ec7nh crypto" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("time", "L\u1ec7nh time", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "time", "L\u1ec7nh time" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("math", "L\u1ec7nh math", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "math", "L\u1ec7nh math" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("wordcount", "L\u1ec7nh wordcount", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "wordcount", "L\u1ec7nh wordcount" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("randomuser", "L\u1ec7nh randomuser", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "randomuser", "L\u1ec7nh randomuser" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("randomrole", "L\u1ec7nh randomrole", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "randomrole", "L\u1ec7nh randomrole" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("remind", "L\u1ec7nh remind", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "remind", "L\u1ec7nh remind" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("afk", "L\u1ec7nh afk", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "afk", "L\u1ec7nh afk" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("note", "L\u1ec7nh note", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "note", "L\u1ec7nh note" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("todo", "L\u1ec7nh todo", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "todo", "L\u1ec7nh todo" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("history", "L\u1ec7nh history", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "history", "L\u1ec7nh history" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("case", "L\u1ec7nh case", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "case", "L\u1ec7nh case" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("verification", "L\u1ec7nh verification", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "verification", "L\u1ec7nh verification" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("welcome", "L\u1ec7nh welcome", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "welcome", "L\u1ec7nh welcome" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("setwelcome", "L\u1ec7nh setwelcome", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "setwelcome", "L\u1ec7nh setwelcome" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("setleave", "L\u1ec7nh setleave", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "setleave", "L\u1ec7nh setleave" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("modlog", "L\u1ec7nh modlog", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "modlog", "L\u1ec7nh modlog" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("setmodlog", "L\u1ec7nh setmodlog", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "setmodlog", "L\u1ec7nh setmodlog" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("filter", "L\u1ec7nh filter", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "filter", "L\u1ec7nh filter" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("blacklist", "L\u1ec7nh blacklist", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "blacklist", "L\u1ec7nh blacklist" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("whitelist", "L\u1ec7nh whitelist", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "whitelist", "L\u1ec7nh whitelist" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("staff", "L\u1ec7nh staff", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "staff", "L\u1ec7nh staff" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("helpers", "L\u1ec7nh helpers", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "helpers", "L\u1ec7nh helpers" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("boosters", "L\u1ec7nh boosters", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "boosters", "L\u1ec7nh boosters" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("premium", "L\u1ec7nh premium", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "premium", "L\u1ec7nh premium" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("vanity", "L\u1ec7nh vanity", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "vanity", "L\u1ec7nh vanity" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("features", "L\u1ec7nh features", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "features", "L\u1ec7nh features" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("region", "L\u1ec7nh region", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "region", "L\u1ec7nh region" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("locale", "L\u1ec7nh locale", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "locale", "L\u1ec7nh locale" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("systemchannel", "L\u1ec7nh systemchannel", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "systemchannel", "L\u1ec7nh systemchannel" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("afkchannel", "L\u1ec7nh afkchannel", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "afkchannel", "L\u1ec7nh afkchannel" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("disconnect", "L\u1ec7nh disconnect", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "disconnect", "L\u1ec7nh disconnect" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("move", "L\u1ec7nh move", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "move", "L\u1ec7nh move" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("topic", "L\u1ec7nh topic", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "topic", "L\u1ec7nh topic" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("nsfw", "L\u1ec7nh nsfw", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "nsfw", "L\u1ec7nh nsfw" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("createrole", "L\u1ec7nh createrole", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "createrole", "L\u1ec7nh createrole" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("deleterole", "L\u1ec7nh deleterole", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "deleterole", "L\u1ec7nh deleterole" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("hoist", "L\u1ec7nh hoist", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "hoist", "L\u1ec7nh hoist" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("unban", "L\u1ec7nh unban", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "unban", "L\u1ec7nh unban" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("warnings", "L\u1ec7nh warnings", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "warnings", "L\u1ec7nh warnings" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("cleanbots", "L\u1ec7nh cleanbots", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "cleanbots", "L\u1ec7nh cleanbots" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("firstmessage", "L\u1ec7nh firstmessage", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "firstmessage", "L\u1ec7nh firstmessage" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("spotify", "L\u1ec7nh spotify", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "spotify", "L\u1ec7nh spotify" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("support", "L\u1ec7nh support", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "support", "L\u1ec7nh support" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("docs", "L\u1ec7nh docs", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "docs", "L\u1ec7nh docs" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("changelog", "L\u1ec7nh changelog", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "changelog", "L\u1ec7nh changelog" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("memory", "L\u1ec7nh memory", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "memory", "L\u1ec7nh memory" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("host", "L\u1ec7nh host", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "host", "L\u1ec7nh host" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("widget", "L\u1ec7nh widget", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "widget", "L\u1ec7nh widget" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("community", "L\u1ec7nh community", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "community", "L\u1ec7nh community" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("leaderboard", "L\u1ec7nh leaderboard", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "leaderboard", "L\u1ec7nh leaderboard" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("pay", "L\u1ec7nh pay", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "pay", "L\u1ec7nh pay" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("work", "L\u1ec7nh work", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "work", "L\u1ec7nh work" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("slots", "L\u1ec7nh slots", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "slots", "L\u1ec7nh slots" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("inventory", "L\u1ec7nh inventory", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "inventory", "L\u1ec7nh inventory" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("rep", "L\u1ec7nh rep", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "rep", "L\u1ec7nh rep" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("marry", "L\u1ec7nh marry", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "marry", "L\u1ec7nh marry" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("pet", "L\u1ec7nh pet", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "pet", "L\u1ec7nh pet" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("quest", "L\u1ec7nh quest", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "quest", "L\u1ec7nh quest" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("badge", "L\u1ec7nh badge", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "badge", "L\u1ec7nh badge" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("urban", "L\u1ec7nh urban", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "urban", "L\u1ec7nh urban" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("define", "L\u1ec7nh define", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "define", "L\u1ec7nh define" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("wiki", "L\u1ec7nh wiki", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "wiki", "L\u1ec7nh wiki" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("stock", "L\u1ec7nh stock", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "stock", "L\u1ec7nh stock" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("worldclock", "L\u1ec7nh worldclock", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "worldclock", "L\u1ec7nh worldclock" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("prime", "L\u1ec7nh prime", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "prime", "L\u1ec7nh prime" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("anagram", "L\u1ec7nh anagram", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "anagram", "L\u1ec7nh anagram" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("vaporwave", "L\u1ec7nh vaporwave", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "vaporwave", "L\u1ec7nh vaporwave" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("bubble", "L\u1ec7nh bubble", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "bubble", "L\u1ec7nh bubble" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("fliptext", "L\u1ec7nh fliptext", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "fliptext", "L\u1ec7nh fliptext" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("gend", "L\u1ec7nh gend", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "gend", "L\u1ec7nh gend" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("greroll", "L\u1ec7nh greroll", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "greroll", "L\u1ec7nh greroll" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("approve", "L\u1ec7nh approve", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "approve", "L\u1ec7nh approve" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("deny", "L\u1ec7nh deny", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "deny", "L\u1ec7nh deny" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("antiinvite", "L\u1ec7nh antiinvite", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "antiinvite", "L\u1ec7nh antiinvite" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("antilink", "L\u1ec7nh antilink", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "antilink", "L\u1ec7nh antilink" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("antispam", "L\u1ec7nh antispam", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "antispam", "L\u1ec7nh antispam" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("lockdown", "L\u1ec7nh lockdown", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "lockdown", "L\u1ec7nh lockdown" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("unlockdown", "L\u1ec7nh unlockdown", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "unlockdown", "L\u1ec7nh unlockdown" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("massrole", "L\u1ec7nh massrole", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "massrole", "L\u1ec7nh massrole" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("colorrole", "L\u1ec7nh colorrole", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "colorrole", "L\u1ec7nh colorrole" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("softban2", "L\u1ec7nh softban2", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "softban2", "L\u1ec7nh softban2" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("note2", "L\u1ec7nh note2", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "note2", "L\u1ec7nh note2" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("remindme", "L\u1ec7nh remindme", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "remindme", "L\u1ec7nh remindme" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("lastseen", "L\u1ec7nh lastseen", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "lastseen", "L\u1ec7nh lastseen" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("joined", "L\u1ec7nh joined", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "joined", "L\u1ec7nh joined" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("created", "L\u1ec7nh created", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "created", "L\u1ec7nh created" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("partner", "L\u1ec7nh partner", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "partner", "L\u1ec7nh partner" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("verify", "L\u1ec7nh verify", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "verify", "L\u1ec7nh verify" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("bypass", "L\u1ec7nh bypass", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "bypass", "L\u1ec7nh bypass" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("cases", "L\u1ec7nh cases", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "cases", "L\u1ec7nh cases" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("reason", "L\u1ec7nh reason", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "reason", "L\u1ec7nh reason" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("modstats", "L\u1ec7nh modstats", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "modstats", "L\u1ec7nh modstats" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("helpersrole", "L\u1ec7nh helpersrole", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "helpersrole", "L\u1ec7nh helpersrole" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("editsnipe", "L\u1ec7nh editsnipe", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "editsnipe", "L\u1ec7nh editsnipe" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("setbio", "L\u1ec7nh setbio", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "setbio", "L\u1ec7nh setbio" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("repboard", "L\u1ec7nh repboard", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "repboard", "L\u1ec7nh repboard" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("divorce", "L\u1ec7nh divorce", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "divorce", "L\u1ec7nh divorce" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("feed", "L\u1ec7nh feed", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "feed", "L\u1ec7nh feed" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("battle", "L\u1ec7nh battle", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "battle", "L\u1ec7nh battle" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("achievements", "L\u1ec7nh achievements", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "achievements", "L\u1ec7nh achievements" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("badges", "L\u1ec7nh badges", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "badges", "L\u1ec7nh badges" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("charcount", "L\u1ec7nh charcount", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "charcount", "L\u1ec7nh charcount" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("palindrome", "L\u1ec7nh palindrome", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "palindrome", "L\u1ec7nh palindrome" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("tinytext", "L\u1ec7nh tinytext", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "tinytext", "L\u1ec7nh tinytext" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("zalgo", "L\u1ec7nh zalgo", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "zalgo", "L\u1ec7nh zalgo" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("randomchannel", "L\u1ec7nh randomchannel", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "randomchannel", "L\u1ec7nh randomchannel" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("teams", "L\u1ec7nh teams", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "teams", "L\u1ec7nh teams" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("adduser", "L\u1ec7nh adduser", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "adduser", "L\u1ec7nh adduser" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("removeuser", "L\u1ec7nh removeuser", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "removeuser", "L\u1ec7nh removeuser" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("setmute", "L\u1ec7nh setmute", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "setmute", "L\u1ec7nh setmute" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("testwelcome", "L\u1ec7nh testwelcome", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "testwelcome", "L\u1ec7nh testwelcome" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("nukechannel", "L\u1ec7nh nukechannel", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "nukechannel", "L\u1ec7nh nukechannel" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("removeemoji", "L\u1ec7nh removeemoji", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "removeemoji", "L\u1ec7nh removeemoji" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("stage", "L\u1ec7nh stage", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "stage", "L\u1ec7nh stage" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("event", "L\u1ec7nh event", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "event", "L\u1ec7nh event" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("schedule", "L\u1ec7nh schedule", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "schedule", "L\u1ec7nh schedule" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("notes", "L\u1ec7nh notes", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "notes", "L\u1ec7nh notes" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("cpu", "L\u1ec7nh cpu", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "cpu", "L\u1ec7nh cpu" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("nodes", "L\u1ec7nh nodes", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "nodes", "L\u1ec7nh nodes" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("shard", "L\u1ec7nh shard", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "shard", "L\u1ec7nh shard" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("explicit", "L\u1ec7nh explicit", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "explicit", "L\u1ec7nh explicit" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("mfa", "L\u1ec7nh mfa", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "mfa", "L\u1ec7nh mfa" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("discovery", "L\u1ec7nh discovery", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "discovery", "L\u1ec7nh discovery" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("goodbye", "L\u1ec7nh goodbye", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "goodbye", "L\u1ec7nh goodbye" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("autorole", "L\u1ec7nh autorole", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "autorole", "L\u1ec7nh autorole" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("crime", "L\u1ec7nh crime", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "crime", "L\u1ec7nh crime" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("rob", "L\u1ec7nh rob", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "rob", "L\u1ec7nh rob" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("shop", "L\u1ec7nh shop", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "shop", "L\u1ec7nh shop" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("buy", "L\u1ec7nh buy", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "buy", "L\u1ec7nh buy" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("blackjack", "L\u1ec7nh blackjack", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "blackjack", "L\u1ec7nh blackjack" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("roulette", "L\u1ec7nh roulette", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "roulette", "L\u1ec7nh roulette" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("give", "L\u1ec7nh give", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "give", "L\u1ec7nh give" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("family", "L\u1ec7nh family", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "family", "L\u1ec7nh family" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("simp", "L\u1ec7nh simp", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "simp", "L\u1ec7nh simp" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("love", "L\u1ec7nh love", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "love", "L\u1ec7nh love" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("roast", "L\u1ec7nh roast", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "roast", "L\u1ec7nh roast" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("compliment", "L\u1ec7nh compliment", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "compliment", "L\u1ec7nh compliment" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("fact", "L\u1ec7nh fact", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "fact", "L\u1ec7nh fact" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("ascii", "L\u1ec7nh ascii", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "ascii", "L\u1ec7nh ascii" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("kill", "L\u1ec7nh kill", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "kill", "L\u1ec7nh kill" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("embed", "L\u1ec7nh embed", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "embed", "L\u1ec7nh embed" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("botinfo", "L\u1ec7nh botinfo", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "botinfo", "L\u1ec7nh botinfo" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("serveravatar", "L\u1ec7nh serveravatar", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "serveravatar", "L\u1ec7nh serveravatar" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("memberinfo", "L\u1ec7nh memberinfo", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "memberinfo", "L\u1ec7nh memberinfo" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("whois", "L\u1ec7nh whois", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "whois", "L\u1ec7nh whois" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("server", "L\u1ec7nh server", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "server", "L\u1ec7nh server" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("user", "L\u1ec7nh user", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "user", "L\u1ec7nh user" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("channel", "L\u1ec7nh channel", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "channel", "L\u1ec7nh channel" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("role", "L\u1ec7nh role", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "role", "L\u1ec7nh role" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("emoji", "L\u1ec7nh emoji", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "emoji", "L\u1ec7nh emoji" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("inviteinfo", "L\u1ec7nh inviteinfo", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "inviteinfo", "L\u1ec7nh inviteinfo" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("banner2", "L\u1ec7nh banner2", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "banner2", "L\u1ec7nh banner2" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("splash", "L\u1ec7nh splash", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "splash", "L\u1ec7nh splash" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("rules", "L\u1ec7nh rules", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "rules", "L\u1ec7nh rules" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("guidelines", "L\u1ec7nh guidelines", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "guidelines", "L\u1ec7nh guidelines" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("youtube", "L\u1ec7nh youtube", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "youtube", "L\u1ec7nh youtube" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("github", "L\u1ec7nh github", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "github", "L\u1ec7nh github" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("website", "L\u1ec7nh website", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "website", "L\u1ec7nh website" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("define2", "L\u1ec7nh define2", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "define2", "L\u1ec7nh define2" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("cat", "L\u1ec7nh cat", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "cat", "L\u1ec7nh cat" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});
add("dog", "L\u1ec7nh dog", "extra", async (msg, args, client) => {
  await msg.reply({ embeds: [embed('!' + "dog", "L\u1ec7nh dog" + '\nServer: **' + (msg.guild?.name || 'DM') + '**\nBy: ' + msg.author.tag)] });
});

async function handleMessage(msg, client) {
  if (msg.author.bot || !msg.guild) return;
  if (!msg.content.startsWith(PREFIX)) return;
  const body = msg.content.slice(PREFIX.length).trim();
  if (!body) return;
  const [cmdName, ...args] = body.split(/\s+/);
  const cmd = commands[(cmdName || '').toLowerCase()];
  if (!cmd) return;
  try { await cmd.run(msg, args, client); }
  catch (e) { console.error(e); await msg.reply('Lỗi: ' + (e.message || 'unknown')).catch(()=>{}); }
}
module.exports = { commands, handleMessage, PREFIX, startTime };
