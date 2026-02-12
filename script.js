const gameSelect = document.getElementById('gameSelect');
const questionInput = document.getElementById('questionInput');
const askButton = document.getElementById('askButton');
const aiResponse =document.getElementById('aiResponse');
const form = document.getElementById('form');

const markDownToHTML = (text) => {
    const converter = new showdown.Converter()
    return converter.makeHtml(text)
}


const perguntarAI = async (question, game) => {


    const response = await fetch("/api/ai", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            question, game
            
        })
    })
    
    if (!response.ok) {
        const errorText = await response.text()
        console.log("Erro da API:", errorText)
        throw new Error("Erro na API")
    }

    const data = await response.json()
    return data.text
}


form.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const game = gameSelect.value
    const question = questionInput.value

    if( game === '' || question === '') {
        alert('Por favor, preencha todos os campos')
        return
    }

    askButton.disabled = true
    askButton.textContent = 'Perguntando...'
    askButton.classList.add('loading')

    try {
        //Perguntar a IA
        const text = await perguntarAI(question, game);

        aiResponse.querySelector('.response-content').innerHTML = markDownToHTML(text)

        aiResponse.classList.remove('hidden')

    } catch(error) {
        console.log('Erro: ', error);
        
    } finally {
        askButton.disabled = false
        askButton.textContent = "Perguntar"
        askButton.classList.remove('loading')
    }
    
    
})
