document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = document.getElementById('loginUsername').value;
            const pass = document.getElementById('loginPassword').value;
            const errorMsg = document.getElementById('loginError');
            const btn = loginForm.querySelector('.btn-primary');
            const originalContent = btn.innerHTML;

            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Tekshirilmoqda...';
            btn.style.opacity = '0.8';
            btn.style.pointerEvents = 'none';
            errorMsg.style.display = 'none';

            setTimeout(() => {
                if (user === 'User' && pass === 'user1234') {
                    btn.innerHTML = '<i class="fas fa-check-circle"></i> Muvaffaqiyatli!';
                    btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1000);
                } else {
                    btn.innerHTML = originalContent;
                    btn.style.opacity = '1';
                    btn.style.pointerEvents = 'auto';
                    errorMsg.style.display = 'block';
                }
            }, 1000);
        });
    }

    // Medicine search
    const medSearch = document.getElementById('medicineSearch');
    if (medSearch) {
        medSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#medicinesList tr');
            rows.forEach(row => {
                const text = row.innerText.toLowerCase();
                if (text.includes(query)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }

    // Add Med Form
    const addMedForm = document.getElementById('addMedForm');
    if (addMedForm) {
        addMedForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = addMedForm.querySelector('.btn-primary');
            const original = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saqlanmoqda...';
            
            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-check"></i> Saqlandi!';
                btn.style.background = '#10b981';
                setTimeout(() => {
                    document.getElementById('addModal').style.display = 'none';
                    btn.innerHTML = original;
                    btn.style.background = '';
                    addMedForm.reset();
                    alert("Yangi dori muvaffaqiyatli qo'shildi! (Demonstratsiya)");
                }, 800);
            }, 1000);
        });
    }

    // Sales Form
    const saleForm = document.getElementById('saleForm');
    const saleSearch = document.getElementById('saleSearch');
    const saleQty = document.getElementById('saleQty');
    const salePrice = document.getElementById('salePrice');
    const saleTotalDisplay = document.getElementById('saleTotalDisplay');

    // Mock prices
    const prices = {
        "Paracetamol 500mg": 1200,
        "Amoxicillin 500mg": 8500,
        "Ibuprofen 400mg": 2000,
        "Vitamin C 1000mg": 15000,
        "B12 Vitamin": 3500,
        "Enalapril 10mg": 5000,
        "Azithromycin 250mg": 22000,
        "Aspirin 100mg": 1800
    };

    function updateSaleTotal() {
        if (!saleSearch || !saleQty) return;
        const name = saleSearch.value;
        const qty = parseInt(saleQty.value) || 1;
        if (prices[name]) {
            salePrice.value = prices[name];
            const total = prices[name] * qty;
            saleTotalDisplay.innerText = total.toLocaleString() + " so'm";
        } else {
            salePrice.value = '';
            saleTotalDisplay.innerText = "0 so'm";
        }
    }

    if (saleSearch) saleSearch.addEventListener('input', updateSaleTotal);
    if (saleQty) saleQty.addEventListener('input', updateSaleTotal);

    if (saleForm) {
        saleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = saleForm.querySelector('.btn-primary');
            const name = saleSearch.value;
            if (!prices[name]) {
                alert("Iltimos, ro'yxatdan dori tanlang.");
                return;
            }
            const original = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Kutilmoqda...';
            
            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-check"></i> Sotildi!';
                btn.style.background = '#10b981';
                setTimeout(() => {
                    btn.innerHTML = original;
                    btn.style.background = '';
                    saleForm.reset();
                    saleTotalDisplay.innerText = "0 so'm";
                    alert("Sotuv muvaffaqiyatli amalga oshirildi!");
                }, 1000);
            }, 800);
        });
    }
});

// Global functions for inline usage
function filterMeds(cat, btn) {
    document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const rows = document.querySelectorAll('#medicinesList tr');
    rows.forEach(row => {
        if (cat === 'all' || row.getAttribute('data-cat').includes(cat)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}
