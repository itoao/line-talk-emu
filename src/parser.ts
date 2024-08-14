type Message = {
  date: string
  time: string
  sender: string
  content: string
}

type Talk = {
  partner: string
  messages: Message[]
}

function parseDate(line: string): string | null {
  return line.match(/^\d{4}\/\d{2}\/\d{2}/) ? line : null
}

function parseMessage(parts: string[], currentDate: string): Message | null {
  if (parts.length === 3) {
    const [time, sender, content] = parts
    return { date: currentDate, time, sender, content }
  } else if (parts.length === 2) {
    const [time, sender] = parts
    return { date: currentDate, time, sender, content: '' }
  }
  return null
}

function parsePartner(content: string): string {
  const match = content.split('\n')[0].match(/\[LINE\] (.+)とのトーク履歴/)
  return match ? match[1] : ''
}

export function parseTalkTxt(content: string): Talk {
  const lines = content.split('\n')
  let currentDate = ''
  const chatLines: Message[] = []

  lines.forEach(line => {
    const trimmedLine = line.trim()
    const dateLine = parseDate(trimmedLine)
    
    if (dateLine) {
      currentDate = dateLine
    } else {
      const parts = trimmedLine.split('\t')
      const message = parseMessage(parts, currentDate)
      
      if (message) {
        chatLines.push(message)
      } else if (trimmedLine && chatLines.length > 0) {
        chatLines[chatLines.length - 1].content += '\n' + trimmedLine
      }
    }
  })

  return {
    partner: parsePartner(content),
    messages: chatLines
  }
}