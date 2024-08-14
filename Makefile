start:
	wrangler d1 delete line-talk-emu
	wrangler d1 cryeate line-talk-emu
	wrangler d1 execute line-talk-emu --local --file=line-talk-emu.sql
	npm run dev

deploy:
	wrangler d1 execute line-talk-emu --remote --file=line-talk-emu.sql
	npm run deploy
