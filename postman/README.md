# C2C API — Postman Collection

## Import

1. Open Postman → **Import**
2. Select both files:
   - `C2C-Vehicle-Platform.postman_collection.json`
   - `C2C-Local.postman_environment.json`
3. Select environment **C2C Local** (top-right dropdown)
4. Update `adminEmail` / `adminPassword` to match your `backend/.env`

## Regenerate collection

```bash
node postman/generate-collection.js
```

## Test order (happy path)

| Step | Folder | Action |
|------|--------|--------|
| 1 | 01 - Auth | Register Buyer + Vendor |
| 2 | 01 - Auth | Verify Email (set `otp` from email/DB) |
| 3 | 02 - Admin Auth | Admin Login |
| 4 | 23/24 - Makes/Models | Create Make → Create Model |
| 5 | 01 - Auth | Login Vendor |
| 6 | 05 - Listings (Vendor) | Create Listing |
| 7 | 02 - Admin Auth | Admin Login (if expired) |
| 8 | 16 - Admin Listings | Approve Listing |
| 9 | 04 - Listings (Public) | Browse / Get |
| 10 | 01 - Auth | Login Buyer |
| 11 | 06 - Offers (Buyer) | Create Offer |
| 12 | 01 - Auth | Login Vendor |
| 13 | 07 - Offers (Vendor) | Accept Offer |
| 14 | 01 - Auth | Login Buyer |
| 15 | 10 - Payments | Create Payment Intent |
| 16 | — | Complete Stripe payment + webhook → escrowed |
| 17 | 10 - Payments | Confirm Delivery |
| 18 | 01 - Auth | Login Vendor |
| 19 | 11 - Wallet | Bank details → Withdrawal |
| 20 | 18 - Admin Withdrawals | Approve → Mark Paid |

## Notes

- All endpoints are **POST**
- Amounts are in **cents** (€45,000 = `4500000`)
- Login requests auto-save tokens via Test scripts
- Switch `userAccessToken` by re-running **Login Buyer** or **Login Vendor**
- Admin seed: `node backend/src/scripts/seedAdmin.js`
