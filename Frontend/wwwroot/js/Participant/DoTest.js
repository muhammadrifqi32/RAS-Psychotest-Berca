// Event listener saat halaman dimuatx
let isTestStarted = false; // Tandai apakah tes sudah dimulai
let isTimeUp = false; // Tandai apakah waktu sudah habis
let isTestFinished = false; // tandai untuk fungsi beforeunload jika klik tombol finish
let myTimer; // Deklarasi variabel untuk menyimpan timer
let c = 0;
let arr = [];
var myAnswer = JSON.parse(sessionStorage.getItem("myanswer"));
const currentTestId = sessionStorage.getItem("currentTestId");
var filePicture = sessionStorage.getItem("filePicture");
let valid = 0;
/*const teskit = JSON.parse(sessionStorage.getItem('teskit')) ?? alert("NOtest");
currentTestId = teskit[0];*/
sessionStorage.setItem("tesActive", currentTestId);

$(document).ready(function () {
  parseInt(currentTestId) === 6
    ? $(".card-header").hide()
    : $(".card-header").show();
  parseInt(currentTestId) === 6
    ? $(".card-title").css("float", "none").css("text-align", "center")
    : $(".card-title").css("float", "left").css("text-align", "center");
  // Panggil fungsi untuk mendapatkan waktu tes dan menginisialisasi c
  getTestTime(currentTestId);
  // Event saat pengguna mencoba untuk meninggalkan halaman
  /*window.addEventListener('beforeunload', function (e) {
        if (isTestStarted && !isTimeUp && !isTestFinished) {
            e.preventDefault();
            e.returnValue = "Apakah Anda yakin untuk meninggalkan test?";
        }
    });*/
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    const value = sessionStorage.getItem(key);
  }
  // Tombol Tes
  $("#startDoTest").on("click", function () {
    switch (currentTestId) {
      case "4":
        window.location.href = `/dotest/starttest/ist`;
        break;
      case "5":
        window.location.href = `/dotest/starttest/disc`;
        break;
      case "6":
        window.location.href = `/dotest/starttest/rmib`;
        break;
      case "7":
        $("input[name='answer']").change(function () {
          var num = $("input[name='answer']:checked").val();

          if (num) {
            $("#warningMessage1").hide();
          } else {
            $("#warningMessage1").show();
          }
          return;
        });
        var inpVal1 = checkValue("answer", "a") || checkValue("answer", "b");
        if (!inpVal1) {
          $("#warningMessage1").show();
          return;
        }
        if (!inpVal1) {
          $("#warningMessage1").show();
          return;
        } else {
          window.location.href = `/dotest/starttest/papikostick`;
          break;
        }
      case "11":
        $("input[name='answer']").change(function () {
          var num = $("input[name='answer']:checked").val();

          if (num) {
            $("#warningMessage1").hide();
          } else {
            $("#warningMessage1").show();
          }
          return;
        });
        var inpVal1 = checkValue("answer", "a") || checkValue("answer", "b");
        if (!inpVal1) {
          $("#warningMessage1").show();
          return;
        }
        if (!inpVal1) {
          $("#warningMessage1").show();
          return;
        } else {
          window.location.href = `/dotest/starttest/msdt`;
          break;
        }
      default:
        // Tindakan yang akan diambil jika currentTestId tidak cocok dengan salah satu kasus di atas.
        break;
    }
    //startTest(currentTestId);
  });
  function checkValue(inputName, expectedValue) {
    var inputValue = $("input[name='" + inputName + "']:checked").val() || "";
    return inputValue.toLowerCase() === expectedValue;
  }
  $("#btnBackTest").on("click", function () {
    moveToPreviousQuestion();
  });

  $("#btnNextTest").on("click", function () {
    moveToNextQuestion();
  });

  $("#btnFinishTest").on("click", function () {
    isTestFinished = true; // Set variabel menjadi true agar tidak ada allert beforeunload leave page
    finishTest();
  });

  $(document).on("change", ".boxed-check-input[type='radio']", function () {
    const selectedValue = $(this).val();
    const groupName = $(this).attr("name");
    const numbers = groupName.match(/\d+/g);
    myAnswer[numbers] = selectedValue;

    sessionStorage.setItem("myanswer", JSON.stringify(myAnswer));
    updateQuestionButtonColors();
  });
});

