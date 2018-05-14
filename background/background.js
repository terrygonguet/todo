var  _data;

Object.defineProperty(window, "data", {
  get() {
    _.values(_data.lists).forEach(List.ts);
    return _data;
  },
  set(val) {
    _data = val;
  }
});
Object.defineProperty(window, "selected", {
  get() {
    return _data.lists[_data.selected];
  },
  set(val) {
    _data.selected = val.id;
  }
});

browser.contextMenus.create({
  id: "add-link",
  title: "Add to TODO list",
  onclick(e, tab) {
    List.addItem(window.selected, { name:e.linkText, url:e.linkUrl });
  },
  contexts: ["link"]
});
browser.contextMenus.create({
  id: "add-page",
  title: "Add page to TODO list",
  onclick(e, tab) {
    List.addItem(window.selected, { name:tab.title, url:e.pageUrl });
  },
  contexts: ["page"]
});
browser.contextMenus.create({
  id: "add-selection",
  title: "Add to TODO list",
  onclick(e, tab) {
    List.addItem(window.selected, { name:e.selectionText, url: _data.settings.include_URL_with_selection ? e.pageUrl : '' });
  },
  contexts: ["selection"]
});

browser.runtime.onStartup.addListener(function () {
  settings = {
    default_priority:1,
    default_increase:1,
    include_URL_with_selection: true,
    default_tick_every: { days:1 },
  }
  browser.storage.sync.set({ settings, lists: {} });
});

browser.storage.sync.get()
.then(function (values) {
  data = values;
}, console.error);

function saveData(newData=data, clear=false) {
  if (typeof newData === "string") newData = JSON.parse(newData);
  return ( clear ? browser.storage.sync.clear() : Promise.resolve())
  .then(() => {
    data = _.cloneDeep(newData);
    return browser.storage.sync.set(newData);
  }, console.error);
}

function createNewList(name, color) {
  let base = {};
  name && (base.name = name);
  color && (base.color = color);
  let list = List.create(_.assign(
    base,
    _.pick(data.settings, ["default_priority", "default_increase"]),
    { tickEvery:data.settings.default_tick_every })
  );
  data.lists[list.id] = list;
  return saveData();
}
