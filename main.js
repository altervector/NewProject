/* ============================================================
   MAIN.JS - Contingut principal de la pàgina
   Depèn de: config.js
   Edita aquí el contingut de cada projecte

   QUÈ FA AQUEST FITXER:
   Construeix tota la interfície visible de la pàgina:
   1. Navbar — logo, menú, hamburguesa, long press login
   2. Hero — imatge, títol, slogan, botó
   3. Seccions — menús, qui som, horaris, reserves
   4. Footer — dades de contacte, xarxes, QR, powered by
   5. Navbar scroll — efecte de fons en fer scroll
   6. Visites — comptador de visites via Worker

   PER QUÈ EL CONTINGUT ÉS AL JS I NO A L'HTML:
   Perquè tot ve de CONFIG. Canviant config.js s'adapta
   el projecte a qualsevol negoci sense tocar l'HTML.
   L'HTML és només l'esquelet buit amb els ids de destí.
   ============================================================ */

/* ─── BOMBOLLA PRIVADA ─────────────────────────────────────────
   Tot privat — no exposa res a window.
   ─────────────────────────────────────────────────────────────── */
(function() {

    const inicialitzar = () => {

        /* ════════════════════════════════════════════════════════
           BLOC 1 — NAVBAR
           Injecta la barra de navegació dins #navbar de l'HTML.
           Inclou: logo, hamburguesa (mòbil), menú horitzontal (PC)
           Els enllaços del menú criden funcions públiques de
           menulogic.js (obrirModalCarta, obrirModalVins...)
           ════════════════════════════════════════════════════════ */
        const navbar = document.getElementById('navbar');
        if (navbar) {
            navbar.innerHTML = `
                <nav class="navbar">
                    <div class="navbar-logo">
                        <img src="${CONFIG.ASSETS}${CONFIG.LOGO}" alt="${CONFIG.NOM}">
                    </div> 
                    <button class="navbar-hamburguesa">☰</button>
                    <ul class="navbar-menu">
                        <li><a href="#menus">Menús</a></li>
                        <li><a href="javascript:void(0)" onclick="obrirModalCarta()">Carta</a></li>
                        <li><a href="javascript:void(0)" onclick="obrirModalVins()">Vins i Caves</a></li>
                        <li><a href="javascript:void(0)" onclick="obrirModalCocteles()">Còctels</a></li>
                        <li><a href="#reserves">Reserves</a></li>
                    </ul>
                </nav>
            `;
        }

        // ─── HAMBURGUESA (mòbil) ──────────────────────────────
        // toggle → afegeix la classe si no hi és, la treu si hi és
        // Equivalent VB6: If menu.class = "obert" Then treu Else afegeix
        const btnHamburguesa = document.querySelector('.navbar-hamburguesa');
        const menu = document.querySelector('.navbar-menu');

        btnHamburguesa.addEventListener('click', () => {
            menu.classList.toggle('obert'); // Obre/tanca el menú mòbil
        });

        // Tanca el menú en fer clic a qualsevol enllaç
        menu.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                menu.classList.remove('obert');
            });
        });

        // ─── LONG PRESS AL LOGO (1,5s → obre modal login) ────
        // Funciona tant al mòbil (touch) com al PC (mouse)
        // El truc: si passes 1500ms sense soltar → obrirModalLogin()
        // Si soltes abans → clearTimeout cancel·la l'acció
        const logo = document.querySelector('.navbar-logo img');
        let timerLogo;

        const iniciarPress = (e) => {
            e.preventDefault();
            // setTimeout → espera 1500ms i executa la funció
            timerLogo = setTimeout(() => {
                window.obrirModalLogin();
            }, 1500);
        };

        // clearTimeout → cancel·la el setTimeout si soltes abans d'1,5s
        const aturarPress = () => clearTimeout(timerLogo);

        logo.addEventListener('mousedown',   iniciarPress);           // PC: prem botó ratolí
        logo.addEventListener('mouseup',     aturarPress);            // PC: solta botó ratolí
        logo.addEventListener('mouseleave',  aturarPress);            // PC: el ratolí surt del logo
        logo.addEventListener('touchstart',  iniciarPress, { passive: false }); // Mòbil: toca
        logo.addEventListener('touchend',    aturarPress);            // Mòbil: aixeca el dit
        logo.addEventListener('contextmenu', (e) => e.preventDefault()); // Evita menú contextual al logo


        /* ════════════════════════════════════════════════════════
           BLOC 2 — HERO
           La secció principal a pantalla completa.
           Imatge de fons + overlay fosc + títol + slogan + botó.
           onerror → si la imatge no carrega, usa la del hero
           com a imatge de reemplaçament.
           ════════════════════════════════════════════════════════ */
        const hero = document.getElementById('hero');
        if (hero) {
            hero.innerHTML = `
                <section class="hero">
                    <img class="hero-imatge" src="${CONFIG.ASSETS}${CONFIG.BLOC_HERO}"
                        alt="${CONFIG.NOM}">
                    <div class="hero-overlay"></div>
                    <div class="hero-contingut">
                        <h1 class="hero-titol">${CONFIG.NOM}</h1>
                        <p class="hero-slogan">${CONFIG.SLOGAN}</p>
                        <a href="#qui-som" class="hero-boto">Descobreix-nos</a>
                    </div>
                </section>
            `;
        }


        /* ════════════════════════════════════════════════════════
           BLOC 3 — SECCIONS
           Totes les seccions de contingut de la pàgina:
           - #menus → blocs clicables que obren els modals
           - #qui-som → descripció del negoci
           - #horaris → horaris d'obertura
           - #reserves → telèfons de contacte
           onerror → fallback d'imatge si no carrega la del bloc
           ════════════════════════════════════════════════════════ */
        const seccions = document.getElementById('seccions');
        if (seccions) {
            seccions.innerHTML = `

                <section class="seccio" id="menus">
                    <h2 class="seccio-titol">Els nostres Menús</h2>
                    <div class="menus-grid">

                        <div class="menu-bloc">
                            <a href="javascript:void(0)" onclick="obrirModalMenuDiari()">
                                <div class="menu-bloc-imatge">
                                    <img src="${CONFIG.ASSETS}${CONFIG.BLOC1}"
                                        alt="Menú Diari"
                                        onerror="this.src='${CONFIG.ASSETS}${CONFIG.BLOC_HERO}'">
                                </div>
                                <div class="menu-bloc-text">
                                    <h3>${CONFIG.BLOC1_TITOL}</h3>
                                    <p>${CONFIG.BLOC1_DESC}</p>
                                </div>
                            </a>
                        </div>

                        <div class="menu-bloc">
                            <a href="javascript:void(0)" onclick="obrirModalMenuGrups()">
                                <div class="menu-bloc-imatge">
                                    <img src="${CONFIG.ASSETS}${CONFIG.BLOC3}"
                                        alt="Menú Grups"
                                        onerror="this.src='${CONFIG.ASSETS}${CONFIG.BLOC_HERO}'">
                                </div>
                                <div class="menu-bloc-text">
                                    <h3>${CONFIG.BLOC3_TITOL}</h3>
                                    <p>${CONFIG.BLOC3_DESC}</p>
                                </div>
                            </a>
                        </div>

                    </div>
                </section>

                <hr class="separador">

                <section class="seccio" id="qui-som">
                    <h2 class="seccio-titol">${CONFIG.QUI_SOM}</h2>
                    <p class="seccio-text">${CONFIG.QUI_DESC}</p>
                </section>

                <hr class="separador">

                <section class="seccio" id="horaris">
                    <h2 class="seccio-titol">Horaris</h2>
                    <p class="seccio-text">${CONFIG.HORA_1}</p>
                    <p class="seccio-text">${CONFIG.HORA_2}</p>
                    <p class="seccio-text">${CONFIG.HORA_3}</p>
                </section>

                <hr class="separador">

                <section class="seccio" id="reserves">
                    <h2 class="seccio-titol">${CONFIG.RESERVES}</h2>
                    <p class="seccio-text">
                        <a href="tel:${CONFIG.TELEFON}">📞 ${CONFIG.TELEFON}</a>
                        &nbsp;·&nbsp;
                        <a href="tel:${CONFIG.MOBIL}">📱 ${CONFIG.MOBIL}</a>
                    </p>
                </section>

                <!-- Enllaç de tornada a l'inici -->
                <div style="text-align: center; margin: 20px 0; list-style: none;">
                    <li><a href="#hero" style="text-decoration: none; color: #ff0000a5; font-weight: bold;">Inici 👆</a></li>
                </div>
            `;
        }
    /*<p class="seccio-text">
                        <a href="mailto:${CONFIG.EMAIL}">✉️ ${CONFIG.EMAIL}</a>
                    </p>*/

        /* ════════════════════════════════════════════════════════
           BLOC 4 — FOOTER
           Peu de pàgina amb totes les dades de contacte:
           adreça (enllaç Google Maps), telèfons, email,
           Instagram, Google Reviews, QR i powered by AlterVector.
           target="_blank" → obre l'enllaç en una nova pestanya
           ════════════════════════════════════════════════════════ */
        const footer = document.getElementById('footer');
        if (footer) {
            footer.innerHTML = `
                <footer class="footer">
                    <p class="footer-nom">${CONFIG.NOM}</p>
                    <p>
                        <a href="https://www.google.com/maps/search/?api=1&query=Agora+Plaza+Vella" target="_blank">
                            ${CONFIG.ADRECA}
                        </a>
                    </p>
                    <p><a href="tel:${CONFIG.TELEFON}">${CONFIG.TELEFON}</a></p>
                    <a href="tel:${CONFIG.MOBIL}">${CONFIG.MOBIL}</a></p>
                    <a href="mailto:${CONFIG.EMAIL}"><img src="${CONFIG.ASSETS}icon/Icomail.png" alt="Instagram" class="icona-app"> ${CONFIG.EMAIL}</a>
                    <p>
                        <a href="${CONFIG.INSTAGRAM}" target="_blank">
                            <img src="${CONFIG.ASSETS}icon/Icoinsta.png" alt="Instagram" class="icona-app"> Instagram
                        </a>
                        <p>
                            <a href="https://search.google.com/local/writereview?placeid=ChIJGU4gT-qSpBIRLvqRcvS-P7E&source=g.page.m.ia._&laa=nmx-review-solicitation-ia2" target="_blank">
                                <img src="${CONFIG.ASSETS}icon/google.png" alt="Google" class="icona-app">Google
                            </a>
                        </p>
                    </p>
                    <p class="footer-qr">
                        <a href="${CONFIG.ASSETS}${CONFIG.QR}">
                            <img src="${CONFIG.ASSETS}${CONFIG.QR}" alt="QR">
                        </a>
                    </p>
                    <p class="footer-poweredby">
                        Powered by <a href="https://www.altervector.com" target="_blank">AlterVector</a>
                        <!-- #visites s'omple via Worker (BLOC 6) -->
                        <span id="visites"></span>
                    </p>
                </footer>
            `;
        }


        /* ════════════════════════════════════════════════════════
           BLOC 5 — NAVBAR SCROLL
           Quan l'usuari fa scroll més de 50px → afegeix la
           classe 'scrolled' a la navbar.
           El CSS de .navbar.scrolled afegeix el fons semitransparent.
           window.scrollY → píxels de scroll vertical actuals
           ════════════════════════════════════════════════════════ */
        window.addEventListener('scroll', () => {
            const nav = document.querySelector('.navbar');
            if (nav) {
                // toggle amb condició → afegeix 'scrolled' si scrollY > 50, treu si no
                nav.classList.toggle('scrolled', window.scrollY > 50);
            }
        });

        // ─── BLOQUEJAR MENÚ CONTEXTUAL ────────────────────────
        // Evita el menú del botó dret a tota la pàgina
        // (protecció bàsica contra còpia d'imatges)
        document.addEventListener('contextmenu', (e) => e.preventDefault());


        /* ════════════════════════════════════════════════════════
           BLOC 6 — COMPTADOR DE VISITES
           Crida al Worker ruta /visites → retorna el número
           de visites i l'escriu al span #visites del footer.
           .catch(() => {}) → silenciós si falla, no mostra error
           El CSS de #visites afegeix " · " davant amb ::before
           ════════════════════════════════════════════════════════ */
        fetch(`${CONFIG.BASE_WORKER}/visites`)
            .then(r => r.json())       // converteix resposta a objecte JS
            .then(data => {
                const el = document.getElementById('visites');
                if (el && data.visites) {
                    el.textContent = `${data.visites} visites`;
                }
            })
            .catch(() => {}); // Si el Worker no respon → no passa res, el span queda buit

    }; // fi inicialitzar


    /* ════════════════════════════════════════════════════════
       INICIALITZACIÓ
       Executa inicialitzar() quan el DOM estigui llest.
       Mateix patró que loader.js i adminlogic.js.
       ════════════════════════════════════════════════════════ */
    if (document.readyState === "complete" || document.readyState === "interactive") {
        inicialitzar();
    } else {
        document.addEventListener("DOMContentLoaded", inicialitzar);
    }

})();