function getTestTime(currentTestId) {
  $.ajax({
    url: ApiUrl + `/api/Test/dotest/${currentTestId}`,
    method: "GET",
    dataType: "json",
      success: function (result) {
      const testTime = result.data.testTime; // Mengambil waktu tes dari respons API
      initializeTestTimer(testTime); // Panggil fungsi untuk menginisialisasi timer
    },
    error: function () {},
  });
}

function initializeTestTimer(testTime) {
    const idTes = sessionStorage.getItem("currentTestId");
    // Inisialisasi timer dengan waktu tes yang didapatkan dari API
    c = sessionStorage.getItem("waktuTes" + idTes);
  if (!c) {
    c = testTime * 60;
      sessionStorage.setItem("waktuTes" + idTes, c);
  }
    /*c = 10;*/
  const seconds = c % 60;
  const secondsInMinutes = (c - seconds) / 60;
  const minutes = secondsInMinutes % 60;
  const hours = (secondsInMinutes - minutes) / 60;
  document.getElementById("timeTest").innerHTML =
    (hours !== 0 ? hours + "h:" : "") + minutes + "m:" + seconds + "s";
}

function countDownTimer(setId) {
    function myClock() {
    if (isTimeUp) {
        sessionStorage.removeItem("waktuTes" + setId);
      clearInterval(myTimer); // Jika waktu habis, hentikan countdown timer
      valid += 1;
      forceFinish(1);
      return;
    }

    if (isTestStarted) {
      --c;
        sessionStorage.setItem("waktuTes" + setId, c);

      var seconds = c % 60; // Seconds that cannot be written in minutes
      var secondsInMinutes = (c - seconds) / 60; // Gives the seconds that COULD be given in minutes
      var minutes = secondsInMinutes % 60; // Minutes that cannot be written in hours
      var hours = (secondsInMinutes - minutes) / 60;
      // Display the result in the element with id="timeTest"
      document.getElementById("timeTest").innerHTML =
        (hours !== 0 ? hours + "h:" : "") + minutes + "m:" + seconds + "s ";

      if (c == 0) {
        isTimeUp = true;
      }
    }
  }
  myTimer = setInterval(myClock, 1000); // Mulai countdown timer
}

// Fungsi untuk menampilkan tes berdasarkan jenisnya tipe test
function displayTest() {
  // Cek currentTestId dan tampilkan script display berdasarkan jenis test
  switch (currentTestId) {
    case "4":
      //ist
      displayTestIST(testData);
      break;
    case "5":
      //disc
      displayTestDISC(testData);
      break;
    case "6":
      //rmib
      displayTestRMIB(testData);
      break;
    case "7":
      //papikostick
      displayTestPapiKostick(testData);
      break;
    case "11":
      //msdt
      displayTestMSDT(testData);
      break;
    default:
      // Tindakan yang akan diambil jika currentTestId tidak cocok dengan salah satu kasus di atas.
      break;
  }
}

// Fungsi untuk memulai tes
function startTest(testId) {
  if (!isTestStarted) {
    isTestStarted = true; // Tes sudah dimulai
    // Tampilkan animasi loading saat data sedang dimuat
    $("#loading").show();

    // Mengambil data tes dari API JSON
    $.ajax({
      url: ApiUrl + `/api/Question/GetQuestionByTest?id=${testId}`,
      method: "GET",
      dataType: "json",
      success: function (data) {
        testData = data;
        totalQuestions = testData.data.length;
        currentQuestionIndex = 0;
        //Tampilkan Isi Test
        if (!sessionStorage.getItem("myanswer")) {
          arr = Array(totalQuestions).fill("0");
          sessionStorage.setItem("myanswer", JSON.stringify(arr));
        }
        displayTest();

        //zahra 25-08-2023
        buildQuestionButtons();

        // Sembunyikan animasi loading setelah data berhasil dimuat dan siap untuk dikerjakan
        $("#loading").hide();
        if (!sessionStorage.getItem("tabChange")) {
          sessionStorage.setItem("tabChange", 0);
          }
          countDownTimer(testId);
      },
      error: function () {
        alert("Gagal mengambil data tes.");
        // Sembunyikan animasi loading jika terjadi error
        $("#loading").hide();
      },
    });
  }
}

// Fungsi untuk pindah ke pertanyaan sebelumnya
function moveToPreviousQuestion() {
  currentQuestionIndex--;
  displayTest();

  //zahra 25-08-2023
  updateQuestionButtonColors();
}

