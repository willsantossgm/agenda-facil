/* orders.js - Módulo de Gestão de Pedidos da plataforma AgendaFácil */

document.addEventListener('DOMContentLoaded', () => {
  const elements = {
    ordersTableBody: document.getElementById('orders-table-body')
  };

  function init() {
    renderOrdersTable();
  }

  function renderOrdersTable() {
    const orders = window.store.getOrders();
    elements.ordersTableBody.innerHTML = '';

    if (orders.length === 0) {
      elements.ordersTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center text-muted" style="padding:2rem;">Nenhum pedido ou agendamento registrado.</td>
        </tr>
      `;
      return;
    }

    orders.forEach(order => {
      const tr = document.createElement('tr');
      
      const itemsList = order.items.map(i => `${i.quantity}x ${i.name}`).join('<br>');
      const typeBadge = order.type === 'agendamento' 
        ? '<span class="badge badge-info">Agendamento</span>' 
        : '<span class="badge badge-success">Delivery/Balcão</span>';

      const priceFormatted = order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      
      // Data e hora amigáveis
      let dateTimeFormatted = '';
      if (order.type === 'agendamento') {
        const [ano, mes, dia] = order.date.split('-');
        dateTimeFormatted = `📅 ${dia}/${mes}/${ano}<br>⏱️ ${order.time}`;
      } else {
        const [ano, mes, dia] = order.date.split('-');
        dateTimeFormatted = `📅 ${dia}/${mes}/${ano}`;
      }

      // Dropdown de status estilizado
      const statuses = ['Pendente', 'Preparando', 'Pronto', 'Entregue', 'Cancelado'];
      let statusOptions = '';
      statuses.forEach(s => {
        // Renomeia visualmente os status de agendamento se necessário
        let displayLabel = s;
        if (order.type === 'agendamento') {
          if (s === 'Preparando') displayLabel = 'Confirmado';
          if (s === 'Pronto') displayLabel = 'Realizando';
          if (s === 'Entregue') displayLabel = 'Concluído';
        }
        statusOptions += `<option value="${s}" ${order.status === s ? 'selected' : ''}>${displayLabel}</option>`;
      });

      let customerDetails = `
        <div class="flex flex-col">
          <span style="font-weight:600;">${order.customerName}</span>
          <span class="text-dim" style="font-size:0.8rem;">📱 ${order.customerPhone}</span>
      `;
      if (order.deliveryType) {
        customerDetails += `<span class="badge ${order.deliveryType === 'entrega' ? 'badge-info' : 'badge-success'}" style="font-size:0.65rem; margin-top:0.25rem; width:fit-content;">${order.deliveryType === 'entrega' ? '🛵 Entrega' : '🏪 Retirada'}</span>`;
        if (order.deliveryType === 'entrega' && order.deliveryAddress) {
          customerDetails += `<span class="text-muted" style="font-size:0.75rem; margin-top:0.15rem; max-width:200px; display:inline-block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${order.deliveryAddress}">📍 ${order.deliveryAddress}</span>`;
        }
      } else if (order.vehicleModel) {
        customerDetails += `<span class="text-muted" style="font-size:0.75rem; margin-top:0.25rem;">🚗 ${order.vehicleModel} (${order.vehicleSize})</span>`;
        customerDetails += `<span class="badge badge-info" style="font-size:0.65rem; margin-top:0.15rem; width:fit-content; text-transform:uppercase;">Placa: ${order.vehiclePlate}</span>`;
      }
      customerDetails += `</div>`;

      tr.innerHTML = `
        <td style="font-weight:700;">#${order.id}</td>
        <td>${customerDetails}</td>
        <td>${typeBadge}</td>
        <td style="font-size:0.875rem; line-height:1.4;">${dateTimeFormatted}</td>
        <td style="font-size:0.875rem; font-weight:500; line-height:1.4;">
          ${itemsList}
          <div style="font-size:0.75rem; font-style:italic; color:var(--text-dim); margin-top:0.25rem;">
            ${order.notes ? `Obs: ${order.notes}` : ''}
          </div>
        </td>
        <td style="font-weight:700; font-size:1rem;">${priceFormatted}</td>
        <td>
          <select class="form-input form-select select-order-status" data-id="${order.id}" style="padding:0.4rem 2rem 0.4rem 0.75rem; font-size:0.85rem; width:130px; font-weight:600;">
            ${statusOptions}
          </select>
        </td>
        <td class="text-center">
          <button class="btn btn-danger btn-sm btn-delete-order" data-id="${order.id}" style="padding:0.4rem;">
            Excluir
          </button>
        </td>
      `;
      elements.ordersTableBody.appendChild(tr);
    });

    // Associa evento de alteração de status
    elements.ordersTableBody.querySelectorAll('.select-order-status').forEach(select => {
      select.addEventListener('change', (e) => {
        const id = e.target.getAttribute('data-id');
        const newStatus = e.target.value;
        window.store.updateOrderStatus(id, newStatus);
        renderOrdersTable();
      });
    });

    // Excluir pedido
    elements.ordersTableBody.querySelectorAll('.btn-delete-order').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        if (confirm('Deseja excluir este pedido permanentemente? Isso alterará as estatísticas.')) {
          let orders = window.store.getOrders();
          orders = orders.filter(o => o.id !== id);
          window.store.saveOrders(orders);
          renderOrdersTable();
        }
      });
    });
  }

  // Expõe globalmente
  window.renderOrdersTable = renderOrdersTable;

  init();
});
