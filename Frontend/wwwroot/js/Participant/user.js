cameraActive = false;
var testKit = []; // Inisialisasi testKit
var participantId = sessionStorage.getItem("participantId");

document.addEventListener("DOMContentLoaded", function () {
  var date = new Date();
  var options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  var formattedDate = date.toLocaleDateString("id-ID", options);
  document.getElementById("dateNow").innerHTML = formattedDate;

  var user = sessionStorage.getItem("name"); // Ganti dengan nama pengguna yang sesuai
  var hour = date.getHours();
  var greeting = "";
  if (hour >= 0 && hour < 12) {
    greeting = "selamat pagi!";
  } else if (hour >= 12 && hour < 15) {
    greeting = "selamat siang!";
  } else if (hour >= 15 && hour < 18) {
    greeting = "selamat sore!";
  } else {
    greeting = "selamat malam!";
  }
  document.getElementById("greeting").innerHTML =
    "Hai, " + user + " " + greeting;
});

function page2() {
  var dateNow = new Date();
  var dateExp = new Date(sessionStorage.getItem("expiredDatetime"));
  if (dateNow > dateExp) {
    return window.location.assign("/user/Notest");
  }
  window.location.assign("/user/page2");
}

// Function to post status test
function postStatusTest(testId) {
  $("#loading").show();
  var ParticipantAnswer = new Object();
  ParticipantAnswer.ParticipantId = sessionStorage.getItem("participantId");
  ParticipantAnswer.Status = false;
  ParticipantAnswer.TestId = testId;
  return $.ajax({
    type: "POST",
    url: ApiUrl + "/api/ParticipantAnswer/PostParticipantAnswer",
    data: JSON.stringify(ParticipantAnswer),
    contentType: "application/json; charset=utf-8",
    //token jwt
    headers: {
      Authorization: "Bearer " + sessionStorage.getItem("token"),
    },
    success: function (result) {
      $("#loading").hide();
    },
    error: function (errorMessage) {
      $("#loading").hide();
      /*Swal.fire(errorMessage.responseJSON.message, '', 'error');*/
    },
  });
}

// Initialize participantAnswersMap to keep track of posted statuses
var participantAnswersMap = {};
// Get participant answers from API
$.ajax({
  url:
    ApiUrl +
    `/api/ParticipantAnswer/GetListByParticipantId?participantId=${participantId}`,
  type: "GET",
  contentType: "application/json; charset=utf-8",
  dataType: "json",
  //token jwt
  headers: {
    Authorization: "Bearer " + sessionStorage.getItem("token"),
  },
  success: function (result) {
    var participantAnswers = result.data;

    // Get testKit from API
    var testCategoryId = sessionStorage.getItem("testCategoryId");
    $.ajax({
      url: ApiUrl + "/api/TestCategory/Test/" + testCategoryId,
      type: "GET",
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      //token jwt
      headers: {
        Authorization: "Bearer " + sessionStorage.getItem("token"),
      },
      success: function (testCategoryResult) {
        var testKit = testCategoryResult.data.testKit
          .split(",")
          .map((id) => id.trim());

        // Call the function to post status for missing tests
        postStatusForMissingTests(participantAnswers, testKit);
      },
      error: function (error) {
        console.error("Error fetching testKit:", error);
      },
    });
  },
  statusCode: {
    404: function () {
      // Handle error when no participant answers found
      var testCategoryId = sessionStorage.getItem("testCategoryId");
      $.ajax({
        url: ApiUrl + "/api/TestCategory/Test/" + testCategoryId,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        //token jwt
        headers: {
          Authorization: "Bearer " + sessionStorage.getItem("token"),
        },
        success: function (testCategoryResult) {
          var testKit = testCategoryResult.data.testKit
            .split(",")
            .map((id) => id.trim());
          postStatusForAllTests(testKit);
        },
        error: function (error) {
          console.error("Error fetching testKit:", error);
        },
      });
    },
  },
  error: function (errorMessage) {
    if (errorMessage.status !== 404) {
      window.location.href = "/error/notfound";
      Swal.fire(errorMessage.responseJSON.message, "", "error");
    }
  },
});

// Function to post status for all tests in testKit
function postStatusForAllTests(testKit) {
  const totalTests = testKit.length;
  let testsPosted = 0;

  testKit.forEach((testId) => {
    postStatusTest(testId)
      .done(function () {
        testsPosted++;
        if (testsPosted === totalTests) {
          // All tests posted successfully
        }
      })
      .fail(function () {
        testsPosted++;
        if (testsPosted === totalTests) {
          // Redirect back to the same page
          /*window.location.href = "https://localhost:7196/user/page2";*/
        }
      });
  });
}

// Function to post status for missing tests
function postStatusForMissingTests(participantAnswers, testKit) {
  // Initialize an array to keep track of test IDs that need to be posted
  const testIdsToPost = [];

  // Iterate through each testId in testKit
  testKit.forEach((testId) => {
    const testIdString = testId.toString();
    let shouldPost = true;

    // Check if the testId exists in participantAnswers
    participantAnswers.forEach((participantAnswer) => {
      if (participantAnswer.testId.toString() === testIdString) {
        shouldPost = false;
      }
    });

    // If the testId doesn't exist in participantAnswers, postStatusTest
    if (shouldPost) {
      postStatusTest(testId);
    }
  });
}