// Fungsi untuk pindah ke pertanyaan selanjutnya
function moveToNextQuestion() {
  currentQuestionIndex++;
  displayTest();

  //zahra 25-08-2023
  updateQuestionButtonColors();
  //buildQuestionButtons();
}

// Fungsi untuk menyelesaikan tes
function finishTest() {
  //zahra 25-08-2023
  updateQuestionButtonColors();
  let tesActive = parseInt(sessionStorage.getItem("tesActive"));
  let finisAnswer = JSON.parse(sessionStorage.getItem("myanswer"));
  if (tesActive !== 6) {
    for (let i = 0; i < finisAnswer.length; i++) {
      if (finisAnswer[i] === "0" || finisAnswer[i] === 0) {
        Swal.fire("Jawaban Nomor " + (parseInt(i) + 1) + " Kosong");
        return;
      }
    }
    Swal.fire({
      title: "Apakah Kamu Yakin?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4CAF50",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Saya Yakin!",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        $("#loading").show();

        //do something if yes
        // Lakukan sesuatu ketika tes selesai
        //do post jawaban

        if (tesActive === 7) {
          $.ajax({
            url: ApiUrl + "/api/Participant/GetResultTestPAPI",
            method: "POST", // Change to POST method
            contentType: "application/json", // Set content type
            data: JSON.stringify(finisAnswer), // Send the data in the request body
            dataType: "json",
            success: function (result) {
              let ans = finisAnswer.toString();
              var flag = ",SAFE";
              var tabChange = sessionStorage.getItem("tabChange");
              if (tabChange > 0 || !tabChange) {
                flag = ",VIOLATION" + "/" + tabChange;
              }
              var newScore = (result.data += flag);
              var stored = {
                answer: ans,
                final_score: newScore.toString(),
                test_id: tesActive,
                participant_id: parseInt(
                  sessionStorage.getItem("participantId")
                ),
                capture: filePicture,
                status: true,
              };
              $("#loading").hide();

              storeAnswer(stored);
              sessionStorage.removeItem("myanswer");
              sessionStorage.removeItem("tabChange");
                sessionStorage.removeItem("waktuTes" + tesActive);

              return;
            },
            error: function () {
              $("#loading").hide();
            },
          });
        } else if (tesActive === 11) {
          $.ajax({
            url: ApiUrl + "/api/Participant/GetResultTestMSDT",
            method: "POST", // Change to POST method
            contentType: "application/json", // Set content type
            data: JSON.stringify(finisAnswer), // Send the data in the request body
            dataType: "json",
            success: function (result) {
              $("#loading").hide();

              let ans = finisAnswer.toString();
              var flag = ",SAFE";
              var tabChange = sessionStorage.getItem("tabChange");
              if (tabChange > 0 || !tabChange) {
                flag = ",VIOLATION" + "/" + tabChange;
              }
              var newScore = (result.data += flag);
              var stored = {
                answer: ans,
                final_score: newScore.toString(),
                test_id: tesActive,
                participant_id: parseInt(
                  sessionStorage.getItem("participantId")
                ),
                capture: filePicture,
                status: true,
              };
              storeAnswer(stored);
              sessionStorage.removeItem("myanswer");
              sessionStorage.removeItem("tabChange");
                sessionStorage.removeItem("waktuTes" + tesActive);

              return;
            },
            error: function (err) {
              $("#loading").hide();
            },
          });
        }
        return;

        //memindahkan page ke page finish
      }
      //Swal.fire('Changes are not saved', '', 'info')
    });
  }
}
function forceFinish(status) {
  /*status :
        1 : times up,
        2 : foul 
    */
  let finisAnswer = JSON.parse(sessionStorage.getItem("myanswer"));
  let tesActive = parseInt(sessionStorage.getItem("tesActive"));
  let ans = "";
  switch (status) {
    case 1:
      if (tesActive === 11) {
        $("#loading").show();

        $.ajax({
          url: ApiUrl + "/api/Participant/GetResultTestMSDT",
          method: "POST", // Change to POST method
          contentType: "application/json", // Set content type
          data: JSON.stringify(finisAnswer), // Send the data in the request body
          dataType: "json",
          success: function (result) {
            ans = finisAnswer.toString();
          },
          error: function (err) {
            if (err.responseJSON.data === "0") {
              ans = "invalid";
            } else {
              ans = "error";
            }
          },
        });
      } else if (tesActive === 7) {
        $("#loading").show();
        $.ajax({
          url: ApiUrl + "/api/Participant/GetResultTestPAPI",
          method: "POST", // Change to POST method
          contentType: "application/json", // Set content type
          data: JSON.stringify(finisAnswer), // Send the data in the request body
          dataType: "json",
          success: function (result) {
            ans = finisAnswer.toString();
          },
          error: function (err) {
            if (err.responseJSON.data === "0") {
              ans = "invalid";
            } else {
              ans = "error";
            }
          },
        });
      } else if (tesActive === 6) {
        $("#loading").show();

        var arrayJawaban = [];
        var kosong = "0";
        for (var i = 0; i < 9; i++) {
          var ind = [];

          for (var j = 0; j < 12; j++) {
            ind.push(0);
          }
          arrayJawaban.push(ind.toString());
        }
        $.ajax({
          url: ApiUrl + "/api/Participant/GetResultTestRMIB",
          method: "POST", // Change to POST method
          contentType: "application/json", // Set content type
          data: JSON.stringify(arrayJawaban), // Send the data in the request body
          dataType: "json",
          success: function (result) {
            ans = result.data;
          },
          error: function (err) {
            if (err.responseJSON.data === "0") {
              ans = "invalid";
            } else {
              ans = "error";
            }
          },
        });
      }
      break;
    default:
      ans = "";
  }
  $("#loading").hide();
  var stored = {
    answer: finisAnswer.toString(),
    final_score: ans.toUpperCase(),
    test_id: tesActive,
    participant_id: parseInt(sessionStorage.getItem("participantId")),
    capture: filePicture,
    status: true,
  };
  valid = 0;
  sessionStorage.removeItem("myanswer");
  window.sessionStorage.removeItem("tabChange");
    sessionStorage.removeItem("waktuTes" + tesActive);

  storeAnswer(stored);
  return;
}
//zahra 25-08-2023
function buildQuestionButtons() {
  const questionList = $(".question-list");

  for (let i = 0; i < totalQuestions; i++) {
    const buttonClass =
      myAnswer[i] !== "0"
        ? "question-button answered-button"
        : "question-button unanswered-button";
    const button = $("<button>", {
      class: buttonClass,
      text: i + 1,
      click: function () {
        currentQuestionIndex = i;
        displayTest();
        updateQuestionButtonColors(); // Memanggil fungsi untuk memperbarui warna tombol
      },
    });

    questionList.append(button);
  }
}

