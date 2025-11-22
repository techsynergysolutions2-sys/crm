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
const PAYPAL_API = "https://sandbox.paypal.com"; // or live endpoint

// Create Order
router.post("/", async (req, res) => {

    let action = req.body.action


    if(action == 'orders'){
 
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
                    value: req.body.amount,
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

        // const { orderID } = req.params;
        const orderID = req.body.orderID
        const compid = req.body.compid
        const totalspace = req.body.totalspace
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
            if(data['status'] == 'COMPLETED'){
                let connection = await db.getConnection();
                let obj = {
                    employee_count: totalspace
                }
                if(connection){
                    await updateRecord(connection,'companies', obj, 'id = ?', [compid])
                }
                connection.release();
                
            }
            res.json(data);
        } catch (err) {
            res.status(500).json({ error: "Payment capture failed" });
        }

    }


  
});

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

