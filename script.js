const gameSelect = document.getElementById('gameSelect');
const questionInput = document.getElementById('questionInput');
const askButton = document.getElementById('askButton');
const aiResponse = document.getElementById('aiResponse');
const form = document.getElementById('form');


//função para converter o texto em markdown enviado pela IA para HTML
const markDownToHTML = (text) => {
    const converter = new showdown.Converter()
    return converter.makeHtml(text)
}

//Função para a requisição da resposta da IA
const perguntarAI = async (question, game) => {

    //Faz uma requisição para o Ai.js
    const response = await fetch("/api/ai", {
        method: 'POST', //diz que eu estou enviando dados
        
        //Informa a API como interpretar os dados enviados
        headers: {
            'Content-Type': 'application/json'
        },
        //Está enviando os dados e o stringify está transformando tudo em string 
        body: JSON.stringify({
            question, game
            
        })
    })

    //Tratamento para caso de erro
    if (!response.ok) {
        const errorText = await response.text()
        console.log("Erro da API:", errorText)
        throw new Error("Erro na API")
    }

    //Transforma a resposta em Json novamente e retorna
    const data = await response.json()
    return data.text
}

//Evento quando for enviado o formulario
form.addEventListener('submit', async (event) => {
    
    //preventDefault para nao dar refresh na pagina
    event.preventDefault();
    
    //Pegando os valores escritos e escolhidos dos inputs
    const game = gameSelect.value
    const question = questionInput.value

    //Como prevenção se qualquer um estiver em branco, retornar mensagem de erro
    if( game === '' || question === '') {
        alert('Por favor, preencha todos os campos')
        return
    }

    //A parte do loading e desabilitação do botão
    askButton.disabled = true
    askButton.textContent = 'Perguntando...'
    askButton.classList.add('loading')



    try {
        //Bota a função de requisição da resposta ativa com os parametros question, game e salva na const text
        const text = await perguntarAI(question, game);

        //Acessa a parte do HMTL que vai conter a resposta e adiciona a resposta da aquisição já transformando ela em HTML com a função 
        aiResponse.querySelector('.response-content').innerHTML = markDownToHTML(text)

        //Remove a classe que esconde quando não tem resposta
        aiResponse.classList.remove('hidden')

    } catch(error) {
        //Caso de erro
        console.log('Erro: ', error);
        
    } finally {
        //Por fim habilita reset o botão ao normal
        askButton.disabled = false
        askButton.textContent = "Perguntar"
        askButton.classList.remove('loading')
    }
    
    
})
