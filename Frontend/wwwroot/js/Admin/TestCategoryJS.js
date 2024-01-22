﻿var table = null;
var tabletestname = null;
var levelCounts = {};

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
    table = $("#TblTestCategory").DataTable({
        order: [],
        autoWidth: true,
        responsive: true,
        scrollX: false,
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
            url: ApiUrl + "/api/TestCategory",
            type: "GET",
            datatype: "json",
            dataSrc: "data",
            headers: {
                Authorization: "Bearer " + sessionStorage.getItem("token"),
            },
            statusCode: {
                403: function () {
                    // Jika status respons adalah 403 (Forbidden), alihkan pengguna ke halaman "/error"
                    window.location.href = "/error/notfound";
                },
            },
            error: function (xhr, error, thrown) { },
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
                //menampilkan data level category
                data: "levelCategory",
                orderable: false,
                orderData: [1],
                render: function (data) {
                    return htmlspecialchars(data);
                },
            },
            {
                data: "testKit",
                orderable: false,
                orderData: [1],
                render: function (data, type, row, meta) {
                    return '<span id="kategori-' + row.testCategoryId + '"> </span>';
                },
            },
            {
                // Menambahkan kolom "Action" berisi tombol "Edit" dan "Delete" dengan Bootstrap
                data: null,
                orderable: false, // kolom Action tidak bisa di-sort
                render: function (data, type, row, meta) {
                    return (
                        '<button class="btn btn-warning " data-placement="left" data-toggle="modal" data-animation="false" title="Edit"  onclick="return GetById(' +
                        row.testCategoryId +
                        ')"><i class="fa fa-pen"></i></button >' +
                        "&nbsp;" +
                        '<button class="btn btn-danger" data-placement="right" data-toggle="modal" data-animation="false" title="Delete" data-index="' +
                        meta.row +
                        '" onclick="return Delete(' +
                        row.testCategoryId +
                        ',this)"><i class="fa fa-trash"></i></button >'
                    );
                },
            },
        ],
    });

    function htmlspecialchars(str) {
        var map = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;",
        };

        var outp = str.replace(/[&<>"']/g, function (m) {
            return map[m];
        });
        return outp;
    }
    $("#AddTestCategoryButton").on("click", function () {
        if (getRole !== "Super Admin") {
            return CheckAuthRole();
        }
        $("#myModal").modal("show");
        $("#tesname").hide();
        ClearScreen();
        getTableTestKit();
    });

    testname();

    async function testname() {
        try {
            const categoryResult = await $.ajax({
                url: ApiUrl + "/api/TestCategory",
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                headers: {
                    Authorization: "Bearer " + sessionStorage.getItem("token"),
                },
            });

            for (const tes of categoryResult.data) {
                const namates = [];
                const arr = tes.testKit.split(",");

                for (const number of arr) {
                    const testResult = await $.ajax({
                        url: ApiUrl + "/api/Test/" + number,
                        type: "GET",
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        headers: {
                            Authorization: "Bearer " + sessionStorage.getItem("token"),
                        },
                    });
                    namates.push(testResult.data.testName);
                }

                const cekce = namates.join(", ");
                $("#kategori-" + tes.testCategoryId).text(cekce);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }

    if ($("#testname").val() === "") {
        $("#errorMessage").text("Field testname harus diisi.");
    }
    $("#testname").on("input", function () {
        $("#errorMessage").text("");
    });
});

