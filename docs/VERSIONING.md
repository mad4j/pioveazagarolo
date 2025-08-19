# Versioning & Build Automation

Questo progetto gestisce automaticamente la versione ad ogni commit.

## Flusso

1. Esegui modifiche e `git add`.
2. Quando lanci `git commit` il pre-commit hook esegue:
   - `npm run manage-version` (aggiorna `version.json` con regole semver + rc)
   - `npm run build-info` (aggiorna `build-info.json` con hash commit corrente *pre-commit*)
   - `git add version.json build-info.json`
3. Il commit include sempre version.json e build-info aggiornati.

## Regole incremento versione

- Commit con tipi `feat:`, `ux:`, `pwa:` (anche con scope) dalla release precedente -> incrementa MINOR e azzera PATCH, avvia ciclo `-rc1`.
- Altri commit -> incrementa PATCH, avvia ciclo `-rc1`.
- Commit successivi senza tag -> incrementano solo il suffisso `-rcN`.
- Quando crei un tag (es. `v1.5.0`) il prossimo commit userà quella base e riparte il processo.

## Tag Release

1. Assicurati che il branch sia pulito.
2. Crea tag: `git tag v1.5.0 -m "Release v1.5.0" && git push origin v1.5.0`.
3. Il workflow di changelog aggiornerà il file CHANGELOG.

## Reinstallare hook

Se necessario: `npm run setup-hooks`.

## CI

Nel workflow GitHub (build) conviene eseguire lo stesso script per garantire consistenza:

```yaml
- name: Version & build info
  run: |
    npm ci
    npm run manage-version
    npm run build-info
```
