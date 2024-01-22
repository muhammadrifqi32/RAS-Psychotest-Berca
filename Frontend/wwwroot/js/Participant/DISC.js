// Inisialisasi objek untuk menyimpan jawaban pengguna
var jawabanPengguna =
  JSON.parse(sessionStorage.getItem("jawabanPengguna")) || [];
var totalQuestion;
const testId = sessionStorage.getItem("currentTestId");
let isTestStarted = false; // Tandai apakah tes sudah dimulai
let isTimeUp = false; // Tandai apakah waktu sudah habis
let isTestFinished = false; // tandai untuk fungsi beforeunload jika klik tombol finish
var currentTest;

function simpanJawaban(currentNomor, jawaban) {
  //sessionStorage.removeItem('jawabanPengguna');
  // Inisialisasi jawabanPengguna jika belum ada
  if (!sessionStorage.getItem("jawabanPengguna")) {
    const initialAnswer = Array.from({ length: totalQuestion }, () => ",");
    sessionStorage.setItem("jawabanPengguna", JSON.stringify(initialAnswer));
  }

  // Mendapatkan jawabanPengguna saat ini dari sessionStorage
  var jawabanPengguna = JSON.parse(sessionStorage.getItem("jawabanPengguna"));

  for (var key in jawaban) {
    var mostValue = jawaban[key].most || "";
    var leastValue = jawaban[key].least || "";

    if (mostValue.length > 0 || leastValue.length > 0) {
      jawabanPengguna[currentNomor - 1] = mostValue + "," + leastValue;
    }
  }
  sessionStorage.setItem("jawabanPengguna", JSON.stringify(jawabanPengguna));
}

const dataUjian = {
  totalSoal: 24,
};

$(document).ready(function () {
  if (testId === "4") {
    currentTest = "ist";
  } else if (testId === "5") {
    currentTest = "disc";
  } else if (testId === "6") {
    currentTest = "rmib";
  } else if (testId === "7") {
    currentTest = "papikostick";
  } else if (testId === "11") {
    currentTest = "msdt";
  }
  // Periksa apakah tes yang seharusnya diakses sesuai dengan tes pada URL
  if (testId !== "5") {
    // Jika tidak sesuai, arahkan kembali ke halaman instruksi atau tampilkan pesan kesalahan
    window.location.href = `/dotest/instruction/${currentTest}`;
  }

  /*$(window).on('beforeunload', function () {
        // Cek apakah ada jawaban yang belum disimpan
        if (isTestStarted && !isTimeUp && !isTestFinished) {
            // Tampilkan pesan konfirmasi kepada pengguna
            return 'Apakah Anda yakin untuk meninggalkan test?';
        }
    });*/
  // Panggil fungsi saat tes dimulai
  const currentUrl = window.location.pathname;
  if (currentUrl.startsWith("/dotest/starttest/disc/subtes")) {
    isTestStarted = true;
    // Parse nomor subtes dari URL
    const subtestMatch = currentUrl.match(
      /\/dotest\/starttest\/disc\/subtes(\d+)/
    );
    const isActiveSubtest = sessionStorage.getItem("indexSubtest");
    var indexSubtest = "0000";
    if (subtestMatch[1].toString() === isActiveSubtest.toString()) {
      indexSubtest = parseInt(subtestMatch[1]);
    }
    $("#numSubTest").text("Halaman " + indexSubtest + "");
    // Panggil displaytest hanya jika URL sesuai
    displaytest(testId, indexSubtest);
  }

  $("#startTest").click(function () {
    if (validateOptions()) {
      const isActiveSubtest = sessionStorage.getItem("indexSubtest");
      var targetUrl = `/dotest/starttest/disc/subtes${isActiveSubtest}`;

      window.location.href = targetUrl;
    }
  });
  //button back(finish test clicked)
  $("#endSubtest").click(function () {
    sessionStorage.removeItem("indexSubtest");
    sessionStorage.removeItem("filePicture");
    sessionStorage.removeItem("remainingTime");
    return (window.location.href = `/user/page2`);
  });
});

function getTestTimeAndTotalQuestion(testId) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: ApiUrl + `/api/Test/dotest/${testId}`,
      method: "GET",
      dataType: "json",
      success: function (result) {
        const testTime = result.data.testTime; // Mengambil waktu tes dari respons API
        const totalQuestions = result.data.totalQuestion; // Mengambil total pertanyaan dari respons API
        totalQuestion = totalQuestions; // Simpan nilai totalQuestions dalam variabel totalQuestion
        resolve({ testTime, totalQuestions });
      },
      error: function () {
        reject("Gagal mengambil waktu tes.");
      },
    });
  });
}

