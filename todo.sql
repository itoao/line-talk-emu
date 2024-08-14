DROP TABLE IF EXISTS todo;

CREATE TABLE todo (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL
);

INSERT INTO todo (id, title) VALUES ('1', 'Buy groceries');
INSERT INTO todo (id, title) VALUES ('2', 'Complete project report');
INSERT INTO todo (id, title) VALUES ('3', 'Schedule dentist appointment');
INSERT INTO todo (id, title) VALUES ('4', 'Plan weekend trip');
INSERT INTO todo (id, title) VALUES ('5', 'Read a new book');
