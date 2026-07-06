/* calendar.js - Módulo de Calendário Administrativo da plataforma AgendaFácil */

document.addEventListener('DOMContentLoaded', () => {
  const elements = {
    monthYearTitle: document.getElementById('calendar-month-year'),
    prevMonthBtn: document.getElementById('btn-prev-month'),
    nextMonthBtn: document.getElementById('btn-next-month'),
    daysContainer: document.getElementById('calendar-days-container'),
    selectedDateBadge: document.getElementById('selected-agenda-date'),
    agendaSlotsList: document.getElementById('agenda-slots-list')
  };

  const currentDate = new Date();
  let viewYear = currentDate.getFullYear();
  let viewMonth = currentDate.getMonth(); // 0-indexed (Jan = 0, Dez = 11)
  let selectedDateStr = currentDate.toISOString().split('T')[0];

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  function init() {
    setupMonthNavigation();
    renderCalendar();
  }

  function setupMonthNavigation() {
    elements.prevMonthBtn.addEventListener('click', () => {
      viewMonth--;
      if (viewMonth < 0) {
        viewMonth = 11;
        viewYear--;
      }
      renderCalendar();
    });

    elements.nextMonthBtn.addEventListener('click', () => {
      viewMonth++;
      if (viewMonth > 11) {
        viewMonth = 0;
        viewYear++;
      }
      renderCalendar();
    });
  }

  function renderCalendar() {
    elements.monthYearTitle.textContent = `${monthNames[viewMonth]} ${viewYear}`;
    elements.daysContainer.innerHTML = '';

    // Nomes dos dias da semana
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    weekDays.forEach(day => {
      const div = document.createElement('div');
      div.className = 'calendar-day-name';
      div.textContent = day;
      elements.daysContainer.appendChild(div);
    });

    // Primeiro dia do mês e número de dias
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const numberOfDays = new Date(viewYear, viewMonth + 1, 0).getDate();

    // Espaços vazios antes do primeiro dia
    for (let i = 0; i < firstDayIndex; i++) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'calendar-day empty';
      elements.daysContainer.appendChild(emptyDiv);
    }

    // Dias do mês
    const orders = window.store.getOrders();

    for (let day = 1; day <= numberOfDays; day++) {
      const dayButton = document.createElement('button');
      dayButton.className = 'calendar-day';
      dayButton.textContent = day;

      // Monta data no formato YYYY-MM-DD
      const monthStr = String(viewMonth + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const dateStr = `${viewYear}-${monthStr}-${dayStr}`;

      // Verifica se o dia é o selecionado
      if (dateStr === selectedDateStr) {
        dayButton.classList.add('active');
      }

      // Verifica se há agendamentos ativos nesse dia
      const dayEvents = orders.filter(o => o.type === 'agendamento' && o.date === dateStr && o.status !== 'Cancelado');
      if (dayEvents.length > 0) {
        dayButton.classList.add('has-events');
      }

      // Evento de clique para selecionar o dia
      dayButton.addEventListener('click', () => {
        selectedDateStr = dateStr;
        
        // Remove active dos outros e coloca nesse
        elements.daysContainer.querySelectorAll('.calendar-day').forEach(btn => btn.classList.remove('active'));
        dayButton.classList.add('active');
        
        renderDailySlots();
      });

      elements.daysContainer.appendChild(dayButton);
    }

    // Inicializa a lista lateral
    renderDailySlots();
  }

  // Renderiza a lista de compromissos no dia selecionado
  function renderDailySlots() {
    const [ano, mes, dia] = selectedDateStr.split('-');
    elements.selectedDateBadge.textContent = `${dia}/${mes}/${ano}`;

    const orders = window.store.getOrders();
    const dayBookings = orders.filter(o => o.type === 'agendamento' && o.date === selectedDateStr);

    elements.agendaSlotsList.innerHTML = '';

    if (dayBookings.length === 0) {
      elements.agendaSlotsList.innerHTML = `<div class="text-center text-muted p-8">Nenhum compromisso marcado para este dia.</div>`;
      return;
    }

    // Ordena por horário crescente
    dayBookings.sort((a, b) => a.time.localeCompare(b.time));

    dayBookings.forEach(booking => {
      const slotEl = document.createElement('div');
      slotEl.className = 'slot-item';
      
      const listItemsText = booking.items.map(i => `${i.quantity}x ${i.name}`).join(', ');
      
      let statusBadge = '';
      if (booking.status === 'Pendente') statusBadge = '<span class="badge badge-warning" style="font-size:0.65rem;">Pendente</span>';
      if (booking.status === 'Confirmado' || booking.status === 'Preparando' || booking.status === 'Pronto') statusBadge = '<span class="badge badge-info" style="font-size:0.65rem;">Confirmado</span>';
      if (booking.status === 'Entregue') statusBadge = '<span class="badge badge-success" style="font-size:0.65rem;">Finalizado</span>';
      if (booking.status === 'Cancelado') statusBadge = '<span class="badge badge-danger" style="font-size:0.65rem;">Cancelado</span>';

      let actionButtons = '';
      if (booking.status !== 'Cancelado' && booking.status !== 'Entregue') {
        actionButtons = `
          <div class="flex gap-1">
            <button class="btn btn-outline btn-sm btn-action-finish" data-id="${booking.id}" style="padding:0.25rem 0.5rem; font-size:0.75rem;">✔ Concluir</button>
            <button class="btn btn-danger btn-sm btn-action-cancel" data-id="${booking.id}" style="padding:0.25rem 0.5rem; font-size:0.75rem;">Cancel</button>
          </div>
        `;
      }

      slotEl.innerHTML = `
        <div class="flex flex-col gap-1">
          <div class="flex align-center gap-2">
            <span style="font-weight:700; color:var(--primary-light); font-size: 1.1rem;">⏱️ ${booking.time}</span>
            <span>${statusBadge}</span>
          </div>
          <span style="font-weight:600;">${booking.customerName}</span>
          <span class="text-dim" style="font-size: 0.8rem;">${listItemsText}</span>
          ${booking.notes ? `<span class="text-muted" style="font-size:0.8rem; font-style:italic;">Obs: ${booking.notes}</span>` : ''}
        </div>
        ${actionButtons}
      `;
      elements.agendaSlotsList.appendChild(slotEl);
    });

    // Associa eventos rápidos aos botões de ação
    elements.agendaSlotsList.querySelectorAll('.btn-action-finish').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        window.store.updateOrderStatus(id, 'Entregue'); // Considerado Finalizado
        renderCalendar();
      });
    });

    elements.agendaSlotsList.querySelectorAll('.btn-action-cancel').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
          window.store.updateOrderStatus(id, 'Cancelado');
          renderCalendar();
        }
      });
    });
  }

  // Expõe funções globais para atualizar
  window.renderCalendar = renderCalendar;

  init();
});
