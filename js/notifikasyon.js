// ============================================================
// LAJONÈ'M — SISTÈM NOTIFIKASYON ADMINISTRASYON
// ============================================================

let notifikasyonAdmin = [];
let notifikasyonPare = false;

// ------------------------------------------------------------
// JWENN ID ADMIN KI KONEKTE A
// ------------------------------------------------------------

async function jwennAdminKonekte() {
    try {
        const {
            data: { user },
            error: authError
        } = await supabaseClient.auth.getUser();

        if (authError || !user) {
            return null;
        }

        const { data, error } = await supabaseClient
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

        if (error) {
            console.error(
                "❌ Erè pwofil admin:",
                error
            );
            return null;
        }

        return data || null;

    } catch (error) {
        console.error(
            "❌ Erè jwenn admin:",
            error
        );

        return null;
    }
}

// ------------------------------------------------------------
// CHARGE NOTIFIKASYON YO
// ------------------------------------------------------------

async function chajeNotifikasyon() {

    try {

        const admin = await jwennAdminKonekte();

        if (!admin) {
            console.warn(
                "⚠️ Pa gen pwofil admin aktif."
            );
            return;
        }

        const { data, error } = await supabaseClient
            .from("notifikasyon")
            .select(`
                id,
                tit,
                mesaj,
                tip,
                url,
                itilizatè_id,
                li,
                dat_kreyasyon,
                dat_li
            `)
            .eq("itilizatè_id", admin.id)
            .order("dat_kreyasyon", {
                ascending: false
            })
            .limit(30);

        if (error) {
            console.error(
                "❌ Erè chaje notifikasyon:",
                error
            );
            return;
        }

        notifikasyonAdmin = data || [];
        notifikasyonPare = true;

        aficheNotifikasyon();

    } catch (error) {

        console.error(
            "❌ Erè sistèm notifikasyon:",
            error
        );

    }
}

// ------------------------------------------------------------
// KONTE NOTIFIKASYON KI PA LI
// ------------------------------------------------------------

function konteNotifikasyonPaLi() {

    return notifikasyonAdmin.filter(
        notification => notification.li === false
    ).length;
}

// ------------------------------------------------------------
// IKÒN SELON TIP NOTIFIKASYON
// ------------------------------------------------------------

function jwennIkonNotifikasyon(tip) {

    const ikon = {

        volonte: "👤",

        mesaj: "✉️",

        don: "💰",

        aktivite: "📅",

        vizit: "🏠",

        sistèm: "⚙️",

        info: "🔔"

    };

    return ikon[tip] || "🔔";
}

// ------------------------------------------------------------
// KLAS SELON TIP
// ------------------------------------------------------------

function jwennKlasNotifikasyon(tip) {

    const klas = {

        volonte: "notif-volonte",

        mesaj: "notif-mesaj",

        don: "notif-don",

        aktivite: "notif-aktivite",

        vizit: "notif-vizit",

        sistèm: "notif-systeme",

        info: "notif-info"

    };

    return klas[tip] || "notif-info";
}

// ------------------------------------------------------------
// ESCAPE HTML
// ------------------------------------------------------------

