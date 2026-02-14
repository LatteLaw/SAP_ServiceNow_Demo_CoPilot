/* SAP ECC6 Mock (SU01 Role Copy) - single page app */

let DATA = null;

const state = {
  system: null,
  session: { client: "", user: "", password: "", lang: "" },
  currentScreen: "saplogon",
  tcode: "",
  currentUser: null,       // user object
  clipboardRoles: [],      // roles copied from source
  lastSearch: { lastName: "", results: [] },
  editMode: false
};

const els = {
  nativeTitleText: document.getElementById("nativeTitleText"),
  menu: document.getElementById("menu"),
  shell: document.getElementById("shell"),
  shellTitle: document.getElementById("shellTitle"),
  tcodeBadge: document.getElementById("tcodeBadge"),
  sidBadge: document.getElementById("sidBadge"),
  toolbar: document.getElementById("toolbar"),
  content: document.getElementById("content"),
  statusMsg: document.getElementById("statusMsg"),
  btnEnter: document.getElementById("btnEnter"),
  btnBack: document.getElementById("btnBack"),
  btnExit: document.getElementById("btnExit"),
  modalBackdrop: document.getElementById("modalBackdrop"),
  modal: document.getElementById("modal"),
  modalTitle: document.getElementById("modalTitle"),
  modalTabs: document.getElementById("modalTabs"),
  modalBody: document.getElementById("modalBody"),
  modalActions: document.getElementById("modalActions"),
  modalClose: document.getElementById("modalClose")
};

function setStatus(msg){
  els.statusMsg.textContent = msg;
}

function showShell(on){
  els.shell.style.display = on ? "flex" : "none";
}

function setTitle(nativeTitle, shellTitle, tcode){
  els.nativeTitleText.textContent = nativeTitle || "SAP";
  els.shellTitle.textContent = shellTitle || "SAP";
  if(tcode){
    els.tcodeBadge.style.display = "inline-block";
    els.tcodeBadge.textContent = tcode;
  }else{
    els.tcodeBadge.style.display = "none";
    els.tcodeBadge.textContent = "";
  }
}

function qs(sel){ return document.querySelector(sel); }
function qsa(sel){ return [...document.querySelectorAll(sel)]; }

function openModal({title, width="720px", tabs=null, bodyHtml="", actions=[]}){
  els.modal.style.width = width;
  els.modalTitle.querySelector("span").textContent = title;
  els.modalBody.innerHTML = bodyHtml;
  els.modalActions.innerHTML = "";
  els.modalTabs.innerHTML = "";
  if(tabs && tabs.length){
    els.modalTabs.style.display = "flex";
    tabs.forEach((t, idx)=>{
      const d = document.createElement("div");
      d.className = "m-tab" + (idx===0 ? " active" : "");
      d.textContent = t;
      els.modalTabs.appendChild(d);
    });
  }else{
    els.modalTabs.style.display = "none";
  }
  actions.forEach(a=>{
    const b = document.createElement("button");
    b.className = "btn" + (a.primary ? " primary" : "") + (a.danger ? " danger" : "");
    b.textContent = a.text;
    b.disabled = !!a.disabled;
    b.addEventListener("click", ()=>a.onClick && a.onClick());
    els.modalActions.appendChild(b);
  });

  els.modalBackdrop.style.display = "flex";
  els.modalBackdrop.setAttribute("aria-hidden","false");
}

function closeModal(){
  els.modalBackdrop.style.display = "none";
  els.modalBackdrop.setAttribute("aria-hidden","true");
}

els.modalClose.addEventListener("click", closeModal);
els.modalBackdrop.addEventListener("click", (e)=>{ if(e.target === els.modalBackdrop) closeModal(); });

function userById(userId){
  return DATA.users.find(u => u.userId.toUpperCase() === String(userId||"").toUpperCase()) || null;
}
function usersByLastName(lastName){
  const ln = String(lastName||"").trim().toUpperCase();
  if(!ln) return [];
  return DATA.users.filter(u => (u.lastName||"").toUpperCase().includes(ln));
}

