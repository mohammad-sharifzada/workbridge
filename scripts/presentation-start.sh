#!/bin/bash
# Präsentation starten: Server + stabiler Link fürs Handy (Cloudflare Tunnel)
cd "$(dirname "$0")/.."
LINKS_FILE="PRESENTATION-LINKS.txt"

echo "🔨 Build..."
npm run build || exit 1

echo "🚀 Server auf Port 3018..."
pkill -f "cloudflared.*3018" 2>/dev/null || true
lsof -ti :3018 | xargs kill 2>/dev/null || true
sleep 1
npm run start -- -p 3018 -H 0.0.0.0 &
SERVER_PID=$!
sleep 2

echo "🌐 Stabiler öffentlicher Link (Cloudflare)..."
npx --yes cloudflared tunnel --url http://127.0.0.1:3018 > /tmp/workbridge-tunnel.log 2>&1 &
TUNNEL_PID=$!

echo "   Warte auf URL..."
PUBLIC_URL=""
for i in $(seq 1 30); do
  PUBLIC_URL=$(grep -oE "https://[a-z0-9-]+\.trycloudflare\.com" /tmp/workbridge-tunnel.log | head -1)
  if [ -n "$PUBLIC_URL" ]; then break; fi
  sleep 1
done

if [ -z "$PUBLIC_URL" ]; then
  echo "❌ Tunnel-URL nicht gefunden. Log: /tmp/workbridge-tunnel.log"
  exit 1
fi

cat > "$LINKS_FILE" <<EOF
WorkBridge Präsentations-Links
Generiert: $(date)

ÖFFENTLICH (Handy + alle Geräte):
  Fertig (Ahmed):  ${PUBLIC_URL}/de/demo/ready
  Von null:        ${PUBLIC_URL}/de/start

NUR AUF DIESEM MAC:
  Fertig:          http://127.0.0.1:3018/de/demo/ready
  Von null:        http://127.0.0.1:3018/de/start

⚠️  Mac muss an bleiben während der Präsentation!
EOF

echo ""
echo "============================================"
cat "$LINKS_FILE"
echo "============================================"
echo ""
echo "Links gespeichert in: $LINKS_FILE"
echo "Drücke Ctrl+C zum Beenden."

wait $SERVER_PID