function escapeNotifikasyon(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ------------------------------------------------------------
// FÒMA DAT
// ------------------------------------------------------------

function fòmateDatNotifikasyon(date) {

    if (!date) {
        return "";
    }

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
        return "";
    }

    return d.toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

// ------------------------------------------------------------
// AFICHE NOTIFIKASYON YO
// ------------------------------------------------------------

function aficheNotifikasyon() {

    const container =
        document.getElementById(
            "notifikasyonContainer"
        );

    if (!container) {
        return;
    }

    if (!notifikasyonAdmin.length) {

        container.innerHTML = `
            <div class="notifikasyon-vide">
                <div class="notifikasyon-vide-ikon">
                    🔔
                </div>

                <h3>Pa gen notifikasyon</h3>

                <p>
                    Ou pa gen okenn nouvo notifikasyon
                    pou kounye a.
                </p>
            </div>
        `;

        meteBadgeNotifikasyon();

        return;
    }

    container.innerHTML =
        notifikasyonAdmin.map(notification => {

            const klase =
                jwennKlasNotifikasyon(
                    notification.tip
                );

            const ikon =
                jwennIkonNotifikasyon(
                    notification.tip
                );

            const paLi =
                notification.li === false
                    ? "notifikasyon-pa-li"
                    : "";

            return `

                <div
                    class="notifikasyon-item ${klase} ${paLi}"
                    data-id="${escapeNotifikasyon(notification.id)}"
                >

                    <div class="notifikasyon-ikon">
                        ${ikon}
                    </div>

                    <div class="notifikasyon-kontni">

                        <div class="notifikasyon-tet">

                            <strong>
                                ${escapeNotifikasyon(
                                    notification.tit
                                )}
                            </strong>

                            ${
                                notification.li === false
                                ? `
                                    <span class="notifikasyon-pwen"></span>
                                  `
                                : ""
                            }

                        </div>

                        <p>
                            ${escapeNotifikasyon(
                                notification.mesaj
                            )}
                        </p>

                        <small>
                            ${fòmateDatNotifikasyon(
                                notification.dat_kreyasyon
                            )}
                        </small>

                    </div>

                    <div class="notifikasyon-aksyon">

                        ${
                            notification.url
                            ? `
                                <button
                                    type="button"
                                    onclick="ouvriNotifikasyon(
                                        '${escapeNotifikasyon(notification.id)}'
                                    )"
                                >
                                    Gade
                                </button>
                              `
                            : ""
                        }

                    </div>

                </div>
            `;

        }).join("");

    meteBadgeNotifikasyon();
}

// ------------------------------------------------------------
// BADGE SOU BOUTON NOTIFIKASYON AN
// ------------------------------------------------------------

function meteBadgeNotifikasyon() {

    const badge =
        document.getElementById(
            "notifikasyonBadge"
        );

    if (!badge) {
        return;
    }

    const kantite =
        konteNotifikasyonPaLi();

    if (kantite > 0) {

        badge.textContent =
            kantite > 99
                ? "99+"
                : kantite;

        badge.style.display =
            "flex";

    } else {

        badge.textContent =
            "0";

        badge.style.display =
            "none";
    }
}

// ------------------------------------------------------------
// LOUVRI YON NOTIFIKASYON
// ------------------------------------------------------------

async function ouvriNotifikasyon(id) {

    const notification =
        notifikasyonAdmin.find(
            item => item.id === id
        );

    if (!notification) {
        return;
    }

    if (!notification.li) {

        const { error } =
            await supabaseClient
                .from("notifikasyon")
                .update({
                    li: true,
                    dat_li: new Date().toISOString()
                })
                .eq("id", id);

        if (error) {

            console.error(
                "❌ Erè make notifikasyon kòm li:",
                error
            );

            return;
        }

        notification.li = true;
        notification.dat_li =
            new Date().toISOString();

        aficheNotifikasyon();
    }

    if (notification.url) {

        window.location.href =
            notification.url;
    }
}

// ------------------------------------------------------------
// MAKE TOUT NOTIFIKASYON YO KÒM LI
// ------------------------------------------------------------

async function makeToutNotifikasyonLi() {

    const kiPaLi =
        notifikasyonAdmin
            .filter(item => item.li === false)
            .map(item => item.id);

    if (!kiPaLi.length) {
        return;
    }

    const { error } =
        await supabaseClient
            .from("notifikasyon")
            .update({
                li: true,
                dat_li: new Date().toISOString()
            })
            .in("id", kiPaLi);

    if (error) {

        console.error(
            "❌ Erè make tout notifikasyon kòm li:",
            error
        );

        return;
    }

    notifikasyonAdmin.forEach(item => {

        item.li = true;

        item.dat_li =
            new Date().toISOString();

    });

    aficheNotifikasyon();
}

// ------------------------------------------------------------
// OUVRI / FÈMEN PANÈL NOTIFIKASYON
// ------------------------------------------------------------

function toggleNotifikasyon() {

    const panel =
        document.getElementById(
            "notifikasyonPanel"
        );

    if (!panel) {
        return;
    }

    panel.classList.toggle(
        "aktif"
    );
}

// ------------------------------------------------------------
// DEMARE SISTÈM LAN
// ------------------------------------------------------------

async function demareNotifikasyon() {

    if (
        typeof supabaseClient ===
        "undefined"
    ) {

        console.error(
            "❌ supabaseClient pa disponib."
        );

        return;
    }

    await chajeNotifikasyon();
}

// ------------------------------------------------------------
// DOM READY
// ------------------------------------------------------------

document.addEventListener(
    "DOMContentLoaded",
    () => {

        demareNotifikasyon();

    }
);