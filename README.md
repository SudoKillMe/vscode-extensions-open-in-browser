# Open in Browser

Finally, you can open html pages with browsers you specified.

Usually, I use Firefox browser for convenience, however, I prefer to use Chrome browser when I debugging my html pages. In previous versions, I can not get it. But now, we can.

####  open-in-browser.default

In this version, I add a "open-in-browser.default" configuration option. You can set the value to the name of your favorite browser. 
if the value is correct and not empty,  when you open the browser directly through the shortcut keys, it will open the browser that you specified, rather than the system default browser.

For some reason, acceptable browsers are as follows:
>##### Firefox , Chrome , IE and Safari #####
there is no `opera` because i never used it, if needed, i will add it in the future.array
You do not need to set a very accurate value, only if the value in the array, I will handle it:
>chrome:      [ 'chrome', 'google chrome', 'google-chrome', 'gc', '谷歌浏览器' ]
>
>firefox:     [ 'firefox', 'ff', 'mozilla firefox', '火狐浏览器' ]
>
>ie:          [ 'ie', 'iexplore' ]
>
>safari:      [ 'safari' ]

if you do not know how to do, see the gif below:

![demo](http://oiw7043hi.bkt.clouddn.com/demo.gif)

* * *

####  open in other browsers

This is not enough, now, you can open html pages *in other browsers*.
when you right click, you may find a new item "`open in other browsers`", if you click it, you will get a browsers list, then you can choose one to open this page.

of course, you can also get it with shortcut `Alt+Shift+B`

see the demonstration gif:

![demo](http://oiw7043hi.bkt.clouddn.com/demo.gif)

有很多时候，我们出于方便，使用一种浏览器，但是，开发调试的时候我们更愿意使用另一种浏览器。
比如我，我平时使用firefox作为系统的默认浏览器，但是我开发调试的时候更喜欢使用chrome，然而这时我使用open-in-browser时，它打开的是系统的默认浏览器，即firefox。这就很不方便。

为了解决这个问题，我添加了'default'这个配置选项，这个选项将成为'open-in-browser默认打开的浏览器'，也就说，这个值和系统的默认浏览器是不冲突的，我的系统默认是firefox，然而，如果我把default配置成chrome，那么在使用open-in-default的时候，将默认打开chrome！

可选的值也相对比较宽松：    

chrome: [ 'chrome', 'google chrome', 'google-chrome', 'gc', '谷歌浏览器' ]

firefox: [ 'firefox', 'ff', 'mozilla firefox', '火狐浏览器' ]

ie: [ 'ie', 'iexplore' ]

safari: [ 'safari' ]

#### 2，加入用其他浏览器打开选项

先别急着高兴，现在也可以选择在其他浏览器里打开页面啦！

假如我写了一个页面，想分别在chrome，firefox, ie里查看效果，在以前，这可能会让人头疼，但现在，这些功能都打包送给你们啦！
右键点击菜单项或者右键该文档，会发现一个全新的选项： Open in other browsers
当你点击这项时，会列出你可能拥有的浏览器，你选择对应的条目，就会自动在该浏览器里打开该文件啦！

目前支持的浏览器为：

windows平台：
ie, chrome, firefox

mac平台：
safari, chrome, firefox

linux平台：
chrome, firefox

(我没加opera是因为我几乎没用过opera，如果真有需要，以后会加上)

This allows you to open the current file in your default browser or application.
>tip : only html file is supported now, just in case

## USAGE
There are three methods to use this extension, what I recommend is the second way.
> 1, open command panel ( `cmd + shift + p` on MacOS or `ctrl + shift + p` on Windows ), then enter `open in browser`

> 2, with shortcut `Alt + B`

> 3, right click the menu item, and choose `Open File In Browser` 
![demo](http://oiw7043hi.bkt.clouddn.com/demo.png)

## SUPPORT

MacOS, Linux, Windows 


## Release
#### 0.0.3
add `open file by right click menu item`
fix some bug

#### 0.0.2
add shortcut `Alt + B` 
modify the command on linux...

#### 0.0.1

BASIC SUPPORT...

## License

WYGIWYW(What you get is what you want) LICENSE


