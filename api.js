/* ============================================================
   API.JS - Connector amb el Worker d'Àgora
   Depèn de: config.js

   QUÈ FA AQUEST FITXER:
   Centralitza totes les crides al Worker en un sol lloc.
   Principi clau: UNA SOLA crida al Worker per sessió.
   Les dades es guarden a memòria (window.DADES_MENU) i
   tots els filtres es fan localment — zero crides extra.

   Airtable té un límit de 1000 crides/mes al pla gratuït.
   Aquesta estratègia en consumeix molt poques.
   ============================================================ */

/* ─── OBJECTE API ──────────────────────────────────────────────
   En lloc de funcions soltes (window.carregarTot, window.filtrar...),
   tot s'agrupa dins un objecte anomenat API.
   S'usa així: API.carregarTot(), API.filtrar('Carta')
   Equivalent VB6: mòdul amb funcions públiques agrupades
   ─────────────────────────────────────────────────────────────── */
const API = {

    /* ════════════════════════════════════════════════════════
       FUNCIÓ: carregarTot()
       Crida al Worker UNA SOLA VEGADA i guarda el resultat
       a window.DADES_MENU (caché a memòria).
       Si les dades ja existeixen → retorna directament sense
       fer cap crida. Instantani.
       Si no existeixen → crida al Worker, guarda i retorna.
       ════════════════════════════════════════════════════════ */
    async carregarTot() {
        // Si DADES_MENU ja existeix → dades ja carregades, retorna directament
        // Equivalent VB6: If Not IsEmpty(DADES_MENU) Then Return DADES_MENU
        if (window.DADES_MENU) return window.DADES_MENU;

        try {
            // Crida al Worker — GET sense paràmetres → retorna tots els registres
            const resposta = await fetch(CONFIG.BASE_WORKER);

            // Si la resposta no és OK (error de xarxa, Worker caigut...)
            if (!resposta.ok) throw new Error(`Error API: ${resposta.status}`);

            // .json() → converteix la resposta de text JSON a objecte JS
            // Guarda a window.DADES_MENU → accessible des de qualsevol fitxer
            window.DADES_MENU = await resposta.json();
            return window.DADES_MENU;

        } catch (error) {
            console.error("Error al mòdul API:", error);
            return null; // Retorna null si ha fallat — el codi que crida ha de gestionar-ho
        }
    },

    /* ════════════════════════════════════════════════════════
       FUNCIÓ: filtrar(camp)
       Filtra les dades JA CARREGADES a memòria.
       Zero crides al Worker — tot és local.
       Rep el nom d'un camp booleà d'Airtable (ex: "Carta",
       "Menu_Diari", "Vins") i retorna els registres on
       aquell camp és true I Visible també és true.
       Si no rep cap camp → retorna tots els registres.
       ════════════════════════════════════════════════════════ */
    filtrar(camp) {
        // Si no hi ha dades carregades → retorna llista buida
        if (!window.DADES_MENU) return [];

        // Si no es passa cap camp → retorna tots els registres sense filtrar
        if (!camp) return window.DADES_MENU;

        // Filtra localment: camp === true I Visible === true
        // r.fields → els camps del registre d'Airtable
        return window.DADES_MENU.filter(r =>
            r.fields &&
            r.fields[camp] === true &&
            r.fields.Visible === true
        );
    },

    /* ════════════════════════════════════════════════════════
       FUNCIÓ: llegir(tipus)
       Funció de compatibilitat — per si algun lloc del codi
       antic encara crida llegir() en lloc de filtrar().
       Fa el mateix que carregarTot() + filtrar() junts.
       Es pot eliminar quan tot el codi usi carregarTot/filtrar.
       ════════════════════════════════════════════════════════ */
    async llegir(tipus = "") {
        await this.carregarTot();
        return tipus ? this.filtrar(tipus) : window.DADES_MENU;
    }
};