// supabaseClient.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = 'https://qhkeagbfdftesfxhegjv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoa2VhZ2JmZGZ0ZXNmeGhlZ2p2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzc0MzU1NCwiZXhwIjoyMDYzMzE5NTU0fQ.vIKZ0oRsUuYGO3ZNRF_QnXa4CMIdGMh6C8ruLoG_a28';
const supabase = createClient(supabaseUrl, supabaseKey);

window.supabase = supabase;
