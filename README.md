# Open in Browser

Open a saved file from VS Code in your preferred browser—or let your operating system choose the default application.

Use a keyboard shortcut, the Command Palette, or a context menu. Open a file directly, or use Serve Mode to view a local static page through HTTP.

## Features

- Open local files in their system-associated application or a configured browser.
- Choose a browser for each launch with **Open In Other Browsers**.
- Add custom browsers to the picker with a display name and an application name or absolute executable path.
- Set per-browser arguments, such as Chrome's `--incognito` flag.
- Open non-HTML files, including JSON, XML, Markdown, and PSD, with their associated applications.
- Serve local static pages over HTTP when a page needs a localhost URL or relative assets.

Version 3.1 adds custom browsers and Microsoft Edge support on Windows, macOS, and Linux. Version 3.0 added Serve Mode. The 2.1 series added browser mappings, arguments, broader default-application menus, and launch fixes. See the [changelog](CHANGELOG.md) for release details.

## Quick start

1. Install **open in browser** (`techer.open-in-browser`) from the VS Code Extensions view.
2. Save your file to disk.
3. Choose how to open it:

| Action | Command | Default shortcut |
| --- | --- | --- |
| Use the system default application or your configured browser | **Open In Default Browser** | `Alt+B` |
| Select a browser for this launch | **Open In Other Browsers** | `Shift+Alt+B` |
| Serve a local static page over HTTP | **Open in Browser - Serve Mode** | None |

These commands are available in the Command Palette. Shortcuts and Command Palette commands use the active editor's file. Context-menu commands use the selected resource.

### Context menus

Commands appear in the Explorer, editor, and editor-tab context menus:

- **Open In Default Browser** is available for local files of any type. Its menu entry excludes folders, unsaved documents, and remote resources.
- **Open In Other Browsers** appears for resources whose language mode is HTML.
- **Open in Browser - Serve Mode** appears for saved local files in trusted workspaces. It is unavailable in remote workspaces.

With no browser configured, **Open In Default Browser** uses the operating system's file association. A PSD may open in an image editor, for example—not in a browser. If a browser is configured, the file is sent to that browser instead; not every file type can be displayed by a browser.

## Serve Mode

Serve Mode starts a small HTTP server for local static files and opens the selected file at a `http://127.0.0.1:PORT/...` URL in your system default browser. Use it when a page needs HTTP or loads CSS, JavaScript, images, or other relative assets. The existing direct-open commands still work without starting a server.

1. Open a trusted local workspace and save the file you want to view.
2. Run **Open in Browser - Serve Mode** from the Command Palette or a file's context menu.
3. If the file has unsaved edits, choose **Save and Open** to save it first.
4. When finished, run **Open in Browser - Stop All Local Servers**. Use **Open in Browser - Manage Local Servers** to reopen a URL, copy it, or stop one server.

By default, the server root is the selected file's workspace folder and the preferred port is `2222`. If that port is busy, Serve Mode chooses a free port. A server is reused for other files under the same root. For a saved file outside a workspace, set `open-in-browser.serve.root` to `${fileDirname}` before opening it.

Configure the root and port in your settings if needed:

```json
{
  "open-in-browser.serve.root": "${workspaceFolder}/public",
  "open-in-browser.serve.port": 2222
}
```

`serve.root` also accepts `${fileDirname}`, either variable followed by a subdirectory, or an absolute directory path. The selected file must be inside that root. Port `0` always chooses a free port. Changing these settings does not reconfigure an already running server; stop it and open the file again. The server listens only on `127.0.0.1`. It can serve allowed static files under its root, including files other than the selected page; hidden files, backend scripts, and symlinks outside the root are blocked.

**Serve Mode is a lightweight static server, not a general development or production server.** It does not run PHP or other backend code, provide live reload, or support remote workspaces. Do not try to use it for complex services. If you need backend processing, advanced routing, build pipelines, or other special behavior, use a dedicated development-server extension or software instead.

## Configuration

Open **Preferences: Open User Settings (JSON)** from the Command Palette and add the settings you need.

### Default browser

Leave `open-in-browser.default` empty to use the system-associated application:

```json
{
  "open-in-browser.default": ""
}
```

To choose a browser for **Open In Default Browser**, use a supported alias:

```json
{
  "open-in-browser.default": "chrome"
}
```

This does not change your operating system's default browser. **Open In Other Browsers** still uses whichever browser you select from the picker.

### Browser aliases

Aliases are case-insensitive. These are built-in mappings, not a list of browsers detected on your machine: the selected browser must already be installed and accessible.

