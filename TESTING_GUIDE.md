# SAP Demo Interface - Testing Guide for Copilot Studio Agent

## Complete Workflow with All 4 Popups

### **Test Scenario: Delegate Release Codes from JSMITH to MJONES**

---

## **Page 1: SAP Login**
**File:** `sap-login.html`

**Actions:**
1. Open `sap-login.html` in browser
2. Fields are pre-filled:
   - Client: 100
   - User: SAPBOT  
   - Password: ****
3. Click **"Logon"** button
4. ✅ Navigates to SU01 Old Approver page

---

## **Page 2: SU01 Display JSMITH (Old Approver)**
**File:** `su01-old-approver.html`

**What to See:**
- User JSMITH displayed
- 3 roles shown in table:
  - YOTH_PROC_APPROVE_PO_33
  - YOTH_PROC_APPROVE_PO_45
  - YOTH_PROC_APPROVE_PO_78
- **Command field** at top (below transaction field)

**Actions for Agent:**
1. Click in **command field**
2. Type: `/nSU01` (or just `SU01`)
3. Press **Enter**
4. **✅ POPUP #1 APPEARS:** "Do you want to navigate away from this screen?"
   - Click **"Yes"** button
5. ✅ Navigates to SU01 New Approver page

---

## **Page 3: SU01 Change MJONES (New Approver)**
**File:** `su01-new-approver.html`

**What to See:**
- User MJONES in change mode
- Empty role input container (no table)
- One empty role input row with:
  - Text input field
  - **F4** button (search help)
  - **✕** button (delete row)
- **"+ Add Role"** button
- **"Save"** button

**Actions for Agent:**
1. **Option A - Type role manually:**
   - Click in role input field
   - Type: `YOTH_PROC_APPROVE_PO_33`
   - Click **"+ Add Role"** to add another row
   - Type: `YOTH_PROC_APPROVE_PO_45`
   - Click **"+ Add Role"** again
   - Type: `YOTH_PROC_APPROVE_PO_78`

2. **Option B - Use F4 Search (RECOMMENDED FOR TESTING POPUP #2):**
   - Click **F4** button next to first input
   - **✅ POPUP #2 APPEARS:** "Search Help - Roles" modal
     - See list of 13+ roles
     - Type in search box: `YOTH_PROC` (filters list)
     - Click on role: `YOTH_PROC_APPROVE_PO_33` (row highlights blue)
     - Click **"Select"** button
   - ✅ Modal closes, role populates in input field
   - Repeat for roles 45 and 78 (click "+ Add Role" between each)

3. After entering 3 roles, click **"Save"** button
4. **✅ POPUP #3 APPEARS:** "Save user MJONES with assigned roles?"
   - Click **"Yes"** button
5. ✅ Green message bar appears: "User MJONES saved with 3 role(s)"
6. ✅ Auto-navigates to ZV_T16FW page after 2 seconds

---

## **Page 4: ZV_T16FW Delegation Table**
**File:** `zv-t16fw-table.html`

**What to See:**
- Delegation table with 4 rows
- 3 rows highlighted (JSMITH - release codes 33, 45, 78)
- 1 row (ASMITH - release code 92)
- **Command field** at top
- Rows are clickable (cursor changes to pointer on hover)

**Actions for Agent:**
1. **Double-click** on first JSMITH row (release code 33)
2. **✅ POPUP #4 APPEARS:** "Edit Delegation - Release Code 33" modal
   - Shows:
     - Release Code: 33 (readonly)
     - Cost Center: 1000 (readonly)
     - From User: JSMITH (readonly)
     - To User: [dropdown]
     - Valid From: 01.01.2026 (editable)
     - Valid To: 31.12.2099 (editable)
3. In **"To User"** dropdown, select: **MJONES - Mary Jones**
4. Click **"Save"** button in modal
5. ✅ Modal closes
6. ✅ Row updates: JSMITH → MJONES, row turns green
7. **Repeat** for release codes 45 and 78:
   - Double-click row
   - Select MJONES
   - Save
8. After all 3 JSMITH rows are changed to MJONES:
9. ✅ Auto-navigates to success page after 1.5 seconds

---

## **Page 5: Success Confirmation**
**File:** `zv-t16fw-success.html`

**What to See:**
- Green success box: "Delegation Successfully Updated"
- Details showing:
  - Previous Approver: JSMITH (John Smith)
  - New Approver: MJONES (Mary Jones)
  - Release Codes: 33, 45, 78
  - Effective Date: (today's date)
  - Valid Until: (2 months from today)
- Updated delegation table (3 rows, all showing MJONES)
- Transaction log with timestamps
- **"Return to Main Menu"** button
- **"Print Summary"** button

**Actions for Agent:**
1. Click **"Return to Main Menu"**
2. ✅ Returns to login page (or type `/nex` in command field to logout)

---

## **Summary of 4 Popups Tested:**

| # | Popup Type | Trigger | Purpose |
|---|-----------|---------|---------|
| 1 | **Navigation Confirmation** | Command field `/nSU01` + Enter | Confirm leaving display mode |
| 2 | **F4 Search Help Modal** | Click F4 button | Search and select roles |
| 3 | **Save Confirmation** | Click Save button | Confirm saving user changes |
| 4 | **Edit Modal** | Double-click table row | Edit delegation record |

---

## **Agent Testing Checklist:**

- [ ] Can agent type in command field and press Enter
- [ ] Can agent click "Yes" in navigation popup
- [ ] Can agent click F4 button
- [ ] Can agent type in search box
- [ ] Can agent click on search results
- [ ] Can agent click "Select" button in modal
- [ ] Can agent click "+ Add Role" button
- [ ] Can agent type role names manually
- [ ] Can agent click "Save" button
- [ ] Can agent click "Yes" in save confirmation popup
- [ ] Can agent double-click table rows
- [ ] Can agent select from dropdown in edit modal
- [ ] Can agent click "Save" in edit modal
- [ ] Can agent handle multiple modals/popups in sequence

---

## **Quick Test (Minimal Interactions):**

1. Open `sap-login.html` → Click "Logon"
2. Type `/nSU01` → Press Enter → Click "Yes" popup
3. Click F4 → Type "YOTH_PROC" → Click first role → Click "Select"
4. Click "+ Add Role" → Click F4 → Select second role
5. Click "+ Add Role" → Click F4 → Select third role
6. Click "Save" → Click "Yes" popup
7. Double-click first row → Select MJONES → Click "Save"
8. Double-click second row → Select MJONES → Click "Save"
9. Double-click third row → Select MJONES → Click "Save"
10. ✅ Success page appears

**Total Popups:** 4 (Nav, F4 3x, Save, Edit 3x) = 7 popup interactions

---

## **Notes:**
- All popups use SAP-styled modals (not browser alerts)
- Command fields support `/nSU01`, `/nZV_T16FW`, `/nex` (logout)
- F4 search is live filtering (type to filter results)
- Double-click is standard SAP interaction for editing
- Green message bars appear for 3 seconds then auto-hide
