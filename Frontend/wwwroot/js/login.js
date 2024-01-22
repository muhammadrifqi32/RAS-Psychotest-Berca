
$(document).ready(function () {
  //hapus session setiap balik ke page login
  /*sessionStorage.clear();*/
    var tAuth = $("#authHidden").data("aut");
    //debugger;

    //check batas waktu session, jika habis maka hapus local/session
    //checkTimeSession();

    if (localStorage.getItem("token") !== null) {    
        var getToken = localStorage.getItem("token");
        sessionStorage.setItem("token", getToken);
        const getValueByIndex = (obj, index) =>
            obj[Object.keys(obj)[index]];
        var objDataToken = parseJwt(localStorage.getItem("token"));
        var getRole = getValueByIndex(objDataToken, 4);
        if (getRole !== "Participant") {
            window.location.href = "/dashboard";
        } else {
            window.location.href = "/auth/test";
        }
    }
  $(".toggle-password").click(function () {
    $(this).toggleClass("fa-eye fa-eye-slash");
    var input = $($(this).attr("toggle"));
    if (input.attr("type") === "password") {
      input.attr("type", "text");
    } else {
      input.attr("type", "password");
    }
  });
  $("#form-login").submit(function (e) {
    e.preventDefault();

    // Show the loading animation when the form is submitted
    $("#loading").show();
    //$('#loginButton').prop('disabled', true);

    var Account = {
      Email: $("#email").val(),
      Password: $("#password").val(),
    };

    $.ajax({
      type: "POST",
      async: true,
      url: ApiUrl + "/api/Accounts/Login",
      data: JSON.stringify(Account), //convert json
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: function (result) {
        // Hide the loading animation when the login result is obtained
        $("#loading").hide();
        //$('#loginButton').prop('disabled', false);

        if (result.status === 200) {
          //set id user for session
          var getToken = result.token;
          sessionStorage.setItem("token", getToken); // jwt token to session
            localStorage.setItem("token", getToken);
            //8 jam session dalam milidetik
            var batasWaktu = new Date().getTime() + (480 * 60 * 1000);

            localStorage.setItem("batasWaktuSession", batasWaktu);

            var Toast = Swal.mixin({
                toast: true,
                position: "top-right",
                showConfirmButton: false,
                timer: 3000,
                customClass:{
                   popup:'colored-toast',
                }
          });

          Toast.fire({
            icon: "success",
            title: result.message,

            //-----------------
          }).then((successAllert) => {
            //get role dan decode jwt untuk login ini
            const getValueByIndex = (obj, index) =>
              obj[Object.keys(obj)[index]];
            var objDataToken = parseJwt(sessionStorage.getItem("token"));
            var getRole = getValueByIndex(objDataToken, 4);
            if (getRole !== "Participant") {
              if (getRole === "Audit") {
                //aksi History Log
                CreateActivityUser("Has been logged in!");
              }
              window.location.href = "/dashboard";
            } else {
              window.location.href = "/auth/test/";
            }
          });
        }
        if (result.status === 404) {
          var Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
          });
          Toast.fire({
            icon: "error",
            title: result.message,
          });
        }
      },
      error: function (result) {
        $("#loading").hide();
        //$('#loginButton').prop('disabled', false);
        // Show the error toast using Toast.fire()
        var Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
        });
        Toast.fire({
          icon: "error",
          title: result.responseJSON.message,
        });
        //Swal.fire('Gagal Login', result.responseJSON.message, 'error');
      },
    });
  });

  function checkAuth(key) {
    sessionStorage.setItem("token", key); // jwt token to session
    const getValueByIndex = (obj, index) => obj[Object.keys(obj)[index]];
    var objDataToken = parseJwt(key);
    var getRole = getValueByIndex(objDataToken, 4);
    if (getRole !== "Participant") {
      if (getRole === "Audit") {
        //aksi History Log
        CreateActivityUser("Has been logged in!");
      }
      $("#loading").hide();

      window.location.href = "/dashboard";
    } else {
      $("#loading").hide();

      window.location.href = "/auth/test/" + sessionStorage.getItem("token");
    }
  }
});

function CreateActivityUser(activityUser) {
  //data token
  var objDataToken = parseJwt(sessionStorage.getItem("token"));
  var getAccountId = objDataToken.Id;
  var HistoryLog = new Object();
  HistoryLog.Activity = activityUser;
  HistoryLog.Timestamp = formatDate(new Date());
  HistoryLog.AccountId = getAccountId;
  $.ajax({
    type: "POST",
    url: ApiUrl + "/api/HistoryLog/HistoryLog",
    data: JSON.stringify(HistoryLog),
    contentType: "application/json; charset=utf-8",
    ////token jwt
    //headers: {
    //    'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    //},
    success: function (result) {
      if (
        result.status == 201 ||
        result.status == 204 ||
        result.status == 200
      ) {
        Swal.fire({
          icon: "success",
          title: "Your work has been saved",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    },
    error: function (errorMessage) {
      Swal.fire(errorMessage.responseText, "", "error");
    },
  });
}

function padTo2Digits(num) {
  return num.toString().padStart(2, "0");
}

function formatDate(date) {
  return (
    [
      date.getFullYear(),
      padTo2Digits(date.getMonth() + 1),
      padTo2Digits(date.getDate()),
    ].join("-") +
    "T" +
    [
      padTo2Digits(date.getHours()),
      padTo2Digits(date.getMinutes()),
      padTo2Digits(date.getSeconds()),
    ].join(":")
  );
}

function parseJwt(token) {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
}
