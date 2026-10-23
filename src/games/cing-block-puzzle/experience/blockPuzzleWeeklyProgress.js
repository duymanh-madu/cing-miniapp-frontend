export function isWeeklySnapshotFresh(snapshot, now = Date.now()) {
  const generated = Date.parse(snapshot?.generated_at);
  const start = Date.parse(snapshot?.period?.starts_at);
  const end = Date.parse(snapshot?.period?.ends_at);
  return snapshot?.scoring === 'weekly_best' && Array.isArray(snapshot.rivals) &&
    Number.isFinite(generated) && Number.isFinite(start) && Number.isFinite(end) &&
    start <= now && now < end && generated <= now + 5000 &&
    now - generated < Math.min(45000, Number(snapshot.valid_for_ms) || 0);
}
export function weeklyProgressForScore(snapshot, previousScore, score, now = Date.now()) {
  if (!isWeeklySnapshotFresh(snapshot, now) || !Number.isSafeInteger(score) || score < 0) return {next:null,passed:[]};
  const ownBest = Math.max(0,Number(snapshot.self?.best_score)||0);
  const baseline = Math.max(ownBest,previousScore || 0);
  const rivals = [...new Map(snapshot.rivals.filter(row =>
    String(row.user_id) !== String(snapshot.self?.user_id) && Number.isSafeInteger(row.score) && row.score >= 0
  ).map(row=>[String(row.user_id),row])).values()];
  // Ties do not overtake the earlier scorer. Announce only strictly higher scores.
  const passed = rivals.filter(row=>row.score >= baseline && row.score < score);
  const next = rivals.filter(row=>row.score >= Math.max(ownBest,score)).sort((a,b)=>a.score-b.score)[0] || null;
  return {passed,next:next ? {...next,remaining:next.score-Math.max(ownBest,score)+1}:null};
}
