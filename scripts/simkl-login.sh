#!/usr/bin/env bash
# One-time Simkl PIN login: turn a client_id into a per-user access_token WITHOUT a
# browser redirect. WHY the PIN flow: this tool runs locally on your own network and
# just needs a token configured once (no OAuth screen, no redirect URI).
#
# Flow (Simkl device/PIN auth):
#   1. GET  {base}/oauth/pin?client_id=...  -> a 5-char user_code + a verification URL
#   2. You open the URL, type the code, authorize.
#   3. Poll GET {base}/oauth/pin/{user_code}?client_id=...  until it returns access_token.
#
# Usage:  SIMKL_CLIENT_ID=xxxx ./scripts/simkl-login.sh
# The response field names are logged raw on anything unexpected, so a docs drift is
# visible rather than silent. Confirm shapes against https://api.simkl.org/authentication.
set -euo pipefail

BASE="${SIMKL_API_BASE:-https://api.simkl.com}"
CLIENT_ID="${SIMKL_CLIENT_ID:-}"

if [[ -z "$CLIENT_ID" ]]; then
	echo "ERROR: set SIMKL_CLIENT_ID (from your Simkl app) first." >&2
	echo "  SIMKL_CLIENT_ID=xxxx $0" >&2
	exit 1
fi
command -v jq >/dev/null 2>&1 || { echo "ERROR: jq is required." >&2; exit 1; }

echo "==> requesting a PIN from $BASE"
pin_json="$(curl -fsS "$BASE/oauth/pin?client_id=$CLIENT_ID" -H 'User-Agent: simkl-seeder/0.1')"

user_code="$(jq -r '.user_code // empty' <<<"$pin_json")"
verify_url="$(jq -r '.verification_url // .verify_url // empty' <<<"$pin_json")"
interval="$(jq -r '.interval // 5' <<<"$pin_json")"
expires="$(jq -r '.expires_in // 900' <<<"$pin_json")"

if [[ -z "$user_code" ]]; then
	echo "Unexpected /oauth/pin response — raw below:" >&2
	echo "$pin_json" | jq . >&2 || echo "$pin_json" >&2
	exit 1
fi

echo ""
echo "  ┌───────────────────────────────────────────────┐"
printf "  │  Open: %-39s │\n" "${verify_url:-https://simkl.com/pin}"
printf "  │  Enter code: %-33s │\n" "$user_code"
echo "  └───────────────────────────────────────────────┘"
echo ""
echo "==> waiting for you to authorize (polling every ${interval}s, expires in ${expires}s)…"

deadline=$(( $(date +%s) + expires ))
while (( $(date +%s) < deadline )); do
	sleep "$interval"
	poll_json="$(curl -fsS "$BASE/oauth/pin/$user_code?client_id=$CLIENT_ID" -H 'User-Agent: simkl-seeder/0.1' || true)"
	token="$(jq -r '.access_token // empty' <<<"$poll_json" 2>/dev/null || true)"
	if [[ -n "$token" ]]; then
		echo ""
		echo "OK: authorized. Add this to your .env:"
		echo ""
		echo "  SIMKL_ACCESS_TOKEN=$token"
		echo ""
		exit 0
	fi
	printf '.'
done

echo ""
echo "ERROR: timed out before authorization. Re-run to try again." >&2
exit 1
