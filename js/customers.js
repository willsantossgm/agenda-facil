/* customers.js - Módulo de CRM de Clientes da plataforma AgendaFácil */

document.addEventListener('DOMContentLoaded', () => {
  const elements = {
    customersTableBody: document.getElementById('customers-table-body')
  };

  function init() {
    renderCustomersTable();
  }

  function renderCustomersTable() {
    const customers = window.store.getCustomers();
    elements.customersTableBody.innerHTML = '';

    if (customers.length === 0) {
      elements.customersTableBody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-muted" style="padding:2rem;">Nenhum cliente cadastrado ainda.</td>
        </tr>
      `;
      return;
    }

    // Ordena clientes pelo total gasto decrescente (clientes mais valiosos primeiro)
    customers.sort((a, b) => b.totalSpent - a.totalSpent);

    customers.forEach(client => {
      const tr = document.createElement('tr');
      
      const totalSpentFormatted = client.totalSpent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

      tr.innerHTML = `
        <td style="font-weight:600;">${client.name}</td>
        <td>
          <a href="https://api.whatsapp.com/send?phone=55${client.phone.replace(/\D/g, '')}" target="_blank" class="flex align-center gap-1" style="font-weight:500;">
            📱 ${client.phone}
          </a>
        </td>
        <td class="text-dim" style="font-size:0.875rem;">${client.email || 'Não informado'}</td>
        <td style="font-weight:600; text-align:center;">${client.ordersCount}</td>
        <td style="font-weight:700; color:var(--primary-light);">${totalSpentFormatted}</td>
      `;
      elements.customersTableBody.appendChild(tr);
    });
  }

  // Expõe globalmente
  window.renderCustomersTable = renderCustomersTable;

  init();
});