function getTableTestKit() {
    if ($.fn.DataTable.isDataTable("#Tbltestkit")) {
        $("#Tbltestkit").DataTable().clear().destroy(); // Hapus dan hancurkan DataTable yang ada
    }

    tabletestname = $("#Tbltestkit").DataTable({
        autoWidth: true,
        responsive: false,
        scrollX: true,
        searching: false,
        paging: false,
        lengthchange: false,
        info: false,
        order: [],
        drawcallback: function (settings) {
            var api = this.api();
            var startindex = api.context[0]._idisplaystart;
            var counter = startindex + 1;
            api
                .column(0, { page: "current" })
                .nodes()
                .each(function (cell, i) {
                    cell.innerhtml = counter;
                    counter++;
                });
        },
        ajax: {
            url: ApiUrl + "/api/Test",
            type: "get",
            datatype: "json",
            datasrc: "data",
            headers: {
                Authorization: "Bearer " + sessionStorage.getItem("token"),
            },
        },
        columns: [
            {
                data: null,
                orderable: false,
                render: function (data, type, row, meta) {
                    return meta.row + 1 + ".";
                },
            },
            {
                data: null,
                orderable: false,
                orderdata: [1],
                render: function (data, type, row, meta) {
                    return data.testName;
                },
            },
            {
                data: null,
                orderable: false,
                render: function (data, type, row) {
                    var toggleid = "toggle-" + data.testid;
                    return (
                        '<label class="custom-control custom-switch">' +
                        '<input type="checkbox" class="custom-control-input" id="' +
                        toggleid +
                        '"' +
                        (row.testkit ? "checked" : "") +
                        ' data-id="' +
                        data.testId +
                        '">' +
                        '<span style="cursor:pointer" class="custom-control-label" for="' +
                        toggleid +
                        '"></span>' +
                        "</label>"
                    );
                },
            },
        ],
        //"initComplete": function () {
        //    // Panggil handleDropdownChange() setelah tabel selesai dimuat
        //    handleDropdownChange();
        //}
    }).buttons().container().appendTo('#example1_wrapper .col-md-6:eq(0)');
}

function GetById(testCategoryId) {
    if (getRole !== "Super Admin") {
        return CheckAuthRole();
    }

    $("#cust").hide();
    $("#cust").val("");
    $("#testCategory").show();

    $.ajax({
        url: ApiUrl + "/api/TestCategory/" + testCategoryId,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: {
            Authorization: "Bearer " + sessionStorage.getItem("token"),
        },
        success: function (result) {
            var obj = result.data; //data yang didapat dari API

            $("#Id").val(obj.testCategoryId);
            $("#testCategory").val(obj.levelCategory);

            if (
                $("#testCategory").val() === null ||
                $("#testCategory").val() === ""
            ) {
                $("#testCategory").hide();
                $("#cust").show();
                $("#cust").val(obj.levelCategory);
            }

            $("#testCategory").prop("disabled", true);
            $("#before").val(obj.levelCategory);
            getTableTestKit(); // panggil table testkit kedalam modal
            $("#myModal").modal("show");
            $("#SaveBtn").hide();
            $("#UpdateBtn").show();

            setTimeout(function () {
                $("#Tbltestkit tbody tr").each(function () {
                    var testId = $(this).find('input[type="checkbox"]').attr("data-id"); // Assuming data-id attribute contains the ID
                    var testKit = obj.testKit;

                    // Memisahkan testKit menjadi array
                    var testKitArray = testKit.split(",");

                    // Memeriksa apakah testName ada di dalam testKitArray
                    if (testKitArray.includes(testId)) {
                        $(this).find('input[type="checkbox"]').prop("checked", true);
                    } else {
                        $(this).find('input[type="checkbox"]').prop("checked", false);
                    }
                });
            }, 800); //timmer agar load data di table dulu, baru jalan fungsi ini
        },
        error: function (errorMessage) {
            alert(errorMessage.responseText);
        },
    });
}

function Delete(testCategoryId, button) {
    //validasi berdasarkan role
    if (getRole !== "Super Admin") {
        return CheckAuthRole();
    }

    var index = $(button).data("index");
    var table = $("#TblTestCategory").DataTable();
    var row = table.row(index);

    if (!row || !row.data()) {
        return;
    }

    if (getRole !== "Super Admin") {
        Swal.fire(
            "Failed!",
            "Only Super Admin have access to this Action!",
            "error"
        );
        return;
    }

    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: ApiUrl + "/api/TestCategory/Delete/" + testCategoryId,
                type: "DELETE",
                dataType: "json",
                //token jwt
                headers: {
                    Authorization: "Bearer " + sessionStorage.getItem("token"),
                },
                success: function (result) {
                    Swal.fire("Deleted!", "Posisi berhasil dihapus.", "success");
                    table.ajax.reload(null, false);

                    CreateActivityUser(
                        "Has deleted test category " + row.data().levelCategory + "!"
                    );
                },
                error: function (err) {
                    if (err.status == 400) {
                        Swal.fire("Error!", "Tes sedang diikuti partisipan.", "error");
                        return;
                    } else {
                        if (getRole !== "Super Admin") {
                            Swal.fire(
                                "Error",
                                "Only Super Admin have access to this Action!",
                                "error"
                            );
                            return;
                        }
                        Swal.fire(result.responseText, "", "error");
                    }
                },
            });
        }
    });
}

