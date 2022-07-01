

# Open in Browser

## What's new?
* rewrite the code with TypeScript, now it dependes on a tiny library [npm/opn](https://www.npmjs.com/package/opn)
* support more browsers: **Chromium**(*Mac only*), **Firefox Developer Edition**(*Mac only*), **Edge**(*Windows only, __sometimes it won't work__*)
* you can open *__any__* type of file with the default program, not only *__html__* file. 

## How it works?
* on *win32* uses `start`
* on *darwin* uses `open`
* otherwise uses the `xdg-open` script from [freedesktop.org](https://portland.freedesktop.org/doc/xdg-open.html)

## Usage
use `Alt + B` shortcut to open current *html* file in default browser, or `Shift + Alt + B` to choose a browser.
you could also right click just like the picture:
![img](https://i.loli.net/2018/08/12/5b6fb8f378e8b.jpg)

when you choose `open in Other Browsers`, a browser list will display, and you could choose one to open current file.
![img](https://i.loli.net/2018/08/12/5b6fb86934f8f.png)

when you choose `open in Default Browser`, it means *system default browser* by default. If you want to configure the default browser, you could override it like that:
![img](https://i.loli.net/2018/08/12/5b6fb86942af1.jpg)
if you configured the default browser, when you choose `open in Default Browser`, your configured browser will works.

you do not need to set `open-in-browser.default` a very accurate value, as long as the value matches any of the following terms, I will handle it:
__*Chrome*__ values: *chrome*, *google chrome*, *google-chrome*, *gc*
__*Firefox*__ values: *firefox*, *mozilla firefox*, *ff* 
__*IE*__ values: *ie*, *iexplore*
__*Safari*__ values: *safari*
__*Opera*__ values: *opera*
__*Chromium*__ values: *chromium*
__*Firefox Developer Edition*__ values: *firefox developer*, *fde*, *firefox developer edition*
__*Edge*__ values: *edge*, *msedge*, *microsoftedge*

## Shortcuts

|key|command|
|------|------|
|`Alt + B`|open in default browser|
|`Shift + Alt + B`|open in specified browser|

## Changelog
see [changelog](CHANGELOG.MD) for more infomation

## License
[MIT](https://raw.githubusercontent.com/DonJayamanne/bowerVSCode/master/LICENSE)
