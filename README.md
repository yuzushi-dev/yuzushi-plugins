# Yuzushi Plugins

Plugins for Claude Code and Codex.

## session-handoff

<p>
  <img src="https://raw.githubusercontent.com/yuzushi-dev/session-handoff/main/assets/session-handoff-mark.png" alt="session-handoff logo" width="72">
</p>

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

<p>
  <img src="https://raw.githubusercontent.com/yuzushi-dev/Sando/main/assets/sando-mark.png" alt="Sando logo" width="72">
</p>

Sando bounds repeated and oversized tool output locally in Claude Code and Codex. It provides host-specific hooks and MCP surfaces, provider accounting, paired control/treatment measurements, and sandboxed execution on Codex. It makes no LLM calls.

The Claude Code and Codex manifests expose different host wiring. See the [Sando README](https://github.com/yuzushi-dev/Sando#readme) for the public surfaces and limitations.

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
