// supabaseClient.js
const supabaseUrl = 'https://qhkeagbfdftesfxhegjv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoa2VhZ2JmZGZ0ZXNmeGhlZ2p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NDM1NTQsImV4cCI6MjA2MzMxOTU1NH0.jEyMk0PQNe3UUOHjsY68TNur-rYP9B8swkdRU9m0Ks8';
const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);  // ✅ pakai window.supabase
window.supabase = _supabase;  // jadikan global
