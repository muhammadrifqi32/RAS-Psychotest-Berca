// Inisialisasi objek untuk menyimpan jawaban pengguna
var jawabanPengguna = [];
var currentTest;
const dataUjian = {
    totalSoal: 176,
    totalDurasi: 4140,
    subtest: [
        { soalPerSubtes: [20], subtesDurations: [360], jenis: "pilihan_ganda" }, //subtest 1
        { soalPerSubtes: [20], subtesDurations: [360], jenis: "pilihan_ganda" }, //subtest 2
        { soalPerSubtes: [20], subtesDurations: [420], jenis: "pilihan_ganda" }, //subtest 3
        { soalPerSubtes: [16], subtesDurations: [480], jenis: "essay" }, //subtest 4
        { soalPerSubtes: [20], subtesDurations: [600], jenis: "essay" }, //subtest 5
        { soalPerSubtes: [20], subtesDurations: [600], jenis: "essay" }, //subtest 6
        {
            soalPerSubtes: [20],
            subtesDurations: [420],
            jenis: "pilihan_ganda_gambar",
        }, //subtest 7
        {
            soalPerSubtes: [20],
            subtesDurations: [540],
            jenis: "pilihan_ganda_gambar",
        }, //subtest 8
        { soalPerSubtes: [20], subtesDurations: [360], jenis: "pilihan_ganda" }, //subtest 9
    ],
};
// Saat pengguna menjawab soal, simpan jawaban ke dalam objek
function simpanJawaban(nomorSoal, jawaban) {
    // Mengkonversi jawaban menjadi huruf kapital (uppercase)
    jawaban = jawaban.toUpperCase();
    // Ambil data jawaban pengguna yang ada di sessionStorage (jika ada)
    var jawabanPengguna =
        JSON.parse(sessionStorage.getItem("jawabanPengguna")) ||
        Array(dataUjian.totalSoal).fill("0");
    jawabanPengguna[parseInt(nomorSoal) - 1] = jawaban;
    // Simpan kembali data jawaban pengguna ke sessionStorage
    sessionStorage.setItem("jawabanPengguna", JSON.stringify(jawabanPengguna));
}

$(document).ready(function () {
    const testId = sessionStorage.getItem("currentTestId");
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
    if (testId !== "4") {
        // Jika tidak sesuai, arahkan kembali ke halaman instruksi atau tampilkan pesan kesalahan
        window.location.href = `/dotest/instruction/${currentTest}`;
    }

    const currentUrl = window.location.pathname;
    if (currentUrl.startsWith("/dotest/Instruction/ist/subtes")) {
        // Mencari angka dalam string menggunakan regex
        const matchAngka = currentUrl.match(/\d+/);
        if (matchAngka) {
            const angkaDiAkhir = parseInt(matchAngka[0], 10);
            const activeSub = JSON.parse(sessionStorage.getItem("indexSubtest"));
            if (angkaDiAkhir !== activeSub) {
                if (activeSub || activeSub === 0) {
                    window.location.href = `/dotest/instruction/ist/subtes${activeSub}`;
                }
                return Swal.fire({
                    title: "Tes Tidak Ditemukan",
                    text: "Anda Akan Diarahkan ke halaman redirect",
                    icon: "question",
                }).then((result) => {
                    window.location.href = "/";
                });
            }
        }
    }

    if (currentUrl.startsWith("/dotest/StartTest/ist/subtes")) {
        // Parse nomor subtes dari URL
        const subtestMatch = currentUrl.match(
            /\/dotest\/StartTest\/ist\/subtes(\d+)/
        );
        const isActiveSubtest = sessionStorage.getItem("indexSubtest");
        var indexSubtest = "0000";
        if (subtestMatch[1].toString() === isActiveSubtest.toString()) {
            indexSubtest = parseInt(subtestMatch[1]);
        }
        $("#numSubTest").text("Subtes " + indexSubtest + "");
        // Panggil displaytest hanya jika URL sesuai
        displaytest(testId, indexSubtest);
    }
    // Temukan tombol "Mulai" dengan id "mulaiButton" dan tambahkan event click

    $("#instruction").click(function () {
        var indexSubtest = $("#subTest").text();

        window.location.href = `/dotest/Instruction/ist/subtes${indexSubtest}`;
    });
    //button back(finish test clicked)
    $("#endSubtest").click(function () {
        sessionStorage.removeItem("indexSubtest");
        sessionStorage.removeItem("filePicture");
        return (window.location.href = `/user/page2`);
    });
});

