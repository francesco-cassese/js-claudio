
// ########################################################################################
// INTERFACCIA UTENTE (DOM E RENDERING)
// ########################################################################################

// Elementi del DOM necessari per l'interazione
const chatHistoryEl = document.querySelector('#chat-history');             // Contenitore della chat
const sendMessageFormEl = document.querySelector('#send-message-form');     // Form di invio
const userMessageInputEl = document.querySelector('#user-message');        // Campo di testo input

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

    const risultato = controllaInput(inputGrezzo);

    if (risultato.stato !== statoErroriInput.corretto) {

        if (risultato.stato === statoErroriInput.nullo) {
            alert("C'è stato un problema: il messaggio risulta inesistente.");
        }
        else if (risultato.stato === statoErroriInput.vuoto) {
            alert("Non puoi inviare un messaggio vuoto. Scrivi qualcosa!");
        }
        else if (risultato.stato === statoErroriInput.troppoCorto) {
            alert(`${risultato.valore} è troppo corto. Scrivi almeno 2 caratteri.`);
        }

        else if (risultato.stato === statoErroriInput.troppoLungo) {
            alert("Il messaggio è troppo lungo! Prova a riassumere o dividere la domanda.");
        }
        else if (risultato.stato === statoErroriInput.formatoErrato) {
            alert("Per motivi di sicurezza, non puoi usare i simboli < e > nei tuoi messaggi.");
        }

        return;
    }

    richiediAClaude(message)                                               // Avvia la richiesta asincrona all'AI
        .then(rispostaDiClaude => {
            renderAllMessages();                                           // Aggiorna l'interfaccia a risposta ricevuta
            userMessageInputEl.value = '';                                 // Pulisce il campo di input
        });
});