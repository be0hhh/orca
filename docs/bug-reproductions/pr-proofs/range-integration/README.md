# Binary host/consumer integration evidence

The selected integration harness passed **5/5 tests**, exit **0**, against the combined host revision in `provenance.json`. The consumer source is bound by the per-file SHA-256 digests there. No release or installed application was changed.

The harness uses the actual normalized plugin manifest, custom-editor candidate/eligibility selection, file-content loader, native `RangedFileDocuments`, `RuntimeRangeDocument`, custom-editor host bridge, injected shell SDK and current Binary Tools UI/Reader. A local in-process filesystem API adapter connects the existing layers. Only the forbidden legacy binary whole-file read is replaced by a throwing sentinel. Plain-text cases permit one real `readLocalFileContent` call.

## Observed reads

| Case                               |    File bytes | Initial inspection payload bytes | Total successful range payload bytes | Range requests | Legacy binary / ordinary text reads |
| ---------------------------------- | ------------: | -------------------------------: | -----------------------------------: | -------------: | ----------------------------------: |
| extensionless-ELF                  |    68,157,440 |                           196608 |                           68,550,656 |            267 |                                   0 |
| extensionless-ELF                  | 1,073,741,824 |                           196608 |                              393,216 |              8 |                                   0 |
| empty-New-inspection               |             0 |                                — |                                    0 |              0 |                                   0 |
| extensionless-text-default         |            28 |                                — |                                    0 |              0 |                                   1 |
| extensionless-text-explicit-Source |            28 |                                — |                                    0 |              0 |                                   1 |

Both binary cases issued reads of at most **262,144 bytes**, with at most **two** native reads in flight. Initial inspection includes metadata, visible EOF hex and the data inspector. Payload counts exclude classification probes and failed/cancelled attempts.

The 65 MiB case completed an EOF-marker search through more than 120 actual bridge requests. The 1 GiB case inspected metadata/EOF and started a scan that file invalidation cancelled; a complete 1 GiB search is not claimed. Both cases exercised real cancellation, filesystem mutation, cleared UI/results and explicit Reload, showing the new architecture and EOF byte after reload. Neither used the old whole-file reader.

An empty `.bin` New inspection issued zero payload reads and enabled the picker. Plain text reused the same extensionless basename as the binary fixtures: default fallback opened and closed one bounded native probe before normal Source; explicit Source opened no range probe. Neither retained an empty ranged placeholder.

## Reproduce

Use a disposable host checkout containing the combined feature code and its frozen dependencies, with the repository-supported Node/Bun toolchain. Copy `binary-tools-host-consumer.integration.test.tsx` to:

```
src/renderer/src/components/editor/binary-tools-host-consumer.integration.test.tsx
```

Point `BINARY_TOOLS_SOURCE` at the matching Binary Tools checkout. From the host root, clear inherited `ORCA_*` settings and run the same scoped selection:

```sh
for orca_env_key in "${!ORCA_@}"; do unset "$orca_env_key"; done
ORCA_BACKGROUND_LAUNCH=1 BINARY_TOOLS_SOURCE=/path/to/plugin node config/scripts/run-vitest.mjs run --config config/vitest.config.ts src/renderer/src/components/editor/binary-tools-host-consumer.integration.test.tsx --maxWorkers=1
```

The harness loads the real consumer modules through `pathToFileURL` and dynamic import. It creates temporary sparse fixtures, removes them afterward and writes current metrics to `/tmp/orca-binary-integration-evidence.json`. Keep this harness on a separate evidence branch, outside the production PR diff.

## Files and boundary

- `observations.json`: actual per-case measurements from the passing run.
- `vitest.log` and `vitest.exit`: complete passing runner output and status. Absolute local checkout paths are replaced with `/path/to/host` or `/path/to/plugin`; no other output is changed.
- `provenance.json`: host revision, selected command, source/harness digests and evidence scope.
- `binary-tools-host-consumer.integration.test.tsx`: portable source harness.

This covers the local in-process filesystem/renderer/frame contract. It does not claim Electron process IPC/transfer acceptance, browser layout/font acceptance, remote SSH/RPC pairing or live installed-app verification. The log's module-type warning is preserved.

The harness is stored with a `.txt` suffix so evidence does not become an application build input. Copy it to the stated editor test path with the normal `.test.tsx` filename before running. `binary-range-before.integration.test.ts.txt` is the independent unmodified-base local-admission probe; it verifies both sparse inputs are refused above the existing 50 MiB local limit, without whole-file allocation.

## Reproducing the exact combined host

`combined-host.patch` contains the tested combination of the two independent host PRs, including their additive-field conflict resolution. Apply it to Orca commit `4337392b75bf70902227295a3f0c85b4040adb28` in a disposable checkout after normal repository dependency setup. It contains no installed-app configuration or private project data. Then copy the portable harness (remove its `.txt` suffix) into `src/renderer/src/components/editor/`, check out consumer commit `71ae801`, set `BINARY_TOOLS_SOURCE` to that plugin checkout and run the selected test command above.

This patch is reproduction evidence; the official source changes remain the two separate PRs. It makes the otherwise private combined-source snapshot reproducible without guessing the merge resolutions.
