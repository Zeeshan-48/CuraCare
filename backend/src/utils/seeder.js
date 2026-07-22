import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

// Fix local DNS resolution for MongoDB Atlas SRV records
dns.setDefaultResultOrder('ipv4first');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (err) {
  console.warn('DNS setServers failed:', err.message);
}

import Category from '../models/categoryModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';
import Banner from '../models/bannerModel.js';
import Testimonial from '../models/testimonialModel.js';
import HealthTip from '../models/healthTipModel.js';

// Setup __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure env variables from root of backend
dotenv.config({ path: path.join(__dirname, '../../.env') });

const categoriesData = [
  {
    name: 'Tablets',
    description: 'Prescription and over-the-counter daily tablets, pain relievers, and antibiotics.',
    image: '/tablets.png',
  },
  {
    name: 'Capsules',
    description: 'Liquid gels, gelatin-coated capsules, and fast-release vitamins.',
    image: '/capsules.png',
  },
  {
    name: 'Syrups',
    description: 'Cough syrups, oral liquids, suspensions, and pediatric formulations.',
    image: '/syrups.png',
  },
  {
    name: 'Injections',
    description: 'Sterile vials, pre-filled syringes, insulin, and clinical injectables.',
    image: '/injections.png',
  },
  {
    name: 'Ointments',
    description: 'Topical creams, gels, skin ointments, and antiseptic rubs.',
    image: '/ointments.png',
  },
];

const productsData = (categoryIds) => [
  {
    name: 'CuraCare Paracetamol Extra 500mg',
    genericName: 'Paracetamol & Caffeine',
    brand: 'CuraCare',
    category: categoryIds['Tablets'],
    description: 'Panadol Extra formulated for tough pain relief. Provides relief from headache, migraine, backache, and toothache.',
    uses: 'For fast and effective relief of tough pain, such as headache, dental pain, muscle pain, and period pain.',
    sideEffects: 'Mild stomach discomfort, skin rash, sleep disturbances if taken late in evening due to caffeine.',
    dosage: 'Adults: 1-2 tablets every 4 to 6 hours as needed. Do not exceed 8 tablets in 24 hours.',
    stock: 120,
    price: 5.99,
    discount: 10,
    images: [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=600',
    ],
    prescriptionRequired: false,
    isFeatured: true,
    isBestSeller: true,
    averageRating: 4.8,
    numOfReviews: 12,
  },
  {
    name: 'CuraCare Amoxicillin 500mg Capsule',
    genericName: 'Amoxicillin Trihydrate',
    brand: 'CuraCare',
    category: categoryIds['Capsules'],
    description: 'Amoxil is a broad-spectrum penicillin antibiotic used to treat bacterial infections like pneumonia, bronchitis, tonsillitis, and UTIs.',
    uses: 'Treatment of bacterial infections of the ears, nose, throat, skin, urinary tract, and respiratory system.',
    sideEffects: 'Nausea, vomiting, diarrhea, skin rash, hives, or yeast infections.',
    dosage: 'One capsule (500mg) three times daily or as directed by a healthcare professional. Complete the full course.',
    stock: 45,
    price: 14.5,
    discount: 0,
    images: [
      'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&q=80&w=600',
    ],
    prescriptionRequired: true,
    isFeatured: false,
    isBestSeller: false,
    averageRating: 4.5,
    numOfReviews: 5,
  },
  {
    name: 'CuraCare Ibuprofen Liquid Gels 200mg',
    genericName: 'Ibuprofen Solubilized',
    brand: 'CuraCare',
    category: categoryIds['Capsules'],
    description: 'Advil Liquid Gels provide fast, liquid-strength pain relief from headaches, muscle aches, backaches, and minor arthritis pain.',
    uses: 'Temporary relief of minor aches and pains, and reduction of fever.',
    sideEffects: 'Stomach irritation, heartburn, dizziness, allergic reactions in rare cases.',
    dosage: 'Take 1 capsule every 4 to 6 hours while symptoms persist. Do not exceed 6 capsules in 24 hours.',
    stock: 140,
    price: 9.99,
    discount: 12,
    images: [
      'https://images.unsplash.com/photo-1550572017-edd951b55104?auto=format&fit=crop&q=80&w=600',
    ],
    prescriptionRequired: false,
    isFeatured: true,
    isBestSeller: true,
    averageRating: 4.8,
    numOfReviews: 24,
  },
  {
    name: 'CuraCare Atorvastatin 20mg Tablet',
    genericName: 'Atorvastatin Calcium',
    brand: 'CuraCare',
    category: categoryIds['Tablets'],
    description: 'Lipitor is a statin medication used to prevent cardiovascular disease and lower lipids/cholesterol in those at high risk.',
    uses: 'Lowering high LDL cholesterol and triglycerides in the blood, and reducing the risk of heart attack/stroke.',
    sideEffects: 'Joint pain, diarrhea, muscle aches, liver enzyme changes.',
    dosage: 'Take one tablet daily at the same time, with or without food, as directed by your physician.',
    stock: 60,
    price: 32.0,
    discount: 0,
    images: [
      'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=600',
    ],
    prescriptionRequired: true,
    isFeatured: false,
    isBestSeller: false,
    averageRating: 4.4,
    numOfReviews: 6,
  },
  {
    name: 'CuraCare Cough Relief Syrup',
    genericName: 'Dextromethorphan Hydrobromide',
    brand: 'CuraCare',
    category: categoryIds['Syrups'],
    description: 'Fast-acting cough syrup to relieve dry and tickly coughs.',
    uses: 'Temporary relief of coughs due to minor throat irritation.',
    sideEffects: 'Drowsiness, dizziness, mild nausea.',
    dosage: 'Adults: 10ml every 4 hours. Do not exceed 60ml in 24 hours.',
    stock: 150,
    price: 7.49,
    discount: 0,
    images: [
      'https://images.unsplash.com/photo-1550572017-edd951b55104?auto=format&fit=crop&q=80&w=600',
    ],
    prescriptionRequired: false,
    isFeatured: false,
    isBestSeller: false,
    averageRating: 4.6,
    numOfReviews: 10,
  },
  {
    name: 'CuraCare Insulin Glargine Injection',
    genericName: 'Insulin Glargine (rDNA origin)',
    brand: 'CuraCare',
    category: categoryIds['Injections'],
    description: 'Long-acting insulin injection for daily blood sugar control in diabetes.',
    uses: 'To improve glycemic control in adults and pediatric patients with type 1 and type 2 diabetes.',
    sideEffects: 'Hypoglycemia, injection site reactions, lipodystrophy.',
    dosage: 'Administer subcutaneously once daily at any time of day, at the same time every day.',
    stock: 30,
    price: 45.99,
    discount: 0,
    images: [
      'https://images.unsplash.com/photo-1579684389782-64d84b5e9053?auto=format&fit=crop&q=80&w=600',
    ],
    prescriptionRequired: true,
    isFeatured: false,
    isBestSeller: false,
    averageRating: 4.5,
    numOfReviews: 4,
  },
  {
    name: 'CuraCare Antiseptic Healing Ointment',
    genericName: 'Neomycin & Polymyxin B',
    brand: 'CuraCare',
    category: categoryIds['Ointments'],
    description: 'Triple antibiotic ointment to prevent infection in minor cuts, scrapes, and burns.',
    uses: 'First aid to help prevent infection in minor cuts, scrapes, and burns.',
    sideEffects: 'Skin irritation, allergic contact dermatitis.',
    dosage: 'Clean the affected area. Apply a small amount on the area 1 to 3 times daily.',
    stock: 180,
    price: 6.99,
    discount: 0,
    images: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=600',
    ],
    prescriptionRequired: false,
    isFeatured: false,
    isBestSeller: false,
    averageRating: 4.7,
    numOfReviews: 15,
  },
];

