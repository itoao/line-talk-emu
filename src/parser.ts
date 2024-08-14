type Message = {
  date: string;
  time: string;
  sender: string;
  content: string;
}

type Talk = {
  partner: string;
  messages: Message[]
}

export function parseTalkTxt(content: string): Talk {
  const chatLines: Message[] = [];
  let currentDate = '';

  content.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    const parts = trimmedLine.split('\t');
    
    if (trimmedLine.match(/^\d{4}\/\d{2}\/\d{2}/)) {
      currentDate = trimmedLine;
    } else if (parts.length === 3) {
      const [time, sender, content] = parts;
      chatLines.push({ date: currentDate, time, sender, content });
    } else if (parts.length === 2) {
      const [time, sender] = parts;
      chatLines.push({ date: currentDate, time, sender, content: '' });
    } else if (trimmedLine && chatLines.length > 0) {
      chatLines[chatLines.length - 1].content += '\n' + trimmedLine;
    }
  });

  return {
    partner: content.split('\n')[0].match(/\[LINE\] (.+)とのトーク履歴/)?.[1] || '',
    messages: chatLines
  };
}