import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Customer from '../models/Customer';
import Order from '../models/Order';
import Segment from '../models/Segment';
import Campaign from '../models/Campaign';
import Communication from '../models/Communication';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/keventers-crm';

const CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Noida', 'Gurgaon'];
const FIRST_NAMES = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Ananya', 'Diya', 'Saanvi', 'Aadhya', 'Isha', 'Priya', 'Neha', 'Kavya', 'Riya', 'Meera', 'Rohan', 'Amit', 'Rahul', 'Sneha', 'Pooja', 'Karan', 'Nisha'];
const LAST_NAMES = ['Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Kapoor', 'Mehta', 'Jain', 'Agarwal', 'Srivastava', 'Iyer', 'Reddy', 'Patel', 'Das', 'Chatterjee', 'Nair', 'Menon', 'Pillai', 'Rao', 'Bose', 'Dutta'];

const CATALOG = [
  { name: 'Classic Vanilla', category: 'Classic Shakes', price: 179 },
  { name: 'Belgian Chocolate', category: 'Classic Shakes', price: 199 },
  { name: 'Strawberry', category: 'Classic Shakes', price: 189 },
  { name: 'Butterscotch', category: 'Classic Shakes', price: 179 },
  { name: 'Oreo', category: 'Signature Shakes', price: 239 },
  { name: 'KitKat', category: 'Signature Shakes', price: 249 },
  { name: 'Nutella', category: 'Signature Shakes', price: 259 },
  { name: 'Lotus Biscoff', category: 'Signature Shakes', price: 269 },
  { name: 'Mango Madness', category: 'Seasonal Specials', price: 229 },
  { name: 'Alphonso Mango', category: 'Seasonal Specials', price: 259 },
  { name: 'Watermelon Cooler', category: 'Seasonal Specials', price: 199 },
  { name: 'Cold Coffee Classic', category: 'Cold Coffees', price: 199 },
  { name: 'Mocha', category: 'Cold Coffees', price: 219 },
  { name: 'Caramel', category: 'Cold Coffees', price: 229 },
  { name: 'Glass Bottle', category: 'Merchandise', price: 349 },
  { name: 'Tote Bag', category: 'Merchandise', price: 299 },
  { name: 'Mug', category: 'Merchandise', price: 399 }
];

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🧹 Clearing existing data...');
    await Promise.all([
      Customer.deleteMany({}),
      Order.deleteMany({}),
      Segment.deleteMany({}),
      Campaign.deleteMany({}),
      Communication.deleteMany({})
    ]);

    const customersData: any[] = [];
    const ordersData: any[] = [];
    
    let emailCounter = 0;
    const generateCustomerBase = (tags: string[], channelPref: 'whatsapp'|'sms'|'email', scoreMin: number, scoreMax: number) => {
      emailCounter++;
      const firstName = randomChoice(FIRST_NAMES);
      const lastName = randomChoice(LAST_NAMES);
      return {
        _id: new mongoose.Types.ObjectId(),
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${emailCounter}@gmail.com`,
        phone: `+9198${randomInt(10000000, 99999999)}`,
        city: randomChoice(CITIES),
        tags,
        channelPreference: channelPref,
        engagementScore: randomInt(scoreMin, scoreMax),
        totalSpend: 0,
        orderCount: 0,
        averageOrderValue: 0
      };
    };

    const now = new Date();

    console.log('🌱 Generating Loyal Subscribers (136)...');
    for (let i = 0; i < 136; i++) {
      const c = generateCustomerBase(['loyal_subscriber'], 'whatsapp', 80, 100);
      customersData.push(c);
      const numOrders = randomInt(4, 8);
      for (let j = 0; j < numOrders; j++) {
        // Last order < 15 days ago
        const orderDate = new Date(now.getTime() - randomInt(1, 14) * 24 * 60 * 60 * 1000 - randomInt(0, 30) * j * 24 * 60 * 60 * 1000);
        const products = [randomChoice(CATALOG.filter(p => p.category === 'Signature Shakes'))];
        if (Math.random() > 0.5) products.push(randomChoice(CATALOG));
        
        let totalAmount = 0;
        const mappedProducts = products.map(p => {
          const qty = randomInt(1, 2);
          totalAmount += p.price * qty;
          return { name: p.name, category: p.category, price: p.price, quantity: qty };
        });

        ordersData.push({
          customerId: c._id,
          products: mappedProducts,
          totalAmount,
          orderDate,
          city: c.city
        });
      }
    }

    console.log('🌱 Generating Seasonal Gifters (166)...');
    for (let i = 0; i < 166; i++) {
      const c = generateCustomerBase(['seasonal_gifter'], randomChoice(['whatsapp', 'email']), 30, 50);
      customersData.push(c);
      const numOrders = randomInt(3, 5);
      for (let j = 0; j < numOrders; j++) {
        // Last order 55-80 days ago (March-April)
        const orderDate = new Date(now.getTime() - randomInt(55, 80) * 24 * 60 * 60 * 1000 - randomInt(0, 20) * j * 24 * 60 * 60 * 1000);
        const mangoProducts = CATALOG.filter(p => p.name.includes('Mango'));
        const products = [randomChoice(mangoProducts.length ? mangoProducts : CATALOG)];
        
        let totalAmount = 0;
        const mappedProducts = products.map(p => {
          const qty = randomInt(1, 3);
          totalAmount += p.price * qty;
          return { name: p.name, category: p.category, price: p.price, quantity: qty };
        });

        ordersData.push({
          customerId: c._id,
          products: mappedProducts,
          totalAmount,
          orderDate,
          city: c.city
        });
      }
    }

    console.log('🌱 Generating Lapsing Regulars (232)...');
    for (let i = 0; i < 232; i++) {
      const c = generateCustomerBase(['lapsing_regular'], randomChoice(['sms', 'email']), 25, 45);
      customersData.push(c);
      const numOrders = randomInt(3, 6);
      for (let j = 0; j < numOrders; j++) {
        // Last order 40-65 days ago
        const orderDate = new Date(now.getTime() - randomInt(40, 65) * 24 * 60 * 60 * 1000 - randomInt(0, 20) * j * 24 * 60 * 60 * 1000);
        const products = [randomChoice(CATALOG)];
        
        let totalAmount = 0;
        const mappedProducts = products.map(p => {
          const qty = randomInt(1, 2);
          totalAmount += p.price * qty;
          return { name: p.name, category: p.category, price: p.price, quantity: qty };
        });

        ordersData.push({
          customerId: c._id,
          products: mappedProducts,
          totalAmount,
          orderDate,
          city: c.city
        });
      }
    }

    console.log('🌱 Generating One-Time Tryers (184)...');
    for (let i = 0; i < 184; i++) {
      const c = generateCustomerBase(['one_time_tryer'], 'sms', 5, 20);
      customersData.push(c);
      const numOrders = randomInt(1, 3);
      for (let j = 0; j < numOrders; j++) {
        // Inactive 100-180 days
        const orderDate = new Date(now.getTime() - randomInt(100, 180) * 24 * 60 * 60 * 1000 - randomInt(0, 30) * j * 24 * 60 * 60 * 1000);
        const products = [randomChoice(CATALOG)];
        
        let totalAmount = 0;
        const mappedProducts = products.map(p => {
          const qty = 1;
          totalAmount += p.price * qty;
          return { name: p.name, category: p.category, price: p.price, quantity: qty };
        });

        ordersData.push({
          customerId: c._id,
          products: mappedProducts,
          totalAmount,
          orderDate,
          city: c.city
        });
      }
    }

    console.log('🌱 Generating New Promising (136)...');
    for (let i = 0; i < 136; i++) {
      const c = generateCustomerBase(['new_promising'], 'whatsapp', 50, 70);
      customersData.push(c);
      const numOrders = randomInt(1, 2);
      for (let j = 0; j < numOrders; j++) {
        // First order in last 14 days
        const orderDate = new Date(now.getTime() - randomInt(1, 14) * 24 * 60 * 60 * 1000 - randomInt(0, 5) * j * 24 * 60 * 60 * 1000);
        const products = [randomChoice(CATALOG)];
        
        let totalAmount = 0;
        const mappedProducts = products.map(p => {
          const qty = 1;
          totalAmount += p.price * qty;
          return { name: p.name, category: p.category, price: p.price, quantity: qty };
        });

        ordersData.push({
          customerId: c._id,
          products: mappedProducts,
          totalAmount,
          orderDate,
          city: c.city
        });
      }
    }

    console.log('🌱 Generating Discount Hunters (146)...');
    for (let i = 0; i < 146; i++) {
      const c = generateCustomerBase(['discount_hunter'], randomChoice(['email', 'sms']), 60, 80);
      customersData.push(c);
      const numOrders = randomInt(2, 5);
      for (let j = 0; j < numOrders; j++) {
        // Orders over last 6 months but high frequency
        const orderDate = new Date(now.getTime() - randomInt(1, 180) * 24 * 60 * 60 * 1000 - randomInt(0, 10) * j * 24 * 60 * 60 * 1000);
        const products = [randomChoice(CATALOG)];
        
        let totalAmount = 0;
        const mappedProducts = products.map(p => {
          const qty = randomInt(1, 4);
          totalAmount += p.price * qty;
          return { name: p.name, category: p.category, price: p.price, quantity: qty };
        });

        ordersData.push({
          customerId: c._id,
          products: mappedProducts,
          totalAmount,
          orderDate,
          city: c.city
        });
      }
    }

    console.log('🌱 Generating Original Loyalists (175)...');
    for (let i = 0; i < 175; i++) {
      const c = generateCustomerBase(['loyalist'], 'whatsapp', 80, 100);
      customersData.push(c);
      const numOrders = randomInt(4, 8);
      for (let j = 0; j < numOrders; j++) {
        const orderDate = new Date(now.getTime() - randomInt(1, 14) * 24 * 60 * 60 * 1000 - randomInt(0, 30) * j * 24 * 60 * 60 * 1000);
        const products = [randomChoice(CATALOG.filter(p => p.category === 'Signature Shakes'))];
        if (Math.random() > 0.5) products.push(randomChoice(CATALOG));
        let totalAmount = 0;
        const mappedProducts = products.map(p => {
          const qty = randomInt(1, 2);
          totalAmount += p.price * qty;
          return { name: p.name, category: p.category, price: p.price, quantity: qty };
        });
        ordersData.push({ customerId: c._id, products: mappedProducts, totalAmount, orderDate, city: c.city });
      }
    }

    console.log('🌱 Generating Original Mango Lovers (240)...');
    for (let i = 0; i < 240; i++) {
      const c = generateCustomerBase(['mango-lover', 'lapsed'], randomChoice(['whatsapp', 'email']), 30, 50);
      customersData.push(c);
      const numOrders = randomInt(3, 5);
      for (let j = 0; j < numOrders; j++) {
        const orderDate = new Date(now.getTime() - randomInt(55, 80) * 24 * 60 * 60 * 1000 - randomInt(0, 20) * j * 24 * 60 * 60 * 1000);
        const mangoProducts = CATALOG.filter(p => p.name.includes('Mango'));
        const products = [randomChoice(mangoProducts.length ? mangoProducts : CATALOG)];
        let totalAmount = 0;
        const mappedProducts = products.map(p => {
          const qty = randomInt(1, 3);
          totalAmount += p.price * qty;
          return { name: p.name, category: p.category, price: p.price, quantity: qty };
        });
        ordersData.push({ customerId: c._id, products: mappedProducts, totalAmount, orderDate, city: c.city });
      }
    }

    console.log('🌱 Generating Original At-Risk (210)...');
    for (let i = 0; i < 210; i++) {
      const c = generateCustomerBase(['at-risk'], randomChoice(['sms', 'email']), 25, 45);
      customersData.push(c);
      const numOrders = randomInt(3, 6);
      for (let j = 0; j < numOrders; j++) {
        const orderDate = new Date(now.getTime() - randomInt(40, 65) * 24 * 60 * 60 * 1000 - randomInt(0, 20) * j * 24 * 60 * 60 * 1000);
        const products = [randomChoice(CATALOG)];
        let totalAmount = 0;
        const mappedProducts = products.map(p => {
          const qty = randomInt(1, 2);
          totalAmount += p.price * qty;
          return { name: p.name, category: p.category, price: p.price, quantity: qty };
        });
        ordersData.push({ customerId: c._id, products: mappedProducts, totalAmount, orderDate, city: c.city });
      }
    }

    console.log('🌱 Generating Original Churned (225)...');
    for (let i = 0; i < 225; i++) {
      const c = generateCustomerBase(['churned'], 'sms', 5, 20);
      customersData.push(c);
      const numOrders = randomInt(1, 3);
      for (let j = 0; j < numOrders; j++) {
        const orderDate = new Date(now.getTime() - randomInt(100, 180) * 24 * 60 * 60 * 1000 - randomInt(0, 30) * j * 24 * 60 * 60 * 1000);
        const products = [randomChoice(CATALOG)];
        let totalAmount = 0;
        const mappedProducts = products.map(p => {
          const qty = 1;
          totalAmount += p.price * qty;
          return { name: p.name, category: p.category, price: p.price, quantity: qty };
        });
        ordersData.push({ customerId: c._id, products: mappedProducts, totalAmount, orderDate, city: c.city });
      }
    }

    console.log('🌱 Generating Original New (150)...');
    for (let i = 0; i < 150; i++) {
      const c = generateCustomerBase(['new'], 'whatsapp', 50, 70);
      customersData.push(c);
      const numOrders = randomInt(1, 2);
      for (let j = 0; j < numOrders; j++) {
        const orderDate = new Date(now.getTime() - randomInt(1, 14) * 24 * 60 * 60 * 1000 - randomInt(0, 5) * j * 24 * 60 * 60 * 1000);
        const products = [randomChoice(CATALOG)];
        let totalAmount = 0;
        const mappedProducts = products.map(p => {
          const qty = 1;
          totalAmount += p.price * qty;
          return { name: p.name, category: p.category, price: p.price, quantity: qty };
        });
        ordersData.push({ customerId: c._id, products: mappedProducts, totalAmount, orderDate, city: c.city });
      }
    }

    console.log(`💾 Saving ${customersData.length} customers and ${ordersData.length} orders...`);
    await Customer.insertMany(customersData);
    await Order.insertMany(ordersData);

    console.log('🔄 Updating computed fields on customers...');
    const dbOrders = await Order.find();
    const orderMap: Record<string, any[]> = {};
    for (const o of dbOrders) {
      const cid = o.customerId.toString();
      if (!orderMap[cid]) orderMap[cid] = [];
      orderMap[cid].push(o);
    }

    for (const c of customersData) {
      const myOrders = orderMap[c._id.toString()] || [];
      if (myOrders.length === 0) continue;
      
      myOrders.sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime());
      
      const totalSpend = myOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      const orderCount = myOrders.length;
      const averageOrderValue = totalSpend / orderCount;
      const lastOrderDate = myOrders[0].orderDate;
      const firstOrderDate = myOrders[myOrders.length - 1].orderDate;
      
      const productCounts: Record<string, number> = {};
      const categoryCounts: Record<string, number> = {};
      
      myOrders.forEach(o => {
        o.products.forEach((p: any) => {
          productCounts[p.name] = (productCounts[p.name] || 0) + p.quantity;
          categoryCounts[p.category] = (categoryCounts[p.category] || 0) + p.quantity;
        });
      });
      
      const favouriteProduct = Object.keys(productCounts).sort((a, b) => productCounts[b] - productCounts[a])[0];
      const favouriteCategory = Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a])[0];

      await Customer.updateOne({ _id: c._id }, {
        $set: {
          totalSpend,
          orderCount,
          averageOrderValue,
          lastOrderDate,
          firstOrderDate,
          favouriteProduct,
          favouriteCategory
        }
      });
    }

    console.log('✅ Seed complete!');
  } catch (error) {
    console.error('❌ Error during seed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
