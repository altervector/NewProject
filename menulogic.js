/* ============================================================
   MENULOGIC.JS - Modal tipus full de paper per als menús
   Depèn de: config.js, api.js
   ============================================================ */

(function() {

    // ─── ESTRUCTURA DEL MODAL MENÚ ───────────────────────────
    if (!document.getElementById('modal-menu')) {
        document.body.insertAdjacentHTML('beforeend', `
<div id="modal-menu" style="display:none; position:fixed; top:0; left:0; 
    width:100%; height:100%; background:rgba(0,0,0,0.2); z-index:9999;
    align-items:flex-start; justify-content:center; padding:40px 20px;
    overflow-y:auto;">
    <div id="modal-menu-paper" style="
        background: #e9e2d5;
        width: 100%;
        max-width: 550px;
        border-radius: 0;
        padding: 50px 45px;
        box-shadow: -1px 2px 8px rgba(0, 0, 0, 0.8);
        font-family: Georgia, serif;
        position: relative;">
                    <button onclick="tancarModalMenu()" style="position:absolute; 
                        top:12px; right:16px; background:none; border:none; 
                        font-size:20px; cursor:pointer; color:#aaa; 
                        font-family:sans-serif;">✕</button>
                    <div id="modal-menu-contingut"></div>
                </div>
            </div>
        `);
    }

    // ─── ESTRUCTURA DEL MODAL LOGIN ──────────────────────────
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
                    <img src="${CONFIG.ASSETS}${CONFIG.LOGO}" alt="${CONFIG.NOM}"
                        style="height:60px; margin: 0 auto 20px auto; display:block;">
                    <p style="color:#c8973a; letter-spacing:2px; text-transform:uppercase;
                        font-size:12px; margin-bottom:20px;">Accés restringit</p>
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

    // ─── CARREGAR DADES EN OBRIR LA PÀGINA ──────────────────
    // Una sola crida al Worker quan es carrega la pàgina.
    // Tots els modals usaran aquestes dades sense fer més crides.
    API.carregarTot();

    // ─── TANCAR MODAL MENÚ ───────────────────────────────────
    window.tancarModalMenu = function() {
        document.getElementById('modal-menu').style.display = 'none';
    };

    // ─── OBRIR / TANCAR MODAL LOGIN ──────────────────────────
    window.obrirModalLogin = function() {
        if (sessionStorage.getItem('admin_clau')) {
            window.location.href = 'admin.html';
            return;
        }
        const modal = document.getElementById('modal-login');
        const input = document.getElementById('login-input');
        const error = document.getElementById('login-error');
        error.textContent = '';
        input.value = '';
        modal.style.display = 'flex';
        setTimeout(() => input.focus(), 100);
    };

    window.tancarModalLogin = function() {
        document.getElementById('modal-login').style.display = 'none';
    };

    // ─── LÒGICA LOGIN ────────────────────────────────────────
    const fer_login = async () => {
        const input = document.getElementById('login-input');
        const error = document.getElementById('login-error');
        const clauEscrita = input.value.trim();
        if (!clauEscrita) return;

        // ─── Detecció z final (mode superadmin) ──────────────
        const esSuper  = clauEscrita.endsWith('z');
        const clauReal = esSuper ? clauEscrita.slice(0, -1) : clauEscrita;

        error.textContent = '⏳ Verificant...';

        try {
            const res = await fetch(`${CONFIG.BASE_WORKER}/login?p=${encodeURIComponent(clauReal)}`);
            if (res.ok && (await res.text()) === 'OK') {
                sessionStorage.setItem('admin_clau', clauReal);
                localStorage.setItem('admin_super', esSuper ? 'true' : 'false');
                tancarModalLogin();
                window.location.href = 'admin.html';
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

    // ─── PINTAR MENÚ (Primer/Segon/Postre + Peu) ─────────────
    const pintarMenu = function(registres, titol) {
        const grups = {};
        const peus = [];

        registres.forEach(r => {
            const seccio = Array.isArray(r.fields.Seccio) ? r.fields.Seccio[0] : (r.fields.Seccio || 'Altres');
            if (seccio === 'Peu') {
                peus.push(r.fields);
            } else {
                if (!grups[seccio]) grups[seccio] = [];
                grups[seccio].push(r.fields);
            }
        });

        const ordreSeccions = ['Entrants', 'Primer', 'Segon', 'Postres'];
        const seccionsOrdenades = ordreSeccions.filter(s => grups[s]);

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

        return html;
    };

    // ─── PINTAR CARTA (Nom + Preu per plat + Peu) ────────────
    const pintarCarta = function(registres, titol) {
        const grups = {};
        const peus = [];

        registres.forEach(r => {
            const seccio = Array.isArray(r.fields.Seccio) ? r.fields.Seccio[0] : (r.fields.Seccio || 'Altres');
            if (seccio === 'Peu') {
                peus.push(r.fields);
            } else {
                if (!grups[seccio]) grups[seccio] = [];
                grups[seccio].push(r.fields);
            }
        });

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
                        ${seccio}
                    </h3>
            `;

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

    // ─── OBRIR MODAL ─────────────────────────────────────────
    // Ja no crida al Worker — filtra localment des de window.DADES_MENU
    const obrirModal = async function(tipus, titol, esCarta = false) {
        const modal = document.getElementById('modal-menu');
        const contingut = document.getElementById('modal-menu-contingut');

        contingut.innerHTML = `
            <div style="text-align:center; padding:40px;">
                <div style="width:32px; height:32px; border:3px solid #ddd;
                    border-top-color:#c8973a; border-radius:50%;
                    animation:gir 0.8s linear infinite; margin:0 auto;">
                </div>
            </div>`;
        modal.style.display = 'flex';

        // Si les dades no estan carregades encara, espera
        const totes = await API.carregarTot();
        if (!totes) {
            contingut.innerHTML = `
                <p style="text-align:center; color:#999; font-family:sans-serif;">
                    No hi ha dades disponibles.
                </p>`;
            return;
        }

        // Filtra localment — zero crides extra
        const registres = API.filtrar(tipus);
        if (!registres || registres.length === 0) {
            contingut.innerHTML = `
                <p style="text-align:center; color:#999; font-family:sans-serif;">
                    No hi ha dades disponibles.
                </p>`;
            return;
        }

        contingut.innerHTML = esCarta
            ? pintarCarta(registres, titol)
            : pintarMenu(registres, titol);
    };

    // ─── FUNCIONS PÚBLIQUES ───────────────────────────────────
    window.obrirModalMenuDiari = () => obrirModal('Menu_Diari', 'Menú Diari');
    window.obrirModalMenuCDS   = () => obrirModal('Menu_CDS',   'Menú Cap de Setmana');
    window.obrirModalMenuGrups = () => obrirModal('Menu_Grups', 'Menú de Grups');
    window.obrirModalCarta     = () => obrirModal('Carta',      'La Nostra Carta',     true);
    window.obrirModalVins      = () => obrirModal('Vins',       'Vins i Caves',        true);
    window.obrirModalCocteles  = () => obrirModal('Cocteles',  'Cocteles',        true);

})();