function screenHtml_saplogon(){
  const rows = DATA.systems.map((s, i)=>`
    <tr data-idx="${i}" class="${i===0?'selected':''}">
      <td>${s.name}</td><td>${s.name.includes("Production")?"":" "}</td><td>${s.sid}</td>
    </tr>`).join("");

  return `
    <div class="panel">
      <div class="split">
        <div class="leftpane">
          <div class="muted" style="margin-bottom:10px;"><b>Workspaces</b></div>
          <div class="badge" style="display:inline-block;">Local</div>
        </div>
        <div class="rightpane">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
            <div class="muted"><b>Connections</b></div>
            <button class="btn primary" id="btnLogon">Log On</button>
          </div>
          <table class="grid" id="sysTable">
            <thead><tr><th>Name</th><th>System Description</th><th>SID</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
          <div class="muted" style="margin-top:10px;">Tip: select a system and click <span class="kbd">Log On</span>.</div>
        </div>
      </div>
    </div>
  `;
}

function screenHtml_login(){
  const d = DATA.defaults;
  return `
    <div class="panel">
      <div class="fieldrow"><div class="label">Client</div><input id="loginClient" class="input small" value="${d.client}"/></div>
      <div class="fieldrow"><div class="label">User</div><input id="loginUser" class="input" value="${d.user}"/></div>
      <div class="fieldrow"><div class="label">Password</div><input id="loginPass" class="input" value="${d.password}" type="password"/></div>
      <div class="fieldrow"><div class="label">Logon Language</div><input id="loginLang" class="input small" value="${d.language}"/></div>
      <div class="row-actions">
        <button class="btn primary" id="btnLogin">Enter</button>
      </div>
      <div class="muted">Mock login only. Use <span class="kbd">Enter</span> to continue.</div>
    </div>
  `;
}

function screenHtml_easyaccess(){
  return `
    <div class="panel">
      <div class="command">
        <input id="commandField" class="input" placeholder="" />
        <div class="hint">Type a transaction (e.g. <span class="kbd">SU01</span>) and press <span class="kbd">Enter</span>.</div>
      </div>
      <div class="note" style="margin-top:14px;">
        Practice flow: <b>SU01 → search user “Lang” → open roles → copy → search target → paste → save</b>.
      </div>
    </div>
  `;
}

function screenHtml_su01_initial(){
  return `
    <div class="panel">
      <div class="muted" style="margin-bottom:8px;"><b>User Maintenance: Initial Screen</b></div>
      <div class="fieldrow">
        <div class="label">User</div>
        <input id="su01User" class="input" value="${state.currentUser ? state.currentUser.userId : ""}" />
        <button class="helpicon" id="btnUserHelp" title="Search Help">⧉</button>
      </div>
      <div class="fieldrow"><div class="label">Alias</div><input class="input long" id="su01Alias" value=""/></div>
      <div class="row-actions">
        <button class="btn primary" id="btnDisplay">Display</button>
        <button class="btn" id="btnClear">Clear</button>
      </div>
      <div class="muted">Tip: click the search help icon to find a user by last name (e.g. Lang).</div>
    </div>
  `;
}

function screenHtml_maintainUsers(tab="Address"){
  const u = state.currentUser;
  if(!u){
    return `<div class="panel"><b>No user loaded.</b></div>`;
  }
  const tabNames = ["Documentation","Address","Logon Data","SNC","Defaults","Parameters","Roles","Profiles","Groups","Personal..."];
  const tabs = tabNames.map(t=>`<div class="tab ${t===tab?'active':''}" data-tab="${t}">${t}</div>`).join("");

  const header = `
    <div style="display:flex; gap:14px; align-items:center; flex-wrap:wrap;">
      <div class="fieldrow" style="margin:0;"><div class="label" style="width:70px;">User</div><input class="input" id="muUser" value="${u.userId}" disabled></div>
      <div class="fieldrow" style="margin:0;"><div class="label" style="width:90px;">Changed By</div><input class="input small" value="SUPPORT" disabled></div>
      <div class="fieldrow" style="margin:0;"><div class="label" style="width:90px;">Date/Time</div><input class="input long" value="26.10.2025 16:12:11" disabled></div>
      <div class="fieldrow" style="margin:0;"><div class="label" style="width:70px;">Status</div><input class="input" id="muStatus" value="${state.editMode ? "Editing" : "Saved"}" disabled></div>
      <div style="margin-left:auto; display:flex; gap:10px;">
        <button class="btn ${state.editMode?'':'primary'}" id="btnEdit">${state.editMode ? "Cancel" : "Edit (pencil)"}</button>
        <button class="btn primary" id="btnSave" ${state.editMode ? "" : "disabled"}>Save</button>
      </div>
    </div>`;

  const addressBody = `
    <div class="fieldrow"><div class="label">Title</div><input class="input" value="Mr." ${state.editMode?"":"disabled"}></div>
    <div class="fieldrow"><div class="label">Last name</div><input class="input" value="${u.lastName}" ${state.editMode?"":"disabled"}></div>
    <div class="fieldrow"><div class="label">First name</div><input class="input" value="${u.firstName}" ${state.editMode?"":"disabled"}></div>
    <div class="fieldrow"><div class="label">Department</div><input class="input long" value="${u.department}" ${state.editMode?"":"disabled"}></div>
    <div class="fieldrow"><div class="label">Company</div><input class="input" value="${u.company}" ${state.editMode?"":"disabled"}></div>
  `;

  const rolesBody = renderRolesTab(u);

  return `
    <div class="panel">
      ${header}
      <div class="tabs" id="muTabs">${tabs}</div>
      <div id="tabBody" style="padding-top:12px;">
        ${tab==="Roles" ? rolesBody : addressBody}
      </div>
    </div>
  `;
}

