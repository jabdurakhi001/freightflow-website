# FreightFlow Tracking System - Setup Guide

## Overview
This system allows customers to track their shipments by entering a load number. You manage all shipment data in a simple Google Sheet.

---

## Step 1: Create Your Google Sheet Database

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. Name it: **FreightFlow Tracking Database**
3. Set up these column headers in Row 1:

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| Load Number | Customer | Origin | Destination | Status | Pickup Date | ETA | Service Type | Weight | Driver |

4. Add some sample data in Row 2:

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| FF-1001 | ABC Corporation | Chicago, IL | Dallas, TX | In Transit | 1/28/2026 | 1/31/2026 | Full Truckload | 42,000 lbs | Mike Johnson |

### Valid Status Values:
- Pending
- Dispatched
- Picked Up
- In Transit
- Out for Delivery
- Delivered

---

## Step 2: Set Up Google Apps Script

1. In your Google Sheet, click **Extensions** > **Apps Script**
2. Delete any existing code in the editor
3. Copy and paste the ENTIRE contents of the `google-apps-script.js` file
4. Click the **Save** icon (or Ctrl+S)
5. Name the project: **FreightFlow Tracking API**

---

## Step 3: Deploy the Web App

1. Click **Deploy** > **New deployment**
2. Click the gear icon ⚙️ next to "Select type" and choose **Web app**
3. Fill in:
   - Description: `FreightFlow Tracking API`
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy**
5. Click **Authorize access** and follow the prompts
6. **COPY THE WEB APP URL** - you'll need this!

The URL looks like: `https://script.google.com/macros/s/XXXXX.../exec`

---

## Step 4: Connect to Your Website

1. Open `tracking.html`
2. Find this line near the top of the `<script>` section:
   ```javascript
   const GOOGLE_SHEETS_API = 'YOUR_GOOGLE_SHEETS_WEB_APP_URL';
   ```
3. Replace `YOUR_GOOGLE_SHEETS_WEB_APP_URL` with your actual Web App URL
4. Save the file
5. Upload to GitHub

---

## Step 5: Test It!

1. Make sure you have at least one shipment in your Google Sheet
2. Go to your website's tracking page
3. Enter the load number (e.g., FF-1001)
4. You should see the shipment details!

---

## Daily Usage

### Adding a New Shipment:
1. Open your Google Sheet
2. Add a new row with the shipment details
3. That's it! Customers can immediately track it.

### Updating Status:
1. Open your Google Sheet
2. Find the shipment row
3. Change the Status column (e.g., "In Transit" → "Delivered")
4. Changes are instant!

---

## Troubleshooting

**"Shipment Not Found" error:**
- Check that the load number matches exactly (case doesn't matter)
- Make sure the data is in the correct columns

**Nothing happens when clicking Track:**
- Check that the Google Sheets Web App URL is correct in tracking.html
- Make sure the Web App is deployed with "Anyone" access

**Need to update the script?**
- Make changes in Apps Script
- Click Deploy > Manage deployments
- Click the pencil icon to edit
- Select "New version" and click Deploy

---

## Need Help?

Contact your web developer or refer to:
- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [Google Sheets API](https://developers.google.com/sheets)