function countdownTImer(testTime) {
  const isActiveSubtest = sessionStorage.getItem("indexSubtest");
  // Cek apakah waktu tersisa ada di sessionStorage
  var remainingTime = sessionStorage.getItem("remainingTime");

  // Jika waktu tersisa belum ada, gunakan testTime
  if (remainingTime === null) {
    remainingTime = testTime * 60;
  }

  /*var time = 3;*/
  //var time = dataUjian.subtest[isActiveSubtest - 1].subtesDurations[0];
  var x = setInterval(function () {
    remainingTime -= 1;
    sessionStorage.setItem("remainingTime", remainingTime); // Simpan waktu tersisa ke sessionStorage
    const seconds = remainingTime % 60;
    const secondsInMinutes = (remainingTime - seconds) / 60;
    const minutes = secondsInMinutes % 60;

    document.getElementById("timeTest").innerHTML =
      minutes + "m:" + seconds + "s";

    // If the count down is finished, write some text
    if (remainingTime < 0) {
      isTimeUp = true;
      forceFinish(1, isActiveSubtest);

      clearInterval(x);
      $("#timeTest").text("done");
      parseInt(isActiveSubtest) === 4
        ? document.getElementById("finishButton").click()
        : document.getElementById("nextButton").click();
    }
  }, 1000);
}

