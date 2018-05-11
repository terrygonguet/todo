var bg;
browser.runtime.getBackgroundPage()
.then(win => { bg = win; buildUI(); }, console.error);

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

function buildUI() {

}
