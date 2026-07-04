import { Router } from "express";
import { pool, withTransaction } from "./db";
import { v4 as uuidv4 } from "uuid";

const router = Router();

/*
POST /api/orders

Body

{
    "customerName":"Arnav",
    "restaurantId":1,
    "items":[
        {
            "name":"Burger",
            "quantity":2,
            "price":250
        }
    ]
}
*/

router.post("/orders", async (req, res) => {
    try {

        const { customerName, restaurantId, items } = req.body;

        if (!customerName || !restaurantId || !items || items.length === 0) {
            return res.status(400).json({
                error: "Missing required fields"
            });
        }

        const total = items.reduce(
            (sum: number, item: any) =>
                sum + item.quantity * item.price,
            0
        );

        // Assume user ID 1 for now (mock user)
        const userId = 1;

        const orderUUID = uuidv4();

        const order = await withTransaction(async (client) => {
            // Lock the user row to prevent race conditions
            const userResult = await client.query(
                `SELECT credits FROM users WHERE id = $1 FOR UPDATE`,
                [userId]
            );

            if (userResult.rows.length === 0) {
                throw new Error('User not found');
            }

            const currentCredits = parseFloat(userResult.rows[0].credits);

            if (currentCredits < total) {
                throw new Error('INSUFFICIENT_CREDITS');
            }

            // Deduct credits
            await client.query(
                `UPDATE users SET credits = credits - $1 WHERE id = $2`,
                [total, userId]
            );

            // Insert Order
            const orderResult = await client.query(
                `
                INSERT INTO orders
                (
                    order_uuid,
                    customer_name,
                    restaurant_id,
                    total
                )
                VALUES($1,$2,$3,$4)
                RETURNING *
                `,
                [
                    orderUUID,
                    customerName,
                    restaurantId,
                    total
                ]
            );

            const insertedOrder = orderResult.rows[0];

            for (const item of items) {
                await client.query(
                    `
                    INSERT INTO order_items
                    (
                        order_id,
                        item_name,
                        quantity,
                        price
                    )
                    VALUES($1,$2,$3,$4)
                    `,
                    [
                        insertedOrder.id,
                        item.name,
                        item.quantity,
                        item.price
                    ]
                );
            }

            // Record transaction
            await client.query(
                `
                INSERT INTO credit_transactions
                (
                    user_id,
                    type,
                    amount,
                    reference
                )
                VALUES($1,$2,$3,$4)
                `,
                [
                    userId,
                    'ORDER_PAYMENT',
                    total,
                    orderUUID
                ]
            );
            
            return insertedOrder;
        });

        // Forward to Restaurant Service
        const restaurantServiceUrl = process.env.RESTAURANT_SERVICE_URL || "http://localhost:8001";
        const fetchRes = await fetch(`${restaurantServiceUrl}/api/restaurants/${restaurantId}/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                externalOrderId: orderUUID,
                items: items
            })
        });

        if (!fetchRes.ok) {
            const errorText = await fetchRes.text();
            console.error("Failed to forward order to restaurant service", errorText);
            
            // If the restaurant service rejected it because of capacity or being closed
            if (fetchRes.status === 409) {
                // We should technically rollback the order in our DB if we wanted distributed transactions, 
                // but for this project we can just mark it rejected in our DB or let it be. 
                // Let's update our order status to rejected.
                await pool.query("UPDATE orders SET status = 'Rejected', reason = $2 WHERE id = $1", [order.id, "Restaurant rejected the order: " + errorText]);
                
                let parsedError = errorText;
                try {
                    parsedError = JSON.parse(errorText).error || errorText;
                } catch(e) {}
                
                return res.status(409).json({
                    error: parsedError
                });
            }
        }

        res.status(201).json(order);

    } catch (err: any) {

        console.error(err);

        if (err.message === 'INSUFFICIENT_CREDITS') {
            return res.status(402).json({
                error: "Insufficient credits to place this order"
            });
        }

        res.status(500).json({
            error: "Internal Server Error"
        });

    }
});

router.get("/users/:id/credits", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const result = await pool.query("SELECT credits FROM users WHERE id = $1", [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ credits: parseFloat(result.rows[0].credits) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/orders", async (_req, res) => {
    try {

        const result = await pool.query(`
            SELECT *
            FROM orders
            ORDER BY created_at DESC
        `);

        res.json(result.rows);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: "Internal Server Error"
        });

    }
});

router.get("/orders/:id", async (req, res) => {

    try {

        const id = Number(req.params.id);

        const orderResult = await pool.query(
            `
            SELECT *
            FROM orders
            WHERE id=$1
            `,
            [id]
        );

        if (orderResult.rows.length === 0) {

            return res.status(404).json({
                error: "Order not found"
            });

        }

        const items = await pool.query(
            `
            SELECT *
            FROM order_items
            WHERE order_id=$1
            `,
            [id]
        );

        res.json({
            ...orderResult.rows[0],
            items: items.rows
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: "Internal Server Error"
        });

    }

});

router.patch("/orders/:id/cancel", async (req, res) => {

    try {

        const id = Number(req.params.id);

        const result = await pool.query(
            `
            UPDATE orders
            SET status='Cancelled'
            WHERE id=$1
            RETURNING *
            `,
            [id]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                error: "Order not found"
            });

        }

        res.json(result.rows[0]);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: "Internal Server Error"
        });

    }

});

export default router;