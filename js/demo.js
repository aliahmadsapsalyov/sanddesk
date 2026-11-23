'use strict';

(() => {
  const STORAGE_KEY = 'sanddesk_interactive_demo_v1';
  const money = value => new Intl.NumberFormat('es-ES', {style:'currency', currency:'EUR', maximumFractionDigits:2}).format(Number(value) || 0);
  const dateLabel = value => value ? new Intl.DateTimeFormat('es-ES', {day:'2-digit', month:'short', year:'numeric'}).format(new Date(value)) : '—';
  const dateTimeLabel = value => value ? new Intl.DateTimeFormat('es-ES', {day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'}).format(new Date(value)) : '—';
  const uid = prefix => `${prefix}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
  const daysAgo = days => { const d = new Date(); d.setDate(d.getDate()-days); return d.toISOString(); };
  const todayISO = () => new Date().toISOString().slice(0,10);
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const makeSeed = () => ({
    clients: [
      {id:'CL-001',name:'María López',phone:'612 345 678',email:'maria.lopez@email.com',notes:'Prefiere contacto por WhatsApp.',createdAt:daysAgo(130)},
      {id:'CL-002',name:'David Sánchez',phone:'633 210 987',email:'david.s@email.com',notes:'Cliente habitual.',createdAt:daysAgo(92)},
      {id:'CL-003',name:'Laura García',phone:'677 890 123',email:'laura.g@email.com',notes:'',createdAt:daysAgo(61)},
      {id:'CL-004',name:'Jordi Pons',phone:'644 555 220',email:'jordi.pons@email.com',notes:'',createdAt:daysAgo(45)},
      {id:'CL-005',name:'Nuria Soler',phone:'699 111 456',email:'nuria.s@email.com',notes:'',createdAt:daysAgo(23)}
    ],
    repairs: [
      {id:'SD-1048',clientId:'CL-001',brand:'Apple',model:'iPhone 13',issue:'Cambio de pantalla',status:'En reparación',price:129,deposit:30,paid:30,accessories:'Funda transparente',notes:'Pequeño golpe en la esquina inferior.',createdAt:daysAgo(0),updatedAt:daysAgo(0)},
      {id:'SD-1047',clientId:'CL-002',brand:'Samsung',model:'Galaxy S22',issue:'Cambio de batería',status:'Listo para entregar',price:79,deposit:20,paid:20,accessories:'Sin accesorios',notes:'',createdAt:daysAgo(1),updatedAt:daysAgo(0)},
      {id:'SD-1046',clientId:'CL-003',brand:'Xiaomi',model:'Redmi Note 12',issue:'Conector de carga',status:'Esperando pieza',price:59,deposit:0,paid:0,accessories:'Caja original',notes:'Pendiente de recibir conector USB-C.',createdAt:daysAgo(2),updatedAt:daysAgo(1)},
      {id:'SD-1045',clientId:'CL-004',brand:'Apple',model:'iPhone 12',issue:'Sustitución de batería',status:'Entregado',price:69,deposit:0,paid:69,accessories:'Sin accesorios',notes:'Reparación finalizada correctamente.',createdAt:daysAgo(8),updatedAt:daysAgo(6),deliveredAt:daysAgo(6)},
      {id:'SD-1044',clientId:'CL-005',brand:'Samsung',model:'Galaxy A54',issue:'Diagnóstico de humedad',status:'Entregado',price:35,deposit:0,paid:35,accessories:'Funda y SIM',notes:'Limpieza y comprobación.',createdAt:daysAgo(21),updatedAt:daysAgo(19),deliveredAt:daysAgo(19)},
      {id:'SD-1043',clientId:'CL-001',brand:'Apple',model:'iPhone 11',issue:'Cambio de cámara trasera',status:'Entregado',price:89,deposit:0,paid:89,accessories:'Sin accesorios',notes:'',createdAt:daysAgo(44),updatedAt:daysAgo(42),deliveredAt:daysAgo(42)},
      {id:'SD-1042',clientId:'CL-002',brand:'Xiaomi',model:'Mi 11 Lite',issue:'Cambio de pantalla',status:'Entregado',price:99,deposit:0,paid:99,accessories:'',notes:'',createdAt:daysAgo(76),updatedAt:daysAgo(73),deliveredAt:daysAgo(73)},
      {id:'SD-1041',clientId:'CL-003',brand:'Apple',model:'iPhone XR',issue:'Cambio de altavoz',status:'Recibido',price:45,deposit:0,paid:0,accessories:'',notes:'',createdAt:daysAgo(0),updatedAt:daysAgo(0)}
    ],
    inventory: [
      {id:'IN-001',name:'Pantalla iPhone 13 OLED',sku:'LCD-IP13-O',category:'Pantallas',stock:7,minimum:3,cost:42,price:89},
      {id:'IN-002',name:'Batería Samsung S22',sku:'BAT-S22',category:'Baterías',stock:2,minimum:3,cost:18,price:49},
      {id:'IN-003',name:'Conector USB-C universal',sku:'CON-USBC',category:'Conectores',stock:12,minimum:4,cost:3.5,price:19},
      {id:'IN-004',name:'Protector hidrogel universal',sku:'HYD-UNI',category:'Accesorios',stock:24,minimum:8,cost:1.2,price:9.9},
      {id:'IN-005',name:'Adhesivo batería iPhone',sku:'ADH-IP',category:'Consumibles',stock:0,minimum:5,cost:.8,price:4.5},
      {id:'IN-006',name:'Cámara trasera iPhone 11',sku:'CAM-IP11',category:'Componentes',stock:4,minimum:2,cost:23,price:59}
    ],
    appointments: [
      {id:'AP-001',clientId:'CL-004',date:todayISO(),time:'11:30',device:'iPhone 14',reason:'Diagnóstico de carga',status:'Pendiente'},
      {id:'AP-002',clientId:'CL-005',date:todayISO(),time:'17:00',device:'Samsung A52',reason:'Cambio de pantalla',status:'Pendiente'}
    ],
    movements: [
      {id:'MV-001',productId:'IN-004',delta:10,note:'Reposición de stock',date:daysAgo(1)},
      {id:'MV-002',productId:'IN-002',delta:-1,note:'Uso en reparación SD-1047',date:daysAgo(0)}
    ],
    companies: [],
    issuerProfile: null,
    invoices: []
  });

  const makeEmptyState = () => ({clients:[], repairs:[], inventory:[], appointments:[], movements:[], companies:[], issuerProfile:null, invoices:[]});

  const loadState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return makeSeed();
      const parsed = JSON.parse(saved);
      if (!parsed || !Array.isArray(parsed.clients) || !Array.isArray(parsed.repairs) || !Array.isArray(parsed.inventory)) return makeSeed();
      return {...makeSeed(), ...parsed};
    } catch (error) {
      console.warn('No se pudo leer el guardado local de la demo:', error);
      return makeSeed();
    }
  };

  let state = loadState();
  let currentRepairId = null;
  let currentInvoiceId = null;
  let cloudClient = null;
  let cloudUser = null;
  let cloudMode = false;
  let cloudSaveTimer = null;
  let cloudSaveChain = Promise.resolve();
  let authMode = 'signin';

  function setStorageStatus(label, mode='local') {
    const badge = document.getElementById('storageBadge');
    if (!badge) return;
    badge.innerHTML = `<i></i> ${escapeHTML(label)}`;
    badge.dataset.mode = mode;
  }

  function updateCloudProfile(user) {
    const email = user?.email || 'Taller';
    const name = user?.user_metadata?.business_name || email.split('@')[0];
    const display = document.querySelector('.top-user span');
    const sideName = document.querySelector('.profile-mini strong');
    const sideRole = document.querySelector('.profile-mini small');
    if (display) display.textContent = name;
    if (sideName) sideName.textContent = name;
    if (sideRole) sideRole.textContent = email;
    const avatar = document.querySelector('.top-user .profile-avatar');
    const sideAvatar = document.querySelector('.profile-mini .profile-avatar');
    const initial = name.trim().charAt(0).toUpperCase() || 'S';
    if (avatar) avatar.textContent = initial;
    if (sideAvatar) sideAvatar.textContent = initial;
  }

  function showAuthGate(message='') {
    const gate = document.getElementById('authGate');
    if (gate) { gate.hidden = false; gate.classList.add('visible'); }
    const msg = document.getElementById('authMessage');
    if (msg) msg.textContent = message;
    document.body.classList.add('auth-locked');
  }

  function hideAuthGate() {
    const gate = document.getElementById('authGate');
    if (gate) { gate.classList.remove('visible'); gate.hidden = true; }
    document.body.classList.remove('auth-locked');
  }

  async function persistCloudSnapshot(snapshot) {
    if (!cloudClient || !cloudUser) return;
    const {error} = await cloudClient.from('sanddesk_workspace_data').upsert({
      user_id: cloudUser.id,
      data: snapshot,
      updated_at: new Date().toISOString()
    }, {onConflict:'user_id'});
    if (error) throw error;
    setStorageStatus('NUBE CONECTADA','cloud');
  }

  function scheduleCloudSave() {
    if (!cloudClient || !cloudUser) return;
    const snapshot = JSON.parse(JSON.stringify(state));
    clearTimeout(cloudSaveTimer);
    setStorageStatus('GUARDANDO…','syncing');
    cloudSaveTimer = setTimeout(() => {
      cloudSaveChain = cloudSaveChain
        .then(() => persistCloudSnapshot(snapshot))
        .catch(error => {
          console.error('Error guardando en Supabase:', error);
          setStorageStatus('ERROR DE SINCRONIZACIÓN','error');
          toast('No se pudo sincronizar con la nube. Comprueba tu conexión.','error');
        });
    }, 350);
  }

  async function flushCloudSave() {
    if (!cloudClient || !cloudUser) return;
    clearTimeout(cloudSaveTimer);
    const snapshot = JSON.parse(JSON.stringify(state));
    cloudSaveChain = cloudSaveChain.then(() => persistCloudSnapshot(snapshot)).catch(error => {
      console.error('Error en sincronización pendiente:', error);
      setStorageStatus('ERROR DE SINCRONIZACIÓN','error');
    });
    await cloudSaveChain;
  }

  const save = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      if (cloudMode && cloudUser) scheduleCloudSave();
    } catch (error) {
      toast('No se pudo guardar en este navegador.','error');
    }
  };

  async function activateCloudUser(user) {
    cloudUser = user;
    setStorageStatus('CARGANDO NUBE…','syncing');
    const {data:row, error} = await cloudClient
      .from('sanddesk_workspace_data')
      .select('data')
      .eq('user_id', user.id)
      .maybeSingle();
    if (error) {
      cloudUser = null;
      setStorageStatus('ERROR DE NUBE','error');
      showAuthGate(`No se pudieron cargar los datos: ${error.message}. Revisa la tabla y las políticas RLS.`);
      return;
    }

    if (row?.data && typeof row.data === 'object') {
      state = {...makeEmptyState(), ...row.data};
      if (migrateLegacyCompanyRecords()) {
        try { await persistCloudSnapshot(state); localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
        catch (error) { console.error('No se pudo guardar la migración de empresas:', error); }
      }
    } else {
      // Primera entrada: ofrece importar los datos locales existentes en este navegador.
      let imported = null;
      const localRaw = localStorage.getItem(STORAGE_KEY);
      if (localRaw) {
        try {
          const parsed = JSON.parse(localRaw);
          if (parsed && Array.isArray(parsed.clients) && Array.isArray(parsed.repairs)) {
            const shouldImport = window.confirm('Esta cuenta todavía no tiene datos en la nube. Hemos encontrado datos guardados en este navegador. ¿Quieres importarlos a tu nuevo espacio de taller?');
            if (shouldImport) imported = {...makeEmptyState(), ...parsed};
          }
        } catch (error) { console.warn('No se pudo preparar la importación local:', error); }
      }
      state = imported || makeEmptyState();
      const migratedLegacy = migrateLegacyCompanyRecords();
      // Si el usuario rechaza la importación, conserva intacta la copia local antigua.
      // La próxima edición autenticada ya escribirá el espacio cloud como nueva copia local.
      if ((imported || !localRaw) && (imported || migratedLegacy || !localRaw)) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
      }
      try { await persistCloudSnapshot(state); }
      catch (error) {
        cloudUser = null;
        setStorageStatus('ERROR DE NUBE','error');
        showAuthGate(`No se pudieron inicializar los datos: ${error.message}`);
        return;
      }
      if (imported) toast('Datos locales importados a tu espacio privado.');
    }

    cloudMode = true;
    updateCloudProfile(user);
    const signOut = document.getElementById('cloudSignOut');
    if (signOut) signOut.hidden = false;
    const tip = document.getElementById('storageTipText');
    if (tip) tip.textContent = 'Tus datos se guardan en tu espacio privado de Supabase y permanecen al actualizar la web.';
    const reset = document.getElementById('resetDemo');
    if (reset) reset.textContent = 'Vaciar espacio de trabajo ↺';
    setStorageStatus('NUBE CONECTADA','cloud');
    hideAuthGate();
    renderAll(); clientOptions(); refreshInvoiceSelectors();
  }

  function configureAuthMode(mode) {
    authMode = mode;
    const isSignup = mode === 'signup';
    document.getElementById('authTitle').textContent = isSignup ? 'Crea el espacio de tu taller' : 'Accede a tu taller';
    document.getElementById('authDescription').textContent = isSignup ? 'Registra tu cuenta para guardar los datos del taller en la nube.' : 'Inicia sesión para cargar tus clientes, reparaciones, inventario y facturas desde la nube.';
    document.getElementById('authBusinessField').hidden = !isSignup;
    document.getElementById('authSubmit').textContent = isSignup ? 'Crear cuenta' : 'Iniciar sesión';
    document.getElementById('authSwitch').textContent = isSignup ? '¿Ya tienes cuenta? Iniciar sesión' : '¿Primera vez? Crear cuenta del taller';
    document.getElementById('authMessage').textContent = '';
  }

  async function initializeCloudStorage() {
    const config = window.SANDDESK_SUPABASE_CONFIG || {};
    const configured = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(config.url || '') && Boolean(config.anonKey && !String(config.anonKey).includes('REPLACE'));
    if (!configured) {
      cloudMode = false;
      setStorageStatus('MODO LOCAL','local');
      const tip = document.getElementById('storageTipText');
      if (tip) tip.textContent = 'Ahora mismo los cambios se guardan en este navegador. Configura Supabase para sincronizarlos en la nube.';
      return;
    }
    if (!window.supabase?.createClient) {
      showAuthGate('No se ha podido cargar el cliente de Supabase. Comprueba tu conexión y recarga la página.');
      setStorageStatus('NUBE NO DISPONIBLE','error');
      return;
    }

    cloudClient = window.supabase.createClient(config.url, config.anonKey, {
      auth: {persistSession:true, autoRefreshToken:true, detectSessionInUrl:true}
    });
    cloudMode = true;
    const {data, error} = await cloudClient.auth.getSession();
    if (error) {
      showAuthGate(`No se pudo comprobar la sesión: ${error.message}`);
      return;
    }
    if (data.session?.user) await activateCloudUser(data.session.user);
    else { configureAuthMode('signin'); showAuthGate(); setStorageStatus('INICIA SESIÓN','local'); }

    cloudClient.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        cloudUser = null; cloudMode = true;
        setStorageStatus('SESIÓN CERRADA','local');
        showAuthGate('Has cerrado la sesión. Inicia sesión para volver a acceder a tus datos.');
      }
    });
  }

  // Initial browser cache. In cloud mode this is replaced by the authenticated workspace.
  const clientById = id => state.clients.find(client => client.id === id);
  const repairById = id => state.repairs.find(repair => repair.id === id);
  const repairCountForClient = id => state.repairs.filter(repair => repair.clientId === id).length;
  const statusClass = status => `status-${String(status).toLowerCase().replaceAll(' ','-')}`;
  const statusBadge = status => `<span class="status-pill ${statusClass(status)}">${escapeHTML(status)}</span>`;
  const sortNewest = list => [...list].sort((a,b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

  function toast(message, type='success') {
    const region = document.getElementById('toastRegion');
    const el = document.createElement('div'); el.className = `toast ${type === 'error' ? 'error' : ''}`; el.textContent = message;
    region.appendChild(el); setTimeout(() => el.remove(), 3400);
  }

  function openModal(id) {
    const modal = document.getElementById(id); if (!modal) return;
    modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
    const focusable = modal.querySelector('input,select,textarea,button'); if (focusable) setTimeout(() => focusable.focus(),80);
  }
  function closeModal(modal) {
    if (!modal) return; modal.classList.remove('open'); modal.setAttribute('aria-hidden','true');
    if (!document.querySelector('.modal-backdrop.open')) document.body.style.overflow='';
  }

  function goTo(viewName) {
    const view = document.getElementById(`view-${viewName}`); if (!view) return;
    document.querySelectorAll('.view').forEach(item => item.classList.toggle('active', item === view));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.view === viewName));
    document.getElementById('breadcrumbCurrent').textContent = view.dataset.title || 'Sand Desk';
    document.getElementById('appSidebar').classList.remove('open'); document.getElementById('sidebarScrim').classList.remove('open');
    window.scrollTo({top:0,behavior:'smooth'});
    if (viewName === 'analytics') renderAnalytics();
    if (viewName === 'invoices') renderInvoices();
  }

  function clientOptions(selected='') {
    const select = document.getElementById('repairClient');
    const appointmentSelect = document.getElementById('appointmentClient');
    const options = state.clients.map(c => `<option value="${escapeHTML(c.id)}">${escapeHTML(c.name)} · ${escapeHTML(c.phone)}</option>`).join('');
    [select,appointmentSelect].forEach(el => { if (!el) return; const old = el.value; el.innerHTML = `<option value="">Selecciona un cliente</option>${options}`; el.value = selected || old || ''; });
  }

  function monthKey(date) { const d = new Date(date); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; }
  function getLastMonths(count=6) {
    const months=[]; const now=new Date();
    for(let i=count-1;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1);months.push({key:monthKey(d),label:new Intl.DateTimeFormat('es-ES',{month:'short'}).format(d).replace('.',''),total:0});}
    return months;
  }
  function deliveredRevenue(repair) { return repair.status === 'Entregado' ? Number(repair.paid ?? repair.price ?? 0) : 0; }
  function revenueThisMonth() { const key=monthKey(new Date()); return state.repairs.filter(r=>r.status==='Entregado' && monthKey(r.deliveredAt || r.updatedAt || r.createdAt)===key).reduce((sum,r)=>sum+deliveredRevenue(r),0); }
  function monthlyChartMarkup(containerId, totalId) {
    const months=getLastMonths(6);
    state.repairs.filter(r=>r.status==='Entregado').forEach(r=>{const key=monthKey(r.deliveredAt || r.updatedAt || r.createdAt);const m=months.find(x=>x.key===key);if(m)m.total+=deliveredRevenue(r);});
    const max=Math.max(1,...months.map(m=>m.total)); const total=months.reduce((s,m)=>s+m.total,0);
    const container=document.getElementById(containerId); if (container) container.innerHTML=months.map(m=>`<div class="chart-bar-wrap"><div class="chart-bar" title="${money(m.total)}" style="height:${Math.max(4,(m.total/max)*100)}%"></div><small>${escapeHTML(m.label)}</small></div>`).join('');
    if(totalId){const node=document.getElementById(totalId);if(node)node.textContent=money(total);}
  }

  function renderKpis(containerId, mode='dashboard') {
    const active=state.repairs.filter(r=>r.status!=='Entregado').length;
    const ready=state.repairs.filter(r=>r.status==='Listo para entregar').length;
    const totalClients=state.clients.length;
    const revenue=revenueThisMonth();
    const delivered=state.repairs.filter(r=>r.status==='Entregado').length;
    const items=[
      {label:'Ingresos del mes',value:money(revenue),foot:`${delivered} reparaciones entregadas`,icon:'€',className:'revenue'},
      {label:'Reparaciones activas',value:active,foot:'Dispositivos en el taller',icon:'⌁'},
      {label:'Listas para entregar',value:ready,foot:'Pendientes de recogida',icon:'✓'},
      {label:'Clientes registrados',value:totalClients,foot:'En tu base de datos',icon:'♙'}
    ];
    document.getElementById(containerId).innerHTML=items.map(item=>`<article class="kpi-card ${item.className||''}"><div class="kpi-top"><span>${item.label}</span><span class="kpi-icon">${item.icon}</span></div><div class="kpi-value">${item.value}</div><div class="kpi-foot ${item.className==='revenue'?'positive':''}">${item.foot}</div></article>`).join('');
  }

  function repairRow(repair, compact=false) {
    const client=clientById(repair.clientId); const name=client?.name || 'Cliente eliminado';
    if(compact) return `<tr><td><span class="table-primary">${repair.id}</span><span class="table-muted">${dateLabel(repair.createdAt)}</span></td><td>${escapeHTML(name)}</td><td><span class="table-primary">${escapeHTML(repair.brand)} ${escapeHTML(repair.model)}</span></td><td>${statusBadge(repair.status)}</td><td class="${repair.status==='Entregado'?'amount':''}">${money(repair.price)}</td><td><button class="icon-action" data-detail="${repair.id}">Ver</button></td></tr>`;
    return `<tr><td><span class="table-primary">${repair.id}</span></td><td>${dateLabel(repair.createdAt)}</td><td>${escapeHTML(name)}</td><td><span class="table-primary">${escapeHTML(repair.brand)} ${escapeHTML(repair.model)}</span></td><td>${escapeHTML(repair.issue)}</td><td>${statusBadge(repair.status)}</td><td>${money(repair.price)}</td><td><div class="row-actions"><button class="icon-action" data-detail="${repair.id}">Abrir</button><button class="icon-action" data-print="${repair.id}" title="Imprimir ticket">Ticket</button></div></td></tr>`;
  }

  function renderDashboard() {
    renderKpis('dashboardKpis');
    monthlyChartMarkup('dashboardChart','chartTotal');
    const recent=sortNewest(state.repairs).slice(0,5);
    document.getElementById('dashboardRepairRows').innerHTML=recent.length?recent.map(r=>repairRow(r,true)).join(''):`<tr><td colspan="6"><div class="empty-state">Todavía no hay reparaciones.</div></td></tr>`;
    const activity=[];
    sortNewest(state.repairs).slice(0,4).forEach(r=>{const c=clientById(r.clientId);activity.push({date:r.updatedAt||r.createdAt,title:`${r.brand} ${r.model}`,desc:`${c?.name||'Cliente'} · ${r.status}`,time:dateTimeLabel(r.updatedAt||r.createdAt),icon:'⌁'});});
    state.movements.slice(-3).reverse().forEach(m=>{const p=state.inventory.find(x=>x.id===m.productId);activity.push({date:m.date,title:`Movimiento de stock · ${p?.name||'Producto'}`,desc:m.note,time:dateTimeLabel(m.date),icon:m.delta>=0?'+':'−'});});
    activity.sort((a,b)=>new Date(b.date)-new Date(a.date));
    document.getElementById('recentActivity').innerHTML=activity.slice(0,5).map(a=>`<div class="activity-item"><span class="activity-icon">${a.icon}</span><span class="activity-copy"><strong>${escapeHTML(a.title)}</strong><small>${escapeHTML(a.desc)}</small></span><time class="activity-time">${escapeHTML(a.time)}</time></div>`).join('')||'<div class="empty-state">Sin actividad reciente.</div>';
    document.getElementById('navRepairCount').textContent=state.repairs.filter(r=>r.status!=='Entregado').length;
  }

  function renderRepairs() {
    const query=(document.getElementById('repairSearch')?.value||'').toLowerCase(); const filter=document.getElementById('repairFilter')?.value||'all';
    const rows=sortNewest(state.repairs).filter(r=>{const c=clientById(r.clientId);const text=[r.id,r.brand,r.model,r.issue,c?.name,c?.phone].join(' ').toLowerCase();return (!query||text.includes(query))&&(filter==='all'||r.status===filter);});
    document.getElementById('repairsRows').innerHTML=rows.length?rows.map(r=>repairRow(r)).join(''):`<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">⌁</div>No se encontraron reparaciones con esos filtros.</div></td></tr>`;
  }

  function renderClients() {
    const query=(document.getElementById('clientSearch')?.value||'').toLowerCase();
    const rows=state.clients.filter(c=>[c.name,c.phone,c.email].join(' ').toLowerCase().includes(query));
    document.getElementById('clientCountLabel').textContent=`${state.clients.length} clientes`;
    document.getElementById('clientsRows').innerHTML=rows.length?rows.map(c=>{const repairs=state.repairs.filter(r=>r.clientId===c.id);const last=sortNewest(repairs)[0];const total=repairs.reduce((sum,r)=>sum+Number(r.price||0),0);return `<tr><td><span class="table-primary">${escapeHTML(c.name)}</span><span class="table-muted">${c.id}</span></td><td>${escapeHTML(c.phone)}</td><td>${escapeHTML(c.email||'—')}</td><td>${repairs.length}</td><td>${last?dateLabel(last.createdAt):'—'}</td><td><button class="icon-action" data-client="${c.id}">Historial · ${money(total)}</button></td></tr>`;}).join(''):`<tr><td colspan="6"><div class="empty-state">No hay clientes que coincidan con la búsqueda.</div></td></tr>`;
    clientOptions();
  }

  function renderInventory() {
    const query=(document.getElementById('inventorySearch')?.value||'').toLowerCase();const filter=document.getElementById('stockFilter')?.value||'all';
    const low=state.inventory.filter(p=>p.stock>0&&p.stock<=p.minimum).length;const out=state.inventory.filter(p=>p.stock===0).length;const value=state.inventory.reduce((sum,p)=>sum+p.stock*p.cost,0);
    document.getElementById('inventoryKpis').innerHTML=[{label:'Referencias',value:state.inventory.length,foot:'Productos registrados',icon:'▦'},{label:'Stock bajo',value:low,foot:'Por debajo del mínimo',icon:'!'},{label:'Agotados',value:out,foot:'Necesitan reposición',icon:'×'},{label:'Valor de coste',value:money(value),foot:'Valor estimado del almacén',icon:'€'}].map(x=>`<article class="kpi-card"><div class="kpi-top"><span>${x.label}</span><span class="kpi-icon">${x.icon}</span></div><div class="kpi-value">${x.value}</div><div class="kpi-foot">${x.foot}</div></article>`).join('');
    const rows=state.inventory.filter(p=>[p.name,p.sku,p.category].join(' ').toLowerCase().includes(query)).filter(p=>filter==='all'||(filter==='low'&&p.stock>0&&p.stock<=p.minimum)||(filter==='out'&&p.stock===0));
    document.getElementById('inventoryRows').innerHTML=rows.length?rows.map(p=>{const stockClass=p.stock===0?'out':p.stock<=p.minimum?'low':'';const label=p.stock===0?'Agotado':p.stock<=p.minimum?'Stock bajo':'Disponible';return `<tr><td><span class="table-primary">${escapeHTML(p.name)}</span></td><td>${escapeHTML(p.sku||'—')}</td><td>${escapeHTML(p.category)}</td><td><span class="stock-indicator"><i class="stock-dot ${stockClass}"></i>${p.stock} uds. · ${label}</span></td><td>${p.minimum}</td><td>${money(p.price)}</td><td><div class="stock-controls"><button class="icon-action" data-stock="${p.id}" data-delta="-1" aria-label="Restar una unidad">−</button><span class="stock-value">${p.stock}</span><button class="icon-action" data-stock="${p.id}" data-delta="1" aria-label="Sumar una unidad">＋</button></div></td></tr>`;}).join(''):`<tr><td colspan="7"><div class="empty-state">No hay productos que coincidan con el filtro.</div></td></tr>`;
    document.getElementById('stockMovements').innerHTML=state.movements.slice(-6).reverse().map(m=>{const p=state.inventory.find(x=>x.id===m.productId);return `<div class="movement-row"><div><strong>${escapeHTML(p?.name||'Producto eliminado')}</strong><small>${escapeHTML(m.note)} · ${dateTimeLabel(m.date)}</small></div><span class="${m.delta>=0?'movement-in':'movement-out'}">${m.delta>=0?'+':''}${m.delta} uds.</span></div>`;}).join('')||'<div class="empty-state">Los movimientos de stock aparecerán aquí.</div>';
  }

  function renderAppointments() {
    const rows=[...state.appointments].sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
    document.getElementById('appointmentsRows').innerHTML=rows.length?rows.map(a=>{const c=clientById(a.clientId);const badge=a.status==='Completada'?'<span class="status-pill status-entregado">Completada</span>':'<span class="status-pill status-recibido">Pendiente</span>';return `<tr><td><span class="table-primary">${dateLabel(a.date+'T00:00:00')}</span><span class="table-muted">${escapeHTML(a.time)}</span></td><td>${escapeHTML(c?.name||'Cliente')}</td><td>${escapeHTML(a.device||'—')}</td><td>${escapeHTML(a.reason||'—')}</td><td>${badge}</td><td><button class="icon-action" data-appointment-done="${a.id}">${a.status==='Completada'?'Completada':'Marcar hecha'}</button></td></tr>`;}).join(''):`<tr><td colspan="6"><div class="empty-state">No hay citas programadas. Añade la primera.</div></td></tr>`;
    clientOptions();
  }

  function renderAnalytics() {
    renderKpis('analyticsKpis','analytics'); monthlyChartMarkup('analyticsChart','analyticsTotal');
    const statuses=['Recibido','En reparación','Esperando pieza','Listo para entregar','Entregado'];
    const counts=statuses.map(s=>({s,n:state.repairs.filter(r=>r.status===s).length}));const max=Math.max(1,...counts.map(x=>x.n));
    document.getElementById('statusBreakdown').innerHTML=counts.map(x=>`<div class="breakdown-row"><span>${x.s}</span><div class="breakdown-track"><div class="breakdown-fill" style="width:${x.n/max*100}%"></div></div><strong>${x.n}</strong></div>`).join('');
    const top=state.clients.map(c=>{const r=state.repairs.filter(x=>x.clientId===c.id);return {c,n:r.length,total:r.reduce((s,x)=>s+Number(x.price||0),0)};}).sort((a,b)=>b.total-a.total).slice(0,5);
    document.getElementById('topClientsRows').innerHTML=top.length?top.map(x=>`<tr><td><span class="table-primary">${escapeHTML(x.c.name)}</span></td><td>${x.n}</td><td class="amount">${money(x.total)}</td></tr>`).join(''):'<tr><td colspan="3"><div class="empty-state">Todavía no hay actividad suficiente.</div></td></tr>';
  }

  function renderTickets() {
    const rows=sortNewest(state.repairs);
    document.getElementById('ticketsRows').innerHTML=rows.length?rows.map(r=>{const c=clientById(r.clientId);return `<tr><td><span class="table-primary">${r.id}</span></td><td>${dateLabel(r.createdAt)}</td><td>${escapeHTML(c?.name||'Cliente')}</td><td>${escapeHTML(r.brand)} ${escapeHTML(r.model)}</td><td>${r.status==='Entregado'?'Salida':'Entrada'}</td><td><button class="icon-action" data-print="${r.id}">Imprimir ticket</button></td></tr>`;}).join(''):'<tr><td colspan="6"><div class="empty-state">Todavía no hay tickets.</div></td></tr>';
  }

  const roundMoney = value => Math.round((Number(value||0)+Number.EPSILON)*100)/100;
  const invoiceById = id => state.invoices.find(invoice=>invoice.id===id);
  // state.companies are customer companies (invoice recipients B), not issuers.
  const companyById = id => state.companies.find(company=>company.id===id);
  const getIssuerProfile = () => state.issuerProfile || null;
  const fullAddress = record => [record?.street,record?.streetNumber,record?.postalCode,record?.city,record?.province,record?.country].filter(Boolean).join(', ');
  // Backward compatibility: older Sand Desk builds stored the workshop issuer inside `companies`.
  // Move the first untyped legacy record to issuerProfile instead of displaying it as a customer B.
  function migrateLegacyCompanyRecords() {
    if (state.issuerProfile || !Array.isArray(state.companies)) return false;
    const legacy = state.companies.filter(company => !company.role);
    if (!legacy.length) return false;
    state.issuerProfile = {...legacy[0], migratedFromLegacyCompanies:true};
    const legacyIds = new Set(legacy.map(company => company.id));
    state.invoices = (state.invoices || []).map(invoice => {
      if (!invoice.issuerId && legacyIds.has(invoice.companyId)) return {...invoice, issuerId:invoice.companyId};
      return invoice;
    });
    state.companies = state.companies.filter(company => company.role === 'invoice_recipient');
    if (legacy.length > 1) state.legacyIssuerProfiles = [...(state.legacyIssuerProfiles || []), ...legacy.slice(1)];
    return true;
  }
  const invoiceNumberFor = (issuerId, date) => {
    const year=String(date||todayISO()).slice(0,4);
    const used=state.invoices.filter(invoice=>(invoice.issuerId||'legacy-'+(invoice.companyId||''))===issuerId && String(invoice.issueDate).startsWith(year)).map(invoice=>Number(String(invoice.number).split('-').at(-1))||0);
    return `F-${year}-${String(Math.max(0,...used)+1).padStart(4,'0')}`;
  };
  function calculateInvoice(amount, rate, mode) {
    const value=Math.max(0,Number(amount)||0), vatRate=Math.max(0,Number(rate)||0);
    let base,tax,total;
    if(mode==='excluded'){base=roundMoney(value);tax=roundMoney(base*vatRate/100);total=roundMoney(base+tax);}
    else {total=roundMoney(value);base=vatRate?roundMoney(total/(1+vatRate/100)):total;tax=roundMoney(total-base);}
    return {base,tax,total,rate:vatRate};
  }
  function renderIssuerProfile() {
    const host=document.getElementById('invoiceIssuerProfile');
    if(!host)return;
    const issuer=getIssuerProfile();
    host.innerHTML=issuer?`<div class="invoice-company-card issuer-company-card"><div class="invoice-company-top"><span class="invoice-company-icon">A</span><span class="invoice-company-status">Emisor de tus facturas</span></div><strong>${escapeHTML(issuer.legalName)}</strong><span class="invoice-company-tax">NIF: ${escapeHTML(issuer.taxId)}</span><p>${escapeHTML(fullAddress(issuer))}</p><small>${escapeHTML(issuer.phone||'')}${issuer.email?` · ${escapeHTML(issuer.email)}`:''}</small></div>`:`<div class="invoice-empty"><span>▣</span><strong>Aún no has configurado tu empresa emisora</strong><p>Introduce los datos fiscales de tu propio taller. Esta empresa A será quien venda y emita todas las facturas.</p><button class="btn btn-primary" data-open-modal="issuerModal">＋ Configurar mi empresa emisora</button></div>`;
  }
  function renderInvoices() {
    const total=state.invoices.reduce((sum,invoice)=>sum+Number(invoice.total||0),0);
    const tax=state.invoices.reduce((sum,invoice)=>sum+Number(invoice.tax||0),0);
    const recipients=state.companies.length;
    const kpis=[
      {label:'Facturas creadas',value:state.invoices.length,foot:'Documentos registrados',icon:'▤'},
      {label:'Total facturado',value:money(total),foot:'Importes de la demo',icon:'€',className:'revenue'},
      {label:'IVA repercutido',value:money(tax),foot:'Suma de cuotas calculadas',icon:'%'},
      {label:'Empresas cliente',value:recipients,foot:'Destinatarios guardados',icon:'▦'}
    ];
    document.getElementById('invoiceKpis').innerHTML=kpis.map(item=>`<article class="kpi-card ${item.className||''}"><div class="kpi-top"><span>${item.label}</span><span class="kpi-icon">${item.icon}</span></div><div class="kpi-value">${item.value}</div><div class="kpi-foot ${item.className==='revenue'?'positive':''}">${item.foot}</div></article>`).join('');

    renderIssuerProfile();
    const companyHost=document.getElementById('invoiceCompanies');
    companyHost.innerHTML=recipients?state.companies.map(company=>`<div class="invoice-company-card"><div class="invoice-company-top"><span class="invoice-company-icon">B</span><span class="invoice-company-status">Cliente · Destinatario</span></div><strong>${escapeHTML(company.legalName)}</strong><span class="invoice-company-tax">NIF: ${escapeHTML(company.taxId)}</span><p>${escapeHTML(fullAddress(company))}</p><small>${escapeHTML(company.phone||'')}${company.email?` · ${escapeHTML(company.email)}`:''}</small></div>`).join(''):'<div class="invoice-empty"><span>▦</span><strong>Aún no has guardado empresas cliente</strong><p>Crea la ficha fiscal de la empresa B que compra a tu taller para seleccionarla al emitir una factura.</p><button class="btn btn-ghost" data-open-modal="companyModal">＋ Crear primera empresa cliente</button></div>';

    const label=document.getElementById('invoiceCountLabel');if(label)label.textContent=`${state.invoices.length} facturas`;
    const rows=[...state.invoices].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
    document.getElementById('invoicesRows').innerHTML=rows.length?rows.map(invoice=>{
      const legacyCompany=companyById(invoice.companyId);
      const issuerName=invoice.issuerName||invoice.companyName||legacyCompany?.legalName||'Mi empresa';
      const recipientName=invoice.customerName||'Cliente';
      const repair=repairById(invoice.repairId);
      return `<tr><td><span class="table-primary">${escapeHTML(invoice.number)}</span><span class="table-muted">${escapeHTML(invoice.status||'Demo')}</span></td><td>${dateLabel(invoice.issueDate)}</td><td>${escapeHTML(issuerName)}</td><td>${escapeHTML(recipientName)}</td><td>${escapeHTML(repair?`${repair.brand} ${repair.model}`:invoice.description)}</td><td>${money(invoice.base)}</td><td>${money(invoice.tax)} <span class="table-muted">${Number(invoice.vatRate)} %</span></td><td class="amount">${money(invoice.total)}</td><td><button class="icon-action" data-print-invoice="${invoice.id}">Imprimir</button></td></tr>`;
    }).join(''):'<tr><td colspan="9"><div class="empty-state"><div class="empty-icon">▤</div>Todavía no hay facturas. Configura los datos de tu taller (A), crea una empresa cliente (B) y prepara la primera factura.</div></td></tr>';
    const navCount=document.getElementById('navInvoiceCount');if(navCount)navCount.textContent=state.invoices.length;
  }

  function refreshInvoiceSelectors() {
    const companySelect=document.getElementById('invoiceCompany');
    const repairSelect=document.getElementById('invoiceRepair');
    if(companySelect){const old=companySelect.value;companySelect.innerHTML='<option value="">Selecciona la empresa cliente (B)</option>'+state.companies.map(company=>`<option value="${escapeHTML(company.id)}">${escapeHTML(company.legalName)} · ${escapeHTML(company.taxId)}</option>`).join('');companySelect.value=state.companies.some(c=>c.id===old)?old:'';}
    if(repairSelect){const old=repairSelect.value;const invoiced=new Set(state.invoices.map(invoice=>invoice.repairId));const available=sortNewest(state.repairs).filter(repair=>!invoiced.has(repair.id));repairSelect.innerHTML='<option value="">Selecciona una reparación</option>'+available.map(repair=>{const client=clientById(repair.clientId);return `<option value="${escapeHTML(repair.id)}">${escapeHTML(repair.id)} · ${escapeHTML(repair.brand)} ${escapeHTML(repair.model)} · ${escapeHTML(client?.name||'Cliente')} · ${escapeHTML(repair.status)}</option>`;}).join('');repairSelect.value=available.some(repair=>repair.id===old)?old:'';}
    updateInvoiceIssuerPreview();
    updateInvoiceRecipientPreview();
  }
  function updateInvoiceIssuerPreview() {
    const host=document.getElementById('invoiceIssuerPreview');if(!host)return;
    const issuer=getIssuerProfile();
    host.innerHTML=issuer?`<span class="preview-icon">A</span><div><strong>${escapeHTML(issuer.legalName)} · ${escapeHTML(issuer.taxId)}</strong><small>${escapeHTML(fullAddress(issuer))} · ${escapeHTML(issuer.phone||'')}</small></div><button type="button" class="link-button" data-open-modal="issuerModal">Editar</button>`:`<span class="preview-icon">!</span><div><strong>Faltan los datos de tu empresa emisora</strong><small>Configura el perfil A antes de emitir una factura.</small></div>`;
  }
  function updateInvoiceRecipientPreview() {
    const host=document.getElementById('invoiceRecipientPreview');if(!host)return;
    const company=companyById(document.getElementById('invoiceCompany')?.value);
    host.innerHTML=company?`<strong>${escapeHTML(company.legalName)} · ${escapeHTML(company.taxId)}</strong><span>${escapeHTML(fullAddress(company))}</span><small>${escapeHTML(company.phone||'')}${company.email?` · ${escapeHTML(company.email)}`:''}</small>`:'<strong>Datos del destinatario</strong><span>Selecciona una empresa cliente para cargar su NIF y domicilio fiscal.</span>';
  }
  function updateInvoicePreview() {
    const amount=Number(document.getElementById('invoiceAmount')?.value||0);
    const rate=Number(document.getElementById('invoiceVatRate')?.value||21);
    const mode=document.getElementById('invoicePriceMode')?.value||'included';
    const totals=calculateInvoice(amount,rate,mode);
    document.getElementById('invoicePreviewBase').textContent=money(totals.base);
    document.getElementById('invoicePreviewRate').textContent=String(rate).replace('.',',');
    document.getElementById('invoicePreviewTax').textContent=money(totals.tax);
    document.getElementById('invoicePreviewTotal').textContent=money(totals.total);
  }
  function fillInvoiceFromRepair(repairId) {
    const repair=repairById(repairId);if(!repair)return;
    document.getElementById('invoiceDescription').value=`Servicio de reparación: ${repair.brand} ${repair.model} — ${repair.issue}`;
    document.getElementById('invoiceAmount').value=Number(repair.price||0).toFixed(2);
    updateInvoicePreview();
  }
  function openInvoiceCreator() {
    if(!getIssuerProfile()){toast('Primero configura los datos de tu empresa emisora (A).','error');openModal('issuerModal');return;}
    if(!state.companies.length){toast('Primero crea la empresa cliente destinataria (B).','error');openModal('companyModal');return;}
    const outstanding=state.repairs.some(repair=>!state.invoices.some(invoice=>invoice.repairId===repair.id));
    if(!outstanding){toast('No quedan reparaciones sin facturar en esta demo.','error');return;}
    const form=document.getElementById('invoiceForm');form.reset();
    document.getElementById('invoiceIssueDate').value=todayISO();
    document.getElementById('invoiceOperationDate').value=todayISO();
    refreshInvoiceSelectors();
    if(document.getElementById('invoiceRepair').value)fillInvoiceFromRepair(document.getElementById('invoiceRepair').value);
    updateInvoicePreview();openModal('invoiceModal');
  }
  function onCompanySubmit(event) {
    event.preventDefault();const data=Object.fromEntries(new FormData(event.currentTarget).entries());
    const company={id:uid('CUSCO'),legalName:data.legalName.trim(),taxId:data.taxId.trim().toUpperCase(),phone:data.phone.trim(),street:data.street.trim(),streetNumber:data.streetNumber.trim(),postalCode:data.postalCode.trim(),city:data.city.trim(),province:data.province.trim(),country:data.country.trim(),email:data.email.trim(),createdAt:new Date().toISOString(),role:'invoice_recipient'};
    state.companies.push(company);save();event.currentTarget.reset();closeModal(document.getElementById('companyModal'));renderInvoices();refreshInvoiceSelectors();toast(`Empresa cliente ${company.legalName} guardada como destinataria.`);
  }
  function onIssuerSubmit(event) {
    event.preventDefault();const data=Object.fromEntries(new FormData(event.currentTarget).entries());
    const previous=getIssuerProfile();
    state.issuerProfile={id:previous?.id||uid('ISS'),legalName:data.legalName.trim(),taxId:data.taxId.trim().toUpperCase(),phone:data.phone.trim(),street:data.street.trim(),streetNumber:data.streetNumber.trim(),postalCode:data.postalCode.trim(),city:data.city.trim(),province:data.province.trim(),country:data.country.trim(),email:data.email.trim(),updatedAt:new Date().toISOString()};
    save();event.currentTarget.reset();closeModal(document.getElementById('issuerModal'));renderInvoices();refreshInvoiceSelectors();toast('Datos fiscales de tu empresa emisora actualizados.');
  }
  function onInvoiceSubmit(event) {
    event.preventDefault();const data=Object.fromEntries(new FormData(event.currentTarget).entries());
    const issuer=getIssuerProfile(),recipient=companyById(data.recipientCompanyId),repair=repairById(data.repairId);
    if(!issuer){toast('Configura primero tu empresa emisora (A).','error');return;}
    if(!recipient||!repair){toast('Selecciona una empresa cliente (B) y una reparación.','error');return;}
    if(state.invoices.some(invoice=>invoice.repairId===repair.id)){toast('Esta reparación ya tiene una factura en la demo.','error');return;}
    const amount=Number(data.amount);if(!Number.isFinite(amount)||amount<=0){toast('Introduce un importe mayor que cero.','error');return;}
    const rate=Number(data.vatRate);const totals=calculateInvoice(amount,rate,data.priceMode);
    const issuerId=issuer.id||'issuer-main';
    const invoice={
      id:uid('INV'),number:invoiceNumberFor(issuerId,data.issueDate),issuerId,
      issuerName:issuer.legalName,issuerTaxId:issuer.taxId,issuerAddress:fullAddress(issuer),issuerPhone:issuer.phone,issuerEmail:issuer.email,
      recipientCompanyId:recipient.id,customerName:recipient.legalName,customerTaxId:recipient.taxId,customerAddress:fullAddress(recipient),customerPhone:recipient.phone,customerEmail:recipient.email,
      repairId:repair.id,issueDate:data.issueDate,operationDate:data.operationDate,description:data.description.trim(),amount,priceMode:data.priceMode,vatRate:rate,base:totals.base,tax:totals.tax,total:totals.total,status:'Prototipo demo · no fiscal',createdAt:new Date().toISOString()
    };
    state.invoices.push(invoice);save();event.currentTarget.reset();closeModal(document.getElementById('invoiceModal'));renderInvoices();renderDashboard();toast(`Factura de venta ${invoice.number} guardada: ${issuer.legalName} → ${recipient.legalName}.`);printInvoice(invoice.id);
  }
  function printInvoice(id) {
    const invoice=invoiceById(id);if(!invoice)return;
    // Legacy invoices used companyId as the emitter; new ones store immutable issuer/recipient snapshots.
    const legacyCompany=companyById(invoice.companyId)||{};
    const issuerName=invoice.issuerName||invoice.companyName||legacyCompany.legalName||'Emisor';
    const issuerTaxId=invoice.issuerTaxId||invoice.companyTaxId||legacyCompany.taxId||'';
    const issuerAddress=invoice.issuerAddress||invoice.companyAddress||fullAddress(legacyCompany);
    const issuerPhone=invoice.issuerPhone||invoice.companyPhone||legacyCompany.phone||'';
    const issuerEmail=invoice.issuerEmail||invoice.companyEmail||legacyCompany.email||'';
    const recipientName=invoice.customerName||'Destinatario';
    const recipientTaxId=invoice.customerTaxId||'';
    const recipientAddress=invoice.customerAddress||'';
    const repair=repairById(invoice.repairId);
    const printWindow=window.open('','_blank','width=900,height=800');
    if(!printWindow){toast('El navegador ha bloqueado la ventana de impresión. Permite las ventanas emergentes.','error');return;}
    const doc=`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${escapeHTML(invoice.number)} · Sand Desk</title><style>*{box-sizing:border-box}body{font:14px Arial,sans-serif;color:#17202a;margin:0;padding:38px;background:#fff}.sheet{max-width:850px;margin:auto}.top{display:flex;justify-content:space-between;gap:40px;border-bottom:3px solid #7923c7;padding-bottom:25px}.brand{font-size:28px;font-weight:800;letter-spacing:-1px;color:#24142f}.brand b{color:#8b2cce}.muted{color:#647084;font-size:12px;line-height:1.6}.doc-title{text-align:right}.doc-title h1{font-size:30px;margin:0 0 8px;color:#7424b7}.doc-title strong{font-size:16px}.parties{display:grid;grid-template-columns:1fr 1fr;gap:36px;margin:30px 0}.parties h3{font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#7a7185;margin:0 0 10px}.parties strong{display:block;font-size:15px;margin-bottom:5px}.details{display:flex;gap:32px;margin-bottom:20px;color:#465064;font-size:12px}.details b{color:#18202c}.lines{width:100%;border-collapse:collapse;margin-top:15px}.lines th{text-align:left;background:#f2edf7;padding:12px;font-size:11px;text-transform:uppercase;color:#604179}.lines td{padding:16px 12px;border-bottom:1px solid #e6e1eb;font-size:13px}.num{text-align:right;white-space:nowrap}.totals{width:340px;margin:25px 0 0 auto}.total-row{display:flex;justify-content:space-between;padding:8px 0;color:#50596a;font-size:13px}.total-row.final{border-top:2px solid #7b28bd;margin-top:7px;padding-top:14px;font-weight:800;font-size:19px;color:#32194a}.foot{margin-top:55px;border-top:1px solid #ddd5e5;padding-top:15px;color:#9a3944;font-size:11px;text-align:center;line-height:1.6}@media print{body{padding:0}.sheet{max-width:none}}</style></head><body><main class="sheet"><header class="top"><div><div class="brand">Sand <b>Desk</b></div><strong>${escapeHTML(issuerName)}</strong><div class="muted">NIF: ${escapeHTML(issuerTaxId)}<br>${escapeHTML(issuerAddress)}<br>${escapeHTML(issuerPhone)} · ${escapeHTML(issuerEmail)}</div></div><div class="doc-title"><h1>FACTURA</h1><strong>${escapeHTML(invoice.number)}</strong><div class="muted">Fecha de expedición: ${dateLabel(invoice.issueDate)}<br>Fecha de operación: ${dateLabel(invoice.operationDate)}</div></div></header><section class="parties"><div><h3>Emisor · Vendedor (A)</h3><strong>${escapeHTML(issuerName)}</strong><div class="muted">NIF: ${escapeHTML(issuerTaxId)}<br>${escapeHTML(issuerAddress)}</div></div><div><h3>Destinatario · Cliente (B)</h3><strong>${escapeHTML(recipientName)}</strong><div class="muted">NIF: ${escapeHTML(recipientTaxId)}<br>${escapeHTML(recipientAddress)}</div></div></section><div class="details"><span>Orden relacionada: <b>${escapeHTML(invoice.repairId)}</b></span><span>Estado del dispositivo: <b>${escapeHTML(repair?.status||'—')}</b></span></div><table class="lines"><thead><tr><th>Descripción</th><th class="num">Base imponible</th><th class="num">IVA</th><th class="num">Cuota IVA</th></tr></thead><tbody><tr><td>${escapeHTML(invoice.description)}</td><td class="num">${money(invoice.base)}</td><td class="num">${Number(invoice.vatRate).toLocaleString('es-ES')} %</td><td class="num">${money(invoice.tax)}</td></tr></tbody></table><section class="totals"><div class="total-row"><span>Base imponible</span><strong>${money(invoice.base)}</strong></div><div class="total-row"><span>IVA (${Number(invoice.vatRate).toLocaleString('es-ES')} %)</span><strong>${money(invoice.tax)}</strong></div><div class="total-row final"><span>TOTAL</span><strong>${money(invoice.total)}</strong></div></section><footer class="foot"><strong>DOCUMENTO DE DEMOSTRACIÓN · NO VÁLIDO COMO FACTURA FISCAL</strong><br>Este prototipo no genera registros de facturación, huellas, códigos QR ni comunicación con la AEAT.</footer></main><script>window.onload=()=>window.print();</script></body></html>`;
    printWindow.document.open();printWindow.document.write(doc);printWindow.document.close();
  }

  function renderAll() {
    renderDashboard();renderRepairs();renderClients();renderInventory();renderAppointments();renderTickets();renderAnalytics();renderInvoices();
  }

  function showRepairDetail(id) {
    const r=repairById(id); if(!r)return;currentRepairId=id;const c=clientById(r.clientId);
    document.getElementById('detailTitle').textContent=`Orden ${r.id}`;document.getElementById('detailSubtitle').textContent=`${r.brand} ${r.model} · ${c?.name||'Cliente'}`;
    document.getElementById('detailContent').innerHTML=`
      <div class="detail-box"><small>CLIENTE</small><strong>${escapeHTML(c?.name||'Cliente')}</strong></div>
      <div class="detail-box"><small>CONTACTO</small><strong>${escapeHTML(c?.phone||'—')}</strong></div>
      <div class="detail-box"><small>DISPOSITIVO</small><strong>${escapeHTML(r.brand)} ${escapeHTML(r.model)}</strong></div>
      <div class="detail-box"><small>ESTADO ACTUAL</small><select id="detailStatus" class="select-control" style="width:100%;margin-top:3px"><option ${r.status==='Recibido'?'selected':''}>Recibido</option><option ${r.status==='En reparación'?'selected':''}>En reparación</option><option ${r.status==='Esperando pieza'?'selected':''}>Esperando pieza</option><option ${r.status==='Listo para entregar'?'selected':''}>Listo para entregar</option><option ${r.status==='Entregado'?'selected':''}>Entregado</option></select></div>
      <div class="detail-box"><small>REPARACIÓN SOLICITADA</small><strong>${escapeHTML(r.issue)}</strong></div>
      <div class="detail-box"><small>PRESUPUESTO · PAGADO</small><strong>${money(r.price)} · ${money(r.paid||0)}</strong></div>
      <div class="detail-box"><small>FECHA DE ENTRADA</small><strong>${dateTimeLabel(r.createdAt)}</strong></div>
      <div class="detail-box"><small>ANTICIPO</small><strong>${money(r.deposit||0)}</strong></div>
      <div class="detail-box wide"><small>ACCESORIOS / OBSERVACIONES</small><strong>${escapeHTML([r.accessories,r.notes].filter(Boolean).join(' · ')||'Sin observaciones')}</strong></div>`;
    document.getElementById('detailDeliver').style.display=r.status==='Entregado'?'none':'inline-flex';
    openModal('detailModal');
  }

  function printTicket(id) {
    const r=repairById(id);if(!r)return;const c=clientById(r.clientId)||{};const printWindow=window.open('','_blank','width=440,height=720');
    if(!printWindow){toast('El navegador ha bloqueado la ventana de impresión. Permite las ventanas emergentes.','error');return;}
    const ticket=`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Ticket ${r.id} · Sand Desk</title><style>body{font-family:Arial,sans-serif;color:#111;margin:0;padding:24px}.ticket{max-width:360px;margin:auto}.brand{text-align:center;font-size:19px;font-weight:800;letter-spacing:-.7px;margin-bottom:4px}.brand b{color:#8625cf}.sub{text-align:center;color:#666;font-size:11px;margin-bottom:17px}.rule{border-top:1px dashed #777;margin:13px 0}.title{text-align:center;font-weight:700;font-size:14px}.row{display:flex;justify-content:space-between;gap:12px;font-size:11px;margin:8px 0}.label{color:#666}.value{text-align:right;font-weight:600}.block{font-size:11px;line-height:1.55}.foot{text-align:center;font-size:10px;color:#555;line-height:1.5;margin-top:20px}</style></head><body><div class="ticket"><div class="brand">Sand <b>Desk</b></div><div class="sub">Servicio técnico · Comprobante de recepción</div><div class="rule"></div><div class="title">ORDEN ${escapeHTML(r.id)}</div><div class="row"><span class="label">Fecha</span><span class="value">${dateTimeLabel(r.createdAt)}</span></div><div class="row"><span class="label">Estado</span><span class="value">${escapeHTML(r.status)}</span></div><div class="rule"></div><div class="row"><span class="label">Cliente</span><span class="value">${escapeHTML(c.name||'')}</span></div><div class="row"><span class="label">Teléfono</span><span class="value">${escapeHTML(c.phone||'')}</span></div><div class="row"><span class="label">Dispositivo</span><span class="value">${escapeHTML(r.brand)} ${escapeHTML(r.model)}</span></div><div class="row"><span class="label">Problema</span><span class="value">${escapeHTML(r.issue)}</span></div><div class="row"><span class="label">Accesorios</span><span class="value">${escapeHTML(r.accessories||'—')}</span></div><div class="row"><span class="label">Presupuesto</span><span class="value">${money(r.price)}</span></div><div class="row"><span class="label">Anticipo</span><span class="value">${money(r.deposit||0)}</span></div><div class="row"><span class="label">Pendiente</span><span class="value">${money(Math.max(0,(r.price||0)-(r.paid||0)))}</span></div><div class="rule"></div><div class="block"><b>Observaciones:</b><br>${escapeHTML(r.notes||'Sin observaciones')}</div><div class="rule"></div><div class="foot">Este documento es un comprobante de servicio y recepción.<br>No es una factura fiscal.<br>Gracias por confiar en nosotros.</div></div><script>window.onload=()=>{window.print();};</script></body></html>`;
    printWindow.document.open();printWindow.document.write(ticket);printWindow.document.close();
  }

  function onRepairSubmit(event) {
    event.preventDefault();const data=Object.fromEntries(new FormData(event.currentTarget).entries());
    if(!data.clientId){toast('Selecciona un cliente antes de continuar.','error');return;}
    const price=Math.max(0,Number(data.price)||0);const deposit=Math.max(0,Number(data.deposit)||0);
    if(deposit>price){toast('El anticipo no puede superar el presupuesto.','error');return;}
    const id=`SD-${String(Math.max(1048,...state.repairs.map(r=>Number(String(r.id).split('-').pop())||0))+1).padStart(4,'0')}`;
    const now=new Date().toISOString();
    state.repairs.unshift({id,clientId:data.clientId,brand:data.brand,model:data.model.trim(),issue:data.issue.trim(),status:data.status,price,deposit,paid:deposit,accessories:data.accessories.trim(),notes:data.notes.trim(),createdAt:now,updatedAt:now});save();event.currentTarget.reset();event.currentTarget.querySelector('[name="deposit"]').value='0';closeModal(document.getElementById('repairModal'));renderAll();toast(`Entrada ${id} registrada correctamente.`);printTicket(id);
  }

  function onClientSubmit(event) {
    event.preventDefault();const data=Object.fromEntries(new FormData(event.currentTarget).entries());
    const client={id:uid('CL'),name:data.name.trim(),phone:data.phone.trim(),email:data.email.trim(),taxId:(data.taxId||'').trim(),address:(data.address||'').trim(),postalCode:(data.postalCode||'').trim(),city:(data.city||'').trim(),province:(data.province||'').trim(),notes:data.notes.trim(),createdAt:new Date().toISOString()};
    state.clients.unshift(client);save();event.currentTarget.reset();clientOptions(client.id);closeModal(document.getElementById('clientModal'));renderAll();
    const repairClient=document.getElementById('repairClient');if(repairClient&&document.getElementById('repairModal').classList.contains('open'))repairClient.value=client.id;
    const appointmentClient=document.getElementById('appointmentClient');if(appointmentClient&&document.getElementById('appointmentModal').classList.contains('open'))appointmentClient.value=client.id;
    toast(`Cliente ${client.name} añadido.`);
  }

  function onProductSubmit(event) {
    event.preventDefault();const d=Object.fromEntries(new FormData(event.currentTarget).entries());
    const product={id:uid('IN'),name:d.name.trim(),sku:d.sku.trim(),category:d.category,stock:Math.max(0,Number(d.stock)||0),minimum:Math.max(0,Number(d.minimum)||0),cost:Math.max(0,Number(d.cost)||0),price:Math.max(0,Number(d.price)||0)};
    state.inventory.unshift(product);if(product.stock)state.movements.push({id:uid('MV'),productId:product.id,delta:product.stock,note:'Stock inicial',date:new Date().toISOString()});save();event.currentTarget.reset();closeModal(document.getElementById('productModal'));renderAll();toast('Producto añadido al inventario.');
  }

  function onAppointmentSubmit(event) {
    event.preventDefault();const d=Object.fromEntries(new FormData(event.currentTarget).entries());
    state.appointments.push({id:uid('AP'),clientId:d.clientId,date:d.date,time:d.time,device:d.device.trim(),reason:d.reason.trim(),status:'Pendiente'});save();event.currentTarget.reset();closeModal(document.getElementById('appointmentModal'));renderAll();toast('Cita guardada en la agenda.');
  }

  function updateStock(productId,delta) {
    const product=state.inventory.find(p=>p.id===productId);if(!product)return;
    if(delta<0&&product.stock<Math.abs(delta)){toast('No hay unidades suficientes en stock.','error');return;}
    product.stock+=delta;state.movements.push({id:uid('MV'),productId,delta,note:delta>0?'Entrada manual de stock':'Salida manual de stock',date:new Date().toISOString()});save();renderInventory();renderDashboard();toast(`Stock actualizado: ${product.name}.`);
  }

  function deliverRepair() {
    const r=repairById(currentRepairId);if(!r)return;
    const now=new Date().toISOString();r.status='Entregado';r.paid=Number(r.price)||0;r.updatedAt=now;r.deliveredAt=now;save();closeModal(document.getElementById('detailModal'));renderAll();toast(`Salida registrada para ${r.id}.`);printTicket(r.id);
  }

  function exportData() {
    const blob=new Blob([JSON.stringify({...state,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`sand-desk-backup-${todayISO()}.json`;a.click();URL.revokeObjectURL(url);toast('Copia de seguridad descargada.');
  }

  function populateIssuerForm() {
    const form=document.getElementById('issuerForm');if(!form)return;
    const issuer=getIssuerProfile();
    form.reset();
    if(!issuer)return;
    for(const [key,value] of Object.entries(issuer)){
      const field=form.elements.namedItem(key);
      if(field && typeof value==='string')field.value=value;
    }
  }

  document.addEventListener('click',event=>{
    const nav=event.target.closest('[data-view]');if(nav){goTo(nav.dataset.view);return;}
    const goto=event.target.closest('[data-goto]');if(goto){goTo(goto.dataset.goto);return;}
    const open=event.target.closest('[data-open-modal]');if(open){if(open.dataset.openModal==='appointmentModal')clientOptions();if(open.dataset.openModal==='issuerModal')populateIssuerForm();openModal(open.dataset.openModal);return;}
    const action=event.target.closest('[data-action]');if(action){if(action.dataset.action==='new-invoice')openInvoiceCreator();return;}
    const invoicePrint=event.target.closest('[data-print-invoice]');if(invoicePrint){printInvoice(invoicePrint.dataset.printInvoice);return;}
    const close=event.target.closest('[data-close-modal]');if(close){closeModal(close.closest('.modal-backdrop'));return;}
    const modalBg=event.target.classList?.contains('modal-backdrop');if(modalBg){closeModal(event.target);return;}
    const detail=event.target.closest('[data-detail]');if(detail){showRepairDetail(detail.dataset.detail);return;}
    const print=event.target.closest('[data-print]');if(print){printTicket(print.dataset.print);return;}
    const stock=event.target.closest('[data-stock]');if(stock){updateStock(stock.dataset.stock,Number(stock.dataset.delta));return;}
    const done=event.target.closest('[data-appointment-done]');if(done){const ap=state.appointments.find(a=>a.id===done.dataset.appointmentDone);if(ap){ap.status='Completada';save();renderAppointments();toast('Cita marcada como completada.');}return;}
    const client=event.target.closest('[data-client]');if(client){const c=clientById(client.dataset.client);if(c){const records=state.repairs.filter(r=>r.clientId===c.id);const summary=records.length?records.map(r=>`${r.id}: ${r.brand} ${r.model} · ${r.status} · ${money(r.price)}`).join('\n'):'Sin reparaciones todavía.';alert(`${c.name}\n${c.phone}\n${c.email||''}\n\nHISTORIAL\n${summary}`);}return;}
  });
  document.getElementById('repairForm').addEventListener('submit',onRepairSubmit);
  document.getElementById('clientForm').addEventListener('submit',onClientSubmit);
  document.getElementById('productForm').addEventListener('submit',onProductSubmit);
  document.getElementById('appointmentForm').addEventListener('submit',onAppointmentSubmit);
  document.getElementById('companyForm').addEventListener('submit',onCompanySubmit);
  document.getElementById('issuerForm').addEventListener('submit',onIssuerSubmit);
  document.getElementById('invoiceForm').addEventListener('submit',onInvoiceSubmit);
  document.getElementById('invoiceRepair').addEventListener('change',event=>fillInvoiceFromRepair(event.target.value));
  document.getElementById('invoiceCompany').addEventListener('change',updateInvoiceRecipientPreview);
  ['invoiceAmount','invoiceVatRate','invoicePriceMode'].forEach(id=>document.getElementById(id).addEventListener('input',updateInvoicePreview));
  ['invoiceVatRate','invoicePriceMode'].forEach(id=>document.getElementById(id).addEventListener('change',updateInvoicePreview));
  document.getElementById('repairSearch').addEventListener('input',renderRepairs);
  document.getElementById('repairFilter').addEventListener('change',renderRepairs);
  document.getElementById('clientSearch').addEventListener('input',renderClients);
  document.getElementById('inventorySearch').addEventListener('input',renderInventory);
  document.getElementById('stockFilter').addEventListener('change',renderInventory);
  document.getElementById('detailPrint').addEventListener('click',()=>printTicket(currentRepairId));
  document.getElementById('detailDeliver').addEventListener('click',deliverRepair);
  document.getElementById('detailContent').addEventListener('change',event=>{if(event.target.id==='detailStatus'){const r=repairById(currentRepairId);if(!r)return;const nextStatus=event.target.value;const now=new Date().toISOString();r.status=nextStatus;r.updatedAt=now;if(nextStatus==='Entregado'){r.paid=Number(r.price)||0;r.deliveredAt=now;}else if(nextStatus!=='Entregado'&&r.deliveredAt){delete r.deliveredAt;r.paid=Number(r.deposit)||0;}save();renderAll();document.getElementById('detailDeliver').style.display=r.status==='Entregado'?'none':'inline-flex';toast('Estado de reparación actualizado.');}});
  document.getElementById('quickEntryTop').addEventListener('click',()=>openModal('repairModal'));
  document.getElementById('exportData').addEventListener('click',exportData);
  document.getElementById('resetDemo').addEventListener('click',()=>{const message=cloudUser?'¿Quieres vaciar todos los datos de este espacio en la nube? Esta acción no se puede deshacer.':'¿Quieres restablecer todos los datos de ejemplo? Se perderán los cambios guardados en este navegador.';if(confirm(message)){state=cloudUser?makeEmptyState():makeSeed();save();renderAll();toast(cloudUser?'Espacio de trabajo vaciado.':'Datos de ejemplo restaurados.');}});
  document.getElementById('mobileMenu').addEventListener('click',()=>{document.getElementById('appSidebar').classList.add('open');document.getElementById('sidebarScrim').classList.add('open');});
  document.getElementById('sidebarScrim').addEventListener('click',()=>{document.getElementById('appSidebar').classList.remove('open');document.getElementById('sidebarScrim').classList.remove('open');});
  document.addEventListener('keydown',event=>{if(event.key==='Escape')document.querySelectorAll('.modal-backdrop.open').forEach(closeModal);});



  const authForm = document.getElementById('cloudAuthForm');
  if (authForm) authForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (!cloudClient) { showAuthGate('Configura primero la URL y la clave pública de Supabase.'); return; }
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const submit = document.getElementById('authSubmit');
    const message = document.getElementById('authMessage');
    submit.disabled = true; submit.textContent = authMode === 'signup' ? 'Creando cuenta…' : 'Entrando…';
    message.textContent = '';
    try {
      if (authMode === 'signup') {
        const {data:result,error} = await cloudClient.auth.signUp({
          email:data.email.trim(), password:data.password,
          options:{data:{business_name:(data.businessName||'').trim()}}
        });
        if (error) throw error;
        if (result.session?.user) await activateCloudUser(result.session.user);
        else message.textContent = 'Cuenta creada. Revisa tu correo para confirmar la dirección y después inicia sesión.';
      } else {
        const {data:result,error} = await cloudClient.auth.signInWithPassword({email:data.email.trim(),password:data.password});
        if (error) throw error;
        if (result.user) await activateCloudUser(result.user);
      }
    } catch (error) {
      message.textContent = error.message || 'No se pudo completar el acceso.';
    } finally {
      submit.disabled = false;
      submit.textContent = authMode === 'signup' ? 'Crear cuenta' : 'Iniciar sesión';
    }
  });
  document.getElementById('authSwitch')?.addEventListener('click',()=>configureAuthMode(authMode==='signin'?'signup':'signin'));
  document.getElementById('cloudSignOut')?.addEventListener('click',async()=>{
    if (!cloudClient || !cloudUser) return;
    await flushCloudSave();
    const {error}=await cloudClient.auth.signOut();
    if(error) toast(`No se pudo cerrar sesión: ${error.message}`,'error');
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden && cloudUser) flushCloudSave();});

  if (migrateLegacyCompanyRecords()) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
  }
  renderAll();clientOptions();refreshInvoiceSelectors();
  initializeCloudStorage().catch(error=>{console.error('Error inicializando Supabase:',error);showAuthGate('No se pudo conectar con la base de datos. Comprueba la configuración de Supabase.');});
  const params=new URLSearchParams(window.location.search);const plan=params.get('plan');if(plan){toast(`Estás probando Sand Desk ${plan}. ¡Explora todas las funciones!`);}
})();
