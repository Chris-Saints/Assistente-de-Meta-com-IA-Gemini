const apiKeyInput = document.getElementById('apiKey');
const gameSelect = document.getElementById('gameSelect');
const questionInput = document.getElementById('questionInput');
const askButton = document.getElementById('askButton');
const aiResponse =document.getElementById('aiResponse');
const form = document.getElementById('form');

const markDownToHTML = (text) => {
    const converter = new showdown.Converter()
    return converter.makeHtml(text)
}


//AIzaSyDpfj0NLqiQKDSgZpwzH99HWPnxUp3GvNo
const perguntarAI = async (question, game, apiKey) => {

    const model = "gemini-2.5-flash"
    const baseURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

    const perguntaLOL = `
        ## Especialidade
        Você é um especialista assistente de meta para o jogo ${game}

        ## Tarefa
        Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, build e dicas

        ## Regras
        - Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta.

        - Se a pergunta não está relacionada ao jogo, responda com 'Essa pergunta não está relacionada ao jogo'

        - Considere a data atual ${new Date().toLocaleDateString}

        - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para da uma resposta coerente.

        - Nunca responda itens que você não tenha certeza de que existe no patch atual.

        - A resposta deve ser em portugues do Brasil

        ## Resposta
        - Economize na resposta, seja direto e responda no maximo 500 caracteres.
        - Responda em markdown.
        - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.
        - A resposta deve ser em portugues do Brasil

        ## Exemplo de resposta
        pergunta do usuario: Melhor build rengar jungle
        resposta: A build mais atual: \n\n **Itens:**\n\n coloque os itens aqui. \n\n**Runas:**\n\n

        ---
        Aqui está a pergunta do usuário: ${question}
    `

    const perguntaValorant = `
        ## Especialidade
        Você é um especialista assistente de meta para o jogo ${game}

        ## Tarefa
        Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, armas, personagens e dicas.

        ## Regras
        - Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta.

        - Se a pergunta não está relacionada ao jogo, responda com 'Essa pergunta não está relacionada ao jogo'

        - Considere a data atual ${new Date().toLocaleDateString}

        - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.

        - Nunca responda com armas, agentes, habilidades ou atualizações que você não tenha certeza de que existem no patch atual.

        - A resposta deve ser em portugues do Brasil

        ## Resposta
        - Economize na resposta, seja direto e responda no máximo 500 caracteres.
        - Responda em markdown.
        - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.
        - A resposta deve ser em portugues do Brasil

        ## Exemplo de resposta
        pergunta do usuário: Melhor agente pra atacar em Lotus  
        resposta: **Melhores escolhas no meta:** Raze, Skye e Omen. Raze ajuda a quebrar setups, Skye garante avanço com cura e flash, e Omen facilita entrada com smoke.  
        ---
        Aqui está a pergunta do usuário: ${question}
    `

    const perguntaCSGO = `
        ## Especialidade
        Você é um especialista assistente de meta para o jogo ${game}

        ## Tarefa
        Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, armas, economia, posições e dicas.

        ## Regras
        - Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta.

        - Se a pergunta não está relacionada ao jogo, responda com 'Essa pergunta não está relacionada ao jogo'

        - Considere a data atual ${new Date().toLocaleDateString}

        - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.

        - Nunca responda com armas, mapas, granadas ou estratégias que você não tenha certeza de que existem no patch atual.

        - A resposta deve ser em portugues do Brasil

        ## Resposta
        - Economize na resposta, seja direto e responda no máximo 500 caracteres.
        - Responda em markdown.
        - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.
        - A resposta deve ser em portugues do Brasil

        ## Exemplo de resposta
        pergunta do usuário: Qual melhor setup CT na Mirage?  
        resposta: **Setup comum:** 2 A (Anchor + rotador), 1 Mid com apoio de smoke + flash, 2 B segurando de van e market. Ajustar conforme leitura da economia inimiga.  
        ---
        Aqui está a pergunta do usuário: ${question}

    `
    let pergunta = '';

    if(game === 'Valorant') {
        pergunta = perguntaValorant
    } else if ( game === 'CS:GO') {
        pergunta = perguntaCSGO
    } else if (game === 'League of Legends') {
        pergunta = perguntaLOL
    } else if(game === '') {
        return
    }

    console.log(game);
    console.log(pergunta);
    
    


    const contents = [{
        parts: [{
            text: pergunta
        }]
    }]

    //  const tools = [{
    //      google_search: {}
    //  }]

    // Chamada API

    const response = await fetch(baseURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents,
            
        })
    })

    const data = await response.json()
    console.log({ data });
    
    return data.candidates[0].content.parts[0].text
}




form.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const apiKey = apiKeyInput.value
    const game = gameSelect.value
    const question = questionInput.value

    if(apiKey === '' || game === '' || question === '') {
        alert('Por favor, preencha todos os campos')
        return
    }

    askButton.disabled = true
    askButton.textContent = 'Perguntando...'
    askButton.classList.add('loading')

    try {
        //Perguntar a IA
        const text = await perguntarAI(question, game, apiKey);

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
