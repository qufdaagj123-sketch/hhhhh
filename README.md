# MultiBot — Panel + 200+ lệnh

1. Dán **bot token** trên web → Start  
2. Bot online với prefix `!`  
3. Trên Discord: `!help` xem toàn bộ lệnh  

## Chạy

```bash
cd multi-bot
npm install
npm start
```

http://localhost:3000

## Intent cần bật

- Message Content Intent  
- Server Members Intent (một số lệnh mod)  

## Nhóm lệnh chính

- **util**: ping, help, info, serverinfo, userinfo, avatar, poll…  
- **mod**: ban, kick, mute, clear, lock, unlock, role, channel…  
- **fun**: coinflip, dice, 8ball, ship…  
- **extra**: rất nhiều lệnh tiện ích / alias  

Một số lệnh extra là bản rút gọn (trả embed mô tả). Lệnh mod/util/fun cốt lõi có logic đầy đủ và check quyền.

## Bảo mật

Chỉ chạy trên máy/VPS của bạn. Không public panel + token.
