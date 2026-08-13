import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory databases for backend simulation
const inquiriesDatabase: any[] = [];
const ordersDatabase: any[] = [];
const customDesignsDatabase: any[] = [];

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
        ? 'আসসালামু আলাইকুম! আল তাহের ক্যাপ গার্মেন্টসে আপনাকে স্বাগতম। আমরা ওমানি, ভেলভেট, সুতি জালি, তুর্কি ও নকশী টুপির রফতানিকারক। আপনার পছন্দের কাপড়ের ধরন বা বাজেট জানালে আমি সেরা টুপিটি সুপারিশ করে দিবো।'
        : 'Assalamu Alaikum! Welcome to Al Taher Cap Garments. We manufacture Omani, Velvet, Cotton Net, Turkish, and Hand-Embroidered prayer caps. Tell me your fabric or budget preference and I will recommend the best tupi for you.';
      return res.json({ reply: fallbackMsg });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are the official AI Tupi & Islamic Attire Consultant for "Al Taher Cap Garments" (আল তাহের ক্যাপ গার্মেন্টস), Bangladesh's premier Islamic Prayer Cap (Namaz Tupi) manufacturer and exporter since 2012.
    
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
  inquiriesDatabase.push(newInquiry);
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

  ordersDatabase.push(newOrder);
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
