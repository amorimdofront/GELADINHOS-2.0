import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ReportData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  totalSales: number;
  totalSalesRevenue: number;
  transactions: any[];
  sales: any[];
  products: any[];
  currentMonth: string;
  currentYear: number;
}

export const generateAdvancedReport = async (data: ReportData) => {
  const element = document.createElement('div');
  element.innerHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #f5f7fa;
          color: #1a1a1a;
          line-height: 1.6;
        }

        .report-container {
          max-width: 1200px;
          background: white;
          padding: 40px;
          page-break-after: always;
        }

        .header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 3px solid #0066cc;
          padding-bottom: 20px;
        }

        .header h1 {
          font-size: 32px;
          color: #0066cc;
          margin-bottom: 5px;
          font-weight: 700;
        }

        .header p {
          color: #666;
          font-size: 14px;
          margin: 2px 0;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          margin-top: 15px;
          font-size: 12px;
          color: #555;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 40px;
        }

        .metric-card {
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .metric-card.income {
          border-left-color: #10b981;
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
        }

        .metric-card.expense {
          border-left-color: #ef4444;
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
        }

        .metric-card.balance {
          border-left-color: #0066cc;
          background: linear-gradient(135deg, #f0f7ff 0%, #dbeafe 100%);
        }

        .metric-card.sales {
          border-left-color: #f59e0b;
          background: linear-gradient(135deg, #fffbf0 0%, #fef3c7 100%);
        }

        .metric-label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #555;
        }

        .metric-value {
          font-size: 28px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 5px;
        }

        .metric-subtitle {
          font-size: 11px;
          color: #888;
        }

        .section {
          margin-bottom: 40px;
          page-break-inside: avoid;
        }

        .section-title {
          font-size: 18px;
          font-weight: 700;
          color: #0066cc;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e5e7eb;
          display: flex;
          align-items: center;
        }

        .section-title::before {
          content: '';
          display: inline-block;
          width: 4px;
          height: 24px;
          background: #0066cc;
          margin-right: 12px;
          border-radius: 2px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }

        thead {
          background: #f3f4f6;
          border-top: 2px solid #e5e7eb;
          border-bottom: 2px solid #e5e7eb;
        }

        th {
          padding: 12px;
          text-align: left;
          font-weight: 600;
          font-size: 12px;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        td {
          padding: 12px;
          font-size: 12px;
          color: #555;
          border-bottom: 1px solid #e5e7eb;
        }

        tr:hover {
          background: #fafafa;
        }

        .currency {
          font-weight: 600;
          color: #10b981;
        }

        .currency.negative {
          color: #ef4444;
        }

        .category-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          background: #e5e7eb;
          color: #374151;
        }

        .chart-container {
          margin-top: 20px;
          padding: 20px;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .chart-title {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 15px;
          color: #1a1a1a;
        }

        .bar-chart {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          height: 150px;
          justify-content: space-around;
        }

        .bar {
          flex: 1;
          background: linear-gradient(180deg, #0066cc 0%, #0052a3 100%);
          border-radius: 4px 4px 0 0;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          padding-bottom: 8px;
          color: white;
          font-size: 10px;
          font-weight: 600;
        }

        .bar-label {
          font-size: 10px;
          text-align: center;
          margin-top: 8px;
          color: #555;
        }

        .summary-box {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }

        .summary-box h3 {
          font-size: 14px;
          margin-bottom: 10px;
          opacity: 0.95;
        }

        .summary-box p {
          font-size: 16px;
          font-weight: 700;
        }

        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
          text-align: center;
          color: #888;
          font-size: 11px;
        }

        .top-products {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-top: 15px;
        }

        .product-card {
          background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
          padding: 15px;
          border-radius: 6px;
          border-left: 3px solid #0066cc;
        }

        .product-name {
          font-weight: 600;
          margin-bottom: 8px;
          color: #1a1a1a;
        }

        .product-stat {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          margin: 4px 0;
          color: #555;
        }

        .product-revenue {
          color: #10b981;
          font-weight: 600;
        }

        .analysis-text {
          background: #f0f7ff;
          border-left: 3px solid #0066cc;
          padding: 12px;
          margin: 10px 0;
          font-size: 12px;
          color: #555;
          border-radius: 4px;
        }

        @media print {
          body {
            background: white;
          }
          .report-container {
            box-shadow: none;
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="report-container">
        <!-- HEADER -->
        <div class="header">
          <h1>📊 RELATÓRIO FINANCEIRO DETALHADO</h1>
          <p>Geladinhos Amorim</p>
          <div class="info-row">
            <span>📅 Período: ${data.currentMonth}/${data.currentYear}</span>
            <span>🕐 Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</span>
          </div>
        </div>

        <!-- KPI METRICS -->
        <div class="metrics-grid">
          <div class="metric-card income">
            <div class="metric-label">💰 Total de Receitas</div>
            <div class="metric-value">R$ ${data.totalIncome.toFixed(2)}</div>
            <div class="metric-subtitle">${data.transactions.filter(t => t.type === 'income').length} transações</div>
          </div>

          <div class="metric-card expense">
            <div class="metric-label">💸 Total de Despesas</div>
            <div class="metric-value">R$ ${data.totalExpense.toFixed(2)}</div>
            <div class="metric-subtitle">${data.transactions.filter(t => t.type === 'expense').length} transações</div>
          </div>

          <div class="metric-card balance">
            <div class="metric-label">✅ Saldo Líquido</div>
            <div class="metric-value" style="color: ${data.balance >= 0 ? '#10b981' : '#ef4444'}">
              R$ ${data.balance.toFixed(2)}
            </div>
            <div class="metric-subtitle">
              Margem: ${data.totalIncome > 0 ? ((data.balance / data.totalIncome) * 100).toFixed(2) : '0'}%
            </div>
          </div>

          <div class="metric-card sales">
            <div class="metric-label">🛍️ Unidades Vendidas</div>
            <div class="metric-value">${data.totalSales}</div>
            <div class="metric-subtitle">${data.sales.length} vendas registradas</div>
          </div>
        </div>

        <!-- TOP PRODUCTS SECTION -->
        ${data.sales.length > 0 ? `
          <div class="section">
            <div class="section-title">TOP PRODUTOS - ANÁLISE DE DESEMPENHO</div>
            ${generateTopProductsHTML(data.sales, data.products)}
          </div>
        ` : ''}

        <!-- TRANSACTIONS TABLE -->
        <div class="section">
          <div class="section-title">DETALHAMENTO DE TRANSAÇÕES</div>
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Tipo</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              ${data.transactions.slice(0, 20).map(t => `
                <tr>
                  <td>${new Date(t.date).toLocaleDateString('pt-BR')}</td>
                  <td>${t.description}</td>
                  <td><span class="category-badge">${t.category}</span></td>
                  <td>${t.type === 'income' ? '↑ Receita' : '↓ Despesa'}</td>
                  <td class="currency ${t.type === 'expense' ? 'negative' : ''}">
                    ${t.type === 'income' ? '+' : '-'} R$ ${Number(t.amount).toFixed(2)}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- ANALYSIS SECTION -->
        <div class="section">
          <div class="section-title">ANÁLISE FINANCEIRA</div>
          ${generateFinancialAnalysis(data)}
        </div>

        <!-- FOOTER -->
        <div class="footer">
          <p>📱 Relatório gerado pelo Painel Administrativo Geladinhos Amorim</p>
          <p>Este documento contém informações confidenciais e é de uso exclusivo interno</p>
        </div>
      </div>
    </body>
    </html>
  `;

  element.style.position = 'absolute';
  element.style.left = '-10000px';
  element.style.top = '-10000px';
  element.style.width = '210mm';
  element.style.height = '297mm';
  document.body.appendChild(element);

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    while (heightLeft > 0) {
      pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, imgHeight);
      heightLeft -= pageHeight;
      position -= pageHeight;
      if (heightLeft > 0) pdf.addPage();
    }

    pdf.save(`relatorio_financeiro_${new Date().toISOString().split('T')[0]}.pdf`);
  } finally {
    document.body.removeChild(element);
  }
};

function generateTopProductsHTML(sales: any[], products: any[]): string {
  const salesByProduct = products.map(p => {
    const productSales = sales.filter(s => s.product_id === p.id);
    const totalQty = productSales.reduce((sum, s) => sum + s.quantity, 0);
    const totalRevenue = productSales.reduce((sum, s) => sum + s.total_amount, 0);
    return { product: p, totalQty, totalRevenue };
  })
    .filter(item => item.totalQty > 0)
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 6);

  if (salesByProduct.length === 0) return '';

  return `
    <div class="top-products">
      ${salesByProduct.map((item, i) => `
        <div class="product-card">
          <div class="product-name">#${i + 1} ${item.product.name}</div>
          <div class="product-stat">
            <span>Unidades:</span>
            <strong>${item.totalQty}</strong>
          </div>
          <div class="product-stat">
            <span>Receita:</span>
            <strong class="product-revenue">R$ ${item.totalRevenue.toFixed(2)}</strong>
          </div>
          <div class="product-stat">
            <span>Ticket Médio:</span>
            <strong>R$ ${(item.totalRevenue / item.totalQty).toFixed(2)}</strong>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function generateFinancialAnalysis(data: ReportData): string {
  const incomeByCategory: Record<string, number> = {};
  const expenseByCategory: Record<string, number> = {};

  data.transactions.forEach(t => {
    const amount = Number(t.amount);
    if (t.type === 'income') {
      incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + amount;
    } else {
      expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + amount;
    }
  });

  const topExpenses = Object.entries(expenseByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const profitMargin = data.totalIncome > 0 ? ((data.balance / data.totalIncome) * 100) : 0;

  return `
    <div class="summary-box">
      <h3>📈 INDICADORES PRINCIPAIS</h3>
      <p>Margem de Lucro Líquida: ${profitMargin.toFixed(2)}% | Taxa de Cobertura: ${((data.totalIncome / (data.totalExpense || 1)) * 100).toFixed(2)}%</p>
    </div>

    <div class="section">
      <h3 style="margin-bottom: 10px; color: #374151;">Top 5 Despesas por Categoria</h3>
      <table>
        <thead>
          <tr>
            <th>Categoria</th>
            <th>Valor</th>
            <th>Percentual</th>
          </tr>
        </thead>
        <tbody>
          ${topExpenses.map(([cat, val]) => {
            const percentage = data.totalExpense > 0 ? ((val / data.totalExpense) * 100) : 0;
            return `
              <tr>
                <td>${cat}</td>
                <td class="currency negative">R$ ${val.toFixed(2)}</td>
                <td>${percentage.toFixed(2)}%</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>

    <div class="analysis-text">
      <strong>💡 INSIGHTS:</strong>
      • Seu negócio gerou R$ ${data.totalIncome.toFixed(2)} em receitas neste período
      • Os custos representam ${((data.totalExpense / data.totalIncome) * 100).toFixed(2)}% das suas receitas
      • Cada real gasto gera R$ ${(data.totalIncome / (data.totalExpense || 1)).toFixed(2)} em receita
      • Você vendeu ${data.totalSales} unidades gerando R$ ${data.totalSalesRevenue.toFixed(2)}
    </div>
  `;
}
