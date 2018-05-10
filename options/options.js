var bg;
browser.runtime.getBackgroundPage()
.then(win => { bg = win; buildUI(); }, console.error);

$("#btnExport").click(function () {
  $("#txtData").show().val(JSON.stringify(bg.exportData(), null, 2));
});
$("#btnImport").click(function () {
  let text = $("#txtData").val();
  if (!text) {
    $("#txtData").show();
  } else {
    if (confirm("This will override all your current data !!!")) {
      let data = JSON.parse(text);
      bg.importData(data)
      .then(buildUI, alert)
      .then(() => $("#txtData").empty().hide());
    }
  }
});

function buildUI() {

}
