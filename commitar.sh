#!/usr/bin/env bash
set -euo pipefail

# Commita como machaadolarissa, SEM Co-authored-by do Cursor.
# Uso:
#   ./commitar.sh "mensagem do commit"

MSG="${1:-}"
if [[ -z "$MSG" ]]; then
  echo "Uso: ./commitar.sh \"mensagem do commit\""
  exit 1
fi

export GIT_AUTHOR_NAME="machaadolarissa"
export GIT_AUTHOR_EMAIL="larissamachaado@hotmail.com"
export GIT_COMMITTER_NAME="machaadolarissa"
export GIT_COMMITTER_EMAIL="larissamachaado@hotmail.com"

git add -A
TREE="$(git write-tree)"

if git rev-parse HEAD >/dev/null 2>&1; then
  PARENT=(-p "$(git rev-parse HEAD)")
else
  PARENT=()
fi

NEW="$(printf '%s\n' "$MSG" | git commit-tree "$TREE" "${PARENT[@]}")"
git reset --hard "$NEW"

echo "Commit: $(git log -1 --oneline)"
git log -1 --format='%an <%ae>%n%B'
