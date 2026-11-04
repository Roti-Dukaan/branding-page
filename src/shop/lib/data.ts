import {
  MenuItem,
  SpecialItem,
  Review,
  GalleryItem,
  DeliverySlot,
} from "./types";

export const MENU_ITEMS: MenuItem[] = [
  {
    id: "jonna-roti",
    name: "Jonna Roti",
    description:
      "Traditional sorghum flatbread, rich in fiber and nutrients. Crispy yet soft.",
    price: 15,
    category: "Rotis",
    image:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop",
    isVeg: true,
    tags: ["High Fiber", "Gluten-Free"],
    isSpecial: true,
    rating: 4.8,
    preparationTime: "10 min",
  },
  {
    id: "ragi-roti",
    name: "Ragi Roti",
    description:
      "Finger millet flatbread packed with calcium and iron. Healthy and filling.",
    price: 18,
    category: "Rotis",
    image:
      "https://images.unsplash.com/photo-1586444248879-bc604bc77ddb?w=400&h=300&fit=crop",
    isVeg: true,
    tags: ["Calcium Rich", "Healthy"],
    rating: 4.7,
    preparationTime: "12 min",
  },
  {
    id: "chapathi",
    name: "Chapathi",
    description:
      "Soft whole wheat flatbread made fresh daily. Perfect with any curry.",
    price: 12,
    category: "Rotis",
    image:
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop",
    isVeg: true,
    tags: ["Classic", "Soft"],
    rating: 4.6,
    preparationTime: "8 min",
  },
  {
    id: "phulka",
    name: "Phulka",
    description:
      "Light puffed roti cooked on open flame. Airy and delicious.",
    price: 14,
    category: "Rotis",
    image:
      "https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=300&fit=crop",
    isVeg: true,
    tags: ["Light", "Puffed"],
    rating: 4.5,
    preparationTime: "8 min",
  },
  {
    id: "dal-tadka",
    name: "Dal Tadka",
    description:
      "Yellow lentils tempered with cumin, garlic, and fresh herbs. Comfort food at its best.",
    price: 90,
    category: "Veg",
    image:
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop",
    isVeg: true,
    tags: ["Protein Rich", "Comfort"],
    rating: 4.7,
    preparationTime: "15 min",
  },
  {
    id: "tomato-pappu",
    name: "Tomato Pappu",
    description:
      "Tangy tomato lentil curry, a South Indian staple bursting with flavor.",
    price: 95,
    category: "Veg",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop",
    isVeg: true,
    tags: ["Tangy", "South Indian"],
    rating: 4.6,
    preparationTime: "15 min",
  },
  {
    id: "gongura-dal",
    name: "Gongura Dal",
    description:
      "Sorrel leaves cooked with lentils. Authentic Hyderabadi delicacy.",
    price: 105,
    category: "Veg",
    image:
      "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=400&h=300&fit=crop",
    isVeg: true,
    tags: ["Authentic", "Hyderabadi"],
    isSpecial: true,
    rating: 4.8,
    preparationTime: "20 min",
  },
  {
    id: "mix-veg",
    name: "Mix Veg Curry",
    description:
      "Seasonal vegetables cooked in aromatic Indian spices. Fresh and wholesome.",
    price: 110,
    category: "Veg",
    image:
      "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&h=300&fit=crop",
    isVeg: true,
    tags: ["Seasonal", "Wholesome"],
    rating: 4.5,
    preparationTime: "18 min",
  },
  {
    id: "mushroom-curry",
    name: "Mushroom Curry",
    description:
      "Tender mushrooms in a rich, creamy tomato-based gravy. Pure indulgence.",
    price: 140,
    category: "Veg",
    image:
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop",
    isVeg: true,
    tags: ["Creamy", "Rich"],
    rating: 4.7,
    preparationTime: "20 min",
  },
  {
    id: "paneer-curry",
    name: "Paneer Curry",
    description:
      "Soft cottage cheese cubes in a buttery tomato gravy. A crowd favorite.",
    price: 140,
    category: "Veg",
    image:
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop",
    isVeg: true,
    tags: ["Creamy", "Popular"],
    rating: 4.8,
    preparationTime: "22 min",
  },
  {
    id: "chicken-curry",
    name: "Chicken Curry",
    description:
      "Tender chicken pieces slow-cooked in a spiced onion-tomato gravy.",
    price: 160,
    category: "Non Veg",
    image:
      "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=300&fit=crop",
    isVeg: false,
    tags: ["Spicy", "Popular"],
    isSpecial: true,
    rating: 4.9,
    preparationTime: "25 min",
  },
  {
    id: "egg-curry",
    name: "Egg Curry",
    description:
      "Boiled eggs simmered in a flavorful coconut-based curry. Simple and satisfying.",
    price: 110,
    category: "Non Veg",
    image:
      "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&h=300&fit=crop",
    isVeg: false,
    tags: ["Protein Rich", "Comfort"],
    rating: 4.6,
    preparationTime: "18 min",
  },
  {
    id: "2-rotis-veg",
    name: "2 Rotis + Veg Combo",
    description:
      "2 freshly made chapathis served with a portion of seasonal vegetable curry.",
    price: 119,
    category: "Combos",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
    isVeg: true,
    tags: ["Value", "Balanced"],
    rating: 4.7,
    preparationTime: "12 min",
  },
  {
    id: "2-rotis-chicken",
    name: "2 Rotis + Chicken Combo",
    description:
      "2 soft chapathis paired with our signature chicken curry. Complete meal.",
    price: 169,
    category: "Combos",
    image:
      "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&h=300&fit=crop",
    isVeg: false,
    tags: ["Filling", "Popular"],
    rating: 4.8,
    preparationTime: "15 min",
  },
  {
    id: "family-meal",
    name: "Family Meal",
    description:
      "4 rotis, 2 portions of dal, 1 portion chicken/paneer, and rice. Feeds 3-4.",
    price: 299,
    category: "Combos",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop",
    isVeg: true,
    tags: ["Family", "Best Value"],
    rating: 4.9,
    preparationTime: "25 min",
  },
  {
    id: "healthy-combo",
    name: "Healthy Combo",
    description:
      "2 jonna rotis, dal, and mixed vegetable curry. Wholesome and nutritious.",
    price: 149,
    category: "Combos",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
    isVeg: true,
    tags: ["Healthy", "Fiber Rich"],
    rating: 4.7,
    preparationTime: "15 min",
  },
];

