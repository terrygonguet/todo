var bg;
browser.runtime.getBackgroundPage()
.then(win => { bg = win; buildUI(); }, console.error);
