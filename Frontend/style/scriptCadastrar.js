const form = document.getElementById('CadastrarForm');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:3030/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const result = await response.json();

        if (result.success) {
            alert("Cadastro realizado com sucesso!");
            window.location.href = "../login/stepTwo.html"; // Redireciona para a página de login
        } else {
            alert("Erro ao cadastrar: " + result.message);
        }
    } catch (error) {
        console.error('Erro ao fazer cadastro:', error);
        alert("Erro ao conectar ao servidor!");
    }
});