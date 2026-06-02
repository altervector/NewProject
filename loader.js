/* ============================================================
   LOADER.JS - Carregador universal de pàgines
   No tocar — funciona igual per a tots els projectes
   Depèn de: config.js (ha de carregar-se abans)

   QUÈ FA AQUEST FITXER:
   1. Comprova que el domini sigui autoritzat (anti-còpia)
   2. Carrega el CSS amb anti-caché
   3. Carrega els mòduls JS definits a window.MODULS
   4. Treu el vel (body invisible → visible)

   PER QUÈ ÉS UNIVERSAL:
   No té cap referència específica a cap projecte.
   Tot el que necessita ve de CONFIG i window.MODULS,
   que cada pàgina defineix abans de carregar loader.js.
   ============================================================ */

/* ─── BOMBOLLA PRIVADA ─────────────────────────────────────────
   Tot s'executa dins una IIFE per no contaminar l'àmbit global.
   No exposa res a window — només executa i desapareix.
   ─────────────────────────────────────────────────────────────── */
(function() {

    /* ════════════════════════════════════════════════════════
       BLOC 1 — COMPROVACIÓ DE CONFIG
       Si config.js no s'ha carregat abans que loader.js,
       CONFIG no existirà i sortim immediatament.
       Equivalent VB6: If IsEmpty(CONFIG) Then Exit Sub
       ════════════════════════════════════════════════════════ */
    if (typeof CONFIG === 'undefined') return;


    /* ════════════════════════════════════════════════════════
       BLOC 2 — SEGURETAT ANTI-CÒPIA
       Comprova que el domini actual estigui a la llista
       SITIOS_SEGUROS del config.js.
       Si no hi és → esborra tot el contingut de la pàgina
       i redirigeix a la URL oficial.
       Protegeix contra qui copiï els fitxers i els posi
       en un altre servidor sense permís.
       .some() → retorna true si ALGUN element compleix la condició
       .includes() → comprova si el text conté la cadena
       ════════════════════════════════════════════════════════ */
    if (CONFIG.SITIOS_SEGUROS.length > 0) {
        const esSitioSeguro = CONFIG.SITIOS_SEGUROS.some(s =>
            window.location.hostname.includes(s));

        if (!esSitioSeguro) {
            document.documentElement.innerHTML = ""; // Esborra tot el contingut visible
            if (CONFIG.URL_OFICIAL) window.location.href = CONFIG.URL_OFICIAL; // Redirigeix
            return;
        }
    }


    /* ════════════════════════════════════════════════════════
       BLOC 3 — ANTI-CACHÉ
       El navegador guarda còpies locals dels fitxers (caché)
       per carregar més ràpid. Però si canviem el codi,
       el navegador pot seguir usant la versió antiga.
       Solució: afegir ?v=TIMESTAMP al final de cada URL.
       El navegador veu una URL diferent cada vegada →
       descarrega sempre la versió més recent.
       new Date().getTime() → número únic basat en l'hora actual
       ════════════════════════════════════════════════════════ */
    const now  = new Date().getTime();
    const base = CONFIG.BASE_URL;


    /* ════════════════════════════════════════════════════════
       BLOC 4 — CARREGAR CSS
       Crea una etiqueta <link> i la penja al <head>.
       Equivalent a escriure:
       <link rel="stylesheet" href="estils.css?v=123456789">
       ════════════════════════════════════════════════════════ */
    const css = document.createElement("link");
    css.rel   = "stylesheet";
    css.href  = base + "estils.css?v=" + now;
    document.head.appendChild(css);


    /* ════════════════════════════════════════════════════════
       BLOC 5 — CARREGAR MÒDULS JS
       window.MODULS és un array definit a cada pàgina HTML
       abans de carregar loader.js. Per exemple:
         window.MODULS = ['api.js', 'menulogic.js', 'main.js']
       Loader llegeix aquesta llista i carrega cada fitxer
       en ordre, amb anti-caché.
       s.async = false → garanteix que es carreguen en ordre,
       un darrere l'altre (important perquè api.js ha d'anar
       abans que menulogic.js, que depèn d'api.js)
       ════════════════════════════════════════════════════════ */
    const moduls = window.MODULS || []; // Si no hi ha MODULS definits → llista buida
    moduls.forEach(file => {
        const s  = document.createElement("script");
        s.src    = base + file + "?v=" + now;
        s.async  = false; // Ordre garantit — no paral·lelitza la càrrega
        document.head.appendChild(s);
    });


    /* ════════════════════════════════════════════════════════
       BLOC 6 — TREURE EL VEL
       El body comença invisible (opacity: 0 definit a l'HTML)
       per evitar que l'usuari vegi la pàgina a mig carregar.
       Quan tots els recursos estan llests → opacity: 1 → visible.
       Comprova l'estat del document:
       'complete' → tot carregat, actua ara
       sinó → espera l'event 'load' i actua quan acabi
       ════════════════════════════════════════════════════════ */
    if (document.readyState === 'complete') {
        document.body.style.opacity = "1";
    } else {
        window.addEventListener('load', () => {
            document.body.style.opacity = "1";
        });
    }

})();