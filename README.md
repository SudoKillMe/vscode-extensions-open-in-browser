

# Open in Browser

## WHAT'S NEW
* You can now right click the file in the tab bar to open in browser
* Finally, you can open html pages with browsers you specified.
* Usually, I use Firefox browser for convenience, however, I prefer to use Chrome browser when I debugging my html pages. In previous versions, I can not get it. But now, we can.
* Use the Alt-B shortcut to open in the default browser (see setting information below), or Alt-Shift-B to choose a browser. Alternatively, use right-click context menus in the sidebar, tabbar, or body of an HTML file.

## SETTINGS

###  `open-in-browser.default`

In this version, I add a "open-in-browser.default" configuration option. You can set the value to the name of your favorite browser. If the value is correct and not empty, when you open the browser directly through the shortcut keys, it will open the browser that you specified, rather than the system default browser.

Acceptable browsers are as follows:
>##### Firefox , Chrome , Opera, IE and Safari #####

You do not need to set a very accurate value, only if the value in the array, I will handle it:

chrome browser acceptable values:
>   'chrome', 'google chrome', 'google-chrome', 'gc', '谷歌浏览器'

firefox browser acceptable values:
>   'firefox', 'ff', 'mozilla firefox', '火狐浏览器'

ie browser acceptable values:
>   'ie', 'iexplore'

safari browser acceptable values:
>   'safari'

opera browser acceptable values:
>   'opera'

#### example
"open-in-browser.default": "mozilla firefox"

#### how to set settings
if you do not know how to do, see the gif below:

![demo](http://oiw7043hi.bkt.clouddn.com/demo-new.gif)


## OTHER FEATURES

###  open in other browsers

This is not enough, now, you can open html pages *in other browsers*.
when you right click, you may find a new item "`open in other browsers`", if you click it, you will get a browsers list, then you can choose one to open this page.

of course, you can also get it with shortcut `Alt+Shift+B`

see the demonstration gif:

![demo](http://oiw7043hi.bkt.clouddn.com/other.gif)

## TIP

I spend a day doing this and I tested on windows, mac os and ubuntu, if you find any bug, let me know, thanks. 

## SUPPORTED PLATFORMS

MacOS, Linux, Windows 


## CHANGELOG

#### 1.2.0
added context menu option to tab bar


#### 1.1.1
add `opera` support

change icon;  beautiful, right?

change Licence
#### 1.0.0
add `default browser` configuration option

add `open in other browsers`

#### 0.0.3
add `open file by right click menu item`

fix some bug

#### 0.0.2
add shortcut `Alt + B` 

modify the command on linux...

#### 0.0.1

BASIC SUPPORT...

## LICENSE

Apache Licence 2.0


