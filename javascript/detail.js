// Lấy id tour từ localStorage
const tourId = parseInt(localStorage.getItem("selectedTourId"));

// Hiển thị thông tin tour
fetch("http://localhost:3000/tours")
    .then(res => res.json())
    .then(tours => {
        const tour = tours.find(t => t.id === tourId);
        if (tour) {
            document.getElementById("tour-name").innerText = tour.name;
            document.getElementById("tour-image").src = tour.image;
            document.getElementById("tour-region").innerText = "Khu vực: " + tour.region;
            document.getElementById("tour-price").innerText = "Giá: " + tour.price.toLocaleString() + " VND";
            document.getElementById("tour-description").innerText = tour.description;
        }
    });

// Hiển thị form khi nhấn nút "Đặt tour"
const bookBtn = document.getElementById("bookTourBtn");
const bookingForm = document.getElementById("bookingForm");

bookBtn.addEventListener("click", () => {
    bookingForm.style.display = "block"; // Hiển thị form
    bookBtn.style.display = "none"; // Ẩn nút đặt tour

    // Nếu user đã đăng nhập, tự động điền tên + email
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (user) {
        document.getElementById("fullname").value = user.username;
        document.getElementById("email").value = user.email;
    }
});

// Xử lý submit form
bookingForm.addEventListener("submit", function(e) {
    e.preventDefault();
    const fullname = document.getElementById("fullname").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const people = parseInt(document.getElementById("people").value);
    const date = document.getElementById("date").value;

    const bookingData = { tourId, fullname, email, phone, people, date };

    fetch("http://localhost:3000/bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bookingData)
        })
        .then(res => res.json())
        .then(() => {
            alert("Đặt tour thành công!");
            bookingForm.reset();
            bookingForm.style.display = "none";
            bookBtn.style.display = "block"; // Hiển thị lại nút đặt tour
        });
});