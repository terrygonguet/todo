const List = {

  /**
   * Create a new empty list
   * @param {String} name - defaults to 'untitled'
   * @param {HTMLColor} color - defaults to a random color
   * @param {Number} default_priority - the default priority of items
   * @param {Number} default_increase - the default increase in priority over time
   * @param {Object} tickEvery - how often to increase priorities in moment.js duration format
   * @returns {List} a newly created list
   */
  create(data) {
    return _.assign({
      name:"untitled list",
      color:`rgb(${Math.randInt(75,200)},${Math.randInt(75,200)},${Math.randInt(75,200)})`,
      default_increase:1,
      default_priority:1,
      tickEvery: { days:1 },
    },
    data,
    { id:uuidv4(), items:[], createdAt:Date.now(), updatedAt:Date.now(), sorted:false });
  },

  /**
   * Create and add an item to the list then sort it
   * @param {List} list - the list to mutate
   * @param {Number} increase - the increase in priority over time
   * @param {Number} priority - the starting priority
   * @param {String} name - defaults to 'untitled'
   * @param {String} url - defaults to ''
   */
  addItem(list, data) {
    let item = _.assign({
      increase:list.default_increase,
      priority:list.default_priority,
      name:"untitled item",
      url:""
    }, data, { id:uuidv4(), done:false, createdAt:Date.now() });
    list.items.push(item);
    list.sorted = false;
    List.sort(list);
  },

  /**
   * Sorts the items of list in order of priority
   * @param {List} list
   * @returns {List} the list
   */
  sort(list) {
    if (list.sorted) return list;
    list.items.sort((a,b) => {
      if (a.done === b.done) return (a.priority > b.priority ? -1 : (b.priority > a.priority ? 1 : 0));
      else if (a.done) return 1;
      else return -1;
    });
    list.sorted = true;
    return list;
  },

  /**
   * gets the item with id in list
   * @param {List} list
   * @param {UUID} id
   * @returns {Item} the item if found
   */
  item(list, id) {
    return list.items.find(i => i.id === id);
  },

  /**
   * tick the priorities in list if necessary
   * @param {List} list
   * @returns {List} the list
   */
  tick(list) {
    let updatedAt = moment(list.updatedAt),
        tickEvery = moment.duration(list.tickEvery);
    // if we passed the time of update
    while (updatedAt.add(tickEvery).isBefore()) {
      list.items.forEach(i => i.priority += i.increase);
      list.updatedAt = updatedAt.valueOf();
    }
    return list;
  },

  /**
   * Sets an item's done value with its ID
   * @param {List} list
   * @param {UUID} itemID the item to set
   * @param {Boolean} done the value to set, null to toggle
   * @returns {List} the list
   */
  setDone(list, itemID, done=true) {
    let i = List.item(list, itemID);
    i.done = (done === null ? !i.done : done);
    list.sorted = false;
    return list;
  },

  /**
   * tick the priorities in list if necessary and sort
   * @param {List} list
   * @returns {List} the list
   */
  tickAndSort(list) {
    return List.sort(List.tick(list));
  }

};

// shortcuts
List.i = List.item;
List.ts = List.tickAndSort;

/**
 * Returns a random integer in the range.
 *
 * @param {Number} min The lower boundary of the output range
 * @param {Number} max The upper boundary of the output range
 * @returns A number in the range [min, max]
 */
Math.randInt = function (min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * @returns {UUID}
 */
function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}
