import { Hono } from 'hono'
import { renderer, TalkList, TalkEmulator, Header, AddTalkDialog, TalkDetail } from './components'
import { parseTalkTxt } from './parser'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('*', renderer)


app.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT id, partner, last_message_date FROM talk ORDER BY last_message_date DESC'
  ).all()

  const backupedTalks = results.map(talk => ({
    id: talk.id,
    partner: talk.partner,
    lastMessageDate: talk.last_message_date
  }))

  return c.render(
    <div>
      <Header />
      <TalkList talks={backupedTalks} />
    </div>
  )
})


app.get('/add-talk-dialog', (c) => {
  return c.html(<AddTalkDialog />)
})

app.get('/close-dialog', (c) => {
  return c.html('')
})

app.post('/add-talk', async (c) => {
  try {
    const body = await c.req.parseBody()
    const file = body.talkFile as File

    if (!file) {
      return c.text('ファイルが見つかりません', 400)
    }

    const content = await file.text()
    const talk = parseTalkTxt(content)

    // パートナー名が既に存在するかチェック
    const existingTalk = await c.env.DB.prepare(
      'SELECT id FROM talk WHERE partner = ?'
    ).bind(talk.partner).first()

    if (existingTalk) {
      return c.text('同じ名前のトークが既に存在します', 400)
    }

    const lastMessageDate = talk.messages[talk.messages.length - 1]?.date || ''

    // トランザクションの代わりにbatch()を使用してデータの一貫性を保証
    const db = c.env.DB
    try {
      const { id } = await db.prepare(
        'INSERT INTO talk (partner, last_message_date) VALUES (?, ?) RETURNING id'
      ).bind(talk.partner, lastMessageDate).first() as { id: number }

      // メッセージを1000件ずつに分割してアップロード
      const chunkSize = 1000
      for (let i = 0; i < talk.messages.length; i += chunkSize) {
        const chunk = talk.messages.slice(i, i + chunkSize)
        await db.batch(chunk.map(message =>
          db.prepare(
            'INSERT INTO message (talk_id, date, time, sender, content) VALUES (?, ?, ?, ?, ?)'
          ).bind(id, message.date, message.time, message.sender, message.content)
        ))
      }

      // 更新されたトークリストを取得
      const { results } = await c.env.DB.prepare(
        'SELECT id, partner, last_message_date FROM talk ORDER BY last_message_date DESC'
      ).all()

      // 更新されたトークリストを取得
      const updatedTalks = results.map(talk => ({
        id: talk.id as string,
        partner: talk.partner as string,
        lastMessageDate: talk.last_message_date as string
      }))

      return c.html(
        <>
          <TalkList talks={updatedTalks} />
        </>
      )
    } catch (error) {
      await db.prepare('ROLLBACK').run()
      console.error('データベース操作中にエラーが発生しました:', error)
      return c.text(`トークの追加中にエラーが発生しました: ${error.message}`, 500)
    }
  } catch (error) {
    console.error('トークの追加中にエラーが発生しました:', error)
    return c.text(`トークの追加中にエラーが発生しました: ${error.message}`, 500)
  }
})

// const talks: { id: string; partner: string; lastMessageDate: string }[] = []


app.post('/parse', async (c) => {
  const formData = await c.req.formData()
  const file = formData.get('talkFile') as unknown as File
  const content = await file.text()
  const talk = parseTalkTxt(content)

  const lastMessageDate = talk.messages[talk.messages.length - 1]?.date || ''

  const { id } = await c.env.DB.prepare(
    'INSERT INTO talk (partner, last_message_date) VALUES (?, ?) RETURNING id'
  )
  .bind(talk.partner, lastMessageDate)
  .first() as { id: number }

  for (const message of talk.messages) {
    await c.env.DB.prepare(
      'INSERT INTO message (talk_id, date, time, sender, content) VALUES (?, ?, ?, ?, ?)'
    )
    .bind(id, message.date, message.time, message.sender, message.content)
    .run()
  }

  return c.html(<TalkEmulator talk={talk} />)
})

app.post('/login', async (c) => {
  // モックのログイン処理
  return c.json({ success: true, message: 'ログインしました' })
})

app.post('/logout', async (c) => {
  // モックのログアウト処理
  return c.json({ success: true, message: 'ログアウトしました' })
})

app.get('/talk/:id', async (c) => {
  const id = c.req.param('id')
  const { results } = await c.env.DB.prepare(
    'SELECT t.partner, m.date, m.time, m.sender, m.content FROM talk t JOIN message m ON t.id = m.talk_id WHERE t.id = ? ORDER BY m.date, m.time'
  ).bind(id).all()

  if (results.length === 0) {
    return c.notFound()
  }

  const talk = {
    partner: results[0].partner,
    messages: results.map(m => ({
      date: m.date,
      time: m.time,
      sender: m.sender,
      content: m.content
    }))
  }


  return c.render(
    <div>
      <Header />
      <TalkDetail talk={talk} />
    </div>
  )
})

// app.get('/messages/:id', async (c) => {
//   const id = c.req.param('id')
//   const page = parseInt(c.req.query('page') || '0')
//   const messagesPerPage = 50 // 1ページあたりのメッセージ数を減らす
//   const offset = page * messagesPerPage

//   const { results } = await c.env.DB.prepare(
//     'SELECT date, time, sender, content FROM message WHERE talk_id = ? ORDER BY date, time LIMIT ? OFFSET ?'
//   ).bind(id, messagesPerPage, offset).all()

//   if (results.length === 0) {
//     return c.json({ messages: [] })
//   }

//   const messages = results.map(m => ({
//     date: m.date,
//     time: m.time,
//     sender: m.sender,
//     content: m.content
//   }))

//   return c.html(<MessageList messages={messages} page={page} talkId={id} />)
// })

export default app
