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
    chatHistoryEl.innerHTML = '';

    for (const message of history) {
        const p = document.createElement('p');
        const eUtente = message.role === 'user';                               // Controllo se il messaggio è mio o dell'AI

        // Aggiungo una classe comune e una specifica
        p.classList.add('message');                                            // Classe per le regole comuni 
        p.classList.add(eUtente ? 'user-message' : 'ai-message');              // Classe specifica per il colore e la posizione

        p.textContent = message.content;                                       // Inserisco il testo
        chatHistoryEl.appendChild(p);
    }
}

// ########################################################################################
// CONTROLLI INPUT
// ########################################################################################

const statoErroriInput = {
    corretto: 0,
    nullo: -1,
    vuoto: -2,
    troppoCorto: -3,
};

function controllaInput(testoGrezzo) {
    // Controllo se il risultato esiste
    if (testoGrezzo === null || typeof testoGrezzo === 'undefined') {
        return { stato: statoErroriInput.nullo, valore: "" };              // Ritorno comunque una stringa vuota per coerenza
    }

    // Elimino spazi in eccesso all'inizio e alla fine
    const testoPulito = testoGrezzo.trim();

    // Verifico se dopo aver tolto gli spazi che ci sia effettivamente qualcosa
    if (testoPulito === "") {
        return { stato: statoErroriInput.vuoto, valore: "" };              // Blocco l'invio perchè il messaggio è vuoto
    }

    // Imposto un limite minimo per evitare che partano messaggi casuali
    if (testoPulito.length < 2) {
        return { stato: statoErroriInput.troppoCorto, valore: testoPulito }; // Restituisco il testo per mostrarlo nell'alert
    }

    // Se arrivo qui, restituisco l'oggetto con il testo validato
    return { stato: statoErroriInput.corretto, valore: testoPulito };      // Passo il testo già pulito e validato
}