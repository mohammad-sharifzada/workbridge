#!/bin/bash
# Startet Server + Tunnel UNABHÄNGIG von Cursor (überlebt App-Schließen)
WORKDIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR="/tmp/workbridge-presentation"
LINKS_FILE="$WORKDIR/PRESENTATION-LINKS.txt"
mkdir -p "$LOG_DIR"
cd "$WORKDIR"

# Alles stoppen
pkill -f "cloudflared tunnel --url http://127.0.0.1:3018" 2>/dev/null || true
lsof -ti :3018 | xargs kill 2>/dev/null || true
sleep 2

# Server starten
nohup ./node_modules/.bin/next start -p 3018 -H 0.0.0.0 >> "$LOG_DIR/server.log" 2>&1 &
disown 2>/dev/null || true
sleep 4

if ! lsof -ti :3018 >/dev/null 2>&1; then
  echo "FEHLER: Server startet nicht. Log: $LOG_DIR/server.log"
  exit 1
fi
lsof -ti :3018 > "$LOG_DIR/server.pid"

# Tunnel starten (frisches Log)
: > "$LOG_DIR/tunnel.log"
nohup npx cloudflared tunnel --url http://127.0.0.1:3018 >> "$LOG_DIR/tunnel.log" 2>&1 &
disown 2>/dev/null || true

# Mac 4 Stunden wach halten
nohup caffeinate -dims -t 14400 >> "$LOG_DIR/caffeinate.log" 2>&1 &
disown 2>/dev/null || true

PUBLIC_URL=""
for i in $(seq 1 45); do
  PUBLIC_URL=$(grep -oE "https://[a-z0-9-]+\.trycloudflare\.com" "$LOG_DIR/tunnel.log" 2>/dev/null | tail -1)
  if [ -n "$PUBLIC_URL" ]; then
    sleep 3
    break
  fi
  sleep 1
done

if [ -z "$PUBLIC_URL" ]; then
  echo "FEHLER: Tunnel-URL nicht gefunden. Log: $LOG_DIR/tunnel.log"
  exit 1
fi

pgrep -f "cloudflared tunnel --url http://127.0.0.1:3018" | head -1 > "$LOG_DIR/tunnel.pid" 2>/dev/null || true

cat > "$LINKS_FILE" <<EOF
WorkBridge Präsentations-Links
Generiert: $(date '+%d.%m.%Y %H:%M')

ÖFFENTLICH (Handy + alle Geräte):
  Fertig (Ahmed):  ${PUBLIC_URL}/de/demo/ready
  Von null:        ${PUBLIC_URL}/de/start

NUR AUF DIESEM MAC:
  Fertig:          http://127.0.0.1:3018/de/demo/ready
  Von null:        http://127.0.0.1:3018/de/start

Status: Läuft im Hintergrund – auch wenn Cursor geschlossen ist.
Mac muss AN bleiben (caffeinate ~4 Stunden).
Neu starten: bash scripts/presentation-keepalive.sh
Logs: $LOG_DIR/
EOF

echo "OK"
echo "Fertig:  ${PUBLIC_URL}/de/demo/ready"
echo "Start:   ${PUBLIC_URL}/de/start"
