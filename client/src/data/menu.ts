export interface FoodItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
}

export const menu: FoodItem[] = [
  {
    id: 1,
    name: "Classic Burger",
    description: "Juicy grilled beef burger with cheese.",
    price: 250,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500"
  },
  {
    id: 2,
    name: "Veg Pizza",
    description: "Stone baked pizza with fresh vegetables.",
    price: 400,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500"
  },
  {
    id: 3,
    name: "Chicken Biryani",
    description: "Hyderabadi style dum biryani.",
    price: 320,
    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500"
  },
  {
    id: 4,
    name: "French Fries",
    description: "Crispy golden fries.",
    price: 120,
    image: "https://images.unsplash.com/photo-1576107232684-1279f390859f?w=500"
  },
  {
    id: 5,
    name: "Cold Coffee",
    description: "Fresh chilled coffee.",
    price: 150,
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500"
  },
  {
    id: 6,
    name: "Chocolate Cake",
    description: "Rich chocolate dessert.",
    price: 180,
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500"
  }
];