#!/data/data/com.termux/files/usr/bin/bash
set -eu

# Keep the Messenger session on this device only. This script never stages,
# uploads, prints, or embeds its contents in Git.
SESSION_SOURCE="${1:-$HOME/storage/downloads/ShadowState.json}"
SESSION_TARGET="ShadowSetUp/ShadowState.json"

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "Node.js غير مثبت. نفّذ: pkg install nodejs git -y"
  exit 1
fi

if [ ! -f "$SESSION_SOURCE" ]; then
  echo "لم يُعثر على ملف الجلسة في: $SESSION_SOURCE"
  echo "ضع ShadowState.json في مجلد Download أو مرر مساره كوسيط أول."
  exit 1
fi

mkdir -p ShadowSetUp
cp "$SESSION_SOURCE" "$SESSION_TARGET"
chmod 600 "$SESSION_TARGET"

if [ ! -d node_modules ]; then
  npm install --omit=dev
fi

if command -v termux-wake-lock >/dev/null 2>&1; then
  termux-wake-lock
fi

export SHADOW_RUNTIME_PROFILE=core
exec npm start
