$(function () {
    $('#countNotif').text("Notification");
    $.ajax({
        url: ApiUrl + '/api/Participant/GetPar',
        type: 'GET',
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: {
            'Authorization': 'Bearer ' + sessionStorage.getItem('token')
        },
        success: function (result) {
            let total = 0;
            $.each(result.data, function (index, data) {
                var currentDate = new Date();
                var expiredDate = new Date(data.expiredDatetime);

                var timeDiff = Math.abs(currentDate.getTime() - expiredDate.getTime());

                var diffDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

                diffDays -= 1;

                if (diffDays < 1 && currentDate < expiredDate) {
                    total += 1;
                }
            });
            let message = "";
            if (total === 0 || total === "0") {
                message = " No New Notification"
                $('#message').text(message);
            } else {
                message = total + " Participants with a test time of less than 1 day"
                $('#notif').text(total);
                $('#message').text(message);

            }
            

        },
        error: function (xhr, status, error) {
            message = " No New Notification"
            $('#message').text(message);
        }
    });
});