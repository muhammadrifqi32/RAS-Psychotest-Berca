$(document).ready(function () {
  const currentTestId = sessionStorage.getItem("currentTestId");

  startTest(currentTestId); // Use currentTestId here
  checkTabChange();
});

function displayTestPapiKostick(testData) {
  $("#startDoTest").hide();
  $("#btnBackTest").show();
  $("#btnNextTest").show();
  /*$('#detail').show();*/

  // Memeriksa apakah pertanyaan pertama atau terakhir untuk menampilkan tombol "Next" atau "Finish"
  if (currentQuestionIndex === 0) {
    $("#btnBackTest").hide();
  } else if (currentQuestionIndex === testData.data.length - 1) {
    $("#btnNextTest").hide();
    $("#btnFinishTest").show();
  } else {
    $("#btnFinishTest").hide(); // Sembunyikan tombol "Finish" jika bukan pertanyaan terakhir
  }

  // Ubah nilai elemen dengan id="cardTitle" sesuai dengan nomor soal
  $("#cardTitle").text(`Nomor ${currentQuestionIndex + 1}`);

  // Mengisi konten pertanyaan dan pilihan ganda berdasarkan indeks pertanyaan saat ini
  const questionData = testData.data[currentQuestionIndex];
  if (!myAnswer || myAnswer.length !== totalQuestions) {
    arr = Array(totalQuestions).fill("0");
    myAnswer = arr;
    sessionStorage.setItem("myanswer", JSON.stringify(myAnswer));
  }
  const myAnswerThisNumber = myAnswer[currentQuestionIndex];
  let questionHTML = `<form id="cekaja" class ="text-justify">`;
  questionData.tblMultipleChoices.forEach((choiceData, choiceIndex) => {
    const choiceId = `choice_${currentQuestionIndex}_${choiceIndex}`;
    let choice = "";
    if (choiceData.score === myAnswerThisNumber) {
      choice = "checked";
    }
    questionHTML += `
            <div class="row boxed-check-group boxed-check-default">
            <div class="col-12 col-sm-12 col-lg-12">
                <label class="boxed-check">

                    <input class="boxed-check-input" type="radio" id="${choiceId}" name="question${currentQuestionIndex}" value="${choiceData.score}" ${choice}>
                    <div class="boxed-check-label">${choiceData.multipleChoiceDesc}</div>
                
                    </label>
            </div>
        </div>
        `;
  });
  questionHTML += `</form>`;

  $("#questionContainer").html(questionHTML);
}
