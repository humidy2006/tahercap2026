import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import nodemailer from 'nodemailer';
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

// Initialize files on disk if they don't exist
if (!fs.existsSync(PRODUCTS_FILE)) {
  saveProducts(productsDatabase);
}
if (!fs.existsSync(ORDERS_FILE)) {
  saveOrders(ordersDatabase);
}
if (!fs.existsSync(INQUIRIES_FILE)) {
  saveInquiries(inquiriesDatabase);
}

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
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
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

// Helper: Dispatch Order Notification Email to abdullahalhumidy@gmail.com
async function sendOrderNotificationEmail(order: any) {
  const targetEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'abdullahalhumidy@gmail.com';
  
  // Format items HTML table
  const itemsRowsHtml = (order.items || []).map((item: any, idx: number) => {
    const title = item.product?.designNumber || item.product?.title || `Item #${idx + 1}`;
    const category = item.product?.category || 'Islamic Prayer Cap';
    const size = item.selectedSize || 'Standard';
    const qty = item.quantity || 1;
    const price = item.product?.price || 0;
    const subtotal = price * qty;
    const customInfo = item.isCustomItem && item.customDetails
      ? `<br/><small style="color: #64748b;">Fabric: ${item.customDetails.fabric}, Style: ${item.customDetails.baseStyle}, Text: ${item.customDetails.customText || 'N/A'}</small>`
      : '';
    return `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 12px; font-weight: 600; color: #1e293b;">${title} (${category})${customInfo}</td>
        <td style="padding: 10px 12px; text-align: center; color: #475569;">${size}</td>
        <td style="padding: 10px 12px; text-align: center; color: #475569;">${qty}</td>
        <td style="padding: 10px 12px; text-align: right; color: #475569;">৳ ${price}</td>
        <td style="padding: 10px 12px; text-align: right; font-weight: 600; color: #0f172a;">৳ ${subtotal}</td>
      </tr>
    `;
  }).join('');

  const itemsText = (order.items || []).map((item: any, idx: number) => {
    const title = item.product?.designNumber || item.product?.title || `Item #${idx + 1}`;
    const size = item.selectedSize || 'Standard';
    const qty = item.quantity || 1;
    const price = item.product?.price || 0;
    return `• ${title} | Size: ${size} | Qty: ${qty} | Unit: ৳${price} | Total: ৳${price * qty}`;
  }).join('\n');

  const emailSubject = `🔔 [New Order Alert] Al Taher Cap - Order #${order.id} - ${order.customerName} (৳${order.total})`;

  const emailHtml = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 650px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background: #0f172a; color: #ffffff; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px; color: #f59e0b;">AL TAHER CAP GARMENTS</h1>
        <p style="margin: 6px 0 0 0; font-size: 13px; color: #94a3b8;">আল তাহের ক্যাপ গার্মেন্টস — নতুন কাস্টমার অর্ডার নোটিফিকেশন</p>
      </div>

      <div style="padding: 24px;">
        <div style="background: #f8fafc; border-left: 4px solid #f59e0b; padding: 14px 18px; border-radius: 6px; margin-bottom: 20px;">
          <h2 style="margin: 0 0 6px 0; font-size: 16px; color: #0f172a;">নতুন অর্ডার পাওয়া গেছে! (Order ID: ${order.id})</h2>
          <p style="margin: 0; font-size: 13px; color: #475569;">অর্ডার এর তারিখ: <strong>${order.date || new Date().toLocaleDateString('en-GB')}</strong> | পেমেন্ট মেথড: <strong>${order.paymentMethod}</strong></p>
        </div>

        <h3 style="font-size: 15px; color: #0f172a; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; margin-top: 24px;">👤 ক্রেতার তথ্য (Customer Details)</h3>
        <table style="width: 100%; font-size: 14px; color: #334155; margin-bottom: 20px;">
          <tr>
            <td style="padding: 6px 0; width: 130px; font-weight: 600; color: #64748b;">নাম (Name):</td>
            <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${order.customerName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: 600; color: #64748b;">ফোন নাম্বার:</td>
            <td style="padding: 6px 0;"><a href="tel:${order.phone}" style="color: #0284c7; text-decoration: none; font-weight: 600;">${order.phone}</a> (Click to Call)</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: 600; color: #64748b;">ইমেইল:</td>
            <td style="padding: 6px 0;">${order.email || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: 600; color: #64748b;">ডেলিভারি ঠিকানা:</td>
            <td style="padding: 6px 0; color: #0f172a;">${order.address}, ${order.district || ''}, ${order.city || ''}</td>
          </tr>
        </table>

        <h3 style="font-size: 15px; color: #0f172a; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; margin-top: 24px;">📦 অর্ডারকৃত টুপির তালিকা (Ordered Caps)</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 10px;">
          <thead>
            <tr style="background: #f1f5f9; text-align: left;">
              <th style="padding: 10px 12px; color: #475569;">টুপি / ডিজাইন</th>
              <th style="padding: 10px 12px; text-align: center; color: #475569;">সাইজ</th>
              <th style="padding: 10px 12px; text-align: center; color: #475569;">পরিমাণ</th>
              <th style="padding: 10px 12px; text-align: right; color: #475569;">মূল্য</th>
              <th style="padding: 10px 12px; text-align: right; color: #475569;">মোট</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRowsHtml}
          </tbody>
          <tfoot>
            <tr style="background: #f8fafc; font-weight: 700; font-size: 15px;">
              <td colspan="4" style="padding: 12px; text-align: right; color: #0f172a;">সর্বমোট মূল্য (Grand Total):</td>
              <td style="padding: 12px; text-align: right; color: #b45309;">৳ ${order.total}</td>
            </tr>
          </tfoot>
        </table>

        <div style="margin-top: 24px; padding: 16px; background: #ecfdf5; border-radius: 8px; border: 1px solid #a7f3d0;">
          <p style="margin: 0; font-size: 13px; color: #065f46;">
            ✅ <strong>পেমেন্ট স্ট্যাটাস:</strong> ${order.paymentStatus} (${order.paymentMethod})<br/>
            📌 <strong>ট্রানজেকশন আইডি:</strong> ${order.transactionId || 'N/A'}<br/>
            🚚 <strong>অর্ডার স্ট্যাটাস:</strong> ${order.orderStatus || 'Processing'}
          </p>
        </div>

        <div style="text-align: center; margin-top: 28px;">
          <p style="font-size: 12px; color: #94a3b8; margin: 0;">Al Taher Cap Garments — Factory Wholesale & Export, Dhaka, Bangladesh</p>
        </div>
      </div>
    </div>
  `;

  const emailText = `
AL TAHER CAP GARMENTS - NEW ORDER ALERT
========================================
Order ID: ${order.id}
Date: ${order.date || new Date().toLocaleDateString('en-GB')}
Total Amount: ৳ ${order.total}
Payment Method: ${order.paymentMethod} (${order.paymentStatus})

CUSTOMER DETAILS:
- Name: ${order.customerName}
- Phone: ${order.phone}
- Email: ${order.email || 'N/A'}
- Address: ${order.address}, ${order.district || ''}, ${order.city || ''}

ORDER ITEMS:
${itemsText}

TOTAL: ৳ ${order.total}
========================================
`;

  try {
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = Number(process.env.SMTP_PORT) || 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || `"Al Taher Cap Orders" <${smtpUser}>`,
        to: targetEmail,
        subject: emailSubject,
        text: emailText,
        html: emailHtml
      });

      console.log(`[EMAIL DISPATCH SUCCESS] Real SMTP email sent for Order #${order.id} to ${targetEmail}. MessageId: ${info.messageId}`);
      return { success: true, status: 'Sent', recipient: targetEmail };
    } else {
      console.log(`[ORDER EMAIL NOTIFICATION LOGGED]
To: ${targetEmail}
Subject: ${emailSubject}
Customer: ${order.customerName} (${order.phone})
Total: ৳${order.total}
Address: ${order.address}`);
      return { success: true, status: 'Logged / Direct Alert', recipient: targetEmail };
    }
  } catch (err: any) {
    console.error('[EMAIL DISPATCH ERROR]', err);
    return { success: false, status: 'Failed', error: err.message, recipient: targetEmail };
  }
}

