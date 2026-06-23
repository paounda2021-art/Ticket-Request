let ticketDetailMap = {};
  const API = "https://script.google.com/macros/s/AKfycbyGJV4SEkFjKmc2zaE8e0iM_u6rllft_ciKrw3KGOvvnETI9GJupSgYW3tM6zzmpgk8/exec";
  let currentUser = "";
  let currentQueueToClose = "";
  let currentLoginName = "";

  const Toast = Swal.mixin({
    toast: true, position: 'top-end', showConfirmButton: false, timer: 2500,
    background: '#FFF8F0', color: '#B45309', width: '280px'
  });
  function showToast(icon, title) { Toast.fire({ icon, title }); }

  // ── Responsive layout ──────────────────────────────────
  function applyResponsiveLayout() {
    const isMobile    = window.innerWidth <= 600;
    const desktopTable = document.querySelector('.desktop-table');
    const desktopBtns  = document.querySelectorAll('.desktop-btn');
    const mobileList   = document.getElementById('mobileTicketList');
    if (isMobile) {
      if (desktopTable) desktopTable.style.display = 'none';
      desktopBtns.forEach(b => b.style.display = 'none');
      if (mobileList) mobileList.style.display = 'block';
    } else {
      if (desktopTable) desktopTable.style.display = 'block';
      desktopBtns.forEach(b => b.style.display = 'block');
      if (mobileList) mobileList.style.display = 'none';
    }
  }
  window.addEventListener('resize', applyResponsiveLayout);

  function toggleSystemInput() {
    const container = document.getElementById('system_name_container');
    container.style.display = document.getElementById('check_systems').checked ? 'block' : 'none';
  }

  function logout() {
    currentUser = "";
    currentLoginName = "";
    sessionStorage.removeItem('ticket_username');
    sessionStorage.removeItem('ticket_password');
    sessionStorage.removeItem('ticket_active_view');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    switchView('loginBox');
    showToast('info', 'ออกจากระบบเรียบร้อย');
  }

  function toggleTicketForm(show) {
    document.getElementById('ticketFormSection').style.display = show ? 'block' : 'none';
    document.getElementById('btnShowForm').style.display = show ? 'none' : 'block';
  }

  function switchView(viewId) {
    ['loginBox','newUserBox','userBox','adminBox'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    });
    const target = document.getElementById(viewId);
    if (target) {
      target.classList.remove('hidden');
      sessionStorage.setItem('ticket_active_view', viewId);
    } else {
      console.error('switchView: ไม่พบ ID: ' + viewId);
    }
  }

  function toggleNewUserButton() {
    const btn = document.getElementById('btnNewUser');
    if (btn) {
      btn.style.display = (btn.style.display === 'none' || btn.style.display === '') ? 'block' : 'none';
    }
  }

  // ── Login ────────────────────────────────────────────────
  async function login() {
    const uEl = document.getElementById('username');
    const pEl = document.getElementById('password');
    const btn = document.getElementById('btnLogin');
    const u = uEl.value.trim();
    const p = pEl.value.trim();

    const styleCutePopup = () => {
      const popup = Swal.getPopup(); if (!popup) return;
      popup.style.setProperty('width','260px','important');
      popup.style.setProperty('max-width','260px','important');
      popup.style.setProperty('border-radius','16px','important');
      popup.style.setProperty('padding','1.5em 1em 1em 1em','important');
      const icon = popup.querySelector('.swal2-icon');
      if (icon){icon.style.transform='scale(0.6)';icon.style.margin='0 auto -10px auto';}
      const title = popup.querySelector('.swal2-title');
      if (title){title.style.setProperty('font-size','16px','important');title.style.setProperty('margin-bottom','5px','important');}
      const textEl = popup.querySelector('.swal2-html-container');
      if (textEl){textEl.style.setProperty('font-size','13px','important');textEl.style.setProperty('line-height','1.5','important');}
      const btnC = popup.querySelector('.swal2-confirm');
      if (btnC){btnC.style.setProperty('border-radius','20px','important');btnC.style.setProperty('padding','6px 24px','important');btnC.style.setProperty('font-size','13px','important');btnC.style.setProperty('width','100px','important');}
    };

    if (!u || !p) {
      return Swal.fire({ icon:'warning', title:'ข้อมูลไม่ครบถ้วน', text:'กรุณาใส่ชื่อผู้ใช้และรหัสผ่านให้ครบถ้วนค่ะ', confirmButtonText:'ตกลง', confirmButtonColor:'#b39ddb', didOpen:styleCutePopup });
    }

    btn.innerText = "กำลังตรวจสอบ...";
    btn.disabled  = true;

    try {
      const response = await fetch(API, { method:'POST', body:JSON.stringify({ action:'login', username:u, password:p }) });
      const res = await response.json();

      if (res.status === 'success') {
        currentUser      = res.name || u;
        currentLoginName = u;
        const userRole   = (res.role || 'user').trim().toLowerCase();

        sessionStorage.setItem('ticket_username', u);
        sessionStorage.setItem('ticket_password', p);

        if (userRole === 'admin') {
          // ── Admin path ──────────────────────────────────
          document.getElementById('displayAdmin').innerText = currentUser;
          switchView('adminBox');
          loadAdminTickets();
          const switchBtn = document.getElementById('switch-view-btn');
          if (switchBtn) {
            switchBtn.style.display = 'inline-block';
            document.getElementById('switch-text').innerText = 'สลับ User';
            switchBtn.style.setProperty('background','#9575cd','important');
          }
          const btnToAdmin = document.getElementById('switch-to-admin-btn');
          if (btnToAdmin) btnToAdmin.style.display = 'none';

        } else {
          // ── User path ──────────────────────────────────
          const finalizeUserEntry = () => {
            document.getElementById('displayUser').innerText = currentUser;
            const loginName = u.trim();
            const emailInput = document.getElementById('user_email');
            emailInput.value = loginName.includes('@') ? loginName : loginName + '@fishmarket.co.th';
            emailInput.readOnly = true;
            emailInput.style.backgroundColor = '#e9ecef';
            emailInput.style.cursor = 'not-allowed';
            switchView('userBox');
            loadUserTickets();
          };

          if (document.getElementById('switch-view-btn'))    document.getElementById('switch-view-btn').style.display    = 'none';
          if (document.getElementById('switch-to-admin-btn')) document.getElementById('switch-to-admin-btn').style.display = 'none';

          try {
            const ratingResp = await fetch(API, { method:'POST', body:JSON.stringify({ action:'check_rating', username:u }) });
            const pendingList = await ratingResp.json();
            if (pendingList && pendingList.length > 0) {
              let idx = 0;
              const processNext = () => {
                if (idx < pendingList.length) {
                  showRatingPopup(pendingList[idx], true, pendingList[idx].queue, () => { idx++; processNext(); });
                } else {
                  finalizeUserEntry();
                }
              };
              processNext();
            } else {
              finalizeUserEntry();
            }
          } catch (ratingErr) {
            console.error('Rating check error:', ratingErr);
            finalizeUserEntry();
          }
        }
      } else {
        Swal.fire({ icon:'error', title:'เข้าสู่ระบบไม่สำเร็จ', text:'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้องค่ะ', confirmButtonText:'ลองใหม่', confirmButtonColor:'#ffab91', didOpen:styleCutePopup });
      }
    } catch (error) {
      Swal.fire({ icon:'error', title:'ข้อผิดพลาด', text:'เชื่อมต่อล้มเหลว กรุณาลองใหม่ค่ะ', confirmButtonText:'ตกลง', confirmButtonColor:'#ffab91', didOpen:styleCutePopup });
    } finally {
      btn.innerText = "เข้าสู่ระบบ";
      btn.disabled  = false;
    }
  }

  // ── New user submission ─────────────────────────────────
  async function submitNewUser(event) {
    if (event) event.preventDefault();
    const nameInput        = document.getElementById('new_name').value.trim();
    const nameEnInput      = document.getElementById('new_name_en').value.trim();
    const deptInput        = document.getElementById('new_dept').value.trim();
    const detailInput      = document.getElementById('new_detail').value.trim();
    const emailInput       = document.getElementById('new_email').value.trim();
    const managerEmailInput = document.getElementById('new_manager_email').value.trim();
    const pdpaChecked      = document.getElementById('pdpa_check').checked;

    let selectedSystems = [];
    if (document.getElementById('check_email').checked) selectedSystems.push('e-Mail');
    if (document.getElementById('check_systems').checked) {
      const sysDetail = document.getElementById('new_system_detail').value.trim();
      selectedSystems.push(sysDetail ? `Systems (${sysDetail})` : 'Systems');
    }
    const systemValue = selectedSystems.join(', ');

    const showValidationError = (iconType, titleText, descText) => Swal.fire({
      icon:iconType, title:titleText, text:descText, width:'250px',
      confirmButtonText:'ตกลง', confirmButtonColor:'#b39ddb',
      didOpen: () => {
        const popup = Swal.getPopup(); if (!popup) return;
        popup.style.setProperty('border-radius','16px','important');
        const title = popup.querySelector('.swal2-title');
        if (title) title.style.setProperty('font-size','16px','important');
      }
    });

    if (!nameInput||!nameEnInput||!deptInput||selectedSystems.length===0||!detailInput||!emailInput||!managerEmailInput)
      return showValidationError('warning','ข้อมูลไม่ครบถ้วน','กรุณากรอกข้อมูลที่มีเครื่องหมาย * ให้ครบทุกช่อง และเลือกอย่างน้อย 1 ระบบนะคะ');
    if (!/^[ก-๙\s]+$/.test(nameInput))
      return showValidationError('error','ภาษาไม่ถูกต้อง','ช่อง "ชื่อ-นามสกุล (ไทย)" กรุณากรอกเฉพาะตัวอักษรภาษาไทยและช่องว่างเท่านั้นค่ะ');
    if (!/^[a-zA-Z\s]+$/.test(nameEnInput))
      return showValidationError('error','ภาษาไม่ถูกต้อง','ช่อง "ชื่อ-นามสกุล (อังกฤษ)" กรุณากรอกเฉพาะตัวอักษรภาษาอังกฤษและช่องว่างเท่านั้นค่ะ');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailInput))
      return showValidationError('error','อีเมลสำรองไม่ถูกต้อง','กรุณากรอกอีเมลสำรองให้ถูกต้อง (เช่น example@gmail.com) ค่ะ');
    if (!emailPattern.test(managerEmailInput))
      return showValidationError('error','อีเมลหัวหน้าไม่ถูกต้อง','กรุณากรอกรูปแบบอีเมลหัวหน้าให้ถูกต้องค่ะ');
    if (!managerEmailInput.toLowerCase().endsWith('@fishmarket.co.th'))
      return showValidationError('warning','อีเมลไม่ถูกต้อง','กรุณาระบุอีเมลหัวหน้างานเป็นอีเมลองค์กร (@fishmarket.co.th) เท่านั้นค่ะ');
    if (!pdpaChecked) return showValidationError('info','ยอมรับเงื่อนไข','กรุณายอมรับ PDPA ก่อนส่งคำขอค่ะ');

    const payload = { action:'request_new_account', name:nameInput, name_en:nameEnInput, dept:deptInput, system:systemValue, detail:detailInput, email:emailInput, manager_email:managerEmailInput, status:'ใหม่' };
    Swal.fire({ title:'กำลังส่งข้อมูล...', allowOutsideClick:false, width:'260px', didOpen:()=>{ Swal.showLoading(); } });

    try {
      const response = await fetch(API, { method:'POST', body:JSON.stringify(payload) });
      const res = await response.json();
      if (res.status === 'success') {
        const ahead = (res.waiting && res.waiting > 0) ? res.waiting - 1 : 0;
        Swal.fire({
          icon:'success', title:'สำเร็จ!',
          html:`<div style="font-size:18px;">คิวของคุณคือ: <b style="color:#0056b3;">${res.queue}</b><br>มีคิวรออยู่ก่อนหน้า: ${ahead} คิว</div>`,
          confirmButtonText:'รับทราบ', width:'250px', customClass:{ confirmButton:'btn-confirm-modern' }
        }).then(() => {
          ['new_name','new_name_en','new_dept','new_email','new_manager_email','new_system_detail','new_detail'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; });
          document.getElementById('check_email').checked    = false;
          document.getElementById('check_systems').checked  = false;
          document.getElementById('pdpa_check').checked     = false;
          const sysContainer = document.getElementById('system_name_container');
          if (sysContainer) sysContainer.style.display = 'none';
          switchView('loginBox');
        });
      }
    } catch (e) {
      Swal.fire({ icon:'error', title:'เกิดข้อผิดพลาด', text:'ไม่สามารถติดต่อเซิร์ฟเวอร์ได้', width:'260px' });
    }
  }

  // ── User ticket submission ───────────────────────────────
  async function submitUserRequest(event) {
    if (event) event.preventDefault();
    const btn       = document.getElementById('btnSubmitUser');
    const typeVal   = document.getElementById('user_type').value;
    const systemVal = document.getElementById('user_system').value.trim();
    const detailVal = document.getElementById('user_detail').value.trim();
    const emailVal  = document.getElementById('user_email').value.trim();

    const styleCutePopup = () => {
      const popup = Swal.getPopup(); if (!popup) return;
      popup.style.setProperty('width','260px','important');
      popup.style.setProperty('border-radius','16px','important');
      popup.style.setProperty('padding','1.5em 1em 1em 1em','important');
      const icon = popup.querySelector('.swal2-icon');
      if (icon){icon.style.transform='scale(0.6)';icon.style.margin='0 auto -10px auto';}
      const title = popup.querySelector('.swal2-title');
      if (title) title.style.setProperty('font-size','16px','important');
      const textEl = popup.querySelector('.swal2-html-container');
      if (textEl) textEl.style.setProperty('font-size','14px','important');
      const btnC = popup.querySelector('.swal2-confirm');
      if (btnC){btnC.style.setProperty('border-radius','20px','important');btnC.style.setProperty('padding','6px 24px','important');btnC.style.setProperty('font-size','13px','important');btnC.style.setProperty('width','100px','important');}
    };

    if (!typeVal||!systemVal||!detailVal||!emailVal)
      return Swal.fire({ icon:'warning', title:'ข้อมูลไม่ครบ', text:'กรุณากรอกข้อมูลในช่องที่มีเครื่องหมาย * ให้ครบทุกช่องค่ะ', confirmButtonText:'ตกลง', confirmButtonColor:'#b39ddb', didOpen:styleCutePopup });

    const payload = { action:'create_ticket', username:document.getElementById('username').value.trim(), type:typeVal, system:systemVal, detail:detailVal, email:emailVal };
    Swal.fire({ title:'กำลังส่งข้อมูล...', allowOutsideClick:false, didOpen:()=>{ Swal.showLoading(); styleCutePopup(); } });
    btn.innerText = "กำลังส่ง...";
    btn.disabled  = true;

    try {
      const response = await fetch(API, { method:'POST', body:JSON.stringify(payload) });
      const res = await response.json();
      if (res.status === 'success') {
        document.getElementById('user_system').value = '';
        document.getElementById('user_detail').value = '';
        const currentLoginName = document.getElementById('username').value.trim();
        if (currentLoginName) {
          document.getElementById('user_email').value = currentLoginName.includes('@') ? currentLoginName : currentLoginName + '@fishmarket.co.th';
        }
        loadUserTickets();
        const ahead = res.waiting ? res.waiting - 1 : 0;
        Swal.fire({
          icon:'success', title:'สำเร็จ!',
          html:`คิวของคุณคือ: <b style="font-size:18px;color:#0056b3;">${res.queue}</b><br>มีคิวรอก่อนหน้า <span style="color:#dc3545;font-weight:bold;font-size:18px;">${ahead}</span> คิว`,
          confirmButtonText:'ตกลง', confirmButtonColor:'#81c784', didOpen:styleCutePopup
        });
      }
    } catch (e) {
      Swal.fire({ icon:'error', title:'เกิดข้อผิดพลาด', text:'ไม่สามารถติดต่อเซิร์ฟเวอร์ได้', confirmButtonText:'ตกลง', confirmButtonColor:'#ffab91', didOpen:styleCutePopup });
    } finally {
      btn.innerText = "ส่งข้อมูล";
      btn.disabled  = false;
    }
  }

  // ── Load user tickets ─────────────────────────────────────
  async function loadUserTickets() {
    const container = document.getElementById('userTicketList');
    container.innerHTML = 'กำลังโหลดข้อมูล...';
    try {
      const response = await fetch(API, { method:'POST', body:JSON.stringify({ action:'get_user_tickets', username:currentLoginName }) });
      const tickets  = await response.json();
      if (tickets.length === 0) {
        container.innerHTML = '<span style="color:#28a745;">✅ ตอนนี้คุณไม่มีเคสค้างรอดำเนินการค่ะ</span>';
        toggleTicketForm(true);
        return;
      }
      let html = '';
      tickets.forEach(t => {
        const isWaiting   = t.status === 'รอดำเนินการ' || t.status === 'ใหม่';
        const statusColor = isWaiting ? '#ff9800' : '#007bff';
        const statusIcon  = isWaiting ? '🕐' : '⚙️';
        const aheadText   = t.ahead > 0 ? `รออีก ${t.ahead} คิว` : (isWaiting ? 'ถึงคิวของคุณแล้ว รอเจ้าหน้าที่ประสาน' : 'กำลังดำเนินการแก้ไขเคส');
        
        html += `<div style="padding:10px 0;border-bottom:1px dashed #ccc;display:flex;justify-content:space-between;align-items:center;">
          <div style="flex:1;padding-right:10px;">
            <strong style="color:#333;">${t.queue}</strong> : ${t.system}
            <div style="font-size:11px;color:${isWaiting ? '#dc3545' : '#28a745'};margin-top:2px;">${statusIcon} ${aheadText}</div>
          </div>
          <div style="text-align:right;display:flex;flex-direction:column;align-items:flex-end;gap:5px;">
            <span style="color:${statusColor};font-weight:bold;font-size:13px;">${t.status}</span>
            <button onclick="cancelTicketByUser('${t.queue}', '${(t.system || '').replace(/'/g, "\\'")}')" style="padding:4px 8px;font-size:11px;background:#ffab91;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:bold;transition:0.2s;width:auto;margin:0;" onmouseover="this.style.background='#e64a19'" onmouseout="this.style.background='#ffab91'">ยกเลิกเคส</button>
          </div>
        </div>`;
      });
      container.innerHTML = html;
      toggleTicketForm(false);
    } catch (e) {
      container.innerHTML = '❌ โหลดข้อมูลไม่สำเร็จ';
    }
  }

  // ── User cancels their own ticket ─────────────────────────
  async function cancelTicketByUser(queue, systemName) {
    const styleCutePopup = () => {
      const popup = Swal.getPopup(); if (!popup) return;
      popup.style.setProperty('width','280px','important');
      popup.style.setProperty('max-width','280px','important');
      popup.style.setProperty('border-radius','16px','important');
      popup.style.setProperty('padding','1.5em 1em 1em 1em','important');
      const icon = popup.querySelector('.swal2-icon');
      if (icon){icon.style.transform='scale(0.65)';icon.style.margin='0 auto -10px auto';}
      const title = popup.querySelector('.swal2-title');
      if (title) title.style.setProperty('font-size','15.5px','important');
      const textEl = popup.querySelector('.swal2-html-container');
      if (textEl) textEl.style.setProperty('font-size','13px','important');
      const btnConfirm = popup.querySelector('.swal2-confirm');
      if (btnConfirm){btnConfirm.style.setProperty('border-radius','20px','important');btnConfirm.style.setProperty('padding','6px 20px','important');btnConfirm.style.setProperty('font-size','13px','important');}
      const btnCancel = popup.querySelector('.swal2-cancel');
      if (btnCancel){btnCancel.style.setProperty('border-radius','20px','important');btnCancel.style.setProperty('padding','6px 20px','important');btnCancel.style.setProperty('font-size','13px','important');}
    };

    const { value: reason } = await Swal.fire({
      title: '🚨 ยกเลิกคำขอแจ้งปัญหา',
      html: `<div style="font-size:13px;color:#666;margin-bottom:10px;">คิว <b>${queue}</b> (${systemName})</div>`,
      input: 'textarea',
      inputPlaceholder: 'กรุณาระบุเหตุผลการยกเลิก (เช่น แก้ไขได้เองแล้ว)...',
      showCancelButton: true,
      confirmButtonText: 'ยืนยันยกเลิก',
      cancelButtonText: 'ปิดหน้าต่าง',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      width: '280px',
      didOpen: styleCutePopup,
      preConfirm: (value) => {
        if (!value || value.trim() === '') {
          Swal.showValidationMessage('กรุณาระบุเหตุผลในการยกเลิกด้วยค่ะ');
          return false;
        }
        return value;
      }
    });

    if (reason) {
      Swal.fire({ title: 'กำลังบันทึกข้อมูล...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); styleCutePopup(); } });
      try {
        const response = await fetch(API, {
          method: 'POST',
          body: JSON.stringify({ action: 'cancel_ticket', queue, reason })
        });
        const result = await response.json();
        if (result.status === 'success') {
          Swal.fire({
            icon: 'success',
            title: 'ยกเลิกเคสสำเร็จ',
            text: 'ระบบได้ทำการยกเลิกเคสและส่งอีเมลแจ้งไอทีเรียบร้อยแล้วค่ะ',
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#28a745',
            width: '260px',
            didOpen: styleCutePopup
          }).then(() => {
            loadUserTickets();
          });
        } else {
          Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: result.message || 'ไม่สามารถยกเลิกเคสได้', confirmButtonText: 'ตกลง', confirmButtonColor: '#dc3545', width: '260px', didOpen: styleCutePopup });
        }
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'การเชื่อมต่อผิดพลาด', text: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ค่ะ', confirmButtonText: 'ตกลง', confirmButtonColor: '#dc3545', width: '260px', didOpen: styleCutePopup });
      }
    }
  }

  // ── Date helper ──────────────────────────────────────────
  function parseThaiDateToStandard(dateString) {
    if (!dateString) return new Date();
    const str = String(dateString).trim();
    if (str.includes('/')) {
      const parts    = str.split(' ');
      const dateParts = parts[0].split('/');
      const timeStr  = parts.length > 1 ? parts[1] : '00:00:00';
      return new Date(`${dateParts[2]}/${dateParts[1]}/${dateParts[0]} ${timeStr}`);
    }
    return new Date(str);
  }

  // ── ✅ FIX 2: Load admin tickets + stats ─────────────────
  async function loadAdminTickets() {
    applyResponsiveLayout();

    // ดึงยอด 4 การ์ด (non-blocking)
    fetch(API, { method:'POST', body:JSON.stringify({ action:'get_stats' }) })
      .then(r => r.json())
      .then(stats => {
        document.getElementById('countPending').innerText   = stats.pending            ?? 0;
        document.getElementById('countProgress').innerText  = stats.inProgress         ?? 0;
        document.getElementById('countCompleted').innerText = stats.completedThisMonth ?? 0;
        document.getElementById('countTotal').innerText     = stats.total              ?? 0;
      })
      .catch(e => console.error('Stats error:', e));

    const isMobile   = window.innerWidth <= 600;
    const tbody      = document.getElementById('ticketBody');
    const mobileList = document.getElementById('mobileTicketList');
    tbody.innerHTML  = '<tr><td colspan="6" class="text-center">กำลังโหลด...</td></tr>';
    if (isMobile && mobileList) mobileList.innerHTML = '<p style="text-align:center;color:#999;">กำลังโหลด...</p>';

    try {
      const response = await fetch(API, { method:'POST', body:JSON.stringify({ action:'list_tickets' }) });
      const tickets  = await response.json();

      if (!tickets || tickets.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center" style="color:#999;">ไม่มีงานค้างอยู่</td></tr>';
        if (mobileList) mobileList.innerHTML = '<p style="text-align:center;color:#999;">ไม่มีงานค้างอยู่</p>';
        return;
      }

      let latestTicketTime = 0;
      tickets.forEach(t => {
        const tv = parseThaiDateToStandard(t.timestamp).getTime();
        if (tv > latestTicketTime) latestTicketTime = tv;
      });

      tbody.innerHTML = tickets.map(t => {
        const statusClean  = (t.status || '').trim();
        const isWaiting    = statusClean === 'รอดำเนินการ' || statusClean === 'ใหม่';
        const isProcessing = statusClean === 'กำลังดำเนินการ';
        const isFinished   = statusClean === 'เสร็จสิ้น';

        let statusIcon = '';
        if (isWaiting)    statusIcon = '<i class="fa-solid fa-clock"></i>';
        if (isProcessing) statusIcon = '<i class="fa-solid fa-gear icon-spin"></i>';

        const createTime       = parseThaiDateToStandard(t.timestamp);
        const isAbsoluteLatest = (createTime.getTime() === latestTicketTime);
        const newIconHtml      = (isAbsoluteLatest && isWaiting)
          ? `<span style="background:#ff4d4f;color:white;font-size:10px;padding:2px 6px;border-radius:10px;margin-left:6px;display:inline-block;animation:blink 1.5s infinite;font-weight:bold;vertical-align:middle;">NEW ✨</span>`
          : '';

        const finishTime  = t.finish_timestamp ? parseThaiDateToStandard(t.finish_timestamp) : null;
        const currentTime = new Date();
        let slaText = '', slaStyle = '';

        if (isFinished && finishTime) {
          const timeUsed = (finishTime - createTime) / (1000*60*60);
          slaText  = `⏱️ ใช้เวลา: ${timeUsed.toFixed(1)} ชม.`;
          slaStyle = timeUsed > 48 ? 'color:#dc3545;font-weight:bold;' : 'color:#28a745;';
        } else {
          const hoursLeft = 48 - ((currentTime - createTime) / (1000*60*60));
          if (hoursLeft <= 0) {
            slaText  = `🚨 เกิน SLA: ${Math.abs(hoursLeft).toFixed(1)} ชม.`;
            slaStyle = 'color:#dc3545;font-weight:bold;animation:blink 1s infinite;';
          } else {
            slaText  = `⏳ เหลือ: ${hoursLeft.toFixed(1)} ชม.`;
            slaStyle = hoursLeft <= 12 ? 'color:#ff9800;font-weight:bold;' : 'color:#666;';
          }
        }

        const safeName = (t.name || '').replace(/'/g,'');
        ticketDetailMap[t.queue] = t.detail || '-';

        return `<tr>
          <td>${t.name}</td>
          <td style="font-weight:bold;">${t.queue} ${newIconHtml}</td>
          <td style="font-size:11px;">${t.detail}</td>
          <td>
            <div style="color:${isWaiting?'#ff9800':isProcessing?'#007bff':'#28a745'};font-weight:bold;">${statusIcon} ${statusClean}</div>
            <div style="font-size:10px;margin-top:4px;${slaStyle}">${slaText}</div>
          </td>
          <td>
            <div>${t.admin || '-'}</div>
            <div style="font-size:9px;color:#999;margin-top:2px;">${t.finish_timestamp ? '🏁 ' + new Date(t.finish_timestamp).toLocaleString('th-TH') : ''}</div>
          </td>
          <td>
            <button style="padding:5px;width:60px;font-size:11px;margin-bottom:2px;border:none;border-radius:6px;font-weight:bold;color:white;background:${isWaiting?'#b39ddb':'#ccc'};cursor:${isWaiting?'pointer':'not-allowed'};"
              ${!isWaiting?'disabled':''} onclick="updateTicketStatus('${t.queue}','กำลังดำเนินการ')">รับงาน</button>
            <button style="padding:5px;width:60px;font-size:11px;margin-bottom:2px;border:none;border-radius:6px;font-weight:bold;color:white;background:${isProcessing?'#28a745':'#ccc'};cursor:${isProcessing?'pointer':'not-allowed'};"
              ${!isProcessing?'disabled':''} onclick="openCloseModal('${t.queue}','${safeName}')">ปิดงาน</button>
          </td>
        </tr>`;
      }).join('');

      if (mobileList) {
        const mobileCards = tickets.map(t => {
          const statusClean  = (t.status || '').trim();
          const isWaiting    = statusClean === 'รอดำเนินการ' || statusClean === 'ใหม่';
          const isProcessing = statusClean === 'กำลังดำเนินการ';
          const createTime   = parseThaiDateToStandard(t.timestamp);
          const hoursLeft    = 48 - ((new Date() - createTime) / (1000*60*60));
          const slaText      = hoursLeft <= 0 ? `🚨 เกิน SLA: ${Math.abs(hoursLeft).toFixed(1)} ชม.` : `⏳ เหลือ ${hoursLeft.toFixed(1)} ชม.`;
          const slaColor     = hoursLeft <= 0 ? '#dc3545' : hoursLeft <= 12 ? '#ff9800' : '#666';
          const borderColor  = isProcessing ? '#5DCAA5' : hoursLeft <= 0 ? '#dc3545' : '#FAC775';
          const safeName     = (t.name || '').replace(/'/g,'');
          return `<div style="background:white;border-radius:14px;border:1px solid #eee;border-left:4px solid ${borderColor};padding:14px;margin-bottom:10px;box-shadow:0 2px 6px rgba(0,0,0,0.05);">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px;">
              <div style="flex:1;">
                <p style="font-size:13px;font-weight:600;margin:0;color:#222;">${t.name}</p>
                <p style="font-size:11px;color:#888;margin:3px 0 0;">${t.detail}</p>
              </div>
              <span style="font-size:11px;background:#f0ecff;color:#6f42c1;padding:3px 10px;border-radius:999px;white-space:nowrap;margin-left:8px;">${t.queue}</span>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin:8px 0;">
              <span style="font-size:12px;color:${isWaiting?'#ff9800':isProcessing?'#007bff':'#28a745'};font-weight:600;">${isWaiting?'🕐':isProcessing?'⚙️':'✅'} ${statusClean}</span>
              <span style="font-size:11px;color:${slaColor};">${slaText}</span>
            </div>
            <div style="display:flex;gap:8px;margin-top:10px;">
              <button style="flex:1;padding:8px;border-radius:999px;border:none;font-size:12px;font-weight:bold;background:${isWaiting?'#b39ddb':'#e0e0e0'};color:${isWaiting?'white':'#aaa'};cursor:${isWaiting?'pointer':'not-allowed'};"
                ${!isWaiting?'disabled':''} onclick="updateTicketStatus('${t.queue}','กำลังดำเนินการ')">รับงาน</button>
              <button style="flex:1;padding:8px;border-radius:999px;border:none;font-size:12px;font-weight:bold;background:${isProcessing?'#66bb6a':'#e0e0e0'};color:${isProcessing?'white':'#aaa'};cursor:${isProcessing?'pointer':'not-allowed'};"
                ${!isProcessing?'disabled':''} onclick="openCloseModal('${t.queue}','${safeName}')">ปิดงาน</button>
            </div>
          </div>`;
        }).join('');

        mobileList.innerHTML = mobileCards +
          `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px;">
            <button id="mobileRefresh" style="padding:12px;border-radius:12px;border:none;background:#b39ddb;color:white;font-size:13px;font-weight:bold;cursor:pointer;">🔄 รีเฟรช</button>
            <button id="mobileLogout"  style="padding:12px;border-radius:12px;border:none;background:#ffab91;color:white;font-size:13px;font-weight:bold;cursor:pointer;">🚪 ออก</button>
          </div>`;
        document.getElementById('mobileRefresh')?.addEventListener('click', loadAdminTickets);
        document.getElementById('mobileLogout')?.addEventListener('click', logout);
      }

    } catch (e) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="color:#dc3545;">❌ โหลดข้อมูลไม่สำเร็จ: ${e.message}</td></tr>`;
    }
  }

  // ── Update ticket status ─────────────────────────────────
  function updateTicketStatus(queue, newStatus) {
    const isFinish    = newStatus === 'เสร็จสิ้น';
    const titleText   = isFinish ? 'ยืนยันปิดงานเรียบร้อย?' : 'ยืนยันรับงาน?';
    const iconType    = isFinish ? 'success' : 'question';
    const confirmColor = isFinish ? '#28a745' : '#1565c0';

    Swal.fire({
      title: titleText,
      html: `<div style="font-size:13px;margin-top:-8px;color:#555;">คิว ${queue}</div>`,
      icon: iconType,
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText:  'ยกเลิก',
      buttonsStyling: false,
      width: '260px', padding: '0.8em',
      customClass: { popup:'modern-popup', confirmButton:'btn-confirm-small', cancelButton:'btn-cancel-small' },
      didOpen: () => {
        const popup = Swal.getPopup(); if (!popup) return;
        popup.style.setProperty('width','260px','important');
        popup.style.setProperty('max-width','260px','important');
        popup.style.setProperty('border-radius','16px','important');
        const titleEl = popup.querySelector('.swal2-title');
        if (titleEl) titleEl.style.setProperty('font-size','15.5px','important');
        const iconEl = popup.querySelector('.swal2-icon');
        if (iconEl){iconEl.style.setProperty('transform','scale(0.65)','important');iconEl.style.setProperty('margin','0 auto -10px auto','important');}
        const cBtn = popup.querySelector('.swal2-confirm');
        if (cBtn){cBtn.style.backgroundColor=confirmColor;cBtn.style.color='white';cBtn.style.setProperty('border-radius','20px','important');cBtn.style.setProperty('width','85px','important');}
        const canBtn = popup.querySelector('.swal2-cancel');
        if (canBtn){canBtn.style.setProperty('border-radius','20px','important');canBtn.style.setProperty('width','80px','important');}
      }
    }).then(result => {
      if (result.isConfirmed) {
        const adminName  = document.getElementById('displayAdmin')?.innerText || currentUser || 'เจ้าหน้าที่ IT';
        const actionTime = new Date().toISOString();
        executeStatusUpdate(queue, newStatus, '', actionTime, adminName);
      }
    });
  }

  function openCloseModal(queue, userName) {
    currentQueueToClose = queue;
    document.getElementById('modalUserName').innerText  = userName;
    document.getElementById('modalQueueText').innerText = queue;
    document.getElementById('modalDetailText').innerText = ticketDetailMap[queue] || '-';
    document.getElementById('resolutionInput').value = 'การตรวจสอบ : \nดำเนินการ : \nสถานะ : ';
    document.getElementById('resolutionModal').style.display = 'flex';
  }

  async function submitCloseTicket() {
    const resInput = document.getElementById('resolutionInput');
    if (!resInput) return;
    const res          = resInput.value.trim();
    const templateText = 'การตรวจสอบ : \nดำเนินการ : \nสถานะ : ';

    const styleCutePopup = () => {
      const popup = Swal.getPopup(); if (!popup) return;
      popup.style.setProperty('border-radius','16px','important');
      popup.style.setProperty('padding','1.5em 1em 1em 1em','important');
      const title = popup.querySelector('.swal2-title');
      if (title) title.style.setProperty('font-size','15.5px','important');
      const textEl = popup.querySelector('.swal2-html-container');
      if (textEl) textEl.style.setProperty('font-size','13px','important');
      const btn = popup.querySelector('.swal2-confirm');
      if (btn){btn.style.setProperty('border-radius','20px','important');btn.style.setProperty('padding','6px 20px','important');btn.style.setProperty('font-size','13px','important');}
      const icon = popup.querySelector('.swal2-icon');
      if (icon){icon.style.setProperty('transform','scale(0.65)','important');icon.style.setProperty('margin','0 auto -10px auto','important');}
    };

    if (!res)
      return Swal.fire({ icon:'warning', title:'ข้อมูลไม่ครบถ้วน', text:'กรุณาระบุวิธีการแก้ไขก่อนปิดงานค่ะ', width:'260px', confirmButtonText:'ตกลง', confirmButtonColor:'#b39ddb', didOpen:styleCutePopup });
    if (res === templateText.trim())
      return Swal.fire({ icon:'warning', title:'กรุณากรอกข้อมูลให้ครบ', text:'กรุณาบันทึกรายละเอียดการแก้ไขให้ครบถ้วนก่อนปิดงานค่ะ', width:'260px', confirmButtonText:'กลับไปกรอก', confirmButtonColor:'#b39ddb', didOpen:styleCutePopup });

    const lines   = res.split('\n');
    const isEmpty = lines.some(line => {
      if (!line.includes(':')) return false;
      return line.split(':').slice(1).join(':').trim() === '';
    });
    if (isEmpty)
      return Swal.fire({ icon:'warning', title:'กรอกข้อมูลไม่ครบ', html:`<div style="font-size:13px;color:#555;">กรุณากรอกข้อมูลหลัง <b>":"</b> ให้ครบทุกบรรทัดค่ะ</div>`, width:'280px', confirmButtonText:'กลับไปกรอก', confirmButtonColor:'#b39ddb', didOpen:styleCutePopup });

    const actionTime = new Date().toISOString();
    const adminName  = document.getElementById('displayAdmin')?.innerText || currentUser || 'เจ้าหน้าที่ IT';
    document.getElementById('resolutionModal').style.display = 'none';
    executeStatusUpdate(currentQueueToClose, 'เสร็จสิ้น', res, actionTime, adminName);
    resInput.value = '';
  }

  async function executeStatusUpdate(queue, newStatus, resolution, actionTime, adminName) {
    try {
      const fallbackAdmin = adminName || currentUser || 'เจ้าหน้าที่ IT';
      const response = await fetch(API, {
        method: 'POST',
        body: JSON.stringify({ action:'update_status', queue, newStatus, resolution, actionTime, adminName:fallbackAdmin })
      });
      const result = await response.json();

      if (result.status === 'success') {
        showToast('success', newStatus === 'เสร็จสิ้น' ? 'ปิดงานเรียบร้อยแล้วค่ะ' : 'รับงานเรียบร้อยแล้วค่ะ');

        // ✅ FIX 1: ส่งอีเมลแจ้งผู้ใช้งาน
        fetch(API, {
          method: 'POST',
          body: JSON.stringify({ action:'send_ticket_email', queue, newStatus, resolution, actionTime, adminName:fallbackAdmin })
        }).then(r => r.json())
          .then(mailRes => { if (mailRes.status === 'success') showToast('info','📧 ส่งอีเมลแจ้งผู้ใช้งานเรียบร้อยแล้วค่ะ'); })
          .catch(err => console.log('Email log:', err));

        setTimeout(() => loadAdminTickets(), 1000);
      } else {
        showToast('error', result.message ?? 'อัปเดตสถานะไม่สำเร็จค่ะ');
      }
    } catch (e) {
      showToast('error', 'การสื่อสารกับเซิร์ฟเวอร์ผิดพลาด');
    }
  }

  // ── Rating popup ─────────────────────────────────────────
  function showRatingPopup(ticketDetail, isMandatory, pendingQueue, onDone) {
    const actualDetail = ticketDetail;
    const queueNum     = actualDetail.queue || pendingQueue;
    const detailHtml   = queueNum
      ? `<div style="background:#f8f9fa;border-radius:8px;padding:10px;margin:10px 0;font-size:13px;text-align:left;">
          <div><b>คิว:</b> ${queueNum}</div>
          <div><b>ประเภท:</b> ${actualDetail.type||'-'}</div>
          <div><b>ระบบ/อุปกรณ์:</b> ${actualDetail.system||'-'}</div>
          <div><b>รายละเอียด:</b> ${actualDetail.detail||'-'}</div>
         </div>`
      : `<p>คิวหมายเลข: <b>${pendingQueue}</b></p>`;

    Swal.fire({
      title:'⭐ ประเมินความพึงพอใจ', html:detailHtml, input:'select',
      inputOptions:{ '5':'⭐⭐⭐⭐⭐ ดีมาก','4':'⭐⭐⭐⭐ ดี','3':'⭐⭐⭐ ปานกลาง','2':'⭐⭐ ควรปรับปรุง','1':'⭐ ไม่พอใจ' },
      inputPlaceholder:'กรุณาเลือกคะแนน', allowOutsideClick:false, allowEscapeKey:false,
      showCancelButton:false, confirmButtonText:'ถัดไป', confirmButtonColor:'#0056b3',
      didOpen: () => {
        const popup = Swal.getPopup();
        popup.style.setProperty('max-width','320px','important');
        popup.style.setProperty('width','90%','important');
        popup.querySelector('.swal2-title').style.setProperty('font-size','20px','important');
        const selectBox = popup.querySelector('.swal2-select');
        if (selectBox){selectBox.style.setProperty('font-size','13.5px','important');selectBox.style.setProperty('padding','8px 12px','important');selectBox.style.setProperty('border-radius','8px','important');selectBox.style.setProperty('width','85%','important');}
      },
      preConfirm: (value) => { if (!value){Swal.showValidationMessage('กรุณาเลือกคะแนนก่อนค่ะ');return false;} return value; }
    }).then(async result => {
      if (result.isConfirmed) {
        const rating = result.value;
        let comment  = '';
        if (rating === '1' || rating === '2') {
          const { value:text, isConfirmed } = await Swal.fire({
            title:'ขออภัยในความไม่สะดวก', input:'textarea',
            inputLabel:'รบกวนแจ้งสิ่งที่ควรปรับปรุงเพื่อให้เราพัฒนาบริการให้ดีขึ้นค่ะ',
            inputPlaceholder:'กรุณาพิมพ์รายละเอียดที่นี่ (ห้ามว่าง)...',
            allowOutsideClick:false, allowEscapeKey:false, showCancelButton:false,
            confirmButtonText:'บันทึกข้อมูล', confirmButtonColor:'#0056b3',
            preConfirm: (inputValue) => { if (!inputValue||inputValue.trim()===''){Swal.showValidationMessage('กรุณาระบุเหตุผลหรือข้อเสนอแนะก่อนบันทึกค่ะ');return false;} return inputValue; }
          });
          if (isConfirmed) comment = text;
        } else {
          comment = 'ประเมินโดยผู้ใช้งาน';
        }
        try {
          await fetch(API, { method:'POST', body:JSON.stringify({ action:'submit_rating', queue:queueNum, rating, comment }) });
        } catch(e) { console.error('Rating submit error:', e); }
        showToast('success','ขอบคุณสำหรับคะแนนค่ะ');
        if (onDone) onDone();
      }
    });
  }

  // ── Forgot password ──────────────────────────────────────
  function showForgotPassword() {
    const styleCutePopup = () => {
      const popup = Swal.getPopup(); if (!popup) return;
      popup.style.setProperty('width','260px','important');
      popup.style.setProperty('max-width','260px','important');
      popup.style.setProperty('border-radius','16px','important');
      popup.style.setProperty('padding','1.5em 1em 1em 1em','important');
      const icon = popup.querySelector('.swal2-icon');
      if (icon){icon.style.transform='scale(0.6)';icon.style.margin='0 auto -10px auto';}
      const title = popup.querySelector('.swal2-title');
      if (title){title.style.setProperty('font-size','16px','important');title.style.setProperty('margin-bottom','5px','important');}
      const textEl = popup.querySelector('.swal2-html-container');
      if (textEl){textEl.style.setProperty('font-size','13px','important');textEl.style.setProperty('line-height','1.5','important');}
      const btnConfirm = popup.querySelector('.swal2-confirm');
      if (btnConfirm){btnConfirm.style.setProperty('border-radius','20px','important');btnConfirm.style.setProperty('padding','6px 20px','important');btnConfirm.style.setProperty('font-size','13px','important');btnConfirm.style.setProperty('width','100px','important');}
      const btnCancel = popup.querySelector('.swal2-cancel');
      if (btnCancel){btnCancel.style.setProperty('border-radius','20px','important');btnCancel.style.setProperty('padding','6px 20px','important');btnCancel.style.setProperty('font-size','13px','important');btnCancel.style.setProperty('width','90px','important');}
    };

    Swal.fire({
      title: '🔒 ลืมรหัสผ่าน',
      html: `
        <div style="font-size:13px;color:#555;margin-bottom:12px;">กรุณายืนยันตัวตนเพื่อตั้งรหัสผ่านใหม่</div>
        <div style="text-align:left;font-size:13px;font-weight:bold;margin-bottom:4px;">ชื่อผู้ใช้งาน (Username)</div>
        <input id="swal-forgot-user" class="swal2-input" placeholder="natanong.s" style="margin:0 0 10px 0;width:100%;height:35px;font-size:13px;box-sizing:border-box;display:block;">
        <div style="text-align:left;font-size:13px;font-weight:bold;margin-bottom:4px;">ชื่อ-นามสกุล (ภาษาไทย)</div>
        <input id="swal-forgot-nameTh" class="swal2-input" placeholder="เช่น ณัฐอนงค์ แสงจันทร์งาม" style="margin:0 0 10px 0;width:100%;height:35px;font-size:13px;box-sizing:border-box;display:block;">
        <hr style="border:0;border-top:1px dashed #ccc;margin:12px 0;">
        <div style="text-align:left;font-size:13px;font-weight:bold;color:#0056b3;margin-bottom:4px;">ตั้งรหัสผ่านใหม่</div>
        <div style="position:relative;margin-bottom:6px;">
          <input id="swal-forgot-newpass" type="password" class="swal2-input" placeholder="รหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)" style="margin:0!important;padding-right:40px!important;width:100%;height:35px;font-size:13px;box-sizing:border-box;display:block;">
          <i class="fa-solid fa-eye" id="swal-togglePasswordIcon" style="position:absolute;right:12px;top:10px;cursor:pointer;color:#888;font-size:14px;" title="แสดง/ซ่อนรหัสผ่าน"></i>
        </div>
      <div style="background:#fff8e1;border:1px solid #ffe082;border-radius:6px;padding:8px 10px;font-size:11px;color:#795548;line-height:1.7;text-align:left;">
        🔐 <b>เงื่อนไขรหัสผ่าน:</b><br>
        ✅ ความยาวอย่างน้อย 8 ตัวอักษร<br>
        ✅ ตัวพิมพ์ใหญ่ A-Z อย่างน้อย 1 ตัว<br>
        ✅ ตัวพิมพ์เล็ก a-z อย่างน้อย 1 ตัว<br>
        ✅ ตัวเลข 0-9 อย่างน้อย 1 ตัว<br>
        ✅ อักขระพิเศษ เช่น !@#$% อย่างน้อย 1 ตัว
      </div>
    `,
      customClass:{ popup:'modern-popup', confirmButton:'btn-confirm-modern', cancelButton:'btn-cancel-modern' },
      showCancelButton:true, confirmButtonText:'บันทึกรหัสผ่าน', cancelButtonText:'ยกเลิก',
      didOpen: () => {
        const popup = Swal.getPopup();
        popup.style.setProperty('max-width','340px','important');
        popup.style.setProperty('border-radius','16px','important');
        popup.style.setProperty('padding','1.2em','important');
        const titleEl = popup.querySelector('.swal2-title');
        if (titleEl) titleEl.style.fontSize = '18px';
        const btnConfirm = popup.querySelector('.swal2-confirm');
        if (btnConfirm){btnConfirm.style.setProperty('border-radius','20px','important');btnConfirm.style.setProperty('width','130px','important');btnConfirm.style.setProperty('font-size','13.5px','important');}
        const btnCancel = popup.querySelector('.swal2-cancel');
        if (btnCancel){btnCancel.style.setProperty('border-radius','20px','important');btnCancel.style.setProperty('width','90px','important');btnCancel.style.setProperty('font-size','13.5px','important');}
        const inputs = popup.querySelectorAll('.swal2-input');
        inputs.forEach(inp => inp.style.setProperty('width','100%','important'));

        // Bind eye icon toggle event for new password input in modal
        const eyeIcon = document.getElementById('swal-togglePasswordIcon');
        const passInput = document.getElementById('swal-forgot-newpass');
        if (eyeIcon && passInput) {
          eyeIcon.addEventListener('click', () => {
            if (passInput.type === 'password') {
              passInput.type = 'text';
              eyeIcon.classList.replace('fa-eye', 'fa-eye-slash');
              eyeIcon.style.color = '#9b6dff';
            } else {
              passInput.type = 'password';
              eyeIcon.classList.replace('fa-eye-slash', 'fa-eye');
              eyeIcon.style.color = '#888';
            }
          });
        }
      },
      preConfirm: () => {
        const uEl = document.getElementById('swal-forgot-user');
        const nEl = document.getElementById('swal-forgot-nameTh');
        const pEl = document.getElementById('swal-forgot-newpass');
        if (!uEl||!nEl||!pEl) { Swal.showValidationMessage('ระบบขัดข้อง: ไม่พบช่องกรอกข้อมูล'); return false; }
        const u = uEl.value.trim(), n = nEl.value.trim(), p = pEl.value.trim();
        if (!u||!n||!p)                                         { Swal.showValidationMessage('กรุณากรอกข้อมูลให้ครบถ้วนค่ะ');                        return false; }
        if (p.length < 8)                                       { Swal.showValidationMessage('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษรค่ะ');               return false; }
        if (!/[A-Z]/.test(p))                                   { Swal.showValidationMessage('รหัสผ่านต้องมีตัวพิมพ์ใหญ่ (A-Z) อย่างน้อย 1 ตัวค่ะ'); return false; }
        if (!/[a-z]/.test(p))                                   { Swal.showValidationMessage('รหัสผ่านต้องมีตัวพิมพ์เล็ก (a-z) อย่างน้อย 1 ตัวค่ะ'); return false; }
        if (!/[0-9]/.test(p))                                   { Swal.showValidationMessage('รหัสผ่านต้องมีตัวเลข (0-9) อย่างน้อย 1 ตัวค่ะ');       return false; }
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p)) { Swal.showValidationMessage('รหัสผ่านต้องมีอักขระพิเศษ เช่น !@#$% อย่างน้อย 1 ตัวค่ะ'); return false; }
        return { username: u, nameTh: n, newPass: p };  // ✅ ส่งค่ากลับ
      }                                                  // ✅ ปิด preConfirm
    }).then(async result => {
      if (result.isConfirmed) {
        const data = result.value;
        Swal.fire({ title:'กำลังดำเนินการ...', html:'<span style="font-size:13px;">ระบบกำลังบันทึกข้อมูลค่ะ</span>', allowOutsideClick:false, didOpen:()=>{ Swal.showLoading(); styleCutePopup(); } });
        try {
          const response = await fetch(API, { method:'POST', body:JSON.stringify({ action:'forgot_password', username:data.username, nameTh:data.nameTh, newPass:data.newPass }) });
          const res = await response.json();
          if (res.status === 'success') {
            Swal.fire({ icon:'success', title:'สำเร็จ!', html:'บันทึกรหัสผ่านใหม่เรียบร้อยแล้วค่ะ กรุณาเข้าสู่ระบบใหม่', confirmButtonText:'ตกลง', confirmButtonColor:'#0056b3', didOpen:styleCutePopup });
          } else {
            Swal.fire({ icon:'error', title:'ข้อผิดพลาด', html:res.message||'ไม่พบข้อมูลในระบบค่ะ', confirmButtonText:'ลองใหม่', confirmButtonColor:'#d33', didOpen:styleCutePopup })
              .then(r => { if (r.isConfirmed) showForgotPassword(); });
          }
        } catch(e) {
          Swal.fire({ icon:'error', title:'ข้อผิดพลาดของระบบ', html:e.message, confirmButtonText:'ตกลง', confirmButtonColor:'#d33', didOpen:styleCutePopup });
        }
      }
    });
  }

  // ── Toggle password visibility ────────────────────────────
  function togglePassword() {
    const passInput = document.getElementById('password');
    const icon      = document.getElementById('togglePasswordIcon');
    if (passInput.type === 'password') {
      passInput.type = 'text';
      icon.classList.replace('fa-eye','fa-eye-slash');
      icon.style.color = '#9b6dff';
    } else {
      passInput.type = 'password';
      icon.classList.replace('fa-eye-slash','fa-eye');
      icon.style.color = '#888';
    }
  }

  // ── Toggle admin/user view ────────────────────────────────
  function toggleAdminUserView() {
    const adminBox  = document.getElementById('adminBox');
    const userBox   = document.getElementById('userBox');
    const btnToUser  = document.getElementById('switch-view-btn');
    const btnToAdmin = document.getElementById('switch-to-admin-btn');
    if (adminBox.classList.contains('hidden')) {
      switchView('adminBox');
      if (btnToAdmin) btnToAdmin.style.display = 'none';
      if (btnToUser) { btnToUser.style.display = 'inline-block'; document.getElementById('switch-text').innerText = 'สลับ User'; }
    } else {
      switchView('userBox');
      const adminNameTxt = document.getElementById('displayAdmin').innerText;
      if (adminNameTxt) document.getElementById('displayUser').innerText = adminNameTxt;
      const adminLoginName = document.getElementById('username').value.trim();
      
      const emailInput = document.getElementById('user_email');
      if (adminLoginName) emailInput.value = adminLoginName.includes('@') ? adminLoginName : adminLoginName + '@fishmarket.co.th';
      
      // Admin can edit email address!
      emailInput.readOnly = false;
      emailInput.style.backgroundColor = '#ffffff';
      emailInput.style.cursor = 'text';
      
      loadUserTickets();
      if (btnToUser)  btnToUser.style.display  = 'none';
      if (btnToAdmin) { btnToAdmin.style.display = 'inline-block'; document.getElementById('switch-user-text').innerText = 'สลับ Admin'; }
    }
  }

  // ── Keyboard shortcuts ────────────────────────────────────
  document.getElementById('password').addEventListener('keypress', e => { if (e.key === 'Enter') login(); });
  document.getElementById('username').addEventListener('keypress', e => { if (e.key === 'Enter') login(); });
  document.addEventListener('keydown', e => {
    const modal = document.getElementById('resolutionModal');
    if (modal && modal.style.display === 'flex' && (e.key === 'Escape' || e.keyCode === 27)) {
      e.preventDefault();
      showToast('warning','กรุณากดปุ่ม "ปิดงาน" หรือ "ยกเลิก" บนหน้าจอค่ะ');
    }
  });

  // ── On load ──────────────────────────────────────────────
  window.onload = function() {
    try {
      const savedUser = sessionStorage.getItem('ticket_username');
      const savedPass = sessionStorage.getItem('ticket_password');
      const savedView = sessionStorage.getItem('ticket_active_view');
      if (savedUser && savedPass) {
        autoLogin(savedUser, savedPass, savedView);
      }

      const urlParams = new URLSearchParams(window.location.search);
      const q = urlParams.get('q');
      if (q) {
        fetch(API, { method:'POST', body:JSON.stringify({ action:'get_ticket_detail', queue:q }) })
          .then(r => r.json())
          .then(detail => { if (detail) showRatingPopup(detail, false, q, null); })
          .catch(e => console.log('URL param detail error:', e));
      }
    } catch(err) { console.log('URL Params Error:', err); }
  };

  async function autoLogin(u, p, targetViewId) {
    const styleCutePopup = () => {
      const popup = Swal.getPopup(); if (!popup) return;
      popup.style.setProperty('width','220px','important');
      popup.style.setProperty('border-radius','16px','important');
      popup.style.setProperty('padding','1em','important');
      const title = popup.querySelector('.swal2-title');
      if (title) title.style.setProperty('font-size','15px','important');
    };

    Swal.fire({
      title: 'กำลังเชื่อมต่อเซสชัน...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
        styleCutePopup();
      }
    });

    try {
      const response = await fetch(API, { method:'POST', body:JSON.stringify({ action:'login', username:u, password:p }) });
      const res = await response.json();
      Swal.close();

      if (res.status === 'success') {
        currentUser      = res.name || u;
        currentLoginName = u;
        const userRole   = (res.role || 'user').trim().toLowerCase();

        document.getElementById('username').value = u;
        document.getElementById('password').value = p;

        if (userRole === 'admin') {
          document.getElementById('displayAdmin').innerText = currentUser;
          
          const viewToRestore = targetViewId || 'adminBox';
          if (viewToRestore === 'userBox') {
            document.getElementById('displayUser').innerText = currentUser;
            const emailInput = document.getElementById('user_email');
            emailInput.value = u.includes('@') ? u : u + '@fishmarket.co.th';
            emailInput.readOnly = false;
            emailInput.style.backgroundColor = '#ffffff';
            emailInput.style.cursor = 'text';

            switchView('userBox');
            loadUserTickets();

            const switchBtn = document.getElementById('switch-view-btn');
            if (switchBtn) {
              switchBtn.style.display = 'none';
            }
            const btnToAdmin = document.getElementById('switch-to-admin-btn');
            if (btnToAdmin) {
              btnToAdmin.style.display = 'inline-block';
              document.getElementById('switch-user-text').innerText = 'สลับ Admin';
            }
          } else {
            switchView('adminBox');
            loadAdminTickets();
            const switchBtn = document.getElementById('switch-view-btn');
            if (switchBtn) {
              switchBtn.style.display = 'inline-block';
              document.getElementById('switch-text').innerText = 'สลับ User';
              switchBtn.style.setProperty('background','#9575cd','important');
            }
            const btnToAdmin = document.getElementById('switch-to-admin-btn');
            if (btnToAdmin) btnToAdmin.style.display = 'none';
          }

        } else {
          document.getElementById('displayUser').innerText = currentUser;
          const emailInput = document.getElementById('user_email');
          emailInput.value = u.includes('@') ? u : u + '@fishmarket.co.th';
          emailInput.readOnly = true;
          emailInput.style.backgroundColor = '#e9ecef';
          emailInput.style.cursor = 'not-allowed';

          switchView('userBox');
          loadUserTickets();

          if (document.getElementById('switch-view-btn'))    document.getElementById('switch-view-btn').style.display    = 'none';
          if (document.getElementById('switch-to-admin-btn')) document.getElementById('switch-to-admin-btn').style.display = 'none';
        }
      } else {
        sessionStorage.removeItem('ticket_username');
        sessionStorage.removeItem('ticket_password');
        sessionStorage.removeItem('ticket_active_view');
      }
    } catch (e) {
      Swal.close();
      console.error('Auto login error:', e);
      sessionStorage.removeItem('ticket_username');
      sessionStorage.removeItem('ticket_password');
      sessionStorage.removeItem('ticket_active_view');
    }
  }