export const SPECIALS_ITEMS: SpecialItem[] = [
  {
    id: "sp-1",
    name: "Superfood Healthy Combo",
    description:
      "Jonna rotis + Gongura dal + mixed greens. A nutrient powerhouse meal.",
    price: 189,
    badge: "Chef Special",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop",
    isVeg: true,
    rating: 4.9,
  },
  {
    id: "sp-2",
    name: "Family Feast Meal",
    description:
      "4 rotis, chicken curry, dal, rice, and salad. Perfect for the whole family.",
    price: 299,
    badge: "Popular",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop",
    isVeg: false,
    rating: 4.8,
  },
  {
    id: "sp-3",
    name: "Spicy Chicken Curry",
    description:
      "Authentic Hyderabadi chicken curry, slow-cooked with traditional spices.",
    price: 160,
    badge: "Best Seller",
    image:
      "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&h=400&fit=crop",
    isVeg: false,
    rating: 4.9,
  },
];

export const CUSTOMER_REVIEWS: Review[] = [
  {
    id: "r1",
    name: "Aditya Sharma",
    role: "Software Engineer",
    rating: 5,
    text: "The Jonna Roti here reminds me of my grandmother's cooking. Absolutely authentic taste. I order at least 3 times a week now!",
    date: "2 days ago",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aditya",
  },
  {
    id: "r2",
    name: "Priya Patel",
    role: "Marketing Manager",
    rating: 5,
    text: "Finally, a home food delivery that actually tastes homemade! The dal tadka is comfort food perfection. Highly recommended.",
    date: "5 days ago",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
  },
  {
    id: "r3",
    name: "Rajesh Iyer",
    role: "Fitness Coach",
    rating: 5,
    text: "As a fitness professional, I appreciate their use of healthy oils and fresh ingredients. The healthy combo is my go-to meal prep.",
    date: "1 week ago",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh",
  },
  {
    id: "r4",
    name: "Sneha Reddy",
    role: "Doctor",
    rating: 5,
    text: "I recommend Roti Dukaan to all my patients who want nutritious home-cooked meals without the hassle. Excellent quality!",
    date: "3 days ago",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha",
  },
  {
    id: "r5",
    name: "Vikram Singh",
    role: "Business Owner",
    rating: 4,
    text: "Great food, on-time delivery every time. The family meal is perfect for our weekend dinners. Keep it up!",
    date: "1 week ago",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram",
  },
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "g1",
    title: "Fresh Rotis",
    category: "Breads",
    image:
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&h=350&fit=crop",
  },
  {
    id: "g2",
    title: "Dal Preparation",
    category: "Curries",
    image:
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&h=350&fit=crop",
  },
  {
    id: "g3",
    title: "Paneer Delight",
    category: "Curries",
    image:
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&h=350&fit=crop",
  },
  {
    id: "g4",
    title: "Spicy Chicken",
    category: "Non-Veg",
    image:
      "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&h=350&fit=crop",
  },
  {
    id: "g5",
    title: "Traditional Thali",
    category: "Combos",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&h=350&fit=crop",
  },
  {
    id: "g6",
    title: "Fresh Vegetables",
    category: "Ingredients",
    image:
      "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=500&h=350&fit=crop",
  },
  {
    id: "g7",
    title: "Kitchen Magic",
    category: "Behind the Scenes",
    image:
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&h=350&fit=crop",
  },
  {
    id: "g8",
    title: "Healthy Bowl",
    category: "Combos",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=350&fit=crop",
  },
];


