// =====================================================
// FREIGHTFLOW TRACKING SYSTEM - Google Apps Script
// =====================================================
// 
// SETUP INSTRUCTIONS:
// 
// 1. Create a new Google Sheet with these column headers (Row 1):
//    A: Load Number
//    B: Customer
//    C: Origin
//    D: Destination
//    E: Status
//    F: Pickup Date
//    G: ETA
//    H: Service Type
//    I: Weight
//    J: Driver
//
// 2. Go to Extensions > Apps Script
// 3. Delete any existing code and paste this entire script
// 4. Click "Deploy" > "New deployment"
// 5. Choose "Web app"
// 6. Set "Execute as" to "Me"
// 7. Set "Who has access" to "Anyone"
// 8. Click "Deploy" and copy the Web App URL
// 9. Paste that URL into your tracking.html file
//
// =====================================================

function doGet(e) {
  // Enable CORS
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  try {
    var loadNumber = e.parameter.loadNumber;
    
    if (!loadNumber) {
      return output.setContent(JSON.stringify({
        success: false,
        error: 'No load number provided'
      }));
    }
    
    // Get the active spreadsheet and first sheet
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();
    
    // Find the shipment (skip header row)
    var shipment = null;
    for (var i = 1; i < data.length; i++) {
      if (data[i][0].toString().toUpperCase() === loadNumber.toUpperCase()) {
        shipment = {
          loadNumber: data[i][0],
          customer: data[i][1],
          origin: data[i][2],
          destination: data[i][3],
          status: data[i][4],
          pickupDate: formatDate(data[i][5]),
          eta: formatDate(data[i][6]),
          serviceType: data[i][7] || 'Full Truckload',
          weight: data[i][8] || 'N/A',
          driver: data[i][9] || 'Assigned'
        };
        break;
      }
    }
    
    if (shipment) {
      return output.setContent(JSON.stringify({
        success: true,
        shipment: shipment
      }));
    } else {
      return output.setContent(JSON.stringify({
        success: false,
        error: 'Shipment not found'
      }));
    }
    
  } catch (error) {
    return output.setContent(JSON.stringify({
      success: false,
      error: error.toString()
    }));
  }
}

// Helper function to format dates
function formatDate(date) {
  if (!date) return 'TBD';
  
  if (date instanceof Date) {
    var options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }
  
  return date.toString();
}

// Test function - run this to verify your sheet is set up correctly
function testLookup() {
  var result = doGet({ parameter: { loadNumber: 'FF-1001' } });
  Logger.log(result.getContent());
}