function renderRolesTab(u){
  const rows = (u.roles||[]).map((r, idx)=>`
    <tr data-ridx="${idx}">
      <td style="width:28px;"><input type="checkbox" class="roleSelect" data-ridx="${idx}"></td>
      <td><span class="greendot"></span></td>
      <td>${r.role}</td>
      <td>${r.type||" "}</td>
      <td>${r.start}</td>
      <td>${r.end}</td>
      <td>${r.desc}</td>
    </tr>
  `).join("");

  return `
    <div class="fieldrow" style="margin-top:0;">
      <div class="label">Reference User</div>
      <input class="input long" id="refUser" value="" ${state.editMode?"":"disabled"} />
      <button class="helpicon" id="btnRefHelp" title="Search Help" ${state.editMode?"":"disabled"}>⧉</button>
      <div style="margin-left:auto" class="muted">Clipboard roles: <b>${state.clipboardRoles.length}</b></div>
    </div>

    <div class="role-toolbar">
      <button class="rtbtn" title="Find"></button>
      <button class="rtbtn" title="Filter"></button>
      <button class="rtbtn" title="Sort"></button>
      <button class="rtbtn" title="Layout"></button>
      <span class="rtlabel"><span class="greendot"></span>User master record</span>
      <span class="rtlabel">Role</span>
    </div>

    <table class="grid" id="rolesGrid">
      <thead>
        <tr>
          <th style="width:28px;"></th>
          <th style="width:40px;">Status</th>
          <th>Role</th>
          <th style="width:40px;">Ty.</th>
          <th style="width:110px;">Start Date</th>
          <th style="width:110px;">End Date</th>
          <th>Short Role Description</th>
        </tr>
      </thead>
      <tbody>${rows || ""}</tbody>
    </table>

    <div class="row-actions" style="justify-content:space-between;">
      <div class="muted">Select roles then copy/paste. You must be in <b>Edit</b> mode to paste.</div>
      <div style="display:flex; gap:10px;">
        <button class="btn" id="btnCopyRoles">Copy roles</button>
        <button class="btn primary" id="btnPasteRoles" ${state.editMode && state.clipboardRoles.length ? "" : "disabled"}>Paste roles</button>
      </div>
    </div>
  `;
}

