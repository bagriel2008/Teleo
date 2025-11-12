CREATE DATABASE Teleo;
USE Teleo;

CREATE TABLE users (
	id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL
);

ALTER TABLE users ADD COLUMN tipo ENUM('usuario','empresa') DEFAULT 'usuario';
INSERT INTO users (username, password, email, tipo)
VALUES ('empresa1','senha123','empresa@teste.com','empresa');


CREATE TABLE cargos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    creat_id INT NOT NULL,
    nome VARCHAR(255) NOT NULL
);


CREATE TABLE perguntas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cargo_id INT NOT NULL,
    texto TEXT NOT NULL,
    FOREIGN KEY (cargo_id) REFERENCES cargos(id) ON DELETE CASCADE
);

CREATE TABLE respostas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pergunta_id INT NOT NULL,
    texto TEXT NOT NULL,
    FOREIGN KEY (pergunta_id) REFERENCES perguntas(id) ON DELETE CASCADE
);

CREATE TABLE respostas_usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    cargo_id INT NOT NULL,
    pergunta_id INT NOT NULL,
    resposta_id INT NOT NULL,
    correta BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (cargo_id) REFERENCES cargos(id),
    FOREIGN KEY (pergunta_id) REFERENCES perguntas(id),
    FOREIGN KEY (resposta_id) REFERENCES respostas(id)
);


CREATE TABLE IF NOT EXISTS cargos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS perguntas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cargo_id INT NOT NULL,
  texto TEXT NOT NULL,
  FOREIGN KEY (cargo_id) REFERENCES cargos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mensagens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender VARCHAR(255) NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



UPDATE users 
SET password = '$2b$10$V8./dAgXbv7d33fLmgpA8uX1bfTeq2AtwiKkdHAFGZ.ekPUfBzV6.' 
WHERE id = 1;

SELECT * FROM respostas;

ALTER TABLE users
ADD COLUMN profile_image VARCHAR(255) DEFAULT NULL,
ADD COLUMN bio TEXT DEFAULT NULL;

ALTER TABLE respostas ADD COLUMN correta BOOLEAN DEFAULT FALSE;

drop table messages;
drop database Teleo;