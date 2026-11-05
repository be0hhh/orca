# Expanded submodule change visibility

Related issue: stablyai/orca#38318. Source base: `39274933719012877bc86d3bcd2d49c743904aef`.

These are presentational component fixtures rendered with the real source-control file-list and submodule expansion owners in headless Chromium on Linux. They do not record an installed Electron session, filesystem watchers or live SSH/WSL. Before is an explicit fixture of the old flat child rows; after uses the revised tree projection on the same two hardcoded inner paths (`src/index.ts` and `tests/index.ts`). Error and retry states preserve those children. The fixture source ships with the feature PR; images remain on this separate evidence branch.

Reproduce from the feature checkout with dependencies prepared:

```sh
pnpm fixtures:shot right-sidebar/source-control/listing/submodule-rows --theme both
```

`observations.json` records the source fixture digest and all eight successful captures; no page errors were emitted. Native Git error behavior and refresh sequencing are covered separately by owning-layer tests, not these screenshots.
