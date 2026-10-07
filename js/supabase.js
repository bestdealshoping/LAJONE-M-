const SUPABASE_URL =
    "https://terjfmeuzvhcntplnbsd.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_9pW8ikbX__ENWKSLguTpXQ_yfHrFJ-X";


/* =====================================================
   VERIFYE SI BIBLIYOTÈK SUPABASE LA CHAJE
===================================================== */

if (!window.supabase) {

    console.error(
        "❌ Bibliyotèk Supabase la pa chaje."
    );

    throw new Error(
        "Bibliyotèk Supabase la pa disponib. Verifye script CDN Supabase la."
    );
}


/* =====================================================
   KREYE CLIENT SUPABASE
===================================================== */

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


/* =====================================================
   TEST KONEKSYON
===================================================== */

async function testeSupabase() {

    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("pwogram")
            .select("id, non")
            .limit(1);


        if (error) {

            console.error(
                "❌ Erè Supabase:",
                error
            );

            return false;
        }


        console.log(
            "✅ LAJONÈ'M konekte ak Supabase."
        );

        console.log(
            "Pwogram:",
            data
        );


        return true;

    } catch (error) {

        console.error(
            "❌ Erè koneksyon:",
            error
        );

        return false;
    }
}