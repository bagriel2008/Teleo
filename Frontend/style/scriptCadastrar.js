const form = document.getElementById('CadastrarForm')

form.addEventListener('submit', async(e)=> {
    e.preventDefault()

    const username = document.getElementById('username').value
    const password = document.getElementById('password').value
    const email = document.getElementById('email').value

    const response = await fetch('http://localhost:3030/cadastro', {   
        method:'POST',
        headers:{'Content-Type': ' application/json'},
        body: JSON.stringify({username, password, email})
    })
    console.log(response);
    const results = await response.json()

    if (results.success) {
        alert('cadastro bem sucedido')
        window.location.href='../login/stepTwo.html'
    } else {
        alert('Falta alguma informação')
    }

})