function startTest(indexSubtest) {
    // Buat URL tujuan dengan indeksSubtest yang disesuaikan.
    var targetUrl = `/dotest/instruction/ist/subtes${indexSubtest}`;

    // Arahkan ke URL tujuan.
    window.location.href = targetUrl;
}
/*function countdownTImer(cond) {
    
    if (cond) {
        debugger
        sessionStorage.removeItem("timeSubtest");
    } else {
        debugger
        const isActiveSubtest = sessionStorage.getItem("indexSubtest");
        let time = sessionStorage.getItem("timeSubtest");

        if (!time) {
            // Assuming dataUjian is in scope
            const subtestDurations = dataUjian.subtest[isActiveSubtest - 1].subtesDurations;
            time = subtestDurations[0];
            sessionStorage.setItem("timeSubtest", time);
        }
        console.log(time)
        debugger
        var x = setInterval(function () {
            time -= 1;
            sessionStorage.setItem("timeSubtest", time);
            const seconds = time % 60;
            const secondsInMinutes = (time - seconds) / 60;
            const minutes = secondsInMinutes % 60;

            document.getElementById("timeTest").innerHTML =
                minutes + "m:" + seconds + "s";

            if (time < 0) {
                sessionStorage.removeItem("timeSubtest");
                forceFinish(1, isActiveSubtest);
                clearInterval(x);
                $("#timeTest").text("done");
                parseInt(isActiveSubtest) === 9
                    ? document.getElementById("finishButton").click()
                    : document.getElementById("nextButton").click();
            }
        }, 1000);
    }
    console.log(sessionStorage.getItem("timeSubtest"))
    debugger
}*/
function countdownTImer() {
    const isActiveSubtest = parseInt(sessionStorage.getItem("indexSubtest"));
    let time = sessionStorage.getItem("timeSubtest" + isActiveSubtest);

    if (!time) {
        time = dataUjian.subtest[isActiveSubtest - 1].subtesDurations[0];
        sessionStorage.setItem("timeSubtest" + isActiveSubtest, time);
    }

    var x = setInterval(function () {
        time -= 1;
        sessionStorage.setItem("timeSubtest" + isActiveSubtest, time);
        const seconds = time % 60;
        const secondsInMinutes = (time - seconds) / 60;
        const minutes = secondsInMinutes % 60;

        document.getElementById("timeTest").innerHTML =
            minutes + "m:" + seconds + "s";

        if (time < 0 || sessionStorage.getItem("onLeave")) {
            sessionStorage.removeItem("timeSubtest" + isActiveSubtest);
            sessionStorage.removeItem("onLeave");
            forceFinish(1, isActiveSubtest);
            clearInterval(x);
        }
    }, 1000);
}
function displaytest(testId, indexSubtest) {
    if (indexSubtest === "0000") {
        return (window.location.href = `/dotest/instruction/ist`);
    }
    checkTabChange(indexSubtest);
    // inisialisasi untuk hit API perPagging berdasarkan indexSubtes
    let currentNumber, itemsPerPage;

    if (indexSubtest == 1) {
        currentNumber = 1;
        itemsPerPage = 20;
    } else if (indexSubtest == 2) {
        currentNumber = 21;
        itemsPerPage = 20;
    } else if (indexSubtest == 3) {
        currentNumber = 41;
        itemsPerPage = 20;
    } else if (indexSubtest == 4) {
        currentNumber = 61;
        itemsPerPage = 16;
    } else if (indexSubtest == 5) {
        currentNumber = 77;
        itemsPerPage = 20;
    } else if (indexSubtest == 6) {
        currentNumber = 97;
        itemsPerPage = 20;
    } else if (indexSubtest == 7) {
        currentNumber = 117;
        itemsPerPage = 20;
    } else if (indexSubtest == 8) {
        currentNumber = 137;
        itemsPerPage = 20;
    } else if (indexSubtest == 9) {
        currentNumber = 157;
        itemsPerPage = 20;
    } else {
        console.error("Invalid indexSubtest:", indexSubtest);
        return;
    }

    // Buat URL dengan testId yang disediakan //test id = IST
    var url =
        ApiUrl +
        `/api/Question/GetQuestionByTesto?idTest=4&currentNumber=${currentNumber}&pageSize=${itemsPerPage}`;


    $("#loading").show();
    // Lakukan permintaan AJAX menggunakan jQuery
    $.ajax({
        url: url,
        method: "GET",
        dataType: "json",
        success: function (data) {

            $("#loading").hide();
            // Logika untuk menampilkan data  melakukan operasi lainnya dengan data yang diterima
            // Ambil elemen subtes-container
            var subtesContainer = document.getElementById("subtes-container");
            countdownTImer();

            // Bersihkan kontennya (jika ada konten sebelumnya)
            subtesContainer.innerHTML = "";
            // Tentukan apakah tombol sebelumnya, tombol selanjutnya, dan tombol selesai harus ditampilkan
            var showNextButton = indexSubtest < dataUjian.subtest.length; // Tombol selanjutnya hanya ditampilkan jika indexSubtest kurang dari total subtes
            var showFinishButton = indexSubtest === dataUjian.subtest.length; // Tombol selesai hanya ditampilkan jika indexSubtest sama dengan total subtes

            // Ambil elemen-elemen tombol dari form menggunakan jQuery
            var nextButton = $("#nextButton");
            var finishButton = $("#finishButton");

            // Atur tampilan tombol berdasarkan kondisi di atas
            nextButton.css("display", showNextButton ? "inline-block" : "none");
            finishButton.css("display", showFinishButton ? "inline-block" : "none");


            // Tangani aksi klik tombol selanjutnya
            // Tangani aksi klik tombol selanjutnya

            nextButton.click(function () {
                Swal.fire({
                    title: "Apakah kamu yakin?",
                    text: "Kamu tidak akan bisa kembali!",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#4CAF50",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Ya, Saya Yakin!",
                    cancelButtonText: "Batal",
                }).then((result) => {
                    if (result.isConfirmed) {
                        $("#loading").show();
                        sessionStorage.setItem("onLeave", true);
                        var currentSoalNumber;
                        // Dapatkan data jawaban pengguna dari sessionStorage
                        var jawabanPengguna =
                            JSON.parse(sessionStorage.getItem("jawabanPengguna")) ||
                            Array(dataUjian.totalSoal).fill("0");

                        // Simpan data jawaban pengguna untuk subtes saat ini (gunakan indexSubtest sebagai kunci)
                        jawabanPengguna[indexSubtest] = jawabanPengguna[indexSubtest] || [];

                        // Loop melalui semua radio buttons pada subtes saat ini dan simpan jawaban
                        var radioButtons = document.querySelectorAll(
                            `input[type='radio'][name^='soal_${currentSoalNumber}']`
                        );
                        radioButtons.forEach(function (radioButton) {
                            if (radioButton.checked) {
                                var nomorSoal = radioButton.name.replace("soal_", "");
                                jawabanPengguna[indexSubtest][nomorSoal] = radioButton.value;
                            }
                        });

                        // Simpan kembali data jawaban pengguna ke sessionStorage
                        sessionStorage.setItem(
                            "jawabanPengguna",
                            JSON.stringify(jawabanPengguna)
                        );

                        // Lanjutkan ke subtes berikutnya
                        if (indexSubtest < dataUjian.subtest.length) {
                            sessionStorage.removeItem("timeSubtest" + indexSubtest);
                            indexSubtest++;
                            sessionStorage.setItem("indexSubtest", indexSubtest);
                            sessionStorage.setItem(
                                "tabChange",
                                sessionStorage.getItem("tabChange") - 1
                            );
                            sessionStorage.removeItem("onLeave");
                            window.location.href = "/dotest/instruction/ist";
                        }
                    }
                    return;
                    
                });
            });
            //baca data test
            loadSubtestQuestions(indexSubtest, data);

            finishButton.click(function (e) {
                e.preventDefault();
                var finisAnswer = JSON.parse(sessionStorage.getItem("jawabanPengguna"));
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
                        sessionStorage.setItem("onLeave", true);
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
                        var res = "";
                        $.ajax({
                            url: ApiUrl + "/api/Participant/GetResultTestIST",
                            method: "POST", // Change to POST method
                            contentType: "application/json", // Set content type
                            data: JSON.stringify(arrayJawaban), // Send the data in the request body
                            dataType: "json",
                            success: function (result) {
                                res = result.data;

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
                                    participant_id: parseInt(sessionStorage.getItem("participantId")),
                                    capture: filePicture,
                                    status: true,
                                };
                                $("#loading").show();

                                storeAnswer(stored);

                                $("#loading").hide();
                                sessionStorage.removeItem("timeSubtest" + indexSubtest);
                                sessionStorage.setItem("indexSubtest", parseInt(indexSubtest) + 1);
                                sessionStorage.removeItem("tabChange");
                                sessionStorage.removeItem("jawabanPengguna");
                                window.location.href = "/dotest/instruction/ist";
                            },
                            error: function (err) {
                                $("#loading").hide();

                                return;
                            },
                        });
                    }
                });
            });
        },
        error: function (error) {
            // Tangani kesalahan jika ada

            $("#loading").hide();
            console.error("Terjadi kesalahan:", error);
        },
    });
}

