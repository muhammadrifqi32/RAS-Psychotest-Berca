var cameraActive = true;
$(document).ready(function () {
    startVideoStream();
});

function startVideoStream() {
    var video = $("#videoElement")[0];
    if (
        cameraActive &&
        navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia
    ) {
        // Mengakses kamera pengguna
        navigator.mediaDevices
            .getUserMedia({ video: true })
            .then(function (stream) {
                //// Set video stream sebagai sumber untuk elemen video
                video.srcObject = stream;
                video.play();
                //cameraAccessGranted = true;
            })
            .catch(function (error) {
                //console.error('Kesalahan saat mengakses kamera: ', error);
                //// Tambahan 23/08/2023 Handle ketikacamera tidak diberikan akses
                //handleCameraAccessDenied();
            });
    }
}

function faceCapture() {
  $("#inputnik").hide();
  $("#facecapture").show();
  // Ambil elemen video dan canvas dari DOM
  var video = $("#videoElement")[0];
  const canvas = $("#canvasElement")[0];
  const captureButton = $("#DoTest");

  // Variabel untuk menyimpan status apakah kamera aktif
  let cameraAccessGranted = false;
  let cameraDenied = false;

  // Cek apakah peramban mendukung getUserMedia
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // Mengakses kamera pengguna
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(function (stream) {
        // Set video stream sebagai sumber untuk elemen video
        video.srcObject = stream;
        video.play();
        cameraAccessGranted = true;
      })
      .catch(function (error) {
        console.error("Kesalahan saat mengakses kamera: ", error);
        // Tambahan 23/08/2023 Handle ketikacamera tidak diberikan akses
        cameraAccessGranted = true;
        handleCameraAccessDenied();
      });
  }

  // Tambahkan event listener untuk tombol ambil foto
  captureButton.on("click", function () {
    $("loading").show();

    // Cek apakah kamera apakah terlalu cepat?
    if (!cameraAccessGranted) {
      $("loading").hide();
      //sweet alert akses kamera tidak diberikan. Ulangi kembali dengan menekan tombol ikuti test
      Swal.fire({
        icon: "warning",
        title: "Kamera gagal mengambil gambar.",
        text: "Ulangi Kembali dengan menekan tombol Ikuti Test!",
        showCancelButton: false,
        confirmButtonText: "OK",
        allowOutsideClick: false, // Tidak memungkinkan pengguna menutup pesan dengan mengklik luar pesan
      });
      return;
    }

    if (!cameraDenied) {
      // Gambar elemen video ke elemen canvas
      canvas
        .getContext("2d")
        .drawImage(video, 0, 0, canvas.width, canvas.height);

      // Dapatkan data gambar dari canvas dalam bentuk data URI
      const dataURI = canvas.toDataURL("image/jpeg");

      // Convert data URI menjadi Blob
      const blobData = dataURItoBlob(dataURI);

      // Dapatkan nama file dengan format namaPengguna-dateNow.jpg
      const username = sessionStorage.getItem("name"); // Ganti dengan cara mendapatkan nama pengguna yang sesuai
      const fileName = `${username}-${Date.now()}.jpg`;

      // Panggil fungsi untuk mengunggah gambar ke server
      uploadImageToServer(blobData, fileName);
    } else {
      // Create a black image
      const blackCanvas = document.createElement("canvas");
      blackCanvas.width = canvas.width;
      blackCanvas.height = canvas.height;
      const blackContext = blackCanvas.getContext("2d");
      blackContext.fillStyle = "#000000";
      blackContext.fillRect(0, 0, canvas.width, canvas.height);

      const blackDataURI = blackCanvas.toDataURL("image/jpeg");
      const blackBlobData = dataURItoBlob(blackDataURI);

      const username = sessionStorage.getItem("name");
      const fileName = `${username}-${Date.now()}-denied.jpg`;

      uploadImageToServer(blackBlobData, fileName);
    }
  });

  // Fungsi untuk mengonversi Data URI menjadi Blob
  function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(",")[1]);
    const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  // Fungsi untuk melakukan pengunggahan file gambar ke server menggunakan jQuery
  function uploadImageToServer(imageData, fileName) {
    const url = "/user/UploadImage"; // URL yang ada di controller

    // Buat FormData dan tambahkan data gambar ke dalamnya
    const formData = new FormData();
    formData.append("fileData", imageData, fileName);

    // Lakukan pengiriman data gambar menggunakan AJAX
    $.ajax({
      type: "POST",
      url: url,
      data: formData,
      processData: false, // Set to false to prevent jQuery from processing the data
      contentType: false, // Set to false to prevent jQuery from setting contentType
      success: function (result) {
        $("loading").hide();

        //set session file Picture
        sessionStorage.setItem("filePicture", fileName);
        //setelah berhasil foto, pindah URL
        moveToTest();
      },
      error: function (error) {
        $("loading").hide();
        console.error("Terjadi kesalahan saat mengunggah file: ", error);
      },
    });
  }

  //tambahan 23/08/2023 handle jika kamera tidak diberi akses maka akan tercetak foto hitam
  function handleCameraAccessDenied() {
    cameraDenied = true;
  }
}

// Fungsi untuk menghentikan kamera
function stopCamera() {
  isCameraActive = true; // Set status kamera menjadi aktif
}

// Jika halaman kehilangan fokus, cek apakah kamera masih aktif dan mulai streaming kembali jika diperlukan
document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
        startVideoStream();
    }
});
