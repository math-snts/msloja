// ===== LocalStorage Keys =====
const LS_PRODUCTS = 'inv_products';
const LS_SALES = 'inv_sales';

// ===== State =====
let products = JSON.parse(localStorage.getItem(LS_PRODUCTS) || '[]');
let sales = JSON.parse(localStorage.getItem(LS_SALES) || '[]');

// ===== Elements =====
const tabs = document.querySelectorAll('.tab-btn');
const sections = document.querySelectorAll('.tab');

// Dashboard
const totalSalesEl = document.getElementById('totalSales');
const totalOrdersEl = document.getElementById('totalOrders');
const stockValueEl = document.getElementById('stockValue');
const totalProfitEl = document.getElementById('totalProfit');
const totalPaidEl = document.getElementById('totalPaid');
const totalUnpaidEl = document.getElementById('totalUnpaid');
const dashboardStartDateEl = document.getElementById('dashboardStartDate');
const dashboardEndDateEl = document.getElementById('dashboardEndDate');
const applyDashboardFilterBtn = document.getElementById('applyDashboardFilter');
const clearDashboardFilterBtn = document.getElementById('clearDashboardFilter');


// Products
const productsTableBody = document.querySelector('#productsTable tbody');
const productIdEl = document.getElementById('productId');
const productNameEl = document.getElementById('productName');
const productSKUEl = document.getElementById('productSKU');
const productCostEl = document.getElementById('productCost');
const productPriceEl = document.getElementById('productPrice');
const productStockEl = document.getElementById('productStock');
const saveProductBtn = document.getElementById('saveProduct');

// Sales
const saleProductEl = document.getElementById('saleProduct');
const saleQtyEl = document.getElementById('saleQty');
const saleCustomerEl = document.getElementById('saleCustomer');
const saleOriginEl = document.getElementById('saleOrigin');
const salePaidEl = document.getElementById('salePaid');
const registerSaleBtn = document.getElementById('registerSale');
const salesTableBody = document.querySelector('#salesTable tbody');

// Filtro de datas
const filterStartDateEl = document.getElementById('filterStartDate');
const filterEndDateEl = document.getElementById('filterEndDate');
const applyDateFilterBtn = document.getElementById('applyDateFilter');
const clearDateFilterBtn = document.getElementById('clearDateFilter');

// Settings
const exportDataBtn = document.getElementById('exportData');
const importDataBtn = document.getElementById('importData');
const importFileEl = document.getElementById('importFile');
const resetDataBtn = document.getElementById('resetData');

// ===== Tabs Switching =====
tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    sections.forEach(sec => sec.classList.remove('active'));
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// ===== Utils =====
function calcProfit(sale) {
  const product = products.find(p => p.id === sale.productId);
  if (!product) return 0;
  const custoUnitario = product.cost;
  if (sale.origin === 'Online') {
    const pv = product.price;
    const valorLiquido = (pv * 0.8) - 4;
    return (valorLiquido - custoUnitario) * sale.qty;
  } else {
    return (product.price - custoUnitario) * sale.qty;
  }
}

// ===== Render Functions =====
function renderDashboard(startDate = null, endDate = null) {
  let filteredSales = sales;
  if (startDate) filteredSales = filteredSales.filter(s => new Date(s.date) >= startDate);
  if (endDate) filteredSales = filteredSales.filter(s => new Date(s.date) <= endDate);

  const totalSales = filteredSales.reduce((s, v) => s + v.total, 0);
  totalSalesEl.textContent = `R$ ${totalSales.toFixed(2)}`;
  totalOrdersEl.textContent = filteredSales.length;

  const stockValue = products.reduce((s, p) => s + p.cost * p.stock, 0);
  stockValueEl.textContent = `R$ ${stockValue.toFixed(2)}`;

  const totalProfit = filteredSales.reduce((s, v) => s + calcProfit(v), 0);
  totalProfitEl.textContent = `R$ ${totalProfit.toFixed(2)}`;

  const paidSales = filteredSales.filter(s => s.paid === 'Pago');
  const unpaidSales = filteredSales.filter(s => s.paid !== 'Pago');
  const totalPaid = paidSales.reduce((s, v) => s + v.total, 0);
  const totalUnpaid = unpaidSales.reduce((s, v) => s + v.total, 0);
  totalPaidEl.textContent = `R$ ${totalPaid.toFixed(2)}`;
  totalUnpaidEl.textContent = `R$ ${totalUnpaid.toFixed(2)}`;

  const totalProductsStock = products.reduce((sum, p) => sum + p.stock, 0);
  document.getElementById('totalProductsStock').textContent = totalProductsStock;
}

applyDashboardFilterBtn.addEventListener('click', ()=>{
  const start = dashboardStartDateEl.value ? new Date(dashboardStartDateEl.value) : null;
  const end = dashboardEndDateEl.value ? new Date(dashboardEndDateEl.value) : null;
  renderDashboard(start,end);
});

clearDashboardFilterBtn.addEventListener('click', ()=>{
  dashboardStartDateEl.value='';
  dashboardEndDateEl.value='';
  renderDashboard();
});


