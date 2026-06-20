// Cloudflare Worker serving the IT Service Center interface
const HTML = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IT Service Center</title>
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  <link href="https://fonts.googleapis.com/css2?family=K2D:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <link rel="stylesheet" href="style.css">
</head>
<body>

<!-- ==================== LOGIN BOX ==================== -->
<div class="card" id="loginBox">
  <div style="text-align:center;margin-bottom:15px;">
    <img src="https://lh3.googleusercontent.com/d/1nqE6yoPcLuZ3orMnAfyQBcVWrPXdYpGY" alt="FMO Logo" style="width:100px;height:auto;object-fit:contain;">
  </div>
  <div style="text-align:center;margin:0 0 10px 0;color:#2c3e50;font-size:1.0rem;font-weight:bold;">
    ระบบแจ้งปัญหาและขอใช้บริการสารสนเทศ อสป.<br>
    <span style="font-size:0.8rem;color:#6c757d;font-weight:500;">IT Tickets & Request Systems</span>
  </div>
  <div style="text-align:center;margin-bottom:20px;color:#0056b3;font-weight:bold;display:flex;align-items:center;justify-content:center;gap:5px;">
    <span>🔐</span><span style="border-bottom:2px solid #0056b3;padding-bottom:2px;">เข้าสู่ระบบ</span>
  </div>
  <label>ชื่อผู้ใช้งาน</label>
  <input id="username" placeholder="name.r">
  <label>รหัสผ่าน</label>
  <div style="position:relative;margin-bottom:10px;">
    <input type="password" id="password" placeholder="password" style="width:100%;padding-right:40px;margin-bottom:0!important;">
    <i class="fa-solid fa-eye" id="togglePasswordIcon" onclick="togglePassword()" style="position:absolute;right:12px;top:11px;cursor:pointer;color:#888;font-size:14px;" title="แสดง/ซ่อนรหัสผ่าน"></i>
  </div>
  <button id="btnLogin" class="btn-primary" onclick="login()">เข้าสู่ระบบ</button>
  <div style="text-align:center;margin-top:8px;">
    <a href="#" onclick="showForgotPassword()" style="font-size:13px;color:#0056b3;text-decoration:none;font-weight:bold;">🔑 ลืมรหัสผ่าน? หรือ ไม่เคยเข้าสู่ระบบ</a>
  </div>
  <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">
  <div class="text-center">
    <label id="lblNewUser" style="font-weight:bold;font-size:15px;color:#e06666;cursor:pointer;user-select:none;" onclick="toggleNewUserButton()">สำหรับพนักงานใหม่เท่านั้น!! คลิกที่นี่</label>
    <button id="btnNewUser" class="btn-secondary" onclick="switchView('newUserBox')" style="margin-top:5px;display:none;">✨ ขอสิทธิ์เข้าใช้งานระบบ (พนักงานใหม่เท่านั้น)</button>
  </div>
  <div style="text-align:center;color:rgba(255,255,255,0.75);font-size:12px;font-weight:300;padding:20px 0;letter-spacing:0.5px;text-shadow:1px 1px 3px rgba(0,0,0,0.5);">
    © 2026 สำนักงานเทคโนโลยีสารสนเทศ อสป.
  </div>
</div>

