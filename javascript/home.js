document.addEventListener("DOMContentLoaded", () => {
    const highlightContainer = document.getElementById("highlight-tours");

    if (!highlightContainer) return;

    fetch("http://localhost:3000/tours")
        .then(res => res.json())
        .then(tours => {
            // lọc các tour nổi bật
            const highlightedTours = tours.filter(t => t.highlight === true || t.highlight === "true");

            let html = "";
            highlightedTours.forEach(t => {
                html += `
                    <div class="tour-card">
                        <img src="${t.image}" alt="${t.name}">
                        <div class="tour-info">
                            <h3>${t.name}</h3>
                            <p>${t.description}</p>
                            <p class="price">Giá: ${t.price.toLocaleString('vi-VN')} VND</p>
                        </div>
                    </div>
                `;
            });

            if (!html) html = "<p>Không có tour nổi bật.</p>";
            highlightContainer.innerHTML = html;
        })
        .catch(err => {
            console.error(err);
            highlightContainer.innerHTML = "<p>Không thể tải tour nổi bật.</p>";
        });
});