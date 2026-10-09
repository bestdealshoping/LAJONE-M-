// ============================================================
// LAJONÈ'M — NOTIFIKASYON AN TAN REYÈL
// ============================================================

let notifikasyonAdmin = [];
let notifikasyonPare = false;
let adminNotifikasyon = null;
let chanNotifikasyon = null;
let notifikasyonAnChajman = false;

const NOTIF_STYLE_ID = "lajonem-notifikasyon-style";

// ------------------------------------------------------------
// STYLE: BADGE AK PWEN WOUJ
// ------------------------------------------------------------

function meteStyleNotifikasyon() {
    if (document.getElementById(NOTIF_STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = NOTIF_STYLE_ID;
    style.textContent = `
        .notification-button,
        #notificationButton,
        #notifikasyonButton {
            position: relative !important;
        }

        .lajonem-bell-dot {
            position: absolute;
            top: 3px;
            right: 3px;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #e32636;
            border: 2px solid #fff;
            display: none;
            z-index: 10;
            box-shadow: 0 0 0 1px rgba(227,38,54,.15);
        }

        .lajonem-bell-dot.aktif {
            display: block;
        }

        .notifikasyon-item.notifikasyon-pa-li {
            background: #eef5ff !important;
            border-left: 3px solid #e32636;
        }

        .notifikasyon-pwen {
            display: inline-block;
            width: 8px;
            height: 8px;
            min-width: 8px;
            border-radius: 50%;
            background: #e32636;
        }

        .lajonem-notif-toast {
            position: fixed;
            right: 16px;
            bottom: 18px;
            z-index: 99999;
            width: min(360px, calc(100vw - 32px));
            background: #fff;
            color: #183b67;
            border-left: 4px solid #e32636;
            border-radius: 10px;
            padding: 14px 16px;
            box-shadow: 0 8px 30px rgba(0,0,0,.18);
            font: 14px/1.5 Arial, sans-serif;
        }

        .lajonem-notif-toast strong {
            display: block;
            margin-bottom: 4px;
        }
    `;
    document.head.appendChild(style);
}

// ------------------------------------------------------------
// ID ADMIN KI KONEKTE A
// ------------------------------------------------------------

async function jwennAdminKonekte() {
    try {
        const { data: { user }, error: authError } =
            await supabaseClient.auth.getUser();

        if (authError || !user) return null;

        const { data, error } = await supabaseClient
            .from("itilizatè_admin")
            .select("id,user_id,non,siyati,email,wòl,aktif")
            .eq("user_id", user.id)
            .eq("aktif", true)
            .maybeSingle();

        if (error) {
            console.error("Erè pwofil administratè:", error);
            return null;
        }

        return data || null;
    } catch (error) {
        console.error("Erè jwenn administratè:", error);
        return null;
    }
}

// ------------------------------------------------------------
// CHARGE NOTIFIKASYON YO
// ------------------------------------------------------------

async function chajeNotifikasyon() {
    if (!adminNotifikasyon || notifikasyonAnChajman) return;

    notifikasyonAnChajman = true;

    try {
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
            .eq("itilizatè_id", adminNotifikasyon.id)
            .order("dat_kreyasyon", { ascending: false })
            .limit(50);

        if (error) {
            console.error("Erè chaje notifikasyon:", error);
            return;
        }

        notifikasyonAdmin = data || [];
        notifikasyonPare = true;
        aficheNotifikasyon();
    } catch (error) {
        console.error("Erè sistèm notifikasyon:", error);
    } finally {
        notifikasyonAnChajman = false;
    }
}

// ------------------------------------------------------------
// KANTITE NOTIFIKASYON KI PA LI
// ------------------------------------------------------------

function konteNotifikasyonPaLi() {
    return notifikasyonAdmin.filter(item => item.li === false).length;
}

// ------------------------------------------------------------
// IKÒN NOTIFIKASYON
// ------------------------------------------------------------

function jwennIkonNotifikasyon(tip) {
    const ikon = {
        volonte: "👤",
        mesaj: "✉️",
        don: "💰",
        aktivite: "📅",
        vizit: "🏠",
        galri: "🖼️",
        sistèm: "⚙️",
        info: "🔔"
    };

    return ikon[tip] || "🔔";
}

function jwennKlasNotifikasyon(tip) {
    const klas = {
        volonte: "notif-volonte",
        mesaj: "notif-mesaj",
        don: "notif-don",
        aktivite: "notif-aktivite",
        vizit: "notif-vizit",
        galri: "notif-galri",
        sistèm: "notif-systeme",
        info: "notif-info"
    };

    return klas[tip] || "notif-info";
}

// ------------------------------------------------------------
// PWOTEJE TÈKS HTML
// ------------------------------------------------------------

function escapeNotifikasyon(value) {
    if (value === null || value === undefined) return "";

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
    if (!date) return "";

    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "";

    return d.toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

// ------------------------------------------------------------
// KLOCH AK BADGE
// ------------------------------------------------------------

function jwennBoutonKlòch() {
    return document.getElementById("notificationButton")
        || document.getElementById("notifikasyonButton")
        || document.querySelector(".notification-button");
}

function meteBadgeNotifikasyon() {
    const badge = document.getElementById("notifikasyonBadge");
    const bouton = jwennBoutonKlòch();

    const kantite = konteNotifikasyonPaLi();

    if (badge) {
        badge.textContent = kantite > 99 ? "99+" : String(kantite);
        badge.style.display = kantite > 0 ? "flex" : "none";
    }

    if (bouton) {
        let pwen = bouton.querySelector(".lajonem-bell-dot");

        if (!pwen) {
            pwen = document.createElement("span");
            pwen.className = "lajonem-bell-dot";
            pwen.setAttribute("aria-label", "Gen notifikasyon ki poko li");
            bouton.appendChild(pwen);
        }

        pwen.classList.toggle("aktif", kantite > 0);
    }
}

// ------------------------------------------------------------
// AFICHE NOTIFIKASYON YO
// ------------------------------------------------------------

function aficheNotifikasyon() {
    const container = document.getElementById("notifikasyonContainer");

    meteBadgeNotifikasyon();

    if (!container) return;

    if (!notifikasyonAdmin.length) {
        container.innerHTML = `
            <div class="notifikasyon-vide">
                <div class="notifikasyon-vide-ikon">🔔</div>
                <h3>Pa gen notifikasyon</h3>
                <p>Nouvo mesaj ak mizajou yo ap parèt isit la.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = notifikasyonAdmin.map(notification => {
        const paLi = notification.li === false;
        const id = escapeNotifikasyon(notification.id);
        const url = notification.url || "";

        return `
            <div class="notifikasyon-item ${
                escapeNotifikasyon(jwennKlasNotifikasyon(notification.tip))
            } ${paLi ? "notifikasyon-pa-li" : ""}">
                <div class="notifikasyon-ikon">
                    ${jwennIkonNotifikasyon(notification.tip)}
                </div>

                <div class="notifikasyon-kontni">
                    <div class="notifikasyon-tet">
                        <strong>${escapeNotifikasyon(notification.tit)}</strong>
                        ${paLi ? '<span class="notifikasyon-pwen"></span>' : ""}
                    </div>

                    <p>${escapeNotifikasyon(notification.mesaj)}</p>

                    <small>
                        ${fòmateDatNotifikasyon(notification.dat_kreyasyon)}
                    </small>

                    <div class="notifikasyon-aksyon">
                        <button type="button"
                            data-notif-id="${id}"
                            data-notif-url="${escapeNotifikasyon(url)}">
                            ${url ? "Gade" : "Make kòm li"}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join("");

    container.querySelectorAll("button[data-notif-id]").forEach(button => {
        button.addEventListener("click", async () => {
            await ouvriNotifikasyon(
                button.dataset.notifId,
                button.dataset.notifUrl
            );
        });
    });
}

// ------------------------------------------------------------
// MAKE NOTIFIKASYON KÒM LI
// ------------------------------------------------------------

async function ouvriNotifikasyon(id, url) {
    const notification = notifikasyonAdmin.find(item => item.id === id);
    if (!notification) return;

    if (notification.li === false) {
        const { error } = await supabaseClient
            .from("notifikasyon")
            .update({
                li: true,
                dat_li: new Date().toISOString()
            })
            .eq("id", id)
            .eq("itilizatè_id", adminNotifikasyon.id);

        if (error) {
            console.error("Erè make notifikasyon kòm li:", error);
            return;
        }

        notification.li = true;
        notification.dat_li = new Date().toISOString();
        aficheNotifikasyon();
    }

    if (url) {
        window.location.href = url;
    }
}

async function makeToutNotifikasyonLi() {
    if (!adminNotifikasyon) return;

    const kiPaLi = notifikasyonAdmin
        .filter(item => item.li === false)
        .map(item => item.id);

    if (!kiPaLi.length) return;

    const { error } = await supabaseClient
        .from("notifikasyon")
        .update({
            li: true,
            dat_li: new Date().toISOString()
        })
        .in("id", kiPaLi)
        .eq("itilizatè_id", adminNotifikasyon.id);

    if (error) {
        console.error("Erè make tout notifikasyon kòm li:", error);
        return;
    }

    notifikasyonAdmin.forEach(item => {
        item.li = true;
        item.dat_li = new Date().toISOString();
    });

    aficheNotifikasyon();
}

// ------------------------------------------------------------
// PANÈL NOTIFIKASYON
// ------------------------------------------------------------

function toggleNotifikasyon() {
    const panel = document.getElementById("notifikasyonPanel");
    if (!panel) return;

    panel.classList.toggle("aktif");

    if (panel.classList.contains("aktif")) {
        chajeNotifikasyon();
    }
}

// ------------------------------------------------------------
// TI MESAJ LÈ YON NOUVO NOTIFIKASYON RIVE
// ------------------------------------------------------------

function montreToastNotifikasyon(notification) {
    const toast = document.createElement("div");
    toast.className = "lajonem-notif-toast";

    const tit = document.createElement("strong");
    tit.textContent = notification.tit || "Nouvo notifikasyon";

    const mesaj = document.createElement("div");
    mesaj.textContent = notification.mesaj || "Gen yon nouvo mizajou.";

    toast.appendChild(tit);
    toast.appendChild(mesaj);
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 6000);
}

// ------------------------------------------------------------
// KONEKSYON AN TAN REYÈL
// ------------------------------------------------------------

function konekteNotifikasyonAnTanReyel() {
    if (!adminNotifikasyon || !window.supabaseClient) return;

    if (chanNotifikasyon) {
        supabaseClient.removeChannel(chanNotifikasyon);
        chanNotifikasyon = null;
    }

    chanNotifikasyon = supabaseClient
        .channel("lajonem-notifikasyon-" + adminNotifikasyon.id)
        .on(
            "postgres_changes",
            {
                event: "INSERT",
                schema: "public",
                table: "notifikasyon",
                filter: "itilizatè_id=eq." + adminNotifikasyon.id
            },
            payload => {
                const nouvo = payload.new;
                if (!nouvo) return;

                const dejaEgziste = notifikasyonAdmin.some(
                    item => item.id === nouvo.id
                );

                if (!dejaEgziste) {
                    notifikasyonAdmin.unshift(nouvo);
                    notifikasyonAdmin = notifikasyonAdmin.slice(0, 50);
                    aficheNotifikasyon();
                    montreToastNotifikasyon(nouvo);
                }
            }
        )
        .subscribe(status => {
            console.log("Estati notifikasyon LAJONÈ'M:", status);
        });
}

// ------------------------------------------------------------
// DEMARE SISTÈM LAN
// ------------------------------------------------------------

async function demareNotifikasyon() {
    if (typeof supabaseClient === "undefined") {
        console.error("supabaseClient pa disponib.");
        return;
    }

    meteStyleNotifikasyon();
    adminNotifikasyon = await jwennAdminKonekte();

    if (!adminNotifikasyon) {
        console.warn("Pa gen administratè aktif ki konekte.");
        return;
    }

    await chajeNotifikasyon();
    konekteNotifikasyonAnTanReyel();

    // Sekou si koneksyon an tan reyèl la dekonekte tanporèman.
    window.setInterval(() => {
        if (document.visibilityState === "visible") {
            chajeNotifikasyon();
        }
    }, 60000);
}

// ------------------------------------------------------------
// DEMARE LÈ PAJ LA FIN CHARGE
// ------------------------------------------------------------

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", demareNotifikasyon);
} else {
    demareNotifikasyon();
}

// Fonksyon sa yo disponib pou bouton ki sèvi ak onclick.
window.toggleNotifikasyon = toggleNotifikasyon;
window.makeToutNotifikasyonLi = makeToutNotifikasyonLi;
window.ouvriNotifikasyon = ouvriNotifikasyon;