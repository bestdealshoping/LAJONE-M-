/* =========================================================
   LAJONÈ'M — SYSTÈM RBAC
   js/permissions.js
========================================================= */


/* =========================================================
   VARIABLES GLOBALES
========================================================= */

let profilAdmin = null;

let pèmisyonAdmin = [];

let rbacPare = false;

let rbacPromise = null;


/* =========================================================
   LIS TOUT PÈMISYON YO
========================================================= */

const toutPèmisyon = [

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

  "jere_paramet"

];


/* =========================================================
   CHAJE RBAC
========================================================= */

async function chajeRBAC() {

  /*
   * Si RBAC deja chaje, pa fè menm travay la ankò.
   */

  if (rbacPare) {
    return true;
  }


  /*
   * Si gen yon chajman deja ankou,
   * tann li olye nou fè yon lòt.
   */

  if (rbacPromise) {
    return await rbacPromise;
  }


  rbacPromise = (async () => {

    try {

      console.log(
        "RBAC: Kòmanse chajman..."
      );


      /* =========================================
         1. VERIFYE AUTH
      ========================================== */

      const {
        data: {
          user
        },
        error: authError
      } = await supabaseClient.auth.getUser();


      if (authError) {

        console.error(
          "RBAC: Erè Auth:",
          authError
        );

        return false;
      }


      if (!user) {

        console.error(
          "RBAC: Pa gen itilizatè konekte."
        );

        return false;
      }


      console.log(
        "RBAC: Itilizatè konekte:",
        user.email
      );


      /* =========================================
         2. CHACHE PWOFIL ADMIN
      ========================================== */

      const {
        data: profil,
        error: profilError
      } = await supabaseClient

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
          "RBAC: Erè pwofil:",
          profilError
        );

        return false;
      }


      if (!profil) {

        console.error(
          "RBAC: Pwofil administratè pa jwenn."
        );

        return false;
      }


      profilAdmin = profil;


      console.log(
        "RBAC: Wòl itilizatè:",
        profilAdmin.wòl
      );


      /* =========================================
         3. VERIFYE SUPER ADMIN
      ========================================== */

      if (
        profilAdmin.wòl === "super_admin"
      ) {

        /*
         * Super Admin gen tout pèmisyon.
         */

        pèmisyonAdmin = [
          ...toutPèmisyon
        ];


        rbacPare = true;


        console.log(
          "RBAC: Super Admin — tout pèmisyon aktive."
        );


        return true;
      }


      /* =========================================
         4. LÒT WÒL YO
      ========================================== */

      /*
       * Pou admin, editè ak volonte,
       * nou verifye chak pèmisyon atravè
       * fonksyon SECURITY DEFINER la.
       *
       * Sa evite pwoblèm RLS sou tab:
       *
       * wol_admin
       * wol_pèmisyon
       * pèmisyon_admin
       */


      const rezilta =
        await Promise.all(

          toutPèmisyon.map(
            async (permission) => {

              try {

                const {
                  data,
                  error
                } = await supabaseClient

                  .rpc(
                    "itilizatè_gen_pèmisyon",
                    {
                      non_pèmisyon:
                        permission
                    }
                  );


                if (error) {

                  console.error(
                    "RBAC RPC:",
                    permission,
                    error
                  );

                  return {
                    permission,
                    genyen: false
                  };
                }


                return {
                  permission,
                  genyen: data === true
                };

              } catch (error) {

                console.error(
                  "RBAC RPC EXCEPTION:",
                  permission,
                  error
                );

                return {
                  permission,
                  genyen: false
                };
              }

            }
          )

        );


      /* =========================================
         5. KONSTWI LIS PÈMISYON YO
      ========================================== */

      pèmisyonAdmin =
        rezilta

          .filter(
            item => item.genyen === true
          )

          .map(
            item => item.permission
          );


      console.log(
        "RBAC: Pèmisyon yo:",
        pèmisyonAdmin
      );


      /* =========================================
         6. RBAC PARE
      ========================================== */

      rbacPare = true;


      console.log(
        "RBAC: Chajman fini avèk siksè."
      );


      return true;


    } catch (error) {

      console.error(
        "RBAC: Chajman echwe:",
        error
      );


      rbacPare = false;


      return false;

    }

  })();


  const reziltaFinal =
    await rbacPromise;


  /*
   * Nou retire Promise la apre li fin fini
   * sèlman si RBAC pa pare.
   */

  if (!rbacPare) {
    rbacPromise = null;
  }


  return reziltaFinal;
}


