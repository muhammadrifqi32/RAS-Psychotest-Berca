let finisAnswer = JSON.parse(sessionStorage.getItem("myanswer"));
var myAnswer =
  JSON.parse(sessionStorage.getItem("myanswer")) ?? Array(9).fill(0);
var selectedNumbers = Array(12).fill(0);

$(document).ready(function () {
  const currentTestId = sessionStorage.getItem("currentTestId");

  startTest(currentTestId); // Use currentTestId here

  checkTabChange();
});

function displayTestRMIB(data) {
  currentQuestionIndex = sessionStorage.getItem("currIndx") ?? 0;
  $(".card-header").show();
  $("#startDoTest").hide();
  $("#btnBackTest").hide();
  $("#btnNextTest").show();
  $(".question-list").hide();
  if (currentQuestionIndex == data.data.length - 1) {
    $("#btnNextTest").hide();
    $("#btnFinishTest").show();
  }
  // Ubah nilai elemen dengan id="cardTitle" sesuai dengan nomor soal

  // Mengisi konten pertanyaan dan pilihan ganda berdasarkan indeks pertanyaan saat ini

  const questionData = data.data[currentQuestionIndex];

  $("#cardTitle").text(`Bagian ${questionData.questionDesc}`);

  const myAnswerThisNumber = myAnswer[currentQuestionIndex];
  let questionHTML = `<form id="cekaja">`;
  var dataMen = [];
  var dataFemale = [];
  questionData.tblMultipleChoices.forEach((choiceData, choiceIndex) => {
    if (choiceIndex <= 11) {
      dataMen.push(choiceData);
    } else {
      dataFemale.push(choiceData);
    }
  });
  var valInp = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  var choiceData = dataMen;
  if (sessionStorage.getItem("gender") === "F") {
    choiceData = dataFemale;
  }
  for (let i = 0; i < dataMen.length; i++) {
    var selInp = "";
    var choiceIndex = i;
    const choiceId = `choice_${currentQuestionIndex}_${choiceIndex}`;
    let choice = "";

    for (let a = 0; a < valInp.length; a++) {
      selInp += `<option value="${valInp[a]}">${valInp[a]}</option>`;
    }

    $(document).on(
      "change",
      `#numberingId_${questionData.questionId}_${currentQuestionIndex}_${choiceData[i].multipleChoiceId}`,
      function () {
        var selectedVal = $(this).val();
        // Disable or hide selected value in other select elements
        selectedNumbers[i] = selectedVal;

        $(`.numberingClass_${questionData.questionId}_${currentQuestionIndex}`).each(function () {
          // Enable all options
          $(this).find("option").prop("disabled", false);
          // Disable the selected options in other select elements
          for (let j = 0; j < selectedNumbers.length; j++) {
            $(this)
              .find(`option[value="${selectedNumbers[j]}"]`)
              .prop("disabled", true);
          }
        });
      }
    );

    questionHTML += `
        <div class="row justify-content-center boxed-check-group boxed-check-default">
            <div class="col-sm-3 text-left">
                <label class="boxed-check" style="pointer-events: none;">
                    <input class="boxed-check-input" type="radio" name="question${currentQuestionIndex}" value="${choiceData[i].score}" ${choice} >
                    <div class="boxed-check-label" >${choiceData[i].multipleChoiceDesc}</div>
                </label>
            </div>
            <div class="col-sm-1" style="height: 40px;border">
                <label class="boxed-check" style="cursor:pointer;height:100%;width:auto;border: 2px solid gray;border-radius: 5px;">
                    <select name="numbering_${questionData.questionId}" class="numberingClass_${questionData.questionId}_${currentQuestionIndex}" id="numberingId_${questionData.questionId}_${currentQuestionIndex}_${choiceData[i].multipleChoiceId}" style="cursor:pointer;width: 100%;height: 100%;text-align:center;">
                    <div class="boxed-check-label" style="text-align:left;"><option selected disabled></option>
                    ${selInp}
                      </select></div>
                </label>
            </div>
        </div>
        <hr/>
        `;
  }
  questionHTML += `</form>`;

  $("#questionContainer").html(questionHTML);
}

function moveToNextQuestion() {
  let finisAnswer = JSON.parse(sessionStorage.getItem("myanswer"));
  for (let a = 0; a < selectedNumbers.length; a++) {
    if (selectedNumbers[a] === 0 || selectedNumbers[a] === "0") {
      Swal.fire("Jawaban Tidak Boleh Kosong");
      return;
    }
  }

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
      $("#loading").show();
      finisAnswer[currentQuestionIndex] = selectedNumbers.toString();
      var tChange = sessionStorage.getItem("tabChange");
      sessionStorage.setItem("myanswer", JSON.stringify(finisAnswer));
      sessionStorage.setItem("tabChange", tChange);
      currentQuestionIndex++;
      sessionStorage.setItem("currIndx", currentQuestionIndex);
      selectedNumbers = Array(12).fill(0);
      displayTest();
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }, 1000);
      $("#loading").hide();
    }
  });
}

$("#btnFinishTest").on("click", function (event) {
  let finisAnswer = JSON.parse(sessionStorage.getItem("myanswer"));
  for (let a = 0; a < selectedNumbers.length; a++) {
    if (selectedNumbers[a] === 0 || selectedNumbers[a] === "0") {
      Swal.fire("Jawaban Tidak Boleh Kosong");

      return;
    }
  }
  event.preventDefault();

  finisAnswer[currentQuestionIndex] = selectedNumbers.toString();
  sessionStorage.setItem("myanswer", JSON.stringify(finisAnswer));
  var filePicture = sessionStorage.getItem("filePicture");
  var tesActive = parseInt(sessionStorage.getItem("currentTestId"));
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
        sessionStorage.removeItem("waktuTes" + tesActive);
      let ansNew = JSON.parse(sessionStorage.getItem("myanswer"));

      var arrayJawaban = [];

      var kosong = "0";
      for (var i = 0; i < 9; i++) {
        if (ansNew[i] !== undefined && ansNew[i] !== null) {
          arrayJawaban.push(finisAnswer[i]);
        } else {
          arrayJawaban.push(kosong);
        }
      }
      var res = null;
      $.ajax({
        url: ApiUrl + "/api/Participant/GetResultTestRMIB",
        method: "POST", // Change to POST method
        contentType: "application/json", // Set content type
        data: JSON.stringify(arrayJawaban), // Send the data in the request body
        dataType: "json",
        async: false,
        success: function (result) {
          res = result.data;
        },
        error: function (err) {
          $("#loading").hide();

          return;
        },
      });
      $("#loading").hide();

      var flag = ",SAFE";
      var tabChange = sessionStorage.getItem("tabChange");
      if (tabChange > 0 || !tabChange) {
        flag = ",VIOLATION" + "/" + tabChange;
      }
      var newScore = (res += flag);
      // Hasilnya adalah array 1D yang telah diubah
      var stored = {
        answer: arrayJawaban.toString(),
        final_score: newScore.toString(), //sementara finalscore karena belum ada scoring
        test_id: tesActive,
        participant_id: parseInt(sessionStorage.getItem("participantId")),
        capture: filePicture,
        status: true,
      };
      storeAnswer(stored);
      sessionStorage.removeItem("tabChange");
      sessionStorage.removeItem("myanswer");
        sessionStorage.removeItem("waktuTes" + tesActive);
      currentQuestionIndex = 0;
      window.location.href = "/user/page2";
    }
  });
});
