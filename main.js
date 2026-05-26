/* ============================================================
   MAIN.JS - Contingut principal de la pàgina
   Depèn de: config.js
   Edita aquí el contingut de cada projecte
   ============================================================ */

(function() {

    const inicialitzar = () => {

        /* ─── 1. NAVBAR ─────────────────────────────────────────── */
        const navbar = document.getElementById('navbar');
        if (navbar) {
            navbar.innerHTML = `
                <nav class="navbar">
                    <div class="navbar-logo">
                        <img src="${CONFIG.BASE_URL}${CONFIG.LOGO}" alt="${CONFIG.NOM}">
                    </div> 
                       <button class="navbar-hamburguesa">☰</button>
                    
                    <ul class="navbar-menu">
                        <li><a href="#menus">Menús</a></li>
                        <li><a href="javascript:void(0)" onclick="obrirModalCarta()">Carta</a></li>
                        <li><a href="javascript:void(0)" onclick="obrirModalVins()">Vins i Caves</a></li>
                        <li><a href="javascript:void(0)" onclick="obrirModalCocteles()">Cócteles</a></li>
                        <li><a href="#reserves">Reserves</a></li>
                    </ul>
                </nav>
            `;
        }
const btnHamburguesa = document.querySelector('.navbar-hamburguesa');
const menu = document.querySelector('.navbar-menu');

btnHamburguesa.addEventListener('click', () => {
    menu.classList.toggle('obert');
});

menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
        menu.classList.remove('obert');
    });
});

// ─── LONG PRESS AL LOGO (1,5 segons → login) ─────────
const logo = document.querySelector('.navbar-logo img');
let timerLogo;

const iniciarPress = (e) => {
    e.preventDefault();
    timerLogo = setTimeout(() => {
        window.obrirModalLogin();
    }, 1500);
};

const aturarPress = () => clearTimeout(timerLogo);

logo.addEventListener('mousedown',   iniciarPress);
logo.addEventListener('mouseup',      aturarPress);
logo.addEventListener('mouseleave',  aturarPress);
logo.addEventListener('touchstart',  iniciarPress, { passive: false });
logo.addEventListener('touchend',    aturarPress);
logo.addEventListener('contextmenu', (e) => e.preventDefault());

        /* ─── 2. HERO ───────────────────────────────────────────── */
        const hero = document.getElementById('hero');
        if (hero) {
            hero.innerHTML = `
                <section class="hero">
                    <img class="hero-imatge" src="${CONFIG.BASE_URL}${CONFIG.BLOC_HERO}"
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

        /* ─── 3. SECCIONS ───────────────────────────────────────── */
        const seccions = document.getElementById('seccions');
        if (seccions) {
            seccions.innerHTML = `

                <section class="seccio" id="menus">
                    <h2 class="seccio-titol">Els nostres Menús</h2>
                    <div class="menus-grid">

                        <div class="menu-bloc">
                            <a href="javascript:void(0)" onclick="obrirModalMenuDiari()">
                                <div class="menu-bloc-imatge">
                                    <img src="${CONFIG.BASE_URL}${CONFIG.BLOC1}"
                                        alt="Menú Diari"
                                        onerror="this.src='${CONFIG.BASE_URL}${CONFIG.BLOC_HERO}'">
                                </div>
                                <div class="menu-bloc-text">
                                    <h3>${CONFIG.BLOC1_TITOL}</h3>
                                    <p>${CONFIG.BLOC1_DESC}</p>
                                </div>
                            </a>
                        </div>

                        <div class="menu-bloc">
                            <a href="javascript:void(0)" onclick="obrirModalMenuCDS()">
                                <div class="menu-bloc-imatge">
                                    <img src="${CONFIG.BASE_URL}${CONFIG.BLOC2}"
                                        alt="Menú Cap de Setmana"
                                        onerror="this.src='${CONFIG.BASE_URL}${CONFIG.BLOC_HERO}'">
                                </div>
                                <div class="menu-bloc-text">
                                    <h3>${CONFIG.BLOC2_TITOL}</h3>
                                    <p>${CONFIG.BLOC2_DESC}</p>
                                </div>
                            </a>
                        </div>

                        <div class="menu-bloc">
                            <a href="javascript:void(0)" onclick="obrirModalMenuGrups()">
                                <div class="menu-bloc-imatge">
                                    <img src="${CONFIG.BASE_URL}${CONFIG.BLOC3}"
                                        alt="Menú Grups"
                                        onerror="this.src='${CONFIG.BASE_URL}${CONFIG.BLOC_HERO}'">
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

                <div style="text-align: center; margin: 20px 0; list-style: none;">
                    <li><a href="#hero" style="text-decoration: none; color: #ff0000a5; font-weight: bold;">Inici 👆</a></li>
                </div>
            `;
        }
    /*<p class="seccio-text">
                        <a href="mailto:${CONFIG.EMAIL}">✉️ ${CONFIG.EMAIL}</a>
                    </p>*/
        /* ─── 4. FOOTER ─────────────────────────────────────────── */
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
                    <a href="mailto:${CONFIG.EMAIL}">✉️ ${CONFIG.EMAIL}</a>
                    <p>
                        <a href="${CONFIG.INSTAGRAM}" target="_blank">Instagram</a>
                        &nbsp;·&nbsp;
                        <a href="${CONFIG.FACEBOOK}" target="_blank">Facebook</a>
                    </p>
                    <p class="footer-poweredby">
                        Powered by <a href="https://www.altervector.com" target="_blank">AlterVector</a>
                        <span id="visites"></span>
                    </p>
                </footer>
            `;
        }

        /* ─── 5. NAVBAR SCROLL ───────────────────────────────────── */
        window.addEventListener('scroll', () => {
            const nav = document.querySelector('.navbar');
            if (nav) {
                nav.classList.toggle('scrolled', window.scrollY > 50);
            }
        });
    // ─── BLOQUEJAR MENÚ CONTEXTUAL ───────────────────────
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    
    
/* ─── 6. VISITES ─────────────────────────────────────────── */
        fetch(`${CONFIG.BASE_WORKER}/visites`)
            .then(r => r.json())
            .then(data => {
                const el = document.getElementById('visites');
                if (el && data.visites) {
                    el.textContent = `${data.visites} visites`;
                }
            })
            .catch(() => {}); // silenciós si falla






}; // fi inicialitzar

    if (document.readyState === "complete" || document.readyState === "interactive") {
        inicialitzar();
    } else {
        document.addEventListener("DOMContentLoaded", inicialitzar);
    }

})();
