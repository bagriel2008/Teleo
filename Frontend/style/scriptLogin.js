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
        console.log("Resposta do servidor:", result);

        if (result.success) {
            alert("Login bem-sucedido!");
            localStorage.setItem('token', result.token);
            localStorage.setItem('userTipo', result.tipo);

            if (result.tipo === 'empresa' || result.tipo === 'usuario') {
                window.location.href = "../PaginaInicial/index.html";
            }
            
        } else {
            alert("Usuário ou senha incorretos!");
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        alert("Erro ao conectar ao servidor!");
    }
});