// Fungsi untuk memuat soal-soal dari subtes yang sesuai
function loadSubtestQuestions(indexSubtest, data) {
    // Buat elemen gambar subtes7_1
    var img_1 = document.createElement("img");
    img_1.className = "img-fluid";
    img_1.style.width = "100%";
    img_1.src = "/image/test_assets/IST/subtes7/soal 117-128.png";
    img_1.alt = "Gambar Soal 117-128.png";

    var img_2 = document.createElement("img");
    img_2.className = "img-fluid";
    img_2.style.width = "100%";
    img_2.src = "/image/test_assets/IST/subtes7/soal 129-136.png";
    img_2.alt = "Gambar Soal 129-136.png";

    var img_3 = document.createElement("img");
    img_3.className = "img-fluid";
    img_3.style.width = "100%";
    img_3.src = "/image/test_assets/IST/subtes8/soal 137-156.png";
    img_3.alt = "Gambar Soal 137-156.png";

    var jenisSoal = dataUjian.subtest[indexSubtest - 1].jenis || "";
    // Hitung indeks awal dan akhir berdasarkan indexSubtest
    var startIndex = 0;
    var endIndex = 0;
    for (var i = 0; i < indexSubtest; i++) {
        startIndex = endIndex;
        endIndex += dataUjian.subtest[i].soalPerSubtes[0];
    }
    // Ambil data soal yang sesuai dalam rentang indeks
    //var subtestQuestions = data.data.slice(startIndex, endIndex);

    //ambil data soal berdasarkan response get
    var subtestQuestions = data.data;

    // Ambil elemen subtes-container
    var subtesContainer = document.getElementById("subtes-container");
    if (jenisSoal === "pilihan_ganda_gambar") {
        subtesContainer.className = "row justify-content-center"; // Tambahkan kelas untuk CSS Grid
    }

    // Bersihkan kontennya (jika ada konten soal sebelumnya)
    subtesContainer.innerHTML = "";

    // Tentukan apakah gambar sudah ditambahkan sebelumnya
    var gambarAdded_1 = false;
    var gambarAdded_2 = false;
    var gambarAdded_3 = false;

    // Buat elemen div untuk 'gambarSubtes7-1'
    var gambarSubtes7_1 = document.createElement("div");
    gambarSubtes7_1.id = "gambarSubtes7-1";
    // Tambahkan elemen gambarSubtes7_1 ke dalam subtesContainer
    subtesContainer.appendChild(gambarSubtes7_1);

    // Buat elemen div untuk 'gambarSubtes7-2'
    var gambarSubtes7_2 = document.createElement("div");
    gambarSubtes7_2.id = "gambarSubtes7-2";

    // Tambahkan elemen gambarSubtes7_2 ke dalam subtesContainer
    subtesContainer.appendChild(gambarSubtes7_2);

    // Buat elemen div untuk 'gambarSubtes8-1'
    var gambarSubtes8_1 = document.createElement("div");
    gambarSubtes8_1.id = "gambarSubtes8-1";

    // Tambahkan elemen gambarSubtes8_1 ke dalam subtesContainer
    subtesContainer.appendChild(gambarSubtes8_1);

    // Loop melalui data soal yang sesuai
    for (var i = 0; i < subtestQuestions.length; i++) {
        var currentSoalNumber = startIndex + i + 1; // Ini adalah nomor urutan soal

        // Ambil data soal berdasarkan indeks i
        var soalData = subtestQuestions[i];

        // Cek apakah nomor soal berada dalam rentang gambar 1 atau 2
        var isGambar1 = currentSoalNumber >= 117 && currentSoalNumber <= 128;
        var isGambar2 = currentSoalNumber >= 129 && currentSoalNumber <= 136;
        var isGambar3 = indexSubtest === 8;

        // Jika belum ada gambar 1 dan nomor soal termasuk dalam rentang gambar 1
        if (!gambarAdded_1 && isGambar1) {
            // Tambahkan elemen <p> untuk nomor 117 - 128 di bawah gambar
            var pElement = document.createElement("p");
            pElement.className = "w-100 text-center  ins-gambar";
            pElement.innerHTML = "<strong>Gambar Soal Nomor 117 - 128</strong>";
            subtesContainer.appendChild(pElement);

            var gambarSubtes7_1 = createGambarSubtes(currentSoalNumber, img_1);
            subtesContainer.appendChild(gambarSubtes7_1);
            gambarAdded_1 = true;
        }

        // Jika belum ada gambar 2 dan nomor soal termasuk dalam rentang gambar 2
        if (!gambarAdded_2 && isGambar2) {
            // Tambahkan elemen <p> untuk nomor 129 - 136 di bawah gambar
            var pElement = document.createElement("p");
            pElement.className = "w-100 text-center ins-gambar";
            pElement.innerHTML = "<strong>Gambar Soal Nomor 129 - 136</strong>";
            subtesContainer.appendChild(pElement);

            var gambarSubtes7_2 = createGambarSubtes(currentSoalNumber, img_2);
            subtesContainer.appendChild(gambarSubtes7_2);
            gambarAdded_2 = true;
        }

        // Jika belum ada gambar 3 dan indexSubtest adalah 8
        if (!gambarAdded_3 && isGambar3) {
            // Tambahkan elemen <p> untuk nomor 137 - 156 di bawah gambar 3
            var pElement3 = document.createElement("p");
            pElement3.className = "w-100 text-center mt-3 ins-gambar";
            pElement3.innerHTML = "<strong>Gambar Soal Nomor 137 - 156</strong>";
            subtesContainer.appendChild(pElement3);

            var gambarSubtes8_1 = createGambarSubtes(currentSoalNumber, img_3);
            subtesContainer.appendChild(gambarSubtes8_1);
            gambarAdded_3 = true;
        }

        // Buat elemen soal sesuai dengan jenis soal
        var soalDiv;
        if (jenisSoal === "pilihan_ganda") {
            soalDiv = createPilihanGandaSoalDiv(
                currentSoalNumber,
                jenisSoal,
                soalData
            );
        } else if (jenisSoal === "essay") {
            soalDiv = createEssaySoalDiv(currentSoalNumber, jenisSoal, soalData);
        } else if (jenisSoal === "pilihan_ganda_gambar") {
            soalDiv = createPilihanGandaGambarSoalDiv(
                currentSoalNumber,
                jenisSoal,
                soalData
            );
        }

        // Tambahkan elemen soalDiv ke dalam gambar yang sesuai
        if (isGambar1) {
            var gambarSubtes7_1 = document.getElementById("gambarSubtes7-1");
            gambarSubtes7_1.appendChild(soalDiv);
        } else if (isGambar2) {
            var gambarSubtes7_2 = document.getElementById("gambarSubtes7-2");
            gambarSubtes7_2.appendChild(soalDiv);
        } else if (isGambar3) {
            var gambarSubtes8_1 = document.getElementById("gambarSubtes8-1");
            gambarSubtes8_1.appendChild(soalDiv);
        }

        // Tambahkan elemen soalDiv ke subtesContainer
        subtesContainer.appendChild(soalDiv);
    }

    // Tambahkan event listener untuk radio button di nomor terakhir
    var lastQuestionNumber = startIndex + subtestQuestions.length;
    var lastQuestionRadioButton = $(
        `input[type='radio'][name='soal_${lastQuestionNumber}']`
    );

    lastQuestionRadioButton.on("change", function () {
        var currentSoalNumber = $(this).attr("name").replace("soal_", "");
        var jawaban = $(this).val();
        simpanJawaban(currentSoalNumber, jawaban);
    });
}

