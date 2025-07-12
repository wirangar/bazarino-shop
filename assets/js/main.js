document.addEventListener('DOMContentLoaded', function() {
  // مدیریت تغییر زبان
  const languageSelector = document.getElementById('language-selector');
  const elementsToTranslate = document.querySelectorAll('[data-translate]');
  
  // بارگذاری زبان انتخاب شده از localStorage
  const savedLanguage = localStorage.getItem('selectedLanguage') || 'fa';
  languageSelector.value = savedLanguage;
  
  // تابع تغییر زبان
  function changeLanguage(lang) {
    localStorage.setItem('selectedLanguage', lang);
    
    // بارگذاری فایل ترجمه مناسب
    fetch(`assets/lang/${lang}.json`)
      .then(response => response.json())
      .then(translations => {
        elementsToTranslate.forEach(element => {
          const key = element.getAttribute('data-translate');
          if (translations[key]) {
            element.textContent = translations[key];
          }
        });
      })
      .catch(error => console.error('Error loading translations:', error));
  }
  
  // رویداد تغییر زبان
  languageSelector.addEventListener('change', function() {
    changeLanguage(this.value);
  });
  
  // مقداردهی اولیه زبان
  changeLanguage(savedLanguage);

  // مدیریت منوی موبایل
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mainNav = document.querySelector('.main-nav');
  
  mobileMenuBtn.addEventListener('click', function() {
    this.classList.toggle('active');
    mainNav.classList.toggle('active');
  });

  // اسلایدر هیرو
  const heroSlider = new Swiper('.hero-slider', {
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
  });

  // بارگذاری محصولات
  const productsContainer = document.getElementById('products-container');
  const loadMoreBtn = document.getElementById('load-more');
  let currentPage = 1;
  
  // تابع بارگذاری محصولات
  function loadProducts(page) {
    fetch(`assets/data/products_${page}.json`)
      .then(response => response.json())
      .then(products => {
        if (products.length === 0) {
          loadMoreBtn.style.display = 'none';
          return;
        }
        
        products.forEach(product => {
          const productCard = document.createElement('div');
          productCard.className = 'product-card';
          productCard.innerHTML = `
            ${product.discount ? `<span class="product-badge">${product.discount}% تخفیف</span>` : ''}
            <div class="product-img">
              <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-info">
              <h3 class="product-title">${product.name}</h3>
              <div class="product-price">
                <span class="current-price">€${product.price.toFixed(2)}</span>
                ${product.oldPrice ? `<span class="old-price">€${product.oldPrice.toFixed(2)}</span>` : ''}
              </div>
              <div class="product-actions">
                <button class="add-to-cart" data-id="${product.id}">افزودن به سبد</button>
                <button class="wishlist-btn"><i class="far fa-heart"></i></button>
              </div>
            </div>
          `;
          productsContainer.appendChild(productCard);
        });
        
        // افزودن رویداد به دکمه‌های اضافه به سبد
        document.querySelectorAll('.add-to-cart').forEach(btn => {
          btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            addToCart(productId);
          });
        });
      })
      .catch(error => console.error('Error loading products:', error));
  }
  
  // تابع افزودن به سبد خرید
  function addToCart(productId) {
    fetch('assets/data/products.json')
      .then(response => response.json())
      .then(products => {
        const productToAdd = products.find(p => p.id === productId);
        
        if (productToAdd) {
          let cart = JSON.parse(localStorage.getItem('cart')) || [];
          const existingItem = cart.find(item => item.id === productId);
          
          if (existingItem) {
            existingItem.quantity += 1;
          } else {
            cart.push({
              ...productToAdd,
              quantity: 1
            });
          }
          
          localStorage.setItem('cart', JSON.stringify(cart));
          showNotification('محصول به سبد خرید اضافه شد');
          updateCartCount();
        }
      });
  }
  
  // نمایش نوتیفیکیشن
  function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
  
  // به‌روزرسانی تعداد محصولات در سبد
  function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.querySelector('.cart-count').textContent = count;
  }
  
  // دکمه بارگذاری بیشتر
  loadMoreBtn.addEventListener('click', function() {
    currentPage++;
    loadProducts(currentPage);
  });
  
  // مقداردهی اولیه
  loadProducts(currentPage);
  updateCartCount();
  
  // دکمه بازگشت به بالا
  const backToTop = document.querySelector('.back-to-top');
  
  window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
      backToTop.classList.add('active');
    } else {
      backToTop.classList.remove('active');
    }
  });
  
  backToTop.addEventListener('click', function(e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});
