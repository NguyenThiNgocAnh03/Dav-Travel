document.addEventListener("DOMContentLoaded", () => {
  const api = "http://localhost:3000";
  const tourContainer = document.getElementById("all-tours");
  const modal = document.getElementById("tour-modal");
  const modalBanner = document.getElementById("modal-banner");
  const modalInfo = document.getElementById("modal-info");
  const closeModal = document.querySelector(".close-btn");
  const bookNowBtn = document.getElementById("bookNowBtn");
  const overlay = document.getElementById("overlay");
  const bookingPopup = document.getElementById("bookingFormPopup");
  const bookingForm = document.getElementById("bookingForm");
  const closeForm = document.getElementById("closeForm");
  const searchInput = document.getElementById("search-input");
  const filterSelect = document.getElementById("filter-select");

  let allTours = [];
  let selectedTour = null;

  // ===== Load tours =====
  fetch(`${api}/tours`)
    .then(res => res.json())
    .then(data => {
      allTours = data;
      renderTours(allTours);
    })
    .catch(err => {
      console.error("Không tải được tours:", err);
      tourContainer.innerHTML = "<p>Không tải được dữ liệu tours.</p>";
    });

  // ===== Render tour cards =====
  function renderTours(tours) {
    tourContainer.innerHTML = tours.map(t => `
      <div class="tour-card" data-id="${t.id}">
        <img src="${t.image}" alt="${t.name}">
        <div class="tour-info">
          <h3>${t.name}</h3>
          <p>${t.description}</p>
          <p class="price">${t.price.toLocaleString("vi-VN")} VND</p>
          <button class="detail-btn">Chi tiết</button>
          <button class="book-btn-card">Đặt tour</button>
        </div>
      </div>
    `).join("");
  }

  // ===== Event delegation cho chi tiết & đặt tour =====
  tourContainer.addEventListener("click", async e => {
    const card = e.target.closest(".tour-card");
    if (!card) return;
    const id = card.dataset.id;
    selectedTour = allTours.find(t => t.id === id); // ✅ so sánh chặt chẽ (chuỗi)

    if (e.target.classList.contains("detail-btn")) {
      showModal(selectedTour);
    } else if (e.target.classList.contains("book-btn-card")) {
      await checkLoginBeforeBooking();
    }
  });

  // ===== Modal chi tiết tour =====
  function showModal(tour) {
    modalBanner.innerHTML = `<img src="${tour.image}" style="width:100%;height:250px;object-fit:cover;">`;
    modalInfo.innerHTML = `
      <h2>${tour.name}</h2>
      <p><b>Mô tả:</b> ${tour.description}</p>
      <p><b>Giá:</b> ${tour.price.toLocaleString("vi-VN")} VND</p>
      <p><b>Khu vực:</b> ${tour.region}</p>
      <p><b>Thời gian:</b> ${tour.duration}</p>
      ${tour.rating ? `<p><b>Đánh giá:</b> ${tour.rating}</p>` : ""}
      ${tour.highlight ? `<p><b>Tour nổi bật</b></p>` : ""}
      ${tour.maxPeople ? `<p><b>Số lượng tối đa:</b> ${tour.maxPeople}</p>` : ""}
      ${tour.notes ? `<p><b>Ghi chú:</b> ${tour.notes}</p>` : ""}
      <h3>Lịch trình chi tiết:</h3>
      <ul>
        ${tour.itinerary.map(day => `<li><b>${day.day} - ${day.title}:</b> ${day.activities.join(", ")}</li>`).join("")}
      </ul>
    `;
    modal.style.display = "flex";
    bookNowBtn.dataset.id = tour.id;
  }

  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
    selectedTour = null;
  });

  bookNowBtn.addEventListener("click", async () => {
    if (!selectedTour) return alert("Tour chưa chọn!");
    await checkLoginBeforeBooking();
  });

  // ===== Kiểm tra đăng nhập =====
  async function checkLoginBeforeBooking() {
    const session = await getCurrentSession();
    if (!session) {
      alert("Bạn cần đăng nhập để đặt tour!");
      window.location.href = "user.html?mode=login";
      return;
    }
    openBookingForm(session);
  }

  // ===== Mở form đặt tour =====
  function openBookingForm(session) {
    modal.style.display = "none";
    overlay.style.display = "block";
    bookingPopup.style.display = "block";
    document.body.style.overflow = "hidden";

    document.getElementById("fullName").value = session.userName || "";
    document.getElementById("email").value = session.userEmail || "";
    document.getElementById("phone").value = "";
    document.getElementById("quantity").value = 1;
    document.getElementById("travelDate").value = "";
    document.getElementById("note").value = "";
  }

  function closeBookingForm() {
    overlay.style.display = "none";
    bookingPopup.style.display = "none";
    document.body.style.overflow = "auto";
    selectedTour = null;
  }

  closeForm.addEventListener("click", closeBookingForm);
  overlay.addEventListener("click", e => {
    if (e.target === overlay) closeBookingForm();
  });

  // ===== Submit booking =====
  bookingForm.addEventListener("submit", async e => {
    e.preventDefault();
    const session = await getCurrentSession();
    if (!session || !selectedTour) return alert("Lỗi session hoặc tour chưa chọn!");

    const bookingData = {
      id: String(Date.now()), // ✅ ép về chuỗi để đồng bộ db.json
      userId: String(session.userId),
      tourId: String(selectedTour.id),
      tourName: selectedTour.name,
      fullName: document.getElementById("fullName").value.trim(),
      email: document.getElementById("email").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      quantity: parseInt(document.getElementById("quantity").value),
      travelDate: document.getElementById("travelDate").value,
      note: document.getElementById("note").value.trim(),
      dateBooked: new Date().toISOString().split("T")[0],
      status: "Đã đặt",
      reason: ""
    };

    if (!bookingData.fullName || !bookingData.email || !bookingData.phone || !bookingData.travelDate) {
      return alert("Vui lòng nhập đầy đủ thông tin!");
    }

    if (selectedTour.maxPeople && bookingData.quantity > selectedTour.maxPeople) {
      return alert(`Chỉ tối đa ${selectedTour.maxPeople} người cho tour này!`);
    }

    try {
      const res = await fetch(`${api}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData)
      });
      if (!res.ok) throw new Error("Không thể đặt tour");

      alert("Đặt tour thành công!");
      closeBookingForm();
    } catch (err) {
      console.error(err);
      alert("Có lỗi khi lưu booking!");
    }
  });

  // ===== Tìm kiếm & lọc =====
  searchInput.addEventListener("input", filterTours);
  filterSelect.addEventListener("change", filterTours);

  function filterTours() {
    const keyword = searchInput.value.toLowerCase();
    const filter = filterSelect.value;
    const filtered = allTours.filter(t => {
      const match = t.name.toLowerCase().includes(keyword);
      if (filter === "highlight") return t.highlight && match;
      if (filter === "north") return t.region === "Miền Bắc" && match;
      if (filter === "central") return t.region === "Miền Trung" && match;
      if (filter === "south") return t.region === "Miền Nam" && match;
      return match;
    });
    renderTours(filtered);
  }

  // ===== Lấy session hiện tại =====
  async function getCurrentSession() {
    try {
      const res = await fetch(`${api}/session`);
      const sessions = await res.json();
      return sessions.find(s => s.isLoggedIn) || null;
    } catch (err) {
      console.error("Không lấy được session:", err);
      return null;
    }
  }
});