function createGambarSubtes(currentSoalNumber, img) {
    var gambarDiv = document.createElement("div");
    gambarDiv.id = `gambarSubtes-${currentSoalNumber}`;
    var gambarimg = img;
    gambarimg.style.height = "100%";
    gambarDiv.appendChild(gambarimg);
    gambarDiv.classList.add("col-12");
    gambarDiv.style.padding = "0 50px";
    gambarDiv.style.height = "150px";
    $("#ujian-form").scroll(function () {
        var ujianForm = $(this);
        var data2 = $("#gambarSubtes-" + currentSoalNumber);
        var instruk = $(".ins-gambar");

        var ujianFormScrollTop = ujianForm.scrollTop();
        var data2OffsetTop = data2.position().top;

        if (ujianFormScrollTop >= data2OffsetTop) {
            data2.css({
                position: "-webkit-sticky",
                position: "sticky",
                top: "20px",
                "z-index": "1000",
                padding: "0 50px",
                background: "white",
            });
            instruk.css({
                position: "-webkit-sticky",
                position: "sticky",
                top: "0",
                "z-index": "1000",
                padding: "0 50px",
                background: "white",
            });
            instruk;
        } else {
            // Atur ulang gaya CSS jika scroll belum mencapai elemen "data2"
            data2.css({
                position: "static", // atau sesuaikan dengan posisi awal yang diinginkan
                "z-index": "auto",
                padding: "0",
                background: "none",
            });
        }
    });
    return gambarDiv;
}