// API Route: Submit Order & Dispatch Email to abdullahalhumidy@gmail.com
app.post('/api/orders', async (req, res) => {
  const { customerName, phone, email, address, city, district, country, items, total, subtotal, shippingFee, paymentMethod, currency } = req.body;
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
    items: items || [],
    subtotal: subtotal || total,
    shippingFee: shippingFee || 0,
    total,
    currency: currency || 'BDT',
    paymentMethod: paymentMethod || 'Cash on Delivery (COD)',
    paymentStatus: paymentMethod === 'Cash on Delivery (COD)' ? 'Pending' : 'Paid',
    orderStatus: 'Processing',
    transactionId: 'TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    emailRecipient: process.env.ADMIN_NOTIFICATION_EMAIL || 'abdullahalhumidy@gmail.com',
    emailNotificationStatus: 'Processing'
  };

  // Dispatch Email Notification
  try {
    const emailResult = await sendOrderNotificationEmail(newOrder);
    newOrder.emailNotificationStatus = (emailResult.status as any) || 'Sent';
  } catch (emailErr) {
    console.error('Email dispatch error on order creation:', emailErr);
    newOrder.emailNotificationStatus = 'Logged / Direct Alert';
  }

  ordersDatabase.unshift(newOrder);
  saveOrders(ordersDatabase);

  return res.json({ 
    success: true, 
    order: newOrder,
    emailStatus: newOrder.emailNotificationStatus,
    adminEmail: newOrder.emailRecipient 
  });
});

