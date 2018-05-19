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
  buildUI();
});

$('#btnNewItem').click(function () {
  let name = $('#txbNewItemName').val();
  // if form already displayed
  if (name) {
    // let url = $('#txbNewItemURL:checked').length > 0;
    let priority = $('#txbNewItemPriority').val();
    List.addItem(bg.selected, { name, priority });
    buildUI();
    $('#txbNewItemName').val('');
    $('.newItemFields').hide();
  } else {
    $('.newItemFields').show();
    $('#txbNewItemPriority').val(bg.selected.default_priority);
  }
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
  $('body').css('background', bg.selected.color);

  let ddlSelected = $('#ddlSelected').show().empty();
  for (let list of _.values(bg.data.lists)) {
    ddlSelected.append(`<option value="${list.id}" ${list.id === bg.selected.id ? 'selected' : ''}>${list.name}</option>`);
  }

  let previousDone = null;
  for (let item of bg.selected.items) {
    if (previousDone !== null && previousDone !== item.done)
      $('<tr class="separator"><th colspan=2></th></tr>').appendTo(table);
    $(`<tr data-href="${item.url}" class="${item.url ? 'clickableRow' : ''}" title="${item.url}">`)
      .append(`<td>${item.name.slice(0,50) + (item.name.length > 50 ? '...' : '')}</td>`)
      .append(`<td><img class="toggleItem" data-id="${item.id}" src="../resources/${item.done ? 'check' : 'check-box-empty'}.png"/></td>`)
      .appendTo(table);
    previousDone = item.done;
  }
  if (!bg.selected.items.length)
    $(`<tr>`)
      .append(`<td colspan=2 class="hint">Right click in pages or open settings to create items</td>`)
      .appendTo(table);
  else
    $('.toggleItem').click(toggleItem);

  $('.clickableRow').click(function (e) {
    window.open($(this).data('href'));
  });

}

function toggleItem(e) {
  let id = $(this).data('id');
  List.setDone(bg.selected, id, null);
  buildUI();
}

window.addEventListener('unload', () => {
  bg.saveData();
});
