import { Hono } from 'hono'
import { renderer, AddTodo, Item, TalkEmulator } from './components'
import { parseTalkTxt } from './parser'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('*', renderer)


app.get('/', async (c) => {
  // const { results } = await c.env.DB.prepare(`SELECT id, title FROM todo;`).all<Todo>()
  // const todos = results

  return c.render(
    <div>
      <TalkEmulator />
    </div>
  )
})

app.post('/parse', async (c) => {
  const formData = await c.req.formData()
  const file = formData.get('talkFile') as unknown as File
  const content = await file.text()
  const talk = parseTalkTxt(content)

  return c.html(<TalkEmulator talk={talk} />)
})

export default app