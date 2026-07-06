/* store.js - Gerenciador de Banco de Dados Local da plataforma AgendaFácil */

class Store {
  constructor() {
    this.init();
  }

  init() {
    // Inicializa dados fictícios de demonstração padrão (beleza) caso o localStorage esteja vazio
    if (!localStorage.getItem('agendafacil_setup')) {
      this.resetToDefaultData('beleza');
      localStorage.setItem('agendafacil_setup', 'true');
    }
  }

  // Getters
  getProducts() {
    return JSON.parse(localStorage.getItem('agendafacil_products')) || [];
  }

  getCustomers() {
    return JSON.parse(localStorage.getItem('agendafacil_customers')) || [];
  }

  getOrders() {
    return JSON.parse(localStorage.getItem('agendafacil_orders')) || [];
  }

  getAnalytics() {
    return JSON.parse(localStorage.getItem('agendafacil_analytics')) || {};
  }

  getConfig() {
    return JSON.parse(localStorage.getItem('agendafacil_config')) || {};
  }

  // Setters/Salvar
  saveProducts(products) {
    localStorage.setItem('agendafacil_products', JSON.stringify(products));
    this.dispatchUpdate('products');
  }

  saveCustomers(customers) {
    localStorage.setItem('agendafacil_customers', JSON.stringify(customers));
    this.dispatchUpdate('customers');
  }

  saveOrders(orders) {
    localStorage.setItem('agendafacil_orders', JSON.stringify(orders));
    this.dispatchUpdate('orders');
  }

  saveConfig(config) {
    localStorage.setItem('agendafacil_config', JSON.stringify(config));
    this.dispatchUpdate('config');
  }

  // Helpers de Atualização e Emissão de Eventos
  dispatchUpdate(type) {
    const event = new CustomEvent('store_updated', { detail: { type } });
    window.dispatchEvent(event);
  }

  // Operações de CRUD
  addProduct(product) {
    const products = this.getProducts();
    product.id = 'p_' + Date.now();
    products.push(product);
    this.saveProducts(products);
    return product;
  }

  updateProduct(updatedProduct) {
    let products = this.getProducts();
    products = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
    this.saveProducts(products);
    return updatedProduct;
  }

  deleteProduct(id) {
    let products = this.getProducts();
    products = products.filter(p => p.id !== id);
    this.saveProducts(products);
  }

  addOrder(order) {
    const orders = this.getOrders();
    order.id = 'o' + (100 + orders.length + 1);
    order.date = order.date || new Date().toISOString().split('T')[0];
    orders.unshift(order); // Adiciona no início da lista (mais recentes primeiro)
    this.saveOrders(orders);

    // Adicionar/Atualizar Cliente
    this.addOrUpdateCustomerFromOrder(order);

    return order;
  }

  updateOrderStatus(orderId, status) {
    let orders = this.getOrders();
    orders = orders.map(o => {
      if (o.id === orderId) {
        o.status = status;
      }
      return o;
    });
    this.saveOrders(orders);
  }

  addOrUpdateCustomerFromOrder(order) {
    const customers = this.getCustomers();
    const existing = customers.find(c => c.phone === order.customerPhone || (order.customerEmail && c.email === order.customerEmail));

    if (existing) {
      existing.ordersCount += 1;
      existing.totalSpent += order.total;
    } else {
      customers.push({
        id: 'c_' + Date.now(),
        name: order.customerName,
        phone: order.customerPhone,
        email: order.customerEmail || '',
        ordersCount: 1,
        totalSpent: order.total
      });
    }
    this.saveCustomers(customers);
  }

