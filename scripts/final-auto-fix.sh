#!/bin/bash

echo "🚀 START FINAL AUTO FIX..."

# =========================
# 1. FEATURES FIX
# =========================
mkdir -p src/features/game
mkdir -p src/features/menu
mkdir -p src/features/account
mkdir -p src/features/leaderboard

echo "export default function Page(){ return null; }" > src/features/game/index.jsx
echo "export default function Page(){ return null; }" > src/features/menu/index.jsx
echo "export default function Page(){ return null; }" > src/features/account/index.jsx
echo "export default function Page(){ return null; }" > src/features/leaderboard/index.jsx

# =========================
# 2. FIX CORE RUNTIME WARMUP
# =========================
sed -i '' 's@@/pages/menu/MenuPage@@@g' src/core/performance/runtimeWarmupRuntime.js
sed -i '' 's@@/pages/game/GamePage@@@g' src/core/performance/runtimeWarmupRuntime.js

# replace to features
sed -i '' 's@@/pages/menu/MenuPage@@@g' src/core/performance/runtimeWarmupRuntime.js
sed -i '' 's@@/pages/game/GamePage@@@g' src/core/performance/runtimeWarmupRuntime.js

# =========================
# 3. FIX FEATURES IMPORT PAGES
# =========================
find src/features -type f -name "*.js" -o -name "*.jsx" | while read file; do
  sed -i '' 's@./pages/@../features/@g' "$file"
done

# =========================
# 4. ADMIN LEGACY FIX (SAFE PATCH)
# =========================
find src/admin -type f -name "*.js" -o -name "*.jsx" | while read file; do
  sed -i '' 's@../pages/@../features/@g' "$file"
done

# =========================
# 5. CLEAN CACHE
# =========================
rm -rf node_modules/.vite
rm -rf dist

echo "✅ FINAL AUTO FIX DONE"
