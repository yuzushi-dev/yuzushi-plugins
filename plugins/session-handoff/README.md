# Session Handoff

Create a handoff and continue in a fresh Codex or Claude session.

## Install

```bash
npx session-handoff@latest setup
```

The setup asks for confirmation, installs the MCP server and skill, and wraps
the client launchers. It supports Linux and macOS with Node.js 18+ and Python
3.10+.

### Marketplace install

The plugin is also published through the `yuzushi` marketplace:

```
# Claude Code
/plugin marketplace add yuzushi-dev/yuzushi-plugins
/plugin install session-handoff@yuzushi

# Codex
codex plugin marketplace add yuzushi-dev/yuzushi-plugins
codex plugin add session-handoff@yuzushi
```

**On Codex the marketplace install is not enough: you still need the npx setup**
for the MCP server to work. Codex (verified on 0.149.1) does not expand
`${PLUGIN_ROOT}` or `${CLAUDE_PLUGIN_ROOT}` in the `args` of an MCP server
declared by a plugin manifest, and it does not pass either variable in the
server process environment, so the server cannot locate its own files. It is
listed by `codex mcp list` with unexpanded args and never starts. The npx setup
sidesteps this by writing `[mcp_servers.session-handoff]` into
`~/.codex/config.toml` with an absolute path.

On Claude Code the marketplace install is self-contained; the npx setup is only
needed there for the managed launcher that powers the automatic switch.

Remove the setup with:

```bash
npx session-handoff@latest uninstall
```

## Use

Launch Codex or Claude normally after setup, then use:

- Codex: `$session-handoff`
- Claude: `/session-handoff`

The plugin writes a validated Markdown file under `handoffs/`, starts a fresh
session, and pre-fills the chat with `reference [handoffs/<name>.md] riparti da
qui`. Press Enter to send it when you are ready.

The automatic switch requires the managed launcher. A client started through a
direct binary path uses the manual-resume fallback.

## Safety

- Handoffs stay inside the workspace.
- Existing files are not overwritten by default.
- Common credentials are redacted before writing and reading.
- The MCP server has no third-party runtime dependencies.

## Development

```bash
pytest -q
claude plugin validate --strict .
```
