const CONFIG = {

    // 1. NEGOCI
    NOM:            "àgora",
    LOGO:           "logo/logoAGtrans.png",
    LOGO_T:         "",
    SLOGAN:         "Plaça Vella",
    TELEFON:        "93 788 72 91",
    MOBIL:          "625 52 52 79",
    EMAIL:          "agora@alterwebstudio.com", /*agora26vella@gmail.com */
    ADRECA:         "Carrer de Jaume Cantarer, 4, 08221 Terrassa, Barcelona",
    INSTAGRAM:      "https://www.instagram.com/agoraplazavella",
    FACEBOOK:       "https://www.facebook.com/profile.php?id=100054618451503",
    EMAIL_SUPORT:   "info@alterwebstudio.com",


    // 2. RUTES (en local, tot és relatiu)
    REPO_URL:       "https://altervector.github.io/agora/",
    BASE_URL:       "./",
    BASE_WORKER:    "https://agora.altervector.workers.dev",
    URL_OFICIAL:    "https://agora.alterwebstudio.com",
    ASSETS:         "https://avsets.pages.dev/",
    URL_MAPS:       "https://www.google.com/maps/search/?api=1&query=Agora+Plaza+Vella",
    URL_RESSENYES:  "https://search.google.com/local/writereview?placeid=ChIJGU4gT-qSpBIRLvqRcvS-P7E&source=g.page.m.ia._&laa=nmx-review-solicitation-ia2",

    // 2.2 RUTES Imatges
    BACKGROUND:      "", // ← canviar en el css .html{}
    BLOC_HERO:       "images/agora/hero-agora.png",
    BLOC1:           "images/agora/diari.png",
    BLOC2:           "images/agora/finde.png",
    BLOC3:           "images/agora/grups.png",
    BLOC4:           "",
    QR:              "qr/qr-agoraplazavella.png",

    // 2.3 RUTES Textos
    HERO_BOTO:       "Descobreix-nos",
    SECCIO_TITOL:    "Els nostres Menús",

    BLOC1_TITOL:     "Menú Diari",
    BLOC1_DESC:      "De dilluns a divendres al migdia. Primer, segon, postre i beguda.",

    BLOC2_TITOL:     "Menú Cap de Setmana",
    BLOC2_DESC:      "Dissabte i diumenge. Una selecció especial per gaudir en família.",

    BLOC3_TITOL:     "Menú Grups",
    BLOC3_DESC:      "Per a celebracions i esdeveniments. Per a un mínim de 10 persones i amb reserva concertada.",

    BLOC4_TITOL:     "",
    BLOC4_DESC:      "",

    QUI_SOM:         "Qui som...",
    QUI_DESC:        "El nostre local està dedicat als serveis de restauració. Oferim cuina mediterrània i espanyola, incloent esmorzars, dinars, sopars i tapes, amb opcions per menjar al local, a la terrassa o per emportar. Us brindem un menjar de qualitat, ambient acollidor i servei amable.",

    HORA_0:          "Horaris",
    HORA_1:          "Dilluns a dijous: 08:00 – 23:00h",
    HORA_2:          "Divendres i dissabte: 08:00 – 24:00h",
    HORA_3:          "Diumenge: 09:00 - 23:00h",

    RESERVES:        "Fes la teva Reserva",


    // 3. SEGURETAT (de moment buit, s'activa quan pujem a producció)
    SITIOS_SEGUROS:  ["altervector.com", "pages.dev", "altervector.github.io", "localhost", "127.0.0.1"],
    
    
    // 4. COLORS (per si cal canviar-los des de JS)
    COLOR_PRINCIPAL: "#2c3e35",
    COLOR_ACCENT:    "#c8973a",

        // 2. COLORS DE L'ADMINISTRADOR (Optimitzats per a fons fosc/negre)
    COLORS_SECCIONS: {
        "Entrants":       "#00fe83", // Verd neó clar
        "Primer":         "#00aeff", // Blau cel elèctric
        "Segon":          "#FFB74D", // Turquesa brillant
        "Para picar":     "#1DE9B6", // Taronja pastís clar
        "Cocas":          "#ed8efd", // Violeta neó
        "Hamburguesas":   "#A7FFEB", // Rosa fúcsia brillant
        "Fríos":          "#ff2c73", // Aquamarina molt clar
        "Combinados":     "#e5d436", // Taronja corall elèctric
        "Postres":        "#FF6E40", // Grog llimona (destaca moltíssim)
        "Vins Blancs":    "#d2ff9e", // Verd llima clar
        "Vins Negres":    "#ba92ff", // Espígol / lila clar (no es perd amb el fons)
        "Vins Rosats":    "#ff357c", // Rosa pastís clar
        "Vins Escumosos": "#80DEEA", // Blau cian clar
        "Cocteles":       "#FFFF00", // Grog pur elèctric
        "Peu":            "#E0E0E0"  // Blanc grisós clar (perfectament legible)
    },
};