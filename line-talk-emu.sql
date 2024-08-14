DROP TABLE IF EXISTS message;
DROP TABLE IF EXISTS talk;

CREATE TABLE talk (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  partner TEXT NOT NULL,
  last_message_date TEXT NOT NULL
);

CREATE TABLE message (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  talk_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  sender TEXT NOT NULL,
  content TEXT NOT NULL,
  FOREIGN KEY (talk_id) REFERENCES talk(id)
);

-- トークのサンプルデータ
INSERT INTO talk (partner, last_message_date) VALUES ('田中さん', '2023-07-01');
INSERT INTO talk (partner, last_message_date) VALUES ('佐藤さん', '2023-06-28');

-- メッセージのサンプルデータ
INSERT INTO message (talk_id, date, time, sender, content) VALUES (1, '2023-07-01', '10:00', '田中さん', 'おはようございます！');
INSERT INTO message (talk_id, date, time, sender, content) VALUES (1, '2023-07-01', '10:05', 'あなた', 'おはようございます。今日はいい天気ですね。');
INSERT INTO message (talk_id, date, time, sender, content) VALUES (2, '2023-06-28', '15:30', '佐藤さん', '明日の会議の資料、確認していただけましたか？');
INSERT INTO message (talk_id, date, time, sender, content) VALUES (2, '2023-06-28', '15:45', 'あなた', 'はい、確認しました。修正点を送ります。');