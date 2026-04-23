// ########################################################################################
// CONFIGURAZIONE E UTILITY DI RETE
// ########################################################################################

/**
 * Esegue una fetch personalizzata che restituisce direttamente il JSON
 */
function customFetch(url, options) {
    return fetch(url, options)
        .then(response => {
            return response.json();                                        // Converte la risposta in oggetto JS
        });
}

// ########################################################################################
// GESTIONE MEMORIA E CHIAMATE API
// ########################################################################################

let history = [];                                                          // Memoria locale dei messaggi inviati/ricevuti

/**
 * Gestisce l'invio del messaggio all'API di Claude e aggiorna la cronologia
 */
function richiediAClaude(messaggio) {

    history.push({                                                         // Aggiunge il messaggio dell'utente alla storia
        role: 'user',
        content: messaggio
    });

    const headers = {                                                      // Configura le autorizzazioni per l'API
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
        "anthropic-dangerous-direct-browser-access": "true"                // Permette l'accesso diretto dal browser
    };

    const requestObj = {                                                   // Prepara il corpo della richiesta 
        model: CLAUDE_MODEL,
        max_tokens: 1024,
        messages: history                                                  // Invia l'intera cronologia per dare contesto
    };

    const requestObjStringhificato = JSON.stringify(requestObj);           // Trasforma l'oggetto in stringa JSON

    return customFetch(CLAUDE_API_URL, {                                   // Esegue la chiamata POST verso l'endpoint
        method: "POST",
        headers,
        body: requestObjStringhificato,
    }).then(data => {

        const claudeResponseMsg = data.content[0].text;                    // Estrae il testo della risposta dall'oggetto ricevuto

        history.push({                                                     // Salva la risposta dell'AI nella cronologia
            role: 'assistant',
            content: claudeResponseMsg
        });

        return claudeResponseMsg;                                          // Ritorna il testo per utilizzi successivi
    });
}

// ########################################################################################
// INTERFACCIA UTENTE (DOM E RENDERING)
// ########################################################################################

// Elementi del DOM necessari per l'interazione
const chatHistoryEl = document.querySelector('#chat-history');             // Contenitore della chat
const sendMessageFormEl = document.querySelector('#send-message-form');     // Form di invio
const userMessageInputEl = document.querySelector('#user-message');        // Campo di testo input

/**
 * Pulisce e ricrea l'interfaccia della chat ciclando sulla cronologia
 */
function renderAllMessages() {
    chatHistoryEl.innerHTML = '';                                          // Svuota la vista attuale

    let chatHtmlString = '';
    for (const message of history) {                                       // Cicla ogni messaggio presente in memoria
        chatHtmlString += `
            <p>${message.role === 'user' ? 'IO' : 'AI'}: ${message.content}</p>
        `
    }

    chatHistoryEl.innerHTML = chatHtmlString;                              // Inserisce il nuovo HTML generato nel DOM
}

// ########################################################################################
// LOGICA DI AVVIO E GESTIONE EVENTI
// ########################################################################################

// Controllo sicurezza: Verifica se la chiave API è stata configurata correttamente
if (typeof CLAUDE_API_KEY === 'undefined' || typeof CLAUDE_API_KEY !== 'string' || CLAUDE_API_KEY.trim() === '') {
    alert("Rinomina il file config.js.example e riempilo con le variabili corrette");
}

// Gestione dell'invio del modulo (Submit)
sendMessageFormEl.addEventListener('submit', (event) => {
    event.preventDefault();                                                // Impedisce il ricaricamento della pagina

    const message = userMessageInputEl.value;                              // Recupera il testo scritto dall'utente

    richiediAClaude(message)                                               // Avvia la richiesta asincrona all'AI
        .then(rispostaDiClaude => {
            renderAllMessages();                                           // Aggiorna l'interfaccia a risposta ricevuta
            userMessageInputEl.value = '';                                 // Pulisce il campo di input
        });
});