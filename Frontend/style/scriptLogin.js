const form = document.getElementById('loginForm');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:3030/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (result.success) {
            alert("Login bem-sucedido!");
            localStorage.setItem('token', result.token); // Armazena o token no localStorage
            window.location.href = "../PaginaInicial/index.html"; // Redireciona para a página principal
        } else {
            alert("Usuário ou senha incorretos!");
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        alert("Erro ao conectar ao servidor!");
    }
});