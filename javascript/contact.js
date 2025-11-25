document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  const api = "http://localhost:3000/contacts";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      message: document.getElementById("message").value.trim(),
      createdAt: new Date().toISOString()
    };

    try {
      const res = await fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        alert(" Gửi liên hệ thành công! Cảm ơn bạn đã liên hệ với DAV Travel.");
        form.reset();
      } else {
        throw new Error("Lỗi khi gửi dữ liệu!");
      }
    } catch (error) {
      alert(" Gửi thất bại! Vui lòng thử lại sau.");
      console.error(error);
    }
  });
});
