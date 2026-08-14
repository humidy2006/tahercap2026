import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = 3000;

// Allow large payloads for base64 image uploads in admin product catalog
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// File persistence paths
const DB_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  try {
    fs.mkdirSync(DB_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create data directory:', err);
  }
}

const PRODUCTS_FILE = path.join(DB_DIR, 'products.json');
const ORDERS_FILE = path.join(DB_DIR, 'orders.json');
const INQUIRIES_FILE = path.join(DB_DIR, 'inquiries.json');

// Default initial catalog
const DEFAULT_PRODUCTS = [
  {
    id: 'atg-001',
    category: 'Omani & Zari Series',
    categoryBn: 'ওমানি ও জারি সিরিজ',
    designNumber: 'Design #101',
    price: 650,
    originalPrice: 850,
    quantity: '1 Pc',
    sizes: ['48 cm', '50 cm', '52 cm', '54 cm', '56 cm', '58 cm'],
    isFeatured: true,
    image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=600&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 'atg-002',
    category: 'Royal Velvet',
    categoryBn: 'রয়েল ভেলভেট',
    designNumber: 'Design #102',
    price: 950,
    originalPrice: 1200,
    quantity: '1 Pc',
    sizes: ['48 cm', '50 cm', '52 cm', '54 cm', '56 cm'],
    isFeatured: true,
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=600&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1596451190630-186aff535bf2?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 'atg-003',
    category: 'Daily Comfort',
    categoryBn: 'দৈনন্দিন আরামদায়ক',
    designNumber: 'Design #48',
    price: 280,
    originalPrice: 350,
    quantity: '1 Pc',
    sizes: ['48 cm', '50 cm', '52 cm', '54 cm', '56 cm', '58 cm'],
    isFeatured: true,
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 'atg-004',
    category: 'Handcrafted Heritage',
    categoryBn: 'হস্তশিল্প ও নকশী',
    designNumber: 'Design #104',
    price: 1100,
    originalPrice: 1400,
    quantity: '1 Pc',
    sizes: ['48 cm', '50 cm', '52 cm', '54 cm', '56 cm', '58 cm'],
    isFeatured: true,
    image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=600&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format&fit=crop'
    ]
  },
  {
    id: 'atg-005',
    category: 'Turkish Cut',
    categoryBn: 'তুর্কি কাটিং',
    designNumber: 'Design #105',
    price: 780,
    originalPrice: 950,
    quantity: '1 Pc',
    sizes: ['50 cm', '52 cm', '54 cm', '56 cm'],
    isFeatured: false,
    image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=600&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=600&auto=format&fit=crop'
    ]
  },
  {
    id: 'atg-006',
    category: 'Pakistani Shahi',
    categoryBn: 'পাকিস্তানি শাহী',
    designNumber: 'Design #106',
    price: 820,
    originalPrice: 1050,
    quantity: '1 Dozen (12 Pcs)',
    sizes: ['48 cm', '50 cm', '52 cm', '54 cm', '56 cm', '58 cm'],
    isFeatured: false,
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=600&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1596451190630-186aff535bf2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=600&auto=format&fit=crop'
    ]
  },
  {
    id: 'atg-007',
    category: "Kid's Collection",
    categoryBn: 'শিশুদের কালেকশন',
    designNumber: 'Design #107',
    price: 220,
    originalPrice: 300,
    quantity: '1 Pc',
    sizes: ['44 cm', '46 cm', '48 cm', '50 cm'],
    isFeatured: false,
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=600&auto=format&fit=crop'
    ]
  },
  {
    id: 'atg-008',
    category: 'Hajj & Umrah Package',
    categoryBn: 'হজ্ব ও ওমরাহ প্যাকেজ',
    designNumber: 'Design #108',
    price: 1950,
    originalPrice: 2800,
    quantity: '1 Pack (10 Pcs)',
    sizes: ['48 cm', '50 cm', '52 cm', '54 cm', '56 cm'],
    isFeatured: true,
    image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=600&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=600&auto=format&fit=crop'
    ]
  }
];

// Helper functions for file reading/writing
function loadProducts(): any[] {
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const data = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading products from file:', err);
  }
  return DEFAULT_PRODUCTS;
}

function saveProducts(products: any[]) {
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving products to file:', err);
  }
}

function loadOrders(): any[] {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const data = fs.readFileSync(ORDERS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading orders file:', e);
  }
  return [];
}

function saveOrders(orders: any[]) {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving orders file:', e);
  }
}

