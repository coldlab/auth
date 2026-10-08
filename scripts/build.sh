#!/usr/bin/env bash
# Builds the auth image in Cloud Build, tagged with the current commit SHA.
# Usage (from anywhere):  ./scripts/build.sh
set -euo pipefail

cd "$(dirname "$0")/.."

# The tag must describe what's actually in the image, so refuse to build
# with uncommitted changes in anything that goes into it.
dirty=$(git status --porcelain -- Dockerfile .dockerignore package.json package-lock.json tsconfig.json src keys/public.pem)
if [[ -n "$dirty" ]]; then
    echo "Uncommitted changes in build inputs - commit them first:" >&2
    echo "$dirty" >&2
    exit 1
fi

tag=$(git rev-parse --short HEAD)
echo "Building auth:$tag"

gcloud builds submit \
    --project=coldlab-central \
    --region=europe-west3 \
    --config=cloudbuild.yaml \
    --substitutions="_TAG=$tag" \
    .
