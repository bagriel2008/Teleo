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

UPDATE users 
SET password = '$2b$10$V8./dAgXbv7d33fLmgpA8uX1bfTeq2AtwiKkdHAFGZ.ekPUfBzV6.' 
WHERE id = 1;

SELECT * FROM cargos;

ALTER TABLE users
ADD COLUMN profile_image VARCHAR(255) DEFAULT NULL,
ADD COLUMN bio TEXT DEFAULT NULL;

drop database Teleo;