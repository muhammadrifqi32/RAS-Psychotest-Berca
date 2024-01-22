cameraActive = false;

var countDownTimer = null;
var duration = 5;

$(document).ready(function () {
  const lastTestCompleted = sessionStorage.getItem("lastTestCompleted");
  if (lastTestCompleted === "true") {
    // test complated semua = do nothing
    $("#redirectTest").show();
  } else {
    // test belum selesai
    $("#redirectTest").hide();
    startTime(duration);
  }
});

function startTime(durations) {
  const mess = `<a href="#" class="h3" id="red"><b>Redirect Now ......</b></a>`;
  countDownTimer = setInterval(function () {
    if (durations !== 0) {
      $("#countdown").text(durations);
      durations--;
    } else {
      clearInterval(countDownTimer);
      $("#red").parent().html(mess);
      // Arahkan pengguna ke halaman page2.cshtml setelah waktu tertentu
      setTimeout(function () {
        window.location.href = "/user/page2";
      }, 1000); // Ubah 1000 menjadi waktu dalam milidetik sesuai kebutuhan
    }
  }, 1000);
}
