var table = null;
var moment = window.moment;
//fungsi yang akan otomatis terload
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
    //table = $("#TblHistoryLog").DataTable({
    //    // Design Assets
    //    autoWidth: true,
    //    responsive: false,
    //    scrollX: true,
    //    order: false, // menghilangkan sort asc/desc pada tabel head yng disable sort
    //    ajax: {
    //        url: ApiUrl + "/api/HistoryLog",
    //        type: "GET",
    //        datatype: "json",
    //        dataSrc: "data",
    //        // jwt authorize token
    //        headers: {
    //            Authorization: "Bearer " + sessionStorage.getItem("token"),
    //        },
    //        statusCode: {
    //            403: function () {
    //                // Jika status respons adalah 403 (Forbidden), alihkan pengguna ke halaman "/dashboard"
    //                window.location.href = "/error/notfound";
    //            },
    //        },
    //        error: function (xhr, error, thrown) { },
    //    },
    //    columns: [
    //        {
    //            //menampilkan data name
    //            data: "account.name",
    //            orderable: false,
    //        },
    //        {
    //            //menampilkan data nama role
    //            data: "account.role.roleName",
    //            orderable: false,
    //            render: function (data) {
    //                return data;
    //            },
    //        },
    //        {
    //            //menampilkan data aktifitas
    //            data: "activity",
    //            orderable: false,
    //            render: function (data) {
    //                return htmlspecialchars(data);
    //            },
    //        },
    //        {
    //            //menampilkan data timestamp
    //            data: "timestamp",
    //            orderable: true,
    //            render: function (data) {
    //                moment.locale("id");
    //                return moment(data).format("D MMMM YYYY [,] HH.mm");
    //            },
    //        },
    //    ],
    //});

    table = $("#TblHistoryLog").DataTable({
        // Design Assets
        autoWidth: true,
        responsive: false,
        scrollX: true,
        order: false, // menghilangkan sort asc/desc pada tabel head yng disable sort
        //server side
        processing: true,
        serverSide: true,
        filter: true,
        searching: true,
        ajax: {
            url: ApiUrl + "/api/HistoryLog/GetByPaging",
            type: "POST",
            datatype: "json",
            dataSrc: "data",
            // jwt authorize token
            headers: {
                Authorization: "Bearer " + sessionStorage.getItem("token"),
            },
            statusCode: {
                403: function () {
                    // Jika status respons adalah 403 (Forbidden), alihkan pengguna ke halaman "/dashboard"
                    window.location.href = "/error/notfound";
                },
            },
            error: function (xhr, error, thrown) { },
        },
        columns: [
            {
                //menampilkan data name
                data: "account.name",
                orderable: false,
            },
            {
                //menampilkan data nama role
                data: "account.role.roleName",
                orderable: false,
                render: function (data) {
                    return data;
                },
            },
            {
                //menampilkan data aktifitas
                data: "activity",
                orderable: false,
                render: function (data) {
                    return htmlspecialchars(data);
                },
            },
            {
                //menampilkan data timestamp
                data: "timestamp",
                orderable: false,
                render: function (data) {
                    moment.locale("id");
                    return moment(data).format("D MMMM YYYY [,] HH.mm");
                },
            },
        ],
    });
    // ServerSide Setups

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
});
