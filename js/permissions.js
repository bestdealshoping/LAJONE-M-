/*
==========================================================
LAJONÈ'M — SÈVIS PÈMISYON / RBAC
Fichye: js/permissions.js
==========================================================
*/

let LAJ_ROLE = null;
let LAJ_PERMISSIONS = [];
let LAJ_ADMIN_PROFILE = null;


/*
----------------------------------------------------------
CHARGE PROFIL AK PÈMISYON
----------------------------------------------------------
*/

async function chajePèmisyon() {

  try {

    const {
      data: {
        user
      },
      error: userError
    } = await supabaseClient.auth.getUser();


    if (userError || !user) {

      console.warn(
        "Itilizatè a pa konekte."
      );

      return false;

    }


    /*
    ------------------------------------------------------
    Chèche profil administratè a
    ------------------------------------------------------
    */

    const {
      data: profile,
      error: profileError
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


    if (profileError) {

      console.error(
        "Erè profil administratè:",
        profileError
      );

      return false;

    }


    if (!profile) {

      console.warn(
        "Pa gen profil administratè aktif."
      );

      return false;

    }


    LAJ_ADMIN_PROFILE =
      profile;

    LAJ_ROLE =
      profile.wòl;


    /*
    ------------------------------------------------------
    Super Admin
    ------------------------------------------------------
    */

    if (
      LAJ_ROLE === "super_admin"
    ) {

      LAJ_PERMISSIONS = [
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

      return true;

    }


    /*
    ------------------------------------------------------
    Pou lòt wòl yo
    ------------------------------------------------------
    */

    const {
      data,
      error
    } = await supabaseClient

      .rpc(
        "laj_get_my_permissions"
      );


    /*
      Si RPC sa a poko egziste,
      n ap itilize fonksyon SQL
      itilizatè_gen_pèmisyon()
      kòm verifikasyon.
    */

    if (
      !error &&
      Array.isArray(data)
    ) {

      LAJ_PERMISSIONS =
        data;

    }


    return true;


  } catch (error) {

    console.error(
      "RBAC ERROR:",
      error
    );

    return false;

  }

}


/*
----------------------------------------------------------
VERIFYE YON PÈMISYON
----------------------------------------------------------
*/

async function genPèmisyon(
  permission
) {

  /*
    Si profil la poko chaje,
    chaje li.
  */

  if (!LAJ_ROLE) {

    const ok =
      await chajePèmisyon();

    if (!ok) {

      return false;

    }

  }


  /*
  --------------------------------------------------------
  SUPER ADMIN
  --------------------------------------------------------
  */

  if (
    LAJ_ROLE === "super_admin"
  ) {

    return true;

  }


  /*
  --------------------------------------------------------
  Pèmisyon deja nan cache
  --------------------------------------------------------
  */

  if (
    LAJ_PERMISSIONS.includes(
      permission
    )
  ) {

    return true;

  }


  /*
  --------------------------------------------------------
  Verifye dirèkteman nan Supabase
  --------------------------------------------------------
  */

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
        "Erè verifikasyon pèmisyon:",
        error
      );

      return false;

    }


    if (data === true) {

      LAJ_PERMISSIONS.push(
        permission
      );

      return true;

    }


    return false;


  } catch (error) {

    console.error(
      "Permission error:",
      error
    );

    return false;

  }

}


/*
----------------------------------------------------------
EGZIJE YON PÈMISYON
----------------------------------------------------------
*/

async function egzijePèmisyon(
  permission,
  redirectPage = "admin.html"
) {

  const allowed =
    await genPèmisyon(
      permission
    );


  if (!allowed) {

    alert(
      "Ou pa gen otorizasyon pou jwenn aksè ak paj sa a."
    );

    window.location.href =
      redirectPage;

    return false;

  }


  return true;

}


/*
----------------------------------------------------------
EGZIJE ADMIN
----------------------------------------------------------
*/

async function egzijeAdmin(
  redirectPage = "login.html"
) {

  const {
    data: {
      user
    }
  } = await supabaseClient.auth.getUser();


  if (!user) {

    window.location.href =
      redirectPage;

    return false;

  }


  if (!LAJ_ADMIN_PROFILE) {

    const ok =
      await chajePèmisyon();

    if (!ok) {

      window.location.href =
        redirectPage;

      return false;

    }

  }


  return true;

}


/*
----------------------------------------------------------
JWENN WÒL
----------------------------------------------------------
*/

function jwennWol() {

  return LAJ_ROLE;

}


/*
----------------------------------------------------------
JWENN PROFIL ADMIN
----------------------------------------------------------
*/

function jwennProfilAdmin() {

  return LAJ_ADMIN_PROFILE;

}


/*
----------------------------------------------------------
JWENN TOUT PÈMISYON
----------------------------------------------------------
*/

function jwennToutPèmisyon() {

  return [
    ...LAJ_PERMISSIONS
  ];

}


/*
----------------------------------------------------------
KACHE MENI DAPRÈ PÈMISYON
----------------------------------------------------------

Egzanp HTML:

<a
  href="admin-galri.html"
  data-permission="jere_galri"
>
  Galri
</a>

----------------------------------------------------------
*/

async function aplikePèmisyonSouMeni() {

  const elements =
    document.querySelectorAll(
      "[data-permission]"
    );


  for (
    const element of elements
  ) {

    const permission =
      element.dataset.permission;


    const allowed =
      await genPèmisyon(
        permission
      );


    if (!allowed) {

      element.style.display =
        "none";

    }

  }

}


/*
----------------------------------------------------------
KACHE ELEMAN DAPRÈ WÒL
----------------------------------------------------------

Egzanp:

<button
  data-role="super_admin"
>
  Efase
</button>

----------------------------------------------------------
*/

function aplikeWolSouEleman() {

  const elements =
    document.querySelectorAll(
      "[data-role]"
    );


  elements.forEach(
    element => {

      const allowedRoles =
        element.dataset.role
          .split(",")
          .map(
            role =>
              role.trim()
          );


      if (
        !allowedRoles.includes(
          LAJ_ROLE
        )
      ) {

        element.style.display =
          "none";

      }

    }
  );

}


/*
----------------------------------------------------------
INIT RBAC
----------------------------------------------------------
*/

async function initRBAC() {

  const ok =
    await chajePèmisyon();


  if (!ok) {

    return false;

  }


  await aplikePèmisyonSouMeni();

  aplikeWolSouEleman();


  /*
    Mete enfòmasyon wòl la
    sou paj la si eleman an egziste.
  */

  const roleElements =
    document.querySelectorAll(
      "[data-current-role]"
    );


  roleElements.forEach(
    element => {

      element.textContent =
        LAJ_ROLE;

    }
  );


  return true;

}


/*
----------------------------------------------------------
FONKSYON GLOBAL
----------------------------------------------------------
*/

window.LAJPèmisyon = {

  chajePèmisyon,

  genPèmisyon,

  egzijePèmisyon,

  egzijeAdmin,

  jwennWol,

  jwennProfilAdmin,

  jwennToutPèmisyon,

  aplikePèmisyonSouMeni,

  aplikeWolSouEleman,

  initRBAC

};