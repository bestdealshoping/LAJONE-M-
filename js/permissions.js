/* =========================================================
   LAJONÈ'M — RBAC / PERMISSIONS SYSTEM
   ========================================================= */

/*
   Wòl:
   - super_admin
   - admin
   - editè
   - volonte

   Pèmisyon administrasyon:
   - jere_itilizatè
   - jere_pwogram
   - jere_aktivite
   - jere_volonte
   - jere_benefisye
   - jere_vizit
   - jere_don
   - jere_donatè
   - jere_patne
   - jere_galri
   - jere_nouvel
   - jere_rapo
   - jere_mesaj
   - jere_paramet

   Pèmisyon volontè:
   - wè_pwogram
   - wè_aktivite
   - wè_galri
   - wè_vizit
*/


/* =========================================================
   VARIABLES GLOBALES
   ========================================================= */

let profilAdmin = null;

let pèmisyonAdmin = [];

let rbacPare = false;

let rbacPromise = null;


/* =========================================================
   TOUT PÈMISYON SISTÈM NAN
   ========================================================= */

const toutPèmisyon = [

    /* ADMINISTRATION */

    "jere_itilizatè",

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

    "jere_paramet",


    /* VOLONTÈ — LECTURE SEULE */

    "wè_pwogram",

    "wè_aktivite",

    "wè_galri",

    "wè_vizit"

];


/* =========================================================
   CHAJE RBAC
   ========================================================= */

async function chajeRBAC() {

    /*
       Si RBAC deja pare,
       pa bezwen rechaje l.
    */

    if (rbacPare) {

        return {

            profil: profilAdmin,

            pèmisyon: pèmisyonAdmin

        };

    }


    /*
       Si yon lòt chajman deja ap fèt,
       tann li.
    */

    if (rbacPromise) {

        return await rbacPromise;

    }


    rbacPromise = (async function() {

        try {

            console.log(
                "RBAC: Kòmanse chajman..."
            );


            /* =================================================
               1. VERIFYE SUPABASE
            ================================================== */

            if (
                typeof supabaseClient ===
                "undefined"
            ) {

                throw new Error(
                    "supabaseClient pa disponib."
                );

            }


            /* =================================================
               2. JWENN ITILIZATÈ KI KONEKTE A
            ================================================== */

            const {

                data:
                    userData,

                error:
                    userError

            } =

                await supabaseClient

                    .auth

                    .getUser();


            if (userError) {

                console.error(
                    "RBAC: Erè getUser:",
                    userError
                );

                throw userError;

            }


            const user =
                userData?.user;


            if (!user) {

                throw new Error(
                    "Pa gen itilizatè ki konekte."
                );

            }


            console.log(
                "RBAC: Itilizatè konekte:",
                user.email
            );


            /* =================================================
               3. JWENN PWOFIL ADMIN
            ================================================== */

            const {

                data:
                    profil,

                error:
                    profilError

            } =

                await supabaseClient

                    .from(
                        "itilizatè_admin"
                    )

                    .select(`
                        id,
                        user_id,
                        non,
                        siyati,
                        email,
                        wòl,
                        aktif
                    `)

                    .eq(
                        "user_id",
                        user.id
                    )

                    .eq(
                        "aktif",
                        true
                    )

                    .maybeSingle();


            if (profilError) {

                console.error(
                    "RBAC: Erè profil:",
                    profilError
                );

                throw profilError;

            }


            if (!profil) {

                throw new Error(
                    "Pwofil itilizatè a pa jwenn oswa kont lan pa aktif."
                );

            }


            profilAdmin =
                profil;


            const wol =

                String(
                    profil.wòl || ""
                )

                .trim()

                .toLowerCase();


            console.log(
                "RBAC: Wòl itilizatè:",
                wol
            );


            /* =================================================
               4. SUPER ADMIN
               
               Super Admin gen tout pèmisyon.
            ================================================== */

            if (
                wol === "super_admin"
            ) {

                pèmisyonAdmin =
                    [...toutPèmisyon];


                rbacPare =
                    true;


                console.log(
                    "RBAC: Super Admin — tout pèmisyon aktive."
                );


                console.log(
                    "RBAC: Pèmisyon yo:",
                    pèmisyonAdmin
                );


                console.log(
                    "RBAC: Chajman fini avèk siksè."
                );


                return {

                    profil:
                        profilAdmin,

                    pèmisyon:
                        pèmisyonAdmin

                };

            }


            /* =================================================
               5. CHACHE PÈMISYON POU LÒT WÒL YO
               
               Nou itilize RPC security-definer la:
               
               itilizatè_gen_pèmisyon()
            ================================================== */

            const pèmisyonJwenn = [];


            for (
                const nonPèmisyon
                of toutPèmisyon
            ) {

                try {

                    const {

                        data,
                        error

                    } =

                        await supabaseClient

                            .rpc(
                                "itilizatè_gen_pèmisyon",
                                {
                                    non_pèmisyon:
                                        nonPèmisyon
                                }
                            );


                    if (error) {

                        console.warn(
                            "RBAC: Erè pèmisyon",
                            nonPèmisyon,
                            error
                        );

                        continue;

                    }


                    if (
                        data === true
                    ) {

                        pèmisyonJwenn.push(
                            nonPèmisyon
                        );

                    }

                } catch (error) {

                    console.warn(
                        "RBAC: Erè RPC pou",
                        nonPèmisyon,
                        error
                    );

                }

            }


            /* =================================================
               6. SOVE PÈMISYON YO
            ================================================== */

            pèmisyonAdmin =
                pèmisyonJwenn;


            console.log(
                "RBAC: Pèmisyon yo:",
                pèmisyonAdmin
            );


            /* =================================================
               7. VERIFYE SI GEN OMEN YON PÈMISYON
            ================================================== */

            if (
                pèmisyonAdmin.length === 0
            ) {

                console.warn(
                    "RBAC: Itilizatè a pa gen okenn pèmisyon."
                );

            }


            /* =================================================
               8. RBAC PARE
            ================================================== */

            rbacPare =
                true;


            console.log(
                "RBAC: Chajman fini avèk siksè."
            );


            return {

                profil:
                    profilAdmin,

                pèmisyon:
                    pèmisyonAdmin

            };


        } catch (error) {

            console.error(
                "RBAC: Erè jeneral:",
                error
            );


            rbacPare =
                false;


            throw error;

        } finally {

            rbacPromise =
                null;

        }

    })();


    return await rbacPromise;

}


