document.addEventListener("DOMContentLoaded", () => {
  const apiBase = "http://localhost:3000";

  // --- TOUR NỔI BẬT ---
  const highlightContainer = document.getElementById("highlight-tours");
  if (highlightContainer) {
    fetch(`${apiBase}/tours`)
      .then(res => res.json())
      .then(tours => {
        const highlighted = tours.filter(t => t.highlight === true || t.highlight === "true");
        highlightContainer.innerHTML =
          highlighted.map(t => `
            <div class="tour-card">
              <img src="${t.image}" alt="${t.name}">
              <div class="tour-info">
                <h3>${t.name}</h3>
                <p>${t.description}</p>
                <p class="price">Giá: ${t.price.toLocaleString("vi-VN")} VND</p>
              </div>
            </div>
          `).join("") || "<p>Không có tour nổi bật.</p>";
      })
      .catch(() => {
        highlightContainer.innerHTML = "<p>Lỗi khi tải dữ liệu tour nổi bật!</p>";
      });
  }

  // --- AUTH / SESSION ---
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const userMenu = document.getElementById("userMenu");
  const username = document.getElementById("username");
  const logoutBtn = document.getElementById("logoutBtn");
  const userIcon = document.getElementById("user-icon");

  // Lấy session hiện tại (nếu có)
  async function getCurrentSession() {
    try {
      const res = await fetch(`${apiBase}/session`);
      const sessions = await res.json();
      return sessions.find(s => s.isLoggedIn === true) || null;
    } catch {
      return null;
    }
  }

  // Đăng xuất
  async function logout() {
    const current = await getCurrentSession();
    if (!current) return;
    await fetch(`${apiBase}/session/${current.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...current, isLoggedIn: false, logoutTime: new Date().toISOString() })
    });
  }

  // Hiển thị UI tùy trạng thái đăng nhập
  getCurrentSession().then(currentSession => {
    if (currentSession) {
      // Nếu đã đăng nhập
      loginBtn.style.display = "none";
      registerBtn.style.display = "none";
      userMenu.style.display = "flex";

      const name = currentSession.type === "admin"
        ? currentSession.user.username
        : currentSession.user.name;
      username.textContent = name;
    } else {
      // Nếu chưa đăng nhập
      loginBtn.style.display = "inline-block";
      registerBtn.style.display = "inline-block";
      userMenu.style.display = "none";
    }
  });

  // --- Sự kiện nút ---
  if (loginBtn) {
    loginBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "user.html?mode=login";
    });
  }

  if (registerBtn) {
    registerBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "user.html?mode=register";
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      const currentSession = await getCurrentSession();
      const userName = currentSession
        ? (currentSession.type === "admin" ? currentSession.user.username : currentSession.user.name)
        : "";
      await logout();
      alert(`Đã đăng xuất tài khoản ${userName}!`);
      window.location.reload();
    });
  }

  if (userIcon) {
    userIcon.addEventListener("click", async () => {
      const currentSession = await getCurrentSession();
      if (!currentSession) {
        alert("Bạn cần đăng nhập!");
        window.location.href = "user.html";
      } else if (currentSession.type === "admin") {
        window.location.href = "admin.html";
      } else {
        alert(`Xin chào ${currentSession.user.name}!`);
      }
    });
  }
});
