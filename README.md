# TELEODECISON

## Objetivo

O projeto TELEODECISON tem como objetivo, criar uma plataforma interativa onde, o RH das empresas poderão usá-la para o auxilio de contratações para determinadas funções dentro das empresas em geral.

## Tecnologias usadas:

+ Front-end: HTML, CSS, JavaScript

+ Back-end: Node.js com Express.js

+ Banco de Dados: MySQL

+ Outras Tecnologias: Fetch API, CORS


## Funcionalidades implementadas

### Cadastro de usuário:

+ Os usuários podem criar uma conta informando nome, e-mail e senha.

+ Os dados são armazenados no banco de dados MySQL.

### Login de usuário:

+ Os usuários podem acessar suas contas usando e-mail e senha.

+ Validação de credenciais com resposta adequada caso os dados sejam incorretos.

### Conexão com banco de dados:

+ Utilização do MySQL para armazenar os dados dos usuários.

+ Configuração de conexão via mysql2.

### Servidor back-end:

+ Implementação de rotas para cadastro e login utilizando Express.js.

+ Comunicação com o banco de dados para inserção e verificação de credenciais.

## Como executar o projeto

### Instale as dependências:
```
npm install express mysql2 cors
```
### Configure o banco de dados MySQL:

+ Crie um banco de dados chamado Teleo.

+ Crie a tabela users com as colunas id, username, email, password.

### Inicie o servidor:
```
node server.js
```
### Abra o projeto no navegador:

+ Acesse index.html para visualizar a interface.





=============================================================================================================






# Critérios de acessibilidade presentes

## Uso de label associado a inputs
Os campos de nome, email e senha possuem label, garantindo que leitores de tela consigam interpretar corretamente os formulários.

Justificativa: Essencial para usuários com deficiência visual, pois permite que leitores de tela identifiquem os campos corretamente.

## Uso de button para interações
Os botões seguem boas práticas de acessibilidade e agora incluem role="button" quando dentro de <a>.

Justificativa: button já é acessível por padrão, mas dentro de <a>, é necessário definir role="button" para manter a semântica correta.

## Uso de meta viewport
A responsividade foi mantida através do meta viewport, garantindo que o site funcione em dispositivos móveis.

Justificativa: Essencial para evitar que o conteúdo fique pequeno ou desorganizado em telas menores.

# Critérios de acessibilidade não presentes

## Falta adicionar alt nas imagens
Atualmente, as imagens na página não possuem o atributo alt, o que prejudica a acessibilidade.

Problema: Usuários com deficiência visual não conseguem interpretar as imagens.

Solução: Incluir um texto descritivo no alt ou deixá-lo vazio (alt="") se a imagem for meramente decorativa.

## Falta melhorar o contraste dos botões
Alguns botões da interface possuem cores que podem dificultar a leitura para usuários com baixa visão.

Problema: O baixo contraste pode dificultar a diferenciação entre botões ativos e inativos.

Solução: Ajustar as cores para atingir um nível de contraste adequado, seguindo as diretrizes do WCAG.

## input sem tipos adequados
Os campos de email e senha estão como type="text", em vez de type="email" e type="password", o que pode comprometer a experiência do usuário.

Problema: Isso impede que o navegador faça validações automáticas e dificulta a inserção dos dados.

Solução: Definir os tipos corretos para cada campo, garantindo melhor usabilidade.

## Botões desativados não possuem indicação adequada
Quando um botão está desativado, não há um indicativo claro para usuários que utilizam leitores de tela.

Problema: Usuários com deficiência visual podem não perceber que um botão está desativado.

Solução: Adicionar um aria-disabled="true" ou uma mensagem visual que informe o estado do botão.


