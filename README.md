

# Open in Browser

## What's new?
* rewrite the code with TypeScript, now it dependes on a tiny library [npm/opn](https://www.npmjs.com/package/opn)
* support more browsers: **Chromium**(*Mac and Linux*), **Firefox Developer Edition**(*Mac only*), **Edge**(*Windows, Chromium-based Microsoft Edge*)
* you can open *__any__* type of file with the default program, not only *__html__* file. 

## How it works?
* on *win32* uses Windows PowerShell `Start-Process`, with literal paths and individually quoted arguments (no `cmd /c start` parsing)
* on *darwin* uses `open`
* otherwise uses the `xdg-open` script from [freedesktop.org](https://portland.freedesktop.org/doc/xdg-open.html)

## Usage
use `Alt + B` shortcut to open current *html* file in default browser, or `Shift + Alt + B` to choose a browser.
you could also right click just like the picture:
![img](https://i.loli.net/2018/08/12/5b6fb8f378e8b.jpg)

**Open In Default Browser** is available in context menus for all saved local files, including JSON, XML, Markdown and PSD. With an empty `open-in-browser.default`, the operating system chooses the associated application, which may not be a browser. Folders, unsaved documents and remote resources are excluded from this menu. **Open In Other Browsers** remains limited to HTML in context menus. These menu rules do not change the command-palette or shortcut commands.

when you choose `open in Other Browsers`, a browser list will display, and you could choose one to open current file.
![img](https://i.loli.net/2018/08/12/5b6fb86934f8f.png)

when you choose `open in Default Browser`, it means *system default browser* by default. If you want to configure the default browser, you could override it like that:
![img](https://i.loli.net/2018/08/12/5b6fb86942af1.jpg)
if you configured the default browser, when you choose `open in Default Browser`, your configured browser will works.

you do not need to set `open-in-browser.default` a very accurate value, as long as the value matches any of the following terms, I will handle it:
__*Chrome*__ values: *chrome*, *google chrome*, *google-chrome*, *gc*; on Linux, use *google-chrome-stable* if that is the installed command (for example on Arch/Manjaro).
__*Chrome Canary*__ values: *canary*, *chrome canary*, *google chrome canary* (Mac/Windows; Windows uses the per-user installation under `%LOCALAPPDATA%`). Canary is not offered on Linux.
__*Firefox*__ values: *firefox*, *mozilla firefox*, *ff* 
__*Brave*__ values: *brave*, *brave browser*, *brave-browser*
__*IE*__ values: *ie*, *iexplore*
__*Safari*__ values: *safari*
__*Opera*__ values: *opera*
__*Chromium*__ values: *chromium* (Mac/Linux), *chromium-browser* (Linux distributions using that executable name)
__*Firefox Developer Edition*__ values: *firefox developer*, *fde*, *firefox developer edition*
__*Edge*__ values: *edge*, *msedge*, *microsoftedge*

### Explicit browser paths

If another application intercepts `chrome`, or your browser is installed outside the usual location, set `open-in-browser.default` to its absolute executable path. On macOS you can use the absolute `.app` path. This applies to **Open In Default Browser**; the browser picker still uses its built-in mappings. Do not put quotes or command-line arguments inside the path.

```json
{
  "open-in-browser.default": "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
}
```

### Browser arguments

Use `open-in-browser.arguments` to configure an array of arguments for a browser alias (or an absolute path matching your configured browser). Each array element is one argument: keep spaces inside the string, and do not add shell quoting. Arguments apply to both commands when that browser is explicitly selected; they are ignored for the system default application and other browsers. Configure only one alias per browser. Existing browser instances may ignore startup-only flags.

```json
{
  "open-in-browser.default": "chrome",
  "open-in-browser.arguments": {
    "chrome": ["--user-data-dir=/path/with spaces/profile"]
  }
}
```

For Chrome incognito windows, use:

```json
{
  "open-in-browser.default": "chrome",
  "open-in-browser.arguments": {
    "chrome": ["--incognito"]
  }
}
```

This applies when opening with Chrome, including from the browser picker. It does not enable incognito mode for other browsers or the unconfigured system default application.

## Shortcuts

|key|command|
|------|------|
|`Alt + B`|open in default browser|
|`Shift + Alt + B`|open in specified browser|

## Changelog
see [changelog](CHANGELOG.MD) for more infomation

## License
[MIT](https://raw.githubusercontent.com/DonJayamanne/bowerVSCode/master/LICENSE)
