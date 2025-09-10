const { createClient } = require('@supabase/supabase-js');

// Remplace par tes valeurs Supabase
const supabaseUrl = "TON_SUPABASE_URL";
const supabaseKey = "TA_ANON_KEY";

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('reports').select('*');
  if (error) {
    console.error("Erreur de connexion Supabase :", error);
  } else {
    console.log("Connexion Supabase OK ✅");
    console.log("Données récupérées :", data);
  }
}

test();
