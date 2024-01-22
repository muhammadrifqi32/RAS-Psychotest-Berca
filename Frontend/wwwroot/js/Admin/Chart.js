$(document).ready(function () {
    if (getRole === undefined) {
        window.location.href = "/";
    } else if (getRole === "Participant") {
        window.location.href = "/error/notfound";
    }
    //if (!localStorage.getItem("token") || (sessionStorage.getItem("token") && localStorage.getItem("token") !== sessionStorage.getItem("token"))) {

    //    location.replace("/");
    //    sessionStorage.clear();
    //    setTimeout(function () {
    //        window.location.reload(true);
    //    }, 2000); // Ubah angka 1000 menjadi waktu penundaan yang sesuai (dalam milidetik)

    //}
    // Panggil fungsi untuk mendapatkan jumlah participant dan memperbarui small box
    getTotalParticipantCount();
    jobposition();
    getStatus();
    statusChart();
    scrollToTop();
});

function jobposition() {
    $.ajax({
        url: ApiUrl + "/api/ApplliedPosition/JobTittleParticipant",
        type: "GET",
        dataType: "json",
        headers: {
            Authorization: "Bearer " + sessionStorage.getItem("token"),
        },
        statusCode: {
            403: function () {
                // Jika status respons adalah 403 (Forbidden), alihkan pengguna ke halaman "/dashboard"
                window.location.href = "/error/notfound";
            },
        },
        success: function (result) {
            var objDept = result.data;
            positionCounts = {}; // Reset objek positionCounts sebelum dihitung ulang
            var totalData = result.data.length; // Total semua data

            // Menginisialisasi positionCounts dengan nilai 0 untuk setiap posisi
            $.ajax({
                url: ApiUrl + "/api/ApplliedPosition/JobTittleParticipant",
                type: "GET",
                dataType: "json",
                headers: {
                    Authorization: "Bearer " + sessionStorage.getItem("token"),
                },
                success: function (result) {
                    var appliedPositions = result.data;
                    for (var i = 0; i < appliedPositions.length; i++) {
                        var position = appliedPositions[i];
                        positionCounts[position.appliedPosition] = 0;
                    }

                    // Menghitung total posisi
                    for (var i = 0; i < result.data.length; i++) {
                        var participant = result.data[i];
                        var nameposition = participant.appliedPosition;

                        if (positionCounts.hasOwnProperty(nameposition)) {
                            positionCounts[nameposition]++; // Tambah 1 ke total posisi yang sudah ada
                        }
                    }

                    var table = $("#TB_Participant").DataTable({
                        autoWidth: true,
                        responsive: false,
                        scrollX: true,
                        order: [],
                        drawCallback: function (settings) {
                            var api = this.api();
                            var startIndex = api.context[0]._iDisplayStart;
                            var counter = startIndex + 1;
                            api
                                .column(0, { page: "current" })
                                .nodes()
                                .each(function (cell, i) {
                                    cell.innerHTML = counter;
                                    counter++;
                                });
                        },
                        ajax: {
                            url: ApiUrl + "/api/ApplliedPosition",
                            type: "GET",
                            datatype: "json",
                            dataSrc: "data",
                            headers: {
                                Authorization: "Bearer " + sessionStorage.getItem("token"),
                            },
                        },
                        columns: [
                            {
                                // Menampilkan kolom "No." dengan fungsi increment berdasarkan data "name" dari API
                                data: null,
                                orderable: false, // kolom No. tidak bisa di-sort
                                render: function (data, type, row, meta) {
                                    return meta.row + 1 + ".";
                                },
                            },
                            {
                                data: "appliedPosition",
                                orderable: false,
                                orderData: [1],
                            },
                            {
                                data: function (data, type, row) {
                                    return positionCounts[data.appliedPosition] || 0;
                                },
                                orderable: false,
                            },
                            {
                                data: function (data, type, row) {
                                    var count = positionCounts[data.appliedPosition] || 0;
                                    return ((count / totalData) * 100).toFixed(2) + "%";
                                },
                                orderable: false,
                            },
                        ],
                    });
                    table;
                },
                error: function (error) { },
            });
        },
        error: function (error) { },
    });
}

