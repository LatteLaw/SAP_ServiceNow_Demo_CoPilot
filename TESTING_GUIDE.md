Here is the updated **high-fidelity** `TESTING_GUIDE.md`. This version is specifically designed to train your agent on the **Initial Screen** and **Toolbar Icon** patterns it will encounter in the customer's real ECC6 environment.

***

# SAP ECC6 CUA Practice Harness - Testing Guide

## **Objective**
Validate that the Copilot agent can handle real-world SAP ECC6 interaction patterns, specifically:
1. **Initial Screen entry** (User ID + Toolbar Icon).
2. **OK-Code navigation** (Command field `/n` usage).
3. **Icon recognition** (Pencil for Change, Diskette for Save).
4. **Status Bar monitoring** (Success/Error messages at the bottom).

***

## **Workflow: Role Delegation from JSMITH to MJONES**

### **Step 1: SAP Logon**
**File:** `sap-login.html`
1. Click **"Logon"**.
2. ✅ Navigates to the **Initial Entry Screen**.

***

### **Step 2: SU01 Initial Screen (The "Gatekeeper")**
**File:** `su01-initial.html`
*This is the screen where the agent must specify the user and the action.*
1. **Identify** the "User" input field.
2. **Type** `JSMITH`.
3. **Identify** the **Display (Glasses)** icon on the top toolbar.
4. **Click** the Glasses icon.
5. ✅ Navigates to **Display User: JSMITH**.

***

### **Step 3: Exit Display & Enter Change Mode**
**File:** `su01-old-approver.html`
1. **Click** into the **Command Field** (top-left box).
2. **Type** `/nSU01` and press **Enter**.
3. **Wait** for the Initial Screen (`su01-initial.html`) to reload.
4. **Type** `MJONES` into the User field.
5. **Identify** the **Change (Pencil)** icon on the toolbar.
6. **Click** the Pencil icon.
7. ✅ Navigates to **Change User: MJONES**.

***

### **Step 4: Role Assignment & Icon Save**
**File:** `su01-new-approver.html`
1. **Add Roles:** Use the **F4 button** or type manually:
    - `YOTH_PROC_APPROVE_PO_33`
    - `YOTH_PROC_APPROVE_PO_45`
    - `YOTH_PROC_APPROVE_PO_78`
2. **Identify** the **Save (Diskette 💾)** icon on the toolbar.
3. **Click** the Save icon.
4. **Verify:** Check the **Status Bar** (bottom of window) for the green message: *"User MJONES saved"*.
5. ✅ Navigates to ZV_T16FW automatically after 2 seconds.

***

### **Step 5: ZV_T16FW Delegation Table**
**File:** `zv-t16fw-table.html`
1. **Identify** rows belonging to **JSMITH**.
2. **Double-click** the row for Release Code **33**.
3. In the popup, change "To User" to **MJONES**.
4. Click **"Save"** inside the modal.
5. **Repeat** for codes **45** and **78**.
6. ✅ After all 3 are green, navigates to the **Success Page**.

***

## **High-Fidelity Interaction Checklist**

| Interaction Pattern | Required Behavior |
| :--- | :--- |
| **Command Field** | Agent must use `/n` to switch transactions. |
| **Initial Screens** | Agent must type User ID **before** clicking a toolbar icon. |
| **Pencil Icon** | Agent must recognize the Pencil icon for "Change" mode. |
| **Diskette Icon** | Agent must recognize the Diskette icon for "Save". |
| **Double-Click** | Agent must use double-click to open table record details. |
| **Status Bar** | Agent must "read" the bottom-left bar for confirmation. |

***

## **Summary of Navigation Sequence**
`Logon` ➔ `SU01 (Initial)` ➔ `User ID + Glasses` ➔ `Display Screen` ➔ `/nSU01` ➔ `SU01 (Initial)` ➔ `User ID + Pencil` ➔ `Change Screen` ➔ `Save Icon` ➔ `ZV_T16FW` ➔ `Double-Click Edit` ➔ `Success`

**Note:** This sequence is exactly what the agent will perform in the customer's real SAP ECC6 environment.

***

<answer>The `TESTING_GUIDE.md` has been updated to provide a high-fidelity roadmap that mirrors real SAP ECC6 navigation. It focuses on the crucial "Initial Screen" step, requiring the agent to type a User ID and select a toolbar icon (Pencil or Glasses) before proceeding, ensuring the agent is fully prepared for the customer's live environment.