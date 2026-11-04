import { MenuItem } from "@shop/lib/types";

export interface MenuItemDetails {
  id: string;
  longDescription: string;
  benefits: string[];
  specials: { icon: string; title: string }[];
  pairings: { id: string; name: string; price: number; image: string }[];
  cookingPreferences: string[];
  mockOrders: string;
}

export const MENU_ITEM_DETAILS: Record<string, MenuItemDetails> = {
  "jonna-roti": {
    id: "jonna-roti",
    longDescription:
      "Traditional sorghum flatbread made using premium Jonna flour. Freshly prepared after every order. High in fiber, naturally gluten-free and perfect with homemade curries.",
    benefits: ["High Fiber", "Healthy", "Gluten Free", "Rich in Iron", "Homemade", "Fresh Daily"],
    specials: [
      { icon: "🌾", title: "Made from premium ingredients" },
      { icon: "🔥", title: "Cooked fresh after your order" },
      { icon: "❤️", title: "Homemade with love" },
      { icon: "🚫", title: "No preservatives" },
      { icon: "👨‍🍳", title: "Prepared in small batches" },
    ],
    pairings: [
      { id: "dal-tadka", name: "Dal Tadka", price: 90, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200&h=150&fit=crop" },
      { id: "tomato-pappu", name: "Tomato Pappu", price: 95, image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=200&h=150&fit=crop" },
      { id: "paneer-curry", name: "Paneer Curry", price: 140, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=200&h=150&fit=crop" },
    ],
    cookingPreferences: ["Soft", "Medium", "Crispy"],
    mockOrders: "120+ customers ordered this this week",
  },
  "ragi-roti": {
    id: "ragi-roti",
    longDescription:
      "Finger millet flatbread packed with calcium and iron. Healthy and filling. Made with freshly ground ragi flour and cooked on a traditional tawa.",
    benefits: ["Calcium Rich", "High Fiber", "Healthy", "Gluten Free", "Fresh Daily", "Homemade"],
    specials: [
      { icon: "🌾", title: "Made from premium ingredients" },
      { icon: "🔥", title: "Cooked fresh after your order" },
      { icon: "❤️", title: "Homemade with love" },
      { icon: "🚫", title: "No preservatives" },
      { icon: "👨‍🍳", title: "Prepared in small batches" },
    ],
    pairings: [
      { id: "dal-tadka", name: "Dal Tadka", price: 90, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200&h=150&fit=crop" },
      { id: "chicken-curry", name: "Chicken Curry", price: 160, image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=200&h=150&fit=crop" },
      { id: "mix-veg", name: "Mix Veg Curry", price: 110, image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=200&h=150&fit=crop" },
    ],
    cookingPreferences: ["Soft", "Medium", "Crispy"],
    mockOrders: "90+ customers ordered this this week",
  },
  "chapathi": {
    id: "chapathi",
    longDescription:
      "Soft whole wheat flatbread made fresh daily. Perfect with any curry. Made from high-quality whole wheat flour and gently rolled for that perfect soft texture.",
    benefits: ["Fresh Daily", "Soft", "Whole Wheat", "Low Fat", "Homemade", "Healthy"],
    specials: [
      { icon: "🌾", title: "Made from premium ingredients" },
      { icon: "🔥", title: "Cooked fresh after your order" },
      { icon: "❤️", title: "Homemade with love" },
      { icon: "🚫", title: "No preservatives" },
      { icon: "👨‍🍳", title: "Prepared in small batches" },
    ],
    pairings: [
      { id: "dal-tadka", name: "Dal Tadka", price: 90, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200&h=150&fit=crop" },
      { id: "paneer-curry", name: "Paneer Curry", price: 140, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=200&h=150&fit=crop" },
      { id: "chicken-curry", name: "Chicken Curry", price: 160, image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=200&h=150&fit=crop" },
    ],
    cookingPreferences: ["Soft", "Medium", "Crispy"],
    mockOrders: "200+ customers ordered this this week",
  },
  "phulka": {
    id: "phulka",
    longDescription:
      "Light puffed roti cooked on open flame. Airy and delicious. The classic Indian bread that puffs up perfectly for a light and satisfying meal.",
    benefits: ["Light", "Puffed", "Fresh Daily", "Low Calorie", "Homemade", "Healthy"],
    specials: [
      { icon: "🌾", title: "Made from premium ingredients" },
      { icon: "🔥", title: "Cooked fresh after your order" },
      { icon: "❤️", title: "Homemade with love" },
      { icon: "🚫", title: "No preservatives" },
      { icon: "👨‍🍳", title: "Prepared in small batches" },
    ],
    pairings: [
      { id: "dal-tadka", name: "Dal Tadka", price: 90, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200&h=150&fit=crop" },
      { id: "mix-veg", name: "Mix Veg Curry", price: 110, image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=200&h=150&fit=crop" },
    ],
    cookingPreferences: ["Soft", "Medium", "Crispy"],
    mockOrders: "150+ customers ordered this this week",
  },
  "dal-tadka": {
    id: "dal-tadka",
    longDescription:
      "Yellow lentils tempered with cumin, garlic, and fresh herbs. Comfort food at its best. Slow-cooked to perfection with aromatic spices.",
    benefits: ["Protein Rich", "Comfort", "Homemade", "Fresh Daily", "Healthy", "Spicy"],
    specials: [
      { icon: "🌾", title: "Made from premium ingredients" },
      { icon: "🔥", title: "Cooked fresh after your order" },
      { icon: "❤️", title: "Homemade with love" },
      { icon: "🚫", title: "No preservatives" },
      { icon: "👨‍🍳", title: "Prepared in small batches" },
    ],
    pairings: [
      { id: "jonna-roti", name: "Jonna Roti", price: 15, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&h=150&fit=crop" },
      { id: "chapathi", name: "Chapathi", price: 12, image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=200&h=150&fit=crop" },
      { id: "phulka", name: "Phulka", price: 14, image: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=200&h=150&fit=crop" },
    ],
    cookingPreferences: ["Mild", "Medium", "Spicy"],
    mockOrders: "180+ customers ordered this this week",
  },
  "tomato-pappu": {
    id: "tomato-pappu",
    longDescription:
      "Tangy tomato lentil curry, a South Indian staple bursting with flavor. Made with ripe tomatoes and traditional spices.",
    benefits: ["Tangy", "South Indian", "Protein Rich", "Homemade", "Fresh Daily", "Vegan"],
    specials: [
      { icon: "🌾", title: "Made from premium ingredients" },
      { icon: "🔥", title: "Cooked fresh after your order" },
      { icon: "❤️", title: "Homemade with love" },
      { icon: "🚫", title: "No preservatives" },
      { icon: "👨‍🍳", title: "Prepared in small batches" },
    ],
    pairings: [
      { id: "jonna-roti", name: "Jonna Roti", price: 15, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&h=150&fit=crop" },
      { id: "ragi-roti", name: "Ragi Roti", price: 18, image: "https://images.unsplash.com/photo-1586444248879-bc604bc77ddb?w=200&h=150&fit=crop" },
      { id: "rice", name: "Steamed Rice", price: 40, image: "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=200&h=150&fit=crop" },
    ],
    cookingPreferences: ["Mild", "Medium", "Spicy"],
    mockOrders: "110+ customers ordered this this week",
  },
  "gongura-dal": {
    id: "gongura-dal",
    longDescription:
      "Sorrel leaves cooked with lentils. Authentic Hyderabadi delicacy with a unique tangy flavor that warms the soul.",
    benefits: ["Authentic", "Hyderabadi", "Tangy", "Protein Rich", "Homemade", "Fresh Daily"],
    specials: [
      { icon: "🌾", title: "Made from premium ingredients" },
      { icon: "🔥", title: "Cooked fresh after your order" },
      { icon: "❤️", title: "Homemade with love" },
      { icon: "🚫", title: "No preservatives" },
      { icon: "👨‍🍳", title: "Prepared in small batches" },
    ],
    pairings: [
      { id: "jonna-roti", name: "Jonna Roti", price: 15, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&h=150&fit=crop" },
      { id: "chapathi", name: "Chapathi", price: 12, image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=200&h=150&fit=crop" },
      { id: "rice", name: "Steamed Rice", price: 40, image: "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=200&h=150&fit=crop" },
    ],
    cookingPreferences: ["Mild", "Medium", "Spicy"],
    mockOrders: "75+ customers ordered this this week",
  },
};

MENU_ITEM_DETAILS["mix-veg"] = {
  ...MENU_ITEM_DETAILS["dal-tadka"],
  id: "mix-veg",
  longDescription:
    "Seasonal vegetables cooked in aromatic Indian spices. Fresh and wholesome. A colorful medley of farm-fresh vegetables.",
  benefits: ["Seasonal", "Wholesome", "Healthy", "Fresh Daily", "Vegan", "Homemade"],
  pairings: [
    { id: "chapathi", name: "Chapathi", price: 12, image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=200&h=150&fit=crop" },
    { id: "jonna-roti", name: "Jonna Roti", price: 15, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&h=150&fit=crop" },
    { id: "phulka", name: "Phulka", price: 14, image: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=200&h=150&fit=crop" },
  ],
  cookingPreferences: ["Mild", "Medium", "Spicy"],
  mockOrders: "95+ customers ordered this this week",
};

MENU_ITEM_DETAILS["mushroom-curry"] = {
  ...MENU_ITEM_DETAILS["dal-tadka"],
  id: "mushroom-curry",
  longDescription:
    "Tender mushrooms in a rich, creamy tomato-based gravy. Pure indulgence for mushroom lovers.",
  benefits: ["Creamy", "Rich", "Protein Rich", "Fresh Daily", "Homemade", "Healthy"],
  pairings: [
    { id: "chapathi", name: "Chapathi", price: 12, image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=200&h=150&fit=crop" },
    { id: "rice", name: "Steamed Rice", price: 40, image: "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=200&h=150&fit=crop" },
  ],
  cookingPreferences: ["Mild", "Medium", "Spicy"],
  mockOrders: "60+ customers ordered this this week",
};

MENU_ITEM_DETAILS["paneer-curry"] = {
  ...MENU_ITEM_DETAILS["dal-tadka"],
  id: "paneer-curry",
  longDescription:
    "Soft cottage cheese cubes in a buttery tomato gravy. A crowd favorite that melts in your mouth.",
  benefits: ["Creamy", "Popular", "Protein Rich", "Fresh Daily", "Homemade", "Vegetarian"],
  pairings: [
    { id: "chapathi", name: "Chapathi", price: 12, image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=200&h=150&fit=crop" },
    { id: "jonna-roti", name: "Jonna Roti", price: 15, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&h=150&fit=crop" },
    { id: "phulka", name: "Phulka", price: 14, image: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=200&h=150&fit=crop" },
  ],
  cookingPreferences: ["Mild", "Medium", "Spicy"],
  mockOrders: "220+ customers ordered this this week",
};

MENU_ITEM_DETAILS["chicken-curry"] = {
  ...MENU_ITEM_DETAILS["dal-tadka"],
  id: "chicken-curry",
  longDescription:
    "Tender chicken pieces slow-cooked in a spiced onion-tomato gravy. Rich, hearty, and full of flavor.",
  benefits: ["Spicy", "Popular", "High Protein", "Fresh Daily", "Homemade", "Non-Veg"],
  pairings: [
    { id: "chapathi", name: "Chapathi", price: 12, image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=200&h=150&fit=crop" },
    { id: "rice", name: "Steamed Rice", price: 40, image: "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=200&h=150&fit=crop" },
    { id: "phulka", name: "Phulka", price: 14, image: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=200&h=150&fit=crop" },
  ],
  cookingPreferences: ["Mild", "Medium", "Spicy"],
  mockOrders: "250+ customers ordered this this week",
};

MENU_ITEM_DETAILS["egg-curry"] = {
  ...MENU_ITEM_DETAILS["dal-tadka"],
  id: "egg-curry",
  longDescription:
    "Boiled eggs simmered in a flavorful coconut-based curry. Simple, satisfying, and protein-packed.",
  benefits: ["Protein Rich", "Comfort", "Fresh Daily", "Homemade", "Non-Veg", "Healthy"],
  pairings: [
    { id: "chapathi", name: "Chapathi", price: 12, image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=200&h=150&fit=crop" },
    { id: "rice", name: "Steamed Rice", price: 40, image: "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=200&h=150&fit=crop" },
  ],
  cookingPreferences: ["Mild", "Medium", "Spicy"],
  mockOrders: "85+ customers ordered this this week",
};

MENU_ITEM_DETAILS["2-rotis-veg"] = {
  ...MENU_ITEM_DETAILS["dal-tadka"],
  id: "2-rotis-veg",
  longDescription:
    "2 freshly made chapathis served with a portion of seasonal vegetable curry. A complete wholesome meal.",
  benefits: ["Value", "Balanced", "Fresh Daily", "Healthy", "Vegetarian", "Complete Meal"],
  pairings: [
    { id: "dal-tadka", name: "Dal Tadka", price: 90, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200&h=150&fit=crop" },
    { id: "jonna-roti", name: "Jonna Roti", price: 15, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&h=150&fit=crop" },
  ],
  cookingPreferences: ["Soft", "Medium", "Crispy"],
  mockOrders: "160+ customers ordered this this week",
};

MENU_ITEM_DETAILS["2-rotis-chicken"] = {
  ...MENU_ITEM_DETAILS["dal-tadka"],
  id: "2-rotis-chicken",
  longDescription:
    "2 soft chapathis paired with our signature chicken curry. Complete meal that satisfies your hunger.",
  benefits: ["Filling", "Popular", "High Protein", "Fresh Daily", "Non-Veg", "Complete Meal"],
  pairings: [
    { id: "dal-tadka", name: "Dal Tadka", price: 90, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200&h=150&fit=crop" },
    { id: "tomato-pappu", name: "Tomato Pappu", price: 95, image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=200&h=150&fit=crop" },
  ],
  cookingPreferences: ["Soft", "Medium", "Crispy"],
  mockOrders: "190+ customers ordered this this week",
};

MENU_ITEM_DETAILS["family-meal"] = {
  ...MENU_ITEM_DETAILS["dal-tadka"],
  id: "family-meal",
  longDescription:
    "4 rotis, 2 portions of dal, 1 portion chicken/paneer, and rice. Feeds 3-4 people perfectly.",
  benefits: ["Family", "Best Value", "Complete Meal", "Fresh Daily", "Sharing", "Economical"],
  pairings: [
    { id: "dal-tadka", name: "Dal Tadka", price: 90, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200&h=150&fit=crop" },
    { id: "paneer-curry", name: "Paneer Curry", price: 140, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=200&h=150&fit=crop" },
    { id: "chicken-curry", name: "Chicken Curry", price: 160, image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=200&h=150&fit=crop" },
  ],
  cookingPreferences: ["Soft", "Medium", "Crispy"],
  mockOrders: "140+ customers ordered this this week",
};

MENU_ITEM_DETAILS["healthy-combo"] = {
  ...MENU_ITEM_DETAILS["dal-tadka"],
  id: "healthy-combo",
  longDescription:
    "2 jonna rotis, dal, and mixed vegetable curry. Wholesome and nutritious choice for health-conscious food lovers.",
  benefits: ["Healthy", "Fiber Rich", "Balanced", "Fresh Daily", "Vegetarian", "Nutritious"],
  pairings: [
    { id: "dal-tadka", name: "Dal Tadka", price: 90, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200&h=150&fit=crop" },
    { id: "tomato-pappu", name: "Tomato Pappu", price: 95, image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=200&h=150&fit=crop" },
  ],
  cookingPreferences: ["Soft", "Medium", "Crispy"],
  mockOrders: "100+ customers ordered this this week",
};
