var table = null;

//fungsi yang akan otomatis terload
$(document).ready(function () {
    if (getRole === undefined) {
        window.location.href = "/";
    } else if (getRole !== "Super Admin") {
        window.location.href = "/error/notfound";
    }

    //if (!localStorage.getItem("token") || (sessionStorage.getItem("token") && localStorage.getItem("token") !== sessionStorage.getItem("token"))) {

    //    location.replace("/");
    //    sessionStorage.clear();
    //    setTimeout(function () {
    //        window.location.reload(true);
    //    }, 2000); // Ubah angka 1000 menjadi waktu penundaan yang sesuai (dalam milidetik)

    //}

    table = $("#TblAccount").DataTable({
        autoWidth: true,
        responsive: false,
        scrollX: true,
        order: [], // menghilangkan sort asc/desc pada tabel head yng disable sort
        //server side
        processing: true,
        serverSide: true,
        filter: true,
        searching: true,
        // draw atau re-draw datatables
        drawCallback: function (settings) {
            // mengatur nomor urut berdasarkan halaman dan halaman terakhir
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
            url: ApiUrl + "/api/Accounts/GetAdminByPaging",
            type: "POST",
            datatype: "json",
            dataSrc: "data",
            headers: {
                Authorization: "Bearer " + sessionStorage.getItem("token"),
            },
            statusCode: {
                403: function () {
                    // Jika status respons adalah 403 (Forbidden), alihkan pengguna ke halaman "/dashboard"
                    window.location.href = "/error/notfound";
                },
            },
            // untuk redirect page, karena claims role jwt tidak sesuai
            error: function (xhr, error, thrown) {
                $("#TblAccount").DataTable().clear().draw(); // Menghapus konten tabel
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
                //menampilkan data name
                data: "name",
                orderable: false,
                orderData: [1],
            },
            {
                //menampilkan data email
                data: "email",
                orderable: false,
            },
            {
                //menampilkan data role
                data: "role.roleName",
                orderable: false,
                orderData: [1],
            },
            {
                //hapus delete btn
                // Menambahkan kolom "Action" berisi tombol "Edit" dan "Delete" dengan Bootstrap
                data: null,
                orderable: false, // kolom Action tidak bisa di-sort
                render: function (data, type, row, meta) {
                    return (
                        '<button class="btn btn-danger" data-placement="right" data-toggle="modal" data-animation="false" title="Delete" data-index="' +
                        meta.row +
                        '" onclick="return Delete(' +
                        row.accountId +
                        ')"><i class="fa fa-trash"></i></button >'
                    );
                },
                //    }
            },
        ],
    });

    //fungsi showpassword di modal
    $("#ShowPassword").click(function () {
        var passwordInput = $("#Password");
        var showPasswordCheckbox = $(this);

        if (showPasswordCheckbox.is(":checked")) {
            passwordInput.attr("type", "text");
        } else {
            passwordInput.attr("type", "password");
        }
    });
});

function ClearScreen() {
    if (getRole !== "Super Admin") {
        return CheckAuthRole();
    }

    $("#myModal").modal("show");

    $("#Id").val("");
    $("#Name").val("");
    $("#Email").val("");
    $("#Password").val("");
    $("#UpdateBtn").hide();
    $("#SaveBtn").show();

    $("#ShowPassword").prop("checked", false);
    $("#option_admin").prop("checked", true);
    $("#option_audit").prop("checked", false);
    $("#loading").hide();
}

function GetById(accountId) {
    if (getRole !== "Super Admin") {
        return CheckAuthRole();
    }

    $.ajax({
        url: ApiUrl + "/api/Accounts/" + accountId,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        //token jwt
        headers: {
            Authorization: "Bearer " + sessionStorage.getItem("token"),
        },
        success: function (result) {
            var obj = result.data; //data yang didapat dari API
            $("#Id").val(obj.accountId);
            $("#Name").val(obj.name);
            $("#Email").val(obj.email);
            $("#Password").val(obj.password);
            $("#myModal").modal("show");
            $("#SaveBtn").hide();
            $("#UpdateBtn").show();
        },
        error: function (errorMessage) {
            alert(errorMessage.responseText);
        },
    });
}

