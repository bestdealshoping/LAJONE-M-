// ============================================================
// LAJONÈ'M — KONFIGIRASYON SUPABASE
// ============================================================

const SUPABASE_URL = "https://terjfmeuzvhcntplnbsd.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_9pW8ikbX__ENWKSLguTpXQ_yfHrFJ-X";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);


// ============================================================
// TÈS KONEKSYON
// ============================================================

async function testeSupabase() {

  try {

    const { data, error } = await supabaseClient
      .from("pwogram")
      .select("id, non")
      .limit(1);

    if (error) {
      console.error("❌ Erè Supabase:", error);
      return false;
    }

    console.log("✅ LAJONÈ'M konekte ak Supabase.");
    console.log("Pwogram:", data);

    return true;

  } catch (error) {

    console.error("❌ Erè koneksyon:", error);

    return false;
  }
}