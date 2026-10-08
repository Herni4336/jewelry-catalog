let allProducts = [];

// Перенесли логику загрузки в модульный вид
async function loadCatalog() {
    try {
        const response = await fetch('data.json');
        allProducts = await response.json();
        renderGallery(allProducts);
        setupFilters();
    } catch (error) {
        console.error('Каталогты жүктеу қатесі:', error);
    }
}

function renderGallery(products) {
    const gallery = document.getElementById('jewelry-gallery');
    gallery.innerHTML = '';

    products.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';

        card.innerHTML = `
            <img src="${item.image}" alt="${item.alt || 'Әшекей'}">
            <div class="card-info">
                <p class="card-title">${item.title}</p>
                <p class="card-price">${item.price}</p>
            </div>
        `;

        // Железная фиксация клика
        card.addEventListener('click', () => openModal(item));
        gallery.appendChild(card);
    });
}

function setupFilters() {
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            buttons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            const category = e.target.getAttribute('data-category');
            if (category === 'all') {
                renderGallery(allProducts);
            } else {
                const filtered = allProducts.filter(item => item.category === category);
                renderGallery(filtered);
            }
        });
    });
}

function openModal(item) {
    document.getElementById('modal-img').src = item.image;
    document.getElementById('modal-title').innerText = item.title;
    document.getElementById('modal-price').innerText = item.price;
    document.getElementById('modal-metal').innerText = item.metal || '-';
    document.getElementById('modal-probe').innerText = item.probe || '-';
    document.getElementById('modal-auth').innerText = item.authenticity || '-';
    document.getElementById('modal-desc').innerText = item.description || '';

    const myPhone = "77077326121"; // Ваш номер телефона
    const messageText = `Сәлеметсіз бе! Маған "${item.title}" ұнады. Бағасы: ${item.price}. Тапсырыс бергім келеді.`;
    
    // ИСПРАВЛЕНО: Добавлен \$ перед переменной и слеш после wa.me
   document.getElementById('modal-wa-btn').href =
    `https://wa.me/${myPhone}?text=${encodeURIComponent(messageText)}`;

    // Безопасное открытие добавлением класса
    document.getElementById('product-modal').classList.add('open');
}

// Закрытие модалки
document.getElementById('close-modal-btn').addEventListener('click', () => {
    document.getElementById('product-modal').classList.remove('open');
});

document.getElementById('product-modal').addEventListener('click', (e) => {
    if (e.target.id === 'product-modal') {
        document.getElementById('product-modal').classList.remove('open');
    }
});

// Запуск приложения
window.addEventListener('DOMContentLoaded', loadCatalog);
