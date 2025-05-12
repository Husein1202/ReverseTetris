
window.detectTSpinType = function(player, arena, linesCleared, rotatedLast) {
  const isTPiece = player.matrix.length === 3 && player.matrix[1][1] === 1;
  if (!isTPiece || !rotatedLast) return null;

  const cx = player.pos.x + 1;
  const cy = player.pos.y + 1;
  let corners = 0;

  if (arena[cy - 1]?.[cx - 1]) corners++;
  if (arena[cy - 1]?.[cx + 1]) corners++;
  if (arena[cy + 1]?.[cx - 1]) corners++;
  if (arena[cy + 1]?.[cx + 1]) corners++;
  console.log("cx", cx, "cy", cy, "corner filled:", corners);

  if (linesCleared === 0 && corners >= 3) return "T-Spin Zero";
  if (linesCleared === 1 && corners < 3) return "T-Spin Mini Single";
  if (linesCleared === 1 && corners >= 3) return "T-Spin Single";
  if (linesCleared === 2 && corners < 3) return "T-Spin Mini Double";
  if (linesCleared === 2 && corners >= 3) return "T-Spin Double";
  if (linesCleared === 3) return "T-Spin Triple";

  return null;
};
