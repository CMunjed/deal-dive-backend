import { supabase } from '../config/supabase-client.js';

const dummyDeals = [
  {
    title: "Happy Hour at The Swamp",
    description: "50% off all drinks from 5-7pm",
    address: "1642 W University Ave, Gainesville, FL 32603",
    geom: `POINT(-82.3248 29.6516)`, // POINT(longitude latitude)
    original_price: 20.00,
    discounted_price: 10.00,
    created_by: 'a0cf202e-2c97-42b2-8cd5-9aa48c5a1c14',
  },
  {
    title: "Midtown Pizza Special",
    description: "Large pizza + 2 drinks for $15",
    address: "1702 W University Ave, Gainesville, FL 32603",
    geom: `POINT(-82.3260 29.6520)`,
    original_price: 25.00,
    discounted_price: 15.00,
    created_by: 'a0cf202e-2c97-42b2-8cd5-9aa48c5a1c14',
  },
];

async function seedDeals() {
  console.log('Starting to seed deals...');

  for (const deal of dummyDeals) {
    try {
      const { error } = await supabase
        .from('deals')
        .insert(deal)
        .select()
        .single();

      if (error) {
        console.error(`Error inserting ${deal.title}:`, error);
      } else {
        console.log(`Inserted: ${deal.title}`);
      }
    } catch (err) {
      console.error(`Failed to insert ${deal.title}:`, err);
    }
  }

  console.log('Seeding complete!');
  process.exit(0);
}

seedDeals();