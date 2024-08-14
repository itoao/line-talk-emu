import { html } from 'hono/html'
import { FC } from 'hono/jsx'
import { jsxRenderer } from 'hono/jsx-renderer'

export const renderer = jsxRenderer(({ children }) => {
  return html`
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://unpkg.com/htmx.org@1.9.3"></script>
        <script src="https://unpkg.com/hyperscript.org@0.9.9"></script>
        <script src="https://cdn.tailwindcss.com"></script>
        <title>Hono + htmx</title>
      </head>
      <body>
        <div class="p-4">
          <h1 class="text-4xl font-bold mb-4"><a href="/">Todo</a></h1>
          ${children}
        </div>
      </body>
    </html>
  `
})

export const AddTodo: FC = () => (
  <form hx-post="/todo" hx-target="#todo" hx-swap="beforebegin" _="on htmx:afterRequest reset() me" class="mb-4">
    <div class="mb-2">
      <input name="title" type="text" class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2.5" />
    </div>
    <button class="text-white bg-blue-700 hover:bg-blue-800 rounded-lg px-5 py-2 text-center" type="submit">
      Submit
    </button>
  </form>
)

type ItemProps = {
  title: string;
  id: string;
}

export const Item: FC<ItemProps> = ({ title, id }) => (
  <p
    hx-delete={`/todo/${id}`}
    hx-swap="outerHTML"
    class="flex row items-center justify-between py-1 px-4 my-1 rounded-lg text-lg border bg-gray-100 text-gray-600 mb-2"
  >
    {title}
    <button class="font-medium">Delete</button>
  </p>
)

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

const FileUploadForm: FC = () => (
  <form hx-post="/parse" hx-target="#messages" enctype="multipart/form-data">
    <input type="file" name="talkFile" accept=".txt" required />
    <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">
      パース
    </button>
  </form>
)

type MessageListProps = {
  talk?: Talk;
}

const MessageList: FC<MessageListProps> = ({ talk }) => (
  <div id="messages" class="mt-4">
    {talk?.messages.map((message, index) => (
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