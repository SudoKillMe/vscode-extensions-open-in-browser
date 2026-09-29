# Change Log

## [3.1.0]

### Added
- Add configurable custom browsers to the browser picker using a display name and an application name or absolute executable path.
- Support Microsoft Edge aliases in the browser picker on macOS and Linux as well as Windows.
- Launch absolute executable paths directly on macOS, while continuing to support application names and `.app` paths.

## [3.0.0]

### Added
- Add **Open in Browser - Serve Mode** for saved local static files, with a configurable server root and preferred port. It opens a localhost HTTP URL in the system default browser.
- Add commands to manage running local servers and stop them all.

### Scope
- Serve Mode is a lightweight static server for trusted local workspaces. It does not run backend code, provide live reload, or support remote workspaces. Use a dedicated development server for complex services.
- Direct file opening remains available without starting a server.

## [2.1.1]

### Documentation
- Rewrite the README with a quick start, command and browser-alias tables, configuration examples, shortcut customization, and troubleshooting guidance.
- Clarify default-application behavior, browser argument scope, saved-file requirements, and remote-development limitations.
- Link to the project's MIT license and release notes, and document the current platform-validation boundaries.

### Packaging
- Include the project license and MIT metadata in the extension package.
- Exclude source files, tests, investigation notes, and source maps while retaining compiled code and production dependencies.
- No runtime behavior changes from 2.1.0.

## [2.1.0]

### Added
- Browser arguments configured per browser through `open-in-browser.arguments`, including Chrome incognito mode (#14, #69).
- Absolute browser executable paths in `open-in-browser.default` (#44).
- Chrome Canary on macOS/Windows, Brave on macOS/Windows/Linux, and Chromium on Linux (#29, #82, #23).
- Explicit `chromium-browser` and `google-chrome-stable` command names on Linux (#23, #65, #89).

### Changed
- Show **Open In Default Browser** in context menus for all local files, excluding folders. **Open In Other Browsers** remains limited to HTML in context menus (#31, #52, #63).
- Use PowerShell `Start-Process` instead of `cmd /c start` on Windows, quote arguments individually, and send encoded file URIs to explicitly selected browsers to address special-character and split-path reports (#37, #45, #58, #85).
- Map the Edge aliases to Chromium-based Microsoft Edge (`msedge`).

### Fixed
- Correct the macOS application name for Firefox Developer Edition (#41).
- Stop passing `-W` to the macOS launcher while still handling launcher errors (#94).
- Restore dependency installation by replacing the obsolete `vscode` development package with `@types/vscode` (#56).
- Preserve underlying launch errors in the Extension Host log without changing the existing error notification.

### Documentation
- Explain shortcut customization and conflicts, browser paths and arguments, and the limits of reported workarounds (#59, #72, #70, #73, #74, #75, #98).

### Validation and known limitations
- Automated checks cover browser mappings, command dispatch, arguments, Windows quoting and URI handling, menu declarations, and configuration examples. A macOS LaunchServices test application verifies non-waiting launch behavior and argument preservation.
- Windows/Linux browser launches and VS Code context-menu behavior still require desktop validation; automated tests are not a substitute for those checks.
- VS Code Insiders installation (#50) and the Ubuntu 24.04 default-browser failure (#99) remain unverified. Remote-file access and unsaved-document preview are not added in this release.

### [1.2.0]
added context menu option to tab bar

### [1.1.1]
add `opera` support

change icon;  beautiful, right?

change Licence
### [1.0.0]
add `default browser` configuration option

add `open in other browsers`

### [0.0.3]
add `open file by right click menu item`

fix some bug

### [0.0.2]
add shortcut `Alt + B` 

modify the command on linux...

### [0.0.1]

BASIC SUPPORT...
