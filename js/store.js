/* store.js - Gerenciador de Banco de Dados Local da plataforma AgendaFácil */

class Store {
  constructor() {
    this.init();
  }

  init() {
    // Inicializa dados fictícios de demonstração caso o localStorage esteja vazio
    if (!localStorage.getItem('agendafacil_setup')) {
      const defaultProducts = [
        // Serviços de Barbearia/Beleza
        { id: 'p1', name: 'Corte Degradê', price: 35.00, type: 'servico', category: 'Cortes', duration: 30, desc: 'Corte moderno degradê com acabamento premium e lavagem.', image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500&auto=format&fit=crop&q=60' },
        { id: 'p2', name: 'Barba Completa', price: 30.00, type: 'servico', category: 'Barba', duration: 20, desc: 'Modelagem de barba na navalha com toalha quente e óleos hidratantes.', image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&auto=format&fit=crop&q=60' },
        { id: 'p3', name: 'Corte + Barba', price: 60.00, type: 'servico', category: 'Combo', duration: 50, desc: 'Combo completo de cabelo e barba com desconto especial.', image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500&auto=format&fit=crop&q=60' },
        { id: 'p4', name: 'Corte Tesoura', price: 40.00, type: 'servico', category: 'Cortes', duration: 45, desc: 'Corte tradicional inteiramente na tesoura.', image: 'https://images.unsplash.com/photo-1634480256802-7cb5b451f99a?w=500&auto=format&fit=crop&q=60' },
        { id: 'p5', name: 'Limpeza de Pele', price: 50.00, type: 'servico', category: 'Outros', duration: 40, desc: 'Esfoliação, extração de cravos e máscara hidratante calmante.', image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=500&auto=format&fit=crop&q=60' },
        { id: 'p6', name: 'Sobrancelha Navalha', price: 15.00, type: 'servico', category: 'Outros', duration: 15, desc: 'Desenho e alinhamento de sobrancelha na navalha.', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60' },

        // Produtos Lanchonete/Delivery
        { id: 'p7', name: 'Hambúrguer Artesanal', price: 28.90, type: 'produto', category: 'Lanches', desc: 'Pão brioche, blend bovino 150g, muito queijo prato, alface, tomate e maionese artesanal.', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60' },
        { id: 'p8', name: 'Batata Frita Rústica', price: 14.90, type: 'produto', category: 'Acompanhamentos', desc: 'Porção individual de batatas rústicas fritas salpicadas com páprica e alecrim.', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=60' },
        { id: 'p9', name: 'Combo Smash Duplo', price: 39.90, type: 'produto', category: 'Lanches', desc: 'Smash burguer duplo (2x 80g), queijo cheddar duplo, bacon crocante, batata frita pequena e refrigerante lata.', image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=500&auto=format&fit=crop&q=60' },
        { id: 'p10', name: 'Refrigerante Lata', price: 6.00, type: 'produto', category: 'Bebidas', desc: 'Coca-Cola, Guaraná Antarctica ou Sprite 350ml bem gelado.', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=60' }
      ];

      const defaultCustomers = [
        { id: 'c1', name: 'Carlos Henrique', phone: '11988887777', email: 'carlos@email.com', ordersCount: 5, totalSpent: 185.00 },
        { id: 'c2', name: 'Mariana Costa', phone: '11977776666', email: 'mari@email.com', ordersCount: 3, totalSpent: 125.00 },
        { id: 'c3', name: 'Bruno Alves', phone: '11966665555', email: 'bruno@email.com', ordersCount: 8, totalSpent: 320.00 },
        { id: 'c4', name: 'Juliana Mendes', phone: '11955554444', email: 'juliana@email.com', ordersCount: 2, totalSpent: 55.00 },
        { id: 'c5', name: 'Felipe Santos', phone: '11944443333', email: 'felipe@email.com', ordersCount: 1, totalSpent: 30.00 }
      ];

      const defaultOrders = [
        { 
          id: 'o101', 
          customerName: 'Carlos Henrique', 
          customerPhone: '11988887777', 
          type: 'pedido', // Lanchonete / Delivery
          status: 'Pronto', // Pendente, Preparando, Pronto, Entregue, Cancelado
          date: new Date().toISOString().split('T')[0],
          items: [
            { id: 'p7', name: 'Hambúrguer Artesanal', price: 28.90, quantity: 2 },
            { id: 'p10', name: 'Refrigerante Lata', price: 6.00, quantity: 2 }
          ],
          total: 69.80,
          notes: 'Sem cebola em um dos lanches.'
        },
        { 
          id: 'o102', 
          customerName: 'Mariana Costa', 
          customerPhone: '11977776666', 
          type: 'agendamento', // Barbearia / Salão
          status: 'Preparando', // Preparando será considerado "Confirmado" para agendamento nesta demo
          date: new Date().toISOString().split('T')[0],
          time: '14:30',
          items: [
            { id: 'p1', name: 'Corte Degradê', price: 35.00, quantity: 1 }
          ],
          total: 35.00,
          notes: 'Deseja fazer risquinho na sobrancelha.'
        },
        { 
          id: 'o103', 
          customerName: 'Bruno Alves', 
          customerPhone: '11966665555', 
          type: 'agendamento', 
          status: 'Pendente', 
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Amanhã
          time: '10:00',
          items: [
            { id: 'p3', name: 'Corte + Barba', price: 60.00, quantity: 1 }
          ],
          total: 60.00,
          notes: ''
        },
        { 
          id: 'o104', 
          customerName: 'Juliana Mendes', 
          customerPhone: '11955554444', 
          type: 'pedido', 
          status: 'Pendente', 
          date: new Date().toISOString().split('T')[0],
          items: [
            { id: 'p9', name: 'Combo Smash Duplo', price: 39.90, quantity: 1 },
            { id: 'p8', name: 'Batata Frita Rústica', price: 14.90, quantity: 1 }
          ],
          total: 54.80,
          notes: 'Molho extra.'
        }
      ];

      const defaultAnalytics = {
        dailySales: [
          { date: 'Seg', sales: 320.00, count: 8 },
          { date: 'Ter', sales: 480.00, count: 12 },
          { date: 'Qua', sales: 410.00, count: 9 },
          { date: 'Qui', sales: 650.00, count: 15 },
          { date: 'Sex', sales: 980.00, count: 22 },
          { date: 'Sáb', sales: 1450.00, count: 35 },
          { date: 'Dom', sales: 850.00, count: 18 }
        ]
      };

      const defaultConfig = {
        businessName: 'Barbearia & Bistrô Premium',
        phone: '11988887777',
        whatsapp: '11988887777',
        address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
        hours: 'Seg a Sáb das 09:00 às 20:00',
        businessType: 'ambos', // barbearia, lanchonete, ambos
        coverImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&auto=format&fit=crop&q=80'
      };

      localStorage.setItem('agendafacil_products', JSON.stringify(defaultProducts));
      localStorage.setItem('agendafacil_customers', JSON.stringify(defaultCustomers));
      localStorage.setItem('agendafacil_orders', JSON.stringify(defaultOrders));
      localStorage.setItem('agendafacil_analytics', JSON.stringify(defaultAnalytics));
      localStorage.setItem('agendafacil_config', JSON.stringify(defaultConfig));
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
}

// Expõe a store globalmente
window.store = new Store();
