var  data;

browser.runtime.onStartup.addListener(function () {
  settings = {
    default_priority:1,
    default_increase:1,
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
    _.omit(data.settings, "default_tick_every"),
    { tickEvery:data.settings.default_tick_every })
  );
  data.lists[list.id] = list;
  return saveData();
}