/* =========================================================
   VERIFYE YON PÈMISYON
   ========================================================= */

function genPèmisyon(
    nonPèmisyon
) {

    if (!nonPèmisyon) {

        return false;

    }


    /*
       Super Admin toujou gen tout aksè.
    */

    if (
        profilAdmin?.wòl ===
        "super_admin"
    ) {

        return true;

    }


    return pèmisyonAdmin.includes(
        nonPèmisyon
    );

}


/* =========================================================
   VERIFYE AKSÈ
   ========================================================= */

function egzijePèmisyon(
    nonPèmisyon
) {

    return genPèmisyon(
        nonPèmisyon
    );

}


/* =========================================================
   JWENN WÒL ADMIN
   ========================================================= */

function jwennWolAdmin() {

    return (
        profilAdmin?.wòl ||
        null
    );

}


/* =========================================================
   JWENN NON WÒL
   ========================================================= */

function jwennNonWolAdmin() {

    const wol =
        profilAdmin?.wòl;


    const nonWol = {

        "super_admin":
            "Super Administratè",

        "admin":
            "Administratè",

        "editè":
            "Editè",

        "volonte":
            "Volontè"

    };


    return (
        nonWol[wol] ||
        wol ||
        "Itilizatè"
    );

}


/* =========================================================
   JWENN PROFIL
   ========================================================= */

function jwennProfilAdmin() {

    return profilAdmin;

}


/* =========================================================
   PWOTEJE YON ELEMENT
   ========================================================= */

function pwotejeElement(
    element,
    nonPèmisyon
) {

    if (!element) {

        return;

    }


    if (
        genPèmisyon(
            nonPèmisyon
        )
    ) {

        element.style.display =
            "";

        element.removeAttribute(
            "aria-hidden"
        );

        return;

    }


    element.style.display =
        "none";

    element.setAttribute(
        "aria-hidden",
        "true"
    );

}


/* =========================================================
   PWOTEJE MENI ADMIN
   ========================================================= */

function pwotejeMeniAdmin() {

    const elements =
        document.querySelectorAll(
            "[data-permission]"
        );


    elements.forEach(
        function(element) {

            const permission =
                element.getAttribute(
                    "data-permission"
                );


            if (!permission) {

                return;

            }


            pwotejeElement(
                element,
                permission
            );

        }
    );

}


/* =========================================================
   DEMARE RBAC
   ========================================================= */

async function demareRBAC(
    options = {}
) {

    try {

        await chajeRBAC();


        /*
           Apre RBAC fin chaje,
           pwoteje eleman yo.
        */

        pwotejeMeniAdmin();


        /*
           Callback opsyonèl.
        */

        if (
            typeof options.onReady ===
            "function"
        ) {

            options.onReady({

                profil:
                    profilAdmin,

                pèmisyon:
                    pèmisyonAdmin

            });

        }


        return {

            profil:
                profilAdmin,

            pèmisyon:
                pèmisyonAdmin

        };


    } catch (error) {

        console.error(
            "RBAC: Pa kapab demare:",
            error
        );


        if (
            typeof options.onError ===
            "function"
        ) {

            options.onError(
                error
            );

        }


        throw error;

    }

}


/* =========================================================
   EXPORT / DEBUG
   ========================================================= */

window.LAJONEM_RBAC = {

    chajeRBAC,

    genPèmisyon,

    egzijePèmisyon,

    jwennWolAdmin,

    jwennNonWolAdmin,

    jwennProfilAdmin,

    pwotejeElement,

    pwotejeMeniAdmin,

    demareRBAC

};