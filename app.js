/* ==========================================================================
   LifePulse - Online Blood Bank System
   Main Application Logic & Dynamic UI Engine
   ========================================================================== */

class BloodBankApp {
    constructor() {
        this.STORAGE_KEY = 'lifepulse_blood_bank_state_v1';
        this.state = {
            currentPage: 'home',
            currentRole: 'donor', // 'donor', 'hospital', 'admin'
            currentTheme: 'dark',
            selectedCompatType: 'O-',
            adminActiveTab: 'inventory',
            donorFilter: { query: '', bloodGroup: '', status: '' },
            inventoryFilter: { query: '', component: '' },
            quizAnswers: {},
            ...this.loadState()
        };
    }

    // ----------------------------------------------------------------------
    // State Management & Storage
    // ----------------------------------------------------------------------
    loadState() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.warn('LocalStorage read error, falling back to defaults:', e);
        }
        return {
            bloodInventory: { ...INITIAL_DATA.bloodInventory },
            donors: [...INITIAL_DATA.donors],
            emergencyRequests: [...INITIAL_DATA.emergencyRequests],
            camps: [...INITIAL_DATA.camps]
        };
    }

    saveState() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
                bloodInventory: this.state.bloodInventory,
                donors: this.state.donors,
                emergencyRequests: this.state.emergencyRequests,
                camps: this.state.camps,
                currentRole: this.state.currentRole,
                currentTheme: this.state.currentTheme
            }));
        } catch (e) {
            console.error('State save error:', e);
        }
    }

    resetSystemData() {
        if (confirm('Are you sure you want to reset all blood bank inventory, donors, and requests to default demo data?')) {
            localStorage.removeItem(this.STORAGE_KEY);
            this.state.bloodInventory = { ...INITIAL_DATA.bloodInventory };
            this.state.donors = [...INITIAL_DATA.donors];
            this.state.emergencyRequests = [...INITIAL_DATA.emergencyRequests];
            this.state.camps = [...INITIAL_DATA.camps];
            this.saveState();
            this.showToast('System data successfully reset to defaults.', 'info');
            this.renderCurrentPage();
        }
    }

    // ----------------------------------------------------------------------
    // Initialization & Navigation
    // ----------------------------------------------------------------------
    init() {
        document.documentElement.setAttribute('data-theme', this.state.currentTheme);
        document.getElementById('roleSelect').value = this.state.currentRole;
        this.updateThemeIcon();
        this.renderCurrentPage();
    }

    navigateTo(pageId) {
        this.state.currentPage = pageId;
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Update active nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.dataset.page === pageId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Hide mobile nav if open
        const navMenu = document.getElementById('navMenu');
        if (navMenu) navMenu.classList.remove('active');

        this.renderCurrentPage();
    }

    switchRole(role) {
        this.state.currentRole = role;
        this.saveState();
        this.showToast(`Switched workspace role to: ${role.toUpperCase()}`, 'info');

        if (role === 'admin' && this.state.currentPage !== 'admin') {
            this.navigateTo('admin');
        } else {
            this.renderCurrentPage();
        }
    }

    toggleTheme() {
        this.state.currentTheme = this.state.currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', this.state.currentTheme);
        this.updateThemeIcon();
        this.saveState();
    }

    updateThemeIcon() {
        const icon = document.querySelector('#themeToggleBtn i');
        if (icon) {
            icon.className = this.state.currentTheme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        }
    }

    toggleMobileNav() {
        const navMenu = document.getElementById('navMenu');
        if (navMenu) navMenu.classList.toggle('active');
    }

    // ----------------------------------------------------------------------
    // Toast Notification Engine
    // ----------------------------------------------------------------------
    showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let iconClass = 'fa-check-circle';
        if (type === 'error') iconClass = 'fa-exclamation-circle';
        if (type === 'warning') iconClass = 'fa-triangle-exclamation';
        if (type === 'info') iconClass = 'fa-info-circle';

        toast.innerHTML = `
            <i class="fa-solid ${iconClass}"></i>
            <span>${message}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(50px)';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // ----------------------------------------------------------------------
    // Modal Helpers
    // ----------------------------------------------------------------------
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // ----------------------------------------------------------------------
    // Page Rendering Router
    // ----------------------------------------------------------------------
    renderCurrentPage() {
        const contentArea = document.getElementById('appContent');
        if (!contentArea) return;

        switch (this.state.currentPage) {
            case 'inventory':
                contentArea.innerHTML = this.renderInventoryPage();
                break;
            case 'donors':
                contentArea.innerHTML = this.renderDonorsPage();
                break;
            case 'compatibility':
                contentArea.innerHTML = this.renderCompatibilityPage();
                break;
            case 'camps':
                contentArea.innerHTML = this.renderCampsPage();
                break;
            case 'admin':
                contentArea.innerHTML = this.renderAdminPage();
                break;
            case 'home':
            default:
                contentArea.innerHTML = this.renderHomePage();
                break;
        }
    }

    // ----------------------------------------------------------------------
    // Page 1: Home Page
    // ----------------------------------------------------------------------
    renderHomePage() {
        // Calculate dynamic total units
        const totalUnits = Object.values(this.state.bloodInventory).reduce((acc, item) => acc + item.units, 0);
        const totalDonors = this.state.donors.length;
        const totalRequests = this.state.emergencyRequests.length;
        const totalCamps = this.state.camps.length;

        // Pending emergency requests
        const pendingReqs = this.state.emergencyRequests.filter(r => r.status === 'PENDING' || r.status === 'APPROVED');

        return `
            <!-- Hero Banner -->
            <section class="hero-banner">
                <div class="container hero-grid">
                    <div class="hero-text-col">
                        <div class="hero-tagline">
                            <i class="fa-solid fa-shield-heart"></i> Emergency Blood & Plasma Response Platform
                        </div>
                        <h1 class="hero-title">
                            Connecting <span class="text-gradient">Donors & Hospitals</span> in Real-Time
                        </h1>
                        <p class="hero-desc">
                            Digitalizing regional blood banking. Track live blood stock units, submit emergency requisitions, locate compatible donors, and save precious lives instantly.
                        </p>
                        <div class="hero-buttons">
                            <button class="btn btn-emergency btn-lg" onclick="app.openModal('emergencyModal')">
                                <i class="fa-solid fa-truck-medical"></i> Emergency Blood Request
                            </button>
                            <button class="btn btn-primary btn-lg" onclick="app.openModal('donorRegModal')">
                                <i class="fa-solid fa-hand-holding-hand"></i> Register as Blood Donor
                            </button>
                            <button class="btn btn-secondary btn-lg" onclick="app.navigateTo('compatibility')">
                                <i class="fa-solid fa-chart-pie"></i> Blood Compatibility Chart
                            </button>
                        </div>
                    </div>

                    <!-- Quick Donor & Stock Search Card -->
                    <div class="hero-search-card">
                        <div class="search-card-header">
                            <i class="fa-solid fa-magnifying-glass-location"></i>
                            <h3>Quick Blood Search</h3>
                        </div>
                        <form onsubmit="app.handleQuickSearch(event)">
                            <div class="form-group" style="margin-bottom: 1rem;">
                                <label>Required Blood Type</label>
                                <select id="qsBloodGroup" required>
                                    <option value="">Select Blood Group</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                </select>
                            </div>
                            <div class="form-group" style="margin-bottom: 1.2rem;">
                                <label>City / Location</label>
                                <input type="text" id="qsCity" placeholder="e.g. Central City or All Cities">
                            </div>
                            <button type="submit" class="btn btn-primary" style="width: 100%;">
                                <i class="fa-solid fa-search"></i> Check Stock & Donors Nearby
                            </button>
                        </form>
                    </div>
                </div>

                <!-- Stats Grid -->
                <div class="container">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fa-solid fa-vials"></i></div>
                            <div>
                                <div class="stat-val">${totalUnits}</div>
                                <div class="stat-lbl">Units Available</div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fa-solid fa-users"></i></div>
                            <div>
                                <div class="stat-val">${totalDonors}</div>
                                <div class="stat-lbl">Registered Donors</div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fa-solid fa-hospital"></i></div>
                            <div>
                                <div class="stat-val">${totalRequests}</div>
                                <div class="stat-lbl">Active Requisitions</div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fa-solid fa-calendar-check"></i></div>
                            <div>
                                <div class="stat-val">${totalCamps}</div>
                                <div class="stat-lbl">Active Donation Camps</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Active Emergency Requests Section -->
            <section class="page-section">
                <div class="container">
                    <div class="section-header">
                        <span class="section-subtitle">Live Emergency Desk</span>
                        <h2 class="section-title">Active Hospital Requisitions</h2>
                        <p class="section-desc">Urgent requests awaiting fulfillment or compatible donor matches.</p>
                    </div>

                    <div class="requests-list">
                        ${pendingReqs.length === 0 ? `
                            <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                                <i class="fa-solid fa-circle-check" style="font-size: 2.5rem; color: var(--accent-emerald); margin-bottom: 1rem;"></i>
                                <p>No active critical blood requisitions at this moment.</p>
                            </div>
                        ` : pendingReqs.map(req => `
                            <div class="request-item-card">
                                <div class="req-blood-badge">
                                    ${req.bloodGroup}
                                    <span>${req.units} Units</span>
                                </div>
                                <div class="req-main-info">
                                    <h4>Patient: ${req.patientName}</h4>
                                    <div class="req-hospital"><i class="fa-solid fa-hospital"></i> ${req.hospital} (${req.city})</div>
                                    <div class="req-meta-pills">
                                        <span><i class="fa-solid fa-vial"></i> ${req.component}</span>
                                        <span><i class="fa-solid fa-clock"></i> ${req.requestDate}</span>
                                        <span><i class="fa-solid fa-phone"></i> ${req.contact}</span>
                                    </div>
                                </div>
                                <div>
                                    <span class="badge badge-${req.urgency === 'CRITICAL' ? 'critical' : req.urgency === 'URGENT' ? 'urgent' : 'info'}" style="margin-bottom: 0.5rem; display: inline-block;">
                                        <i class="fa-solid fa-triangle-exclamation"></i> ${req.urgency}
                                    </span>
                                    <div>
                                        <button class="btn btn-sm btn-outline" onclick="app.fulfillRequestModal('${req.id}')">
                                            <i class="fa-solid fa-check"></i> Fulfill Request
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </section>
        `;
    }

    // ----------------------------------------------------------------------
    // Page 2: Inventory Stock Page
    // ----------------------------------------------------------------------
    renderInventoryPage() {
        const inventory = this.state.bloodInventory;
        const groups = Object.keys(inventory);

        return `
            <section class="page-section">
                <div class="container">
                    <div class="section-header">
                        <span class="section-subtitle">Real-Time Blood Storage</span>
                        <h2 class="section-title">Blood Bank Stock & Shelf-Life Inventory</h2>
                        <p class="section-desc">Live status of blood bags, plasma, and platelets across regional storage units.</p>
                    </div>

                    ${this.state.currentRole === 'admin' || this.state.currentRole === 'hospital' ? `
                        <div style="margin-bottom: 2rem; text-align: right;">
                            <button class="btn btn-primary" onclick="app.openAddStockModal()">
                                <i class="fa-solid fa-plus-circle"></i> Deposit New Blood Units
                            </button>
                        </div>
                    ` : ''}

                    <div class="inventory-grid">
                        ${groups.map(bg => {
                            const data = inventory[bg];
                            const pct = Math.min(100, Math.round((data.units / data.maxCapacity) * 100));
                            const isLow = data.units < 30;

                            return `
                                <div class="stock-card">
                                    <div class="stock-card-top">
                                        <div class="blood-type-badge">${bg}</div>
                                        ${isLow ? `
                                            <span class="badge badge-critical"><i class="fa-solid fa-triangle-exclamation"></i> LOW STOCK</span>
                                        ` : `
                                            <span class="badge badge-success"><i class="fa-solid fa-check"></i> AVAILABLE</span>
                                        `}
                                    </div>

                                    <!-- Visual Vial Gauge -->
                                    <div class="vial-container">
                                        <div class="vial-liquid" style="height: ${pct}%;"></div>
                                        <div class="vial-percent">${pct}%</div>
                                    </div>

                                    <div class="stock-details">
                                        <div class="stock-amount">${data.units} <span class="stock-unit-label">Bags / Units</span></div>
                                        <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">Max Capacity: ${data.maxCapacity} Units</div>
                                    </div>

                                    <div class="component-breakdown">
                                        <span>RBC: <strong>${data.prbc}</strong></span>
                                        <span>Plasma: <strong>${data.ffp}</strong></span>
                                        <span>Platelets: <strong>${data.sdp}</strong></span>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </section>
        `;
    }

    // ----------------------------------------------------------------------
    // Page 3: Donors Directory & Eligibility Checker
    // ----------------------------------------------------------------------
    renderDonorsPage() {
        const query = this.state.donorFilter.query.toLowerCase();
        const bloodGroup = this.state.donorFilter.bloodGroup;

        const filteredDonors = this.state.donors.filter(d => {
            const matchesQuery = d.name.toLowerCase().includes(query) || d.city.toLowerCase().includes(query);
            const matchesGroup = !bloodGroup || d.bloodGroup === bloodGroup;
            return matchesQuery && matchesGroup;
        });

        return `
            <section class="page-section">
                <div class="container">
                    <div class="section-header">
                        <span class="section-subtitle">Verified Life Savers</span>
                        <h2 class="section-title">Regional Donors Directory</h2>
                        <p class="section-desc">Search registered donors, check donation eligibility, or register your profile.</p>
                    </div>

                    <!-- Eligibility & Action Header -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2.5rem;">
                        <div style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 1.5rem; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: space-between;">
                            <div>
                                <h3 style="font-family: var(--font-heading); margin-bottom: 0.4rem;"><i class="fa-solid fa-clipboard-check" style="color: var(--accent-emerald);"></i> Donor Eligibility Quiz</h3>
                                <p style="font-size: 0.88rem; color: var(--text-secondary);">Answer 5 quick health questions to verify if you can donate blood today.</p>
                            </div>
                            <button class="btn btn-secondary" onclick="app.startEligibilityQuiz()">Take Screener</button>
                        </div>
                        <div style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 1.5rem; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: space-between;">
                            <div>
                                <h3 style="font-family: var(--font-heading); margin-bottom: 0.4rem;"><i class="fa-solid fa-user-plus" style="color: var(--brand-red-light);"></i> Join Donor Community</h3>
                                <p style="font-size: 0.88rem; color: var(--text-secondary);">Receive instant SMS alerts when blood matching your type is needed.</p>
                            </div>
                            <button class="btn btn-primary" onclick="app.openModal('donorRegModal')">Register Now</button>
                        </div>
                    </div>

                    <!-- Filter Bar -->
                    <div class="filter-bar">
                        <div class="search-input-wrap">
                            <i class="fa-solid fa-search"></i>
                            <input type="text" placeholder="Search donors by name or city..." value="${this.state.donorFilter.query}" oninput="app.updateDonorSearch(this.value)">
                        </div>
                        <div class="filter-selects">
                            <select onchange="app.updateDonorGroupFilter(this.value)">
                                <option value="">All Blood Groups</option>
                                <option value="A+" ${bloodGroup === 'A+' ? 'selected' : ''}>A+</option>
                                <option value="A-" ${bloodGroup === 'A-' ? 'selected' : ''}>A-</option>
                                <option value="B+" ${bloodGroup === 'B+' ? 'selected' : ''}>B+</option>
                                <option value="B-" ${bloodGroup === 'B-' ? 'selected' : ''}>B-</option>
                                <option value="AB+" ${bloodGroup === 'AB+' ? 'selected' : ''}>AB+</option>
                                <option value="AB-" ${bloodGroup === 'AB-' ? 'selected' : ''}>AB-</option>
                                <option value="O+" ${bloodGroup === 'O+' ? 'selected' : ''}>O+</option>
                                <option value="O-" ${bloodGroup === 'O-' ? 'selected' : ''}>O-</option>
                            </select>
                        </div>
                    </div>

                    <!-- Donors Cards Grid -->
                    <div class="donor-cards-grid">
                        ${filteredDonors.length === 0 ? `
                            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);">
                                <i class="fa-solid fa-user-slash" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                                <p>No matching donors found for the selected filters.</p>
                            </div>
                        ` : filteredDonors.map(donor => `
                            <div class="donor-card">
                                <div>
                                    <div class="donor-card-header">
                                        <div class="donor-avatar-wrap">
                                            <div class="donor-avatar">${donor.bloodGroup}</div>
                                            <div class="donor-info">
                                                <h4>${donor.name} ${donor.verified ? '<i class="fa-solid fa-certificate" style="color: var(--accent-teal);" title="Verified Donor"></i>' : ''}</h4>
                                                <span><i class="fa-solid fa-location-dot"></i> ${donor.city}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="donor-meta-list">
                                        <div><i class="fa-solid fa-envelope"></i> ${donor.email}</div>
                                        <div><i class="fa-solid fa-phone"></i> ${donor.phone}</div>
                                        <div><i class="fa-solid fa-clock-rotate-left"></i> Last Donated: <strong>${donor.lastDonationDate || 'First Time'}</strong></div>
                                        <div><i class="fa-solid fa-award"></i> Total Donations: <strong>${donor.totalDonations} Times</strong></div>
                                    </div>
                                </div>

                                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                                    <span class="badge badge-${donor.status === 'AVAILABLE' ? 'success' : 'urgent'}">
                                        ${donor.status === 'AVAILABLE' ? 'ELIGIBLE TO DONATE' : 'COOLING PERIOD'}
                                    </span>
                                    <button class="btn btn-sm btn-outline" onclick="app.showDonorCard('${donor.id}')">
                                        <i class="fa-solid fa-id-card"></i> View Pass
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </section>
        `;
    }

    // ----------------------------------------------------------------------
    // Page 4: Interactive Compatibility Matrix Page
    // ----------------------------------------------------------------------
    renderCompatibilityPage() {
        const selected = this.state.selectedCompatType;
        const info = INITIAL_DATA.compatibilityMap[selected];
        const allTypes = Object.keys(INITIAL_DATA.compatibilityMap);

        return `
            <section class="page-section">
                <div class="container">
                    <div class="section-header">
                        <span class="section-subtitle">Medical Transfusion Guide</span>
                        <h2 class="section-title">Blood Compatibility Cross-Match Matrix</h2>
                        <p class="section-desc">Select a blood group to inspect compatible donor and recipient rules.</p>
                    </div>

                    <div class="compatibility-container">
                        <!-- Blood Group Type Selector -->
                        <div class="compat-selector-grid">
                            ${allTypes.map(bg => `
                                <button class="compat-type-btn ${bg === selected ? 'active' : ''}" onclick="app.selectCompatType('${bg}')">
                                    ${bg}
                                </button>
                            `).join('')}
                        </div>

                        <!-- Cross-Match Results -->
                        <div class="compat-results-grid">
                            <!-- Give To -->
                            <div class="compat-card">
                                <h3><i class="fa-solid fa-arrow-up-from-bracket" style="color: var(--accent-emerald);"></i> Can DONATE Blood To:</h3>
                                <div class="compat-types-list">
                                    ${info.give.map(t => `<div class="compat-pill">${t}</div>`).join('')}
                                </div>
                            </div>

                            <!-- Receive From -->
                            <div class="compat-card">
                                <h3><i class="fa-solid fa-arrow-down-to-bracket" style="color: var(--brand-red-light);"></i> Can RECEIVE Blood From:</h3>
                                <div class="compat-types-list">
                                    ${info.receive.map(t => `<div class="compat-pill">${t}</div>`).join('')}
                                </div>
                            </div>
                        </div>

                        <!-- Special Medical Facts Callout -->
                        <div style="margin-top: 2rem; padding: 1.5rem; background: var(--bg-input); border-radius: var(--radius-md); border-left: 4px solid var(--brand-red);">
                            <h4 style="font-family: var(--font-heading); margin-bottom: 0.4rem; color: var(--text-primary);">
                                <i class="fa-solid fa-circle-info" style="color: var(--brand-red-light);"></i> Clinical Note for Blood Group ${selected}:
                            </h4>
                            <p style="font-size: 0.95rem; color: var(--text-secondary);">${info.note}</p>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    // ----------------------------------------------------------------------
    // Page 5: Blood Donation Camps Page
    // ----------------------------------------------------------------------
    renderCampsPage() {
        return `
            <section class="page-section">
                <div class="container">
                    <div class="section-header">
                        <span class="section-subtitle">Community Drives</span>
                        <h2 class="section-title">Upcoming Blood Donation Camps</h2>
                        <p class="section-desc">Schedule a donation slot at nearby organized blood drives.</p>
                    </div>

                    ${this.state.currentRole === 'admin' ? `
                        <div style="margin-bottom: 2rem; text-align: right;">
                            <button class="btn btn-primary" onclick="app.openNewCampModal()">
                                <i class="fa-solid fa-plus-circle"></i> Organize New Blood Camp
                            </button>
                        </div>
                    ` : ''}

                    <div class="camps-grid">
                        ${this.state.camps.map(camp => {
                            const pct = Math.min(100, Math.round((camp.registeredDonors / camp.targetUnits) * 100));

                            return `
                                <div class="camp-card">
                                    <div class="camp-card-header">
                                        <div class="camp-date-badge">
                                            <i class="fa-solid fa-calendar-days"></i> ${camp.date}
                                        </div>
                                        <h3 class="camp-title">${camp.title}</h3>
                                    </div>
                                    <div class="camp-card-body">
                                        <div><i class="fa-solid fa-clock"></i> ${camp.time}</div>
                                        <div><i class="fa-solid fa-location-dot"></i> ${camp.venue}, ${camp.city}</div>
                                        <div><i class="fa-solid fa-hospital-user"></i> Organized by: <strong>${camp.organizer}</strong></div>

                                        <div class="progress-bar-wrap">
                                            <div class="progress-info">
                                                <span>Slots Booked</span>
                                                <span><strong>${camp.registeredDonors}</strong> / ${camp.targetUnits} Units Target</span>
                                            </div>
                                            <div class="progress-bar">
                                                <div class="progress-fill" style="width: ${pct}%;"></div>
                                            </div>
                                        </div>

                                        <button class="btn btn-primary" style="margin-top: 1rem; width: 100%;" onclick="app.bookCampSlot('${camp.id}')">
                                            <i class="fa-solid fa-calendar-check"></i> Book Donation Slot
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </section>
        `;
    }

    // ----------------------------------------------------------------------
    // Page 6: Admin & Hospital Control Dashboard
    // ----------------------------------------------------------------------
    renderAdminPage() {
        const activeTab = this.state.adminActiveTab;

        return `
            <section class="page-section">
                <div class="container admin-dashboard">
                    <div class="admin-header-bar">
                        <div class="admin-title-wrap">
                            <h2><i class="fa-solid fa-hospital-user" style="color: var(--brand-red-light);"></i> Hospital & Admin Operations Center</h2>
                            <p>Manage blood stocks, process requisitions, dispatch slips, and donor SMS broadcasts.</p>
                        </div>
                        <div class="admin-tab-nav">
                            <button class="tab-btn ${activeTab === 'inventory' ? 'active' : ''}" onclick="app.switchAdminTab('inventory')">
                                <i class="fa-solid fa-vials"></i> Inventory Control
                            </button>
                            <button class="tab-btn ${activeTab === 'requests' ? 'active' : ''}" onclick="app.switchAdminTab('requests')">
                                <i class="fa-solid fa-list-check"></i> Blood Requisitions (${this.state.emergencyRequests.length})
                            </button>
                            <button class="tab-btn ${activeTab === 'broadcast' ? 'active' : ''}" onclick="app.switchAdminTab('broadcast')">
                                <i class="fa-solid fa-bullhorn"></i> Donor Broadcast
                            </button>
                        </div>
                    </div>

                    ${activeTab === 'inventory' ? this.renderAdminInventoryTab() : ''}
                    ${activeTab === 'requests' ? this.renderAdminRequestsTab() : ''}
                    ${activeTab === 'broadcast' ? this.renderAdminBroadcastTab() : ''}
                </div>
            </section>
        `;
    }

    renderAdminInventoryTab() {
        const inventory = this.state.bloodInventory;

        return `
            <div class="table-responsive">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Blood Type</th>
                            <th>Available Units</th>
                            <th>Whole Blood</th>
                            <th>PRBC</th>
                            <th>FFP</th>
                            <th>Platelets</th>
                            <th>Expiring Soon (3 Days)</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.keys(inventory).map(bg => {
                            const data = inventory[bg];
                            return `
                                <tr>
                                    <td><strong class="blood-type-badge">${bg}</strong></td>
                                    <td><strong>${data.units} Units</strong></td>
                                    <td>${data.whole}</td>
                                    <td>${data.prbc}</td>
                                    <td>${data.ffp}</td>
                                    <td>${data.sdp}</td>
                                    <td><span style="color: ${data.expiringIn3Days > 0 ? 'var(--brand-red-light)' : 'var(--text-muted)'}; font-weight: 700;">${data.expiringIn3Days} Units</span></td>
                                    <td>
                                        <button class="btn btn-sm btn-secondary" onclick="app.adjustStock('${bg}', 5)"><i class="fa-solid fa-plus"></i> +5</button>
                                        <button class="btn btn-sm btn-secondary" onclick="app.adjustStock('${bg}', -5)"><i class="fa-solid fa-minus"></i> -5</button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    renderAdminRequestsTab() {
        const reqs = this.state.emergencyRequests;

        return `
            <div class="table-responsive">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Request ID</th>
                            <th>Patient / Hospital</th>
                            <th>Blood & Component</th>
                            <th>Units</th>
                            <th>Urgency</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${reqs.map(req => `
                            <tr>
                                <td><strong>${req.id}</strong></td>
                                <td>
                                    <div><strong>${req.patientName}</strong></div>
                                    <div style="font-size: 0.8rem; color: var(--text-secondary);">${req.hospital}</div>
                                </td>
                                <td>${req.bloodGroup} (${req.component})</td>
                                <td><strong>${req.units} Bags</strong></td>
                                <td>
                                    <span class="badge badge-${req.urgency === 'CRITICAL' ? 'critical' : req.urgency === 'URGENT' ? 'urgent' : 'info'}">
                                        ${req.urgency}
                                    </span>
                                </td>
                                <td>
                                    <span class="badge badge-${req.status === 'APPROVED' ? 'success' : req.status === 'PENDING' ? 'urgent' : 'critical'}">
                                        ${req.status}
                                    </span>
                                </td>
                                <td>
                                    ${req.status === 'PENDING' ? `
                                        <button class="btn btn-sm btn-primary" onclick="app.updateRequestStatus('${req.id}', 'APPROVED')">Approve</button>
                                    ` : ''}
                                    <button class="btn btn-sm btn-outline" onclick="app.showDispatchSlip('${req.id}')">Print Manifest</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    renderAdminBroadcastTab() {
        return `
            <div style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 2rem; border-radius: var(--radius-lg);">
                <h3 style="font-family: var(--font-heading); margin-bottom: 1rem;"><i class="fa-solid fa-tower-cell" style="color: var(--brand-red-light);"></i> Regional Donor Broadcast Console</h3>
                <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">Transmit high-priority SMS notifications to all matching registered donors in the event of major mass-casualty incidents or severe inventory shortfalls.</p>
                <button class="btn btn-emergency btn-lg" onclick="app.openModal('broadcastModal')">
                    <i class="fa-solid fa-bullhorn"></i> Launch Regional Emergency SMS Broadcast
                </button>
            </div>
        `;
    }

    // ----------------------------------------------------------------------
    // Event Handlers & Form Submissions
    // ----------------------------------------------------------------------
    handleEmergencySubmit(e) {
        e.preventDefault();

        const patientName = document.getElementById('reqPatientName').value;
        const bloodGroup = document.getElementById('reqBloodGroup').value;
        const component = document.getElementById('reqComponent').value;
        const units = parseInt(document.getElementById('reqUnits').value);
        const urgency = document.getElementById('reqUrgency').value;
        const hospital = document.getElementById('reqHospital').value;
        const city = document.getElementById('reqCity').value;
        const contact = document.getElementById('reqContact').value;
        const notes = document.getElementById('reqNotes').value;

        const newReq = {
            id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
            patientName,
            bloodGroup,
            component,
            units,
            hospital,
            city,
            contact,
            urgency,
            notes,
            requestDate: new Date().toLocaleString(),
            status: 'PENDING'
        };

        this.state.emergencyRequests.unshift(newReq);
        this.saveState();
        this.closeModal('emergencyModal');
        document.getElementById('emergencyRequestForm').reset();

        this.showToast(`Emergency Blood Request ${newReq.id} broadcasted to regional network!`, 'success');
        this.renderCurrentPage();
    }

    handleDonorRegistration(e) {
        e.preventDefault();

        const name = document.getElementById('donorName').value;
        const bloodGroup = document.getElementById('donorBloodGroup').value;
        const email = document.getElementById('donorEmail').value;
        const phone = document.getElementById('donorPhone').value;
        const city = document.getElementById('donorCity').value;
        const age = parseInt(document.getElementById('donorAge').value);
        const weight = parseInt(document.getElementById('donorWeight').value);
        const lastDonationDate = document.getElementById('donorLastDonated').value;

        const newDonor = {
            id: `DNR-${Math.floor(1000 + Math.random() * 9000)}`,
            name,
            bloodGroup,
            city,
            phone,
            email,
            age,
            weight,
            lastDonationDate: lastDonationDate || 'First Time',
            totalDonations: 1,
            status: 'AVAILABLE',
            verified: true
        };

        this.state.donors.unshift(newDonor);
        this.saveState();
        this.closeModal('donorRegModal');
        document.getElementById('donorRegForm').reset();

        this.showToast(`Welcome to LifePulse, ${name}! Your Donor ID is ${newDonor.id}.`, 'success');
        this.showDonorCard(newDonor.id);
    }

    handleSendBroadcast(e) {
        e.preventDefault();
        const bg = document.getElementById('bcBloodGroup').value;
        const radius = document.getElementById('bcRadius').value;

        this.closeModal('broadcastModal');
        this.showToast(`Broadcast sent! Alerted 48 compatible donors in ${radius}.`, 'success');
    }

    showDonorCard(donorId) {
        const donor = this.state.donors.find(d => d.id === donorId);
        if (!donor) return;

        const cardBody = document.getElementById('donorCardBody');
        if (!cardBody) return;

        cardBody.innerHTML = `
            <div class="donor-id-pass">
                <div class="id-header">
                    <div>
                        <strong style="font-size: 1.2rem; font-family: var(--font-heading);">LifePulse Blood Donor Pass</strong>
                        <div style="font-size: 0.8rem; opacity: 0.8;">Regional Health Network ID</div>
                    </div>
                    <div class="blood-type-badge" style="font-size: 1.4rem; padding: 6px 14px;">${donor.bloodGroup}</div>
                </div>

                <div class="id-body">
                    <div class="id-qr">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=LIFEPULSE-DONOR-${donor.id}" alt="Donor QR Code">
                    </div>
                    <div>
                        <h3 style="font-family: var(--font-heading); margin-bottom: 4px;">${donor.name}</h3>
                        <div style="font-size: 0.85rem; color: #cbd5e1;">Donor ID: <strong>${donor.id}</strong></div>
                        <div style="font-size: 0.85rem; color: #cbd5e1;">Location: <strong>${donor.city}</strong></div>
                        <div style="font-size: 0.85rem; color: #cbd5e1;">Contact: <strong>${donor.phone}</strong></div>
                    </div>
                </div>
            </div>
        `;

        this.openModal('donorCardModal');
    }

    showDispatchSlip(reqId) {
        const req = this.state.emergencyRequests.find(r => r.id === reqId);
        if (!req) return;

        const receiptBody = document.getElementById('dispatchReceiptBody');
        if (!receiptBody) return;

        receiptBody.innerHTML = `
            <div style="padding: 1rem; border: 2px solid var(--border-color); border-radius: var(--radius-md); background: var(--bg-input);">
                <div style="display: flex; justify-content: space-between; border-bottom: 2px solid var(--border-color); padding-bottom: 1rem; margin-bottom: 1rem;">
                    <div>
                        <h3 style="font-family: var(--font-heading);"><i class="fa-solid fa-droplet" style="color: var(--brand-red-light);"></i> LifePulse Blood Requisition Slip</h3>
                        <p style="font-size: 0.85rem; color: var(--text-secondary);">Tracking Requisition ID: <strong>${req.id}</strong></p>
                    </div>
                    <div style="text-align: right;">
                        <span class="badge badge-success">VERIFIED DISPATCH</span>
                        <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">Date: ${req.requestDate}</div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.9rem; margin-bottom: 1.5rem;">
                    <div>
                        <label style="color: var(--text-muted); font-size: 0.8rem;">PATIENT NAME</label>
                        <div><strong>${req.patientName}</strong></div>
                    </div>
                    <div>
                        <label style="color: var(--text-muted); font-size: 0.8rem;">BLOOD GROUP & TYPE</label>
                        <div><strong style="color: var(--brand-red-light);">${req.bloodGroup}</strong> (${req.component})</div>
                    </div>
                    <div>
                        <label style="color: var(--text-muted); font-size: 0.8rem;">DESTINATION HOSPITAL</label>
                        <div><strong>${req.hospital}</strong></div>
                    </div>
                    <div>
                        <label style="color: var(--text-muted); font-size: 0.8rem;">UNITS ALLOCATED</label>
                        <div><strong>${req.units} Blood Bags</strong></div>
                    </div>
                </div>

                <div style="border-top: 1px dashed var(--border-color); padding-top: 1rem; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.8rem; color: var(--text-muted);">Official Blood Bank Dispatch Seal</span>
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=DISPATCH-${req.id}" alt="QR" style="width: 50px; height: 50px; border-radius: 4px;">
                </div>
            </div>
        `;

        this.openModal('dispatchReceiptModal');
    }

    printDonorCard() { window.print(); }
    printReceipt() { window.print(); }

    adjustStock(bloodGroup, amount) {
        if (this.state.bloodInventory[bloodGroup]) {
            const current = this.state.bloodInventory[bloodGroup].units;
            this.state.bloodInventory[bloodGroup].units = Math.max(0, current + amount);
            this.saveState();
            this.showToast(`Updated ${bloodGroup} stock to ${this.state.bloodInventory[bloodGroup].units} units.`, 'info');
            this.renderCurrentPage();
        }
    }

    updateRequestStatus(reqId, newStatus) {
        const req = this.state.emergencyRequests.find(r => r.id === reqId);
        if (req) {
            req.status = newStatus;
            this.saveState();
            this.showToast(`Request ${reqId} updated to ${newStatus}.`, 'success');
            this.renderCurrentPage();
        }
    }

    selectCompatType(type) {
        this.state.selectedCompatType = type;
        this.renderCurrentPage();
    }

    switchAdminTab(tab) {
        this.state.adminActiveTab = tab;
        this.renderCurrentPage();
    }

    updateDonorSearch(query) {
        this.state.donorFilter.query = query;
        this.renderCurrentPage();
    }

    updateDonorGroupFilter(group) {
        this.state.donorFilter.bloodGroup = group;
        this.renderCurrentPage();
    }

    handleQuickSearch(e) {
        e.preventDefault();
        const bg = document.getElementById('qsBloodGroup').value;
        this.state.donorFilter.bloodGroup = bg;
        this.navigateTo('donors');
    }

    startEligibilityQuiz() {
        alert("Donor Screener Checklist:\n1. Age between 18-65?\n2. Weight over 50kg?\n3. No blood donation in last 3 months?\n\nIf you answered YES to all, you are eligible to donate!");
    }

    bookCampSlot(campId) {
        const camp = this.state.camps.find(c => c.id === campId);
        if (camp) {
            camp.registeredDonors += 1;
            this.saveState();
            this.showToast(`Slot booked for ${camp.title}! Check your email for venue pass.`, 'success');
            this.renderCurrentPage();
        }
    }
}

// Instantiate App Global
const app = new BloodBankApp();
document.addEventListener('DOMContentLoaded', () => app.init());