function createPilihanGandaSoalDiv(currentSoalNumber, jenisSoal, soalData) {
    //simpanJawaban('176', 'A');
    var indexSubtest = sessionStorage.getItem("indexSubtest");
    var soalDiv = document.createElement("div");
    var descSoal = soalData.question_Desc;
    if (indexSubtest == 2) {
        descSoal = "";
    }
    soalDiv.className = `soal ${jenisSoal} card`;
    soalDiv.innerHTML = `
        <div class="row">
                <div class="col-2 bg-primary rounded text-white text-center m-3 d-flex align-items-center justify-content-around">
                    <p class="soal ${jenisSoal}" style="margin-bottom:0;">Soal ${currentSoalNumber}</p>
                </div>
                <div class="col pl-3">
                    <div class="row">
                        <p class="soal ${jenisSoal}"><strong>${descSoal}</strong></p>
                    </div>
                    <div class="row">
                          <div class="col form-check form-check-inline">
                            <!-- Isi untuk pilihan ganda di sini -->
            `;

    // Jika jenis pilihan_ganda, tambahkan pilihan jawaban
    soalData.tblMultipleChoices.forEach(function (pilihan, index) {
        soalDiv.querySelector(".form-check").innerHTML += `
        <div class="col">
            <label class="form-check-label" style="cursor: pointer">
                <input class="form-check-input" style="cursor: pointer" type='radio'
                name='soal_${currentSoalNumber}' value='${String.fromCharCode(65 + index)}'>

                ${pilihan.multiple_Choice_Desc}
            </label>
        </div>
        `;

        // Ambil radio button yang baru saja ditambahkan
        var inputRadio = soalDiv.querySelector(
            `input[type='radio'][name='soal_${currentSoalNumber}'][value='${String.fromCharCode(
                65 + index
            )}']`
        );

        // Menggunakan jQuery untuk menambahkan event listener ke radio button
        $(".form-check").on("change", 'input[type="radio"]', function () {
            var currentSoalNumber = $(this).attr("name").replace("soal_", ""); // Mendapatkan nomor soal dari atribut 'name'
            var jawaban = $(this).val(); // Mendapatkan nilai radio button yang dipilih

            simpanJawaban(currentSoalNumber, jawaban);
        });
    });

    soalDiv.innerHTML += `
        </div>
        <hr/>
    `;

    return soalDiv;
}