function updateParticipantCount(count) {
    var box = document.querySelector("#participantCountBox h3"); // Implementasi DOM Menggunakan ID participantCountBox
    box.textContent = count;
}

// Mendapatkan jumlah participant dari database
function getTotalParticipantCount() {
  $.ajax({
      url: ApiUrl + "/api/Participant/countParticipant",
    type: "GET",
    dataType: "json",
    headers: {
      Authorization: "Bearer " + sessionStorage.getItem("token"),
    },
    success: function (result) {
        var box = document.querySelector("#participantCountBox h3"); // Implementasi DOM Menggunakan ID participantCountBox
        box.textContent = result;
        /*var totalParticipant = result.data.length;
      updateParticipantCount(totalParticipant);*/
    },
    error: function (error) {},
  });
}

function getStatus() {
  $.ajax({
      url: ApiUrl + "/api/Participant/statusDashboard",
    type: "GET",
    dataType: "json",
    headers: {
      Authorization: "Bearer " + sessionStorage.getItem("token"),
    },
      success: function (result) {
      var currentDate = new Date();
      let tot = 0;
      let complete = 0;
      let onProcess = 0;
      let incomplete = 0;
        $.each(result.data, function (index, value) {
        //total
            let numtest = value.tesKitList;
        //1.testCategory.testKit
        let newte = numtest.split(",").length;
        let comp = 0;
        let ongoing = 0;
        let incomp = 0;

                tot++;

            let numtestCom = value.statusList;
        //2.tblParticipantAnswers
            let exp = new Date(value.expiredDatetime);
        //3. participant expireddatetime
        if (numtestCom.length !== 0) {
            $.each(numtestCom, function (index, data) {
            //complete
            if (data.status === true) {
              comp++;
            }
            //onprocess
            if (exp > currentDate && data.status === false) {
              ongoing++;
            }
            //expired
            if (exp < currentDate && data.status === false) {
              incomp++;
            }
          });
        } else {
          if (exp > currentDate) {
            ongoing++;
          }
          if (exp < currentDate) {
            incomp++;
          }
        }

                if (parseInt(newte) === parseInt(comp)) {
                    complete++;
                }
                if (parseInt(ongoing) > 0) {
                    onProcess++;
                }
                if (parseInt(incomp) > 0) {
                    incomplete++;
                }
            });
            var percentComplete = (complete / tot) * 100;
            var percentOnProgress = (onProcess / tot) * 100;
            var percentIncomplete = (incomplete / tot) * 100;

            var boxcomplete = document.querySelector("#completeCountBox h3"); // Implementasi DOM Menggunakan ID participantCountBox
            boxcomplete.textContent = percentComplete.toFixed(0) + "%";
            $("#forOverlayCom").hide();
            var boxonProgress = document.querySelector("#onProgressCountBox h3"); // Implementasi DOM Menggunakan ID participantCountBox
            boxonProgress.textContent = percentOnProgress.toFixed(0) + "%";
            $("#forOverlayOnP").hide();
            var boxinComplete = document.querySelector("#inCompleteCountBox h3"); // Implementasi DOM Menggunakan ID participantCountBox
            boxinComplete.textContent = percentIncomplete.toFixed(0) + "%";
            $("#forOverlayInc").hide();
        },
        error: function (error) { },
    });
}

