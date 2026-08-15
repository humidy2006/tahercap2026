import { Product } from '../types';
import { IMAGES } from './images';

export const INITIAL_PRODUCTS: Product[] = [
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
    image: IMAGES.omaniTupi,
    images: [
      IMAGES.omaniTupi,
      IMAGES.velvetTupi,
      IMAGES.cottonTupi,
      IMAGES.turkishCap
    ],
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
    image: IMAGES.velvetTupi,
    images: [
      IMAGES.velvetTupi,
      IMAGES.omaniTupi,
      IMAGES.pakistaniTupi
    ],
  },
  {
    id: 'atg-201',
    category: 'Omani & Zari Series',
    categoryBn: 'ওমানি ও জারি সিরিজ',
    designNumber: 'Design #201',
    price: 720,
    originalPrice: 920,
    quantity: '1 Pc',
    sizes: ['48 cm', '50 cm', '52 cm', '54 cm', '56 cm', '58 cm'],
    isFeatured: true,
    image: IMAGES.omaniDiamond,
    images: [
      IMAGES.omaniDiamond,
      IMAGES.omaniTupi
    ],
  },
  {
    id: 'atg-202',
    category: 'Omani & Zari Series',
    categoryBn: 'ওমানি ও জারি সিরিজ',
    designNumber: 'Design #202',
    price: 680,
    originalPrice: 880,
    quantity: '1 Pc',
    sizes: ['48 cm', '50 cm', '52 cm', '54 cm', '56 cm', '58 cm'],
    isFeatured: true,
    image: IMAGES.omaniDiamond,
    images: [
      IMAGES.omaniDiamond
    ],
  },
  {
    id: 'atg-301',
    category: 'Royal Velvet',
    categoryBn: 'রয়েল ভেলভেট',
    designNumber: 'Design #301',
    price: 980,
    originalPrice: 1250,
    quantity: '1 Pc',
    sizes: ['50 cm', '52 cm', '54 cm', '56 cm'],
    isFeatured: true,
    image: IMAGES.velvetCircular,
    images: [
      IMAGES.velvetCircular,
      IMAGES.velvetTupi
    ],
  },
  {
    id: 'atg-302',
    category: 'Royal Velvet',
    categoryBn: 'রয়েল ভেলভেট',
    designNumber: 'Design #302',
    price: 950,
    originalPrice: 1200,
    quantity: '1 Pc',
    sizes: ['48 cm', '50 cm', '52 cm', '54 cm', '56 cm'],
    isFeatured: true,
    image: IMAGES.velvetCircular,
    images: [
      IMAGES.velvetCircular
    ],
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
    image: IMAGES.cottonTupi,
    images: [
      IMAGES.cottonTupi,
      IMAGES.omaniTupi,
      IMAGES.turkishCap
    ],
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
    image: IMAGES.omaniTupi,
    images: [
      IMAGES.omaniTupi,
      IMAGES.velvetTupi,
      IMAGES.cottonTupi
    ],
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
    image: IMAGES.turkishCap,
    images: [
      IMAGES.turkishCap,
      IMAGES.omaniTupi,
      IMAGES.velvetTupi
    ],
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
    image: IMAGES.pakistaniTupi,
    images: [
      IMAGES.pakistaniTupi,
      IMAGES.velvetTupi,
      IMAGES.omaniTupi
    ],
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
    image: IMAGES.kidsTupi,
    images: [
      IMAGES.kidsTupi,
      IMAGES.cottonTupi,
      IMAGES.omaniTupi
    ],
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
    image: IMAGES.hajjSet,
    images: [
      IMAGES.hajjSet,
      IMAGES.omaniTupi,
      IMAGES.velvetTupi,
      IMAGES.cottonTupi
    ],
  }
];

