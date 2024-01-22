var dataTest = {};
var isFirstLockedTest = true;
var currentTestId = null;

// Event listener saat halaman dimuatx
$(document).ready(function () {
  var testCategoryId = sessionStorage.getItem("testCategoryId");
  if (
    sessionStorage.getItem("tabChange") !== 0 ||
    !sessionStorage.getItem("tabChange")
  ) {
    sessionStorage.setItem("tabChange", 0);
  }

  $.ajax({
    url: ApiUrl + "/api/TestCategory/Test/" + testCategoryId,
    type: "GET",
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    //token jwt
    headers: {
      Authorization: "Bearer " + sessionStorage.getItem("token"),
    },
    success: async function (result) {
      var obj = result.data; //data yang didapat dari API
      const testList = obj.testKit.split(",");

      // Fetch data for each test using Promise.all
      const fetchTestPromises = testList.map(async (idTest) => {
        try {
          const testResult = await $.ajax({
            url: ApiUrl + "/api/Test/dotest/" + idTest,
            type: "GET",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            //token jwt
            headers: {
              Authorization: "Bearer " + sessionStorage.getItem("token"),
            },
          });
          return testResult.data;
        } catch (error) {
          console.error(error);
          return null;
        }
      });

      // Wait for all test data to be fetched
      const fetchedTestData = await Promise.all(fetchTestPromises);

      // Process fetched test data
      fetchedTestData.forEach((testObj) => {
        if (testObj) {
          dataTest[testObj.testName] = {
            idTest: testObj.testId,
            namaTest: testObj.testName,
            waktuTest: testObj.testTime,
          };
        }
      });
      // Update links after all data is processed
      //sessionStorage.setItem('dataTest', JSON.stringify(dataTest));
      updateLinks();
    },
    error: function (errorMessage) {
      Swal.fire({
        title: "Tes Tidak Ditemukan",
        text: "Anda Akan Diarahkan ke halaman redirect",
        icon: "question",
      }).then((result) => {
        window.location.href = "/";
      });
    },
  });
});

// Fungsi untuk mengupdate tampilan elemen <a> berdasarkan dataTest
async function updateLinks() {
  const testContainer = document.getElementById("testContainer");
  const getParticipantId = sessionStorage.getItem("participantId");
  testContainer.innerHTML = ""; // Bersihkan isi kontainer sebelum mengisi ulang

  for (const key in dataTest) {
    if (dataTest.hasOwnProperty(key)) {
      const test = dataTest[key];
      const link = document.createElement("a");

      link.className = "btn btn-app m-2";
      link.id = "test" + test.namaTest;

      const badge = document.createElement("span");
      badge.className = "badge rounded-circle p-2";

      const icon = document.createElement("i");

      await fetchAnswer(getParticipantId, test.idTest, icon, badge); // Tunggu fetchAnswer selesai

      badge.appendChild(icon);

      // Membuat div container untuk badge dan teks "test"
      const badgeContainer = document.createElement("div");
      badgeContainer.style.textAlign = "center"; // Mengatur teks menjadi center horizontal
      badgeContainer.appendChild(badge); // Tambahkan badge ke container

      link.appendChild(badgeContainer); // Tambahkan container ke dalam tombol link

      const text = document.createTextNode(" " + test.namaTest);
      link.appendChild(text);

      testContainer.appendChild(link);
    }
  }
  // Setelah menyelesaikan looping, periksa apakah tes terakhir selesai
  if (isFirstLockedTest) {
    // Semua tes telah dicek dan yang terakhir adalah icon lingkaran (circle)
    sessionStorage.setItem("lastTestCompleted", "true");
    if (sessionStorage.getItem("lastTestCompleted") === "true") {
      window.location.href = "/dotest/finished";
    }
  } else {
    sessionStorage.setItem("lastTestCompleted", "false");
  }
}

// Fungsi untuk mengambil data jawaban peserta berdasarkan testId
function fetchAnswer(participantId, testId, icon, badge) {
  return new Promise((resolve, reject) => {
    $("loading").show();
    $.ajax({
      url: ApiUrl + "/api/ParticipantAnswer/GetAnswareByTest",
      type: "GET",
      data: {
        participantId: participantId,
        testId: testId,
      },
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      headers: {
        Authorization: "Bearer " + sessionStorage.getItem("token"),
      },
      success: function (result) {
        $("loading").hide();
        const status = result.data[0].status;
        if (status === true) {
          icon.className = "fas fa-check text-white";
          badge.className = "badge bg-success rounded-circle p-2";
        } else {
          if (isFirstLockedTest) {
            icon.className = "fas fa-circle text-success";
            badge.className =
              "badge bg-light rounded-circle p-2 border border-secondary";

            currentTestId = result.data[0].testId; // Simpan testId yang sekarang akan dites
            //do add session

            isFirstLockedTest = false;
          } else {
            icon.className = "fas fa-lock text-white";
            badge.className += " bg-secondary";
          }
        }

        resolve(currentTestId); // Selesaikan promise dengan testId lingkaran (jika ada)
      },
      error: function (error) {
        $("loading").hide();
        console.error("Error fetching answer:", error);
        reject(error); // Tolak promise jika terjadi error
      },
    });
  });
}
