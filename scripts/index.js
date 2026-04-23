'use strict';

// ########################################################################################
// INTERFACCIA UTENTE (DOM E RENDERING)
// ########################################################################################

// Seleziono gli elementi HTML che mi servono per leggere e scrivere i dati
const chatHistoryEl = document.querySelector('#chat-history');
const sendMessageFormEl = document.querySelector('#send-message-form');
const bottoneInvio = sendMessageFormEl.querySelector('button[type="submit"]');
const userMessageInputEl = document.querySelector('#user-message');


// ########################################################################################
// LOGICA DI AVVIO E GESTIONE EVENTI
// ########################################################################################

// Controllo iniziale: mi assicuro che la chiave segreta sia presente nel file config.js
if (typeof CLAUDE_API_KEY === 'undefined' || typeof CLAUDE_API_KEY !== 'string' || CLAUDE_API_KEY.trim() === '') {
    alert("Attenzione: manca la chiave API nel file di configurazione!");       // Avviso l'utente se manca la configurazione
}

/**
 * Gestisco l'evento di invio del form (pressione tasto invio o click bottone)
 */
sendMessageFormEl.addEventListener('submit', (event) => {
    event.preventDefault();                                                    // Blocco il ricaricamento della pagina del browser

    // Recupero il testo scritto dall'utente nel campo di input
    const valoreInput = userMessageInputEl.value;

    // Chiedo alla funzione di validazione (in function.js) se il testo va bene
    const risultato = validaMessaggio(valoreInput);                            // Ora uso la nuova funzione "validaMessaggio"

    // Verifico se la validazione ha riscontrato qualche anomalia
    if (risultato.stato !== statoErroriInput.corretto) {

        // Se il dato è inesistente (nullo), comunico l'errore tecnico
        if (risultato.stato === statoErroriInput.nullo) {
            alert("Errore, il dato non è stato ricevuto.");
        }
        // Se l'utente ha premuto invio senza scrivere nulla
        else if (risultato.stato === statoErroriInput.vuoto) {
            alert("Per favore, scrivi qualcosa prima di inviare!");
        }
        // Se il messaggio è troppo breve per avere senso
        else if (risultato.stato === statoErroriInput.troppoCorto) {
            alert(`Il messaggio "${risultato.valore}" è troppo breve.`);
        }

        return;                                                                // Mi fermo qui: non procedo con la chiamata API
    }

    bottoneInvio.disabled = true;                                              // Disabilito il tasto per evitare doppi invii
    bottoneInvio.textContent = "...";                                          // Cambio il testo per dare feedback visivo

    // Avvio la procedura di invio verso l'intelligenza artificiale
    inviaMessaggioAClaude(risultato.valore)                                    // Uso la nuova funzione coordinatrice
        .then(() => {
            renderAllMessages();                                               // Disegno a video tutti i messaggi (vecchi e nuovi)
            userMessageInputEl.value = '';                                     // Pulisco il campo di testo per un nuovo messaggio
        })
        .catch((errore) => {
            console.error("Errore nella comunicazione:", errore);              // Registro l'errore tecnico in console
            alert("Spiacente, non riesco a contattare l'IA in questo momento.");
        })
        .finally(() => {
            bottoneInvio.disabled = false;                                     // Riattivo il tasto per l'utente
            bottoneInvio.textContent = "Invia";                                // Ripristino il testo originale del bottone
        });
});