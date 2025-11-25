document.addEventListener("DOMContentLoaded", async () => {
  const apiBase = "http://localhost:3000";
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const userMenu = document.getElementById("userMenu");
  const username = document.getElementById("username");
  const logoutBtn = document.getElementById("logoutBtn");
  const userIcon = document.getElementById("user-icon");

  // --- Hàm lấy session hiện tại ---
  async function getSession() {
    try {
      const res = await fetch(`${apiBase}/session`);
      const sessions = await res.json();
      return sessions.find(s => s.isLoggedIn === true) || null;
    } catch (err) {
      console.error("Lỗi khi lấy session:", err);
      return null;
    }
  }

  // --- Hàm logout ---
  async function logout() {
    const session = await getSession();
    if (session) {
      await fetch(`${apiBase}/session/${session.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...session, isLoggedIn: false })
      });
      alert("Đăng xuất thành công!");
      window.location.reload();
    }
  }

  // --- Cập nhật header theo trạng thái đăng nhập ---
  const currentSession = await getSession();
  if (currentSession) {
    //  Đã đăng nhập
    loginBtn.style.display = "none";
    registerBtn.style.display = "none";
    userMenu.style.display = "flex";

    username.textContent = currentSession.userName || currentSession.user?.name || "Người dùng";

    // Click vào avatar → nếu là admin thì sang admin.html
    if (userIcon) {
      userIcon.addEventListener("click", () => {
        if (currentSession.user?.role === "admin") {
          window.location.href = "admin.html";
        } else {
          alert("Xin chào " + username.textContent + "!");
        }
      });
    }

    if (logoutBtn) logoutBtn.addEventListener("click", logout);
  } else {
    //  Chưa đăng nhập
    loginBtn.style.display = "inline-block";
    registerBtn.style.display = "inline-block";
    userMenu.style.display = "none";
  }
});