// Fungsi untuk memperbarui warna tombol nomor soal
function updateQuestionButtonColors() {
  $(".question-button").each(function (index) {
    const answer = myAnswer[index];

    if (answer !== "0") {
      $(this).removeClass("unanswered-button").addClass("answered-button");
    } else if (answer === "0") {
      $(this).removeClass("answered-button").addClass("unanswered-button");
    }
  });
}

function storeAnswer(data) {
  $("#loading").show();
  $.ajax({
    type: "PUT",
    url: ApiUrl + "/api/ParticipantAnswer/StoredAnswer",
    data: JSON.stringify(data),
    contentType: "application/json; charset=utf-8",
    //token jwt
    headers: {
      Authorization: "Bearer " + sessionStorage.getItem("token"),
    },
    success: function (result) {
      $("#loading").hide();
      window.location = "/user/page2";
    },
    error: function (errorMessage) {
      $("#loading").hide();
      Swal.fire(errorMessage.responseText, "", "error");
    },
  });
}

//violation tracker

function checkTabChange() {
  document.addEventListener("visibilitychange", function () {
    var violationCount = parseInt(sessionStorage.getItem("tabChange"));
    if (document.hidden) {
      violationCount += 1;
      window.addEventListener("beforeunload", function (e) {
        if (sessionStorage.getItem("tabChange") !== 0) {
          violationCount--;
          sessionStorage.setItem("tabChange", violationCount);
        }
      });
      sessionStorage.setItem("tabChange", violationCount);
      showViolationAlert(
        "Anda Terdeteksi Membuka Tab lain " + violationCount + "x !",
        "<b>Harap Untuk Fokus Mengerjakan Tes</b>"
      );
    }
  });
}

function showViolationAlert(message, foot) {
  Swal.fire({
    title: "Peringatan!",
    text: message,
    icon: "warning",
    footer: foot,
    confirmButtonText: "OK",
  });
}
