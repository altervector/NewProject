/* ============================================================
   ADMINLOGIC.JS - Panel d'administració de Àgora
   Depèn de: config.js, api.js

   QUÈ FA AQUEST FITXER:
   1. Injecta els estils CSS del panel d'admin
   2. Gestiona el login de l'administrador
   3. Mostra la taula de plats amb tots els camps editables
   4. Acumula els canvis localment abans d'enviar
   5. Envia els canvis al Worker en lots de 10 (límit d'Airtable)
   6. Gestiona el modal de creació de nous plats

   FLUX PRINCIPAL:
   inicialitzar() → té clau guardada?
     SÍ → valida contra Worker → mostrarTaula()
     NO → mostrarLogin() → login correcte → mostrarTaula()
   ============================================================ */

/* ─── BOMBOLLA PRIVADA ─────────────────────────────────────────
   Tot el codi és privat excepte window.CANVIS_PENDENTS
   que és accessible des de fora per si cal consultar-lo.
   ─────────────────────────────────────────────────────────────── */
(function() {

    /* ════════════════════════════════════════════════════════
       BLOC 1 — ESTILS CSS
       Els estils es creen per JS i es pengen al <head>.
       Equivalent a tenir un <style> a l'HTML, però tot
       queda dins el mateix fitxer JS sense tocar l'HTML.
       document.createElement('style') → crea l'etiqueta
       document.head.appendChild() → la penja al <head>
       ════════════════════════════════════════════════════════ */
    const estils = document.createElement('style');
    estils.textContent = `
        * { box-sizing: border-box; margin: 0; padding: 0; }

        html { background-image: none; background: #1a1a2e; }

        body {
            background: #1a1a2e;
            color: #eee;
            font-family: 'Segoe UI', sans-serif;
            font-size: 13px;
            padding: 20px;
            overflow-x: auto;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            min-width: 900px;
        }

        thead tr {
            background: #2c3e35;
            color: #c8973a;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-size: 11px;
        }

        th {
            position: sticky;
            top: 48px;
            z-index: 10;
            background: #2c3e35;
        }

        th, td {
            padding: 8px 10px;
            border-bottom: 1px solid #2a2a3e;
            text-align: left;
            white-space: nowrap;
        }

        tbody tr:hover { background: #22223a; }
        tbody tr.guardant { background: #2c3e20; }

        input[type="text"],
        input[type="number"],
        select {
            background: transparent;
            border: none;
            color: #eee;
            font-size: 13px;
            width: 100%;
            outline: none;
            padding: 2px 4px;
        }

        input[type="text"]:focus,
        input[type="number"]:focus,
        select:focus {
            background: #2a2a4a;
            border-bottom: 1px solid #c8973a;
        }

        /* ─── Eliminar fletxes del camp preu (tots els navegadors) ─── */
        input[type="number"] { -moz-appearance: textfield; }
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }

        input[type="checkbox"] {
            width: 16px;
            height: 16px;
            cursor: pointer;
            accent-color: #c8973a;
        }

        .col-nom    { min-width: 160px; }
        .col-preu   { width: 70px; }
        .col-ordre  { width: 55px; }
        .col-check  { width: 80px; text-align: center; }
        .col-seccio { width: 110px; }
        .col-delete { width: 40px; text-align: center; }

        /* ─── BARRA STICKY ─── */
        #admin-barra {
            position: sticky;
            top: 0;
            z-index: 20;
            background: #0d0d1a;
            border-bottom: 1px solid #2a2a3e;
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 10px;
            margin: -20px -20px 10px -20px;
        }

        #btn-nou {
            background: none;
            color: #c8973a;
            border: 1px solid #c8973a;
            padding: 6px 16px;
            font-size: 12px;
            letter-spacing: 1px;
            cursor: pointer;
            text-transform: uppercase;
        }
        #btn-nou:hover { background: #c8973a; color: #1a1a2e; }

        #btn-guardar {
            background: #2c3e35;
            color: #555;
            border: 1px solid #555;
            padding: 6px 16px;
            font-size: 12px;
            letter-spacing: 1px;
            cursor: not-allowed;
            text-transform: uppercase;
        }
        #btn-guardar.actiu { color: #c8973a; border-color: #c8973a; cursor: pointer; }
        #btn-guardar.actiu:hover { background: #c8973a; color: #1a1a2e; }

        #btn-descartar {
            background: none;
            color: #555;
            border: 1px solid #333;
            padding: 6px 16px;
            font-size: 12px;
            letter-spacing: 1px;
            cursor: not-allowed;
            text-transform: uppercase;
        }
        #btn-descartar.actiu { color: #e74c3c; border-color: #e74c3c; cursor: pointer; }
        #btn-descartar.actiu:hover { background: #e74c3c; color: white; }

        #btn-recarregar {
            margin-left: auto;
            background: none;
            color: #555;
            border: 1px solid #333;
            padding: 6px 16px;
            font-size: 12px;
            letter-spacing: 1px;
            cursor: pointer;
            text-transform: uppercase;
        }
        #btn-recarregar:hover { color: #c8973a; border-color: #c8973a; }

        #admin-comptador { font-size: 11px; color: #555; letter-spacing: 1px; }

        #admin-estat {
            position: fixed;
            top: 60px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 100;
            font-size: 16px;
            font-weight: bold;
            color: #c8973a;
            letter-spacing: 1px;
            padding: 6px 16px;
            pointer-events: none;
        }

        /* ─── CEL·LA AMB CANVI PENDENT ─── */
        .pendent { outline: 2px solid #ff0000 !important; }

        /* ─── FILA MARCADA PER ELIMINAR ─── */
        tr.per-eliminar td { opacity: 0.4; text-decoration: line-through; }

        /* ─── BOTÓ DELETE ─── */
        .btn-delete {
            background: none;
            border: none;
            color: #555;
            font-size: 15px;
            cursor: pointer;
            padding: 2px 6px;
            line-height: 1;
        }
        .btn-delete:hover { color: #e74c3c; }
        .btn-delete.marcat { color: #e74c3c; }

        /* ─── MODAL NOU PLAT ─── */
        #modal-nou-plat {
            display: none;
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: rgba(0,0,0,0.85);
            z-index: 999;
            align-items: center;
            justify-content: center;
        }

        #modal-nou-plat .modal-caixa {
            background: #0d0d1a;
            border: 1px solid #c8973a;
            width: 90%;
            max-width: 400px;
            padding: 30px;
            display: flex;
            flex-direction: column;
            gap: 14px;
            font-family: 'Segoe UI', sans-serif;
        }

        #modal-nou-plat h2 {
            color: #c8973a;
            font-size: 13px;
            letter-spacing: 2px;
            text-transform: uppercase;
            font-weight: normal;
            margin: 0;
        }

        #modal-nou-plat input[type="text"],
        #modal-nou-plat input[type="number"],
        #modal-nou-plat select {
            width: 100%;
            background: #1a1a2e;
            border: 1px solid #333;
            color: #eee;
            font-size: 13px;
            padding: 8px 10px;
            outline: none;
            font-family: 'Segoe UI', sans-serif;
        }

        #modal-nou-plat input:focus,
        #modal-nou-plat select:focus { border-color: #c8973a; }

        #modal-nou-plat .modal-fila {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        #modal-nou-plat .modal-boto-crear {
            background: #2c3e35;
            color: #555;
            border: 1px solid #555;
            padding: 10px;
            font-size: 12px;
            letter-spacing: 1px;
            text-transform: uppercase;
            cursor: not-allowed;
            width: 100%;
        }
        #modal-nou-plat .modal-boto-crear.actiu {
            color: #c8973a;
            border-color: #c8973a;
            cursor: pointer;
        }
        #modal-nou-plat .modal-boto-crear.actiu:hover {
            background: #c8973a;
            color: #1a1a2e;
        }

        #modal-nou-plat .modal-boto-cancel {
            background: none;
            border: none;
            color: #555;
            font-size: 12px;
            cursor: pointer;
            letter-spacing: 1px;
            text-align: center;
            width: 100%;
            padding: 6px;
        }
        #modal-nou-plat .modal-boto-cancel:hover { color: #e74c3c; }
    `;
    document.head.appendChild(estils);


    /* ════════════════════════════════════════════════════════
       BLOC 2 — VARIABLES GLOBALS
       registres → còpia local de tots els plats d'Airtable
       CANVIS_PENDENTS → objecte públic que acumula els canvis
         fets a la taula abans d'enviar-los.
         Format: { "idRegistre": { camp: valor, ... }, ... }
       ════════════════════════════════════════════════════════ */
    let registres = [];
    window.CANVIS_PENDENTS = {};


    /* ════════════════════════════════════════════════════════
       BLOC 3 — GESTIÓ DE LA BARRA I CANVIS PENDENTS
       actualitzarBarra() → recompta els canvis i actualitza
         el comptador i l'estat dels botons Guardar/Descartar.
         Si hi ha canvis → botons actius (daurats)
         Si no hi ha canvis → botons inactius (grisos)
       marcarPendent() → posa el marc vermell a la cel·la editada
       desmarcarPendents() → treu tots els marcs vermells
       acumularCanvi() → afegeix un canvi a CANVIS_PENDENTS
         Object.assign → fusiona el canvi nou amb els existents
         del mateix registre sense sobreescriure els altres
       ════════════════════════════════════════════════════════ */
    const actualitzarBarra = () => {
        // Object.values → llista de valors de l'objecte
        // Object.keys → llista de claus de l'objecte
        // .reduce → suma tots els camps pendents de tots els registres
        const total = Object.values(window.CANVIS_PENDENTS).reduce((acc, dades) => acc + Object.keys(dades).length, 0);
        const btnGuardar   = document.getElementById('btn-guardar');
        const btnDescartar = document.getElementById('btn-descartar');
        const comptador    = document.getElementById('admin-comptador');
        if (!btnGuardar) return;
        if (total > 0) {
            btnGuardar.classList.add('actiu');
            btnDescartar.classList.add('actiu');
            comptador.textContent = `${total} canvi${total > 1 ? 's' : ''} pendent${total > 1 ? 's' : ''}`;
        } else {
            btnGuardar.classList.remove('actiu');
            btnDescartar.classList.remove('actiu');
            comptador.textContent = '';
        }
    };

    const marcarPendent     = (el) => el.classList.add('pendent');
    const desmarcarPendents = () => {
        document.querySelectorAll('.pendent').forEach(el => el.classList.remove('pendent'));
    };

    const acumularCanvi = (id, dades, el) => {
        if (!id) return;
        if (!window.CANVIS_PENDENTS[id]) window.CANVIS_PENDENTS[id] = {};
        // Object.assign → afegeix/sobreescriu només els camps nous
        // sense perdre els canvis anteriors del mateix registre
        Object.assign(window.CANVIS_PENDENTS[id], dades);
        marcarPendent(el);
        actualitzarBarra();
    };


    /* ════════════════════════════════════════════════════════
       BLOC 4 — GUARDAR I DESCARTAR
       guardarTot() → envia tots els canvis pendents al Worker
         en lots de 10 (límit d'Airtable per crida)
         Si tot va bé → buida CANVIS_PENDENTS i treu marcs
         Si algun falla → avisa però no perd els altres canvis
       descartarCanvis() → buida CANVIS_PENDENTS i recarrega
         la pàgina per tornar a l'estat original d'Airtable
       ════════════════════════════════════════════════════════ */
    const guardarTot = async () => {
        const estat    = document.getElementById('admin-estat');
        const entrades = Object.entries(window.CANVIS_PENDENTS);
        if (entrades.length === 0) return;
        estat.textContent = '⏳ Guardant...';

        // Talla l'array en grups de 10 — límit d'Airtable per crida
        // slice(i, i+10) → agafa elements de la posició i fins a i+10
        const lots = [];
        for (let i = 0; i < entrades.length; i += 10) lots.push(entrades.slice(i, i + 10));

        let totOk = true;
        for (const lot of lots) {
            for (const [id, dades] of lot) {
                try {
                    // POST al Worker amb id + dades del registre
                    // JSON.stringify → converteix l'objecte a text JSON per enviar
                    // ...dades → spread, expandeix les propietats de dades dins l'objecte
                    const res = await fetch(CONFIG.BASE_WORKER, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id, ...dades })
                    });
                    if (!res.ok) totOk = false;
                } catch (e) { totOk = false; }
            }
        }

        if (totOk) {
            window.CANVIS_PENDENTS = {};
            desmarcarPendents();
            actualitzarBarra();
            estat.textContent = '✅ Tot guardat';
            setTimeout(() => estat.textContent = '', 2000);
        } else {
            estat.textContent = '❌ Algun canvi no s\'ha guardat';
        }
    };

    const descartarCanvis = () => {
        window.CANVIS_PENDENTS = {};
        location.reload(); // Recarrega la pàgina — torna a l'estat d'Airtable
    };


    /* ════════════════════════════════════════════════════════
       BLOC 5 — MODAL NOU PLAT
       obrirModalNouPlat() → neteja els camps i mostra el modal
       tancarModalNouPlat() → amaga el modal
       crearNouPlat() → envia el nou registre al Worker (POST sense id)
         Truc zzz: si el nom comença per "zzz" → activa mode
         superadmin sense crear cap plat
       nomInputHandler() → activa/desactiva el botó Crear
         segons si l'input de nom té contingut o no
       ════════════════════════════════════════════════════════ */
    const obrirModalNouPlat = () => {
        document.getElementById('modal-nom').value       = '';
        document.getElementById('modal-preu').value      = '';
        document.getElementById('modal-seccio').value    = 'Entrants';
        document.getElementById('modal-visible').checked = true;
        const btnCrear = document.getElementById('modal-btn-crear');
        btnCrear.classList.remove('actiu');
        btnCrear.disabled    = true;
        btnCrear.textContent = 'CREAR PLAT';
        document.getElementById('modal-nou-plat').style.display = 'flex';
        setTimeout(() => document.getElementById('modal-nom').focus(), 100);
    };

    const tancarModalNouPlat = () => {
        document.getElementById('modal-nou-plat').style.display = 'none';
    };

    const crearNouPlat = async () => {
        const nom = document.getElementById('modal-nom').value.trim();
        if (!nom) return;

        // ─── Truc superadmin ─────────────────────────────────
        // Si el nom comença per "zzz" → activa la columna Ordre
        // i recarrega sense crear cap plat
        if (nom.toLowerCase().startsWith('zzz')) {
            sessionStorage.setItem('admin_super', 'true');
            tancarModalNouPlat();
            location.reload();
            return;
        }

        const dades = {
            Nom:     nom,
            // parseFloat → converteix text a número decimal
            // .replace(',', '.') → per si l'usuari escriu "12,50" en lloc de "12.50"
            // || 0 → si no hi ha valor, usa 0
            Preu:    parseFloat(document.getElementById('modal-preu').value.replace(',', '.')) || 0,
            Seccio:  [document.getElementById('modal-seccio').value], // array d'un element (format Airtable)
            Visible: document.getElementById('modal-visible').checked
        };

        const btnCrear = document.getElementById('modal-btn-crear');
        btnCrear.textContent = '⏳ Creant...';
        btnCrear.classList.remove('actiu');
        btnCrear.disabled = true;

        try {
            // POST sense id → el Worker sap que és un registre NOU
            const res = await fetch(CONFIG.BASE_WORKER, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dades)
            });
            if (res.ok) {
                tancarModalNouPlat();
                location.reload(); // Recarrega per veure el nou plat a la taula
            } else {
                btnCrear.textContent = 'CREAR PLAT';
                btnCrear.classList.add('actiu');
                btnCrear.disabled = false;
                document.getElementById('admin-estat').textContent = '❌ Error al crear';
            }
        } catch (e) {
            btnCrear.textContent = 'CREAR PLAT';
            btnCrear.classList.add('actiu');
            btnCrear.disabled = false;
            document.getElementById('admin-estat').textContent = '❌ Error de connexió';
        }
    };

    // Activa el botó Crear només si l'input de nom té contingut
    const nomInputHandler = () => {
        const nom      = document.getElementById('modal-nom').value.trim();
        const btnCrear = document.getElementById('modal-btn-crear');
        if (nom) { btnCrear.classList.add('actiu'); btnCrear.disabled = false; }
        else     { btnCrear.classList.remove('actiu'); btnCrear.disabled = true; }
    };


    /* ════════════════════════════════════════════════════════
       BLOC 6 — CREAR FILA
       Construeix una fila <tr> completa per a cada registre.
       Cada cel·la té el seu input/select/checkbox amb l'event
       corresponent per detectar canvis i acumular-los.

       EVENTS USATS:
       onBlurText → detecta canvi en un input de text
         'blur' = quan l'usuari surt del camp (perd el focus)
       onBlurNum → igual però per camps numèrics
       onChangeCheck → detecta canvi en un checkbox
         'change' = quan el checkbox canvia d'estat
       onChangeSel → detecta canvi en un select
         'change' = quan es selecciona una opció diferent

       SUPERADMIN:
       La columna Ordre només és visible si esSuper === true
       ════════════════════════════════════════════════════════ */
    const crearFila = (r) => {
        const f  = r.fields || {};
        const id = r.id || null;

        // Comprova si és superadmin per mostrar/amagar la columna Ordre
        const esSuper = sessionStorage.getItem('admin_super') === 'true';

        // Normalitza el camp Seccio (pot arribar com array o com text)
        const getSeccio = (s) => Array.isArray(s) ? s[0] : (s || '');

        const fila = document.createElement('tr');
        if (id) fila.setAttribute('data-id', id); // Guarda l'id a la fila per identificar-la

        const seccions = ['Entrants', 'Primer', 'Segon','Para picar', 'Combinados', 'Cocas', 'Hamburguesas', 'Fríos', 'Postres', 'Vins Blancs','Vins Negres','Vins Rosats','Vins Escumosos','Cocteles', 'Peu'];

        // ─── Helpers d'events ────────────────────────────────
        // Cada helper guarda el valor original i el compara quan canvia
        // Només acumula si el valor és realment diferent

        // blur → quan l'usuari surt del camp de text
        const onBlurText = (camp, el) => {
            const valorOriginal = el.value;
            el.addEventListener('blur', () => {
                if (el.value !== valorOriginal) acumularCanvi(id, { [camp]: el.value }, el);
            });
        };

        // blur → quan l'usuari surt del camp numèric
        const onBlurNum = (camp, el) => {
            const valorOriginal = parseFloat(el.value) || 0;
            el.addEventListener('blur', () => {
                const valorNou = parseFloat(el.value) || 0;
                if (valorNou !== valorOriginal) acumularCanvi(id, { [camp]: valorNou }, el);
            });
        };

        // change → quan el checkbox canvia d'estat
        const onChangeCheck = (camp, el) => {
            const valorOriginal = el.checked;
            el.addEventListener('change', () => {
                if (el.checked !== valorOriginal) acumularCanvi(id, { [camp]: el.checked }, el);
            });
        };

        // change → quan es selecciona una opció diferent del select
        const onChangeSel = (camp, el) => {
            const valorOriginal = el.value;
            el.addEventListener('change', () => {
                if (el.value !== valorOriginal) acumularCanvi(id, { [camp]: [el.value] }, el); // array (format Airtable)
            });
        };

        // ─── Color del nom segons secció (definit a CONFIG) ──
        const colorSeccio = (CONFIG.COLORS_SECCIONS && CONFIG.COLORS_SECCIONS[getSeccio(f.Seccio)]) || '#eee';

        // ─── Construcció de cada cel·la ──────────────────────

        // Visible
        const cbVisible = document.createElement('input');
        cbVisible.type    = 'checkbox';
        cbVisible.checked = f.Visible === true;
        onChangeCheck('Visible', cbVisible);
        const tdVisible = document.createElement('td');
        tdVisible.className = 'col-check';
        tdVisible.appendChild(cbVisible);

        // Nom
        const inputNom = document.createElement('input');
        inputNom.type  = 'text';
        inputNom.value = f.Nom || '';
        onBlurText('Nom', inputNom);
        const tdNom = document.createElement('td');
        tdNom.className = 'col-nom';
        tdNom.appendChild(inputNom);
        inputNom.style.color = colorSeccio; // Color visual per identificar la secció

        // Ordre (només visible si esSuper)
        const inputOrdre = document.createElement('input');
        inputOrdre.type  = 'number';
        inputOrdre.step  = '1';
        inputOrdre.value = f.Ordre || 0;
        onBlurNum('Ordre', inputOrdre);
        const tdOrdre = document.createElement('td');
        tdOrdre.className = 'col-ordre';
        if (!esSuper) tdOrdre.style.display = 'none'; // Amaga la cel·la si no és superadmin
        tdOrdre.appendChild(inputOrdre);

        // Preu
        const inputPreu = document.createElement('input');
        inputPreu.type  = 'number';
        inputPreu.step  = '0.01';
        inputPreu.value = f.Preu || 0;
        onBlurNum('Preu', inputPreu);
        const tdPreu = document.createElement('td');
        tdPreu.className = 'col-preu';
        tdPreu.appendChild(inputPreu);

        // Menu_Diari
        const cbDiari = document.createElement('input');
        cbDiari.type    = 'checkbox';
        cbDiari.checked = f.Menu_Diari === true;
        onChangeCheck('Menu_Diari', cbDiari);
        const tdDiari = document.createElement('td');
        tdDiari.className = 'col-check';
        tdDiari.appendChild(cbDiari);

        // Menu_Grups
        const cbGrups = document.createElement('input');
        cbGrups.type    = 'checkbox';
        cbGrups.checked = f.Menu_Grups === true;
        onChangeCheck('Menu_Grups', cbGrups);
        const tdGrups = document.createElement('td');
        tdGrups.className = 'col-check';
        tdGrups.appendChild(cbGrups);

        // Seccio (select)
        const sel = document.createElement('select');
        seccions.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s; opt.textContent = s;
            if (getSeccio(f.Seccio) === s) opt.selected = true; // Marca l'opció actual
            sel.appendChild(opt);
        });
        onChangeSel('Seccio', sel);
        sel.style.color = colorSeccio;
        const tdSeccio = document.createElement('td');
        tdSeccio.className = 'col-seccio';
        tdSeccio.appendChild(sel);

        // Carta
        const cbCarta = document.createElement('input');
        cbCarta.type    = 'checkbox';
        cbCarta.checked = f.Carta === true;
        onChangeCheck('Carta', cbCarta);
        const tdCarta = document.createElement('td');
        tdCarta.className = 'col-check';
        tdCarta.appendChild(cbCarta);

        // Vins
        const cbVins = document.createElement('input');
        cbVins.type    = 'checkbox';
        cbVins.checked = f.Vins === true;
        onChangeCheck('Vins', cbVins);
        const tdVins = document.createElement('td');
        tdVins.className = 'col-check';
        tdVins.appendChild(cbVins);

        // Cocteles
        const cbCocteles = document.createElement('input');
        cbCocteles.type    = 'checkbox';
        cbCocteles.checked = f.Cocteles === true;
        onChangeCheck('Cocteles', cbCocteles);
        const tdCocteles = document.createElement('td');
        tdCocteles.className = 'col-check';
        tdCocteles.appendChild(cbCocteles);

        // Botó eliminar — funciona com a toggle (marcar/desmarcar)
        // Si ja està marcat → el desmarca i esborra el canvi pendent
        // Si no està marcat → el marca i acumula _delete: true
        const btnDel = document.createElement('button');
        btnDel.className   = 'btn-delete';
        btnDel.textContent = '🗑';
        btnDel.title       = 'Marcar per eliminar';
        btnDel.addEventListener('click', () => {
            if (fila.classList.contains('per-eliminar')) {
                fila.classList.remove('per-eliminar');
                btnDel.classList.remove('marcat');
                if (window.CANVIS_PENDENTS[id]) {
                    delete window.CANVIS_PENDENTS[id]; // Esborra el canvi pendent
                    actualitzarBarra();
                }
            } else {
                fila.classList.add('per-eliminar');
                btnDel.classList.add('marcat');
                acumularCanvi(id, { _delete: true }, btnDel); // _delete → el Worker sap que cal eliminar
            }
        });
        const tdDelete = document.createElement('td');
        tdDelete.className = 'col-delete';
        tdDelete.appendChild(btnDel);

        // Afegeix totes les cel·les a la fila en ordre
        fila.appendChild(tdVisible);
        fila.appendChild(tdNom);
        fila.appendChild(tdOrdre);
        fila.appendChild(tdPreu);
        fila.appendChild(tdDiari);
        fila.appendChild(tdGrups);
        fila.appendChild(tdSeccio);
        fila.appendChild(tdCarta);
        fila.appendChild(tdVins);
        fila.appendChild(tdCocteles);
        fila.appendChild(tdDelete);

        return fila; // Retorna la fila completa per afegir-la al tbody
    };


    /* ════════════════════════════════════════════════════════
       BLOC 7 — MOSTRAR LOGIN
       Construeix i mostra la pantalla d'accés restringit.
       Inclou la mateixa lògica de login que menulogic.js:
       - Detecció mode superadmin (clau acabada en 'z')
       - Validació contra el Worker
       - Si correcte → mostrarTaula() directament (sense reload)
       ════════════════════════════════════════════════════════ */
    const mostrarLogin = () => {
        document.body.style.opacity = '1';
        const panel = document.getElementById('admin-panel');
        if (!panel) return;

        panel.innerHTML = `
            <div style="display:flex; align-items:center; justify-content:center;
                min-height:100vh; padding:20px; margin:-20px;">
                <div style="background:#0d0d1a; border:1px solid #c8973a;
                    padding:40px 30px; width:90%; max-width:320px;
                    text-align:center; font-family:'Segoe UI', sans-serif;">
                    <img src="${CONFIG.ASSETS}${CONFIG.LOGO}" alt="${CONFIG.NOM}"
                        style="height:60px; margin:0 auto 20px auto; display:block;">
                    <p style="color:#c8973a; letter-spacing:2px; text-transform:uppercase;
                        font-size:12px; margin-bottom:20px;">Accés restringit</p>
                    <input id="login-input" type="text" placeholder="Contrasenya"
                        autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
                        style="width:100%; padding:10px; background:#0d0d1a; border:1px solid #444;
                        color:#eee; font-size:14px; outline:none; margin-bottom:12px;
                        text-align:center; letter-spacing:2px; -webkit-text-security:disc;">
                    <button id="login-boto"
                        style="width:100%; padding:10px; background:#2c3e35; color:#c8973a;
                        border:1px solid #c8973a; font-size:13px; letter-spacing:1px;
                        cursor:pointer; text-transform:uppercase;">
                        Entrar
                    </button>
                    <p id="login-error" style="color:#e74c3c; font-size:12px;
                        margin-top:12px; min-height:18px;"></p>
                    <button onclick="history.back()"
                        style="margin-top:16px; background:none; border:none;
                        color:#555; font-size:12px; cursor:pointer; letter-spacing:1px;">
                        Cancel·lar
                    </button>
                </div>
            </div>
        `;

        const fer_login = async () => {
            const input = document.getElementById('login-input');
            const error = document.getElementById('login-error');
            const clauEscrita = input.value.trim();
            if (!clauEscrita) return;

            // Detecció mode superadmin (clau acabada en 'z')
            const esSuper  = clauEscrita.endsWith('z');
            const clauReal = esSuper ? clauEscrita.slice(0, -1) : clauEscrita;

            error.textContent = '⏳ Verificant...';
            try {
                const res  = await fetch(`${CONFIG.BASE_WORKER}/login?p=${encodeURIComponent(clauReal)}`);
                const text = await res.text();
                if (text.trim() === 'OK') {
                    sessionStorage.setItem('admin_clau',  clauReal);
                    localStorage.setItem('admin_super', esSuper ? 'true' : 'false');
                    mostrarTaula(); // Login correcte → va directe a la taula sense reload
                } else {
                    error.textContent = '❌ Clau incorrecta';
                    input.value = '';
                    input.focus();
                }
            } catch (e) {
                error.textContent = '❌ Error de connexió';
            }
        };

        document.getElementById('login-boto').addEventListener('click', fer_login);
        document.getElementById('login-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') fer_login();
        });
        setTimeout(() => document.getElementById('login-input').focus(), 100);
    };


    /* ════════════════════════════════════════════════════════
       BLOC 8 — MOSTRAR TAULA
       Construeix la interfície completa de l'admin:
       - Barra sticky amb botons d'acció
       - Taula amb totes les columnes
       - Modal de nou plat (ocult per defecte)
       Després carrega els registres del Worker, els ordena
       per camp Ordre i crea una fila per a cadascun.
       ════════════════════════════════════════════════════════ */
    const mostrarTaula = async () => {
        const panel   = document.getElementById('admin-panel');
        const esSuper = sessionStorage.getItem('admin_super') === 'true';
        if (!panel) return;

        // Crea el div d'estat si no existeix encara
        if (!document.getElementById('admin-estat')) {
            const divEstat = document.createElement('div');
            divEstat.id = 'admin-estat';
            document.body.appendChild(divEstat);
        }

        // Injecta tota l'estructura HTML de la taula
        panel.innerHTML = `
            <div id="admin-barra">
                <button id="btn-nou">＋ Nou plat</button>
                <button id="btn-guardar">💾 Guardar</button>
                <button id="btn-descartar">✕ Descartar</button>
                <span id="admin-comptador"></span>
                <button id="btn-recarregar">🔄 Forçar recàrrega</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th class="col-check">Visible</th>
                        <th class="col-nom">Nom</th>
                        <th class="col-ordre" ${!esSuper ? 'style="display:none"' : ''}>Ordre</th>
                        <th class="col-preu">Preu</th>
                        <th class="col-check">Diari</th>
                        <th class="col-check">Grups</th>
                        <th class="col-seccio">Secció</th>
                        <th class="col-check">Carta</th>
                        <th class="col-check">Vins</th>
                        <th class="col-check">Cocteles</th>
                        <th class="col-delete"></th>
                    </tr>
                </thead>
                <tbody id="admin-tbody"></tbody>
            </table>

            <div id="modal-nou-plat">
                <div class="modal-caixa">
                    <h2>Nou plat</h2>
                    <input type="text"   id="modal-nom"    placeholder="Nom del plat *">
                    <input type="number" id="modal-preu"   placeholder="Preu (0.00)" step="0.01">
                    <select id="modal-seccio">
                        <option value="Entrants">Entrants</option>
                        <option value="Primer">Primer</option>
                        <option value="Segon">Segon</option>
                        <option value="Para picar">Para picar</option>
                        <option value="Combinados">Combinados</option>
                        <option value="Cocas">Cocas</option>
                        <option value="Hamburguesas">Hamburguesas</option>
                        <option value="Fríos">Fríos</option>
                        <option value="Postres">Postres</option>
                        <option value="Vins Blancs">Vins Blancs</option>
                        <option value="Vins Negres">Vins Negres</option>
                        <option value="Vins Rosats">Vins Rosats</option>
                        <option value="Vins Escumosos">Vins Escumosos</option>
                        <option value="Cocteles">Cocteles</option>
                        <option value="Peu">Peu</option>
                    </select>
                    <div class="modal-fila">
                        <input type="checkbox" id="modal-visible" checked
                            style="width:16px; height:16px; accent-color:#c8973a;">
                        <label for="modal-visible"
                            style="color:#aaa; font-size:12px; letter-spacing:1px;">
                            Visible a la web
                        </label>
                    </div>
                    <button id="modal-btn-crear" class="modal-boto-crear" disabled>CREAR PLAT</button>
                    <button id="modal-btn-cancel" class="modal-boto-cancel">Cancel·lar</button>
                </div>
            </div>
        `;

        // ─── Events de la barra ───────────────────────────────
        document.getElementById('btn-nou').addEventListener('click', obrirModalNouPlat);
        document.getElementById('btn-guardar').addEventListener('click', () => {
            if (Object.keys(window.CANVIS_PENDENTS).length > 0) guardarTot();
        });
        document.getElementById('btn-descartar').addEventListener('click', () => {
            if (Object.keys(window.CANVIS_PENDENTS).length > 0) descartarCanvis();
        });
        document.getElementById('btn-recarregar').addEventListener('click', async () => {
            const estat = document.getElementById('admin-estat');
            estat.textContent = '⏳ Recarregant...';
            // Força el Worker a buidar la caché del KV i tornar a llegir Airtable
            await fetch(`${CONFIG.BASE_WORKER}/reset-kv`, { method: 'POST' });
            location.reload();
        });

        // ─── Events del modal nou plat ────────────────────────
        document.getElementById('modal-nom').addEventListener('input', nomInputHandler);
        document.getElementById('modal-btn-crear').addEventListener('click', crearNouPlat);
        document.getElementById('modal-btn-cancel').addEventListener('click', tancarModalNouPlat);

        // ─── Carregar i pintar registres ──────────────────────
        const res  = await fetch(CONFIG.BASE_WORKER); // GET al Worker → tots els registres
        const data = await res.json();                // json() → converteix la resposta a objecte JS
        registres  = data;
        // sort → ordena per camp Ordre (ascendent)
        // (a, b) => a - b : si negatiu → a va primer, si positiu → b va primer
        registres.sort((a, b) => (a.fields.Ordre || 0) - (b.fields.Ordre || 0));
        const tbody = document.getElementById('admin-tbody');
        registres.forEach(r => tbody.appendChild(crearFila(r))); // Crea i afegeix cada fila

        document.body.style.opacity = '1';
    };


    /* ════════════════════════════════════════════════════════
       BLOC 9 — INICIALITZAR (punt d'entrada)
       És el primer que s'executa quan es carrega la pàgina.
       Comprova si hi ha una sessió activa al sessionStorage.
       SÍ → valida la clau contra el Worker per seguretat
         Si vàlida → mostrarTaula()
         Si ja no és vàlida → esborra i mostrarLogin()
       NO → mostrarLogin()
       ════════════════════════════════════════════════════════ */
    const inicialitzar = async () => {
        const clau = sessionStorage.getItem('admin_clau');
        if (clau) {
            // Valida la clau guardada contra el Worker
            // (per si ha canviat des de l'última sessió)
            const resLogin = await fetch(`${CONFIG.BASE_WORKER}/login?p=${encodeURIComponent(clau)}`);
            const text     = await resLogin.text();
            if (text.trim() === 'OK') {
                mostrarTaula();
                return;
            }
            // Clau ja no vàlida → esborra i mostra login
            sessionStorage.removeItem('admin_clau');
        }
        mostrarLogin();
    };

    // Executa inicialitzar() quan el DOM estigui llest
    // Mateix patró que loader.js — comprova l'estat del document
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        inicialitzar();
    } else {
        document.addEventListener('DOMContentLoaded', inicialitzar);
    }

})();