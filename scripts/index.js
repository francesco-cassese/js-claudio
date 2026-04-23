function customFetch(url, options) {
    return fetch(url, options)
        .then(response => {
            return response.json();
        });
}

// Cronologia di tutta la conversazione
let history = [];

function richiediAClaude(messaggio) {

    history.push({
        role: 'user',
        content: messaggio
    });

    // Header necessari per Claude
    const headers = {
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
        "anthropic-dangerous-direct-browser-access": "true"
    };
    const requestObj = {
        model: CLAUDE_MODEL,
        max_tokens: 1024, // limite massimo di token nella risposta
        messages: history
    };

    const requestObjStringhificato = JSON.stringify(requestObj);

    return customFetch(CLAUDE_API_URL, {
        method: "POST",
        headers,
        body: requestObjStringhificato, // Deve essere una stringa per questo lo converto
    }).then(data => {

        // Estraggo il testo del messaggio
        const claudeResponseMsg = data.content[0].text;

        history.push({
            role: 'assistant',
            content: claudeResponseMsg
        });

        return claudeResponseMsg;
    });
}

// ########################################################################################
// MAIN
// ########################################################################################

if (typeof CLAUDE_API_KEY === undefined || typeof CLAUDE_API_KEY !== 'string' || CLAUDE_API_KEY.trim() === '') {
    alert("Rinomina il file config.js.example e riempilo con le variabili corrette");
}

const chatHistoryEl = document.querySelector('#chat-history');
const sendMessageFormEl = document.querySelector('#send-message-form');
const userMessageInputEl = document.querySelector('#user-message');

function renderAllMessages() {
    chatHistoryEl.innerHTML = '';

    let chatHtmlString = '';
    for (const message of history) {
        console.log(message);

        chatHtmlString += `
            <p>${message.role === 'user' ? 'IO' : 'AI'}: ${message.content}</p>
        `
    }

    chatHistoryEl.innerHTML = chatHtmlString;
}

sendMessageFormEl.addEventListener('submit', (event) => {
    event.preventDefault();

    const message = userMessageInputEl.value;

    richiediAClaude(message)
        .then(rispostaDiClaude => {
            console.log(richiediAClaude);
            renderAllMessages();
        });

});