function renderProducts() {
  productsTableBody.innerHTML = '';
  products.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.name}</td>
      <td>${p.sku}</td>
      <td>R$ ${p.cost.toFixed(2)}</td>
      <td>R$ ${p.price.toFixed(2)}</td>
      <td>${p.stock}</td>
      <td>
        <button onclick="editProduct('${p.id}')">Editar</button>
        <button onclick="removeProduct('${p.id}')">Excluir</button>
      </td>
    `;
    productsTableBody.appendChild(tr);
  });
  saleProductEl.innerHTML = '';
  products.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = `${p.name} - R$${p.price} (Estoque: ${p.stock})`;
    saleProductEl.appendChild(opt);
  });
}

function renderSales(startDate = null, endDate = null) {
  salesTableBody.innerHTML = '';
  sales.forEach((s) => {
    const saleDate = new Date(s.date);
    if (startDate && saleDate < startDate) return;
    if (endDate && saleDate > endDate) return;
    const lucro = calcProfit(s);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${s.customer}</td>
      <td>${s.productName}</td>
      <td>${s.qty}</td>
      <td>R$ ${s.total.toFixed(2)}</td>
      <td>${s.origin}</td>
      <td>
        <input type="checkbox" ${s.paid === 'Pago' ? 'checked' : ''} onchange="togglePaid('${s.id}', this.checked)">
      </td>
      <td>R$ ${lucro.toFixed(2)}</td>
      <td>${saleDate.toLocaleDateString()}</td>
    `;
    salesTableBody.appendChild(tr);
  });
}

// ===== Product CRUD =====
saveProductBtn.addEventListener('click', () => {
  const id = productIdEl.value || Date.now().toString();
  const name = productNameEl.value.trim();
  const sku = productSKUEl.value.trim();
  const cost = parseFloat(productCostEl.value);
  const price = parseFloat(productPriceEl.value);
  const stock = parseInt(productStockEl.value);
  if (!name || isNaN(cost) || isNaN(price) || isNaN(stock)) return alert('Preencha os campos corretamente');
  const existingIndex = products.findIndex(p => p.id === id);
  if (existingIndex >= 0) {
    products[existingIndex] = { id, name, sku, cost, price, stock };
  } else {
    products.unshift({ id, name, sku, cost, price, stock });
  }
  localStorage.setItem(LS_PRODUCTS, JSON.stringify(products));
  clearProductForm();
  renderProducts(); renderDashboard();
});

window.editProduct = function (id) {
  const p = products.find(p => p.id === id);
  if (!p) return;
  productIdEl.value = p.id;
  productNameEl.value = p.name;
  productSKUEl.value = p.sku;
  productCostEl.value = p.cost;
  productPriceEl.value = p.price;
  productStockEl.value = p.stock;
};

window.removeProduct = function (id) {
  if (!confirm('Remover produto?')) return;
  products = products.filter(p => p.id !== id);
  localStorage.setItem(LS_PRODUCTS, JSON.stringify(products));
  renderProducts(); renderDashboard();
};

function clearProductForm() {
  productIdEl.value = '';
  productNameEl.value = '';
  productSKUEl.value = '';
  productCostEl.value = '';
  productPriceEl.value = '';
  productStockEl.value = '';
}

// ===== Sales =====
registerSaleBtn.addEventListener('click', () => {
  const productId = saleProductEl.value;
  const qty = parseInt(saleQtyEl.value);
  const customer = saleCustomerEl.value.trim() || 'Consumidor';
  const origin = saleOriginEl.value;
  const paid = salePaidEl.value;
  const product = products.find(p => p.id === productId);
  if (!product || qty <= 0) return alert('Selecione um produto e quantidade válida');
  if (product.stock < qty) return alert('Estoque insuficiente');
  const total = product.price * qty;
  product.stock -= qty;
  sales.unshift({
    id: Date.now().toString(),
    productId,
    productName: product.name,
    qty,
    total,
    customer,
    origin,
    paid,
    date: new Date().toISOString()
  });
  localStorage.setItem(LS_PRODUCTS, JSON.stringify(products));
  localStorage.setItem(LS_SALES, JSON.stringify(sales));
  saleQtyEl.value = 1; saleCustomerEl.value = '';
  renderProducts(); renderSales(); renderDashboard();
});

window.togglePaid = function (id, isPaid) {
  const sale = sales.find(s => s.id === id);
  if (!sale) return;
  sale.paid = isPaid ? 'Pago' : 'Não Pago';
  localStorage.setItem(LS_SALES, JSON.stringify(sales));
  renderSales();
  renderDashboard();
};

// ===== Filtro de datas =====
applyDateFilterBtn.addEventListener('click', () => {
  const start = filterStartDateEl.value ? new Date(filterStartDateEl.value) : null;
  const end = filterEndDateEl.value ? new Date(filterEndDateEl.value) : null;
  renderSales(start, end);
});
clearDateFilterBtn.addEventListener('click', () => {
  filterStartDateEl.value = '';
  filterEndDateEl.value = '';
  renderSales();
});

// ===== Settings =====
exportDataBtn.addEventListener('click', () => {
  const data = { products, sales };
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'dados_invSales.json';
  a.click();
  URL.revokeObjectURL(url);
});

importDataBtn.addEventListener('click', () => importFileEl.click());

importFileEl.addEventListener('change', () => {
  const file = importFileEl.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.products && data.sales) {
        products = data.products;
        sales = data.sales;
        localStorage.setItem(LS_PRODUCTS, JSON.stringify(products));
        localStorage.setItem(LS_SALES, JSON.stringify(sales));
        renderProducts(); renderSales(); renderDashboard();
        alert('Dados importados com sucesso');
      }
    } catch (err) {
      alert('Erro ao importar dados');
    }
  };
  reader.readAsText(file);
});

resetDataBtn.addEventListener('click', () => {
  if (confirm('Deseja realmente apagar TODOS os dados?')) {
    products = []; sales = [];
    localStorage.removeItem(LS_PRODUCTS);
    localStorage.removeItem(LS_SALES);
    renderProducts(); renderSales(); renderDashboard();
    alert('Dados apagados');
  }
});

// ===== Inicialização =====
renderProducts();
renderSales();
renderDashboard();