<!-- ==================== NEW USER BOX ==================== -->
<div class="card hidden" id="newUserBox" style="padding:20px 30px;max-width:450px;margin:0 auto;">
  <h3 style="margin-bottom:15px;margin-top:0;text-align:center;">✨ ขอสิทธิ์เข้าใช้งาน (พนักงานใหม่)</h3>
  <div style="margin-bottom:10px;">
    <label style="display:block;margin-bottom:3px;font-size:13px;">ชื่อ-นามสกุล (ไทย) <span class="required">*</span></label>
    <input id="new_name" placeholder="ระบุชื่อ-ไทย" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:5px;box-sizing:border-box;">
  </div>
  <div style="margin-bottom:10px;">
    <label style="display:block;margin-bottom:3px;font-size:13px;">ชื่อ-นามสกุล (อังกฤษ) <span class="required">*</span></label>
    <input id="new_name_en" placeholder="Full Name (EN)" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:5px;box-sizing:border-box;">
  </div>
  <div style="margin-bottom:10px;">
    <label style="display:block;margin-bottom:3px;font-size:13px;">หน่วยงาน / แผนก <span class="required">*</span></label>
    <input id="new_dept" placeholder="ระบุหน่วยงาน" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:5px;box-sizing:border-box;">
  </div>
  <label style="display:block;margin-bottom:3px;font-size:13px;">ระบบที่ต้องการขอสิทธิ์ <span class="required">*</span></label>
  <div style="background:#fdfdfd;border:1px solid #ddd;padding:12px;border-radius:8px;margin-bottom:12px;">
    <div style="display:flex;align-items:center;margin-bottom:6px;">
      <input type="checkbox" id="check_email" style="width:14px;height:14px;cursor:pointer;" checked>
      <label for="check_email" style="margin-left:10px;font-size:13px;cursor:pointer;">📧 e-Mail องค์กร</label>
    </div>
    <div style="display:flex;align-items:center;margin-bottom:6px;">
      <input type="checkbox" id="check_systems" onchange="toggleSystemInput()" style="width:14px;height:14px;cursor:pointer;">
      <label for="check_systems" style="margin-left:10px;font-size:13px;cursor:pointer;">🖥️ Systems ระบบงาน</label>
    </div>
    <div id="system_name_container" style="display:none;margin-top:5px;">
      <input type="text" id="new_system_detail" placeholder="ระบุชื่อระบบงาน..." style="width:100%;padding:6px;font-size:12px;border:1px solid #007bff;border-radius:4px;box-sizing:border-box;">
    </div>
  </div>
  <div style="margin-bottom:10px;">
    <label style="display:block;margin-bottom:3px;font-size:13px;">เหตุผลความจำเป็น / ชื่อระบบงาน / สิทธิ์การเข้าถึง<span class="required">*</span></label>
    <textarea id="new_detail" placeholder="ระบุเหตุผล..." style="width:100%;height:60px;padding:8px;border:1px solid #ccc;border-radius:5px;box-sizing:border-box;"></textarea>
  </div>
  <div style="margin-bottom:12px;">
    <label style="display:block;margin-bottom:3px;font-size:13px;">อีเมลสำรองสำหรับแจ้งเตือน <span class="required">*</span></label>
    <input id="new_email" type="email" placeholder="example@gmail.com" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:5px;box-sizing:border-box;">
  </div>
  <div style="margin-bottom:10px;">
    <label style="display:block;margin-bottom:3px;font-size:13px;">อีเมลหัวหน้างาน <span class="required">*</span></label>
    <input id="new_manager_email" type="email" placeholder="manager@fishmarket.co.th" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:5px;box-sizing:border-box;">
  </div>
  <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:15px;background:#f0f7ff;padding:10px;border-radius:6px;border:1px solid #d1e7ff;">
    <input type="checkbox" id="pdpa_check" style="width:12px;height:12px;margin-top:2px;">
    <label for="pdpa_check" style="font-size:11px;color:#444;line-height:1.4;">ฉันยินยอมให้จัดเก็บและใช้ข้อมูลส่วนบุคคลนี้ เพื่อใช้ในการพิสูจน์ตัวตนและสิทธิ์ในการเข้าถึงระบบงานตามนโยบาย PDPA ขององค์กร <span class="required">*</span></label>
  </div>
  <button class="btn-primary" id="btnSubmitNew" onclick="submitNewUser(event)">ส่งคำขอเปิดสิทธิ์</button>
  <button class="btn-secondary" onclick="switchView('loginBox')" style="width:100%;margin-top:8px;padding:6px;font-size:12px;border:none;background:none;color:#666;text-decoration:underline;cursor:pointer;">⬅️ กลับไปหน้าเข้าสู่ระบบ</button>
</div>

<!-- ==================== USER BOX ==================== -->
<div class="card hidden" id="userBox" style="width:85%!important;max-width:480px!important;margin:40px auto!important;padding:20px 25px!important;box-sizing:border-box!important;border-radius:12px!important;position:relative;">
  <button id="switch-to-admin-btn" class="btn-primary" style="display:none;position:absolute;top:20px;right:20px;width:auto;padding:6px 15px;font-size:13px;border-radius:20px;background:#ffab91!important;z-index:10;" onclick="toggleAdminUserView()">
    <i class="fa-solid fa-retweet me-1"></i> <span id="switch-user-text">สลับ Admin</span>
  </button>
  <h3>📌 แจ้งงาน IT Support</h3>
  <p class="text-center" style="color:green;font-weight:bold;">👤 ผู้ใช้งาน: <span id="displayUser"></span></p>
  <div style="background:#f8f9fa;border:1px solid #e2e6ea;border-radius:8px;padding:15px;margin-bottom:20px;">
    <h4 style="margin-top:0;margin-bottom:10px;color:#0056b3;font-size:14px;">📋 สถานะเคสของคุณ</h4>
    <div id="userTicketList" style="font-size:13px;color:#555;"></div>
    <button id="btnShowForm" class="btn-secondary" style="margin-top:15px;display:none;" onclick="toggleTicketForm(true)">➕ ขอเปิดเคสเพิ่ม</button>
  </div>
  <div id="ticketFormSection">
    <label>ประเภทบริการ <span class="required">*</span></label>
    <select id="user_type">
      <option value="แจ้งปัญหา/แจ้งซ่อม">🛠️ แจ้งปัญหา / แจ้งซ่อม</option>
      <option value="ขอเพิ่มสิทธิ์">🔑 ขอเพิ่มสิทธิ์ระบบ (Add-on)</option>
    </select>
    <label>ระบบหรืออุปกรณ์ <span class="required">*</span></label>
    <input id="user_system" placeholder="เช่น เครื่องพิมพ์ชั้น 2">
    <label>รายละเอียด <span class="required">*</span></label>
    <textarea id="user_detail" placeholder="อธิบายปัญหา..."></textarea>
    <label>อีเมลแจ้งเตือน <span class="required">*</span></label>
    <input id="user_email" type="email" style="background-color:#e9ecef!important;cursor:not-allowed;" readonly>
    <!-- ✅ FIX 3: ปุ่มส่งข้อมูล + รีเฟรช บรรทัดเดียวกัน -->
    <div style="display:flex;gap:10px;margin-bottom:10px;">
      <button class="btn-primary" id="btnSubmitUser" style="flex:1;margin-bottom:0!important;" onclick="submitUserRequest(event)">ส่งข้อมูล</button>
      <button class="btn-secondary" style="flex:0 0 auto;width:auto;padding:12px 16px;margin-bottom:0!important;" onclick="loadUserTickets()" title="รีเฟรชสถานะเคส">🔄 รีเฟรช</button>
    </div>
  </div>
  <button class="btn-danger" onclick="logout()">🚪 ออกจากระบบ</button>