  // Reseta todo o localStorage carregando dados de simulação ricos de um nicho específico
  resetToDefaultData(nicho) {
    let products = [];
    let customers = [];
    let orders = [];
    let analytics = {
      dailySales: [
        { date: 'Seg', sales: 300.00, count: 6 },
        { date: 'Ter', sales: 450.00, count: 10 },
        { date: 'Qua', sales: 380.00, count: 8 },
        { date: 'Qui', sales: 600.00, count: 12 },
        { date: 'Sex', sales: 900.00, count: 18 },
        { date: 'Sáb', sales: 1400.00, count: 28 },
        { date: 'Dom', sales: 700.00, count: 14 }
      ]
    };
    let config = {};

    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    if (nicho === 'comida') {
      config = {
        businessName: 'Burger & Cia Gourmet',
        phone: '11977778888',
        whatsapp: '11977778888',
        address: 'Rua Augusta, 1500 - Consolação, São Paulo - SP',
        hours: 'Ter a Dom das 18:00 às 23:30',
        businessType: 'comida',
        coverImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&auto=format&fit=crop&q=80'
      };

      products = [
        { id: 'p201', name: 'Hambúrguer Artesanal', price: 28.90, type: 'produto', category: 'Lanches', desc: 'Pão brioche, blend bovino 150g, muito queijo prato, alface, tomate e maionese artesanal.', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60' },
        { id: 'p202', name: 'Combo Smash Duplo', price: 39.90, type: 'produto', category: 'Lanches', desc: 'Smash burguer duplo (2x 80g), queijo cheddar duplo, bacon crocante, batata frita pequena e refrigerante lata.', image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=500&auto=format&fit=crop&q=60' },
        { id: 'p203', name: 'Batata Rústica Individual', price: 14.90, type: 'produto', category: 'Acompanhamentos', desc: 'Batatas rústicas douradas temperadas com páprica defumada e alecrim.', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=60' },
        { id: 'p204', name: 'Refrigerante Lata', price: 6.00, type: 'produto', category: 'Bebidas', desc: 'Coca-Cola ou Guaraná lata de 350ml gelado.', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=60' },
        { id: 'p205', name: 'Milkshake Ovomaltine', price: 18.00, type: 'produto', category: 'Bebidas', desc: 'Delicioso milkshake cremoso de baunilha batido com Ovomaltine crocante (400ml).', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=60' }
      ];

      customers = [
        { id: 'c201', name: 'Rodrigo Medeiros', phone: '11988884444', email: 'rodrigo@email.com', ordersCount: 4, totalSpent: 156.40 },
        { id: 'c202', name: 'Beatriz Diniz', phone: '11977773333', email: 'bia@email.com', ordersCount: 2, totalSpent: 78.80 }
      ];

      orders = [
        {
          id: 'o201',
          customerName: 'Rodrigo Medeiros',
          customerPhone: '11988884444',
          type: 'pedido',
          status: 'Pronto',
          date: today,
          deliveryType: 'entrega',
          deliveryAddress: 'Alameda Santos, 900 - Apto 42 - Cerqueira César, São Paulo - SP',
          items: [
            { id: 'p201', name: 'Hambúrguer Artesanal', price: 28.90, quantity: 2 },
            { id: 'p204', name: 'Refrigerante Lata', price: 6.00, quantity: 2 }
          ],
          total: 69.80,
          notes: 'Por favor, enviar sachê de maionese verde.'
        },
        {
          id: 'o202',
          customerName: 'Beatriz Diniz',
          customerPhone: '11977773333',
          type: 'pedido',
          status: 'Pendente',
          date: today,
          deliveryType: 'retirada',
          deliveryAddress: '',
          items: [
            { id: 'p202', name: 'Combo Smash Duplo', price: 39.90, quantity: 1 }
          ],
          total: 39.90,
          notes: 'Retirada em 20 minutos.'
        }
      ];

    } else if (nicho === 'automotivo') {
      config = {
        businessName: 'Lava Rápido Express & Estética',
        phone: '11999992222',
        whatsapp: '11999992222',
        address: 'Av. dos Autonomistas, 2200 - Centro, Osasco - SP',
        hours: 'Seg a Sáb das 08:00 às 18:00',
        businessType: 'automotivo',
        coverImage: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=1200&auto=format&fit=crop&q=80'
      };

      products = [
        { id: 'p301', name: 'Ducha Rápida', price: 30.00, type: 'servico', category: 'Lavagens', duration: 25, desc: 'Lavagem externa ágil, secagem manual e aplicação de silicone nos pneus.', image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=500&auto=format&fit=crop&q=60' },
        { id: 'p302', name: 'Lavagem Completa', price: 55.00, type: 'servico', category: 'Lavagens', duration: 60, desc: 'Lavagem externa detalhada com cera, aspiração interna, limpeza de painéis, vidros e portas.', image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=500&auto=format&fit=crop&q=60' },
        { id: 'p303', name: 'Higienização de Bancos', price: 130.00, type: 'servico', category: 'Estética', duration: 90, desc: 'Lavagem extratora profunda para remoção de manchas e odores em bancos de tecido ou hidratação de couro.', image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500&auto=format&fit=crop&q=60' },
        { id: 'p304', name: 'Polimento Comercial', price: 180.00, type: 'servico', category: 'Estética', duration: 120, desc: 'Polimento para realce da pintura e remoção de riscos superficiais.', image: 'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?w=500&auto=format&fit=crop&q=60' },
        { id: 'p305', name: 'Silicone Líquido (Frasco)', price: 20.00, type: 'produto', category: 'Produtos', desc: 'Frasco aplicador de silicone em gel premium para partes plásticas internas (150ml).', image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=500&auto=format&fit=crop&q=60' }
      ];

      customers = [
        { id: 'c301', name: 'Marcos Silva', phone: '11999994444', email: 'marcos@email.com', ordersCount: 3, totalSpent: 140.00 },
        { id: 'c302', name: 'Aline Pires', phone: '11988883333', email: 'aline@email.com', ordersCount: 1, totalSpent: 55.00 }
      ];

      orders = [
        {
          id: 'o301',
          customerName: 'Marcos Silva',
          customerPhone: '11999994444',
          type: 'agendamento',
          status: 'Pronto',
          date: today,
          time: '09:00',
          vehicleModel: 'Corolla Cinza',
          vehiclePlate: 'ABC-1D23',
          vehicleSize: 'Passeio',
          items: [
            { id: 'p302', name: 'Lavagem Completa', price: 55.00, quantity: 1 }
          ],
          total: 55.00,
          notes: 'Focar na aspiração do porta-malas.'
        },
        {
          id: 'o302',
          customerName: 'Aline Pires',
          customerPhone: '11988883333',
          type: 'agendamento',
          status: 'Pendente',
          date: tomorrow,
          time: '14:00',
          vehicleModel: 'Jeep Compass Preto',
          vehiclePlate: 'XYZ-9A87',
          vehicleSize: 'SUV',
          items: [
            { id: 'p302', name: 'Lavagem Completa', price: 55.00, quantity: 1 }
          ],
          total: 55.00,
          notes: ''
        }
      ];

    } else {
      // Padrão: Beleza / Barbearia
      config = {
        businessName: 'Barbearia & Salão Premium',
        phone: '11988887777',
        whatsapp: '11988887777',
        address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
        hours: 'Seg a Sáb das 09:00 às 20:00',
        businessType: 'beleza',
        coverImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&auto=format&fit=crop&q=80'
      };

      products = [
        { id: 'p1', name: 'Corte Degradê', price: 35.00, type: 'servico', category: 'Cortes', duration: 30, desc: 'Corte moderno degradê com acabamento premium e lavagem.', image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500&auto=format&fit=crop&q=60' },
        { id: 'p2', name: 'Barba Completa', price: 30.00, type: 'servico', category: 'Barba', duration: 20, desc: 'Modelagem de barba na navalha com toalha quente e óleos hidratantes.', image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&auto=format&fit=crop&q=60' },
        { id: 'p3', name: 'Corte + Barba', price: 60.00, type: 'servico', category: 'Combo', duration: 50, desc: 'Combo completo de cabelo e barba com desconto especial.', image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500&auto=format&fit=crop&q=60' },
        { id: 'p4', name: 'Limpeza de Pele', price: 50.00, type: 'servico', category: 'Outros', duration: 40, desc: 'Esfoliação, extração de cravos e máscara hidratante calmante.', image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=500&auto=format&fit=crop&q=60' },
        { id: 'p5', name: 'Sobrancelha Navalha', price: 15.00, type: 'servico', category: 'Outros', duration: 15, desc: 'Desenho e alinhamento de sobrancelha na navalha.', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60' }
      ];

      customers = [
        { id: 'c1', name: 'Carlos Henrique', phone: '11988887777', email: 'carlos@email.com', ordersCount: 5, totalSpent: 185.00 },
        { id: 'c2', name: 'Mariana Costa', phone: '11977776666', email: 'mari@email.com', ordersCount: 3, totalSpent: 125.00 }
      ];

      orders = [
        {
          id: 'o1',
          customerName: 'Carlos Henrique',
          customerPhone: '11988887777',
          type: 'agendamento',
          status: 'Pronto',
          date: today,
          time: '10:00',
          items: [
            { id: 'p1', name: 'Corte Degradê', price: 35.00, quantity: 1 }
          ],
          total: 35.00,
          notes: ''
        },
        {
          id: 'o2',
          customerName: 'Mariana Costa',
          customerPhone: '11977776666',
          type: 'agendamento',
          status: 'Pendente',
          date: today,
          time: '14:30',
          items: [
            { id: 'p3', name: 'Corte + Barba', price: 60.00, quantity: 1 }
          ],
          total: 60.00,
          notes: 'Deseja fazer risquinho na sobrancelha.'
        }
      ];
    }

    // Salva os dados no localStorage e emite sinal de atualização
    localStorage.setItem('agendafacil_products', JSON.stringify(products));
    localStorage.setItem('agendafacil_customers', JSON.stringify(customers));
    localStorage.setItem('agendafacil_orders', JSON.stringify(orders));
    localStorage.setItem('agendafacil_analytics', JSON.stringify(analytics));
    localStorage.setItem('agendafacil_config', JSON.stringify(config));

    this.dispatchUpdate('products');
    this.dispatchUpdate('customers');
    this.dispatchUpdate('orders');
    this.dispatchUpdate('config');
  }
}

// Expõe a store globalmente
window.store = new Store();
