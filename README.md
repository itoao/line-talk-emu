# LINE Talk History Backup App ♻️

<img src="https://github.com/user-attachments/assets/269fdb4f-c3a1-4d71-94e6-ec13137c90a9" width="800">
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

# Execute SQL locally
wrangler d1 execute line-talk-emu --local --file=line-talk-emu.sql

# Execute SQL remotely
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