function displaytest(testId, indexSubtest) {
  $("loading").show();
  if (indexSubtest === "0000") {
    return (window.location.href = `/dotest/starttest/disc/subtes${sessionStorage.getItem(
      "indexSubtest"
    )}`);
  }
  checkTabChange(indexSubtest);

  // inisialisasi untuk hit API perPagging berdasarkan indexSubtes
  const itemsPerPage = 6;
  let currentNumber;

  if (indexSubtest >= 1 && indexSubtest <= 4) {
    currentNumber = 1 + (indexSubtest - 1) * itemsPerPage;
  } else {
    return;
  }

  // Buat URL dengan testId yang disediakan //test id = disc (5)
  var url =
    ApiUrl +
    `/api/Question/GetQuestionByTesto?idTest=5&currentNumber=${currentNumber}&pageSize=${itemsPerPage}`;

  // Lakukan permintaan AJAX menggunakan jQuery
  $.ajax({
    url: url,
    method: "GET",
    dataType: "json",
    success: function (data) {
      $("loading").hide();
      // Logika untuk menampilkan data  melakukan operasi lainnya dengan data yang diterima
      // Ambil elemen subtes-container
      var subtesContainer = document.getElementById("subtes-container");

      // Bersihkan kontennya (jika ada konten sebelumnya)
      subtesContainer.innerHTML = "";
      // Tentukan apakah tombol sebelumnya, tombol selanjutnya, dan tombol selesai harus ditampilkan
      var showNextButton = indexSubtest < 4; // Tombol selanjutnya hanya ditampilkan jika indexSubtest kurang dari total subtes
      var showFinishButton = indexSubtest === 4; // Tombol selesai hanya ditampilkan jika indexSubtest sama dengan total subtes

      // Ambil elemen-elemen tombol dari form
      var nextButton = document.getElementById("nextButton");
      var finishButton = document.getElementById("finishButton");

      // Atur tampilan tombol berdasarkan kondisi di atas
      nextButton.style.display = showNextButton ? "inline-block" : "none";
      finishButton.style.display = showFinishButton ? "inline-block" : "none";

      nextButton.onclick = function () {
        if (!answerNext()) {
          return;
        }
        // Lanjutkan ke subtes berikutnya
        if (indexSubtest < 4) {
          if (isTimeUp) {
            indexSubtest++;
            isTestFinished = true;
            sessionStorage.setItem("indexSubtest", indexSubtest);

            // Pindah ke halaman berikutnya jika ada jawaban yang dipilih
            window.location.href = `/dotest/starttest/disc/subtes${indexSubtest}`;
          } else {
            Swal.fire({
              title: "Apakah Kamu Yakin?",
              text: "Kamu Tidak Akan Bisa Kembali!",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#4CAF50",
              cancelButtonColor: "#d33",
              confirmButtonText: "Ya, Saya Yakin!",
              cancelButtonText: "Batal",
            }).then((result) => {
              if (result.isConfirmed) {
                // Pengguna menekan "Ya, Lanjutkan"
                indexSubtest++;
                isTestFinished = true;
                sessionStorage.setItem("indexSubtest", indexSubtest);
                sessionStorage.setItem(
                  "tabChange",
                  sessionStorage.getItem("tabChange") - 1
                );

                // Pindah ke halaman berikutnya jika ada jawaban yang dipilih
                window.location.href = `/dotest/starttest/disc/subtes${indexSubtest}`;
              }
            });
          }
        }
      };
      //baca data test
      loadSubtestQuestions(indexSubtest, data);
      //dapatkan nilai waktu test serta jalankan hitung mundur

      finishButton.onclick = function (event) {
        event.preventDefault();
        if (!answerNext()) {
          return;
        }
        var finisAnswer = JSON.parse(sessionStorage.getItem("jawabanPengguna"));
        var filePicture = sessionStorage.getItem("filePicture");
        var tesActive = parseInt(sessionStorage.getItem("currentTestId"));
        if (isTimeUp) {
        } else {
          Swal.fire({
            title: "Apakah Kamu Yakin?",
            text: "Jawaban Akan Disimpan!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#4CAF50",
            cancelButtonColor: "#d33",
            confirmButtonText: "Ya, Saya Yakin!",
            cancelButtonText: "Batal",
          }).then((result) => {
            if (result.isConfirmed) {
              $("#loading").show();

              // Lakukan sesuatu ketika tes selesai
              isTestFinished = true;

              var arrayJawaban = []; //convert obj jawabanPengguna ke array

              // Mengambil totalSoal dari objek dataUjian
              const totalSoal = dataUjian.totalSoal;
              if (!finisAnswer) {
                finisAnswer = Array(totalSoal).fill("0");
                sessionStorage.setItem(
                  "jawabanPengguna",
                  JSON.stringify(finisAnswer)
                );
              }

              var kosong = "0";
              for (var i = 0; i < totalSoal; i++) {
                if (finisAnswer[i] !== undefined && finisAnswer[i] !== null) {
                  arrayJawaban.push(finisAnswer[i]);
                } else {
                  arrayJawaban.push(kosong);
                }
              }
              var res = null;
              $.ajax({
                method: "POST", // Change to POST method
                url: ApiUrl + "/api/Participant/GetResultTestDISC",
                contentType: "application/json", // Set content type
                data: JSON.stringify(arrayJawaban), // Send the data in the request body
                dataType: "json",
                success: function (result) {
                  res = result.data;
                },
                error: function (err) {
                  return;
                },
              });
              var flag = ",SAFE";
              var tabChange = sessionStorage.getItem("tabChange");
              if (tabChange > 0 || !tabChange) {
                flag = ",VIOLATION" + "/" + tabChange;
              }
              var newScore = (res += flag);

              var stored = {
                answer: arrayJawaban.toString(),
                final_score: newScore.toString(), //sementara finalscore karena belum ada scoring
                test_id: tesActive,
                participant_id: parseInt(
                  sessionStorage.getItem("participantId")
                ),
                capture: filePicture,
                status: true,
              };
              storeAnswer(stored);
              sessionStorage.removeItem("tabChange");
              sessionStorage.removeItem("jawabanPengguna");
              sessionStorage.removeItem("indexSubtest");
              sessionStorage.removeItem("remainingTime");
              $("#loading").hide();

              window.location.href = "/user/page2/";
            }
          });
        }
      };
      getTestTimeAndTotalQuestion(testId)
        .then((result) => {
          var remainingTime = sessionStorage.getItem("remainingTime");

          if (remainingTime !== null) {
            countdownTImer(remainingTime);
          } else {
            // Memanggil countdownTImer dengan nilai testTime
            countdownTImer(result.testTime);
          }

          // Lakukan apa pun yang perlu Anda lakukan dengan nilai totalQuestion di sini
        })
        .catch((error) => {
          console.error("Terjadi kesalahan:", error);
        });
      // Muat soal-soal untuk subtes yang sesuai saat halaman pertama dimuat
    },
    error: function (error) {
      $("loading").hide();
      // Tangani kesalahan jika ada
      console.error("Terjadi kesalahan:", error);
    },
  });
}

