/* =========================================================
   LAJONÈ'M — SYSTÈM RBAC
   Kontwòl wòl ak pèmisyon
   ========================================================= */

let profilAdmin = null;
let pèmisyonAdmin = [];
let rbacPare = false;
let rbacPromise = null;


/* =========================================================
   TOUT PÈMISYON SISTÈM NAN
   ========================================================= */

const toutPèmisyon = [

    // ADMINISTRATION
    "jere_itilizatè",
    "jere_paramet",

    // OPERASYON
    "jere_pwogram",
    "jere_aktivite",
    "jere_volonte",
    "jere_benefisye",
    "jere_vizit",
    "jere_don",
    "jere_donatè",
    "jere_patne",
    "jere_galri",
    "jere_nouvel",
    "jere_rapo",
    "jere_mesaj",

    // AKSÈ LECTURE POU VOLONTE
    "wè_pwogram",
    "wè_aktivite",
    "wè_galri",
    "wè_vizit"
];


/* =========================================================
   CHAJE RBAC
   ========================================================= */

async function chajeRBAC() {

    if (rbacPare) {
        return {
            profil: profilAdmin,
            pèmisyon: pèmisyonAdmin
        };
    }

    if (rbacPromise) {
        return rbacPromise;
    }

    rbacPromise = (async () => {

        try {

            /* -----------------------------------------
               1. VERIFYE UTILIZATÈ CONNECTE
               ----------------------------------------- */

            const {
                data: { user },
                error: userError
            } = await supabaseClient.auth.getUser();

            if (userError || !user) {
                throw new Error("Itilizatè a pa konekte.");
            }


            /* -----------------------------------------
               2. CHÈCHE PROFIL ADMIN
               ----------------------------------------- */

            const { data: profil, error: profilError } =
                await supabaseClient
                    .from("itilizatè_admin")
                    .select(`
                        id,
                        user_id,
                        non,
                        siyati,
                        email,
                        wòl,
                        aktif
                    `)
                    .eq("user_id", user.id)
                    .eq("aktif", true)
                    .maybeSingle();


            if (profilError) {
                console.error(
                    "❌ Erè profil administratè:",
                    profilError
                );

                throw new Error(
                    profilError.message ||
                    "Nou pa kapab verifye profil administratè a."
                );
            }


            if (!profil) {
                throw new Error(
                    "Profil administratè a pa jwenn oswa li pa aktif."
                );
            }


            profilAdmin = profil;


            /* -----------------------------------------
               3. SUPER ADMIN
               ----------------------------------------- */

            if (profil.wòl === "super_admin") {

                pèmisyonAdmin = [...toutPèmisyon];

                rbacPare = true;

                console.log(
                    "✅ RBAC: Super Admin — tout pèmisyon aktive."
                );

                return {
                    profil: profilAdmin,
                    pèmisyon: pèmisyonAdmin
                };
            }


            /* -----------------------------------------
               4. CHÈCHE PÈMISYON WÒL LA
               ----------------------------------------- */

            const permissionsAkòde = [];

            for (const nonPèmisyon of toutPèmisyon) {

                try {

                    const {
                        data,
                        error
                    } = await supabaseClient.rpc(
                        "itilizatè_gen_pèmisyon",
                        {
                            non_pèmisyon: nonPèmisyon
                        }
                    );


                    if (error) {

                        console.warn(
                            `⚠️ Pèmisyon ${nonPèmisyon}:`,
                            error.message
                        );

                        continue;
                    }


                    if (data === true) {
                        permissionsAkòde.push(
                            nonPèmisyon
                        );
                    }

                } catch (error) {

                    console.warn(
                        `⚠️ Erè verifye ${nonPèmisyon}:`,
                        error
                    );
                }
            }


            pèmisyonAdmin = permissionsAkòde;

            rbacPare = true;


            console.log(
                "✅ RBAC chaje:",
                {
                    wòl: profil.wòl,
                    pèmisyon: pèmisyonAdmin
                }
            );


            return {
                profil: profilAdmin,
                pèmisyon: pèmisyonAdmin
            };

        } catch (error) {

            console.error(
                "❌ Erè RBAC:",
                error
            );

            rbacPare = false;

            throw error;
        }

    })();

    return rbacPromise;
}


