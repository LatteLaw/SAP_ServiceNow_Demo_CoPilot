# SAP ECC6 Mock (SU01 Role Copy) — for Copilot Studio Computer Using Agent practice

This is an **offline mock** that looks/feels like SAP GUI (ECC6 / SAP Logon 770) enough to practise UI automation:
- Select system → Log on
- Enter credentials
- Handle a “Multiple Logon” popup
- Easy Access: enter **SU01**
- SU01: search user via search-help popup (Last name = **Lang**)
- Open user → go to **Roles** tab → copy roles
- Go back → load another user (e.g. **EEL20335**) → Roles → Edit → Paste roles → Save

## Run it
1. Unzip the folder
2. Double-click `index.html` (opens in Edge/Chrome)

No server required.

## Seeded demo data
- Source: `EEL20141` (John Lang) — contains role `YOTH_PROC_APPROVE_PO_33`
- Target: `EEL20335` (Elaine Jones) — contains minimal roles

You can edit `data.json` to add more users/roles.

## Suggested CUA automation steps
1. Open browser and navigate to local `index.html`
2. Click “02 Eisai Validation” (or any system) → click **Log On**
3. Press **Enter** on login screen
4. On multiple logon popup, select “Continue…” and click **✓ Continue**
5. In command field type `SU01` and press **Enter**
6. Click search-help icon → Last name = Lang → **Start Search**
7. Double-click result row to open user
8. Click **Roles** tab → select role(s) → **Copy roles**
9. Click **Back** → enter target user `EEL20335` → **Display**
10. Roles tab → **Edit (pencil)** → **Paste roles** → **Save**

## Notes
- This is a UI practice mock only; there is no SAP connectivity.
- “Save” persists back into `data.json` in-memory for the session (refresh resets).
