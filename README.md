# Yuzushi Plugins

Marketplace di plugin per **Claude Code** e **OpenAI Codex**.

## Installazione

Claude Code:

```
/plugin marketplace add yuzushi-dev/yuzushi-plugins
/plugin install session-handoff@yuzushi
/plugin install sando@yuzushi
```

Codex:

```
codex plugin marketplace add yuzushi-dev/yuzushi-plugins
```
poi `/plugins` per installare.

## Plugin

| Nome | Descrizione |
|---|---|
| [session-handoff](plugins/session-handoff) | Handoff validati e secret-safe, con ripresa automatica in una sessione nuova di Codex o Claude. |
| [sando](https://github.com/yuzushi-dev/Sando) | Redazione secrets, cap su output di tool oversize, trimming history — senza chiamate a LLM. |

## Struttura

```
.claude-plugin/marketplace.json   # indice per Claude Code
.agents/plugins/marketplace.json  # indice per Codex
plugins/<nome>/                   # un plugin per cartella
```

Per aggiungere un plugin: crea `plugins/<nome>/`, poi aggiungi una entry in entrambi i marketplace.json.
I tag di versione sono per-plugin: `<nome>-v<versione>` (es. `session-handoff-v0.5.0`).

`sando` non è vendorizzato qui: la entry usa `source: git-subdir` e punta direttamente a
`yuzushi-dev/Sando` (sottocartelle `adapters/claude/sando` e `plugins/sando`), niente da
tenere sincronizzato a mano.

MIT.