</div>

<!-- ==================== ADMIN BOX ==================== -->
<div class="card hidden" id="adminBox" style="max-width:800px;position:relative;">
  <button id="switch-view-btn" class="btn-primary" style="display:none;position:absolute;top:20px;right:20px;width:auto;padding:6px 15px;font-size:13px;border-radius:20px;background:#9575cd!important;z-index:10;" onclick="toggleAdminUserView()">
    <i class="fa-solid fa-retweet me-1"></i> <span id="switch-text">สลับ User</span>
  </button>
  <h3>🛡️ ทีม IT (Admin)</h3>
  <p class="text-center" style="color:#0056b3;font-weight:bold;">👩‍💻 แอดมิน: <span id="displayAdmin"></span></p>

  <!-- ✅ FIX 2: 4 การ์ด -->
  <div id="adminSummaryCards" style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
    <div class="summary-card" style="background:#fffdf5;border-left:4px solid #ffca28;">
      <h4>คำขอใหม่</h4>
      <h2 id="countPending" style="color:#f57f17;">0</h2>
      <p>รอดำเนินการ</p>
    </div>
    <div class="summary-card" style="background:#f5fbff;border-left:4px solid #42a5f5;">
      <h4>กำลังดำเนินการ</h4>
      <h2 id="countProgress" style="color:#1565c0;">0</h2>
      <p>อยู่ระหว่างดำเนินการ</p>
    </div>
    <div class="summary-card" style="background:#f4fbf7;border-left:4px solid #81c784;">
      <h4>เสร็จสิ้น</h4>
      <h2 id="countCompleted" style="color:#2e7d32;">0</h2>
      <p>เดือนนี้</p>
    </div>
    <div class="summary-card" style="background:#fdf5ff;border-left:4px solid #ba68c8;">
      <h4>ทั้งหมด</h4>
      <h2 id="countTotal" style="color:#6a1b9a;">0</h2>
      <p>Ticket ทั้งหมด</p>
    </div>
  </div>

  <div class="desktop-table" style="overflow-x:auto;">
    <table>
      <thead>
        <tr>
          <th style="min-width:100px;">ชื่อผู้แจ้ง</th>
          <th style="min-width:80px;">คิว</th>
          <th style="min-width:190px;">รายละเอียด</th>
          <th style="min-width:120px;">สถานะ/SLA</th>
          <th style="min-width:180px;">ผู้ดูแล</th>
          <th style="min-width:100px;">จัดการ</th>
        </tr>
      </thead>
      <tbody id="ticketBody"></tbody>
    </table>
  </div>
  <div id="mobileTicketList" style="display:none;"></div>
  <div class="admin-action-btns">
    <button class="btn-primary desktop-btn" onclick="loadAdminTickets()">🔄 รีเฟรชข้อมูล</button>
    <button class="btn-danger  desktop-btn" onclick="logout()">🚪 ออกจากระบบ</button>
  </div>
</div>

<!-- ==================== RESOLUTION MODAL ==================== -->
<div id="resolutionModal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:1000;justify-content:center;align-items:center;">
  <div class="card" style="width:90%;max-width:360px;margin:auto;">
    <h3 style="color:#28a745;border-bottom:none;">✅ ยืนยันการปิดงาน</h3>
    <p class="text-center">ผู้แจ้ง: <span id="modalUserName"></span> | คิว: <span id="modalQueueText"></span></p>
    <div id="modalDetailBox" style="background:#f8f9fa;border:1px solid #dee2e6;border-radius:8px;padding:10px 14px;margin-bottom:12px;font-size:13px;color:#555;line-height:1.6;max-height:100px;overflow-y:auto;">
      <b style="color:#333;">📋 ปัญหา:</b> <span id="modalDetailText" style="white-space:pre-wrap;"></span>
    </div>
    <label>วิธีการแก้ไข</label>
    <textarea id="resolutionInput" placeholder="ระบุสิ่งที่ดำเนินการแก้ไข..."></textarea>
    <div style="display:flex;gap:10px;">
      <button class="btn-primary" style="background:#28a745;" onclick="submitCloseTicket()">ปิดงาน</button>
      <button class="btn-secondary" onclick="document.getElementById('resolutionModal').style.display='none'">ยกเลิก</button>
    </div>
  </div>
</div>

