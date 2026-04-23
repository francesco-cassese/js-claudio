
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

sendMessageFormEl.addEventListener('submit', (event) => {
    event.preventDefault();                                                // Evito che la pagina si ricarichi

    // Prendo quello che l'utente ha scritto nel campo di testo
    const valoreInput = userMessageInputEl.value;

    // Chiedo alla mia funziona se il messaggio è validato
    const risultato = controllaInput(valoreInput);

    // Controllo se il risultato è diverso da "corretto"
    if (risultato.stato !== statoErroriInput.corretto) {

        // Se è nullo, avviso l'utente del problema tecnico
        if (risultato.stato === statoErroriInput.nullo) {
            alert("Problema tecnico: messaggio inesistente.");
        }
        // Se è vuoto, ricordo all'utente di scrivere qualcosa
        else if (risultato.stato === statoErroriInput.vuoto) {
            alert("Non puoi inviare un messaggio vuoto!");
        }
        // Se è troppo corto, gli mostro anche cosa ha scritto per chiarezza
        else if (risultato.stato === statoErroriInput.troppoCorto) {
            alert(`"${risultato.valore}" è troppo corto.`);
        }

        return;                                                            // Esco subito: non voglio che il codice prosegua
    }

    // Se tutto è corretto, invio a Claude solo il valore pulito 
    richiediAClaude(risultato.valore)
        .then(() => {
            renderAllMessages();                                           // Aggiorno la chat con i nuovi messaggi
            userMessageInputEl.value = '';                                 // Svuoto il campo così è pronto per il prossimo testo
        });
});