function mountScreen(screen){
  state.currentScreen = screen;
  els.content.innerHTML = "";
  closeModal();

  // switch shell visibility
  if(screen === "saplogon"){
    showShell(false);
    setTitle("SAP Logon 770", "SAP", "");
    els.menu.style.display = "flex";
  }else if(screen === "login"){
    showShell(true);
    els.menu.style.display = "flex";
    setTitle("SAP", "SAP", "");
  }else if(screen === "easyaccess"){
    showShell(true);
    els.menu.style.display = "flex";
    setTitle("SAP Easy Access", "SAP", "");
  }else if(screen.startsWith("su01")){
    showShell(true);
    els.menu.style.display = "flex";
    setTitle("User Maintenance: Initial Screen", "SAP", "SU01");
  }else if(screen.startsWith("maintain")){
    showShell(true);
    els.menu.style.display = "flex";
    setTitle("Maintain Users", "SAP", "SU01");
  }

  if(screen === "saplogon"){
    els.content.innerHTML = screenHtml_saplogon();
    wire_saplogon();
    setStatus("Select a system and click Log On.");
  }
  if(screen === "login"){
    els.content.innerHTML = screenHtml_login();
    wire_login();
    setStatus("Enter credentials and press Enter.");
  }
  if(screen === "easyaccess"){
    els.content.innerHTML = screenHtml_easyaccess();
    wire_easyaccess();
    setStatus("Ready.");
  }
  if(screen === "su01_initial"){
    els.content.innerHTML = screenHtml_su01_initial();
    wire_su01_initial();
    setStatus("User Maintenance: Initial Screen.");
  }
  if(screen.startsWith("maintain:")){
    const tab = screen.split(":")[1] || "Address";
    els.content.innerHTML = screenHtml_maintainUsers(tab);
    wire_maintain(tab);
    setStatus("Maintain Users.");
  }
}

/* --- Wiring --- */

function wire_saplogon(){
  const table = qs("#sysTable tbody");
  qsa("#sysTable tbody tr").forEach(tr=>{
    tr.addEventListener("click", ()=>{
      qsa("#sysTable tbody tr").forEach(x=>x.classList.remove("selected"));
      tr.classList.add("selected");
      const idx = Number(tr.getAttribute("data-idx"));
      state.system = DATA.systems[idx];
      els.sidBadge.textContent = "S000";
      setStatus(`Selected: ${state.system.name}`);
    });
  });
  state.system = DATA.systems[0];

  qs("#btnLogon").addEventListener("click", ()=>{
    mountScreen("login");
  });
}

function wire_login(){
  qs("#btnLogin").addEventListener("click", doLogin);
  ["loginClient","loginUser","loginPass","loginLang"].forEach(id=>{
    qs("#"+id).addEventListener("keydown", (e)=>{ if(e.key==="Enter"){ doLogin(); } });
  });
}

function doLogin(){
  state.session.client = qs("#loginClient").value.trim();
  state.session.user = qs("#loginUser").value.trim();
  state.session.password = qs("#loginPass").value;
  state.session.lang = qs("#loginLang").value.trim().toUpperCase() || "EN";
  setStatus("Logging on...");

  if(DATA.defaults.showMultipleLogonPopup){
    openModal_multipleLogon();
  }else{
    mountScreen("easyaccess");
  }
}

function openModal_multipleLogon(){
  openModal({
    title: "License Information for Multiple Logon",
    width: "720px",
    bodyHtml: `
      <div class="muted" style="margin-bottom:8px;">
        <b>User ${state.session.user.toUpperCase()}</b> is already logged on in client ${state.session.client}
      </div>
      <div class="muted" style="margin-bottom:14px;">
        (Terminal 10.216.154.71 - ELCNB7244, since 19.01.2026, 10:50:18)
      </div>
      <div class="muted" style="margin-bottom:10px;">
        Note that multiple logons to the production system using the same user ID are not part of the SAP licence agreement.
      </div>
      <div class="radio"><input type="radio" name="ml" id="ml1"/><label for="ml1">
        Continue with this logon and end any other logons in system<br/>
        <span class="muted">When ending any existing logons to system, unsaved data is lost.</span>
      </label></div>
      <div class="radio"><input type="radio" name="ml" id="ml2"/><label for="ml2">
        Continue with this logon, without ending any other logons in system<br/>
        <span class="muted">SAP reserves the right to view this information.</span>
      </label></div>
      <div class="radio"><input type="radio" name="ml" id="ml3" checked/><label for="ml3">Terminate this logon</label></div>
    `,
    actions: [
      {text:"✓ Continue", primary:true, onClick: ()=>{
        const terminate = qs("#ml3").checked;
        closeModal();
        if(terminate){
          setStatus("Logon terminated.");
        }else{
          mountScreen("easyaccess");
        }
      }},
      {text:"✕ Cancel", danger:true, onClick: ()=>{ closeModal(); setStatus("Cancelled."); }}
    ]
  });
}

