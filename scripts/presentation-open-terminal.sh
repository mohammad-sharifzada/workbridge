#!/bin/bash
# Öffnet ein ECHTES Terminal-Fenster – überlebt Cursor-Schließen
DIR="$(cd "$(dirname "$0")/.." && pwd)"
osascript <<APPLESCRIPT
tell application "Terminal"
  activate
  do script "cd '$DIR' && bash scripts/presentation-keepalive.sh && echo '' && echo '✅ LÄUFT – Dieses Terminal-Fenster OFFEN lassen!' && echo 'Links in: PRESENTATION-LINKS.txt' && cat PRESENTATION-LINKS.txt && echo '' && echo 'Warte... (Strg+C zum Beenden)' && tail -f /tmp/workbridge-presentation/server.log"
end tell
APPLESCRIPT
