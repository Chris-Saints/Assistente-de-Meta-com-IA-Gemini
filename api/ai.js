export default async function handler(req, res) {

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    


    const { question, game } = req.body;
    console.log("API KEY EXISTS?", !!process.env.GEMINI_API_KEY);
    const model = "gemini-2.5-flash" //Modelo da IA usada
    

    //Os parametros criados para orientar a IA de como ela deve responder as dúvidas enviadas. Cada uma focada no jogo especifico
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

    //Aqui são comparações para escolher os parametros certos dependendo do jogo escolhido

    if(game === 'Valorant') {
        pergunta = perguntaValorant
    } else if ( game === 'CS:GO') {
        pergunta = perguntaCSGO
    } else if (game === 'League of Legends') {
        pergunta = perguntaLOL
    } else if(game === '') {
        return
    }

    try {
        //Verificação da key
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: "API KEY não encontrada" });
        }

        const response = await fetch(e
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,

            {
                method: "POST", //Enviando dados
                headers: { "Content-Type": "application/json" }, //Informa a API como interpretar os dados
                body: JSON.stringify({
                    contents: [{ parts: [{ text: pergunta }] }],
                }),
            }
        );

        const data = await response.json(); //Convertendo o fetch em json 

        if (!response.ok) {
            //Para segurança caso a requisição não de certo
            console.error("Erro da Gemini:", data);
            return res.status(500).json({
                error: "Erro na Gemini",
                details: data
            });
        }

        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            //Novamente se der erro no formato do dado
            console.error("Resposta inesperada:", data);
            return res.status(500).json({
                error: "Formato inesperado da resposta",
                details: data
            });
        }

        //Retorna a informação
        return res.status(200).json({ text });

    } catch (error) {
        //Caso de Erro
        console.error("Erro interno:", error);
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
}