function wire_easyaccess(){
  const cmd = qs("#commandField");
  cmd.focus();
  cmd.addEventListener("keydown", (e)=>{
    if(e.key==="Enter"){
      const v = cmd.value.trim().toUpperCase();
      if(v==="SU01"){
        state.tcode = "SU01";
        mountScreen("su01_initial");
      }else if(v){
        setStatus(`Transaction ${v} not implemented in mock. Try SU01.`);
      }
    }
  });
}

function wire_su01_initial(){
  const inp = qs("#su01User");
  inp.addEventListener("keydown",(e)=>{ if(e.key==="Enter"){ displayUser(); } });

  qs("#btnDisplay").addEventListener("click", displayUser);
  qs("#btnClear").addEventListener("click", ()=>{
    state.currentUser = null;
    inp.value = "";
    setStatus("Cleared.");
  });
  qs("#btnUserHelp").addEventListener("click", openUserSearch);
}

function openUserSearch(){
  openModal({
    title: "User Name in User Master Record (1)",
    width: "720px",
    tabs: ["Users by Description", "Users by Address Data", "Users by Logon Data Us..."],
    bodyHtml: `
      <div class="fieldrow"><div class="label" style="width:120px;">User</div><input class="input" id="srchUser" value=""/></div>
      <div class="fieldrow"><div class="label" style="width:120px;">Last name</div><input class="input long" id="srchLast" value="${state.lastSearch.lastName||""}"/></div>
      <div class="fieldrow"><div class="label" style="width:120px;">First name</div><input class="input long" id="srchFirst" value=""/></div>
      <div class="muted" style="margin-top:8px;">Enter last name (e.g. <b>Lang</b>) then click Start Search.</div>
      <div style="margin-top:12px;" id="srchResults"></div>
    `,
    actions: [
      {text:"Start Search", primary:true, onClick: ()=>{ doUserSearch(); }},
      {text:"Close", onClick: ()=>{ closeModal(); }}
    ]
  });

  const last = qs("#srchLast");
  last.focus();
  last.addEventListener("keydown",(e)=>{ if(e.key==="Enter"){ doUserSearch(); } });
}

function doUserSearch(){
  const ln = qs("#srchLast").value.trim();
  state.lastSearch.lastName = ln;
  const results = usersByLastName(ln);
  state.lastSearch.results = results;
  const box = qs("#srchResults");
  if(!results.length){
    box.innerHTML = `<div class="muted">No entries found.</div>`;
    return;
  }
  const rows = results.map((u, idx)=>`
    <tr data-sidx="${idx}">
      <td>${u.userId}</td><td>${u.lastName.toUpperCase()}</td><td>${u.firstName.toUpperCase()}</td>
      <td>${u.department}</td><td>${u.company}</td><td>${u.company}</td><td>${u.company}</td>
    </tr>`).join("");
  box.innerHTML = `
    <div class="muted" style="margin-bottom:6px;"><b>${results.length} Entry found</b></div>
    <table class="grid" id="srchTable">
      <thead>
        <tr>
          <th>User Name</th><th>Last name</th><th>First name</th><th>Department</th><th>Company</th><th>Company in user's address</th><th>City</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="muted" style="margin-top:8px;">Click a row to select then double-click to choose.</div>
  `;

  qsa("#srchTable tbody tr").forEach(tr=>{
    tr.addEventListener("click", ()=>{
      qsa("#srchTable tbody tr").forEach(x=>x.classList.remove("selected"));
      tr.classList.add("selected");
    });
    tr.addEventListener("dblclick", ()=>{
      const idx = Number(tr.getAttribute("data-sidx"));
      const u = results[idx];
      state.currentUser = JSON.parse(JSON.stringify(u)); // clone
      closeModal();
      mountScreen("maintain:Address");
      setStatus(`Loaded user ${u.userId}.`);
    });
  });
}

function displayUser(){
  const id = qs("#su01User").value.trim();
  const u = userById(id);
  if(!u){
    setStatus(`User ${id} not found.`);
    openModal({
      title: "Information",
      width:"520px",
      bodyHtml:`<div class="muted">User <b>${id || "(blank)"}</b> does not exist.</div>`,
      actions:[{text:"OK", primary:true, onClick: closeModal}]
    });
    return;
  }
  state.currentUser = JSON.parse(JSON.stringify(u));
  mountScreen("maintain:Address");
  setStatus(`Loaded user ${u.userId}.`);
}

