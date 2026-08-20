import express from "express";

const app = express();
app.use(express.json());

// Tally XML port mock (usually 9000, we'll run the mock connector on 9001)
const PORT = 9001;

// Mock master data export
app.get("/masters/vendors", (req, res) => {
  res.json([
    { LEDGERNAME: "Acme Corp Vendor", PHONE: "9876543210", LEDGERID: "L-101" },
    { LEDGERNAME: "Global Supplies", PHONE: "9123456789", LEDGERID: "L-102" }
  ]);
});

app.get("/masters/items", (req, res) => {
  res.json([
    { ITEMNAME: "Widget A", UOM: "Nos", RATE: 100 },
    { ITEMNAME: "Service B", UOM: "Hrs", RATE: 500 }
  ]);
});

// Mock PO Creation in Tally
app.post("/po/create", (req, res) => {
  console.log("Received PO Payload to sync to Tally:");
  console.log(JSON.stringify(req.body, null, 2));

  // Simulate XML construction and posting to Tally Port 9000
  console.log("Simulating Tally XML POST to localhost:9000...");
  
  // Return success
  res.json({
    status: 1,
    message: "Voucher created successfully in Tally Mock"
  });
});

app.listen(PORT, () => {
  console.log(`Mock Tally Connector Service running on http://localhost:${PORT}`);
  console.log(`Configure this URL in the Organization's tallyConfig.`);
});
