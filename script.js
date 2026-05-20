/* PharmaCare — localStorage (Static Site uchun, server shart emas) */
const STORE = {
  MED_KEY: 'pharmacare_medicines_v2',
  SALES_KEY: 'pharmacare_sales',
  TARGET: 200
};

const CAT_KEYS = ['antibiotic', 'vitamin', 'painkiller', 'cardiac', 'other'];

const CAT_LABELS = {
  antibiotic: 'Antibiotik',
  vitamin: 'Vitamin',
  painkiller: "Og'riq qoldiruvchi",
  cardiac: 'Yurak dori',
  other: 'Boshqa'
};

const CAT_FROM_UZ = {
  Antibiotik: 'antibiotic',
  Vitamin: 'vitamin',
  "Og'riq qoldiruvchi": 'painkiller',
  'Yurak dori': 'cardiac',
  Yurak: 'cardiac',
  Boshqa: 'other',
  antibiotic: 'antibiotic',
  vitamin: 'vitamin',
  painkiller: 'painkiller',
  cardiac: 'cardiac',
  other: 'other'
};

function normalizeCategory(cat) {
  if (!cat) return 'other';
  const s = String(cat).trim();
  if (CAT_KEYS.includes(s)) return s;
  if (CAT_FROM_UZ[s]) return CAT_FROM_UZ[s];
  const lower = s.toLowerCase();
  if (lower.includes('antibiot')) return 'antibiotic';
  if (lower.includes('vitamin')) return 'vitamin';
  if (lower.includes('og\'riq') || lower.includes('ogriq')) return 'painkiller';
  if (lower.includes('yurak')) return 'cardiac';
  return 'other';
}

const BASE_NAMES = [
  'Paracetamol', 'Ibuprofen', 'Amoxicillin', 'Azithromycin', 'Ciprofloxacin',
  'Metronidazol', 'Vitamin C', 'Vitamin D3', 'Vitamin B12', 'Enalapril',
  'Amlodipin', 'Aspirin', 'Omeprazol', 'Loratadin', 'No-shpa',
  'Ketorol', 'Diclofenac', 'Insulin', 'Metformin', 'Ambroxol'
];
const DOSAGES = ['100mg', '250mg', '400mg', '500mg', '875mg', '10mg', '20mg'];
const FORMS = ['Tabletka', 'Kapsul', 'Sirop', 'Ampula', 'Spray', 'Maz'];
const BRANDS = ['Sanofi', 'Bayer', 'Pfizer', 'GSK', 'Teva', 'Vertex', 'Uzbekpharm'];

function formatMoney(n) {
  return Number(n).toLocaleString('uz-UZ') + " so'm";
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = String(str ?? '');
  return d.innerHTML;
}

function debounce(fn, ms = 250) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

function getStatus(med) {
  if (med.quantity === 0) return { key: 'out', label: 'Tugagan' };
  if (med.quantity < 20) return { key: 'low', label: 'Kam qoldi' };
  return { key: 'ok', label: 'Yetarli' };
}