| Browser | Platforms with a built-in mapping | Accepted aliases |
| --- | --- | --- |
| Google Chrome | Windows, macOS, Linux | `chrome`, `google chrome`, `google-chrome`, `gc`, `谷歌浏览器` |
| Chrome Canary | Windows, macOS | `canary`, `chrome canary`, `google chrome canary` |
| Chromium | macOS, Linux | `chromium`, `chromium-browser` |
| Mozilla Firefox | Windows, macOS, Linux | `firefox`, `mozilla firefox`, `ff`, `火狐浏览器` |
| Firefox Developer Edition | macOS | `firefox developer`, `firefox developer edition`, `fde` |
| Brave | Windows, macOS, Linux | `brave`, `brave browser`, `brave-browser` |
| Microsoft Edge (Chromium-based) | Windows, macOS, Linux | `edge`, `msedge`, `microsoftedge`, `microsoft edge`, `microsoft-edge` |
| Internet Explorer (legacy) | Windows | `ie`, `iexplore` |
| Safari | macOS | `safari` |
| Opera | Windows, macOS, Linux | `opera` |

Platform notes:

- **Linux Chrome:** the usual mapping is `google-chrome`. Set the value to `google-chrome-stable` if that is your installed command, as on some Arch/Manjaro installations.
- **Linux Chromium:** choose `chromium` or `chromium-browser` to match your installed command. The picker uses `chromium`; the alternate command can be selected through the default-browser setting.
- **Windows Canary:** the mapping uses `%LOCALAPPDATA%\Google\Chrome SxS\Application\chrome.exe`. Canary is not offered on Linux.
- **Legacy browsers:** a mapping does not make a browser available on operating systems that no longer provide it.
- **Microsoft Edge:** `edge` maps to `msedge` on Windows, `Microsoft Edge` on macOS, and `microsoft-edge` on Linux.
- An unrecognized default-browser name falls back to the system-associated application unless registered as a custom browser. For other executables, register a custom browser or use an absolute path.

### Custom browsers

Add `open-in-browser.customBrowsers` to your **User Settings (JSON)** to append entries to **Open In Other Browsers**:

```json
{
  "open-in-browser.customBrowsers": [
    {
      "displayName": "My Edge",
      "name": "edge"
    },
    {
      "displayName": "Firefox Nightly (Linux)",
      "name": "firefox-nightly"
    },
    {
      "displayName": "Portable Browser (Windows)",
      "path": "D:\\Apps\\Browser\\browser.exe"
    }
  ]
}
```

Keep only entries that apply to your machine and replace the example names and paths as needed. The extension does not install or automatically detect browsers.

Each entry requires:

- `displayName`: a non-empty label shown in the browser picker. It is not a launch command or a default-browser identifier.
- Exactly one of `name` or `path`:
  - `name`: a built-in alias, such as `edge`, or an OS application/command name. Built-in aliases use the platform mappings above; other names are passed through as written and must be accessible to the operating system. On macOS, use the application name, such as `Vivaldi`; on Linux, use its executable command, such as `vivaldi`.
  - `path`: an absolute executable path. On macOS, both `.app` paths (for example, `/Applications/Microsoft Edge.app`) and actual executable paths (for example, `/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge`) are supported.

This is a machine-specific user setting, not a workspace setting: do not put it in a project's `.vscode/settings.json`. Custom entries appear after the built-in browsers and do not replace them. Changes take effect the next time you open the picker, without reloading VS Code.

Entries with missing or blank labels, both `name` and `path`, or relative paths are ignored. A valid entry whose application cannot be launched produces an error rather than opening the system default browser.

Do not include shell quotes or arguments inside `name` or `path`. Use `open-in-browser.arguments` for arguments, keyed by the configured name or exact absolute path—not by `displayName`. You can also set `open-in-browser.default` to that name or path:

```json
{
  "open-in-browser.customBrowsers": [
    {
      "displayName": "My Nightly",
      "name": "firefox-nightly"
    }
  ],
  "open-in-browser.default": "firefox-nightly",
  "open-in-browser.arguments": {
    "firefox-nightly": ["-private-window"]
  }
}
```

This example requires the `firefox-nightly` command to be installed and accessible. Custom browsers apply to direct-open commands; Serve Mode continues to use the system default browser.

### Absolute browser paths

Use an absolute executable path if a browser is installed in a custom location, cannot be found, or another application intercepts its command name. On macOS, you can use an absolute `.app` path.

For example, on Windows:

```json
{
  "open-in-browser.default": "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
}
```

Use the actual path on your machine. Keep the JSON quotes, but do not put additional shell quotes or command-line arguments inside the value. Backslashes must be escaped as `\\` in JSON.

This setting applies to **Open In Default Browser**. It does not replace the browser picker's built-in mappings.

### Browser arguments

`open-in-browser.arguments` maps a browser alias, a registered custom browser name, or an absolute path matching your configured browser to an array of arguments.

For Chrome incognito windows:

```json
{
  "open-in-browser.default": "chrome",
  "open-in-browser.arguments": {
    "chrome": ["--incognito"]
  }
}
```

