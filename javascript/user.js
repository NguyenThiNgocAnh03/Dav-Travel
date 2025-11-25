document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector(".login-form");
  const registerForm = document.querySelector(".register-form");
  const switchLinks = document.querySelectorAll(".switch-form");

  const apiUsers = "http://localhost:3000/users";
  const apiSession = "http://localhost:3000/session";

  // ✅ Kiểm tra session hiện tại (chỉ redirect nếu có người đang đăng nhập)
  async function checkCurrentSession() {
    try {
      const res = await fetch(apiSession);
      const sessions = await res.json();
      const current = sessions.find(s => s.isLoggedIn === true);

      if (current) {
        if (current.type === "admin") window.location.href = "admin.html";
        else window.location.href = "homepage.html";
      } else {
        // Nếu chưa đăng nhập, hiển thị form đăng nhập
        loginForm.style.display = "block";
        registerForm.style.display = "none";
      }
    } catch (err) {
      console.error("Lỗi khi kiểm tra session:", err);
      loginForm.style.display = "block";
      registerForm.style.display = "none";
    }
  }

  // ✅ Chuyển qua lại giữa form đăng nhập / đăng ký
  switchLinks.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      if (loginForm.style.display === "none") {
        loginForm.style.display = "block";
        registerForm.style.display = "none";
      } else {
        loginForm.style.display = "none";
        registerForm.style.display = "block";
      }
    });
  });

  // ✅ Lưu session khi đăng nhập
  async function saveSession(user) {
    try {
      const res = await fetch(apiSession);
      const sessions = await res.json();

      for (const s of sessions) {
        await fetch(`${apiSession}/${s.id}`, { method: "DELETE" });
      }

      const newSession = {
        id: Date.now().toString(),
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        isLoggedIn: true,
        loginTime: new Date().toISOString()
      };

      await fetch(apiSession, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSession)
      });
    } catch (err) {
      console.error("Lỗi khi lưu session:", err);
    }
  }

  // ✅ Đăng nhập
  loginForm.addEventListener("submit", async e => {
    e.preventDefault();

    const username = document.getElementById("signinEmail").value.trim();
    const password = document.getElementById("signinPassword").value.trim();

    if (!username || !password) {
      alert("Vui lòng nhập đủ thông tin!");
      return;
    }

    try {
      const res = await fetch(apiUsers);
      const users = await res.json();

      const user = users.find(
        u =>
          (u.email.toLowerCase() === username.toLowerCase() ||
            u.name.toLowerCase() === username.toLowerCase()) &&
          u.password === password
      );

      if (user) {
        alert(`Đăng nhập thành công, chào ${user.name}!`);
        await saveSession(user);
        window.location.href = "homepage.html";
      } else {
        alert("Sai tên đăng nhập hoặc mật khẩu!");
      }
    } catch (err) {
      console.error("Lỗi khi đăng nhập:", err);
      alert("Không thể kết nối server!");
    }
  });

  // ✅ Đăng ký
  registerForm.addEventListener("submit", async e => {
    e.preventDefault();

    const name = document.getElementById("fullname").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value.trim();

    if (!name || !email || !password) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      const res = await fetch(apiUsers);
      const users = await res.json();

      if (users.some(u => u.email === email)) {
        alert("Email đã tồn tại!");
        return;
      }

      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        role: "user",
        createdAt: new Date().toISOString()
      };

      await fetch(apiUsers, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser)
      });

      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      loginForm.style.display = "block";
      registerForm.style.display = "none";
    } catch (err) {
      console.error("Lỗi khi đăng ký:", err);
      alert("Không thể kết nối tới server!");
    }
  });

  // ✅ Kiểm tra URL để tự mở form đăng ký nếu có ?mode=register
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("mode") === "register") {
    loginForm.style.display = "none";
    registerForm.style.display = "block";
  } else {
    loginForm.style.display = "block";
    registerForm.style.display = "none";
  }

  checkCurrentSession();
});
