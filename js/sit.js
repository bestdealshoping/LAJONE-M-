// ============================================================
// LAJONÈ'M — SIT
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

  const annee = document.getElementById("annee");

  if (annee) {
    annee.textContent = new Date().getFullYear();
  }

  chajePwogram();

});


async function chajePwogram() {

  const container = document.getElementById("pwogram-container");

  if (!container) return;

  try {

    const { data, error } = await supabaseClient
      .from("pwogram")
      .select(`
        id,
        non,
        slug,
        deskripsyon,
        objektif,
        imaj_url
      `)
      .eq("aktif", true)
      .order("dat_kreyasyon", {
        ascending: true
      });


    if (error) {
      throw error;
    }


    if (!data || data.length === 0) {

      container.innerHTML = `
        <div class="empty-state">

          <h3>
            Pwogram yo ap vini.
          </h3>

          <p>
            Nou ap prepare pwogram LAJONÈ'M yo.
            Retounen byento pou dekouvri yo.
          </p>

        </div>
      `;

      return;
    }


    container.innerHTML = data.map(program => {

      return `

        <article class="program-card">

          ${
            program.imaj_url
              ? `
                <img
                  src="${program.imaj_url}"
                  alt="${escapeHTML(program.non)}"
                >
              `
              : ""
          }

          <div class="program-card-content">

            <h3>
              ${escapeHTML(program.non)}
            </h3>

            <p>
              ${escapeHTML(
                program.deskripsyon ||
                "Dekouvri pwogram sa a."
              )}
            </p>

            <a
              href="pwogram.html?slug=${encodeURIComponent(program.slug)}"
              class="card-link"
            >
              Gade pwogram nan →
            </a>

          </div>

        </article>

      `;

    }).join("");


  } catch (error) {

    console.error(
      "Erè pandan chajman pwogram yo:",
      error
    );

    container.innerHTML = `

      <div class="error-state">

        <h3>
          Nou pa kapab chaje pwogram yo.
        </h3>

        <p>
          Tanpri eseye ankò pita.
        </p>

      </div>

    `;

  }

}


// ============================================================
// SEKIRITE — EVITE HTML ENJECTED
// ============================================================

function escapeHTML(value) {

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