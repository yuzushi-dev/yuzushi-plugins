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
| [session-handoff](https://github.com/yuzushi-dev/session-handoff) | Handoff validati e secret-safe, con ripresa automatica in una sessione nuova di Codex o Claude. |
| [sando](https://github.com/yuzushi-dev/Sando) | Redazione secrets, cap su output di tool oversize, trimming history — senza chiamate a LLM. |

## Struttura

```
.claude-plugin/marketplace.json   # indice per Claude Code
.agents/plugins/marketplace.json  # indice per Codex
```

Nessun plugin è vendorizzato qui: ogni entry punta al repo originario (source `url` per un
plugin alla root del repo, `git-subdir` per uno in una sottocartella), quindi un push sul
repo originario si riflette da solo — non c'è nulla da sincronizzare a mano in questo repo.
Per aggiungere un plugin: aggiungi una entry in entrambi i marketplace.json puntando al suo repo.

MIT.
