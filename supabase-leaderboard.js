const supabase = window.supabase.createClient(
  'https://qhkeagbfdftesfxhegjv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoa2VhZ2JmZGZ0ZXNmeGhlZ2p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NDM1NTQsImV4cCI6MjA2MzMxOTU1NH0.jEyMk0PQNe3UUOHjsY68TNur-rYP9B8swkdRU9m0Ks8'
);

window.uploadScore = async function (data) {
  const isAnon = window.coolNicknames?.includes(data.nickname);
  if (isAnon) {
    return;
  }

  const modeMap = {
    "40L": "40 LINES",
    "40 LINES": "40 LINES",
    "FRENZY": "FRENZY",
    "MEDITETRIS": "MEDITETRIS"
  };
  data.mode = modeMap[data.mode];

  const allowedModes = ["40 LINES", "FRENZY", "MEDITETRIS"];
  if (!allowedModes.includes(data.mode)) {
    console.warn(`❌ Invalid mode: ${data.mode}`);
    return;
  }

  const dataToSend = {
    nickname: data.nickname,
    mode: data.mode.toUpperCase(),
    timestamp: new Date().toISOString(),
    pieces: data.pieces,
    kpp: data.kpp,
    kps: data.kps,
    pps: data.pps,
    holds: data.holds ?? 0,
    level: data.level ?? 1,
  };

  if (data.score != null) {
    dataToSend.score = data.score;
  }
  if (data.time && data.time_ms != null) {
    dataToSend.time = data.time;
    dataToSend.time_ms = data.time_ms;
  }

  // Cek apakah skor lama lebih tinggi
  const { data: existing, error: fetchError } = await supabase
    .from("leaderboard_v2")
    .select("id, score")
    .eq("nickname", data.nickname)
    .eq("mode", data.mode)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    console.error("❌ Failed to check existing score:", fetchError.message);
    return;
  }

if (existing) {
  if (data.mode === "40 LINES" && data.time_ms != null && existing.time != null) {
    const oldTime = Number(existing.time_ms);
    const newTime = Number(data.time_ms);
    if (newTime >= oldTime) {
      return;
    }
  } else if (data.score != null && existing.score != null && data.score <= existing.score) {
    return;
  }
}

  // Lanjutkan upsert jika lolos
  const { data: upserted, error: upsertError } = await supabase
    .from("leaderboard_v2")
    .upsert([dataToSend], { onConflict: ['nickname', 'mode'] })
    .select();

  if (upsertError) {
    console.error("❌ Upsert error:", upsertError.message);
  } else {
    if (typeof window.loadLeaderboard === "function") {
      window.loadLeaderboard(dataToSend.mode);
    }
  }
};

