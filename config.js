/* ============================================================
   CONFIG.JS - Configuració global del projecte
   Canvia aquí les dades per adaptar-lo a cada negoci
   ============================================================ */

const CONFIG = {

    // 1. NEGOCI
    NOM:            "àgora",
    LOGO:           "logo/logoAGtrans.png",
    SLOGAN:         "Plaça Vella",
    TELEFON:        "93 788 72 91",
    MOBIL:          "625 52 52 79",
    EMAIL:          "agora@altervector.com", /*agora26vella@gmail.com */
    ADRECA:         "Carrer de Jaume Cantarer, 4, 08221 Terrassa, Barcelona",
    INSTAGRAM:      "https://www.instagram.com/agoraplazavella",
    FACEBOOK:       "https://www.facebook.com/profile.php?id=100054618451503",
    EMAIL_SUPORT:   "suport@altervector.com",


    // 2. RUTES (en local, tot és relatiu)
    REPO_URL:       "https://altervector.github.io/agora/",
    BASE_URL:       "./",
    BASE_WORKER:    "https://agora.altervector.workers.dev",
    URL_OFICIAL:    "https://agora.altervector.com",
    ASSETS:         "https://avsets.pages.dev/",

    // 2.2 RUTES Imatges
    //BACKGROUND:      "Canviar en el css del .html",
    BLOC_HERO:       "images/agora/hero-agora.png",
    BLOC1:           "images/agora/diari.png",
    BLOC2:           "images/agora/finde.png",
    BLOC3:           "images/agora/grups.png",
    BLOC4:           "",
    QR:              "qr/qr-àgora.png",

    // 2.3 RUTES Textos
    HERO_BOTO:       "Descobreix-nos",
    SECCIO_TITOL:    "Els nostres Menús",

    BLOC1_TITOL:     "Menú Diari",
    BLOC1_DESC:      "De dilluns a divendres al migdia. Primer, segon, postre i beguda.",

    BLOC2_TITOL:     "Menú Cap de Setmana",
    BLOC2_DESC:      "Dissabte i diumenge. Una selecció especial per gaudir en família.",

    BLOC3_TITOL:     "Menú Grups",
    BLOC3_DESC:      "Per a celebracions i esdeveniments. Consulta'ns per personalitzar el teu menú.",

    BLOC4_TITOL:     "",
    BLOC4_DESC:      "",

    QUI_SOM:         "Qui som...",
    QUI_DESC:        "Nuestro local esta dedicado a los servicios de restauración. Ofreciendo cocina mediterránea y española, incluyendo desayunos, comidas, cenas y tapas, con opciones para comer en el local, en su terraza o para llevar. Les brindamos una comida de calidad, ambiente acogedor y servicio amable.",

    HORA_1:          "Dilluns a dijous: 08:00 – 23:00h",
    HORA_2:          "Divendres i dissabte: 08:00 – 24:00h",
    HORA_3:          "Diumenge: 09:00 - 23:00h",

    RESERVES:        "Fes la teva Reserva",


    // 3. SEGURETAT (de moment buit, s'activa quan pujem a producció)
    SITIOS_SEGUROS:  ["altervector.com", "pages.dev", "altervector.github.io", "localhost", "127.0.0.1"],
    
    
    // 4. COLORS (per si cal canviar-los des de JS)
    COLOR_PRINCIPAL: "#2c3e35",
    COLOR_ACCENT:    "#c8973a",
};