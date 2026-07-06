/* charts.js - Gráficos com Canvas HTML5 Puro (Sem dependências externas) da plataforma AgendaFácil */

function renderRevenueChart() {
  const canvas = document.getElementById('revenue-chart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  
  // Ajusta resolução interna para telas retina/high-dpi
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height;

  // Busca vendas reais/fictícias da store
  const analytics = window.store.getAnalytics();
  const salesData = analytics.dailySales || [];

  if (salesData.length === 0) return;

  // Configurações do gráfico
  const padding = { top: 20, right: 20, bottom: 30, left: 50 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Limpa o canvas
  ctx.clearRect(0, 0, width, height);

  // Valores Máximos/Mínimos
  const maxSales = Math.max(...salesData.map(d => d.sales), 500); // Garante um teto mínimo de R$ 500
  const minSales = 0;

  // Eixos / Linhas de Grade de Fundo
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  ctx.fillStyle = '#6B7280'; // Cor do texto de suporte
  ctx.font = '10px Inter, sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';

  const gridLines = 4;
  for (let i = 0; i <= gridLines; i++) {
    const yVal = minSales + (maxSales - minSales) * (i / gridLines);
    const y = padding.top + graphHeight - (i / gridLines) * graphHeight;

    // Linha horizontal
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();

    // Texto do Eixo Y
    ctx.fillText(`R$ ${Math.round(yVal)}`, padding.left - 10, y);
  }

  // Mapeia coordenadas dos pontos
  const points = salesData.map((data, index) => {
    const x = padding.left + (index / (salesData.length - 1)) * graphWidth;
    const y = padding.top + graphHeight - ((data.sales - minSales) / (maxSales - minSales)) * graphHeight;
    return { x, y, label: data.date, sales: data.sales };
  });

  // 1. Desenha o preenchimento gradiente abaixo da linha
  const fillGradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + graphHeight);
  fillGradient.addColorStop(0, 'rgba(124, 58, 237, 0.35)'); // Roxo transparente
  fillGradient.addColorStop(1, 'rgba(124, 58, 237, 0.0)');

  ctx.fillStyle = fillGradient;
  ctx.beginPath();
  ctx.moveTo(points[0].x, padding.top + graphHeight);
  
  // Desenha curva suave (Bezier)
  for (let i = 0; i < points.length; i++) {
    if (i === 0) {
      ctx.lineTo(points[i].x, points[i].y);
    } else {
      const cpX1 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
      const cpY1 = points[i - 1].y;
      const cpX2 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
      const cpY2 = points[i].y;
      ctx.bezierCurveTo(cpX1, cpY1, cpX2, cpY2, points[i].x, points[i].y);
    }
  }
  ctx.lineTo(points[points.length - 1].x, padding.top + graphHeight);
  ctx.closePath();
  ctx.fill();

  // 2. Desenha a linha de contorno principal
  const strokeGradient = ctx.createLinearGradient(padding.left, 0, width - padding.right, 0);
  strokeGradient.addColorStop(0, '#A78BFA');
  strokeGradient.addColorStop(0.5, '#7C3AED');
  strokeGradient.addColorStop(1, '#EC4899');

  ctx.strokeStyle = strokeGradient;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  
  for (let i = 0; i < points.length; i++) {
    if (i === 0) {
      ctx.moveTo(points[i].x, points[i].y);
    } else {
      const cpX1 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
      const cpY1 = points[i - 1].y;
      const cpX2 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
      const cpY2 = points[i].y;
      ctx.bezierCurveTo(cpX1, cpY1, cpX2, cpY2, points[i].x, points[i].y);
    }
  }
  ctx.stroke();

  // 3. Desenha pontos (círculos) e textos do eixo X
  ctx.fillStyle = '#9CA3AF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  points.forEach(pt => {
    // Texto do Eixo X
    ctx.fillText(pt.label, pt.x, padding.top + graphHeight + 10);

    // Círculo no ponto
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = '#7C3AED';
    ctx.lineWidth = 2;
    ctx.stroke();
  });
}

// Inicialização automática do gráfico ao redimensionar a tela
window.addEventListener('resize', renderRevenueChart);

// Expõe a função globalmente
window.renderRevenueChart = renderRevenueChart;
