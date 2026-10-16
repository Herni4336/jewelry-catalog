let allProducts = [];

// Загрузка каталога товаров
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

// Динамический рендеринг галереи (Оптимизированный через map и один innerHTML)
function renderGallery(products) {
    const gallery = document.getElementById('jewelry-gallery');
    
    if (products.length === 0) {
        gallery.innerHTML = '<p class="empty-message">Өнімдер табылмады</p>';
        return;
    }

    // Собираем всю разметку в одну строку. Добавлена ленивая загрузка изображений (loading="lazy")
    gallery.innerHTML = products.map((item, index) => `
        <div class="card" data-index="${index}">
            <img src="${item.image}" alt="${item.alt || item.title || 'Әшекей'}" loading="lazy">
            <div class="card-info">
                <p class="card-title">${item.title}</p>
                <p class="card-price">${item.price}</p>
            </div>
        </div>
    `).join('');

    // Делегирование клика: вешаем один обработчик на всю галерею вместо сотен на каждую карточку
    gallery.onclick = (e) => {
        const card = e.target.closest('.card');
        if (!card) return;

        const index = card.getAttribute('data-index');
        // Передаем именно тот объект, на который кликнули, из текущего отфильтрованного списка
        openModal(products[index]);
    };
}

// Настройка фильтров (Оптимизировано через делегирование событий)
function setupFilters() {
    const tabsContainer = document.querySelector('.tabs');
    if (!tabsContainer) return;

    tabsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.tab-btn');
        if (!btn) return; // Игнорируем клики мимо кнопок

        // Переключаем класс active у кнопок
        tabsContainer.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Фильтруем массив данных (поддерживает как строку, так и массив категорий)
        const category = btn.getAttribute('data-category');
        if (category === 'all') {
            renderGallery(allProducts);
        } else {
            const filtered = allProducts.filter(item => {
                if (Array.isArray(item.category)) {
                    return item.category.includes(category);
                }
                return item.category === category;
            });
            renderGallery(filtered);
        }
    });
}

// Открытие модального окна
function openModal(item) {
    // ФИКС БАГА: Сбрасываем старое изображение, чтобы оно не моргало при открытии нового товара
    const modalImg = document.getElementById('modal-img');
    modalImg.src = ''; 
    
    // Заполняем модалку свежими данными
    modalImg.src = item.image;
    modalImg.alt = item.alt || item.title || 'Әшекей'; // Заполняем alt для SEO и доступности
    
    document.getElementById('modal-title').innerText = item.title;
    document.getElementById('modal-price').innerText = item.price;
    document.getElementById('modal-metal').innerText = item.metal || '-';
    document.getElementById('modal-probe').innerText = item.probe || '-';
    
    // Заполняем новые поля (вес и рассрочка)
    const weightEl = document.getElementById('modal-weight');
    if (weightEl) weightEl.innerText = item.weight || '-';

    const installmentEl = document.getElementById('modal-installment');
    if (installmentEl) {
        installmentEl.innerText = item.installment_price ? `${item.installment_price}` : '-';
    }

    document.getElementById('modal-auth').innerText = item.authenticity || '-';
    document.getElementById('modal-desc').innerText = item.description || '';

    // Формирование ссылки для WhatsApp заказа
    const myPhone = "77077326121"; 
    const messageText = `Сәлеметсіз бе! Маған "${item.title}" ұнады. Бағасы: ${item.price}. Тапсырыс бергім келеді.`;
    
    document.getElementById('modal-wa-btn').href = `https://wa.me/${myPhone}?text=${encodeURIComponent(messageText)}`;

    // Логика для кнопки "Поделиться"
    const shareBtn = document.getElementById('modal-share-btn');
    shareBtn.onclick = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: item.title,
                    text: `Керемет әшекей: ${item.title}. Бағасы: ${item.price}`,
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Ошибка при шеринге', err);
            }
        } else {
            alert('Бұл браузерде бөлісу функциясы қолдау көрсетілмейді');
        }
    };

    // Отображаем окно
    document.getElementById('product-modal').classList.add('open');
}

// Закрытие модального окна (По клику на крестик)
document.getElementById('close-modal-btn').addEventListener('click', () => {
    document.getElementById('product-modal').classList.remove('open');
});

// Закрытие модального окна (По клику на серую подложку вокруг контента)
document.getElementById('product-modal').addEventListener('click', (e) => {
    if (e.target.id === 'product-modal') {
        document.getElementById('product-modal').classList.remove('open');
    }
});

// Запуск инициализации при полной загрузке DOM-дерева
window.addEventListener('DOMContentLoaded', loadCatalog);
