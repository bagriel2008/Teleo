# TeleoDecision

## Tema do Projeto

O TeleoDecision é uma plataforma interativa desenvolvida para auxiliar empresas e usuários na gestão de cargos, avaliações e comunicação profissional.
O sistema permite que empresas criem cargos e perguntas avaliativas, enquanto usuários interagem através de um modo de jogo, respondendo questões e acompanhando seu desempenho.
Além disso, o projeto inclui recursos de perfil, chat em tempo real e estatísticas de desempenho individual.

O objetivo principal é unir gamificação e recrutamento, permitindo que os candidatos aprendam mais sobre os cargos e demonstrem suas habilidades de forma dinâmica e divertida.

## Tecnologias Utilizadas
### Frontend

+ HTML5, CSS3 e JavaScript (ES6) — para a estrutura, estilo e interatividade das páginas.

+ Fetch API — utilizada para comunicação com o backend via requisições HTTP.

+ Socket.io (cliente) — responsável pela comunicação em tempo real no chat entre usuários.

### Backend

+ Node.js com Express — estrutura principal do servidor.

+ MySQL — banco de dados relacional usado para armazenar usuários, cargos, perguntas, respostas e mensagens.

+ JWT (JSON Web Token) — autenticação segura de usuários.

+ Bcrypt — criptografia de senhas.

+ Socket.io (servidor) — gerenciamento de conexões em tempo real.

+ Multer — upload e armazenamento de imagens de perfil.

+ CORS — controle de acesso entre frontend e backend.

### Banco de Dados (MySQL)

Banco: Teleo

### Tabelas principais:
```
users (id, username, email, password, tipo, profile_image, bio)

cargos (id, creat_id, nome)

perguntas (id, cargo_id, texto)

respostas (id, pergunta_id, texto, correta)

mensagens (id, sender, recipient, message, created_at)
```

## Estrutura Geral do Sistema
### Principais Páginas

#### Login / Cadastro

+ Permite o acesso ao sistema.

+ Autenticação via JWT.

+ Após o login, o tipo de usuário define o acesso (empresa ou usuário comum).

#### Adicionar Cargos (somente empresas)

+ Permite criar cargos, perguntas e respostas com definição da alternativa correta.

+ Todos os dados são salvos no banco de dados com o ID do criador.

#### Modo de Jogo (usuário comum)

+ Exibe as perguntas dos cargos disponíveis.

+ Verifica automaticamente se a resposta está correta e avança.

+ Armazena o progresso e acertos no banco de dados.

#### Perfil do Usuário

+ Exibe imagem, biografia e informações do usuário.

+ Permite editar a biografia e atualizar ou remover a imagem.

+ Mantém uma imagem padrão caso nenhuma seja enviada.

#### Chat em Tempo Real

+ Mostra a lista de contatos (outros usuários da plataforma).

+ Permite trocar mensagens privadas em tempo real.

+ As mensagens são salvas no banco e recarregadas ao abrir o chat.

#### Estatísticas

+ Mostra o desempenho do usuário com base nas respostas dadas.

+ Exibe percentual de acertos e progresso geral.

## Manual de Uso
### Acesso ao Sistema

Inicie o servidor na pasta Backend:
```
npm start
```

O sistema rodará por padrão em:
```
http://localhost:3030
```

### Usuário Administrador (Empresa)

Use as credenciais abaixo para acessar o painel administrativo:
```
Email: empresa1@gmail.com
Senha: senha123
Tipo: empresa
```

### Funções disponíveis:

+ Criar novos cargos com perguntas e respostas.

+ Acompanhar desempenho de usuários.

+ Conversar com outros usuários via chat.

### Usuário Comum

+ Após o cadastro, o usuário comum pode:

+ Entrar no modo de jogo.

+ Responder perguntas dos cargos disponíveis.

+ Visualizar seu progresso nas estatísticas.

+ Trocar mensagens com empresas e outros usuários.

## Observações Técnicas

+ Uploads de imagem são armazenados automaticamente na pasta /uploads do projeto.

+ Caso não exista imagem de perfil, o sistema exibe uma imagem padrão (default.png).

+ As mensagens são armazenadas permanentemente no banco de dados, permitindo histórico.

+ O servidor está configurado para aceitar conexões CORS de qualquer origem.

+ Tokens JWT expiram automaticamente após determinado tempo de sessão.

## Conclusão

O TeleoDecision é um sistema completo que une gestão de cargos, avaliação gamificada e comunicação em tempo real, voltado à modernização do processo de recrutamento e desenvolvimento de habilidades.
Com base em tecnologias web modernas, ele proporciona uma experiência dinâmica e integrada entre empresas e usuários, destacando o potencial da interação digital no contexto profissional.
