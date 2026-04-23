'use strict';

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
// CONTROLLI INPUT
// ########################################################################################

const statoErroriInput = {
    corretto: 0,
    nullo: -1,
    vuoto: -2,
    troppoCorto: -3,
    troppoLungo: -4,
    formatoErrato: -5
};

function controllaInput(testoGrezzo) {
    if (testoGrezzo === null || typeof testoGrezzo === 'undefined') {
        return { stato: statoErroriInput.nullo, valore: "" };
    }

    const testoPulito = testoGrezzo.trim();


    if (testoPulito === "") {
        return { stato: statoErroriInput.vuoto, valore: "" };
    }


    if (testoPulito.length < 2) {
        return { stato: statoErroriInput.troppoCorto, valore: testoPulito };
    }


    if (testoPulito.length > 5000) {
        return { stato: statoErroriInput.troppoLungo, valore: testoPulito };
    }


    if (testoPulito.includes("<") && testoPulito.includes(">")) {
        return { stato: statoErroriInput.formatoErrato, valore: testoPulito };
    }

    return { stato: statoErroriInput.corretto, valore: testoPulito };
}