function Save() {
    $("#loading").show();
    if (getRole !== "Super Admin") {
        return CheckAuthRole();
    }

    if (
        $("#Name").val() === "" ||
        $("#Email").val() === "" ||
        $("#Password").val().trim() === ""
    ) {
        $("#loading").hide();
        Swal.fire("Error", "All fields must be filled.", "error");
        return; // Menghentikan pengiriman data jika ada field yang kosong
    }
    var checkName = $("#Name").val();
    var checkemail = $("#Email").val();
    var checkpassword = $("#Password").val();

    // checking fullname
    if (/^\s*$/.test(checkName)) {
        $("#loading").hide();
        Swal.fire("Error", "The name cannot contain only spaces.", "error");
        return;
    }
    if (/^\s/.test(checkName)) {
        $("#loading").hide();
        Swal.fire(
            "Error",
            "Remove the space in front of the word in the Name column.",
            "error"
        );
        return;
    }
    // Check email
    if (/\s/.test(checkemail) || /^\s|\s$|\s\s+/.test(checkemail)) {
        $("#loading").hide();
        Swal.fire("Error", "Emails cannot contain spaces.", "error");
        return;
    }
    // Check if the password contains any spaces
    if (/\s/.test(checkpassword)) {
        $("#loading").hide();
        Swal.fire("Error", "Passwords cannot contain spaces.", "error");
        return;
    }
    // Check password length, jika kurang dari 8 muncul error
    if (checkpassword.length < 6) {
        $("#loading").hide();
        Swal.fire(
            "Error",
            "A password must have at least six characters.",
            "error"
        );
        return;
    }

    var role;
    var Account = new Object();
    Account.Name = $("#Name").val();
    Account.Email = $("#Email").val();
    Account.Password = $("#Password").val();
    //if (Account.Name === "") {
    //    alert("Full Name is required");
    //    return;
    //}
    if ($("#option_admin").prop("checked")) {
        role = 2;
    } else {
        role = 3;
    }
    Account.RoleId = role;

    $.ajax({
        type: "POST",
        url: ApiUrl + "/api/Accounts/RegisterAdmin",
        data: JSON.stringify(Account),
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
                //reload
                CreateActivityUser("Has Register Admin " + Account.Name + "!");
                table.ajax.reload(null, false);
            } else if (result.status == 401 || result.status == 403) {
                Swal.fire(
                    "Error",
                    "Only Super Admin have access to this Action!",
                    "error"
                );
            }
        },
        error: function (errorMessage) {
            if (getRole !== "Super Admin") {
                Swal.fire(
                    "Error",
                    "Only Super Admin have access to this Action!",
                    "error"
                );
                return;
            }
            Swal.fire(errorMessage.responseJSON.message, "", "error");
            $("#loading").hide();
        },
    });
}

function Delete(accountId) {
    if (getRole !== "Super Admin") {
        return CheckAuthRole();
    }

    var index = $(this).data("index");
    var table = $("#TblAccount").DataTable();
    var row = table.row(index);

    if (!row || !row.data()) {
        return;
    }
    if (getRole !== "Super Admin" && getRole !== "Admin") {
        Swal.fire(
            "Failed!",
            "Only Super Admin Or Admins have access to this Action!",
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
                url: ApiUrl + "/api/Accounts/SoftDelete?id=" + accountId,
                type: "PUT",
                dataType: "json",
                //token jwt
                headers: {
                    Authorization: "Bearer " + sessionStorage.getItem("token"),
                },
            }).then((result) => {
                if (
                    result.status == 201 ||
                    result.status == 204 ||
                    result.status == 200
                ) {
                    Swal.fire("Deleted!", "Your file has been deleted.", "success");
                    // Reload tabel secara otomatis setelah menghapus data

                    CreateActivityUser("Has Deleted Admin " + row.data().name + "!");

                    table.ajax.reload(null, false);
                } else {
                    if (getRole !== "Super Admin") {
                        Swal.fire(
                            "Error",
                            "Only Super Admin have access to this Action!",
                            "error"
                        );
                        return;
                    }
                    Swal.fire(result.responseJson.message, "", "error");
                }
            });
        }
    });
}

function closeModal() {
    $("#myModal").modal("hide");
}