function Update() {
    if (getRole !== "Super Admin") {
        return CheckAuthRole();
    }
    $("#loading").show();
    var selectedIds = [];

    var selectedIds = [];
    var testKitIds;
    if ($("#testCategory").prop("selectedIndex") === 0) {
        $("#loading").hide();
        Swal.fire("Error", "All fields must be filled.", "error");
        return; // Menghentikan pengiriman data jika ada field yang kosong
    }

    //validasi berdasarkan role
    if (getRole !== "Super Admin") {
        $("#loading").hide();
        Swal.fire(
            "Failed!",
            "Only Super Admin have access to this Action!",
            "error"
        );
        return;
    }

    // Mengiterasi setiap baris pada datatable untuk mendapatkan data yang dipilih
    $("#Tbltestkit tbody tr").each(function () {
        var testId = $(this).find('input[type="checkbox"]').attr("data-id"); // Assuming data-id attribute contains the ID
        var isChecked = $(this).find('input[type="checkbox"]').prop("checked");

        // Jika checkbox di baris ini dipilih, tambahkan data ke selectedTests
        if (isChecked) {
            var testD = { testId: testId };
            selectedIds.push(testD);
        }
    });

    // Menggabungkan nama-nama tes yang dipilih menjadi satu string dengan pemisah koma
    testKitIds = selectedIds.map((testD) => testD.testId).join(",");

    let testCat = $("#testCategory").val();
    if (testCat === null || testCat === "") {
        testCat = $("#cust").val();
    }

    var TestCategory = {
        TestCategoryId: $("#Id").val(),
        LevelCategory: testCat,
        TestKit: testKitIds,
    };

    Swal.fire({
        title: "Do you want to save the changes?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Save",
        denyButtonText: `Don't save`,
    }).then((result) => {
        $("#loading").hide();
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            $.ajax({
                url: ApiUrl + "/api/TestCategory",
                type: "PUT",
                data: JSON.stringify(TestCategory), //kirim data ke API, maka itu harus di convert ke JSON
                contentType: "application/json; charset=utf-8",
                //token jwt
                headers: {
                    Authorization: "Bearer " + sessionStorage.getItem("token"),
                },
                success: function (result) {
                    if (getRole !== "Super Admin") {
                        Swal.fire(
                            "Error",
                            "Only Super Admin have access to this Action!",
                            "error"
                        );
                        return;
                    }
                    if (
                        result.status == 201 ||
                        result.status == 204 ||
                        result.status == 200
                    ) {
                        Swal.fire("Saved!", "", "success");

                        // Reload tabel secara otomatis setelah update data

                        CreateActivityUser(
                            "Has updated Test Category " + $("#before").val() + "!"
                        );

                        table.ajax.reload(null, false);
                        setTimeout(function () {
                            window.location.reload();
                        }, 2000);
                    }
                },
                error: function (errorMessage) {
                    $("#loading").hide();
                    Swal.fire("Error", errorMessage.responseJSON.message, "error");
                },
            });
        } else if (result.isDenied) {
            $("#loading").hide();
            Swal.fire("Changes are not saved", "", "info");
        }
    });
    closeModal();
}