/* =========================================================
   VERIFYE SI ITILIZATÈ A GEN YON PÈMISYON
========================================================= */

function genPèmisyon(permission) {

  /*
   * Si RBAC poko fini chaje,
   * pa pran desizyon final isit la.
   */

  if (!rbacPare) {

    console.warn(
      "RBAC: Pèmisyon yo poko chaje:",
      permission
    );

    return false;
  }


  /*
   * Super Admin toujou gen tout aksè.
   */

  if (
    profilAdmin &&
    profilAdmin.wòl === "super_admin"
  ) {

    return true;
  }


  return pèmisyonAdmin.includes(
    permission
  );
}


/* =========================================================
   EGZIJE YON PÈMISYON
========================================================= */

async function egzijePèmisyon(permission) {

  /*
   * Chaje RBAC an premye.
   */

  const pare =
    await chajeRBAC();


  if (!pare) {

    alert(
      "Nou pa kapab verifye pèmisyon ou yo."
    );

    window.location.href =
      "login.html";

    return false;
  }


  /*
   * Verifye pèmisyon.
   */

  if (
    !genPèmisyon(permission)
  ) {

    alert(
      "Ou pa gen pèmisyon pou antre nan seksyon sa a."
    );

    window.location.href =
      "admin.html";

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
   JWENN NON WÒL LA
========================================================= */

function jwennNonWolAdmin() {

  const roles = {

    "super_admin":
      "Super Administratè",

    "admin":
      "Administratè",

    "editè":
      "Editè",

    "volonte":
      "Volontè"

  };


  const wol =
    jwennWolAdmin();


  return roles[wol] || wol || "";
}


/* =========================================================
   JWENN PWOFIL ADMIN
========================================================= */

function jwennProfilAdmin() {

  return profilAdmin;
}


/* =========================================================
   PWOTEJE YON ELEMENT
========================================================= */

async function pwotejeElement(
  selector,
  permission
) {

  const pare =
    await chajeRBAC();


  if (!pare) {
    return false;
  }


  const elements =
    document.querySelectorAll(
      selector
    );


  elements.forEach(
    element => {

      if (
        genPèmisyon(
          permission
        )
      ) {

        element.style.display = "";

      } else {

        element.style.display =
          "none";
      }

    }
  );


  return true;
}


/* =========================================================
   PWOTEJE MENI ADMIN
========================================================= */

async function pwotejeMeniAdmin() {

  const pare =
    await chajeRBAC();


  if (!pare) {
    return false;
  }


  document
    .querySelectorAll(
      "[data-permission]"
    )
    .forEach(
      element => {

        const permission =
          element.getAttribute(
            "data-permission"
          );


        if (
          genPèmisyon(
            permission
          )
        ) {

          element.style.display =
            "";

        } else {

          element.style.display =
            "none";
        }

      }
    );


  return true;
}


/* =========================================================
   DEMARE RBAC
========================================================= */

async function demareRBAC() {

  const pare =
    await chajeRBAC();


  if (!pare) {

    console.error(
      "RBAC: Demaraj echwe."
    );

    return false;
  }


  await pwotejeMeniAdmin();


  return true;
}


/* =========================================================
   DISPONIB NAN WINDOW
========================================================= */

window.LAJO_RBAC = {

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