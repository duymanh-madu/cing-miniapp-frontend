// Presentation intensity follows the confirmed number of cleared axes, never score authority.
export function clearPlanForEvent(event) {
  if (event?.type !== 'piece_placed' || !(event.lineCount > 0)) return null;
  if (event.perfectClear) return {kind:'supernova',tier:4,duration:880,particles:4,accent:'#ffe8a1'};
  const tier=Math.min(4,Math.floor(event.lineCount));
  return [null,
    {kind:'slice',tier:1,duration:440,particles:2,accent:'#9eefff'},
    {kind:'duet',tier:2,duration:600,particles:3,accent:'#cbb5ff'},
    {kind:'prism',tier:3,duration:740,particles:4,accent:'#ffce75'},
    {kind:'nova',tier:4,duration:840,particles:4,accent:'#ffacd9'},
  ][tier];
}
