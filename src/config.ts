import { QuickPickItem } from "vscode";

interface PickItem extends QuickPickItem {
  [propName: string]: any;
}

const platform = process.platform;

const chromeItem: PickItem = {
  description: "Windows, Mac, Linux",
  detail: "A fast, secure, and free web browser built for the modern web",
  label: "Google Chrome",
  standardName: platform === 'win32' 
                  ? 'chrome' 
                  : (
                    platform === 'darwin' 
                      ? 'google chrome' 
                      : 'google-chrome'
                    ),
  acceptName: ['chrome', 'google chrome', 'google-chrome', 'gc', '谷歌浏览器']
};

const canaryItem: PickItem = {
  description: "Windows, Mac",
  label: "Google Chrome Canary",
  standardName: platform === 'darwin' ? 'Google Chrome Canary'
    : `${process.env.LOCALAPPDATA}\\Google\\Chrome SxS\\Application\\chrome.exe`,
  acceptName: ['canary', 'chrome canary', 'google chrome canary']
};

const chromiumItem: PickItem = {
  description: "Mac, Linux",
  detail: "A fast, secure, and free web browser built for the modern web",
  label: "Google Chromium",
  standardName: platform === 'darwin' ? 'Chromium' : 'chromium',
  acceptName: ['chromium', 'chromium-browser']
};
const firefoxItem: PickItem = {
  description: "Windows, Mac, Linux",
  detail: "A fast, smart and personal web browser",
  label: "Mozilla Firefox",
  standardName: "firefox",
  acceptName: ['firefox', 'ff', 'mozilla firefox', '火狐浏览器']
};
const firefoxDeveloperItem: PickItem = {
  description: "Mac",
  detail: "A fast, smart and personal web browser",
  label: "Mozilla Firefox Developer Edition",
  standardName: "Firefox Developer Edition",
  acceptName: ['firefox developer', 'fde', 'firefox developer edition']
};

const ieItem: PickItem = {
  description: "Windows",
  detail: "A slightly outdated browser",
  label: "Microsoft IE",
  standardName: "iexplore",
  acceptName: ['ie', 'iexplore']
};
const edgeItem: PickItem = {
  description: "Windows, Mac, Linux",
  detail: "A modern web browser",
  label: "Microsoft Edge",
  standardName: platform === 'darwin' ? 'Microsoft Edge'
    : (platform === 'win32' ? 'msedge' : 'microsoft-edge'),
  acceptName: ['edge', 'msedge', 'microsoftedge', 'microsoft edge', 'microsoft-edge']
};

const safariItem: PickItem = {
  description: "Mac",
  detail: "A fast, efficient browser on Mac",
  label: "Apple Safari",
  standardName: "safari",
  acceptName: ['safari']
};

const operaItem: PickItem = {
  description: "Windows, Mac",
  detail: 'A fast, secure, easy-to-use browser',
  label: 'Opera',
  standardName: 'opera',
  acceptName: ['opera']
};

const braveItem: PickItem = {
  description: "Windows, Mac, Linux",
  label: "Brave",
  standardName: platform === 'darwin' ? 'Brave Browser'
    : (platform === 'win32' ? 'brave' : 'brave-browser'),
  acceptName: ['brave', 'brave browser', 'brave-browser']
};

const browsers = [chromeItem, firefoxItem, operaItem, braveItem];

if (process.platform === 'win32') {
  browsers.push(canaryItem);
  browsers.push(ieItem);
  browsers.push(edgeItem);
} else if (process.platform === 'darwin') {
  browsers.push(canaryItem);
  browsers.push(safariItem);
  browsers.push(chromiumItem);
  browsers.push(firefoxDeveloperItem);
  browsers.push(edgeItem);
} else if (process.platform === 'linux') {
  browsers.push(chromiumItem);
  browsers.push(edgeItem);
}

export default {
  browsers: browsers,
  app: 'open-in-browser'
};