function createEssaySoalDiv(currentSoalNumber, jenisSoal, soalData) {
    var indexSubtest = sessionStorage.getItem("indexSubtest");

    let ind = "text";
    let soal = ``;
    if (parseInt(indexSubtest) === 6) {
        var num6Soal = soalData.question_Desc.split(",");
        soal += `<div class="text-left" style="justify-content: space-around;
            display: flex;
            flex-direction: row;
            align-items: flex-start;
            height: 100%;
            font-size: 16px;
            margin-top: 1.5rem;">`;
        for (let a = 0; a < num6Soal.length; a++) {
            soal += `<p>${num6Soal[a]}</p>`;
        }
        soal += `</div>`;
    } else {
        soal += `<p class="soal ${jenisSoal}"><strong>${soalData.question_Desc}</strong></p>`;
    }

    var soalDiv = document.createElement("div");
    soalDiv.className = `soal ${jenisSoal} card`;
    soalDiv.innerHTML =
        `
        <style>

        /* Hide the default number input arrows */
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }

        input[type="number"] {
            -moz-appearance: textfield;
        }
        </style>
        <div class="card-body p-0 mx-2">
        <div class="row">
                    <div class="col-md bg-primary rounded text-white m-3 d-flex justify-content-around align-items-center">
                        <p class="soal ${jenisSoal} text-center">Soal ${currentSoalNumber}</p>
                    </div>
                    <div class="col-md-6 align-self-center text-center">` +
    soal +
    `
                    </div>
                    <div class="col-md-3">
                        <input type='${ind}' class="form-control" name='soal_${currentSoalNumber}' style="margin-top:1.5rem;border-color: black;" autocomplete="off">
                    </div>
                </div>
                <hr/>
                `;

    
    var inputEssay = soalDiv.querySelector(
        `input[type='${ind}'][name='soal_${currentSoalNumber}']`
    );
    if (parseInt(indexSubtest) === 5 || parseInt(indexSubtest) === 6) {
        inputEssay.addEventListener('keypress', function (evt) {
            validate(evt);
        });
    }
    inputEssay.addEventListener("input", function () {
        var currentSoalNumber = this.getAttribute("name").replace("soal_", ""); // Mendapatkan nomor soal dari atribut 'name'
        var jawaban = this.value; // Mendapatkan nilai dari input "essay"
        simpanJawaban(currentSoalNumber, jawaban);
    });

    return soalDiv;
}