function statusChart() {
    $.ajax({
        url: ApiUrl + "/api/Participant/GetPar",
        type: "GET",
        dataType: "json",
        headers: {
            Authorization: "Bearer " + sessionStorage.getItem("token"),
        },

        success: function (result) {
            var currentDate = new Date();
            let finish = 4;
            let total = 5;
            var statusCounts = {}; // Definisikan Objek
            var labels = [];
            var datasetsDataComplete = [];
            var datasetsDataIncomplete = [];
            var datasetsDataOnProgress = [];
            var months = [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
            ];
            for (var i = 0; i < result.data.length; i++) {
                var expiredDate = new Date(result.data[i].expiredDateTime);
                var month = months[expiredDate.getMonth()];
                //coba nambah month + 1
                //var nextMonth = months[(expiredDate.getMonth() + 1) % 12]; // Bulan+1 (diambil dengan modulus 12)

                if (!statusCounts[month]) {
                    statusCounts[month] = { complete: 0, incomplete: 0, onprogress: 0 };
                }

                if (currentDate < expiredDate && finish === total) {
                    statusCounts[month].complete++;
                } else if (currentDate < expiredDate && finish < total) {
                    statusCounts[month].onprogress++;
                } else {
                    statusCounts[month].incomplete++;
                }
            }

            for (var month in statusCounts) {
                labels.push(month);
                //coba
                //labels.push(nextMonth);
                datasetsDataComplete.push(statusCounts[month].complete);
                datasetsDataIncomplete.push(statusCounts[month].incomplete);
                datasetsDataOnProgress.push(statusCounts[month].onprogress);
            }

            // Data untuk grafik garis
            var areaChartCanvas = $("#areaChart").get(0).getContext("2d");
            var areaChartData = {
                labels: labels,
                datasets: [
                    {
                        label: "Complete",
                        backgroundColor: "rgba(60,141,188,0.9)",
                        borderColor: "rgba(60,141,188,0.8)",
                        pointRadius: false,
                        pointColor: "#3b8bba",
                        pointStrokeColor: "rgba(60,141,188,1)",
                        pointHighlightFill: "#fff",
                        pointHighlightStroke: "rgba(60,141,188,1)",
                        data: datasetsDataComplete,
                    },
                    {
                        label: "Incomplete",
                        backgroundColor: "rgba(210, 214, 222, 1)",
                        borderColor: "rgba(210, 214, 222, 1)",
                        pointRadius: false,
                        pointColor: "rgba(210, 214, 222, 1)",
                        pointStrokeColor: "#c1c7d1",
                        pointHighlightFill: "#fff",
                        pointHighlightStroke: "rgba(220,220,220,1)",
                        data: datasetsDataIncomplete,
                    },
                    {
                        label: "On Progress",
                        backgroundColor: "rgba(161, 194, 241)",
                        borderColor: "rgba(161, 194, 241)",
                        pointRadius: false,
                        pointColor: "rgba(161, 194, 241)",
                        pointStrokeColor: "#A1C2F1",
                        pointHighlightFill: "#fff",
                        pointHighlightStroke: "rgba(161, 194, 241)",
                        data: datasetsDataOnProgress,
                    },
                ],
            };

            var areaChartOptions = {
                maintainAspectRatio: false,
                responsive: true,
                legend: {
                    display: true,
                },
                scales: {
                    xAxes: [
                        {
                            gridLines: {
                                display: false,
                            },
                        },
                    ],
                    yAxes: [
                        {
                            gridLines: {
                                display: false,
                            },
                        },
                    ],
                },
            };

            // Membuat grafik garis menggunakan Chart.js
            $("#barOverlay").hide();
            new Chart(areaChartCanvas, {
                type: "line",
                data: areaChartData,
                options: areaChartOptions,
            });
        },
        error: function (error) { },
    });
}


function scrollToTop() {
    window.addEventListener("scroll", function () {
        var scrollPosition =
            window.pageYOffset || document.documentElement.scrollTop;
        var scrollToTopButton = document.querySelector(".scroll-to-top");

        if (scrollPosition > 300) {
            scrollToTopButton.style.display = "block";
        } else {
            scrollToTopButton.style.display = "none";
        }
    });

    window.scrollTo({
        top: 0,
        behavior: "smooth",
    });
}
