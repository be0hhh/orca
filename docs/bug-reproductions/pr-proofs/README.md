# PR visual evidence

These artifacts are kept on a separate evidence branch, outside the proposed application changes.

The Codex images are headless component fixtures: identical worker roles before task metadata is available and after delayed task names are recovered. They illustrate the unchanged sidebar rendering path; the normalization/poll regression checks the producer behavior. Both light and dark themes were rendered without page errors. They are not screenshots of the installed application.

`codex-fixture.patch` contains the headless fixture setup used for the images. It is kept with the evidence rather than adding demonstration-only exports to the focused production fix.

## Binary fallback consent

`binary-consent-before.{dark,light}.png` and `binary-consent-after.{dark,light}.png` render the existing install-consent component with the same `.bin` editor/publisher and only the new fallback flag differing. They show the broader file-reading disclosure, not an installed-app session. Reproduce from the fallback feature branch with `pnpm fixtures:shot plugins/review/PluginInstallConsent:extensionOnly plugins/review/PluginInstallConsent:binaryFallback --theme both`; all four headless shots completed without page errors.
