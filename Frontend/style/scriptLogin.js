const form = document.getElementById('loginForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const response = await fetch('http://localhost:3030/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const result = await response.json();

  if (result.success) {
    alert("Login bem-sucedido!");
    // Salva no localStorage para manter o tipo do usuário
    localStorage.setItem('userTipo', result.tipo);

    // Redirecionamento para página inicial
    window.location.href = "../PaginaInicial/index.html";
  } else {
    alert("Usuário ou senha incorretos!");
  }
});