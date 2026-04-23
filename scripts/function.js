'use strict';

// ########################################################################################
// LOGICA DI VALIDAZIONE (CONTROLLO INPUT)
// ########################################################################################

// Definisco i codici errore per capire esattamente cosa non va nell'input
const statoErroriInput = {
    corretto: 0,
    nullo: -1,
    vuoto: -2,
    troppoCorto: -3,
};


/**
 * Pulisco il testo e verifico se è idoneo all'invio
 */
function validaMessaggio(testoGrezzo) {
    // Verifico subito se l'oggetto esiste per evitare errori 
    if (testoGrezzo === null || typeof testoGrezzo === 'undefined') {
        return { stato: statoErroriInput.nullo, valore: "" };         // Segnalo che il dato manca del tutto
    }

    // Uso trim per ignorare gli spazi vuoti prima e dopo il testo
    const testoPulito = testoGrezzo.trim();

    // Se dopo la pulizia la stringa è vuota, non procedo
    if (testoPulito === "") {
        return { stato: statoErroriInput.vuoto, valore: "" };         // Segnalo che il messaggio è solo spazi
    }

    // Imposto un limite minimo di 2 caratteri per sicurezza
    if (testoPulito.length < 2) {
        return { stato: statoErroriInput.troppoCorto, valore: testoPulito };
    }

    // restituisco il codice successo e il testo pronto
    return { stato: statoErroriInput.corretto, valore: testoPulito };
}

// ########################################################################################
// GESTIONE DATI
// ########################################################################################

// Creo la memoria locale per conservare i messaggi e dare contesto all'IA
let cronologiaMessaggi = [];

/**
 * Aggiunge un nuovo tassello alla conversazione nella memoria locale
 */
function aggiungiACronologia(ruolo, contenuto) {
    // Inserisco un oggetto con ruolo e il testo
    cronologiaMessaggi.push({
        role: ruolo,
        content: contenuto
    });
}

/**
 * Prepara il "pacchetto" dati da spedire via internet
 */
function preparaOggettoRichiesta() {
    // Trasformo l'oggetto JS in una stringa che il server può leggere
    return JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 1024,
        messages: cronologiaMessaggi                                  // Passo tutta la cronologia aggiornata
    });
}

// ########################################################################################
// VISUALIZZAZIONE
// ########################################################################################

/**
 * Prende i dati dalla memoria e li trasforma in elementi visibili nell'HTML
 */
function renderAllMessages() {
    // Svuoto il contenitore della chat per evitare di duplicare i messaggi ogni volta
    chatHistoryEl.innerHTML = '';

    // Uso il ciclo for...of per scorrere ogni singolo oggetto dentro l'array
    for (const messaggio of cronologiaMessaggi) {

        const p = document.createElement('p');                        // Creo un nuovo elemento paragrafo per il messaggio
        const eUtente = messaggio.role === 'user';                    // Controllo se il ruolo è "user" per decidere lo stile

        p.classList.add('message');                                   // Assegno la classe base definita nel CSS
        p.classList.add(eUtente ? 'user-message' : 'ai-message');     // Assegno la classe specifica per il colore e il lato

        p.textContent = messaggio.content;                            // Inserisco il testo del messaggio nel paragrafo
        chatHistoryEl.appendChild(p);                                 // Aggiungo il paragrafo al contenitore visibile a video
    }
}

// ########################################################################################
// COMUNICAZIONE (CHIAMATE DI RETE)
// ########################################################################################

/**
 * Esegue materialmente la chiamata HTTP verso il server
 */
function eseguiChiamataRete(url, configurazione) {
    // Uso fetch e converto immediatamente il risultato in JSON
    return fetch(url, configurazione)
        .then(risposta => risposta.json());                           // Trasformo la risposta grezza in oggetto JS
}

/**
 * Coordina l'invio del messaggio e riceve la risposta dall'IA
 */
function inviaMessaggioAClaude(testoMessaggio) {
    // Per prima cosa salvo il messaggio che ho appena scritto
    aggiungiACronologia('user', testoMessaggio);

    // Preparo le testate con i permessi e la chiave segreta
    const intestazioni = {
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
        "anthropic-dangerous-direct-browser-access": "true"
    };

    // Faccio partire la richiesta usando le funzioni di supporto
    return eseguiChiamataRete(CLAUDE_API_URL, {
        method: "POST",
        headers: intestazioni,
        body: preparaOggettoRichiesta()
    }).then(datiRicevuti => {
        // Estraggo il testo contenuto nella risposta complessa dell'API
        const testoRispostaIA = datiRicevuti.content[0].text;

        // Salvo anche la risposta dell'IA per non perdere il filo
        aggiungiACronologia('assistant', testoRispostaIA);

        // Restituisco il testo finale per poterlo stampare a video
        return testoRispostaIA;
    });
}