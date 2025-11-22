const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const dotenv = require('dotenv');

const db = require('./shared/MysqlConnection')
const {updateRecord } = require('./shared/Shared');

dotenv.config();

// PayPal credentials
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_API = "https://api-m.sandbox.paypal.com"; // or live endpoint

// Create Order
router.post("/", async (req, res) => {

    let action = req.body.action

    console.log(PAYPAL_CLIENT_ID)
    console.log(PAYPAL_CLIENT_SECRET)

    if(action == 'orders'){
 
        const cleanAmount = String(req.body.amount).replace(/[^0-9.]/g, "");

        try {
            const accessToken = await generateAccessToken();
            const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                intent: "CAPTURE",
                purchase_units: [
                {
                    amount: {
                    currency_code: "USD",
                    value: cleanAmount,
                    },
                },
                ],
            }),
            });
            const order = await response.json();
            console.log(order)
            res.json({ id: order.id }); // ✅ important
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Order creation failed" });
        }

    }else if(action == 'capture'){

        console.log('Checking 1')
        // const { orderID } = req.params;
        const orderID = req.body.orderID
        const compid = req.body.compid
        try {
            const accessToken = await generateAccessToken();
            const response = await fetch(
            `${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`,
            {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
                },
            }
            );
            const data = await response.json();
            console.log(data)
            console.log('Checking 2')
            if(data['status'] == 'COMPLETED'){
                console.log('Checking 3')
                let connection = await db.getConnection();
                let obj = {
                    isactive: 1
                }
                if(connection){
                    try {
                        await updateRecord(connection,'companies', obj, 'id = ?', [compid])
                    } catch (err) {
                        console.log(err)
                    }
                  
                }
                connection.release();
                
            }
            res.json(data);
        } catch (err) {
            res.status(500).json({ error: "Payment capture failed" });
        }

    }


  
});

// Capture payment
// app.post("/api/orders/:orderID/capture", async (req, res) => {
//   const { orderID } = req.params;
//   try {
//     const accessToken = await generateAccessToken();
//     const response = await fetch(
//       `${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${accessToken}`,
//         },
//       }
//     );
//     const data = await response.json();
//     res.json(data);
//   } catch (err) {
//     res.status(500).json({ error: "Payment capture failed" });
//   }
// });

// Helper to get Access Token
async function generateAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await response.json();
  return data.access_token;
}

module.exports = router;

