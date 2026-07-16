#!/usr/bin/env bash
# End-to-end smoke test of the Simkl API with your .env creds. Its job is to resolve the
# gaps the docs leave open — the base host, whether the API key goes in a header or a query
# param, and the write JSON shape — by hitting the live API and printing status + raw body.
#
#   ./scripts/simkl-smoke.sh            READ-only: search + (if token) read your plantowatch
#   ./scripts/simkl-smoke.sh --write    ALSO writes: adds one title to your Simkl
#                                        plantowatch list — this touches your REAL account.
set -euo pipefail
cd "$(dirname "$0")/.."

# Same .env loader as simkl-login.sh (inline env still overrides).
if [[ -f .env ]]; then
	while IFS='=' read -r key val; do
		[[ $key == SIMKL_* && -z "${!key:-}" ]] && export "$key=$val"
	done < <(grep -E '^[[:space:]]*SIMKL_[A-Z_]+=' .env | sed 's/^[[:space:]]*//; s/[[:space:]]*=[[:space:]]*/=/')
fi

BASE="${SIMKL_API_BASE:-https://api.simkl.com}"
CID="${SIMKL_CLIENT_ID:-}"
TOKEN="${SIMKL_ACCESS_TOKEN:-}"
DO_WRITE=0
[[ "${1:-}" == "--write" ]] && DO_WRITE=1

[[ -n "$CID" ]] || { echo "ERROR: SIMKL_CLIENT_ID missing in .env" >&2; exit 1; }
command -v jq >/dev/null 2>&1 || { echo "ERROR: jq required" >&2; exit 1; }

COMMON=(-H "simkl-api-key: $CID" -H "Content-Type: application/json" -H "User-Agent: simkl-seeder/0.1")
AUTH=(-H "Authorization: Bearer $TOKEN")

# req METHOD URL [curl-args...] -> prints "HTTP <code>" then pretty body; sets $BODY.
req() {
	local method="$1" url="$2"; shift 2
	local raw code
	raw="$(curl -sS -X "$method" -w $'\n__HTTP__%{http_code}' "$url" "$@")"
	code="${raw##*__HTTP__}"
	BODY="${raw%$'\n'__HTTP__*}"
	echo "  HTTP $code  ($method $url)"
	echo "$BODY" | jq . 2>/dev/null | head -40 || { echo "  (non-JSON) ${BODY:0:400}"; }
}

echo "== 1) READ: search movies 'matrix' =="
req GET "$BASE/search/movie?q=matrix&limit=3" "${COMMON[@]}"

SIMKL_ID="$(echo "$BODY" | jq -r '.[0].ids.simkl // .[0].ids.simkl_id // .[0].simkl_id // empty' 2>/dev/null || true)"
TITLE="$(echo "$BODY" | jq -r '.[0].title // empty' 2>/dev/null || true)"
echo "  -> picked: ${TITLE:-<none>}  (simkl id: ${SIMKL_ID:-<none>})"

if [[ $DO_WRITE -eq 0 ]]; then
	echo "== read-only mode; pass --write to test the write path =="
	exit 0
fi

[[ -n "$TOKEN" ]] || { echo "ERROR: SIMKL_ACCESS_TOKEN missing (needed for write)" >&2; exit 1; }
[[ -n "$SIMKL_ID" ]] || { echo "ERROR: no simkl id from search; cannot build write payload" >&2; exit 1; }

echo "== 2) WRITE: add '$TITLE' to plantowatch (watch-later) =="
PAYLOAD="$(jq -n --argjson id "$SIMKL_ID" '{movies:[{to:"plantowatch", ids:{simkl:$id}}]}')"
echo "  payload: $PAYLOAD"
req POST "$BASE/sync/add-to-list" "${COMMON[@]}" "${AUTH[@]}" -d "$PAYLOAD"

echo "== 3) VERIFY: read your plantowatch movies =="
req GET "$BASE/sync/all-items/movies/plantowatch" "${COMMON[@]}" "${AUTH[@]}"