// Fungsi untuk memuat soal-soal dari subtes yang sesuai
function loadSubtestQuestions(indexSubtest, data) {
  var jawaban = {};

  var startIndex = 0;
  var endIndex = 0;
  for (var i = 0; i < indexSubtest; i++) {
    startIndex = endIndex;
    endIndex += 6;
  }

  //ambil data soal berdasarkan response get
  var subtestQuestions = data.data;

  // Ambil elemen subtes-container
  var subtesContainer = document.getElementById("subtes-container");
  subtesContainer.className = "row justify-content-center"; // Tambahkan kelas untuk CSS Grid

  // Bersihkan kontennya (jika ada konten soal sebelumnya)
  subtesContainer.innerHTML = "";

  // Loop melalui data soal yang sesuai
  for (var i = 0; i < subtestQuestions.length; i++) {
    var currentSoalNumber = startIndex + i + 1; // Ini adalah nomor urutan soal

    // Inisialisasi objek jawaban untuk soal saat ini
    jawaban[currentSoalNumber] = {
      most: [],
      least: [],
    };

    // Ambil data soal berdasarkan indeks i
    var soalData = subtestQuestions[i];

    // Buat elemen soal sesuai dengan jenis soal
    var indexSubtest = sessionStorage.getItem("indexSubtest");
    var soalDiv = document.createElement("div");
    soalDiv.className = `col-sm-6 soal p-3`;
    soalDiv.innerHTML = `
            <div class="">
                <table class="table table-hover table-sm" style=" text-align:center">
                    <thead>
                        <tr>
                            <th style="background-color:#bbd0f3">Most (M)</th>
                            <th style="background-color:#d9d7d7; width: 28rem;vertical-align:middle">Nomor ${currentSoalNumber}</th>
                            <th style="background-color:#bbd0f3">Least (L)</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

    // tambahkan multiple choice
    soalData.tblMultipleChoices.forEach(function (pilihan, index) {
      var mostRadioChecked = "";
      var leastRadioChecked = "";

      // Periksa apakah ada data di jawabanPengguna yang sesuai dengan currentSoalNumber
      if (jawabanPengguna[currentSoalNumber - 1]) {
        var jawabanArray = jawabanPengguna[currentSoalNumber - 1].split(","); // Pisahkan "most" dan "least"
        var mostValue = jawabanArray[0];
        var leastValue = jawabanArray[1];

        if (mostValue == index + 1) {
          mostRadioChecked = "checked"; // Aktifkan radio most jika ada data
        }
        if (leastValue == index + 1) {
          leastRadioChecked = "checked"; // Aktifkan radio least jika ada data
        }
      }

      // Menambahkan radio button ke dalam tabel dengan satu kolom
      soalDiv.querySelector("tbody").innerHTML += `
                <tr>
                    <td style="text-align:center">
                        <div class="form-check">
                            <input class="form-check-input" style="cursor: pointer" type="radio" name="most_${currentSoalNumber}" value='${
        index + 1
      }' data-soal="${currentSoalNumber}" data-jawaban="most" required="" ${mostRadioChecked}>
                        </div>
                    </td>
                    <td>${pilihan.multiple_Choice_Desc}</td>
                    <td style="text-align:center">
                        <div class="form-check">
                            <input class="form-check-input" style="cursor: pointer" type="radio" name="least_${currentSoalNumber}" value='${
        index + 1
      }' data-soal="${currentSoalNumber}" data-jawaban="least" required="" ${leastRadioChecked}>
                        </div>
                    </td>
                </tr>
            `;
    });

    soalDiv.innerHTML += `
        </tbody>
        </table>
        </div>
        </div>
    `;

    // Tambahkan elemen soalDiv ke subtesContainer
    subtesContainer.appendChild(soalDiv);
  }

  // Tambahkan event listener untuk radio button menggunakan jQuery
  $('input[type="radio"]').change(function () {
    var currentSoalNumber = $(this).data("soal");
    var jenisJawaban = $(this).data("jawaban");
    var jawabanValue = $(this).val();

    // Cek apakah ada data sebelumnya di jawabanPengguna
    var jawabanArray = [];
    if (jawabanPengguna[currentSoalNumber - 1]) {
      jawabanArray = jawabanPengguna[currentSoalNumber - 1].split(",");
    }

    // Simpan jawaban ke dalam objek jawaban
    if (jenisJawaban === "most") {
      var leastValue = $(
        `input[type="radio"][data-soal="${currentSoalNumber}"][data-jawaban="least"]:checked`
      ).val();
      if (jawabanValue === leastValue) {
        $(
          `input[type="radio"][data-soal="${currentSoalNumber}"][data-jawaban="least"]:checked`
        ).prop("checked", false); // Uncheck least jika sama dengan most
        jawaban[currentSoalNumber].least = null;
      } else {
        jawaban[currentSoalNumber].least = leastValue; // Gunakan data least dari jawabanPengguna
      }
      jawaban[currentSoalNumber].most = jawabanValue;
    } else if (jenisJawaban === "least") {
      var mostValue = $(
        `input[type="radio"][data-soal="${currentSoalNumber}"][data-jawaban="most"]:checked`
      ).val();
      if (jawabanValue === mostValue) {
        $(
          `input[type="radio"][data-soal="${currentSoalNumber}"][data-jawaban="most"]:checked`
        ).prop("checked", false); // Uncheck most jika sama dengan least
        jawaban[currentSoalNumber].most = null;
      } else {
        jawaban[currentSoalNumber].most = mostValue; // Gunakan data most dari jawabanPengguna
      }
      jawaban[currentSoalNumber].least = jawabanValue;
    }

    simpanJawaban(currentSoalNumber, jawaban);
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
      //window.location = "/user/page2";
    },
    error: function (errorMessage) {
      $("#loading").hide();
      Swal.fire(errorMessage.responseText, "", "error");
    },
  });
}

// Function to check instruction disc
function validateOptions() {
  var selectedOption111 = document.querySelector('input[name="111"]:checked');
  var selectedOption222 = document.querySelector('input[name="222"]:checked');

  if (!selectedOption111 || !selectedOption222) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: `Tidak boleh kosong!\nPerhatikan kolom Most dan Least`,
    });
    return false; // Prevent form submission
  }
  return true; // Continue with form submission
}

function answerNext() {
  var subtesNum = sessionStorage.getItem("indexSubtest");
  var userAns = JSON.parse(sessionStorage.getItem("jawabanPengguna")) || [];
  if (userAns.length === 0) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: `Jawaban tidak boleh kosong!`,
    });
    return false;
  }

  for (let i = 0; i < parseInt(subtesNum) * 6; i++) {
    var splAns = userAns[i].split(",");
    let checked = 0;
    for (let j = 0; j < 2; j++) {
      if (!splAns[j] || splAns[j] === "") {
        checked++;
      }
    }
    if (checked > 0) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: `Nomor ` + (i + 1) + ` tidak boleh kosong!`,
        footer: "Perhatikan Kolom Most dan Least",
      });
      return false;
    }
  }
  return true;
}

function checkTabChange(indexSubtest) {
  document.addEventListener("visibilitychange", function () {
    var violationCount = sessionStorage.getItem("tabChange");

    if (document.hidden) {
      violationCount++;
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

function forceFinish(status, indexSubtest) {
  /*status :
        1 : times up,
        2 : foul 
    */
  var finisAnswer = JSON.parse(sessionStorage.getItem("jawabanPengguna"));
  var filePicture = sessionStorage.getItem("filePicture");
  var tesActive = parseInt(sessionStorage.getItem("currentTestId"));
  let answe = "";
  var arrayJawaban = []; //convert obj jawabanPengguna ke array

  // Mengambil totalSoal dari objek dataUjian
  isTestFinished = true;

  var arrayJawaban = []; //convert obj jawabanPengguna ke array

  // Mengambil totalSoal dari objek dataUjian
  const totalSoal = dataUjian.totalSoal;
  if (!finisAnswer) {
    finisAnswer = Array(totalSoal).fill("0");
    sessionStorage.setItem("jawabanPengguna", JSON.stringify(finisAnswer));
  }
  var kosong = "0";
  for (var i = 0; i < totalSoal; i++) {
    var answerr = finisAnswer[i].split(",");
    if (answerr.length !== 2) {
      answerr.push("0");
    }
    for (let a = 0; a < 2; a++) {
      if (!answerr[a]) {
        answerr[a] = "0";
      }
    }
    arrayJawaban.push(answerr);
  }
  switch (status) {
    case 1:
      //cek waktu tersisa, jika nol maka tidak ke subtes selanjutnya
      var remainingTime = sessionStorage.getItem("remainingTime");
      if (indexSubtest >= 4 || remainingTime <= 0) {
        answe = "invalid";
      } else {
        indexSubtest++;
        isTestFinished = true;
        sessionStorage.setItem("indexSubtest", indexSubtest);
        sessionStorage.setItem(
          "tabChange",
          sessionStorage.getItem("tabChange") - 1
        );
        answe = 0;
        // Pindah ke halaman berikutnya jika ada jawaban yang dipilih
        window.location.href = `/dotest/starttest/disc/subtes${indexSubtest}`;
      }

      break;
    default:
      answe = "";
  }
  if (answe !== 0) {
    var stored = {
      answer: arrayJawaban.toString(),
      final_score: answe.toUpperCase(),
      test_id: tesActive,
      participant_id: parseInt(sessionStorage.getItem("participantId")),
      capture: filePicture,
      status: true,
    };

    sessionStorage.removeItem("indexSubtest");
    sessionStorage.removeItem("jawabanPengguna");
    sessionStorage.removeItem("remainingTime");
    window.location.href = "/user/page2/";
    window.sessionStorage.removeItem("tabChange");

    storeAnswer(stored);
    return;
  }
}
