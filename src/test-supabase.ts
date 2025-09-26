import 'dotenv/config'; // load .env (usually done in app entrypoint)
import { supabase } from './config/supabase-client.js';

async function testConnection() {

    const { data, error } = await supabase.from('dummy').select('*').limit(1)

    if (error) {
        console.error('Supabase connection failed:', error.message)
    } else {
        console.log('Supabase connection successful. Sample data:', data)
    }
}

testConnection();