function loadInquiries(): any[] {
  try {
    if (fs.existsSync(INQUIRIES_FILE)) {
      const data = fs.readFileSync(INQUIRIES_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading inquiries file:', e);
  }
  return [];
}

function saveInquiries(inquiries: any[]) {
  try {
    fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(inquiries, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving inquiries file:', e);
  }
}

// In-memory caching synced with files
let productsDatabase: any[] = loadProducts();
let productsLastUpdated: number = Date.now();
let ordersDatabase: any[] = loadOrders();
let inquiriesDatabase: any[] = loadInquiries();
const sseClients = new Set<express.Response>();

// Broadcast changes to all connected users in real-time
function broadcastProductsUpdate() {
  productsLastUpdated = Date.now();
  const payload = JSON.stringify({
    type: 'PRODUCTS_UPDATED',
    products: productsDatabase,
    updatedAt: productsLastUpdated,
    count: productsDatabase.length
  });

  for (const client of sseClients) {
    try {
      client.write(`data: ${payload}\n\n`);
    } catch {
      sseClients.delete(client);
    }
  }
}

// SEO Route: robots.txt
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Sitemap: https://altahercap.com/sitemap.xml
`);
});

// SEO Route: sitemap.xml
app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://altahercap.com/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="bn" href="https://altahercap.com/?lang=bn" />
    <xhtml:link rel="alternate" hreflang="en" href="https://altahercap.com/?lang=en" />
  </url>
  <url>
    <loc>https://altahercap.com/?category=omani</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://altahercap.com/?category=velvet</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://altahercap.com/?category=cotton</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://altahercap.com/?tab=wholesale</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;
  res.send(xml);
});

// API Route: Get Products (Public for all visitors)
app.get('/api/products', (req, res) => {
  return res.json({ 
    products: productsDatabase,
    updatedAt: productsLastUpdated,
    count: productsDatabase.length 
  });
});

// API Route: Real-Time SSE Stream for Instant Push Sync across all users & devices
app.get('/api/products/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send current products immediately on connection
  const initialPayload = JSON.stringify({
    type: 'INIT',
    products: productsDatabase,
    updatedAt: productsLastUpdated,
    count: productsDatabase.length
  });
  res.write(`data: ${initialPayload}\n\n`);

  sseClients.add(res);

  // Heartbeat every 15 seconds to maintain active socket connection
  const heartbeat = setInterval(() => {
    try {
      res.write(': ping\n\n');
    } catch {
      clearInterval(heartbeat);
      sseClients.delete(res);
    }
  }, 15000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
  });
});

// API Route: Update Entire Products Array (Admin Batch Sync - persists for all users on all devices)
app.post('/api/products', (req, res) => {
  const { products } = req.body;
  if (Array.isArray(products)) {
    productsDatabase = products;
    saveProducts(productsDatabase);
    broadcastProductsUpdate();
    return res.json({ 
      success: true, 
      products: productsDatabase, 
      updatedAt: productsLastUpdated,
      message: 'Products database synchronized successfully for all users.' 
    });
  }
  return res.status(400).json({ error: 'Invalid products data provided.' });
});

// API Route: Add Single Product
app.post('/api/products/add', (req, res) => {
  const newProduct = req.body;
  if (!newProduct || !newProduct.id) {
    return res.status(400).json({ error: 'Valid product object is required.' });
  }
  
  const existingIdx = productsDatabase.findIndex(p => p.id === newProduct.id);
  if (existingIdx >= 0) {
    productsDatabase[existingIdx] = newProduct;
  } else {
    productsDatabase = [newProduct, ...productsDatabase];
  }
  saveProducts(productsDatabase);
  broadcastProductsUpdate();
  return res.json({ success: true, products: productsDatabase, product: newProduct });
});

// API Route: Update Single Product by ID
app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  
  productsDatabase = productsDatabase.map(p => (p.id === id ? { ...p, ...updatedData } : p));
  saveProducts(productsDatabase);
  broadcastProductsUpdate();
  return res.json({ success: true, products: productsDatabase });
});

// API Route: Delete Product by ID
app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  productsDatabase = productsDatabase.filter(p => p.id !== id);
  saveProducts(productsDatabase);
  broadcastProductsUpdate();
  return res.json({ success: true, products: productsDatabase, deletedId: id });
});

// API Route: Reset to Default Catalog
app.post('/api/products/reset', (req, res) => {
  productsDatabase = [...DEFAULT_PRODUCTS];
  saveProducts(productsDatabase);
  broadcastProductsUpdate();
  return res.json({ success: true, products: productsDatabase });
});

// API Route: Gemini AI Tupi Consultant
app.post('/api/ai-consultant', async (req, res) => {
  try {
    const { userQuery, language = 'bn' } = req.body;

    if (!userQuery) {
      return res.status(400).json({ error: 'User query is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Fallback response if GEMINI_API_KEY is not provided yet
      const fallbackMsg = language === 'bn'
        ? 'আসসালামু আলাইকুম! আল তাহের ক্যাপ গার্মেন্টসে আপনাকে স্বাগতম। আমরা ১৯৯৯ সাল থেকে ওমানি, ভেলভেট, সুতি জালি, তুর্কি ও নকশী টুপির প্রস্তুতকারক ও রফতানিকারক। আপনার পছন্দের কাপড়ের ধরন বা বাজেট জানালে আমি সেরা টুপিটি সুপারিশ করে দিবো।'
        : 'Assalamu Alaikum! Welcome to Al Taher Cap Garments. We manufacture and export Omani, Velvet, Cotton Net, Turkish, and Hand-Embroidered prayer caps since 1999. Tell me your fabric or budget preference and I will recommend the best tupi for you.';
      return res.json({ reply: fallbackMsg });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are the official AI Tupi & Islamic Attire Consultant for "Al Taher Cap Garments" (আল তাহের ক্যাপ গার্মেন্টস), Bangladesh's premier Islamic Prayer Cap (Namaz Tupi) manufacturer and exporter since 1999 (27+ years of legacy).
    
Your role:
- Help customers select the ideal Namaz Tupi (Prayer Cap) based on occasion (Eid, Everyday Prayer, Hajj/Umrah, Weddings, Gifts for Elders), season (Hot summer cotton, Royal velvet winter/special), size (21.5 inches to 24 inches), fabric, and budget.
- Provide polite, respectful, Sunnah-aligned guidance in ${language === 'bn' ? 'Bengali (বাংলা)' : 'English'}.
- Highlight Al Taher Cap Garments' advantages: 100% breathable fabrics, double-stitched rims, factory-direct prices, custom embroidery option, and bulk wholesale rates for dealers/madrasas.
- Keep answers warm, concise (2-4 paragraphs max), respectful with Islamic greetings (Assalamu Alaikum).

User Question: ${userQuery}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: systemPrompt,
    });

    const reply = response.text || (language === 'bn' 
      ? 'ধন্যবাদ আপনার মেসেজের জন্য। আল তাহের ক্যাপ গার্মেন্টস থেকে আমাদের যেকোনো টুপি কিনতে বা কাস্টম অর্ডার করতে আপনার পছন্দসমূহ নির্বাচন করুন।' 
      : 'Thank you for reaching out to Al Taher Cap Garments. Let us know how we can customize your prayer caps.');

    return res.json({ reply });
  } catch (err: any) {
    console.error('Gemini AI Consultant Error:', err);
    return res.status(500).json({ 
      error: 'Failed to generate AI advice',
      reply: req.body.language === 'bn' 
        ? 'আসসালামু আলাইকুম! আল তাহের ক্যাপ গার্মেন্টসে আপনাকে স্বাগতম। আপনি আমাদের ওমানি জাড়ী বর্ডার, রয়াল ভেলভেট অথবা সুতি আরামদায়ক জালি টুপি কালেকশন দেখতে পারেন।' 
        : 'Assalamu Alaikum! Welcome to Al Taher Cap Garments. Please check out our Omani Zari, Royal Velvet, or Soft Cotton Collections.' 
    });
  }
});

// API Route: Wholesale Inquiry Submission
app.post('/api/inquiry', (req, res) => {
  const { name, companyName, phone, email, country, estimatedQuantity, tupiType, notes } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone number are required.' });
  }
  const newInquiry = {
    id: 'INQ-' + Date.now(),
    date: new Date().toISOString().split('T')[0],
    name,
    companyName: companyName || 'Individual / Retailer',
    phone,
    email: email || 'N/A',
    country: country || 'Bangladesh',
    estimatedQuantity: Number(estimatedQuantity) || 100,
    tupiType: tupiType || 'Custom Omani / Velvet Blend',
    notes: notes || '',
    status: 'Pending'
  };
  inquiriesDatabase.unshift(newInquiry);
  saveInquiries(inquiriesDatabase);
  return res.json({ success: true, inquiry: newInquiry, message: 'Wholesale inquiry received successfully. Our sales team will contact you on WhatsApp / Phone within 2 hours.' });
});

// API Route: Get Inquiries (Admin)
app.get('/api/inquiries', (req, res) => {
  return res.json({ inquiries: inquiriesDatabase });
});

// API Route: Submit Order
app.post('/api/orders', (req, res) => {
  const { customerName, phone, email, address, city, district, country, items, total, paymentMethod, currency } = req.body;
  if (!customerName || !phone || !address) {
    return res.status(400).json({ error: 'Customer name, phone, and delivery address are required.' });
  }

  const newOrder = {
    id: 'ATG-ORD-' + Math.floor(100000 + Math.random() * 900000),
    date: new Date().toLocaleDateString('en-GB'),
    customerName,
    phone,
    email: email || 'N/A',
    address,
    city: city || 'Dhaka',
    district: district || 'Dhaka',
    country: country || 'Bangladesh',
    items,
    total,
    currency: currency || 'BDT',
    paymentMethod,
    paymentStatus: paymentMethod === 'Cash on Delivery (COD)' ? 'Pending' : 'Paid',
    orderStatus: 'Processing',
    transactionId: 'TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase()
  };

  ordersDatabase.unshift(newOrder);
  saveOrders(ordersDatabase);
  return res.json({ success: true, order: newOrder });
});

// API Route: Get Orders (Admin)
app.get('/api/orders', (req, res) => {
  return res.json({ orders: ordersDatabase });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Al Taher Cap Garments Server running on http://localhost:${PORT}`);
  });
}

startServer();
