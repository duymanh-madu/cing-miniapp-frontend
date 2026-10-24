# Cing Block Puzzle sensory presentation V3 — 2026-10-25

## Experience

A board-local canvas restores the cleared cells' visual colours for a brief impact, then renders a luminous beam along each cleared row/column and coloured fragments. Cross intersections are deduplicated. Perfect clear adds an expanding gold ring and a musical resolution. Up to three bursts may overlap; the next placement never waits for an animation. The canvas is pointer-transparent, caps pixel density at 2, draws only while bursts exist, and stops when hidden or unmounted. Calm/system reduced-motion uses a brief static flash without flying fragments.

Original Cing spark character and vector settings, revive and trophy artwork replace system emoji in the game. A 160ms landing pulse affects newly placed cells only. Material progression is cosmetic: candy at 0, crystal at 600, aurora at 1,800, solar at 4,000. No engine, random generation, replay, score, leaderboard or purchase authority changed.

Four short Vietnamese encouragement clips are bundled and decoded once using the existing unlocked AudioContext. They do not use browser speech synthesis. Priority and a 2.2s cooldown prevent a speech queue; mute, zero volume, visibility loss and exit stop speech. Asset generation: local macOS Linh speech synthesis, 210wpm, converted to mono 24kHz 16-bit PCM WAV. These are synthetic Vietnamese voices, not a hired human recording or competitor audio. Clip checks verify real PCM duration and signal energy.

Clear sound adds a rising glass sweep, small fragmentation ticks, and a perfect-clear chord to the existing score/combo motifs. Settings use the blue game palette and expose sound/haptic preview controls.

Haptics load the official installed zmp-sdk vibrate API ahead of moves in Zalo, with browser vibration fallback. No native promise is awaited on the gameplay path. Zalo requires the API permission for the Mini App; iOS determines native duration, while Android accepts milliseconds. Safari alone may have no vibration support. Software cannot override these host limits.

## Reference and boundaries

Official competitor sources reviewed:
- https://www.blockblast.com/ — accessibility, satisfying clear moments and varied experiences.
- https://apps.apple.com/us/app/block-blast/id1617391485 — dynamic block crush, music, colourful themes and combos.

No Block Blast artwork, sound assets, code or scoring rules were copied. The four material thresholds are Cing's own cosmetic design, not a claim about Block Blast's internal algorithm.

## Validation

- Production bundle build passes.
- 28 focused presentation/audio/preferences/source-contract checks pass.
- Full game suite: 242 tests, 240 pass. Two existing Alltime leaderboard source-string tests fail on the unchanged Royal UI, as before this change.
- WAV assets are 0.51–0.62s each, with nonzero audible PCM signal.
- No engine, commerce, reward, backend or financial files changed.
- Local QA entry is intentionally excluded from deployment and all financial calls use mocks.
- Direct visual browser testing is pending because the desktop/browser connection reports the Mac is locked. No screenshot, on-device FPS measurement, listening assessment or physical iPhone haptic verification is claimed.

## Deployment

Frontend-only release. Public marker: /cing-block-puzzle-release.json, release cing-block-puzzle-v3-sensory-20261025. Production backend remains unchanged.