export const DELIVERY_SLOTS: DeliverySlot[] = [
  { id: "slot-morning", label: "Morning", time: "11:00 AM - 12:30 PM", available: true },
  { id: "slot-afternoon", label: "Afternoon", time: "12:30 PM - 2:00 PM", available: true },
  { id: "slot-evening", label: "Evening", time: "6:00 PM - 7:30 PM", available: true },
  { id: "slot-quick", label: "Quick Delivery", time: "ASAP - 45 Mins", available: true, quickDelivery: true },
];

export { FAQS } from "./faqs-content";

export const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Choose Your Meal",
    description: "Browse our menu of fresh rotis, curries, and combo meals.",
    icon: "UtensilsCrossed",
  },
  {
    step: 2,
    title: "Place Your Order",
    description: "Add to cart, choose delivery slot, and pay securely online.",
    icon: "CreditCard",
  },
  {
    step: 3,
    title: "We Cook Fresh",
    description:
      "Your meal is prepared fresh with love, right after you order.",
    icon: "ChefHat",
  },
  {
    step: 4,
    title: "Fast Delivery",
    description:
      "Hot, freshly made food delivered to your doorstep on time.",
    icon: "Truck",
  },
];

export const WHY_CHOOSE_US = [
  {
    title: "Fresh Ingredients",
    description:
      "We source the freshest grains, vegetables, and spices daily from local markets.",
    icon: "Leaf",
  },
  {
    title: "Made Fresh Daily",
    description:
      "Every meal is cooked from scratch after you place your order. No pre-made food.",
    icon: "Flame",
  },
  {
    title: "Healthy Homemade",
    description:
      "No preservatives, no artificial colors. Just pure, home-style cooking.",
    icon: "Heart",
  },
  {
    title: "Fast Delivery",
    description:
      "Hot food delivered to your door within your chosen time slot.",
    icon: "Truck",
  },
  {
    title: "Secure Payments",
    description:
      "Pay online via UPI, cards, or wallets. Cash on delivery also available.",
    icon: "Shield",
  },
  {
    title: "Subscription Plans",
    description:
      "Save up to 20% with our weekly and monthly roti subscription plans.",
    icon: "Repeat",
  },
];
