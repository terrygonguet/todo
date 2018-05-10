var  lists, settings;

browser.runtime.onStartup.addListener(function () {
  settings = {
    default_priority:1,
    default_increase:1,
  }
  browser.storage.sync.set({ settings, lists: {} });
});

let saveHandler = {
  get: function (project, method) {
    if (method.includes && method.includes("Session")) {
      setTimeout(function () {
        browser.storage.sync.set(project.toJSON());
      }, 50);
    }
    return project[method];
  }
}

browser.storage.sync.get()
.then(function (values) {
  settings = values.settings;
  lists = {};
}, console.error);

function exportData() {
  var data = { settings, lists:{} };
  _.values(lists).forEach(l => _.assign(data.lists, l.toJSON()));
  return data;
}

function importData(data) {
  return browser.storage.sync.clear()
  .then(() => {
    return browser.storage.sync.set(data);
  }, console.error)
  .then(() => {
    settings = data.settings;
    lists = data.lists;
  }, console.error);
}
