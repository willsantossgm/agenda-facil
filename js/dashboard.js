/* dashboard.js - Controlador Principal do Painel da plataforma AgendaFácil */

document.addEventListener('DOMContentLoaded', () => {
  // Estado local do Dashboard
  const state = {
    currentTab: 'inicio',
    config: window.store.getConfig()
  };

  // Elementos do DOM
  const elements = {
    sidebar: document.getElementById('sidebar'),
    btnToggleMenu: document.getElementById('btn-toggle-menu'),
    viewTitle: document.getElementById('view-title'),
    viewSubtitle: document.getElementById('view-subtitle'),
    businessBadgeName: document.getElementById('business-badge-name'),
    navLinks: document.querySelectorAll('.nav-link'),
    sections: document.querySelectorAll('.dashboard-view'),
    
    // KPIs
    kpiRevenue: document.getElementById('kpi-revenue'),
    kpiOrders: document.getElementById('kpi-orders'),
    kpiCustomers: document.getElementById('kpi-customers'),
    kpiBookings: document.getElementById('kpi-bookings'),
    recentOrdersList: document.getElementById('recent-orders-list'),
    
    // Form Config
    formConfig: document.getElementById('form-config'),
    configName: document.getElementById('config-name'),
    configType: document.getElementById('config-type'),
    configWhatsapp: document.getElementById('config-whatsapp'),
    configAddress: document.getElementById('config-address'),
    configHours: document.getElementById('config-hours'),
    configCoverUrl: document.getElementById('config-cover-url')
  };

  // Títulos e subtítulos amigáveis por aba
  const tabMeta = {
    inicio: { title: 'Início', subtitle: 'Estatísticas gerais do seu negócio' },
    catalogo: { title: 'Catálogo de Produtos', subtitle: 'Gerencie itens, preços e categorias' },
    agenda: { title: 'Agenda de Serviços', subtitle: 'Veja os compromissos agendados' },
    pedidos: { title: 'Gestão de Pedidos', subtitle: 'Monitore pedidos de delivery e agendamentos' },
    clientes: { title: 'Clientes (CRM)', subtitle: 'Histórico de compras e contatos' },
    configuracoes: { title: 'Configurações', subtitle: 'Personalize os dados da sua vitrine pública' }
  };

  // Inicialização
  function init() {
    setupTabNavigation();
    setupConfigForm();
    updateDashboardKPIs();
    updateRecentOrders();
    setupMobileMenu();
    updateConfigBadgeName();
    
    // Escuta atualizações da store local e atualiza os painéis reativamente
    window.addEventListener('store_updated', (e) => {
      const type = e.detail.type;
      if (type === 'orders' || type === 'customers' || type === 'products') {
        updateDashboardKPIs();
        updateRecentOrders();
      }
      if (type === 'config') {
        state.config = window.store.getConfig();
        updateConfigBadgeName();
      }
    });
  }

  // Alterna Abas da Sidebar
  function setupTabNavigation() {
    elements.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = link.getAttribute('data-tab');
        
        // Remove classe ativa de todos e coloca no atual
        elements.navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        // Oculta todas as seções e exibe a selecionada
        elements.sections.forEach(sec => sec.style.display = 'none');
        const targetSection = document.getElementById(`section-${tab}`);
        if (targetSection) {
          targetSection.style.display = tab === 'inicio' ? 'block' : 'block'; // Trata flex/grid etc
          if (tab === 'inicio') {
            // Renderiza o gráfico do Canvas novamente para garantir o tamanho correto
            if (window.renderRevenueChart) window.renderRevenueChart();
          } else if (tab === 'catalogo' && window.renderCatalog) {
            window.renderCatalog();
          } else if (tab === 'agenda' && window.renderCalendar) {
            window.renderCalendar();
          } else if (tab === 'pedidos' && window.renderOrdersTable) {
            window.renderOrdersTable();
          } else if (tab === 'clientes' && window.renderCustomersTable) {
            window.renderCustomersTable();
          }
        }

        // Atualiza títulos
        if (tabMeta[tab]) {
          elements.viewTitle.textContent = tabMeta[tab].title;
          elements.viewSubtitle.textContent = tabMeta[tab].subtitle;
        }

        state.currentTab = tab;
        
        // No mobile, fecha a sidebar após clicar
        if (window.innerWidth <= 768) {
          elements.sidebar.classList.remove('active');
        }
      });
    });
  }

  // Atualiza crachá superior do negócio
  function updateConfigBadgeName() {
    elements.businessBadgeName.textContent = state.config.businessName;
  }

  // Preenche e salva as configurações
  function setupConfigForm() {
    const config = state.config;
    elements.configName.value = config.businessName || '';
    elements.configType.value = config.businessType || 'ambos';
    elements.configWhatsapp.value = config.whatsapp || '';
    elements.configAddress.value = config.address || '';
    elements.configHours.value = config.hours || '';
    elements.configCoverUrl.value = config.coverImage || '';

    elements.formConfig.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const newConfig = {
        businessName: elements.configName.value.trim(),
        businessType: elements.configType.value,
        whatsapp: elements.configWhatsapp.value.trim(),
        address: elements.configAddress.value.trim(),
        hours: elements.configHours.value.trim(),
        coverImage: elements.configCoverUrl.value.trim() || 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&auto=format&fit=crop&q=80'
      };

      window.store.saveConfig(newConfig);
      alert('Configurações salvas com sucesso!');
    });
  }

  // Lógica dos KPIs do Painel Principal
  function updateDashboardKPIs() {
    const orders = window.store.getOrders();
    const customers = window.store.getCustomers();

    // Faturamento: Soma pedidos confirmados (Pronto/Entregue/Confirmado/Preparando)
    const activeOrders = orders.filter(o => o.status !== 'Cancelado');
    const totalRev = activeOrders.reduce((acc, o) => acc + o.total, 0);
    
    // Agendamentos de hoje
    const todayStr = new Date().toISOString().split('T')[0];
    const bookingsToday = orders.filter(o => o.type === 'agendamento' && o.date === todayStr && o.status !== 'Cancelado');

    elements.kpiRevenue.textContent = totalRev.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    elements.kpiOrders.textContent = orders.length;
    elements.kpiCustomers.textContent = customers.length;
    elements.kpiBookings.textContent = bookingsToday.length;
  }

  // Lista os pedidos recentes na home do painel admin
  function updateRecentOrders() {
    const orders = window.store.getOrders();
    const list = elements.recentOrdersList;
    list.innerHTML = '';

    // Pega os 4 últimos pedidos
    const recent = orders.slice(0, 4);

    if (recent.length === 0) {
      list.innerHTML = `<div class="text-center text-muted p-4">Nenhum pedido recebido.</div>`;
      return;
    }

    recent.forEach(order => {
      const div = document.createElement('div');
      div.className = 'flex justify-between align-center p-2';
      div.style.borderBottom = '1px solid var(--border-color)';
      
      let badgeClass = 'badge-info';
      if (order.status === 'Pronto' || order.status === 'Entregue') badgeClass = 'badge-success';
      if (order.status === 'Preparando') badgeClass = 'badge-warning';
      if (order.status === 'Cancelado') badgeClass = 'badge-danger';

      const typeIcon = order.type === 'agendamento' ? '📅' : '🍔';
      const orderDateInfo = order.type === 'agendamento' ? `${order.date.split('-').reverse().slice(0,2).join('/')} às ${order.time}` : 'Hoje';

      div.innerHTML = `
        <div class="flex flex-col">
          <span style="font-weight: 600;">${typeIcon} ${order.customerName}</span>
          <span class="text-dim" style="font-size: 0.8rem;">${order.items.length} itens • ${orderDateInfo}</span>
        </div>
        <div class="flex align-center gap-2">
          <span style="font-weight: 700;">${order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
          <span class="badge ${badgeClass}" style="font-size:0.7rem; padding: 0.1rem 0.4rem;">${order.status}</span>
        </div>
      `;
      list.appendChild(div);
    });
  }

  // Menu responsivo para celular
  function setupMobileMenu() {
    // Exibe botão de menu no celular
    const checkSize = () => {
      if (window.innerWidth <= 768) {
        elements.btnToggleMenu.style.display = 'block';
      } else {
        elements.btnToggleMenu.style.display = 'none';
        elements.sidebar.classList.remove('active');
      }
    };
    
    checkSize();
    window.addEventListener('resize', checkSize);

    elements.btnToggleMenu.addEventListener('click', () => {
      elements.sidebar.classList.toggle('active');
    });

    // Fecha ao clicar fora no celular
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 768 && 
          !elements.sidebar.contains(e.target) && 
          e.target !== elements.btnToggleMenu) {
        elements.sidebar.classList.remove('active');
      }
    });
  }

  // Inicializa tudo
  init();
});