function createPilihanGandaGambarSoalDiv(
    currentSoalNumber,
    jenisSoal,
    soalData
) {
    // URL dasar gambar
    var baseUrl = "/image/test_assets/IST/";
    var indexSubtest = sessionStorage.getItem("indexSubtest");

    // Logika if-else untuk menentukan URL gambar berdasarkan indexSubtes
    var imageUrl = "";
    if (parseInt(indexSubtest) === 7) {
        imageUrl = baseUrl + "subtes7/" + soalData.question_Desc;
    } else if (parseInt(indexSubtest) === 8) {
        imageUrl = baseUrl + "subtes8/" + soalData.question_Desc;
    } else {
        // Nilai default jika indexSubtes tidak sesuai
        imageUrl = baseUrl + "default_image.png";
    }
    // Kemudian, Anda dapat menggunakan logika ini dalam innerHTML

    var soalDiv = document.createElement("div");

  soalDiv.className = `soal ${jenisSoal} card col-md-3 m-2`;
    soalDiv.innerHTML = `
    <div class="card">
            <div class="soal ${jenisSoal} card-header bg-primary rounded text-white text-center">
                Soal ${currentSoalNumber}
            </div>
        <div class="card-body shadow bg-white rounded">
                <div class="col text-center img">
                    <img src='${imageUrl}' class="img-fluid" alt='Gambar Soal ${currentSoalNumber}'>
                </div>
                <div class="col text-center">
                    <div class="form-check justify-content-between">
                        <!-- Isi untuk pilihan ganda di sini -->
                    </div>
                </div>
        </div>
    </div>
    `;

    // Jika jenis pilihan_ganda, tambahkan pilihan jawaban
    soalData.tblMultipleChoices.forEach(function (pilihan, index) {
        soalDiv.querySelector(".form-check").innerHTML += `
        <label class="form-check-label" style="cursor: pointer">
            <input class="form-check-input" style="cursor: pointer" type='radio' name='soal_${currentSoalNumber}' value='${String.fromCharCode(
            65 + index
        )}'>
            ${pilihan.multiple_Choice_Desc}
        </label><br>
    `;

        // Ambil radio button yang baru saja ditambahkan
        var inputRadio = soalDiv.querySelector(
            `input[type='radio'][name='soal_${currentSoalNumber}'][value='${String.fromCharCode(
                65 + index
            )}']`
        );

        // Menggunakan jQuery untuk menambahkan event listener ke radio button
        $(".form-check").on("change", 'input[type="radio"]', function () {
            var currentSoalNumber = $(this).attr("name").replace("soal_", ""); // Mendapatkan nomor soal dari atribut 'name'
            var jawaban = $(this).val(); // Mendapatkan nilai radio button yang dipilih
            simpanJawaban(currentSoalNumber, jawaban);
        });
    });

    return soalDiv;
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
        },
        error: function (errorMessage) {
            $("#loading").hide();
            Swal.fire(errorMessage.responseText, "", "error");
        },
    });
}

