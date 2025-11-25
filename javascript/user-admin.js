document.addEventListener("DOMContentLoaded", () => {
  const userForm = document.getElementById("userForm");
  const userTable = document.querySelector("#userTable tbody");
  const saveBtn = document.getElementById("saveBtn");
  const apiURL = "http://localhost:3000/users"; // đường dẫn đến json-server

  // Load danh sách users từ JSON SERVER
  async function loadUsers() {
    const res = await fetch(apiURL);
    const users = await res.json();

    if (users.length === 0) {
      userTable.innerHTML = '<tr><td colspan="5">Không có user nào</td></tr>';
      return;
    }

    userTable.innerHTML = users.map(user => `
      <tr>
        <td>${user.id}</td>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${user.role}</td>
        <td>
          <button class="edit-btn" data-id="${user.id}">Sửa</button>
          <button class="delete-btn" data-id="${user.id}">Xóa</button>
        </td>
      </tr>
    `).join("");
  }

  // Thêm hoặc cập nhật user
  userForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("userId").value;
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const role = document.getElementById("role").value;
    const password = document.getElementById("password").value.trim();

    if (!name || !email) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    const userData = { name, email, role, password };

    if (id) {
      // Cập nhật user
      await fetch(`${apiURL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      alert("Cập nhật user thành công!");
    } else {
      // Thêm user mới
      if (!password) {
        alert("Vui lòng nhập mật khẩu!");
        return;
      }

      await fetch(apiURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      alert("Thêm user thành công!");
    }

    resetForm();
    loadUsers();
  });

  // Sửa + Xóa
  userTable.addEventListener("click", async (e) => {
    const id = e.target.dataset.id;
    if (e.target.classList.contains("delete-btn")) {
      if (confirm("Bạn có chắc muốn xóa user này?")) {
        await fetch(`${apiURL}/${id}`, { method: "DELETE" });
        alert("Đã xóa user!");
        loadUsers();
      }
    }

    if (e.target.classList.contains("edit-btn")) {
      const res = await fetch(`${apiURL}/${id}`);
      const user = await res.json();

      document.getElementById("userId").value = user.id;
      document.getElementById("name").value = user.name;
      document.getElementById("email").value = user.email;
      document.getElementById("role").value = user.role;
      document.getElementById("password").value = "";
      saveBtn.textContent = "Cập nhật User";
    }
  });

  function resetForm() {
    userForm.reset();
    document.getElementById("userId").value = "";
    saveBtn.textContent = "Lưu User";
  }

  loadUsers();
});
