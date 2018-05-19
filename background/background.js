var  _data;

Object.defineProperty(window, "data", {
  get() {
    console.log('sorting');
    _.values(_data.lists).forEach(List.ts);
    // to go around the dead object problem
    return (_data = JSON.parse(JSON.stringify(_data)));
  },
  set(val) {
    // to go around the dead object problem
    _data = JSON.parse(JSON.stringify(val));
  }
});
Object.defineProperty(window, "selected", {
  get() {
    return _data.lists[_data.selected];
  },
  set(val) {
    if (typeof val === 'object')
      _data.selected = val.id;
    else
      _data.selected = val;
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
  title: "Add selection to TODO list",
  onclick(e, tab) {
    List.addItem(window.selected, { name:e.selectionText, url: _data.settings.include_URL_with_selection ? e.pageUrl : '' });
  },
  contexts: ["selection"]
});

browser.storage.sync.get()
.then(function (values) {
  data = values;
  if (!values.settings || !values.lists) {
    let settings = {
      default_priority:1,
      default_increase:1,
      include_URL_with_selection: true,
      default_tick_every: { days:1 },
    }
    saveData({ settings, lists: values.lists || {} }, true);
  }
}, console.error);

function saveData(newData=data, clear=false) {
  if (typeof newData === "string") newData = JSON.parse(newData);
  return ( clear ? browser.storage.sync.clear() : Promise.resolve())
  .then(() => {
    data = newData;
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
