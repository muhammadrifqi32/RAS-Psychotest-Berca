$("#logoutClick").on("click", function () {
  location.replace("/");
  sessionStorage.clear();
  localStorage.clear();
  setTimeout(function () {
    window.location.reload(true);
  }, 2000); // Ubah angka 1000 menjadi waktu penundaan yang sesuai (dalam milidetik)
});