Each array element is one argument. Keep spaces within that element, without adding shell quoting:

```json
{
  "open-in-browser.default": "chrome",
  "open-in-browser.arguments": {
    "chrome": ["--user-data-dir=/path/with spaces/profile"]
  }
}
```

Replace the example profile path with a suitable path on your machine.

- Arguments apply to both commands when the matching browser is explicitly selected, including through the picker.
- Arguments are ignored when using the unconfigured system default application or a different browser.
- Configure only one alias per browser. When using an absolute browser path, use that same path as the arguments key.
- Argument support depends on the browser. An already-running browser may ignore startup-only flags.

## Customize shortcuts

Run **Preferences: Open Keyboard Shortcuts** from the Command Palette, search for either command, and edit its binding. Use **Show Same Keybindings** to investigate conflicts, for example with GitLens.

Alternatively, run **Preferences: Open Keyboard Shortcuts (JSON)** and add entries to `keybindings.json`—not `settings.json`:

```json
[
  { "key": "alt+b", "command": "-extension.openInDefaultBrowser" },
  { "key": "shift+alt+b", "command": "-extension.openInSpecifyBrowser" },
  { "key": "ctrl+alt+b", "command": "extension.openInDefaultBrowser" },
  { "key": "ctrl+alt+shift+b", "command": "extension.openInSpecifyBrowser" }
]
```

The first two entries remove this extension's default bindings. The remaining entries assign example replacements; choose keys that are free in your environment.

## Troubleshooting

### A file does not open

1. Save the file to disk. The extension opens the on-disk file; save any edits you want to view.
2. Open the same file from your operating system's file manager to check its association and accessibility.
3. If you configured a browser, verify its alias or absolute path and confirm that it can open the file outside VS Code.
4. Check the Extension Host log for entries beginning with `[open-in-browser]`. The notification is generic, but the log preserves the underlying launch error.

Opening a file manually is a diagnostic step or workaround, not proof that an extension failure is fixed.

### Firefox is not found on Windows

Set `open-in-browser.default` to the absolute path to `firefox.exe`, then use **Open In Default Browser**.

Alternatively, add the directory containing `firefox.exe`—not the executable itself—to your user `PATH`. Keep the existing entries, then fully exit and restart VS Code so it inherits the change. This addresses command lookup, not every permission or launch failure.

### A Linux browser command is not found

Check the command used by your distribution. Try `google-chrome-stable` or `chromium-browser` where appropriate, or configure the browser's absolute executable path. The picker uses built-in mappings and does not detect every distribution-specific installation.

### Windows reports a permission error

Try opening the same file under your normal user account and inspect the underlying error. An earlier report was resolved by restoring Windows account settings, but that does not establish a common cause for other failures. Do not disable UAC, weaken security policies, or run VS Code as administrator as a general workaround.

### Reporting a problem

Search the [existing issues](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues) first. When reporting a problem, include:

- Extension, VS Code, operating system, and browser versions.
- Browser installation method and relevant extension settings.
- The command or menu you used and a representative file path.
- Whether opening the file outside VS Code works.
- The underlying Extension Host error and reproducible steps.

Remove private information from paths and logs before sharing them.

## Scope and limitations

- **Direct open and lightweight Serve Mode.** Direct-open commands use file paths. Serve Mode provides localhost HTTP for static files; it does not map files to an existing development server, provide live reload, or run backend code. Use a dedicated server for more complex needs.
- **Saved content only.** Unsaved-document preview is not supported; save edits before opening the file.
- **Local Serve Mode only.** Serve Mode is disabled in SSH, containers, WSL, and other remote workspaces. Direct-open commands do not automatically make remote files accessible to a local browser.
- **Verification is platform-specific.** Automated tests cover mappings, parameters, and menu declarations; a macOS test application exercises LaunchServices. Windows/Linux browser launches, VS Code menu behavior, and Insiders installation still need desktop validation. The reported Ubuntu 24.04 default-browser failure has not been confirmed fixed.

## How launching works

| Platform | Launch mechanism |
| --- | --- |
| Windows | Windows PowerShell `Start-Process`, with literal paths and individually quoted arguments. Explicitly selected browsers receive an encoded file URI. |
| macOS | `/usr/bin/open` for application names and `.app` paths, without waiting for the browser to exit. Absolute executable paths are launched directly. |
| Linux | `opn`, using the selected browser command or its bundled `xdg-open` script for the system default application. |

## Development

Use Node.js 24 LTS (recommended). ESLint 10 requires Node.js `^20.19.0 || ^22.13.0 || >=24`; this requirement applies to development tooling, not to users installing the extension in VS Code.

```sh
npm ci
npm run lint
npm test
```

`npm test` compiles the TypeScript source and runs the automated tests. Run lint separately before submitting changes.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release notes.

## License

[MIT](LICENSE).
