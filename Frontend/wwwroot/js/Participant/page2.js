//Page2 ini merupakan fungsi untuk FaceCapturing dan Validasi NIK Peserta
$(document).ready(function () {
  checkNIK();
  if (!sessionStorage.getItem("indexSubtest")) {
    sessionStorage.setItem("indexSubtest", 1);
  }
});

function checkNIK() {
  // Show the loading animation when the form is submitted
  $("#loading").show();
  var participantId = sessionStorage.getItem("participantId");
  $.ajax({
    url: ApiUrl + `/api/Participant/GetNIK?id=${participantId}`,
    type: "GET",
    dataType: "json",
    headers: {
      Authorization: "Bearer " + sessionStorage.getItem("token"),
    },
    success: function (response) {
      // Hide the loading animation when the login result is obtained
      $("#loading").hide();
      if (response.status === 200) {
        // NIK ditemukan, jalankan logika faceCapture
        faceCapture();
      } else {
        // NIK tidak ditemukan, tampilkan formulir NIK
        $("#facecapture").hide();
        $("#inputnik").show();
        $("#nikForm").submit(function (event) {
          $("#loading").show();
          event.preventDefault();

          var nikValue = $("#InputNik").val();

          if (nikValue !== "") {
            if (nikValue.length === 16) {
              postNIK(nikValue);
            } else {
              alert("NIK harus memiliki 16 karakter.");
            }
          } else {
            alert("Silakan masukkan NIK Anda.");
          }
        });
      }
    },
    error: function (xhr, status, error) {
      // Hide the loading animation when the login result is obtained
      $("#loading").hide();
      // Jika respons adalah 404, tampilkan formulir NIK
      if (xhr.status === 404) {
        $("#facecapture").hide();
        $("#inputnik").show();
        $("#nikForm").submit(function (event) {
          $("#loading").show();
          event.preventDefault();

          var nikValue = $("#InputNik").val();
          //zahra 28-08-2023
          const invalidCharacters = /[.,\/#!$%\^&\*)_+=''"":;\/?><|\\@\-\?\!]/; // Tanda baca yang tidak diizinkan

          //zahra 28-08-2023
          if (nikValue !== "") {
            if (nikValue.length === 16) {
              if (invalidCharacters.test(nikValue)) {
                //alert("NIK tidak boleh mengandung tanda baca atau karakter khusus.");
                Swal.fire({
                  icon: "warning",
                  title: "Peringatan",
                  text: "NIK tidak boleh mengandung tanda baca atau karakter khusus.",
                });
              } else {
                postNIK(nikValue);
              }
            } else {
              //alert("NIK harus memiliki 16 karakter.");
              Swal.fire({
                icon: "warning",
                title: "Peringatan",
                text: "NIK harus memiliki 16 karakter.",
              });
            }
          } else {
            Swal.fire("Silakan masukkan NIK Anda.");
          }
          $("#loading").hide();
        });
      } else {
        var errorMessage =
          xhr.responseJSON && xhr.responseJSON.message
            ? xhr.responseJSON.message
            : "An error occurred.";
        console.error("Error:", errorMessage);
      }
    },
  });
}

function postNIK(nikValue) {
  var participantId = sessionStorage.getItem("participantId");
  var NIK = nikValue;

  $.ajax({
    type: "POST",
    url: ApiUrl + `/api/Participant/UpdateNIK?id=${participantId}&NIK=${NIK}`,
    headers: {
      Authorization: "Bearer " + sessionStorage.getItem("token"),
    },
    contentType: "application/json; charset=utf-8",
    success: function (response) {
      $("#loading").hide();
      if (
        response.status == 201 ||
        response.status == 204 ||
        response.status == 200
      ) {
        Swal.fire({
          icon: "success",
          title: "Data Disimpan",
          showConfirmButton: false,
          timer: 1500,
        });
        if (!sessionStorage.getItem("gender")) {
          var spNik = NIK.slice(6, 8);
          var gen = spNik > 31 ? "F" : "M";
          sessionStorage.setItem("gender", gen);
        }
        // Panggil fungsi face capture
        faceCapture();
      }
    },
    error: function (xhr, status, error) {
      $("#loading").hide();
      var errorMessage =
        xhr.responseJSON && xhr.responseJSON.message
          ? xhr.responseJSON.message
          : "An error occurred.";
      Swal.fire("Error", errorMessage, "error");
    },
  });
}

function moveToTest() {
  // Bentuk URL dengan parameter currentTestId
  sessionStorage.setItem("currentTestId", currentTestId); // Simpan currentTestId di sessionStorage
  switch (currentTestId) {
    case 4:
      window.location.href = `/dotest/instruction/ist`;
      break;
    case 5:
      window.location.href = `/dotest/instruction/disc`;
      break;
    case 6:
      window.location.href = `/dotest/instruction/rmib`;
      break;
    case 7:
      window.location.href = `/dotest/instruction/papikostick`;
      break;
    case 11:
      window.location.href = `/dotest/instruction/msdt`;
      break;
    default:
      // Tindakan yang akan diambil jika currentTestId tidak cocok dengan salah satu kasus di atas.
      break;
  }
  // Arahkan ke halaman Dotest dengan URL yang memiliki parameter currentTestId
}
