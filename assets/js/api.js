
// اتصال به Google Sheets برای دریافت محصولات
async function fetchProductsFromGoogleSheets() {
  const sheetId = 'YOUR_GOOGLE_SHEET_ID';
  const apiKey = 'YOUR_GOOGLE_API_KEY';
  const sheetName = 'products';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}?key=${apiKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.values) {
      // تبدیل داده‌های sheet به آرایه محصولات
      const headers = data.values[0];
      const products = data.values.slice(1).map(row => {
        const product = {};
        headers.forEach((header, index) => {
          product[header] = row[index];
        });
        return product;
      });
      
      return products;
    }
  } catch (error) {
    console.error('Error fetching products from Google Sheets:', error);
    // استفاده از فایل محلی در صورت خطا
    return fetchLocalProducts();
  }
}

// دریافت محصولات از فایل محلی
async function fetchLocalProducts() {
  try {
    const response = await fetch('assets/data/products.json');
    return await response.json();
  } catch (error) {
    console.error('Error fetching local products:', error);
    return [];
  }
}

// ارسال سفارش به تلگرام
async function sendOrderToTelegram(order) {
  const botToken = 'YOUR_TELEGRAM_BOT_TOKEN';
  const chatId = 'YOUR_CHAT_ID';
  const text = formatOrderMessage(order);
  const url = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(text)}`;
  
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error('Error sending order to Telegram:', error);
    return null;
  }
}

// فرمت‌دهی پیام سفارش برای تلگرام
function formatOrderMessage(order) {
  let message = `سفارش جدید #${order.id}\n\n`;
  message += `👤 مشتری: ${order.customer.name}\n`;
  message += `📞 تلفن: ${order.customer.phone}\n`;
  message += `🏠 آدرس: ${order.customer.address}\n`;
  message += `📦 نوع تحویل: ${order.customer.deliveryType === 'perugia' ? 'تحویل در پروجا' : 'ارسال به سایر نقاط ایتالیا'}\n\n`;
  message += `🛒 محصولات:\n`;
  
  order.items.forEach(item => {
    message += `- ${item.name} (${item.quantity} عدد) - €${(item.price * item.quantity).toFixed(2)}\n`;
  });
  
  message += `\n💵 جمع کل: €${order.total.toFixed(2)}\n`;
  message += `📝 یادداشت: ${order.customer.notes || 'ندارد'}\n`;
  message += `🕒 زمان سفارش: ${new Date(order.date).toLocaleString('fa-IR')}`;
  
  return message;
}

// ارسال ایمیل به مشتری
async function sendEmailToCustomer(order) {
  const serviceId = 'YOUR_EMAILJS_SERVICE_ID';
  const templateId = 'YOUR_EMAILJS_TEMPLATE_ID';
  const userId = 'YOUR_EMAILJS_USER_ID';
  
  const emailParams = {
    to_name: order.customer.name,
    to_email: order.customer.email,
    order_id: order.id,
    order_date: new Date(order.date).toLocaleDateString('fa-IR'),
    order_total: `€${order.total.toFixed(2)}`,
    delivery_method: order.customer.deliveryType === 'perugia' ? 'تحویل در پروجا' : 'ارسال به سایر نقاط ایتالیا',
    items: order.items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: `€${(item.price * item.quantity).toFixed(2)}`
    }))
  };
  
  try {
    await emailjs.send(serviceId, templateId, emailParams, userId);
    console.log('Email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// تولید فاکتور PDF
async function generateInvoicePDF(order) {
  const element = document.createElement('div');
  element.innerHTML = `
    <div class="invoice">
      <header class="invoice-header">
        <img src="assets/img/logo.png" alt="بازارینو" class="invoice-logo">
        <div class="invoice-info">
          <h1>فاکتور سفارش</h1>
          <p>شماره: #${order.id}</p>
          <p>تاریخ: ${new Date(order.date).toLocaleDateString('fa-IR')}</p>
        </div>
      </header>
      
      <div class="invoice-customer">
        <h3>مشخصات مشتری</h3>
        <p>نام: ${order.customer.name}</p>
        <p>تلفن: ${order.customer.phone}</p>
        <p>آدرس: ${order.customer.address}</p>
        <p>کد پستی: ${order.customer.postalCode}</p>
      </div>
      
      <table class="invoice-items">
        <thead>
          <tr>
            <th>محصول</th>
            <th>تعداد</th>
            <th>قیمت واحد</th>
            <th>جمع</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map(item => `
            <tr>
              <td>${item.name}</td>
              <td>${item.quantity}</td>
              <td>€${item.price.toFixed(2)}</td>
              <td>€${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3">جمع کل:</td>
            <td>€${order.total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
      
      <div class="invoice-footer">
        <p>با تشکر از خرید شما - بازارینو</p>
        <p>www.bazarino.it</p>
      </div>
    </div>
  `;
  
  const opt = {
    margin: 10,
    filename: `invoice_${order.id}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  
  try {
    await html2pdf().from(element).set(opt).save();
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
}

// مدیریت کامل یک سفارش
async function processOrder(order) {
  try {
    // 1. ذخیره سفارش در localStorage
    localStorage.setItem('lastOrder', JSON.stringify(order));
    
    // 2. ارسال به تلگرام
    await sendOrderToTelegram(order);
    
    // 3. ارسال ایمیل به مشتری
    await sendEmailToCustomer(order);
    
    // 4. تولید فاکتور PDF
    await generateInvoicePDF(order);
    
    return true;
  } catch (error) {
    console.error('Error processing order:', error);
    return false;
  }
}

export {
  fetchProductsFromGoogleSheets,
  fetchLocalProducts,
  sendOrderToTelegram,
  sendEmailToCustomer,
  generateInvoicePDF,
  processOrder
};