function wire_maintain(tab){
  qsa("#muTabs .tab").forEach(t=>{
    t.addEventListener("click", ()=>{
      const name = t.getAttribute("data-tab");
      mountScreen("maintain:" + name);
    });
  });

  qs("#btnEdit").addEventListener("click", ()=>{
    state.editMode = !state.editMode;
    mountScreen("maintain:" + tab);
    setStatus(state.editMode ? "Edit mode enabled." : "Edit cancelled.");
  });

  qs("#btnSave").addEventListener("click", ()=>{
    // persist changes back into DATA
    const idx = DATA.users.findIndex(x => x.userId.toUpperCase() === state.currentUser.userId.toUpperCase());
    if(idx >= 0){
      DATA.users[idx] = JSON.parse(JSON.stringify(state.currentUser));
    }
    state.editMode = false;
    mountScreen("maintain:" + tab);
    setStatus("Data was saved.");
    openModal({
      title:"Information",
      width:"520px",
      bodyHtml:`<div class="muted">Data was saved for user <b>${state.currentUser.userId}</b>.</div>`,
      actions:[{text:"OK", primary:true, onClick: closeModal}]
    });
  });

  if(tab === "Roles"){
    const copyBtn = qs("#btnCopyRoles");
    const pasteBtn = qs("#btnPasteRoles");

    copyBtn.addEventListener("click", ()=>{
      const checked = qsa(".roleSelect:checked").map(x=>Number(x.getAttribute("data-ridx")));
      const roles = checked.length ? checked.map(i=>state.currentUser.roles[i]) : (state.currentUser.roles||[]);
      state.clipboardRoles = JSON.parse(JSON.stringify(roles));
      setStatus(`Copied ${state.clipboardRoles.length} role(s) to clipboard.`);
      mountScreen("maintain:Roles");
    });

    pasteBtn.addEventListener("click", ()=>{
      if(!state.editMode){
        setStatus("Enable Edit mode before pasting.");
        return;
      }
      const existing = new Set((state.currentUser.roles||[]).map(r=>r.role));
      let added = 0;
      state.clipboardRoles.forEach(r=>{
        if(!existing.has(r.role)){
          state.currentUser.roles.push(JSON.parse(JSON.stringify(r)));
          added += 1;
        }
      });
      setStatus(`Pasted ${added} new role(s).`);
      mountScreen("maintain:Roles");
    });
  }
}

/* Toolbar global buttons */
els.btnExit.addEventListener("click", ()=>{
  state.currentUser = null;
  state.tcode = "";
  state.editMode = false;
  mountScreen("easyaccess");
  setStatus("Exited to SAP Easy Access.");
});

els.btnBack.addEventListener("click", ()=>{
  if(state.currentScreen.startsWith("maintain")){
    state.editMode = false;
    mountScreen("su01_initial");
    setStatus("Back to User Maintenance: Initial Screen.");
  }else if(state.currentScreen === "su01_initial"){
    mountScreen("easyaccess");
  }else if(state.currentScreen === "login"){
    mountScreen("saplogon");
  }
});

/* Enter button */
els.btnEnter.addEventListener("click", ()=>{
  // mimic Enter key depending on screen
  if(state.currentScreen === "login"){
    doLogin();
  }else if(state.currentScreen === "easyaccess"){
    const cmd = qs("#commandField");
    if(cmd) cmd.dispatchEvent(new KeyboardEvent("keydown", {key:"Enter"}));
  }else if(state.currentScreen === "su01_initial"){
    displayUser();
  }
});

/* Load data then start */
fetch("data.json")
  .then(r=>r.json())
  .then(j=>{
    DATA = j;
    state.system = DATA.systems[0];
    state.session.client = DATA.defaults.client;
    state.session.user = DATA.defaults.user;
    state.session.password = DATA.defaults.password;
    state.session.lang = DATA.defaults.language;

    // Start at SAP Logon
    showShell(false);
    mountScreen("saplogon");
  })
  .catch(err=>{
    console.error(err);
    els.content.innerHTML = `<div class="panel"><b>Failed to load data.json</b></div>`;
  });