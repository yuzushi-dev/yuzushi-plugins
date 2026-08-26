# Yuzushi Plugins

Plugins for Claude Code and Codex.

## Install

Session-handoff:

```bash
npx session-handoff@latest setup
```

Sando plugin, Claude Code:

```text
/plugin marketplace add yuzushi-dev/yuzushi-plugins
/plugin install sando@yuzushi
```

Sando plugin, Codex:

```bash
codex plugin marketplace add yuzushi-dev/yuzushi-plugins
```

Then run `/plugins` and install `sando`.

## Plugins

- `session-handoff`: Create handoffs and migrate sessions between Claude Code and Codex.
- `sando`: Reduce repeated tool-output context in Claude Code and Codex.
