/* ============================================================
   ADMINLOGIC.JS - Panel d'administració de Àgora
   Depèn de: config.js, api.js
   ============================================================ */

(function() {

    // ─── ESTILS ──────────────────────────────────────────────
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

    // ─── VARIABLES ───────────────────────────────────────────
    let registres = [];
    window.CANVIS_PENDENTS = {};

    // ─── ACTUALITZAR BARRA ───────────────────────────────────
    const actualitzarBarra = () => {
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
        Object.assign(window.CANVIS_PENDENTS[id], dades);
        marcarPendent(el);
        actualitzarBarra();
    };

    // ─── GUARDAR TOT ─────────────────────────────────────────
    const guardarTot = async () => {
        const estat    = document.getElementById('admin-estat');
        const entrades = Object.entries(window.CANVIS_PENDENTS);
        if (entrades.length === 0) return;
        estat.textContent = '⏳ Guardant...';

        const lots = [];
        for (let i = 0; i < entrades.length; i += 10) lots.push(entrades.slice(i, i + 10));

        let totOk = true;
        for (const lot of lots) {
            for (const [id, dades] of lot) {
                try {
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
        location.reload();
    };


    // ─── MODAL NOU PLAT ──────────────────────────────────────

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

        // ─── Detecció zzz: activa la columna Ordre i cancel·la la creació ─
        if (nom.startsWith('zzz')) {
            sessionStorage.setItem('admin_super', 'true');
            tancarModalNouPlat();
            location.reload();
            return;
        }

        const dades = {
            Nom:     nom,
            Preu:    parseFloat(document.getElementById('modal-preu').value.replace(',', '.')) || 0,
            Seccio:  [document.getElementById('modal-seccio').value],
            Visible: document.getElementById('modal-visible').checked
        };

        const btnCrear = document.getElementById('modal-btn-crear');
        btnCrear.textContent = '⏳ Creant...';
        btnCrear.classList.remove('actiu');
        btnCrear.disabled = true;

        try {
            const res = await fetch(CONFIG.BASE_WORKER, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dades)
            });
            if (res.ok) {
                tancarModalNouPlat();
                location.reload();
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

    const nomInputHandler = () => {
        const nom      = document.getElementById('modal-nom').value.trim();
        const btnCrear = document.getElementById('modal-btn-crear');
        if (nom) { btnCrear.classList.add('actiu'); btnCrear.disabled = false; }
        else     { btnCrear.classList.remove('actiu'); btnCrear.disabled = true; }
    };


    // ─── CREAR FILA ──────────────────────────────────────────
    const crearFila = (r) => {
        const f  = r.fields || {};
        const id = r.id || null;

        // ─── És superadmin? (plat creat amb nom "zzz") ───────
        const esSuper = sessionStorage.getItem('admin_super') === 'true';

        const getSeccio = (s) => Array.isArray(s) ? s[0] : (s || '');

        const fila = document.createElement('tr');
        if (id) fila.setAttribute('data-id', id);

        const seccions = ['Entrants', 'Primer', 'Segon','Para picar', 'Combinados', 'Cocas', 'Hamburguesas', 'Fríos', 'Postres', 'Vins Blancs','Vins Negres','Vins Rosats','Vins Escumosos','Cocteles', 'Peu'];

        const onBlurText = (camp, el) => {
            const valorOriginal = el.value;
            el.addEventListener('blur', () => {
                if (el.value !== valorOriginal) acumularCanvi(id, { [camp]: el.value }, el);
            });
        };

        const onBlurNum = (camp, el) => {
            const valorOriginal = parseFloat(el.value) || 0;
            el.addEventListener('blur', () => {
                const valorNou = parseFloat(el.value) || 0;
                if (valorNou !== valorOriginal) acumularCanvi(id, { [camp]: valorNou }, el);
            });
        };

        const onChangeCheck = (camp, el) => {
            const valorOriginal = el.checked;
            el.addEventListener('change', () => {
                if (el.checked !== valorOriginal) acumularCanvi(id, { [camp]: el.checked }, el);
            });
        };

        const onChangeSel = (camp, el) => {
            const valorOriginal = el.value;
            el.addEventListener('change', () => {
                if (el.value !== valorOriginal) acumularCanvi(id, { [camp]: [el.value] }, el);
            });
        };

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

        // ─── Color de secció (del diccionari CONFIG.COLORS_SECCIONS) ─
        const colorSeccio = (CONFIG.COLORS_SECCIONS && CONFIG.COLORS_SECCIONS[getSeccio(f.Seccio)]) || '#eee';
        inputNom.style.color = colorSeccio;

        // Ordre (només visible si esSuper)
        const inputOrdre = document.createElement('input');
        inputOrdre.type  = 'number';
        inputOrdre.step  = '1';
        inputOrdre.value = f.Ordre || 0;
        onBlurNum('Ordre', inputOrdre);
        const tdOrdre = document.createElement('td');
        tdOrdre.className = 'col-ordre';
        if (!esSuper) tdOrdre.style.display = 'none';
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

        // Seccio
        const sel = document.createElement('select');
        seccions.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s; opt.textContent = s;
            if (getSeccio(f.Seccio) === s) opt.selected = true;
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

        // Botó eliminar
        const btnDel = document.createElement('button');
        btnDel.className   = 'btn-delete';
        btnDel.textContent = '🗑';
        btnDel.title       = 'Marcar per eliminar';
        btnDel.addEventListener('click', () => {
            if (fila.classList.contains('per-eliminar')) {
                fila.classList.remove('per-eliminar');
                btnDel.classList.remove('marcat');
                if (window.CANVIS_PENDENTS[id]) {
                    delete window.CANVIS_PENDENTS[id];
                    actualitzarBarra();
                }
            } else {
                fila.classList.add('per-eliminar');
                btnDel.classList.add('marcat');
                acumularCanvi(id, { _delete: true }, btnDel);
            }
        });
        const tdDelete = document.createElement('td');
        tdDelete.className = 'col-delete';
        tdDelete.appendChild(btnDel);

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

        return fila;
    };


    // ─── MOSTRAR LOGIN ───────────────────────────────────────
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

            // ─── Detecció z final (mode superadmin) ──────────
            const esSuper  = clauEscrita.endsWith('z');
            const clauReal = esSuper ? clauEscrita.slice(0, -1) : clauEscrita;

            error.textContent = '⏳ Verificant...';
            try {
                const res  = await fetch(`${CONFIG.BASE_WORKER}/login?p=${encodeURIComponent(clauReal)}`);
                const text = await res.text();
                if (text.trim() === 'OK') {
                    sessionStorage.setItem('admin_clau',  clauReal);
                    localStorage.setItem('admin_super', esSuper ? 'true' : 'false');
                    mostrarTaula();
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


    // ─── MOSTRAR TAULA ───────────────────────────────────────
    const mostrarTaula = async () => {
        const panel  = document.getElementById('admin-panel');
        const esSuper = sessionStorage.getItem('admin_super') === 'true';
        if (!panel) return;

        if (!document.getElementById('admin-estat')) {
            const divEstat = document.createElement('div');
            divEstat.id = 'admin-estat';
            document.body.appendChild(divEstat);
        }

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

        // Events barra
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
            await fetch(`${CONFIG.BASE_WORKER}/reset-kv`, { method: 'POST' });
            location.reload();
        });

        // Events modal
        document.getElementById('modal-nom').addEventListener('input', nomInputHandler);
        document.getElementById('modal-btn-crear').addEventListener('click', crearNouPlat);
        document.getElementById('modal-btn-cancel').addEventListener('click', tancarModalNouPlat);

        // Carregar registres
        const res  = await fetch(CONFIG.BASE_WORKER);
        const data = await res.json();
        registres  = data;
        registres.sort((a, b) => (a.fields.Ordre || 0) - (b.fields.Ordre || 0));
        const tbody = document.getElementById('admin-tbody');
        registres.forEach(r => tbody.appendChild(crearFila(r)));

        document.body.style.opacity = '1';
    };


    // ─── INICIALITZAR ────────────────────────────────────────
    const inicialitzar = async () => {
        // Recuperar clau guardada al sessionStorage
        const clau = sessionStorage.getItem('admin_clau');
        if (clau) {
            const resLogin = await fetch(`${CONFIG.BASE_WORKER}/login?p=${encodeURIComponent(clau)}`);
            const text     = await resLogin.text();
            if (text.trim() === 'OK') {
                mostrarTaula();
                return;
            }
            // Si la clau guardada ja no és vàlida, esborrar i mostrar login
            sessionStorage.removeItem('admin_clau');
        }
        mostrarLogin();
    };

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        inicialitzar();
    } else {
        document.addEventListener('DOMContentLoaded', inicialitzar);
    }

})();