const bannersData = [
  {
    title: 'Your Health, Delivered Right To Your Doorstep',
    subtitle: 'Get up to 20% off on daily medicines and wellness supplements with verified prescription clearance.',
    image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=1200',
    link: '/products',
    isActive: true,
  },
  {
    title: 'AI-Powered Medicine Recommendations',
    subtitle: 'Confused about your symptoms? Input your symptoms and get instant verified over-the-counter suggestions.',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1200',
    link: '/ai-recommendations',
    isActive: true,
  },
];

const testimonialsData = [
  {
    name: 'Sarah Jenkins',
    role: 'Chronic Patient',
    text: 'CuraCare has completely changed how I order my asthma inhalers. The prescription verification is seamless, and deliveries are always on time.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
  },
  {
    name: 'David Miller',
    role: 'Fitness Enthusiast',
    text: 'I buy all my daily vitamins and supplements from here. The pricing is better than physical stores, and the dark mode makes late-night orders easy.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100',
  },
];

const healthTipsData = [
  {
    title: 'Understanding Antibiotic Dosage Rules',
    excerpt: 'Completing your antibiotic course is crucial, even if you feel better. Read why premature termination leads to bacterial resistance.',
    category: 'Tablets',
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&q=80&w=400',
  },
  {
    title: '5 Crucial Supplements for Joint Pain',
    excerpt: 'From Glucosamine to Omega-3 oils, explore how target wellness supplements ease cartilage friction and reduce knee inflammation.',
    category: 'Wellness',
    image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=400',
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Database connected for seeding...');

    // Clear existing collections
    await Category.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    await Banner.deleteMany();
    await Testimonial.deleteMany();
    await HealthTip.deleteMany();
    console.log('Cleared existing data.');

    // Seed Categories
    const categoriesWithSlugs = categoriesData.map(cat => ({
      ...cat,
      slug: cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    }));
    const createdCategories = await Category.insertMany(categoriesWithSlugs);
    console.log('Categories seeded successfully.');

    // Map Category names to ObjectIds
    const categoryIds = {};
    createdCategories.forEach((cat) => {
      categoryIds[cat.name] = cat._id;
    });

    // Seed Products
    const productsToSeed = productsData(categoryIds).map(prod => ({
      ...prod,
      slug: prod.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    }));
    await Product.insertMany(productsToSeed);
    console.log('Products seeded successfully.');

    // Seed a Default Admin User for testing purposes
    const adminUser = {
      name: 'Zeshan Anwar',
      email: 'zeshan1234anwar@gmail.com',
      password: 'zeshan1234',
      role: 'admin',
      isVerified: true,
    };
    const customerUser = {
      name: 'John Doe',
      email: 'john@gmail.com',
      password: 'customerpassword123',
      role: 'customer',
      isVerified: true,
    };

    await User.create(adminUser);
    await User.create(customerUser);
    console.log('Default Admin and Customer users seeded successfully.');

    // Seed Banners, Testimonials, Health Tips
    await Banner.insertMany(bannersData);
    console.log('Banners seeded successfully.');
    await Testimonial.insertMany(testimonialsData);
    console.log('Testimonials seeded successfully.');
    await HealthTip.insertMany(healthTipsData);
    console.log('Health tips seeded successfully.');

    console.log('Admin Email: zeshan1234anwar@gmail.com | Password: zeshan1234');
    console.log('Customer Email: john@gmail.com | Password: customerpassword123');

    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
