# Cing Block Puzzle feedback V4

- Material progression remains visual-only; its material name and next-threshold captions are removed from the playing UI.
- The persistent weekly-rival guidance row is removed. The existing owner-bound, freshness-checked weekly progression hook still runs, producing only transient overtake celebrations. Their subtitle is simply “BXH tuần”. Existing strict tie/no-repeat rules remain intact.
- Header actions are grouped and aligned on a 36px baseline, reserving 88px on the right for the Zalo host capsule. Brand treatment is compact enough for narrow screens. Native host controls are not altered.
- Confirmed single clear: quick sweep and round chips (440ms). Double: opposing comets and diamond chips (600ms). Triple: prismatic rays and fragments (740ms). Four+: shock rings and radial rays (840ms). Perfect clear overrides with a gold supernova (880ms). Rows and columns use the same spatially aligned choreography; intersections remain deduplicated. Calm/reduced motion keeps a brief static flash, no flying chips or travelling comets. Three concurrent bursts maximum, no gameplay lock.
- Placement is a short elastic body pop plus contact tick, with tiny timbral variation. Each clear tier has its own consonant phrase and impact; combo adds a short two-note answer, avoiding the previous long overlapping melody. Existing music and speech controls remain.

## Verification

- Browser QA at 390px and 360px: header buttons align, last button ends 104px from viewport right, no obsolete label nodes.
- Actual drag/drop using the unchanged engine cleared a row and updated score/combo; a transient weekly overtake celebration appeared. All test account operations use isolated mocks, no production transactions.
- Dedicated presentation laboratory exercised all four clear tiers and calm control, with screenshots of the real renderer. No canvas/audio runtime errors observed. React Router's existing v7 future-flag warnings remain in development.
- Sound preview button exercised in the real settings dialog. Physical iPhone listening/haptics are not inferred from desktop testing.
- Full game suite: 244 tests, 242 pass. Two existing Alltime leaderboard source-string tests on unrelated Royal UI remain failing. Presentation/audio additions pass.
- Production build passes. No engine, scoring, leaderboard authority, payments, reward or backend changes.
- QA entries and laboratory are excluded from production build inputs and commits.