function randomDate(y1, y2) {
  const y = y1 + Math.floor(Math.random() * (y2 - y1 + 1));
  const m = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0');
  const d = String(1 + Math.floor(Math.random() * 28)).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getCategoryKey(base) {
  const map = {
    Paracetamol: 'painkiller', Ibuprofen: 'painkiller', Ketorol: 'painkiller',
    Diclofenac: 'painkiller', 'No-shpa': 'painkiller',
    Amoxicillin: 'antibiotic', Azithromycin: 'antibiotic', Ciprofloxacin: 'antibiotic',
    Metronidazol: 'antibiotic',
    'Vitamin C': 'vitamin', 'Vitamin D3': 'vitamin', 'Vitamin B12': 'vitamin',
    Enalapril: 'cardiac', Amlodipin: 'cardiac', Aspirin: 'cardiac'
  };
  for (const [k, v] of Object.entries(map)) {
    if (base.startsWith(k) || base === k) return v;
  }
  return ['antibiotic', 'vitamin', 'painkiller', 'cardiac', 'other'][Math.floor(Math.random() * 5)];
}

function generateMedicines(count) {
  const list = [];
  const used = new Set();
  for (let i = 0; i < count; i++) {
    const base = BASE_NAMES[i % BASE_NAMES.length];
    let name = `${base} ${DOSAGES[i % DOSAGES.length]} (${BRANDS[i % BRANDS.length]}) #${Math.floor(i / BASE_NAMES.length) + 1}`;
    if (used.has(name)) name += `-${i}`;
    used.add(name);
    list.push({
      id: i + 1,
      name,
      form: FORMS[i % FORMS.length],
      category: getCategoryKey(base),
      quantity: Math.floor(Math.random() * 500),
      price: 500 + Math.floor(Math.random() * 45000),
      expiry_date: randomDate(2026, 2028)
    });
  }
  return list;
}

const PharmaDB = {
  getMeds() {
    try {
      const raw = localStorage.getItem(STORE.MED_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch { return null; }
  },

  saveMeds(list) {
    localStorage.setItem(STORE.MED_KEY, JSON.stringify(list));
  },

  init() {
    let meds = this.getMeds();
    if (!meds || meds.length < STORE.TARGET) {
      meds = generateMedicines(STORE.TARGET);
    }
    meds = meds.map(m => ({
      ...m,
      category: normalizeCategory(m.category)
    }));
    this.saveMeds(meds);
    if (!localStorage.getItem(STORE.SALES_KEY)) {
      localStorage.setItem(STORE.SALES_KEY, JSON.stringify([]));
    }
    return meds;
  },

  getSales() {
    try {
      return JSON.parse(localStorage.getItem(STORE.SALES_KEY) || '[]');
    } catch { return []; }
  },

  saveSales(list) {
    localStorage.setItem(STORE.SALES_KEY, JSON.stringify(list));
  },

  addMed(data) {
    const meds = this.getMeds() || [];
    const id = meds.length ? Math.max(...meds.map(m => m.id)) + 1 : 1;
    const med = { id, ...data };
    meds.push(med);
    this.saveMeds(meds);
    return med;
  },

  updateMed(id, data) {
    const meds = this.getMeds() || [];
    const i = meds.findIndex(m => m.id === id);
    if (i === -1) return null;
    meds[i] = { ...meds[i], ...data };
    this.saveMeds(meds);
    return meds[i];
  },

  deleteMed(id) {
    const meds = (this.getMeds() || []).filter(m => m.id !== id);
    this.saveMeds(meds);
  },

  getStats() {
    const meds = this.getMeds() || [];
    const sales = this.getSales();
    const today = new Date().toDateString();
    const todaySales = sales.filter(s => new Date(s.sold_at).toDateString() === today);

    let lowStock = 0, outStock = 0;
    meds.forEach(m => {
      const st = getStatus(m);
      if (st.key === 'low') lowStock++;
      if (st.key === 'out') outStock++;
    });

    const month = new Date().getMonth();
    const year = new Date().getFullYear();
    const monthSales = sales.filter(s => {
      const d = new Date(s.sold_at);
      return d.getMonth() === month && d.getFullYear() === year;
    });

    return {
      totalMeds: meds.length,
      todaySales: todaySales.reduce((a, s) => a + s.total_price, 0),
      lowStock,
      outStock,
      monthSales: monthSales.reduce((a, s) => a + s.total_price, 0)
    };
  }
};

// --- Medicines page state ---
let medState = { q: '', category: 'all', page: 1, limit: 50 };

function filterMedicinesList(meds) {
  const q = medState.q.trim().toLowerCase();
  return meds.filter(m => {
    const catKey = normalizeCategory(m.category);
    const catLabel = CAT_LABELS[catKey] || catKey;
    if (medState.category !== 'all' && catKey !== medState.category) {
      return false;
    }
    if (!q) return true;
    return (
      m.name.toLowerCase().includes(q) ||
      catLabel.toLowerCase().includes(q) ||
      m.form.toLowerCase().includes(q)
    );
  });
}

function renderMedicinesTable() {
  const tbody = document.getElementById('medicinesList');
  const pagination = document.getElementById('medPagination');
  const countEl = document.getElementById('medCount');
  if (!tbody) return;

  const allMeds = PharmaDB.getMeds() || [];
  const filtered = filterMedicinesList(allMeds);
  const isSearch = medState.q.trim().length > 0;

  if (countEl) {
    countEl.textContent = isSearch
      ? `${filtered.length} ta topildi (jami ${allMeds.length} ta)`
      : `Jami ${allMeds.length} ta dori`;
  }

  let pageItems;
  let pages = 1;
  if (isSearch) {
    pageItems = filtered;
    medState.page = 1;
  } else {
    pages = Math.max(1, Math.ceil(filtered.length / medState.limit));
    if (medState.page > pages) medState.page = pages;
    const start = (medState.page - 1) * medState.limit;
    pageItems = filtered.slice(start, start + medState.limit);
  }

  if (pageItems.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:2rem;color:var(--text-muted);">Dori topilmadi</td></tr>';
  } else {
    tbody.innerHTML = pageItems.map((m, i) => {
      const st = getStatus(m);
      const num = isSearch ? i + 1 : (medState.page - 1) * medState.limit + i + 1;
      const catKey = normalizeCategory(m.category);
      return `<tr data-cat="${catKey}">
        <td>${num}</td>
        <td><strong>${escapeHtml(m.name)}</strong><br><small>${escapeHtml(m.form)}</small></td>
        <td><span class="cat-badge ${catKey}">${escapeHtml(CAT_LABELS[catKey])}</span></td>
        <td>${m.quantity} dona</td>
        <td>${formatMoney(m.price)}</td>
        <td>${m.expiry_date}</td>
        <td><span class="status-badge ${st.key}">${escapeHtml(st.label)}</span></td>
        <td class="actions">
          <button class="act-btn edit" onclick="openEditModal(${m.id})" title="Tahrirlash"><i class="fas fa-edit"></i></button>
          <button class="act-btn del" onclick="deleteMedicine(${m.id})" title="O'chirish"><i class="fas fa-trash"></i></button>
        </td>
      </tr>`;
    }).join('');
  }

  if (pagination) {
    if (isSearch || pages <= 1) {
      pagination.innerHTML = isSearch
        ? `<span class="search-hint"><i class="fas fa-search"></i> Qidiruv: barcha ${filtered.length} ta natija</span>`
        : `<span>Jami: ${filtered.length} ta</span>`;
    } else {
      let html = `<span>Sahifa ${medState.page} / ${pages}</span><div class="pagination-btns">`;
      html += `<button class="page-btn" ${medState.page <= 1 ? 'disabled' : ''} onclick="goMedPage(${medState.page - 1})"><i class="fas fa-chevron-left"></i></button>`;
      const s = Math.max(1, medState.page - 2);
      const e = Math.min(pages, medState.page + 2);
      for (let p = s; p <= e; p++) {
        html += `<button class="page-btn ${p === medState.page ? 'active' : ''}" onclick="goMedPage(${p})">${p}</button>`;
      }
      html += `<button class="page-btn" ${medState.page >= pages ? 'disabled' : ''} onclick="goMedPage(${medState.page + 1})"><i class="fas fa-chevron-right"></i></button></div>`;
      pagination.innerHTML = html;
    }
  }
}

function goMedPage(p) {
  medState.page = p;
  renderMedicinesTable();
  document.querySelector('.medicines-table-wrap')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function filterMeds(cat, btn) {
  medState.category = cat;
  medState.page = 1;
  document.querySelectorAll('.filter-tab').forEach(b => {
    b.classList.toggle('active', b === btn || b.dataset.cat === cat);
  });
  renderMedicinesTable();
}

function setupCategoryFilters() {
  const wrap = document.getElementById('categoryFilters');
  if (!wrap) return;
  wrap.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-tab');
    if (!btn) return;
    filterMeds(btn.dataset.cat || 'all', btn);
  });
}

function openEditModal(id) {
  const m = (PharmaDB.getMeds() || []).find(x => x.id === id);
  if (!m) return;
  document.getElementById('editMedId').value = m.id;
  document.getElementById('editMedName').value = m.name;
  document.getElementById('editMedFormType').value = m.form;
  document.getElementById('editMedCategory').value = CAT_LABELS[normalizeCategory(m.category)] || 'Boshqa';
  document.getElementById('editMedQty').value = m.quantity;
  document.getElementById('editMedPrice').value = m.price;
  document.getElementById('editMedExpiry').value = m.expiry_date;
  document.getElementById('editModal').style.display = 'flex';
}

function deleteMedicine(id) {
  if (!confirm("Bu dorini o'chirmoqchimisiz?")) return;
  PharmaDB.deleteMed(id);
  renderMedicinesTable();
  loadDashboard();
}

function loadDashboard() {
  const s = PharmaDB.getStats();
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('statTotalMeds', s.totalMeds + ' ta');
  set('statTodaySales', formatMoney(s.todaySales));
  set('statLowStockHighlight', s.lowStock + ' ta');
  set('statLowStock', s.lowStock + ' ta mahsulot');
  set('statOutStock', s.outStock + ' ta');
  set('statMonthSales', formatMoney(s.monthSales));
  const hero = document.getElementById('heroMedCount');
  if (hero) hero.textContent = s.totalMeds + '+';
}

// --- Sales autocomplete ---
let selectedSaleMed = null;

function setupSaleAutocomplete() {
  const input = document.getElementById('saleSearch');
  const dropdown = document.getElementById('saleDropdown');
  if (!input || !dropdown) return;

  const search = debounce(() => {
    const q = input.value.trim().toLowerCase();
    selectedSaleMed = null;
    updateSaleTotal();
    if (q.length < 1) { dropdown.style.display = 'none'; return; }

    const items = (PharmaDB.getMeds() || [])
      .filter(m => m.quantity > 0 && m.name.toLowerCase().includes(q))
      .slice(0, 15);

    if (!items.length) {
      dropdown.innerHTML = '<div class="autocomplete-empty">Dori topilmadi</div>';
    } else {
      dropdown.innerHTML = items.map(m => `
        <div class="autocomplete-item" data-id="${m.id}">
          <strong>${escapeHtml(m.name)}</strong>
          <span>${formatMoney(m.price)} · ${m.quantity} dona</span>
        </div>
      `).join('');
      dropdown.querySelectorAll('.autocomplete-item').forEach(el => {
        el.addEventListener('click', () => {
          const m = items.find(x => x.id === parseInt(el.dataset.id));
          if (!m) return;
          selectedSaleMed = m;
          input.value = m.name;
          dropdown.style.display = 'none';
          updateSaleTotal();
        });
      });
    }
    dropdown.style.display = 'block';
  }, 200);

  input.addEventListener('input', search);
  input.addEventListener('focus', () => { if (input.value.trim()) search(); });
  document.addEventListener('click', e => {
    if (!e.target.closest('.sale-search-wrap')) dropdown.style.display = 'none';
  });
}

function updateSaleTotal() {
  const saleQty = document.getElementById('saleQty');
  const salePrice = document.getElementById('salePrice');
  const saleTotalDisplay = document.getElementById('saleTotalDisplay');
  if (!saleQty || !saleTotalDisplay) return;
  const qty = parseInt(saleQty.value) || 1;
  if (selectedSaleMed) {
    if (salePrice) salePrice.value = selectedSaleMed.price;
    saleTotalDisplay.textContent = formatMoney(selectedSaleMed.price * qty);
  } else {
    if (salePrice) salePrice.value = '';
    saleTotalDisplay.textContent = "0 so'm";
  }
}

function loadSales() {
  const list = document.getElementById('salesList');
  const totalEl = document.getElementById('todayTotal');
  if (!list) return;

  const sales = PharmaDB.getSales();
  const today = new Date().toDateString();
  const todayList = sales.filter(s => new Date(s.sold_at).toDateString() === today);
  const todayTotal = todayList.reduce((a, s) => a + s.total_price, 0);

  if (totalEl) totalEl.textContent = formatMoney(todayTotal);

  const payLabels = { cash: 'Naqd', card: 'Karta', transfer: "O'tkazma" };
  if (!todayList.length) {
    list.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:2rem;">Bugun hali sotuv yo\'q</p>';
    return;
  }

  list.innerHTML = todayList.slice().reverse().map(s => {
    const time = new Date(s.sold_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    return `<div class="sale-receipt glass-panel">
      <div class="receipt-header">
        <div><strong>${escapeHtml(s.medicine_name)}</strong><span> x ${s.quantity} dona</span></div>
        <div class="receipt-time">${time}</div>
      </div>
      <div class="receipt-footer">
        <span><i class="fas fa-user"></i> ${escapeHtml(s.customer)}</span>
        <span class="receipt-badge ${s.pay_method}">${payLabels[s.pay_method] || s.pay_method}</span>
        <strong style="color:#059669;">${formatMoney(s.total_price)}</strong>
      </div>
    </div>`;
  }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  PharmaDB.init();

  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const icon = mobileMenuBtn.querySelector('i');
      icon.classList.toggle('fa-bars');
      icon.classList.toggle('fa-times');
    });
  }

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = document.getElementById('loginUsername').value;
      const pass = document.getElementById('loginPassword').value;
      const errorMsg = document.getElementById('loginError');
      if (user === 'User' && pass === 'user1234') {
        sessionStorage.setItem('loggedIn', '1');
        window.location.href = 'index.html';
      } else if (errorMsg) {
        errorMsg.style.display = 'block';
      }
    });
  }

  const medSearch = document.getElementById('medicineSearch');
  const searchClear = document.getElementById('searchClear');
  if (medSearch) {
    medSearch.addEventListener('input', debounce(e => {
      medState.q = e.target.value;
      medState.page = 1;
      renderMedicinesTable();
    }, 200));
    if (searchClear) {
      searchClear.addEventListener('click', () => {
        medSearch.value = '';
        medState.q = '';
        medState.page = 1;
        renderMedicinesTable();
        medSearch.focus();
      });
    }
    setupCategoryFilters();
    renderMedicinesTable();
  }

  const addMedForm = document.getElementById('addMedForm');
  if (addMedForm) {
    addMedForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('addMedName').value.trim();
      const category = CAT_FROM_UZ[document.getElementById('addMedCategory').value] || 'other';
      PharmaDB.addMed({
        name,
        form: document.getElementById('addMedFormType').value,
        category,
        quantity: parseInt(document.getElementById('addMedQty').value) || 0,
        price: parseInt(document.getElementById('addMedPrice').value) || 0,
        expiry_date: document.getElementById('addMedExpiry').value
      });
      document.getElementById('addModal').style.display = 'none';
      addMedForm.reset();
      medState.page = 1;
      renderMedicinesTable();
      loadDashboard();
    });
  }

  const editMedForm = document.getElementById('editMedForm');
  if (editMedForm) {
    editMedForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = parseInt(document.getElementById('editMedId').value);
      PharmaDB.updateMed(id, {
        name: document.getElementById('editMedName').value.trim(),
        form: document.getElementById('editMedFormType').value,
        category: CAT_FROM_UZ[document.getElementById('editMedCategory').value] || 'other',
        quantity: parseInt(document.getElementById('editMedQty').value) || 0,
        price: parseInt(document.getElementById('editMedPrice').value) || 0,
        expiry_date: document.getElementById('editMedExpiry').value
      });
      document.getElementById('editModal').style.display = 'none';
      renderMedicinesTable();
      loadDashboard();
    });
  }

  setupSaleAutocomplete();
  const saleQty = document.getElementById('saleQty');
  if (saleQty) saleQty.addEventListener('input', updateSaleTotal);

  const saleForm = document.getElementById('saleForm');
  if (saleForm) {
    loadSales();
    saleForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!selectedSaleMed) {
        alert("Ro'yxatdan dori tanlang.");
        return;
      }
      const qty = parseInt(document.getElementById('saleQty').value) || 1;
      if (qty > selectedSaleMed.quantity) {
        alert(`Omborda faqat ${selectedSaleMed.quantity} dona qolgan`);
        return;
      }
      const total = selectedSaleMed.price * qty;
      const sales = PharmaDB.getSales();
      sales.push({
        id: Date.now(),
        medicine_id: selectedSaleMed.id,
        medicine_name: selectedSaleMed.name,
        quantity: qty,
        unit_price: selectedSaleMed.price,
        total_price: total,
        customer: document.getElementById('saleCustomer').value.trim() || "Noma'lum",
        pay_method: document.getElementById('payMethod').value,
        sold_at: new Date().toISOString()
      });
      PharmaDB.saveSales(sales);
      PharmaDB.updateMed(selectedSaleMed.id, { quantity: selectedSaleMed.quantity - qty });

      saleForm.reset();
      selectedSaleMed = null;
      document.getElementById('saleTotalDisplay').textContent = "0 so'm";
      document.getElementById('salePrice').value = '';
      loadSales();
      loadDashboard();
    });
  }

  if (document.getElementById('statTotalMeds')) loadDashboard();

  window.filterMeds = filterMeds;
  window.goMedPage = goMedPage;
  window.openEditModal = openEditModal;
  window.deleteMedicine = deleteMedicine;
});
