/* loja.js - Lógica da Vitrine Pública da plataforma AgendaFácil */

document.addEventListener('DOMContentLoaded', () => {
  // Estado local da vitrine
  const state = {
    cart: [],
    selectedCategory: 'Todos',
    config: window.store.getConfig(),
    products: window.store.getProducts()
  };

  // Elementos do DOM
  const elements = {
    storeName: document.getElementById('store-name'),
    storeHours: document.getElementById('store-hours'),
    storeAddress: document.getElementById('store-address'),
    storeCoverImg: document.getElementById('store-cover-img'),
    btnMap: document.getElementById('btn-map'),
    categoriesList: document.getElementById('categories-list'),
    productsList: document.getElementById('products-list'),
    btnOpenCart: document.getElementById('btn-open-cart'),
    btnCloseCart: document.getElementById('btn-close-cart'),
    cartOverlay: document.getElementById('cart-overlay'),
    cartDrawer: document.getElementById('cart-drawer'),
    cartItemsList: document.getElementById('cart-items-list'),
    cartCounter: document.getElementById('cart-counter'),
    cartTotalValue: document.getElementById('cart-total-value'),
    schedulerSection: document.getElementById('scheduler-section'),
    bookingDate: document.getElementById('booking-date'),
    bookingTime: document.getElementById('booking-time'),
    clientName: document.getElementById('client-name'),
    clientPhone: document.getElementById('client-phone'),
    clientNotes: document.getElementById('client-notes'),
    nicheFieldsContainer: document.getElementById('niche-fields-container'),
    btnCheckout: document.getElementById('btn-checkout')
  };

  // Inicialização
  function init() {
    renderStoreInfo();
    renderCategories();
    renderProducts();
    renderNicheFields();
    setupEvents();
    setupDateLimits();
  }

  // Renderiza informações do negócio
  function renderStoreInfo() {
    const config = state.config;
    elements.storeName.textContent = config.businessName;
    elements.storeHours.textContent = `🕒 ${config.hours}`;
    elements.storeAddress.textContent = `📍 ${config.address}`;
    if (config.coverImage) {
      elements.storeCoverImg.src = config.coverImage;
    }
    elements.btnMap.href = `https://maps.google.com/?q=${encodeURIComponent(config.address)}`;
  }

  // Gera botões de categorias
  function renderCategories() {
    const categories = ['Todos', ...new Set(state.products.map(p => p.category))];
    elements.categoriesList.innerHTML = '';
    
    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = `category-pill ${state.selectedCategory === cat ? 'active' : ''}`;
      btn.textContent = cat;
      btn.addEventListener('click', () => {
        state.selectedCategory = cat;
        renderCategories();
        renderProducts();
      });
      elements.categoriesList.appendChild(btn);
    });
  }

  // Renderiza produtos/serviços com base na categoria ativa
  function renderProducts() {
    elements.productsList.innerHTML = '';
    const filtered = state.selectedCategory === 'Todos'
      ? state.products
      : state.products.filter(p => p.category === state.selectedCategory);

    if (filtered.length === 0) {
      elements.productsList.innerHTML = `<div class="text-center w-full p-8 text-muted">Nenhum item encontrado nesta categoria.</div>`;
      return;
    }

    filtered.forEach(p => {
      const card = document.createElement('div');
      card.className = 'card card-hover product-card';
      
      const priceFormatted = p.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      const durationText = p.type === 'servico' ? `⏱️ ${p.duration} min` : '';

      card.innerHTML = `
        <div class="product-img-wrapper">
          <span class="badge product-type-badge">${p.type === 'servico' ? 'Serviço' : 'Produto'}</span>
          <img src="${p.image}" alt="${p.name}" class="product-img" loading="lazy">
        </div>
        <div class="product-body">
          <div class="flex justify-between align-center">
            <h4 class="product-title">${p.name}</h4>
            <span class="text-dim" style="font-size: 0.8rem;">${durationText}</span>
          </div>
          <p class="product-desc">${p.desc || ''}</p>
          <div class="product-footer">
            <span class="product-price">${priceFormatted}</span>
            <button class="btn btn-primary btn-sm btn-add-to-cart" data-id="${p.id}">
              ${p.type === 'servico' ? 'Agendar' : 'Adicionar'}
            </button>
          </div>
        </div>
      `;
      elements.productsList.appendChild(card);
    });

    // Eventos de adicionar ao carrinho
    elements.productsList.querySelectorAll('.btn-add-to-cart').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        addToCart(id);
      });
    });
  }

  // Injeta campos condicionais no formulário de dados do cliente dependendo do nicho
  function renderNicheFields() {
    const container = elements.nicheFieldsContainer;
    container.innerHTML = '';
    const type = state.config.businessType;

    if (type === 'comida') {
      container.innerHTML = `
        <div class="form-group">
          <label class="form-label" for="delivery-type">Tipo de Pedido</label>
          <select class="form-input form-select" id="delivery-type" required>
            <option value="retirada">Retirar no Local</option>
            <option value="entrega">Entrega em Domicílio</option>
          </select>
        </div>
        <div class="form-group" id="delivery-address-group" style="display: none;">
          <label class="form-label" for="delivery-address">Endereço de Entrega</label>
          <input type="text" class="form-input" id="delivery-address" placeholder="Rua, número, bairro e apto">
        </div>
      `;

      const deliverySelect = document.getElementById('delivery-type');
      const addressGroup = document.getElementById('delivery-address-group');
      const addressInput = document.getElementById('delivery-address');

      deliverySelect.addEventListener('change', (e) => {
        if (e.target.value === 'entrega') {
          addressGroup.style.display = 'block';
          addressInput.setAttribute('required', 'true');
        } else {
          addressGroup.style.display = 'none';
          addressInput.removeAttribute('required');
          addressInput.value = '';
        }
      });

    } else if (type === 'automotivo') {
      container.innerHTML = `
        <div class="flex gap-4">
          <div class="form-group flex-1">
            <label class="form-label" for="vehicle-model">Modelo do Veículo</label>
            <input type="text" class="form-input" id="vehicle-model" placeholder="Ex: Corolla Preto" required>
          </div>
          <div class="form-group flex-1">
            <label class="form-label" for="vehicle-plate">Placa</label>
            <input type="text" class="form-input" id="vehicle-plate" placeholder="Ex: ABC-1234" required>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" for="vehicle-size">Tamanho/Porte do Veículo</label>
          <select class="form-input form-select" id="vehicle-size" required>
            <option value="Passeio">Carro de Passeio (Hatch / Sedan)</option>
            <option value="SUV">SUV / Caminhonete / Van</option>
            <option value="Moto">Motocicleta</option>
          </select>
        </div>
      `;
    } else if (type === 'dentista') {
      container.innerHTML = `
        <div class="form-group">
          <label class="form-label" for="patient-cpf">CPF do Paciente</label>
          <input type="text" class="form-input" id="patient-cpf" placeholder="Ex: 000.000.000-00" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="medical-insurance">Convênio Médico / Plano</label>
          <select class="form-input form-select" id="medical-insurance" required>
            <option value="Particular">Particular (Sem Convênio)</option>
            <option value="Unimed">Unimed</option>
            <option value="Amil">Amil</option>
            <option value="SulAmérica">SulAmérica</option>
            <option value="Bradesco Saúde">Bradesco Saúde</option>
          </select>
        </div>
      `;
    }
  }

  // Lógica do Carrinho
  function addToCart(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    const existing = state.cart.find(item => item.id === productId);
    if (existing) {
      existing.quantity += 1;
    } else {
      state.cart.push({ ...product, quantity: 1 });
    }

    updateCart();
    openCart();
  }

  function removeFromCart(productId) {
    state.cart = state.cart.filter(item => item.id !== productId);
    updateCart();
  }

  function updateQuantity(productId, delta) {
    const item = state.cart.find(item => item.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      removeFromCart(productId);
    } else {
      updateCart();
    }
  }

  function updateCart() {
    const totalCount = state.cart.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = state.cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    elements.cartCounter.textContent = totalCount;
    elements.cartTotalValue.textContent = totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    elements.cartItemsList.innerHTML = '';
    if (state.cart.length === 0) {
      elements.cartItemsList.innerHTML = `<div class="text-center text-muted p-8">Seu carrinho está vazio.</div>`;
      elements.schedulerSection.style.display = 'none';
      return;
    }

    state.cart.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = 'cart-item';
      const itemTotal = (item.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

      itemEl.innerHTML = `
        <div class="cart-item-info">
          <span class="cart-item-name">${item.name}</span>
          <span class="cart-item-price">${item.quantity}x de ${item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
        </div>
        <div class="flex align-center gap-4">
          <span class="cart-item-price" style="font-weight:600;">${itemTotal}</span>
          <div class="cart-item-quantity">
            <button class="qty-btn" onclick="updateQty('${item.id}', -1)">-</button>
            <span>${item.quantity}</span>
            <button class="qty-btn" onclick="updateQty('${item.id}', 1)">+</button>
          </div>
        </div>
      `;
      elements.cartItemsList.appendChild(itemEl);
    });

    const type = state.config.businessType;
    if (type === 'comida') {
      elements.schedulerSection.style.display = 'none';
    } else {
      const hasService = state.cart.some(item => item.type === 'servico');
      elements.schedulerSection.style.display = hasService ? 'block' : 'none';
      
      if (hasService && !elements.bookingDate.value) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        elements.bookingDate.value = tomorrow.toISOString().split('T')[0];
        generateTimeSlots();
      }
    }
  }

  window.updateQty = (id, delta) => {
    updateQuantity(id, delta);
  };

  function openCart() {
    elements.cartOverlay.classList.add('active');
    elements.cartDrawer.classList.add('active');
  }

  function closeCart() {
    elements.cartOverlay.classList.remove('active');
    elements.cartDrawer.classList.remove('active');
  }

  function generateTimeSlots() {
    const selectedDate = elements.bookingDate.value;
    if (!selectedDate) return;

    elements.bookingTime.innerHTML = '<option value="">Carregando horários...</option>';

    const allSlots = [
      '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
      '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
    ];

    const orders = window.store.getOrders();
    const busySlots = orders
      .filter(o => o.type === 'agendamento' && o.date === selectedDate && o.status !== 'Cancelado')
      .map(o => o.time);

    const freeSlots = allSlots.filter(slot => !busySlots.includes(slot));

    elements.bookingTime.innerHTML = '';
    if (freeSlots.length === 0) {
      elements.bookingTime.innerHTML = '<option value="">Nenhum horário disponível</option>';
      return;
    }

    freeSlots.forEach(slot => {
      const opt = document.createElement('option');
      opt.value = slot;
      opt.textContent = slot;
      elements.bookingTime.appendChild(opt);
    });
  }

  function setupDateLimits() {
    const today = new Date().toISOString().split('T')[0];
    elements.bookingDate.min = today;
    
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    elements.bookingDate.max = maxDate.toISOString().split('T')[0];
  }

  function setupEvents() {
    elements.btnOpenCart.addEventListener('click', openCart);
    elements.btnCloseCart.addEventListener('click', closeCart);
    elements.cartOverlay.addEventListener('click', closeCart);
    elements.bookingDate.addEventListener('change', generateTimeSlots);
    elements.btnCheckout.addEventListener('click', handleCheckout);
  }

  // Fluxo de Checkout e envio de mensagens estruturadas para o WhatsApp
  function handleCheckout() {
    if (state.cart.length === 0) {
      alert('Seu carrinho está vazio.');
      return;
    }

    const name = elements.clientName.value.trim();
    const phone = elements.clientPhone.value.trim();
    const notes = elements.clientNotes.value.trim();

    if (!name || !phone) {
      alert('Por favor, preencha seu nome e telefone WhatsApp.');
      return;
    }

    const type = state.config.businessType;
    const hasService = state.cart.some(item => item.type === 'servico');
    const date = elements.bookingDate.value;
    const time = elements.bookingTime.value;

    let deliveryType = '';
    let deliveryAddress = '';
    let vehicleModel = '';
    let vehiclePlate = '';
    let vehicleSize = '';
    let patientCpf = '';
    let medicalInsurance = '';

    if (type === 'comida') {
      deliveryType = document.getElementById('delivery-type').value;
      if (deliveryType === 'entrega') {
        deliveryAddress = document.getElementById('delivery-address').value.trim();
        if (!deliveryAddress) {
          alert('Por favor, digite o endereço completo para entrega.');
          return;
        }
      }
    } else if (type === 'automotivo') {
      vehicleModel = document.getElementById('vehicle-model').value.trim();
      vehiclePlate = document.getElementById('vehicle-plate').value.trim();
      vehicleSize = document.getElementById('vehicle-size').value;

      if (!vehicleModel || !vehiclePlate) {
        alert('Por favor, preencha o modelo e a placa do veículo.');
        return;
      }
      if (hasService && (!date || !time)) {
        alert('Por favor, selecione data e horário válidos para a lavagem.');
        return;
      }
    } else if (type === 'dentista') {
      patientCpf = document.getElementById('patient-cpf').value.trim();
      medicalInsurance = document.getElementById('medical-insurance').value;

      if (!patientCpf) {
        alert('Por favor, preencha o CPF do paciente.');
        return;
      }
      if (hasService && (!date || !time)) {
        alert('Por favor, selecione data e horário válidos para a consulta.');
        return;
      }
    } else {
      if (hasService && (!date || !time)) {
        alert('Por favor, selecione data e horário válidos para o agendamento.');
        return;
      }
    }

    const total = state.cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    // Cria a estrutura do pedido na Store local
    const newOrder = {
      customerName: name,
      customerPhone: phone,
      type: (type === 'comida') ? 'pedido' : 'agendamento',
      status: 'Pendente',
      notes: notes,
      items: state.cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      total: total
    };

    if (type !== 'comida' && hasService) {
      newOrder.date = date;
      newOrder.time = time;
    }

    if (type === 'comida') {
      newOrder.deliveryType = deliveryType;
      newOrder.deliveryAddress = deliveryAddress;
    } else if (type === 'automotivo') {
      newOrder.vehicleModel = vehicleModel;
      newOrder.vehiclePlate = vehiclePlate;
      newOrder.vehicleSize = vehicleSize;
    } else if (type === 'dentista') {
      newOrder.patientCpf = patientCpf;
      newOrder.medicalInsurance = medicalInsurance;
    }

    window.store.addOrder(newOrder);

    // Formata a mensagem para o WhatsApp baseado no nicho do estabelecimento
    let message = '';
    
    if (type === 'comida') {
      message = `*🍔 NOVO PEDIDO - ${state.config.businessName}*\n\n`;
      message += `👤 *Cliente:* ${name}\n`;
      message += `📞 *WhatsApp:* ${phone}\n`;
      message += `🛵 *Tipo de Pedido:* ${deliveryType === 'entrega' ? 'Entrega em Domicílio' : 'Retirada no Local'}\n`;
      if (deliveryType === 'entrega') {
        message += `📍 *Endereço:* ${deliveryAddress}\n`;
      }
    } else if (type === 'automotivo') {
      message = `*🚗 NOVO AGENDAMENTO DE LAVAGEM - ${state.config.businessName}*\n\n`;
      message += `👤 *Cliente:* ${name}\n`;
      message += `📞 *WhatsApp:* ${phone}\n`;
      message += `🚘 *Veículo:* ${vehicleModel} (${vehicleSize})\n`;
      message += `🔢 *Placa:* ${vehiclePlate.toUpperCase()}\n`;
      if (hasService) {
        const [ano, mes, dia] = date.split('-');
        message += `📅 *Data:* ${dia}/${mes}/${ano}\n`;
        message += `⏱️ *Horário:* ${time}\n`;
      }
    } else if (type === 'dentista') {
      message = `*🦷 NOVA CONSULTA ODONTOLÓGICA - ${state.config.businessName}*\n\n`;
      message += `👤 *Paciente:* ${name}\n`;
      message += `📞 *WhatsApp:* ${phone}\n`;
      message += `📄 *CPF:* ${patientCpf}\n`;
      message += `🏥 *Convênio:* ${medicalInsurance}\n`;
      if (hasService) {
        const [ano, mes, dia] = date.split('-');
        message += `📅 *Data:* ${dia}/${mes}/${ano}\n`;
        message += `⏱️ *Horário:* ${time}\n`;
      }
    } else if (type === 'salao') {
      message = `*💇 NOVO AGENDAMENTO SALÃO - ${state.config.businessName}*\n\n`;
      message += `👤 *Cliente:* ${name}\n`;
      message += `📞 *WhatsApp:* ${phone}\n`;
      if (hasService) {
        const [ano, mes, dia] = date.split('-');
        message += `📅 *Data:* ${dia}/${mes}/${ano}\n`;
        message += `⏱️ *Horário:* ${time}\n`;
      }
    } else {
      message = `*💇 NOVO AGENDAMENTO - ${state.config.businessName}*\n\n`;
      message += `👤 *Cliente:* ${name}\n`;
      message += `📞 *WhatsApp:* ${phone}\n`;
      if (hasService) {
        const [ano, mes, dia] = date.split('-');
        message += `📅 *Data:* ${dia}/${mes}/${ano}\n`;
        message += `⏱️ *Horário:* ${time}\n`;
      }
    }

    message += `\n🛒 *Itens do Pedido:* \n`;
    state.cart.forEach(item => {
      message += `• ${item.quantity}x ${item.name} (${item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})\n`;
    });

    message += `\n💰 *Total Geral:* ${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n`;
    
    if (notes) {
      message += `\n📝 *Observações:* ${notes}\n`;
    }

    state.cart = [];
    updateCart();
    closeCart();
    
    elements.clientName.value = '';
    elements.clientPhone.value = '';
    elements.clientNotes.value = '';

    const storeWhatsapp = state.config.whatsapp.replace(/\D/g, '');
    const whatsappUrl = `https://api.whatsapp.com/send?phone=55${storeWhatsapp}&text=${encodeURIComponent(message)}`;
    
    alert('Pedido registrado com sucesso no sistema! Redirecionando para o WhatsApp para confirmar com o lojista...');
    window.open(whatsappUrl, '_blank');
  }

  // Executa inicialização
  init();
});
