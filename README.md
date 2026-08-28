# Yuzushi Plugins

Plugins for Claude Code and Codex.

## session-handoff

Create handoffs and continue work in a fresh session. It also supports migrating active sessions between Claude Code and Codex.

Repository: https://github.com/yuzushi-dev/session-handoff

### Install with npx

```bash
npx session-handoff@latest setup
```

### Install as a plugin

Claude Code:

```text
/plugin marketplace add yuzushi-dev/yuzushi-plugins
/plugin install session-handoff@yuzushi
```

Codex:

```bash
codex plugin marketplace add yuzushi-dev/yuzushi-plugins
codex plugin add session-handoff@yuzushi
```

## Sando

Reduce repeated and oversized tool-output context in Claude Code and Codex. Sando runs locally and makes no LLM calls.

Repository: https://github.com/yuzushi-dev/Sando

### Install as a plugin

Claude Code:

```text
/plugin marketplace add yuzushi-dev/yuzushi-plugins
/plugin install sando@yuzushi
```

Codex:

```bash
codex plugin marketplace add yuzushi-dev/yuzushi-plugins
```

Then open `/plugins`, select `sando`, and install/enable it.