/* =========================================================
   VERIFYE SI ITILIZATÈ GEN YON PÈMISYON
   ========================================================= */

function genPèmisyon(nonPèmisyon) {

    if (!rbacPare || !profilAdmin) {
        return false;
    }


    /* Super Admin toujou gen tout dwa */

    if (profilAdmin.wòl === "super_admin") {
        return true;
    }


    return pèmisyonAdmin.includes(
        nonPèmisyon
    );
}


/* =========================================================
   EGZIJE YON PÈMISYON
   ========================================================= */

function egzijePèmisyon(nonPèmisyon) {

    if (!genPèmisyon(nonPèmisyon)) {

        console.warn(
            `⛔ Aksè refize: ${nonPèmisyon}`
        );

        return false;
    }

    return true;
}


/* =========================================================
   JWENN WÒL ADMIN
   ========================================================= */

function jwennWolAdmin() {

    if (!profilAdmin) {
        return null;
    }

    return profilAdmin.wòl || null;
}


/* =========================================================
   JWENN NON WÒL
   ========================================================= */

function jwennNonWolAdmin() {

    const wol = jwennWolAdmin();

    if (!wol) {
        return "";
    }


    const nonWol = {

        super_admin: "Super Admin",

        admin: "Administratè",

        editè: "Editè",

        volonte: "Volontè"

    };


    return nonWol[wol] || wol;
}


/* =========================================================
   JWENN PROFIL ADMIN
   ========================================================= */

function jwennProfilAdmin() {

    return profilAdmin;
}


/* =========================================================
   PWOTEJE YON ELEMAN
   ========================================================= */

function pwotejeElement(
    selector,
    nonPèmisyon
) {

    const elements =
        document.querySelectorAll(selector);


    elements.forEach(element => {

        if (!genPèmisyon(nonPèmisyon)) {

            element.style.display = "none";

            element.setAttribute(
                "aria-hidden",
                "true"
            );

        } else {

            element.style.display = "";

            element.removeAttribute(
                "aria-hidden"
            );
        }

    });
}


/* =========================================================
   PWOTEJE MENI ADMIN
   ========================================================= */

function pwotejeMeniAdmin() {

    const elements =
        document.querySelectorAll(
            "[data-permission]"
        );


    elements.forEach(element => {

        const permission =
            element.dataset.permission;


        if (!permission) {
            return;
        }


        if (!genPèmisyon(permission)) {

            element.style.display = "none";

            element.setAttribute(
                "aria-hidden",
                "true"
            );

        } else {

            element.style.display = "";

            element.removeAttribute(
                "aria-hidden"
            );
        }

    });
}


/* =========================================================
   DEMARE RBAC
   ========================================================= */

async function demareRBAC() {

    try {

        await chajeRBAC();

        pwotejeMeniAdmin();

        return true;

    } catch (error) {

        console.error(
            "❌ RBAC pa kapab demare:",
            error
        );

        return false;
    }
}


/* =========================================================
   UTILITÈ — TÈSTE WÒL
   ========================================================= */

function seSuperAdmin() {

    return (
        profilAdmin &&
        profilAdmin.wòl === "super_admin"
    );
}


function seAdmin() {

    return (
        profilAdmin &&
        (
            profilAdmin.wòl === "admin" ||
            profilAdmin.wòl === "super_admin"
        )
    );
}


function seEdite() {

    return (
        profilAdmin &&
        profilAdmin.wòl === "editè"
    );
}


function seVolonte() {

    return (
        profilAdmin &&
        profilAdmin.wòl === "volonte"
    );
}