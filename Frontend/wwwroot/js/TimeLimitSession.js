function checkTimeSession() {
    var currentTime = new Date().getTime();

    if (currentTime > localStorage.getItem("batasWaktuSession") && localStorage.getItem("token") !== null) {
        Swal.fire({
            title: "Waktu Session Sudah Berakhir!",
            text: "Harap Login Kembali.",
            icon: "question",
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Close",
            allowOutsideClick: false,
        }).then((result) => {
            if (result.isConfirmed) {
                //debugger;
                localStorage.clear();
                sessionStorage.clear();
                var getCurrentPathUrl = window.location.pathname;
                if (getCurrentPathUrl != "/") {
                    window.location.href = "/";
                }
                return;
            }
        });
    }
}