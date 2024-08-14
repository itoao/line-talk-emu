# Todo Example

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
wrangler d1 create todo

# ローカルでSQL実行
wrangler d1 execute todo --local --file=todo.sql

# リモートでSQL実行
wrangler d1 execute todo --local --file=todo.sql
```

Dev:

```
npm run dev
```

Deploy:

```
npm run deploy
```

## Author

Yusuke Wada

## License

MIT