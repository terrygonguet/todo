var bg;
browser.runtime.getBackgroundPage()
.then(win => { bg = win; buildUI(); }, console.error);

$("#lblSettings").click(e => browser.runtime.openOptionsPage());
$("#lblNew").click(e => {
  $("#frmNew").show();
  $("#txbName").focus();
});
$("#frmNew").submit(makeNew);
function makeNew(e) {
  e.preventDefault();
  let name = $("#txbName").val();
  if (!name) {
    let msg = $("<p>").text("Invalid").appendTo(this);
    setTimeout(function () {
      msg.detach();
    }, 2000);
  } else {
    $(this).hide();
    bg.createNewList(name)
    .then(buildUI, console.error);
  }
  return false;
}

$('#ddlSelected')
.change(function() {
  bg.data.selected = $(this).val();
  bg.saveData().then(buildUI);
});

function buildUI() {
  let table = $('#tblItems').empty();
  let selected = bg.data.lists[bg.data.selected];
  // if no selected yet we pick the first at random
  if (!selected) {
    selected = _.values(bg.data.lists)[0];
    if (!selected) return;
    bg.data.selected = selected.id;
    bg.saveData();
  }
  $('body').css('background', selected.color);

  let ddlSelected = $('#ddlSelected').show().empty();
  for (let list of _.values(bg.data.lists)) {
    ddlSelected.append(`<option value="${list.id}" ${list.id === selected.id ? 'selected' : ''}>${list.name}</option>`);
  }

  let previousDone = null;
  for (let item of selected.items) {
    if (previousDone !== null && previousDone !== item.done)
      $('<tr class="separator">').appendTo(table);
    $(`<tr>`)
      .append(`<td>${item.name}</td>`)
      .append(`<td><img class="toggleItem" data-id="${item.id}" src="../resources/${item.done ? 'reset' : 'checked'}.png"/></td>`)
      .appendTo(table);
    previousDone = item.done;
  }
  if (!selected.items.length)
    $(`<tr>`)
      .append(`<td colspan=2 class="hint">Right click in pages to create items</td>`)
      .appendTo(table);
  else
    $('.toggleItem').click(toggleItem);

}

function toggleItem(e) {
  let id = $(this).attr('data-id');
  let item = bg.data.lists[bg.data.selected].items.find(i => i.id === id);
  item.done = !item.done;
  bg.saveData().then(buildUI);
}
