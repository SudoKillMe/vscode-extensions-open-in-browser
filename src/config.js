
var chromeItem = {
    detail: "detail",
    label: "Google Chrome",
    standardName: "Google Chrome",
    acceptName: ['chrome', 'google chrome', 'gc', '谷歌浏览器']
};
var firefoxItem = {
    detail: "detail",
    label: "Mozilla Firefox",
    standardName: "Firefox",
    acceptName: ['firefox', 'ff', 'mozile firefox', '火狐浏览器']
};

var ieItem = {
    detail: "This only works on Windows",
    label: "Microsoft IE",
    standardName: "IE",
    acceptName: ['ie']
};

var safariItem = {
    detail: "This only works on Mac OS",
    label: "Apple Safari",
    standardName: "Safari",
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