// API Route: Get Orders (Admin)
app.get('/api/orders', (req, res) => {
  return res.json({ orders: ordersDatabase });
});

// API Route: Update Order Status (Admin)
app.put('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { orderStatus, paymentStatus } = req.body;

  let found = false;
  ordersDatabase = ordersDatabase.map(ord => {
    if (ord.id === id) {
      found = true;
      return {
        ...ord,
        orderStatus: orderStatus || ord.orderStatus,
        paymentStatus: paymentStatus || ord.paymentStatus
      };
    }
    return ord;
  });

  if (found) {
    saveOrders(ordersDatabase);
    return res.json({ success: true, orders: ordersDatabase });
  }
  return res.status(404).json({ error: 'Order not found' });
});

// API Route: Delete Order (Admin)
app.delete('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  ordersDatabase = ordersDatabase.filter(ord => ord.id !== id);
  saveOrders(ordersDatabase);
  return res.json({ success: true, orders: ordersDatabase });
});

// API Route: Admin Test Email Trigger
app.post('/api/admin/test-email', async (req, res) => {
  const testOrder = {
    id: 'ATG-TEST-' + Math.floor(1000 + Math.random() * 9000),
    date: new Date().toLocaleDateString('en-GB'),
    customerName: 'Al Taher Admin Tester',
    phone: '+880 1711-234567',
    email: 'abdullahalhumidy@gmail.com',
    address: 'Keraniganj Wholesale Market, Dhaka',
    city: 'Dhaka',
    district: 'Dhaka',
    items: [
      {
        product: { designNumber: 'Design #101 (Test)', category: 'Omani & Zari Series', price: 650 },
        selectedSize: '54 cm',
        quantity: 2
      }
    ],
    total: 1300,
    paymentMethod: 'Cash on Delivery (COD)',
    paymentStatus: 'Pending',
    orderStatus: 'Processing',
    transactionId: 'TXN-TEST-1234'
  };

  const result = await sendOrderNotificationEmail(testOrder);
  return res.json({ 
    success: true, 
    result,
    recipient: process.env.ADMIN_NOTIFICATION_EMAIL || 'abdullahalhumidy@gmail.com',
    message: `Test email notification dispatched to ${process.env.ADMIN_NOTIFICATION_EMAIL || 'abdullahalhumidy@gmail.com'}`
  });
});

// Dynamic SEO Sitemap endpoint for search engines
app.get('/sitemap.xml', (req, res) => {
  res.header('Content-Type', 'application/xml');
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://altahercap.com/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="bn" href="https://altahercap.com/?lang=bn" />
    <xhtml:link rel="alternate" hreflang="en" href="https://altahercap.com/?lang=en" />
    <image:image>
      <image:loc>https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&amp;w=1200&amp;auto=format&amp;fit=crop</image:loc>
      <image:title>Taher Cap &amp; Al Taher Cap Garments - Premium Namaz Topi Wholesale Bangladesh</image:title>
      <image:caption>Authentic Taher Cap and Namaz Topi manufacturer and wholesale supplier in Bangladesh</image:caption>
    </image:image>
  </url>
</urlset>`;
  res.send(sitemapXml);
});

// SEO Robots.txt endpoint
app.get('/robots.txt', (req, res) => {
  res.header('Content-Type', 'text/plain');
  res.send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: https://altahercap.com/sitemap.xml
`);
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
