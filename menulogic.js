/* ============================================================
   MENULOGIC.JS - Modal tipus full de paper per als menús
   Depèn de: config.js, api.js

   QUÈ FA AQUEST FITXER:
   1. Crea els dos modals (menú i login) i els afegeix a l'HTML
   2. Carrega totes les dades del Worker una sola vegada
   3. Gestiona l'obertura i tancament dels modals
   4. Gestiona el login de l'administrador
   5. Construeix el contingut HTML dels menús i la carta
   6. Exposa les funcions públiques que criden els botons del index.html
   ============================================================ */

/* ─── BOMBOLLA PRIVADA ─────────────────────────────────────────
   Tot el codi va dins d'una funció anònima autoexecutada (IIFE).
   Això crea un àmbit privat: res del que hi ha aquí és accessible
   des de fora, EXCEPTE el que té "window." davant.
   Equivalent VB6: mòdul privat amb Sub's Public i Private.
   (function() { ... })()  →  s'executa sola en carregar el fitxer
   ─────────────────────────────────────────────────────────────── */
(function() {

    /* ════════════════════════════════════════════════════════
       BLOC 1 — CREACIÓ DELS MODALS (s'executa en carregar)
       Els modals es creen aquí al JS i es pengen al final del
       body de l'HTML. Així tot el que necessita menulogic.js
       ve inclòs — no cal afegir res a l'HTML manualment.
       ════════════════════════════════════════════════════════ */

    // ─── MODAL MENÚ ──────────────────────────────────────────
    // Comprova si ja existeix abans de crear-lo (protecció anti-duplicat)
    // ! = NO. Si NO existeix → el crea. Si ja existia → se la salta.
    // insertAdjacentHTML('beforeend') → penja el nou HTML al final del body
    if (!document.getElementById('modal-menu')) {
        document.body.insertAdjacentHTML('beforeend', `
<div id="modal-menu" style="display:none; position:fixed; top:0; left:0; 
    width:100%; height:100%; background:rgba(0,0,0,0.2); z-index:9999;
    align-items:flex-start; justify-content:center; padding:40px 20px;
    overflow-y:auto;">
    <!-- Div exterior: capa fosca que cobreix tota la pantalla -->
    <!-- display:none → invisible fins que s'obri -->
    <div id="modal-menu-paper" style="
        background: #e9e2d5;
        width: 100%;
        max-width: 550px;
        border-radius: 0;
        padding: 50px 45px;
        box-shadow: -1px 2px 8px rgba(0, 0, 0, 0.8);
        font-family: Georgia, serif;
        position: relative;">
        <!-- Div interior: el "full de paper" visible amb el contingut -->
                    <button onclick="tancarModalMenu()" style="position:absolute; 
                        top:12px; right:16px; background:none; border:none; 
                        font-size:20px; cursor:pointer; color:#FF0303; 
                        font-family:sans-serif;">✕</button>
                    <!-- Recipient buit — s'omple dinàmicament per pintarMenu() o pintarCarta() -->
                    <div id="modal-menu-contingut"></div>
                </div>
            </div>
        `);
    }

    // ─── MODAL LOGIN ─────────────────────────────────────────
    // Mateix patró que el modal menú — comprova, crea i penja al body
    // Aquest modal té z-index més alt (99999) per quedar per damunt de tot
    if (!document.getElementById('modal-login')) {
        document.body.insertAdjacentHTML('beforeend', `
            <div id="modal-login" style="display:none; position:fixed; top:0; left:0;
                width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:99999;
                align-items:center; justify-content:center;">
                <div style="
                    background: #1a1a2e;
                    border: 1px solid #c8973a;
                    padding: 40px 30px;
                    width: 90%;
                    max-width: 320px;
                    text-align: center;
                    font-family: 'Segoe UI', sans-serif;">
                    <!-- Logo agafat de CONFIG -->
                    <img src="${CONFIG.ASSETS}${CONFIG.LOGO}" alt="${CONFIG.NOM}"
                        style="height:60px; margin: 0 auto 20px auto; display:block;">
                    <p style="color:#c8973a; letter-spacing:2px; text-transform:uppercase;
                        font-size:12px; margin-bottom:20px;">Accés restringit</p>
                    <!-- Input de contrasenya — els atributs auto* eviten correccions del mòbil -->
                    <input id="login-input" type="text" placeholder="Contrasenya"
                        autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
                        style="width:100%; padding:10px; background:#0d0d1a; border:1px solid #444;
                        color:#eee; font-size:14px; outline:none; margin-bottom:12px;
                        text-align:center; letter-spacing:2px;
                        -webkit-text-security: disc;">
                    <button id="login-boto"
                        style="width:100%; padding:10px; background:#2c3e35; color:#c8973a;
                        border:1px solid #c8973a; font-size:13px; letter-spacing:1px;
                        cursor:pointer; text-transform:uppercase;">
                        Entrar
                    </button>
                    <!-- Missatge d'error — buit per defecte, s'omple si la clau és incorrecta -->
                    <p id="login-error" style="color:#e74c3c; font-size:12px;
                        margin-top:12px; min-height:18px;"></p>
                    <button onclick="tancarModalLogin()"
                        style="margin-top:16px; background:none; border:none;
                        color:#555; font-size:12px; cursor:pointer; letter-spacing:1px;">
                        Cancel·lar
                    </button>
                </div>
            </div>
        `);
    }


    /* ════════════════════════════════════════════════════════
       BLOC 2 — CÀRREGA DE DADES (s'executa en carregar)
       Una sola crida al Worker quan es carrega la pàgina.
       Les dades queden guardades a memòria (API intern).
       Tots els modals filtraran localment — zero crides extra.
       ════════════════════════════════════════════════════════ */

    API.carregarTot();


    /* ════════════════════════════════════════════════════════
       BLOC 3 — FUNCIONS DE TANCAR MODALS (públiques)
       Canvien display a 'none' → el modal existeix però invisible.
       Són públiques (window.) perquè les criden botons de l'HTML.
       Equivalent VB6: Public Sub tancarModal()
       ════════════════════════════════════════════════════════ */

    // ─── TANCAR MODAL MENÚ ───────────────────────────────────
    window.tancarModalMenu = function() {
        document.getElementById('modal-menu').style.display = 'none';
    };

    // ─── TANCAR MODAL LOGIN ──────────────────────────────────
    window.tancarModalLogin = function() {
        document.getElementById('modal-login').style.display = 'none';
    };


    /* ════════════════════════════════════════════════════════
       BLOC 4 — OBRIR MODAL LOGIN (pública)
       Comprova si ja hi ha sessió activa.
       Si sí → va directe a admin.html sense mostrar el modal.
       Si no → mostra el modal i posa el focus a l'input.
       ════════════════════════════════════════════════════════ */

    window.obrirModalLogin = function() {
        // sessionStorage.getItem → llegeix una dada guardada en aquesta sessió
        // Si admin_clau existeix → ja estem logats → va directe a l'admin
        if (sessionStorage.getItem('admin_clau')) {
            window.location.href = 'admin.html';
            return; // Surt de la funció aquí — no continua
        }
        const modal = document.getElementById('modal-login');
        const input = document.getElementById('login-input');
        const error = document.getElementById('login-error');
        error.textContent = '';  // Neteja missatge d'error anterior
        input.value = '';        // Buida l'input
        modal.style.display = 'flex'; // Fa visible el modal
        // setTimeout: espera 100ms abans de posar el focus
        // Necessari perquè el modal acabi d'apareixer abans que el teclat
        setTimeout(() => input.focus(), 100);
    };


    /* ════════════════════════════════════════════════════════
       BLOC 5 — LÒGICA LOGIN (privada)
       S'executa quan l'usuari prem "Entrar" o la tecla Enter.
       És async perquè ha d'esperar la resposta del Worker.
       Equivalent VB6: Private Sub fer_login() amb DoEvents
       ════════════════════════════════════════════════════════ */

    const fer_login = async () => {
        const input = document.getElementById('login-input');
        const error = document.getElementById('login-error');

        // .trim() elimina espais en blanc accidentals al principi i al final
        const clauEscrita = input.value.trim();

        // Si l'input és buit → surt sense fer res
        // ! = NO. if (!clauEscrita) = si clauEscrita NO té valor
        // Equivalent VB6: If clauEscrita = "" Then Exit Sub
        if (!clauEscrita) return;

        // ─── Detecció mode superadmin ─────────────────────────
        // Si la clau acaba amb 'z' → mode superadmin (accés ampliat)
        // La 'z' es treu abans d'enviar la clau al Worker
        // Exemple: clau "00000z" → esSuper=true, clauReal="00000"
        const esSuper  = clauEscrita.endsWith('z');
        const clauReal = esSuper ? clauEscrita.slice(0, -1) : clauEscrita;
        //                         ↑ si és super         ↑ si no és super
        //  ? = llavors            slice(0,-1) = treu l'últim caràcter

        error.textContent = '⏳ Verificant...';

        // try/catch → intenta fer-ho, si peta per qualsevol motiu → catch
        // Equivalent VB6: On Error GoTo GestioError
        try {
            // await → espera la resposta del Worker abans de continuar
            // encodeURIComponent → converteix caràcters especials per viatjar per URL
            // "res" (response) → objecte amb diverses propietats: res.ok, res.text()...
            const res = await fetch(`${CONFIG.BASE_WORKER}/login?p=${encodeURIComponent(clauReal)}`);

            // res.ok → la resposta ha arribat sense errors tècnics (HTTP 200)
            // res.text() === 'OK' → el Worker ha confirmat que la clau és correcta
            // && → les dues condicions han de ser certes alhora
            if (res.ok && (await res.text()) === 'OK') {
                // Login correcte → guarda la sessió i va a l'admin
                sessionStorage.setItem('admin_clau', clauReal);                    // Sessió activa mentre el navegador estigui obert
                localStorage.setItem('admin_super', esSuper ? 'true' : 'false');   // Superadmin? Guarda permanent al navegador
                tancarModalLogin();
                window.location.href = 'admin.html';
            } else {
                // Clau incorrecta → mostra error i torna el focus a l'input
                error.textContent = '❌ Clau incorrecta';
                input.value = '';
                input.focus();
            }
        } catch (e) {
            // Error de connexió (Worker no respon, sense internet...)
            error.textContent = '❌ Error de connexió';
        }
    };

    // ─── EVENTS DEL LOGIN ────────────────────────────────────
    // addEventListener → "escolta" quan passa alguna cosa i executa una funció
    // Equivalent VB6: Private Sub boto_Click() / Private Sub input_KeyDown()
    document.getElementById('login-boto').addEventListener('click', fer_login);
    document.getElementById('login-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') fer_login(); // Enter = mateix efecte que el botó
    });


    /* ════════════════════════════════════════════════════════
       BLOC 6 — PINTAR MENÚ (privada)
       Construeix l'HTML del modal per als menús (sense preus per plat).
       Rep: registres (dades d'Airtable) + titol (text capçalera)
       Retorna: string HTML llest per injectar al modal
       ════════════════════════════════════════════════════════ */

    const pintarMenu = function(registres, titol) {

        // Objecte buit per agrupar plats per secció: { "Primer": [...], "Segon": [...] }
        const grups = {};
        // Array buit per guardar els registres de la secció "Peu" (peu de pàgina del menú)
        const peus = [];

        // Recorre cada registre d'Airtable i el classifica
        // forEach → per cada element de la llista, executa la funció. Equivalent VB6: For Each
        registres.forEach(r => {
            // Airtable pot enviar Seccio com array ["Primer"] o com text "Primer"
            // Array.isArray comprova quin format és i ho normalitza
            const seccio = Array.isArray(r.fields.Seccio) ? r.fields.Seccio[0] : (r.fields.Seccio || 'Altres');

            if (seccio === 'Peu') {
                peus.push(r.fields); // push → afegeix al final de l'array
            } else {
                if (!grups[seccio]) grups[seccio] = []; // Si el calaix no existeix → el crea buit
                grups[seccio].push(r.fields);           // Afegeix el plat al calaix corresponent
            }
        });

        // Ordre fix de seccions — només es mostren les que tenen dades
        // .filter → retorna només les seccions que existeixen a grups
        const ordreSeccions = ['Entrants', 'Primer', 'Segon', 'Postres'];
        const seccionsOrdenades = ordreSeccions.filter(s => grups[s]);

        // Construeix l'HTML afegint trossos un darrere l'altre
        // let (no const) perquè el valor anirà creixent amb +=
        let html = `
            <div style="text-align:center; margin-bottom:30px; 
                border-bottom: 1px solid #c8b99a; padding-bottom:20px;">
                <h2 style="font-size:1.4rem; color:#2c3e35; letter-spacing:3px; 
                    text-transform:uppercase; margin:0; font-weight:normal;">
                    ${titol}
                </h2>
                <p style="color:#aaa; font-size:11px; margin-top:8px; 
                    font-family:sans-serif; letter-spacing:1px;">
                    ${CONFIG.NOM}
                </p>
            </div>
        `;

        // Per cada secció → afegeix el títol i els plats
        seccionsOrdenades.forEach(seccio => {
            html += `
                <div style="margin-bottom:22px;">
                    <h3 style="font-size:0.85rem; letter-spacing:3px; 
                        text-transform:uppercase; color:var(--color-daurat); 
                        border-bottom:1px solid #e3b450; padding-bottom:6px; 
                        margin-bottom:12px; font-family:sans-serif; font-weight:normal; text-align:center;">
                        ${seccio}
                    </h3>
            `;

            // Per cada plat de la secció → afegeix la línia del nom
            grups[seccio].forEach(plat => {
                html += `
                    <p style="margin:0 0 8px 0; font-size:0.95rem; color:#2a2a2a; 
                        line-height:1.4; text-align:center;">
                        ${plat.Nom || ''}
                    </p>
                `;
            });

            html += `</div>`;
        });

        // Si hi ha peu → afegeix el bloc final amb la descripció i el preu del menú
        if (peus.length > 0) {
            html += `
                <div style="margin-top:30px; padding-top:20px; 
                    border-top:1px solid #c8b99a; text-align:center;">
            `;
            peus.forEach(p => {
                html += `
                    <p style="font-size:0.85rem; color:#555; font-family:sans-serif; 
                        line-height:1.8; margin:0 0 6px 0;">
                        ${p.Nom || ''}
                    </p>
                    ${p.Preu ? `
                    <p style="font-size:1.3rem; color:#2c3e35; font-weight:bold; 
                        margin:0 0 10px 0; letter-spacing:1px;">
                        ${p.Preu} €
                        <span style="font-size:0.75rem; color:#999; font-weight:normal; 
                            font-family:sans-serif;">(IVA inclòs)</span>
                    </p>` : ''}
                `;
            });
            html += `</div>`;
        }

        return html; // Retorna l'HTML construït per a obrirModal()
    };


    /* ════════════════════════════════════════════════════════
       BLOC 7 — PINTAR CARTA (privada)
       Igual que pintarMenu però mostra el preu de cada plat.
       Té la seva pròpia llista de seccions (carta completa).
       Inclou traducció de noms de seccions (Cocteles → Còctels...)
       ════════════════════════════════════════════════════════ */

    const pintarCarta = function(registres, titol) {

        const grups = {};
        const peus = [];

        // Mateix patró de classificació que pintarMenu
        registres.forEach(r => {
            const seccio = Array.isArray(r.fields.Seccio) ? r.fields.Seccio[0] : (r.fields.Seccio || 'Altres');
            if (seccio === 'Peu') {
                peus.push(r.fields);
            } else {
                if (!grups[seccio]) grups[seccio] = [];
                grups[seccio].push(r.fields);
            }
        });

        // Ordre de seccions específic per a la carta completa
        const ordreSeccions = ['Para picar', 'Combinados', 'Cocas', 'Hamburguesas', 'Fríos','Postres','Cocteles','Vins Blancs','Vins Negres','Vins Rosats','Vins Escumosos'];
        const seccionsOrdenades = ordreSeccions.filter(s => grups[s]);

        let html = `
            <div style="text-align:center; margin-bottom:30px; 
                border-bottom:1px solid #c8b99a; padding-bottom:20px;">
                <h2 style="font-size:1.4rem; color:#2c3e35; letter-spacing:3px; 
                    text-transform:uppercase; margin:0; font-weight:normal;">
                    ${titol}
                </h2>
                <p style="color:#aaa; font-size:11px; margin-top:8px; 
                    font-family:sans-serif; letter-spacing:1px;">
                    ${CONFIG.NOM}
                </p>
            </div>
        `;

        seccionsOrdenades.forEach(seccio => {
            html += `
                <div style="margin-bottom:22px;">
                    <h3 style="font-size:0.85rem; letter-spacing:3px; 
                        text-transform:uppercase; color:var(--color-daurat); 
                        border-bottom:1px solid #e3b450; padding-bottom:6px; 
                        margin-bottom:12px; font-family:sans-serif; font-weight:normal;">
                        ${seccio === 'Cocteles' ? 'Còctels' :
                            seccio === 'Para picar' ? 'Per Picar' :
                            seccio === 'Combinados' ? 'Combinats' :
                            seccio === 'Fríos' ? 'Freds' :
                            seccio}
                    </h3>
                    <!-- Traducció inline: condicions encadenades amb ? :
                         si és 'Cocteles' → 'Còctels', si no mira el següent...
                         si és 'Para picar' → 'Per Picar', si no mira el següent...
                         al final, si no és cap d'aquests → mostra el nom original -->
            `;

            // Cada plat mostra nom A L'ESQUERRA i preu A LA DRETA (display:flex)
            grups[seccio].forEach(plat => {
                html += `
                    <div style="display:flex; justify-content:space-between; 
                        align-items:baseline; margin-bottom:10px;">
                        <span style="font-size:0.95rem; color:#2a2a2a;">
                            ${plat.Nom || ''}
                        </span>
                        ${plat.Preu ? `
                        <span style="font-size:0.9rem; color:#2c3e35; font-weight:bold; 
                            margin-left:15px; white-space:nowrap; font-family:sans-serif;">
                            ${plat.Preu} €
                        </span>` : ''}
                    </div>
                `;
            });

            html += `</div>`;
        });

        // Peu de la carta (notes, condicions...)
        if (peus.length > 0) {
            html += `
                <div style="margin-top:30px; padding-top:20px; 
                    border-top:1px solid #c8b99a; text-align:center;">
            `;
            peus.forEach(p => {
                html += `
                    <p style="font-size:0.85rem; color:#555; font-family:sans-serif; 
                        line-height:1.8; margin:0 0 6px 0;">
                        ${p.Nom || ''}
                    </p>
                `;
            });
            html += `</div>`;
        }

        return html;
    };


    /* ════════════════════════════════════════════════════════
       BLOC 8 — OBRIR MODAL (privada)
       Director d'orquestra: coordina tot el procés d'obrir un modal.
       1. Mostra el modal amb spinner (mentre carrega)
       2. Espera les dades (o les agafa de memòria si ja hi són)
       3. Filtra les dades pel tipus demanat
       4. Injecta l'HTML generat per pintarMenu o pintarCarta
       ════════════════════════════════════════════════════════ */

    // async → aquesta funció pot esperar respostes externes (await)
    // esCarta = false → valor per defecte si no es passa el tercer paràmetre
    const obrirModal = async function(tipus, titol, esCarta = false) {
        const modal = document.getElementById('modal-menu');
        const contingut = document.getElementById('modal-menu-contingut');

        // Mostra el spinner mentre es carreguen les dades
        // El modal ja és visible (display:flex) però amb el cercle animat
        contingut.innerHTML = `
            <div style="text-align:center; padding:40px;">
                <div style="width:32px; height:32px; border:3px solid #ddd;
                    border-top-color:#c8973a; border-radius:50%;
                    animation:gir 0.8s linear infinite; margin:0 auto;">
                </div>
            </div>`;
        modal.style.display = 'flex';

        // await → espera fins que carregarTot() acabi
        // Si les dades ja estan a memòria, retorna instantàniament
        const totes = await API.carregarTot();
        if (!totes) {
            contingut.innerHTML = `
                <p style="text-align:center; color:#999; font-family:sans-serif;">
                    No hi ha dades disponibles.
                </p>`;
            return;
        }

        // Filtra localment per tipus (Menu_Diari, Carta, Vins...)
        // Zero crides extra al Worker
        const registres = API.filtrar(tipus);
        if (!registres || registres.length === 0) {
            contingut.innerHTML = `
                <p style="text-align:center; color:#999; font-family:sans-serif;">
                    No hi ha dades disponibles.
                </p>`;
            return;
        }

        // Injecta l'HTML generat al recipient del modal
        // esCarta ? pintarCarta : pintarMenu → if en una línia (operador ternari)
        contingut.innerHTML = esCarta
            ? pintarCarta(registres, titol)
            : pintarMenu(registres, titol);
    };


    /* ════════════════════════════════════════════════════════
       BLOC 9 — FUNCIONS PÚBLIQUES (portes d'entrada)
       Aquestes són les úniques funcions visibles des de fora.
       Els botons del index.html les criden directament.
       Cada una simplement delega a obrirModal amb els seus paràmetres.
       Equivalent VB6: Public Sub obrirModalMenuDiari()
       ════════════════════════════════════════════════════════ */

    window.obrirModalMenuDiari = () => obrirModal('Menu_Diari', 'Menú Diari');
    window.obrirModalMenuCDS   = () => obrirModal('Menu_CDS',   'Menú Cap de Setmana');
    window.obrirModalMenuGrups = () => obrirModal('Menu_Grups', 'Menú de Grups');
    window.obrirModalCarta     = () => obrirModal('Carta',      'La Nostra Carta',     true);
    window.obrirModalVins      = () => obrirModal('Vins',       'Vins i Caves',        true);
    window.obrirModalCocteles  = () => obrirModal('Cocteles',   'Còctels',             true);

})();