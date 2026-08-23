export interface Product {
  name: string;
  vendor: string;
  price: string;
  category: string;
  image: string;
}

/** Category labels match the wizard's BUSINESS_TYPES so a shop can be filtered by its own. */
export const CATEGORIES = ['All', 'Furniture', 'Clothing', 'Handicrafts', 'Electronics', 'Food & Spices', 'Jewellery'];

export const PRODUCTS: Product[] = [
  { name: 'Bamboo Lamp',       vendor: 'EcoLight Co.',    price: '₹2,200', category: 'Furniture',     image: 'https://images.unsplash.com/photo-1578678809569-1a8ead9cb802?auto=format&fit=crop&w=400&q=80' },
  { name: 'Wooden Stool',      vendor: 'Oakcraft',        price: '₹1,350', category: 'Furniture',     image: 'https://images.unsplash.com/photo-1634798245965-03669c757183?auto=format&fit=crop&w=400&q=80' },
  { name: 'Linen Kurta',       vendor: 'Weavers Hub',     price: '₹1,800', category: 'Clothing',      image: 'https://images.unsplash.com/photo-1727835523545-70ee992b5763?auto=format&fit=crop&w=400&q=80' },
  { name: 'Wool Scarf',        vendor: 'Weavers Hub',     price: '₹650',   category: 'Clothing',      image: 'https://images.unsplash.com/photo-1609803384069-19f3e5a70e75?auto=format&fit=crop&w=400&q=80' },
  { name: 'Handwoven Basket',  vendor: 'Riya Crafts',     price: '₹850',   category: 'Handicrafts',   image: 'https://images.unsplash.com/photo-1601330862030-1e08c703ac04?auto=format&fit=crop&w=400&q=80' },
  { name: 'Ceramic Mug Set',   vendor: 'Pottery House',   price: '₹1,200', category: 'Handicrafts',   image: 'https://images.unsplash.com/photo-1616241673111-508b4662c707?auto=format&fit=crop&w=400&q=80' },
  { name: 'Wireless Earbuds',  vendor: 'TechNook Store',  price: '₹1,499', category: 'Electronics',   image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=400&q=80' },
  { name: 'Smart Plug',        vendor: 'TechNook Store',  price: '₹799',   category: 'Electronics',   image: 'https://images.unsplash.com/photo-1586943029669-98ae685c5c4c?auto=format&fit=crop&w=400&q=80' },
  { name: 'Organic Turmeric',  vendor: 'Spice Trail',     price: '₹350',   category: 'Food & Spices', image: 'https://images.unsplash.com/photo-1768729341078-9da4e0ea959e?auto=format&fit=crop&w=400&q=80' },
  { name: 'Wild Honey',        vendor: 'Spice Trail',     price: '₹480',   category: 'Food & Spices', image: 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=400&q=80' },
  { name: 'Silver Earrings',   vendor: 'GoldSmith Works', price: '₹950',   category: 'Jewellery',     image: 'https://images.unsplash.com/photo-1693212793204-bcea856c75fe?auto=format&fit=crop&w=400&q=80' },
  { name: 'Gold Ring',         vendor: 'GoldSmith Works', price: '₹5,200', category: 'Jewellery',     image: 'https://images.unsplash.com/photo-1598560917807-1bae44bd2be8?auto=format&fit=crop&w=400&q=80' },
];
