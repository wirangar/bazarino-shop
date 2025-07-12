document.addEventListener('DOMContentLoaded', function() {
  // مدیریت سبد خرید
  const cartItemsContainer = document.getElementById('cart-items-container');
  const subtotalElement = document.getElementById('subtotal');
  const shippingElement = document.getElementById('shipping');
  const totalElement = document.getElementById('total');
  const checkoutBtn = document.querySelector('.checkout-btn');
  const checkoutModal = document.getElementById('checkout-modal');
  const closeModal = document.querySelector('.close-modal');
  const checkoutForm = document.getElementById('checkout-form');
  
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // نمایش سبد خرید
  function renderCart() {
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<div class="empty-cart">سبد خرید شما خالی است</div>';
      return;
    }
    
    let html = '';
    let subtotal = 0;
    
    cart.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      
      html += `
        <div class="cart-item" data-id="${item.id}">
          <div class="item-product">
            <img src="${item.image}" alt="${item.name}">
            <div class="product-info">
              <h4>${item.name}</h4>
              <p>${item.brand}</p>
            </div>
          </div>
          <div class="item-price">€${item.price.toFixed(2)}</div>
          <div class="item-quantity">
            <button class="quantity-btn minus" data-id="${item.id}">-</button>
            <span>${item.quantity}</span>
            <button class="quantity-btn plus" data-id="${item.id}">+</button>
          </div>
          <div class="item-total">€${itemTotal.toFixed(2)}</div>
          <div class="item-remove">
            <button class="remove-btn" data-id="${item.id}"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      `;
    });
    
    cartItemsContainer.innerHTML = html;
    
    // محاسبه هزینه‌ها
    const shipping = subtotal > 50 ? 0 : 5.99;
    const total = subtotal + shipping;
    
    subtotalElement.textContent = `€${subtotal.toFixed(2)}`;
    shippingElement.textContent = `€${shipping.toFixed(2)}`;
    totalElement.textContent = `€${total.toFixed(2)}`;
    
    // افزودن رویدادها به دکمه‌ها
    document.querySelectorAll('.quantity-btn').forEach(btn => {
      btn.addEventListener('click', updateQuantity);
    });
    
    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', removeItem);
    });
  }
  
  // به‌روزرسانی تعداد محصول
  function updateQuantity(e) {
    const id = e.target.getAttribute('data-id');
    const isPlus = e.target.classList.contains('plus');
    const itemIndex = cart.findIndex(item => item.id === id);
    
    if (itemIndex !== -1) {
      if (isPlus) {
        cart[itemIndex].quantity += 1;
      } else {
        if (cart[itemIndex].quantity > 1) {
          cart[itemIndex].quantity -= 1;
        }
      }
      
      saveCart();
      renderCart();
    }
  }
  
  // حذف محصول از سبد
  function removeItem(e) {
    const id = e.target.closest('button').getAttribute('data-id');
    cart = cart.filter(item => item.id !== id);
    saveCart();
    renderCart();
  }
  
  // ذخیره سبد خرید در localStorage
  function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
  }
  
  // به‌روزرسانی تعداد محصولات در هدر
  function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.querySelector('.cart-count').textContent = count;
  }
  
  // پاک کردن سبد خرید
  document.querySelector('.clear-cart').addEventListener('click', () => {
    cart = [];
    saveCart();
    renderCart();
  });
  
  // ادامه خرید
  document.querySelector('.continue-shopping').addEventListener('click', () => {
    window.location.href = 'index.html';
  });
  
  // باز کردن مودال تکمیل سفارش
  checkoutBtn.addEventListener('click', () => {
    if (cart.length > 0) {
      checkoutModal.style.display = 'flex';
    }
  });
  
  // بستن مودال
  closeModal.addEventListener('click', () => {
    checkoutModal.style.display = 'none';
  });
  
  // ارسال سفارش
  checkoutForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const order = {
      customer: {
        name: document.getElementById('fullname').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        postalCode: document.getElementById('postal-code').value,
        deliveryType: document.getElementById('delivery-type').value,
        notes: document.getElementById('notes').value
      },
      items: cart,
      subtotal: parseFloat(subtotalElement.textContent.replace('€', '')),
      shipping: parseFloat(shippingElement.textContent.replace('€', '')),
      total: parseFloat(totalElement.textContent.replace('€', '')),
      date: new Date().toISOString(),
      status: 'pending'
    };
    
    // ارسال سفارش به سرور (شبیه‌سازی)
    submitOrder(order);
  });
  
  // تابع ارسال سفارش
  function submitOrder(order) {
    // شبیه‌سازی ارسال به API
    console.log('Order submitted:', order);
    
    // نمایش پیام موفقیت
    alert('سفارش شما با موفقیت ثبت شد!');
    
    // پاک کردن سبد خرید
    cart = [];
    saveCart();
    
    // بستن مودال و انتقال به صفحه تشکر
    checkoutModal.style.display = 'none';
    window.location.href = 'thankyou.html';
    
    // در واقعیت اینجا باید به API تلگرام و ایمیل متصل شویم
  }
  
  // مقداردهی اولیه
  renderCart();
  updateCartCount();
});
