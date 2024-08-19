# LINEトーク履歴バックアップアプリ
![todo line-talk-emu workers dev_](https://github.com/user-attachments/assets/269fdb4f-c3a1-4d71-94e6-ec13137c90a9)

Stack:

* Hono
* JSX (Hono middleware)
* htmx
* Zod
* Cloudflare Workers
* Cloudflare D1

## Usage

Install:

```
npm install
```

Setup:

```
wrangler d1 delete line-talk-emu
wrangler d1 create line-talk-emu

# ローカルでSQL実行
wrangler d1 execute line-talk-emu --local --file=line-talk-emu.sql

# リモートでSQL実行
wrangler d1 execute line-talk-emu --remote --file=line-talk-emu.sql
```

Dev:

```
npm run dev
```

Deploy:

```
npm run deploy
```