function validation() {
    Swal.fire({
        title: "Apakah kamu yakin?",
        text: "Kamu tidak akan bisa kembali!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#4CAF50",
        cancelButtonColor: "#d33",
        confirmButtonText: "Ya, Kirim!",
        cancelButtonText: "Kembali",
    }).then((result) => {
        if (result.isConfirmed) {
            return true;
        }
        return false;
    });
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
    var flag = ",SAFE";
    // Mengambil totalSoal dari objek dataUjian
    const totalSoal = dataUjian.totalSoal;
    if (!finisAnswer) {
        finisAnswer = Array(totalSoal).fill("0");
        sessionStorage.setItem("jawabanPengguna", JSON.stringify(finisAnswer));
    }

    var kosong = "0";
    for (var i = 0; i < totalSoal; i++) {
        if (finisAnswer[i] !== undefined && finisAnswer[i] !== null) {
            arrayJawaban.push(finisAnswer[i]);
        } else {
            arrayJawaban.push(kosong);
        }
    }
    switch (status) {
        case 1:
            if (indexSubtest >= 9) {
                $.ajax({
                    url: ApiUrl + "/api/Participant/GetResultTestIST",
                    method: "POST", // Change to POST method
                    contentType: "application/json", // Set content type
                    data: JSON.stringify(arrayJawaban), // Send the data in the request body
                    dataType: "json",
                    success: function (result) {
                        answe = result.data;
                        if (sessionStorage.getItem("tabChange") > 0) {
                            flag = ",VIOLATION/" + sessionStorage.getItem("tabChange");
                        }
                    },
                    error: function (err) {
                        if (err.responseJSON.data === "0") {
                            answe = "invalid";
                        } else {
                            answe = "error";
                        }
                    },
                });
            } else {
                var currentSoalNumber;
                // Dapatkan data jawaban pengguna dari sessionStorage
                var jawabanPengguna =
                    JSON.parse(sessionStorage.getItem("jawabanPengguna")) ||
                    Array(dataUjian.totalSoal).fill("0");

                // Simpan data jawaban pengguna untuk subtes saat ini (gunakan indexSubtest sebagai kunci)
                jawabanPengguna[indexSubtest] = jawabanPengguna[indexSubtest] || [];

                // Loop melalui semua radio buttons pada subtes saat ini dan simpan jawaban
                var radioButtons = document.querySelectorAll(
                    `input[type='radio'][name^='soal_${currentSoalNumber}']`
                );
                radioButtons.forEach(function (radioButton) {
                    if (radioButton.checked) {
                        var nomorSoal = radioButton.name.replace("soal_", "");
                        jawabanPengguna[indexSubtest][nomorSoal] = radioButton.value;
                    }
                });

                // Simpan kembali data jawaban pengguna ke sessionStorage
                sessionStorage.setItem(
                    "jawabanPengguna",
                    JSON.stringify(jawabanPengguna)
                );
                answe = 0;
                // Lanjutkan ke subtes berikutnya
                if (indexSubtest < dataUjian.subtest.length) {
                    indexSubtest++;
                    sessionStorage.setItem("indexSubtest", indexSubtest);
                    sessionStorage.setItem(
                        "tabChange",
                        sessionStorage.getItem("tabChange") - 1
                    );
                    window.location.href = "/dotest/instruction/ist";
                }
            }

            break;
        default:
            answe = "";
    }
    if (answe !== 0) {
        answe += flag;
        var stored = {
            answer: arrayJawaban.toString(),
            final_score: answe.toUpperCase(),
            test_id: tesActive,
            participant_id: parseInt(sessionStorage.getItem("participantId")),
            capture: filePicture,
            status: true,
        };

        storeAnswer(stored);
        
        sessionStorage.removeItem("timeSubtest");
        sessionStorage.removeItem("indexSubtest");
        sessionStorage.removeItem("jawabanPengguna");
        window.sessionStorage.removeItem("tabChange");
        window.location.href = "/user/page2";

        return;
    }
}

function validate(evt) {
    var theEvent = evt || window.event;

    // Handle paste
    if (theEvent.type === 'paste') {
        key = theEvent.clipboardData.getData('text/plain');
    } else {
        // Handle key press
        var key = theEvent.keyCode || theEvent.which;
        key = String.fromCharCode(key);
    }
    var regex = /[0-9]|\./;
    if (!regex.test(key)) {
        if (theEvent.preventDefault) {
            theEvent.preventDefault();
        } else {
            theEvent.returnValue = false;
        }
    }
}

