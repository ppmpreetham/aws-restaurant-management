import { Router } from "express";
import { pool } from "./db";
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

        const orderUUID = uuidv4();

        const orderResult = await pool.query(
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

        const order = orderResult.rows[0];

        for (const item of items) {

            await pool.query(
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
                    order.id,
                    item.name,
                    item.quantity,
                    item.price
                ]
            );

        }

        res.status(201).json(order);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: "Internal Server Error"
        });

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