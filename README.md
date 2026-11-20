# NodSeg Atlas

Interactive results of the study "How Reliable Are Open-Access Lung Nodule Segmentation Models? Agreement with Radiologists, Repeatability, and Classification at CT" (Tushar Lab, Department of Radiology and Imaging Sciences, University of Arizona).

Live site: https://tusharlabratory.github.io/nodseg-atlas.github.io/ · Companion site: [LungFM Atlas](https://tusharlabratory.github.io/lungfm-atlas.github.io/)

## Pages
- **Home**: summary, six visual key findings (each with the article's own sentence), example segmentations (Figure 4 and Figures S5–S11)
- **Explorer**: method × dataset heat map (nodules segmented, Dice, volume ratio, HD95, radiomic Δ, AUC, AUC difference, specificity), by dataset or by nodule size, with training-data markers
- **Network**: force or column graph of methods, datasets and analyses; training-data links and performance links; details panel
- **Build a comparison**: choose a measure, datasets and methods; best performers, per-dataset table, downloadable forest plot, heat map or ranking (PNG 300 dpi, SVG, CSV), shareable link
- **Methods** and **Datasets**: one page per configuration and per dataset
- **Radiomic features**: all 107 features per method vs inter-reader agreement, and Δ by feature family
- **Repeatability**: Δ ICC, volume repeatability coefficient, test–retest Dice, per-feature ICC
- **Classification**: AUC by mask source with reference masks, diameter, mask volume and Lung-RADS
- **About**: abstract, limitations, data availability, downloads

All numbers are aggregated study results (95% confidence intervals); the only images are the article's figures.

## Data
`NodSegRad/code/analysis/site_export.py` (run with `code/analysis/run.sh python site_export.py`) reads the final manuscript and the analysis tables and writes `output_NodSegRad/analysis/site_data/`. Values are stored with 6 decimals and rounded once on the site. Every value that also appears in a manuscript table is checked against that cell (295 checks); the export stops on any difference. Then:

```
tools/sync_data.sh                      # copy site_data into public/data and src/data
docker run --rm -v $PWD:/app -w /app node:20-slim npm run build
git push                                # GitHub Actions builds and deploys to Pages
```

Built with Astro 4.16, d3-force, University of Arizona brand colors; branding as on the Tushar Lab website.

© 2026 The Arizona Board of Regents on behalf of The University of Arizona.
