var bg, selected, id;
browser.runtime.getBackgroundPage()
.then(win => {  bg = win;  buildUI(); }, console.error);

$('#ddlSelected')
.change(function() {
  id = $(this).val();
  buildUI();
});

$("#btnExport").click(function () {
  $("#txtData").show().val(JSON.stringify(bg.data, null, 2));
});
$("#btnImport").click(function () {
  let text = $("#txtData").val();
  if (!text) {
    $("#txtData").show();
  } else {
    if (confirm("This will override all your current data !!!")) {
      bg.saveData(text, true)
      .then(buildUI, alert)
      .then(() => $("#txtData").empty().hide());
    }
  }
});

$('#txbName').change(e => {
  selected.name = $(e.target).val();
});
$('#txbColor').change(e => {
  selected.color = $(e.target).val();
});
$('#btnNewList').click(e => {
  bg.createNewList()
  .then(buildUI, console.error);
});
$('#btnRemoveList').click(e => {
  if (confirm(`Do you really want to remove ${selected.name} ?`)) {
    delete bg.data.lists[id];
    id = selected = null;
    bg.saveData()
    .then(buildUI, console.error);
  }
});
$('#btnSaveList').click(e => {
  bg.data.lists[selected.id] = selected;
  id = selected = null;
  bg.saveData()
  .then(buildUI, console.error);
});

$('#btnNewItem').click(e => {
  List.addItem(selected, {});
  buildUI();
});

function buildUI() {
  let table = $('#tblItems').empty();
  // if no selected yet we pick the first at random
  if (!bg.selected) {
    try {
      bg.selected = _.values(bg.data.lists)[0];
    } catch (e) {
      return;
    }
  }

  if (!id) id = bg.data.selected;
  if (!selected || selected.id !== id)
    selected = _.cloneDeep(bg.data.lists[id]); // copy the selected list to make local changes

  let ddlSelected = $('#ddlSelected').show().empty();
  for (let list of _.values(bg.data.lists)) {
    ddlSelected.append(`<option value="${list.id}" ${list.id === id ? 'selected' : ''}>${list.name}</option>`);
  }

  $("#txbName").val(selected.name);
  $("#txbColor").val(selected.color);

  for (let item of selected.items) {
    $(`<tr data-id="${item.id}">`)
      .append(`<td><input class="txbItemName" value="${item.name}" placeholder="Name" data-prop="name" /></td>`)
      .append(`<td><input class="txbItemUrl" value="${item.url}" placeholder="URL" data-prop="url" /></td>`)
      .append(`<td>Priority:<input class="txbItemPriority" value="${item.priority}" type="number" data-prop="priority" /></td>`)
      .append(`<td>increase:<input class="txbItemIncrease" value="${item.increase}" type="number" data-prop="increase" /></td>`)
      .append(`<td><img src="../resources/${item.done ? 'check' : 'check-box-empty'}.png" /></td>`)
      .append(`<td><img src="../resources/trash.png" class="btnRemoveItem" title="Remove Item" /></td>`)
      .appendTo(table);
  }

  $('.btnRemoveItem').click(e => {
    let itemID = $(e.target).parents('tr').data('id');
    List.removeItem(selected, itemID);
    buildUI();
  });

  $('.txbItemName, .txbItemUrl, .txbItemPriority, .txbItemIncrease').change(e => {
    let el = $(e.target);
    let itemID = el.parents('tr').data('id');
    let propName = el.data('prop');
    let val = $(e.target).val();
    List.i(selected, itemID)[propName] = (el.attr('type') == 'number' ? Number(val) : val);
  });
}