function Save() {
    if (getRole !== "Super Admin") {
        return CheckAuthRole();
    }

    $("#loading").show();
    var selectedIds = [];
    var testKitIds;

    // alert field kosong
    if ($("#testCategory").prop("selectedIndex") === 0) {
        Swal.fire("Failed!", "All fields must be filled.", "error");
        return; // Menghentikan pengiriman data jika ada field yang kosong
    }

    //validasi berdasarkan role
    if (getRole !== "Super Admin") {
        $("#loading").hide();
        Swal.fire(
            "Failed!",
            "Only Super Admin have access to this Action!",
            "error"
        );
        return;
    }

    // Mengiterasi setiap baris pada datatable untuk mendapatkan data yang dipilih
    $("#Tbltestkit tbody tr").each(function () {
        var testId = $(this).find('input[type="checkbox"]').attr("data-id"); // Assuming data-id attribute contains the ID
        var isChecked = $(this).find('input[type="checkbox"]').prop("checked");

        // Jika checkbox di baris ini dipilih, tambahkan data ke selectedTests
        if (isChecked) {
            var testD = { testId: testId };
            selectedIds.push(testD);
        }
    });

    // Menggabungkan nama-nama tes yang dipilih menjadi satu string dengan pemisah koma
    testKitIds = selectedIds.map((testD) => testD.testId).join(",");

    let lvlCat = $("#testCategory").val();
    if (lvlCat === "Customize") {
        lvlCat = $("#testname").val();
    }
    var TestCategory = {
        LevelCategory: lvlCat,
        TestKit: testKitIds,
    };

    $.ajax({
        type: "POST",
        url: ApiUrl + "/api/TestCategory/PostTestCategory",
        data: JSON.stringify(TestCategory),
        contentType: "application/json; charset=utf-8",
        //token jwt
        headers: {
            Authorization: "Bearer " + sessionStorage.getItem("token"),
        },
        success: function (result) {
            $("#loading").hide();
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
                CreateActivityUser("Has Created Test Category " + lvlCat + " !");

                table.ajax.reload(null, false);
                setTimeout(function () {
                    window.location.reload();
                }, 2000);
            }
        },
        error: function (errorMessage) {
            $("#loading").hide();
            if (getRole !== "Super Admin") {
                Swal.fire(
                    "Error",
                    "Only Super Admin have access to this Action!",
                    "error"
                );
                return;
            }
            $("#tesname").hide();
            Swal.fire("Gagal", errorMessage.responseJSON.message, "error");
        },
    });
}

// Modifikasi fungsi handleDropdownChange() untuk memasukkan mode
function handleDropdownChange() {
    var selectedValue = $("#testCategory").val(); // Nilai terpilih dari dropdown
    var selectedId = $("#testCategory").find("option:selected").attr("id");

    switch (selectedId) {
        case "managerOption":
            $("#tesname").hide();

            // Menggunakan perulangan forEach untuk mengakses setiap baris data
            $("#Tbltestkit tbody tr").each(function () {
                var testName = $(this).find("td:nth-child(2)").text().trim();

                // Jika kolom 'testName' adalah 'IST' atau 'DISC', aktifkan/checked checkbox
                if (testName === "IST" || testName === "DISC") {
                    $(this).find('input[type="checkbox"]').prop("checked", true);
                } else {
                    $(this).find('input[type="checkbox"]').prop("checked", false);
                }
            });
            break;
        case "nonManagerOption":
            $("#tesname").hide();

            // Menggunakan perulangan forEach untuk mengakses setiap baris data
            $("#Tbltestkit tbody tr").each(function () {
                //menemukan elemen <td> kedua (kolom "Test Name") dalam baris saat ini
                //Kemudian, text() digunakan untuk mengambil teks yang ada di dalam elemen <td>.
                // kemudian diterapkan pada teks yang diambil untuk menghapus spasi kosong di awal dan akhir teks.
                var testName = $(this).find("td:nth-child(2)").text().trim();

                // Jika kolom 'testName' adalah 'IST' atau 'DISC', aktifkan/checked checkbox
                if (testName === "DISC") {
                    $(this).find('input[type="checkbox"]').prop("checked", true);
                } else {
                    $(this).find('input[type="checkbox"]').prop("checked", false);
                }
            });
            break;
        case "customizeOption":
            $("#Tbltestkit tbody tr").each(function () {
                $(this).find('input[type="checkbox"]').prop("checked", false);
            });
            $("#tesname").show();
            break;
        default:
            break;
    }
}

function ClearScreen() {
    if (getRole !== "Super Admin") {
        return CheckAuthRole();
    }

    $("#cust").hide();
    $("#cust").val("");
    $("#testCategory").show();
    $("#Id").val("");
    $("#LevelCategory").val("");
    $("#testCategory").prop("selectedIndex", 0); //balik ke indeks paling atas selected itemnya
    $("#UpdateBtn").hide();
    $("#SaveBtn").show();
    if (tabletestname) {
        tabletestname.clear().draw(); // Mengosongkan isi tabel tetapi mempertahankan judul
    }

    // Mengosongkan selectedTests
    //selectedTests = [];
    $("#testCategory").prop("disabled", false);
    $("#loading").hide();
}

function closeModal() {
    $("#myModal").modal("hide");
    ClearScreen();
    if (tabletestname) {
        tabletestname.destroy();
    }
}
