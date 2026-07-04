import { useMemo, useState } from "react";
import { menu } from "../data/menu";
import type { FoodItem } from "../data/menu";
import "./Orders.css";
import { placeOrder } from "../api/orderAPI";

interface CartItem {
  item: FoodItem;
  quantity: number;
}

export default function Orders({ restaurantId }: { restaurantId: number }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  function addToCart(food: FoodItem) {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === food.id);

      if (existing) {
        return prev.map((c) =>
          c.item.id === food.id
            ? { ...c, quantity: c.quantity + 1 }
            : c
        );
      }

      return [...prev, { item: food, quantity: 1 }];
    });
  }

  function increase(id: number) {
    setCart((prev) =>
      prev.map((c) =>
        c.item.id === id
          ? { ...c, quantity: c.quantity + 1 }
          : c
      )
    );
  }

  function decrease(id: number) {
    setCart((prev) =>
      prev
        .map((c) =>
          c.item.id === id
            ? { ...c, quantity: c.quantity - 1 }
            : c
        )
        .filter((c) => c.quantity > 0)
    );
  }

  const total = useMemo(() => {
    return cart.reduce(
      (sum, c) => sum + c.item.price * c.quantity,
      0
    );
  }, [cart]);

  async function checkout() {
    if (!customerName.trim()) {
      alert("Enter customer name");
      return;
    }

    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    try {
      setLoading(true);

      const order = await placeOrder({
        customerName,
        restaurantId,
        items: cart.map((c) => ({
          name: c.item.name,
          quantity: c.quantity,
          price: c.item.price,
        })),
      });

      setSuccess(
        `✅ Order #${order.id} placed successfully!`
      );

      setCart([]);

    } catch (err) {
      alert("Failed to place order");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="orders-page">

      <div className="menu-section">

        <h1>🍽 Order Food</h1>

        <div className="food-grid">

          {menu.map((food) => {

            const quantity =
              cart.find((c) => c.item.id === food.id)?.quantity ?? 0;

            return (

              <div className="food-card" key={food.id}>

                <img
                  src={food.image}
                  alt={food.name}
                />

                <h3>{food.name}</h3>

                <p>{food.description}</p>

                <h2>₹{food.price}</h2>

                {quantity === 0 ? (

                  <button
                    onClick={() => addToCart(food)}
                  >
                    Add To Cart
                  </button>

                ) : (

                  <div className="qty">

                    <button
                      onClick={() => decrease(food.id)}
                    >
                      -
                    </button>

                    <span>{quantity}</span>

                    <button
                      onClick={() => increase(food.id)}
                    >
                      +
                    </button>

                  </div>

                )}

              </div>

            );

          })}

        </div>

      </div>

      <div className="cart-section">

        <h2>Your Order</h2>

        <input
          placeholder="Customer Name"
          value={customerName}
          onChange={(e) =>
            setCustomerName(e.target.value)
          }
        />

        <p>Ordering for Restaurant #{restaurantId}</p>

        {cart.map((c) => (

          <div
            className="cart-row"
            key={c.item.id}
          >

            <span>
              {c.item.name} × {c.quantity}
            </span>

            <strong>
              ₹{c.item.price * c.quantity}
            </strong>

          </div>

        ))}

        <hr />

        <h2>Total ₹{total}</h2>

        <button
          onClick={checkout}
          disabled={loading}
        >
          {loading
            ? "Placing..."
            : "Place Order"}
        </button>

        {success && (
          <p className="success">
            {success}
          </p>
        )}

      </div>

    </div>
  );
}