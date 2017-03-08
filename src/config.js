
var platform = process.platform;

var chromeItem = {
    detail: "A fast, secure, and free web browser built for the modern web",
    label: "Google Chrome",
    standardName: platform == 'win32' ? 'chrome' : ( platform == 'darwin'? 'google chrome': 'google-chrome'),
    acceptName: ['chrome', 'google chrome', 'google-chrome', 'gc', '谷歌浏览器']
};
var firefoxItem = {
    detail: "A fast, smart and personal web browser",
    label: "Mozilla Firefox",
    standardName: "firefox",
    acceptName: ['firefox', 'ff', 'mozilla firefox', '火狐浏览器']
};

var ieItem = {
    detail: "This only works on Windows",
    label: "Microsoft IE",
    standardName: "iexplore",
    acceptName: ['ie','iexplore']
};

var safariItem = {
    detail: "This only works on Mac OS",
    label: "Apple Safari",
    standardName: "safari",
    acceptName: ['safari']
} 

var config =  {
    // "browsersMap": {
    //     "google chrome": ['chrome', 'google chrome', 'gc', '谷歌浏览器'],
    //     firefox: ['firefox', 'ff', 'mozile firefox', '火狐浏览器'],
    //     safari: ['safari'],
    // },
    "acceptBrowsers": [ chromeItem, firefoxItem ]
};

if ( process.platform == 'win32' ) {
    config.acceptBrowsers.push( ieItem );
} else if ( process.platform == 'darwin' ) {
    config.acceptBrowsers.push( safariItem );
}

module.exports = config;