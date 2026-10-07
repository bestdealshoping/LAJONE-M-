/* =====================================================
   LAJONÈ'M — PARAMÈT DINAMIK
===================================================== */

let parametLajonem = null;


/* =====================================================
   CHAJE PARAMÈT YO
===================================================== */

async function chajeParametPiblik() {

    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("paramet")
            .select(`
                id,
                non_oganizasyon,
                slogan,
                deskripsyon,
                telefòn,
                email,
                adrès,
                sit_web,
                whatsapp,
                facebook,
                logo_url,
                koulè_prensipal,
                koulè_segondè,
                koulè_tèsyè,
                antretyen,
                mesaj_antretyen,
                aktif
            `)
            .eq("aktif", true)
            .limit(1)
            .maybeSingle();


        if (error) {

            console.error(
                "❌ Erè chaje paramèt:",
                error
            );

            return null;
        }


        if (!data) {

            console.warn(
                "⚠️ Pa gen paramèt LAJONÈ'M nan baz done a."
            );

            return null;
        }


        parametLajonem = data;


        aplikeParametPiblik(data);


        return data;


    } catch (error) {

        console.error(
            "❌ Erè sistèm paramèt:",
            error
        );

        return null;
    }
}


/* =====================================================
   APLIKE PARAMÈT YO
===================================================== */

function aplikeParametPiblik(data) {

    /* ---------------------------------------------
       KOULÈ
    --------------------------------------------- */

    if (data.koulè_prensipal) {

        document.documentElement.style.setProperty(
            "--ble",
            data.koulè_prensipal
        );
    }


    if (data.koulè_segondè) {

        document.documentElement.style.setProperty(
            "--or",
            data.koulè_segondè
        );
    }


    if (data.koulè_tèsyè) {

        document.documentElement.style.setProperty(
            "--vet",
            data.koulè_tèsyè
        );
    }


    /* ---------------------------------------------
       ELEMENT KI GEN data-paramet
    --------------------------------------------- */

    document
        .querySelectorAll("[data-paramet]")
        .forEach(function(element) {

            const kle =
                element.dataset.paramet;

            if (
                data[kle] !== null &&
                data[kle] !== undefined
            ) {

                element.textContent =
                    data[kle];
            }

        });


    /* ---------------------------------------------
       INPUT / VALUE
    --------------------------------------------- */

    document
        .querySelectorAll("[data-paramet-value]")
        .forEach(function(element) {

            const kle =
                element.dataset.parametValue;

            if (
                data[kle] !== null &&
                data[kle] !== undefined
            ) {

                element.value =
                    data[kle];
            }

        });


    /* ---------------------------------------------
       LINK
    --------------------------------------------- */

    document
        .querySelectorAll("[data-paramet-link]")
        .forEach(function(element) {

            const kle =
                element.dataset.parametLink;

            if (
                data[kle] !== null &&
                data[kle] !== undefined
            ) {

                element.href =
                    data[kle];

            }

        });


    /* ---------------------------------------------
       LOGO
    --------------------------------------------- */

    document
        .querySelectorAll("[data-paramet-logo]")
        .forEach(function(element) {

            if (data.logo_url) {

                element.src =
                    data.logo_url;

            }

        });


    /* ---------------------------------------------
       TITLE
    --------------------------------------------- */

    if (data.non_oganizasyon) {

        document.title =
            data.non_oganizasyon;
    }


    /* ---------------------------------------------
       META DESCRIPTION
    --------------------------------------------- */

    const metaDescription =
        document.querySelector(
            'meta[name="description"]'
        );


    if (
        metaDescription &&
        data.deskripsyon
    ) {

        metaDescription.setAttribute(
            "content",
            data.deskripsyon
        );

    }


    /* ---------------------------------------------
       WHATSAPP
    --------------------------------------------- */

    document
        .querySelectorAll("[data-whatsapp]")
        .forEach(function(element) {

            if (data.whatsapp) {

                let number =
                    String(data.whatsapp)
                        .replace(/\D/g, "");


                element.href =
                    "https://wa.me/" + +50942824391;

            }

        });


    /* ---------------------------------------------
       ANTRETEN
    --------------------------------------------- */

    if (data.antretyen === true) {

        aficheModeAntretyen(
            data.mesaj_antretyen
        );

    }

}


/* =====================================================
   MODE ANTRETYEN
===================================================== */

function aficheModeAntretyen(message) {

    const page =
        document.body;


    if (!page) {
        return;
    }


    const existing =
        document.getElementById(
            "lajonem-maintenance"
        );


    if (existing) {
        return;
    }


    const overlay =
        document.createElement("div");


    overlay.id =
        "lajonem-maintenance";


    overlay.innerHTML = `

        <div style="
            min-height:100vh;
            width:100%;
            display:flex;
            align-items:center;
            justify-content:center;
            padding:25px;
            background:#F5F7FA;
            font-family:Montserrat,Arial,sans-serif;
            position:fixed;
            inset:0;
            z-index:999999;
        ">

            <div style="
                width:100%;
                max-width:550px;
                background:#FFFFFF;
                border-radius:20px;
                padding:40px 30px;
                text-align:center;
                box-shadow:0 15px 45px rgba(0,0,0,.12);
            ">

                <div style="
                    width:70px;
                    height:70px;
                    margin:0 auto 20px;
                    border-radius:50%;
                    background:#FFF7D6;
                    color:#F2B705;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    font-size:32px;
                    font-weight:800;
                ">
                    !
                </div>


                <h1 style="
                    color:#0B3B75;
                    font-size:24px;
                    margin-bottom:15px;
                ">
                    LAJONÈ'M
                </h1>


                <h2 style="
                    color:#172033;
                    font-size:19px;
                    margin-bottom:12px;
                ">
                    Sit la an antretyen
                </h2>


                <p style="
                    color:#667085;
                    font-size:14px;
                    line-height:1.7;
                ">
                    ${
                        message ||
                        "Nou ap travay pou amelyore sit LAJONÈ'M. Tanpri retounen pita."
                    }
                </p>

            </div>

        </div>

    `;


    document.body.appendChild(
        overlay
    );

}


/* =====================================================
   FONKSYON AKSÈ RAPID
===================================================== */

function jwennParamet(
    kle,
    defaultValue = ""
) {

    if (
        parametLajonem &&
        parametLajonem[kle] !== null &&
        parametLajonem[kle] !== undefined
    ) {

        return parametLajonem[kle];

    }

    return defaultValue;
}


/* =====================================================
   DEMARAJ OTOMATIK
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        await chajeParametPiblik();

    }
);