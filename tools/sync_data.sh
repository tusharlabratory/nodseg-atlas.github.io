#!/usr/bin/env bash
# Copy the exported study data (NodSegRad/code/analysis/site_export.py) into the site.
set -euo pipefail
SRC=/mnt/data/tusharlab/dataset_dir/output_NodSegRad/analysis/site_data
HERE="$(cd "$(dirname "$0")/.." && pwd)"
rm -rf "$HERE/public/data" && mkdir -p "$HERE/public/data"
cp -r "$SRC"/. "$HERE/public/data/"
mkdir -p "$HERE/src/data"
for f in meta datasets methods segmentation radiomics repeatability classification figures table1_rows; do cp "$SRC/$f.json" "$HERE/src/data/$f.json"; done
echo "synced $(find "$HERE/public/data" -type f | wc -l) files"
