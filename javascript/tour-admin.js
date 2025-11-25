//  API giả lập từ db.json
const API_URL = "http://localhost:3000/tours";

document.addEventListener("DOMContentLoaded", () => {
  const tourForm = document.getElementById("tourForm");
  const tourTable = document.querySelector("#tourTable tbody");
  const saveBtn = document.getElementById("saveBtn");

  //  Load danh sách tour
  function loadTours() {
    fetch(API_URL)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log("Dữ liệu tours nhận được:", data);
        tourTable.innerHTML = data.map(tour => {
          // Xử lý trường highlight có thể bị thiếu
          const hasHighlight = tour.hasOwnProperty('highlight');
          const highlightValue = hasHighlight ? tour.highlight : false;
          
          return `
          <tr>
            <td>${tour.id}</td>
            <td>${tour.name}</td>
            <td>${tour.price ? tour.price.toLocaleString("vi-VN") + " đ" : "0 đ"}</td>
            <td>${highlightValue ? "Có" : "Không"}</td>
            <td>
              <button class="edit-btn" data-id="${tour.id}">Sửa</button>
              <button class="delete-btn" data-id="${tour.id}">Xóa</button>
            </td>
          </tr>
        `}).join("");
      })
      .catch(err => {
        console.error(" Lỗi load tour:", err);
        alert("Không thể tải danh sách tour! Kiểm tra xem json-server đã chạy chưa.");
      });
  }

  // Thêm hoặc cập nhật tour
  tourForm.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log("Form submitted");

    const id = document.getElementById("tourId").value;
    const newTour = {
      name: document.getElementById("name").value.trim(),
      description: document.getElementById("description").value.trim(),
      price: parseInt(document.getElementById("price").value),
      image: document.getElementById("image").value.trim(),
      highlight: document.getElementById("highlight").value === "true"
    };

    console.log("Dữ liệu tour mới:", newTour);
    console.log("ID tour (nếu cập nhật):", id);

    if (!newTour.name || !newTour.description || !newTour.price || !newTour.image) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    // Nếu có id thì cập nhật
    if (id) {
      fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTour)
      })
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(updatedTour => {
          console.log("Tour đã cập nhật:", updatedTour);
          alert("Cập nhật tour thành công!");
          tourForm.reset();
          document.getElementById("tourId").value = "";
          saveBtn.textContent = "Lưu tour";
          loadTours();
        })
        .catch(err => {
          console.error(" Lỗi cập nhật:", err);
          alert("Lỗi khi cập nhật tour!");
        });
    } else {
      //  Thêm mới
      fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTour)
      })
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(newTour => {
          console.log("Tour đã thêm:", newTour);
          alert("Thêm tour thành công!");
          tourForm.reset();
          loadTours();
        })
        .catch(err => {
          console.error(" Lỗi thêm:", err);
          alert("Lỗi khi thêm tour!");
        });
    }
  });

  //  Xử lý Sửa & Xóa (event delegation)
  tourTable.addEventListener("click", (e) => {
    const id = e.target.dataset.id;

    //  Sửa
    if (e.target.classList.contains("edit-btn")) {
      fetch(`${API_URL}/${id}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(tour => {
          document.getElementById("tourId").value = tour.id;
          document.getElementById("name").value = tour.name;
          document.getElementById("description").value = tour.description;
          document.getElementById("price").value = tour.price;
          document.getElementById("image").value = tour.image;
          document.getElementById("highlight").value = tour.highlight ? "true" : "false";
          saveBtn.textContent = "Cập nhật tour";
        })
        .catch(err => {
          console.error(" Lỗi khi lấy thông tin tour để sửa:", err);
          alert("Lỗi khi tải thông tin tour!");
        });
    }

    //  Xóa
    if (e.target.classList.contains("delete-btn")) {
      if (confirm("Bạn có chắc muốn xóa tour này không?")) {
        fetch(`${API_URL}/${id}`, { method: "DELETE" })
          .then(res => {
            if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
          })
          .then(() => {
            alert("Đã xóa tour!");
            loadTours();
          })
          .catch(err => {
            console.error(" Lỗi xóa:", err);
            alert("Lỗi khi xóa tour!");
          });
      }
    }
  });

  // Gọi khi tải trang
  loadTours();
});