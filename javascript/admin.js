
const apiURL = "http://localhost:3000";

// ======= Lấy thông tin admin từ JSON =======
async function getAdminInfo() {
  try {
    const res = await fetch(`${apiURL}/admins`);
    const admins = await res.json();
    return admins.length > 0 ? admins[0] : null;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin admin:", error);
    return null;
  }
}

// ======= Hiển thị thông tin admin trong modal =======
async function displayAdminProfile() {
  try {
    const adminInfo = await getAdminInfo();
    
    if (adminInfo) {
      document.getElementById('adminName').textContent = adminInfo.username || 'Quản trị viên';
      document.getElementById('adminEmail').textContent = adminInfo.email || `${adminInfo.username}@davtravel.com`;
      document.getElementById('adminRole').textContent = adminInfo.role || 'Super Admin';
    } else {
      document.getElementById('adminName').textContent = 'Quản trị viên';
      document.getElementById('adminEmail').textContent = 'admin@davtravel.com';
      document.getElementById('adminRole').textContent = 'Super Admin';
    }
  } catch (error) {
    console.error("Lỗi khi hiển thị profile:", error);
  }
}

// ======= Mở modal hồ sơ admin =======
function openProfile() {
  const modal = document.getElementById('adminProfile');
  if (modal) {
    modal.style.display = 'block';
    displayAdminProfile();
  }
}

// ======= Đóng modal hồ sơ admin =======
function closeProfile() {
  const modal = document.getElementById('adminProfile');
  if (modal) {
    modal.style.display = 'none';
  }
}

// ======= Đổi mật khẩu =======
async function changePassword() {
  try {
    const adminInfo = await getAdminInfo();
    if (!adminInfo) {
      alert('Không tìm thấy thông tin admin!');
      return;
    }

    const currentPassword = prompt('Nhập mật khẩu hiện tại:');
    if (!currentPassword) return;

    if (currentPassword !== adminInfo.password) {
      alert('Mật khẩu hiện tại không đúng!');
      return;
    }

    const newPassword = prompt('Nhập mật khẩu mới:');
    if (!newPassword) return;

    const confirmPassword = prompt('Xác nhận mật khẩu mới:');
    if (!confirmPassword) return;

    if (newPassword !== confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }

    if (newPassword.length < 6) {
      alert('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    const updatedAdmin = {
      ...adminInfo,
      password: newPassword
    };

    await fetch(`${apiURL}/admins/${adminInfo.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedAdmin)
    });

    alert('Đổi mật khẩu thành công!');
    closeProfile();
    
  } catch (error) {
    console.error('Lỗi khi đổi mật khẩu:', error);
    alert('Có lỗi xảy ra khi đổi mật khẩu!');
  }
}

// ======= Đăng xuất =======
async function logoutAdmin() {
  try {
    const res = await fetch(`${apiURL}/session`);
    const sessions = await res.json();

    if (sessions.length > 0) {
      for (const session of sessions) {
        await fetch(`${apiURL}/session/${session.id}`, { 
          method: "DELETE"
        });
      }
    }
    alert("Đăng xuất thành công!");
    window.location.href = "homepage.html";
  } catch (error) {
    console.error("Lỗi khi đăng xuất:", error);
    alert("Có lỗi xảy ra khi đăng xuất!");
    window.location.href = "homepage.html";
  }
}

// ======= Thiết lập event listeners =======
function setupEventListeners() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logoutAdmin();
    });
  }

  const modal = document.getElementById('adminProfile');
  if (modal) {
    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeProfile();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeProfile();
    }
  });
}

// ======= Khởi tạo =======
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  console.log('Trang admin đã sẵn sàng');
});