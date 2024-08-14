import { html } from 'hono/html'
import { FC } from 'hono/jsx'
import { jsxRenderer } from 'hono/jsx-renderer'

export const renderer = jsxRenderer(({ children }) => {
  return html`
    <!DOCTYPE html>
    <html lang="ja">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0" />
        <script src="https://unpkg.com/htmx.org@1.9.3"></script>
        <script src="https://unpkg.com/hyperscript.org@0.9.9"></script>
        <script src="https://cdn.tailwindcss.com"></script>
        <title>LINEトーク履歴バックアップ</title>
        <style>
          html, body {
            width: 100%;
            overflow-x: hidden;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          @media (max-width: 640px) {
            html {
              font-size: 14px;
            }
          }
        </style>
      </head>
      <body class="text-base">
        <div class="p-2 sm:p-4">
          ${children}
        </div>
      </body>
    </html>
  `
})

type Message = {
  date: string;
  time: string;
  sender: string;
  content: string;
}

type Talk = {
  partner: string;
  messages: Message[];
}

type TalkEmulatorProps = {
  talk?: Talk;
}

export const TalkEmulator: FC<TalkEmulatorProps> = ({ talk }) => {
  return (
    <div class="max-w-md mx-auto mt-8 p-4 bg-gray-100 rounded-lg">
      <FileUploadForm />
      <MessageList talk={talk} />
    </div>
  )
}

const FileUploadForm: FC = () => {
  console.log('ff');
  return (
    <form hx-post="/parse" hx-target="#messages" enctype="multipart/form-data">
      <input type="file" name="talkFile" accept=".txt" required />
      <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">
      バックアップ
    </button>
  </form>
  )
}

type MessageListProps = {
  talk: Talk;
}

const MessageList: FC<MessageListProps> = ({ talk }) => (
  <div id="messages" class="mt-4">
    {talk.messages.map((message, index) => (
      <MessageItem
        key={`${message.date}${message.time}${message.sender}${message.content}`}
        {...message}
        partner={talk.partner}
        isFirst={index === 0 || message.date !== talk.messages[index - 1].date}
      />
    ))}
  </div>
)

type MessageItemProps = {
  date: string;
  time: string;
  sender: string;
  content: string;
  partner: string;
  isFirst: boolean;
}

const getFormattedDate = (date: string) => {
  const [year, month, day] = date.split('/');
  return `${year}年${month}月${day}日`;
};

export const MessageItem: FC<MessageItemProps> = ({ date, time, sender, content, partner, isFirst }) => {
  const isMine = partner !== sender;

  return (
    <>
      {isFirst && <DateLabel date={date} />}
      <MessageContent isMine={isMine} sender={sender} content={content} time={time} />
    </>
  )
}

type DateLabelProps = {
  date: string;
}

const DateLabel: FC<DateLabelProps> = ({ date }) => (
  <div class="text-center my-5 font-bold text-gray-500">
    {getFormattedDate(date)}
  </div>
)

type MessageContentProps = {
  isMine: boolean;
  sender: string;
  content: string;
  time: string;
}

const MessageContent: FC<MessageContentProps> = ({ isMine, sender, content, time }) => (
  <div class={`mb-4 ${isMine ? 'ml-auto w-1/2' : 'mr-auto w-1/2'}`}>
    <div class={`font-bold ${isMine ? 'text-right' : 'text-left'}`}>{sender}</div>
    <div class={`p-2 rounded-lg shadow ${isMine ? 'bg-[#acc764]' : 'bg-white'}`}>{content}</div>
    <div class={`text-xs text-gray-500 ${isMine ? 'text-right' : 'text-left'}`}>{time}</div>
  </div>
)

export const Header: FC = () => {
  return (
    <header class="flex justify-between items-center p-4 bg-gray-200">
      <h1 class="font-bold mb-4">
        <a href="/">
          LINEトーク履歴バックアップ
        </a>
      </h1>
      <form hx-post="/auth" hx-swap="outerHTML">
        <button
          type="submit"
          class="bg-blue-500 text-white px-4 py-2 rounded"
        >
          ログイン
        </button>
      </form>
    </header>
  )
}

type TalkData = {
  id: string
  partner: string
  lastMessageDate: string
}

type TalkListProps = {
  talks: TalkData[]
}

export const TalkList: FC<TalkListProps> = ({ talks }) => {
  return (
    <div id="talk-list" class="p-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">バックアップされたトーク</h2>
        <button
          hx-get="/add-talk-dialog"
          hx-target="body"
          hx-swap="beforeend"
          class="bg-green-500 text-white px-4 py-2 rounded"
        >
          トークを追加
        </button>
      </div>
      <ul>
        {talks.map((talk) => (
          <li key={talk.id} class="mb-2 p-2 bg-gray-100 rounded">
            <a href={`/talk/${talk.id}`} class="block">
              <span class="font-medium">{talk.partner}</span>
              <span class="ml-4 text-sm text-gray-600">
                最終メッセージ: {talk.lastMessageDate}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
export const AddTalkDialog: FC = () => {
  return (
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" id="add-talk-dialog">
      <div class="bg-white p-6 rounded-lg shadow-lg">
        <h2 class="text-xl font-semibold mb-4">新しいトークを追加</h2>
        <form hx-post="/add-talk" hx-target="#talk-list" hx-swap="outerHTML" enctype="multipart/form-data">
          <div class="mb-4">
            <label for="talkFile" class="block text-sm font-medium text-gray-700">
              トークファイル
            </label>
            <input
              type="file"
              id="talkFile"
              name="talkFile"
              accept=".txt"
              required
              class="mt-1 block w-full"
            />
          </div>
          <div class="flex justify-end space-x-2">
            <button
              type="button"
              class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
              hx-get="/close-dialog"
              hx-target="#add-talk-dialog"
              hx-swap="outerHTML"
            >
              キャンセル
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-500 text-white rounded-md"
            >
              追加
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

type TalkDetailProps = {
  talk: Talk;
}

export const TalkDetail: FC<TalkDetailProps> = ({ talk }) => {
  return (
    <div class="max-w-2xl mx-auto mt-4 p-2 sm:mt-8 sm:p-4 bg-gray-100 rounded-lg">
      <h2 class="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">{talk.partner}とのトーク履歴</h2>
      <div
        hx-get={`/messages/${talk.id}`}
        hx-trigger="revealed"
        hx-swap="afterend"
        hx-indicator="#loading-indicator"
      >
        <MessageList talk={talk} />
      </div>
      <div id="loading-indicator" class="htmx-indicator">
        <div class="flex justify-center items-center mt-2 sm:mt-4">
          <div class="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    </div>
  )
}
