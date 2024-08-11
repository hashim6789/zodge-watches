document.addEventListener("DOMContentLoaded", function () {
  const thumbnails = document.querySelectorAll(".image-sidebar img");
  const mainImage = document.getElementById("main-image");
  const zoomLens = document.querySelector(".zoom-lens");
  const zoomResult = document.querySelector(".zoom-result");
  const zoomedImage = document.getElementById("zoomed-image");

  thumbnails.forEach((thumbnail) => {
    thumbnail.addEventListener("click", function () {
      const index = this.getAttribute("data-index");
      const productId = this.getAttribute("data-id");

      // Make an Axios request to get the image path
      axios
        .get(`/user/shop/getImagePath?index=${index}&id=${productId}`)
        .then((response) => {
          const newSrc = response.data.src;
          mainImage.src = newSrc;
          zoomedImage.src = newSrc;
          thumbnails.forEach((img) => img.classList.remove("active"));
          this.classList.add("active");
        })
        .catch((error) => {
          console.error("Error fetching the image path:", error);
        });
    });
  });

  mainImage.addEventListener("mousemove", function (e) {
    const rect = mainImage.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const lensWidth = zoomLens.offsetWidth / 2;
    const lensHeight = zoomLens.offsetHeight / 2;

    // Position the lens
    zoomLens.style.display = "block";
    zoomLens.style.left = `${x - lensWidth}px`;
    zoomLens.style.top = `${y - lensHeight}px`;
    zoomResult.style.display = "block";

    // Calculate zoomed image position
    const zoomX = (x / mainImage.offsetWidth) * zoomedImage.offsetWidth;
    const zoomY = (y / mainImage.offsetHeight) * zoomedImage.offsetHeight;

    zoomedImage.style.left = `-${zoomX - zoomResult.offsetWidth / 2}px`;
    zoomedImage.style.top = `-${zoomY - zoomResult.offsetHeight / 2}px`;
  });

  mainImage.addEventListener("mouseleave", function () {
    zoomLens.style.display = "none";
    zoomResult.style.display = "none";
  });
});
