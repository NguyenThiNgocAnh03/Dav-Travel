document.addEventListener("DOMContentLoaded", async () => {
  const api = "http://localhost:3000";
  const bookedList = document.getElementById("booked-list");
  const tabs = document.querySelectorAll(".tab-btn");
  const cancelOverlay = document.getElementById("cancelFormOverlay");
  const cancelPopup = document.getElementById("cancelFormPopup");
  const cancelForm = document.getElementById("cancelForm");
  const closeCancelFormBtn = document.getElementById("closeCancelForm");

  let allBookings = [];
  let filteredBookings = [];
  let cancelBooking = null;
  let currentStatus = "Đã đặt";

  // ===== Lấy session hiện tại =====
  async function getCurrentSession() {
    try {
      const res = await fetch(`${api}/session`);
      const sessions = await res.json();
      return sessions.find(s => s.isLoggedIn) || null;
    } catch {
      return null;
    }
  }

  const session = await getCurrentSession();
  if (!session) {
    alert("Bạn cần đăng nhập để xem lịch sử tour!");
    window.location.href = "user.html?mode=login";
    return;
  }

  // ===== Lấy bookings =====
  async function getBookings() {
    try {
      const res = await fetch(`${api}/bookings`);
      const bookings = await res.json();
      allBookings = bookings.filter(b => String(b.userId) === String(session.userId));
      filterByStatus(currentStatus);
    } catch {
      bookedList.innerHTML = "<p>Không thể tải dữ liệu.</p>";
    }
  }

  function filterByStatus(status) {
    currentStatus = status;
    filteredBookings = allBookings.filter(b => b.status === status);
    renderBookings();
  }

  function renderBookings() {
    if (filteredBookings.length === 0) {
      bookedList.innerHTML = "<p>Không có tour nào.</p>";
      return;
    }

    bookedList.innerHTML = filteredBookings.map(b => `
      <div class="tour-card">
        ${b.image ? `<img src="${b.image}" alt="${b.tourName}" class="tour-card-img">` : ""}
        <h4>${b.tourName}</h4>
        <p><b>Ngày đi:</b> ${b.travelDate}</p>
        <p><b>Số người:</b> ${b.quantity}</p>
        <p><b>Ghi chú:</b> ${b.note || "Không có"}</p>
        <p><b>Trạng thái:</b> ${b.status}</p>
        ${b.status === "Đã hủy" ? `<p><b>Lý do hủy:</b> ${b.reason || "Không có"}</p>` : ""}
        ${b.status === "Đã đặt" ? `<button class="cancel-btn-tour" data-id="${b.id}">Hủy tour</button>` : ""}
      </div>
    `).join("");

    document.querySelectorAll(".cancel-btn-tour").forEach(btn => {
      btn.addEventListener("click", e => {
        const id = e.target.dataset.id;
        cancelBooking = filteredBookings.find(b => String(b.id) === String(id));
        openCancelForm(cancelBooking);
      });
    });
  }

  // ===== Tabs =====
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      filterByStatus(tab.dataset.status);
    });
  });

  // ===== Hủy tour =====
  function openCancelForm(booking) {
    cancelOverlay.style.display = "block";
    cancelPopup.style.display = "flex";
    document.body.style.overflow = "hidden";

    document.getElementById("cancelFullName").value = booking.fullName;
    document.getElementById("cancelEmail").value = booking.email;
    document.getElementById("cancelPhone").value = booking.phone;
    document.getElementById("cancelReason").value = "";
  }

  function closeCancelForm() {
    cancelOverlay.style.display = "none";
    cancelPopup.style.display = "none";
    document.body.style.overflow = "auto";
    cancelBooking = null;
  }

  closeCancelFormBtn.addEventListener("click", closeCancelForm);
  cancelOverlay.addEventListener("click", closeCancelForm);

  cancelForm.addEventListener("submit", async e => {
    e.preventDefault();
    if (!cancelBooking) return;

    const reason = document.getElementById("cancelReason").value.trim();
    if (!reason) return alert("Vui lòng nhập lý do hủy!");

    try {
      const res = await fetch(`${api}/bookings/${cancelBooking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Đã hủy",
          reason: reason
        })
      });

      if (!res.ok) throw new Error("Cập nhật booking thất bại");

      alert("Hủy tour thành công!");
      await getBookings(); // tải lại danh sách
      closeCancelForm();
    } catch (err) {
      console.error(err);
      alert("Có lỗi khi hủy tour: " + err.message);
    }
  });

  await getBookings();
});