<!-- ==================== JAVASCRIPT ==================== -->
<script src="script.js"></script>
</body>
</html>`;
const CSS = `body {
      font-family: 'K2D', sans-serif !important;
      background-image: linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)),url('https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=2070&auto=format&fit=crop');
      background-size: cover !important;
      background-position: center !important;
      background-attachment: fixed !important;
      background-repeat: no-repeat !important;
      min-height: 100vh;
      margin: 0 !important;
      padding: 0 !important;
      overflow-x: hidden !important;
      width: 100% !important;
    }
    input,select,textarea,button,table,th,td,span,div { font-family: 'K2D', sans-serif !important; }
    html { margin:0!important;padding:0!important;min-height:100vh!important;overflow-x:hidden; }
    .card { max-width:480px;margin:20px auto;background:#fff;padding:30px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.08); }
    h3 { text-align:center;color:#0056b3;margin-top:0;margin-bottom:25px;border-bottom:2px solid #f0f0f0;padding-bottom:10px; }
    label { font-size:14px;font-weight:bold;margin-bottom:5px;display:block;color:#555; }
    input,select,textarea { width:100%;margin-bottom:15px;padding:12px;border-radius:8px;border:1px solid #ccc;box-sizing:border-box;font-size:14px; }
    textarea { resize:vertical;min-height:80px; }
    button { width:100%;padding:12px;border-radius:8px;border:none;font-weight:bold;cursor:pointer;transition:0.2s;font-size:15px;margin-bottom:10px; }
    .btn-primary { background:#007bff;color:#fff; }
    .btn-primary:hover { background:#0056b3; }
    .btn-secondary { background:#e2e6ea;color:#333; }
    .btn-secondary:hover { background:#dae0e5; }
    .btn-danger { background:#dc3545;color:white; }
    button:disabled { background:#cccccc;cursor:not-allowed; }
    .hidden { display:none; }
    .text-center { text-align:center; }
    table { width:100%;border-collapse:collapse;text-align:left;margin-bottom:20px;font-size:14px; }
    th { background-color:#f4f6f9;border-bottom:2px solid #ccc;padding:10px; }
    td { padding:10px;border-bottom:1px solid #eee; }
    .required { color:#ff4d4d!important;margin-left:4px;font-weight:bold; }
    .modern-popup { border-radius:16px!important;padding:0.8rem!important;max-width:380px!important;width:90%!important; }
    .swal2-select { width:80%!important;max-width:250px!important;margin:10px auto!important;height:40px!important;border-radius:8px!important; }
    .btn-confirm-modern { background:#003d99!important;border-radius:50px!important;padding:12px!important;font-size:15px!important;width:80%!important;font-weight:bold!important;color:white!important; }
    .btn-cancel-modern  { background:#626569!important;border-radius:50px!important;padding:12px!important;font-size:15px!important;width:80%!important;font-weight:bold!important;color:white!important; }
    .btn-confirm-small  { background:#003d99!important;border-radius:50px!important;padding:12px!important;font-size:13px!important;width:80%!important;font-weight:bold!important;color:white!important;margin-bottom:5px; }
    .btn-cancel-small   { background:#626569!important;border-radius:50px!important;padding:8px!important;font-size:13px!important;width:80%!important;font-weight:bold!important;color:white!important; }
    #adminBox h3 { color:#9b6dff;border-bottom:2px solid #e9dfff; }
    #adminBox p.text-center { color:#7c4dff!important; }
    #adminBox table th { font-size:14px!important; }
    #adminBox table td { font-size:13px!important; }
    .btn-primary { background:#b39ddb!important;color:#ffffff!important;transition:all 0.2s ease-in-out; }
    .btn-primary:hover:not(:disabled) { background:#7e57c2!important;box-shadow:0 4px 8px rgba(0,0,0,0.15); }
    #adminBox>button.btn-primary:hover { background:#9575cd!important;color:#ffffff!important; }
    #ticketBody .btn-danger { background:#81c784!important; }
    #ticketBody .btn-danger:hover:not(:disabled) { background:#388e3c!important;color:#ffffff!important; }
    #adminBox>button.btn-danger,#userBox>button.btn-danger { background:#ffab91!important; }
    #adminBox>button.btn-danger:hover,#userBox>button.btn-danger:hover { background:#e64a19!important;color:#ffffff!important; }
    button:active { transform:scale(0.95); }
    button:disabled { background:#eeeeee!important;color:#bbbbbb!important;cursor:not-allowed; }
    #userBox h3 { color:#0056b3;border-bottom:2px solid #e7f1ff; }
    #userBox p.text-center span#displayUser { color:#007bff; }
    #userBox div[style*="background: #f8f9fa"] { background:#f0f7ff!important;border:1px solid #c2d9ff!important; }
    #userBox h4 { color:#004494!important; }
    #btnSubmitUser { background:#0052cc!important;color:#ffffff!important;transition:all 0.2s ease; }
    #btnSubmitUser:hover { background:#003d99!important;box-shadow:0 4px 10px rgba(0,82,204,0.3); }
    #btnShowForm { background:#e1efff!important;color:#0056b3!important;border:1px solid #b8d7ff!important; }
    #btnShowForm:hover { background:#007bff!important;color:#ffffff!important; }
    #userTicketList div { border-bottom:1px dashed #b8d7ff!important; }
    #userBox .btn-danger { background:#f8d7da!important;color:#721c24!important;border:1px solid #f5c6cb!important; }
    #userBox .btn-danger:hover { background:#dc3545!important;color:#ffffff!important; }
    table { table-layout:fixed!important;width:100%!important;border-collapse:collapse; }
    th:nth-child(1){width:20%;}th:nth-child(2){width:10%;}th:nth-child(3){width:25%;}
    th:nth-child(4){width:15%;}th:nth-child(5){width:18%;white-space:nowrap!important;}
    td:nth-child(5){white-space:nowrap!important;}th:nth-child(6){width:12%;}
    td { padding:12px 8px;word-wrap:break-word;overflow-wrap:break-word;word-break:break-all;vertical-align:middle; }
    td:nth-child(3){text-align:left;line-height:1.4;}
    @keyframes blink{0%{opacity:1;}50%{opacity:0.2;}100%{opacity:1;}}
    .status-badge{padding:4px 8px;border-radius:4px;font-size:12px;display:inline-block;}
    #ticketBody button{width:auto!important;display:inline-block!important;margin-bottom:2px!important;}
    @keyframes spin{100%{transform:rotate(360deg);}}
    .icon-spin{display:inline-block;animation:spin 2s linear infinite;margin-right:5px;}
    .icon-static{display:inline-block;margin-right:5px;}
    #loginBox{max-width:450px!important;width:85%!important;padding:20px 25px!important;margin:0 auto!important;position:relative!important;top:50vh!important;transform:translateY(-50%)!important;box-sizing:border-box!important;}
    #loginBox img{width:75px!important;margin-bottom:2px!important;}
    #loginBox h3{font-size:16px!important;margin-top:5px!important;margin-bottom:8px!important;}
    #loginBox label{font-size:12px!important;margin-bottom:2px!important;}
    #loginBox input{height:35px!important;font-size:13px!important;margin-bottom:10px!important;}
    #loginBox button{height:38px!important;font-size:14px!important;margin-top:5px!important;}
    #loginBox hr{margin:10px 0!important;}
    #newUserBox>div{margin-bottom:16px!important;}
    #newUserBox label{margin-bottom:5px!important;}
    #newUserBox input:not([type="checkbox"]),#newUserBox textarea{margin-bottom:0px!important;padding:8px 10px!important;}
    #newUserBox div[style*="background: #fdfdfd"]{padding:10px 12px 6px 12px!important;}
    #newUserBox div[style*="background: #fdfdfd"]>div{margin-bottom:4px!important;}
    #newUserBox{width:85%!important;max-width:480px!important;margin:30px auto!important;padding:20px 25px!important;box-sizing:border-box!important;border-radius:12px!important;}
    #userBox{width:85%!important;max-width:480px!important;margin:40px auto!important;padding:20px 25px!important;box-sizing:border-box!important;border-radius:12px!important;}
    #userBox>button.btn-danger{margin-top:15px!important;}
    #loginBox,#userBox,#newUserBox,#adminBox{width:88%!important;margin-left:auto!important;margin-right:auto!important;box-sizing:border-box!important;}
    #adminBox{max-width:1000px!important;padding:20px!important;margin-top:30px!important;}
    @media(min-width:768px){#adminBox table{display:table!important;width:100%!important;white-space:normal!important;overflow-x:visible!important;}}
    @media(max-width:767px){#adminBox table{display:block!important;width:100%!important;overflow-x:auto!important;white-space:nowrap!important;-webkit-overflow-scrolling:touch!important;}}
    input,select,textarea,button{max-width:100%!important;box-sizing:border-box!important;}
    .summary-card{flex:1;padding:15px;border-radius:12px;text-align:center;box-shadow:0 4px 8px rgba(0,0,0,0.05);border:1px solid #eee;}
    .summary-card h4{margin:0;font-size:13px;color:#666;}
    .summary-card h2{margin:6px 0 2px;font-size:28px;font-weight:bold;}
    .summary-card p{margin:0;font-size:11px;color:#aaa;}
    .admin-action-btns{display:flex;gap:15px;justify-content:center;margin-top:25px;}
    .admin-action-btns button{width:200px!important;margin-bottom:0!important;}
    @media(max-width:767px){.admin-action-btns{flex-direction:column;}.admin-action-btns button{width:100%!important;margin-bottom:10px!important;}}`;
const JS = `let ticketDetailMap = {};
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
    if (target) target.classList.remove('hidden');
    else console.error('switchView: ไม่พบ ID: ' + viewId);
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
            document.getElementById('user_email').value = loginName.includes('@') ? loginName : loginName + '@fishmarket.co.th';
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
      selectedSystems.push(sysDetail ? \`Systems (\${sysDetail})\` : 'Systems');
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
    if (!/^[ก-๙\\s]+$/.test(nameInput))
      return showValidationError('error','ภาษาไม่ถูกต้อง','ช่อง "ชื่อ-นามสกุล (ไทย)" กรุณากรอกเฉพาะตัวอักษรภาษาไทยและช่องว่างเท่านั้นค่ะ');
    if (!/^[a-zA-Z\\s]+$/.test(nameEnInput))
      return showValidationError('error','ภาษาไม่ถูกต้อง','ช่อง "ชื่อ-นามสกุล (อังกฤษ)" กรุณากรอกเฉพาะตัวอักษรภาษาอังกฤษและช่องว่างเท่านั้นค่ะ');
    const emailPattern = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
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
          html:\`<div style="font-size:18px;">คิวของคุณคือ: <b style="color:#0056b3;">\${res.queue}</b><br>มีคิวรออยู่ก่อนหน้า: \${ahead} คิว</div>\`,
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
        loadUserTickets();
        const ahead = res.waiting ? res.waiting - 1 : 0;
        Swal.fire({
          icon:'success', title:'สำเร็จ!',
          html:\`คิวของคุณคือ: <b style="font-size:18px;color:#0056b3;">\${res.queue}</b><br>มีคิวรอก่อนหน้า <span style="color:#dc3545;font-weight:bold;font-size:18px;">\${ahead}</span> คิว\`,
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
        const statusColor = t.status === 'รอดำเนินการ' ? '#ff9800' : '#007bff';
        const aheadText   = t.ahead > 0 ? \`(รออีก \${t.ahead} คิว)\` : '<span style="color:green;">(ถึงคิวของคุณแล้ว รอเจ้าหน้าที่ประสาน)</span>';
        html += \`<div style="padding:10px 0;border-bottom:1px dashed #ccc;">
          <strong style="color:#333;">\${t.queue}</strong> : \${t.system}
          <div style="float:right;text-align:right;">
            <span style="color:\${statusColor};font-weight:bold;">\${t.status}</span><br>
            <span style="font-size:11px;color:#dc3545;">\${aheadText}</span>
          </div>
          <div style="clear:both;"></div>
        </div>\`;
      });
      container.innerHTML = html;
      toggleTicketForm(false);
    } catch (e) {
      container.innerHTML = '❌ โหลดข้อมูลไม่สำเร็จ';
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
      return new Date(\`\${dateParts[2]}/\${dateParts[1]}/\${dateParts[0]} \${timeStr}\`);
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
          ? \`<span style="background:#ff4d4f;color:white;font-size:10px;padding:2px 6px;border-radius:10px;margin-left:6px;display:inline-block;animation:blink 1.5s infinite;font-weight:bold;vertical-align:middle;">NEW ✨</span>\`
          : '';

        const finishTime  = t.finish_timestamp ? parseThaiDateToStandard(t.finish_timestamp) : null;
        const currentTime = new Date();
        let slaText = '', slaStyle = '';

        if (isFinished && finishTime) {
          const timeUsed = (finishTime - createTime) / (1000*60*60);
          slaText  = \`⏱️ ใช้เวลา: \${timeUsed.toFixed(1)} ชม.\`;
          slaStyle = timeUsed > 48 ? 'color:#dc3545;font-weight:bold;' : 'color:#28a745;';
        } else {
          const hoursLeft = 48 - ((currentTime - createTime) / (1000*60*60));
          if (hoursLeft <= 0) {
            slaText  = \`🚨 เกิน SLA: \${Math.abs(hoursLeft).toFixed(1)} ชม.\`;
            slaStyle = 'color:#dc3545;font-weight:bold;animation:blink 1s infinite;';
          } else {
            slaText  = \`⏳ เหลือ: \${hoursLeft.toFixed(1)} ชม.\`;
            slaStyle = hoursLeft <= 12 ? 'color:#ff9800;font-weight:bold;' : 'color:#666;';
          }
        }

        const safeName = (t.name || '').replace(/'/g,'');
        ticketDetailMap[t.queue] = t.detail || '-';

        return \`<tr>
          <td>\${t.name}</td>
          <td style="font-weight:bold;">\${t.queue} \${newIconHtml}</td>
          <td style="font-size:11px;">\${t.detail}</td>
          <td>
            <div style="color:\${isWaiting?'#ff9800':isProcessing?'#007bff':'#28a745'};font-weight:bold;">\${statusIcon} \${statusClean}</div>
            <div style="font-size:10px;margin-top:4px;\${slaStyle}">\${slaText}</div>
          </td>
          <td>
            <div>\${t.admin || '-'}</div>
            <div style="font-size:9px;color:#999;margin-top:2px;">\${t.finish_timestamp ? '🏁 ' + new Date(t.finish_timestamp).toLocaleString('th-TH') : ''}</div>
          </td>
          <td>
            <button style="padding:5px;width:60px;font-size:11px;margin-bottom:2px;border:none;border-radius:6px;font-weight:bold;color:white;background:\${isWaiting?'#b39ddb':'#ccc'};cursor:\${isWaiting?'pointer':'not-allowed'};"
              \${!isWaiting?'disabled':''} onclick="updateTicketStatus('\${t.queue}','กำลังดำเนินการ')">รับงาน</button>
            <button style="padding:5px;width:60px;font-size:11px;margin-bottom:2px;border:none;border-radius:6px;font-weight:bold;color:white;background:\${isProcessing?'#28a745':'#ccc'};cursor:\${isProcessing?'pointer':'not-allowed'};"
              \${!isProcessing?'disabled':''} onclick="openCloseModal('\${t.queue}','\${safeName}')">ปิดงาน</button>
          </td>
        </tr>\`;
      }).join('');

      if (mobileList) {
        const mobileCards = tickets.map(t => {
          const statusClean  = (t.status || '').trim();
          const isWaiting    = statusClean === 'รอดำเนินการ' || statusClean === 'ใหม่';
          const isProcessing = statusClean === 'กำลังดำเนินการ';
          const createTime   = parseThaiDateToStandard(t.timestamp);
          const hoursLeft    = 48 - ((new Date() - createTime) / (1000*60*60));
          const slaText      = hoursLeft <= 0 ? \`🚨 เกิน SLA: \${Math.abs(hoursLeft).toFixed(1)} ชม.\` : \`⏳ เหลือ \${hoursLeft.toFixed(1)} ชม.\`;
          const slaColor     = hoursLeft <= 0 ? '#dc3545' : hoursLeft <= 12 ? '#ff9800' : '#666';
          const borderColor  = isProcessing ? '#5DCAA5' : hoursLeft <= 0 ? '#dc3545' : '#FAC775';
          const safeName     = (t.name || '').replace(/'/g,'');
          return \`<div style="background:white;border-radius:14px;border:1px solid #eee;border-left:4px solid \${borderColor};padding:14px;margin-bottom:10px;box-shadow:0 2px 6px rgba(0,0,0,0.05);">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px;">
              <div style="flex:1;">
                <p style="font-size:13px;font-weight:600;margin:0;color:#222;">\${t.name}</p>
                <p style="font-size:11px;color:#888;margin:3px 0 0;">\${t.detail}</p>
              </div>
              <span style="font-size:11px;background:#f0ecff;color:#6f42c1;padding:3px 10px;border-radius:999px;white-space:nowrap;margin-left:8px;">\${t.queue}</span>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin:8px 0;">
              <span style="font-size:12px;color:\${isWaiting?'#ff9800':isProcessing?'#007bff':'#28a745'};font-weight:600;">\${isWaiting?'🕐':isProcessing?'⚙️':'✅'} \${statusClean}</span>
              <span style="font-size:11px;color:\${slaColor};">\${slaText}</span>
            </div>
            <div style="display:flex;gap:8px;margin-top:10px;">
              <button style="flex:1;padding:8px;border-radius:999px;border:none;font-size:12px;font-weight:bold;background:\${isWaiting?'#b39ddb':'#e0e0e0'};color:\${isWaiting?'white':'#aaa'};cursor:\${isWaiting?'pointer':'not-allowed'};"
                \${!isWaiting?'disabled':''} onclick="updateTicketStatus('\${t.queue}','กำลังดำเนินการ')">รับงาน</button>
              <button style="flex:1;padding:8px;border-radius:999px;border:none;font-size:12px;font-weight:bold;background:\${isProcessing?'#66bb6a':'#e0e0e0'};color:\${isProcessing?'white':'#aaa'};cursor:\${isProcessing?'pointer':'not-allowed'};"
                \${!isProcessing?'disabled':''} onclick="openCloseModal('\${t.queue}','\${safeName}')">ปิดงาน</button>
            </div>
          </div>\`;
        }).join('');

        mobileList.innerHTML = mobileCards +
          \`<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px;">
            <button id="mobileRefresh" style="padding:12px;border-radius:12px;border:none;background:#b39ddb;color:white;font-size:13px;font-weight:bold;cursor:pointer;">🔄 รีเฟรช</button>
            <button id="mobileLogout"  style="padding:12px;border-radius:12px;border:none;background:#ffab91;color:white;font-size:13px;font-weight:bold;cursor:pointer;">🚪 ออก</button>
          </div>\`;
        document.getElementById('mobileRefresh')?.addEventListener('click', loadAdminTickets);
        document.getElementById('mobileLogout')?.addEventListener('click', logout);
      }

    } catch (e) {
      tbody.innerHTML = \`<tr><td colspan="6" class="text-center" style="color:#dc3545;">❌ โหลดข้อมูลไม่สำเร็จ: \${e.message}</td></tr>\`;
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
      html: \`<div style="font-size:13px;margin-top:-8px;color:#555;">คิว \${queue}</div>\`,
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
    document.getElementById('resolutionInput').value = 'การตรวจสอบ : \\nดำเนินการ : \\nสถานะ : ';
    document.getElementById('resolutionModal').style.display = 'flex';
  }

  async function submitCloseTicket() {
    const resInput = document.getElementById('resolutionInput');
    if (!resInput) return;
    const res          = resInput.value.trim();
    const templateText = 'การตรวจสอบ : \\nดำเนินการ : \\nสถานะ : ';

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

    const lines   = res.split('\\n');
    const isEmpty = lines.some(line => {
      if (!line.includes(':')) return false;
      return line.split(':').slice(1).join(':').trim() === '';
    });
    if (isEmpty)
      return Swal.fire({ icon:'warning', title:'กรอกข้อมูลไม่ครบ', html:\`<div style="font-size:13px;color:#555;">กรุณากรอกข้อมูลหลัง <b>":"</b> ให้ครบทุกบรรทัดค่ะ</div>\`, width:'280px', confirmButtonText:'กลับไปกรอก', confirmButtonColor:'#b39ddb', didOpen:styleCutePopup });

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
      ? \`<div style="background:#f8f9fa;border-radius:8px;padding:10px;margin:10px 0;font-size:13px;text-align:left;">
          <div><b>คิว:</b> \${queueNum}</div>
          <div><b>ประเภท:</b> \${actualDetail.type||'-'}</div>
          <div><b>ระบบ/อุปกรณ์:</b> \${actualDetail.system||'-'}</div>
          <div><b>รายละเอียด:</b> \${actualDetail.detail||'-'}</div>
         </div>\`
      : \`<p>คิวหมายเลข: <b>\${pendingQueue}</b></p>\`;

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
      html: \`
        <div style="font-size:13px;color:#555;margin-bottom:12px;">กรุณายืนยันตัวตนเพื่อตั้งรหัสผ่านใหม่</div>
        <div style="text-align:left;font-size:13px;font-weight:bold;margin-bottom:4px;">ชื่อผู้ใช้งาน (Username)</div>
        <input id="swal-forgot-user" class="swal2-input" placeholder="เช่น somying.r" style="margin:0 0 10px 0;width:100%;height:35px;font-size:13px;box-sizing:border-box;display:block;">
        <div style="text-align:left;font-size:13px;font-weight:bold;margin-bottom:4px;">ชื่อ-นามสกุล (ภาษาไทย)</div>
        <input id="swal-forgot-nameTh" class="swal2-input" placeholder="เช่น ณัฐอนงค์ แสงจันทร์งาม" style="margin:0 0 10px 0;width:100%;height:35px;font-size:13px;box-sizing:border-box;display:block;">
        <hr style="border:0;border-top:1px dashed #ccc;margin:12px 0;">
        <div style="text-align:left;font-size:13px;font-weight:bold;color:#0056b3;margin-bottom:4px;">ตั้งรหัสผ่านใหม่</div>
        <input id="swal-forgot-newpass" type="password" class="swal2-input" placeholder="รหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)" style="margin:0 0 6px 0;width:100%;height:35px;font-size:13px;box-sizing:border-box;display:block;">
      <div style="background:#fff8e1;border:1px solid #ffe082;border-radius:6px;padding:8px 10px;font-size:11px;color:#795548;line-height:1.7;text-align:left;">
        🔐 <b>เงื่อนไขรหัสผ่าน:</b><br>
        ✅ ความยาวอย่างน้อย 8 ตัวอักษร<br>
        ✅ ตัวพิมพ์ใหญ่ A-Z อย่างน้อย 1 ตัว<br>
        ✅ ตัวพิมพ์เล็ก a-z อย่างน้อย 1 ตัว<br>
        ✅ ตัวเลข 0-9 อย่างน้อย 1 ตัว<br>
        ✅ อักขระพิเศษ เช่น !@#$% อย่างน้อย 1 ตัว
      </div>
    \`,
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
        if (!/[!@#$%^&*()_+\\-=\\[\\]{};':"\\\\|,.<>\\/?]/.test(p)) { Swal.showValidationMessage('รหัสผ่านต้องมีอักขระพิเศษ เช่น !@#$% อย่างน้อย 1 ตัวค่ะ'); return false; }
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
      if (userBox)  userBox.classList.add('hidden');
      if (adminBox) adminBox.classList.remove('hidden');
      if (btnToAdmin) btnToAdmin.style.display = 'none';
      if (btnToUser) { btnToUser.style.display = 'inline-block'; document.getElementById('switch-text').innerText = 'สลับ User'; }
    } else {
      if (adminBox) adminBox.classList.add('hidden');
      if (userBox)  userBox.classList.remove('hidden');
      const adminNameTxt = document.getElementById('displayAdmin').innerText;
      if (adminNameTxt) document.getElementById('displayUser').innerText = adminNameTxt;
      const adminLoginName = document.getElementById('username').value.trim();
      if (adminLoginName) document.getElementById('user_email').value = adminLoginName.includes('@') ? adminLoginName : adminLoginName + '@fishmarket.co.th';
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
      const urlParams = new URLSearchParams(window.location.search);
      const q = urlParams.get('q');
      if (q) {
        fetch(API, { method:'POST', body:JSON.stringify({ action:'get_ticket_detail', queue:q }) })
          .then(r => r.json())
          .then(detail => { if (detail) showRatingPopup(detail, false, q, null); })
          .catch(e => console.log('URL param detail error:', e));
      }
    } catch(err) { console.log('URL Params Error:', err); }
  };`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Serve style.css
    if (url.pathname === '/style.css') {
      return new Response(CSS, {
        headers: { 
          'Content-Type': 'text/css; charset=utf-8',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Serve script.js
    if (url.pathname === '/script.js') {
      return new Response(JS, {
        headers: { 
          'Content-Type': 'text/javascript; charset=utf-8',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Default serve index.html
    return new Response(HTML, {
      headers: { 
        'Content-Type': 'text/html; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};
