# Supabase Setup Guide for OrphiCrowdFund

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - Name: `orphi-crowdfund`
   - Database Password: (generate a strong password)
   - Region: Choose closest to your users
6. Click "Create new project"

## 2. Get Your Project Credentials

1. Go to Settings → API
2. Copy your:
   - Project URL
   - Anon public key

## 3. Set Up Environment Variables

Create a `.env.local` file in your project root:

```bash
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## 4. Database Schema Setup

Run these SQL commands in your Supabase SQL Editor:

### Create User Profiles Table

```sql
-- Create user_profiles table
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  wallet_address TEXT,
  phone TEXT,
  country TEXT,
  referral_code TEXT UNIQUE,
  referrer_id UUID REFERENCES user_profiles(id),
  level INTEGER DEFAULT 1,
  total_earnings DECIMAL(20,8) DEFAULT 0,
  total_referrals INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id, full_name, wallet_address, referral_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'wallet_address', ''),
    COALESCE(NEW.raw_user_meta_data->>'referral_code', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### Create Referrals Table

```sql
-- Create referrals table
CREATE TABLE referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  commission_amount DECIMAL(20,8) DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(referrer_id, referred_id)
);

-- Enable Row Level Security
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view referrals they're involved in" ON referrals
  FOR SELECT USING (auth.uid() IN (
    SELECT user_id FROM user_profiles WHERE id = referrer_id OR id = referred_id
  ));

CREATE POLICY "Users can insert referrals" ON referrals
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT user_id FROM user_profiles WHERE id = referrer_id
  ));
```

### Create Transactions Table

```sql
-- Create transactions table
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  transaction_hash TEXT,
  amount DECIMAL(20,8),
  transaction_type TEXT, -- 'investment', 'withdrawal', 'commission', 'bonus'
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  network TEXT, -- 'bsc', 'ethereum', etc.
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (auth.uid() IN (
    SELECT user_id FROM user_profiles WHERE id = user_id
  ));

CREATE POLICY "Users can insert their own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT user_id FROM user_profiles WHERE id = user_id
  ));
```

### Create Network Levels Table

```sql
-- Create network_levels table for MLM structure
CREATE TABLE network_levels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  level INTEGER,
  members_count INTEGER DEFAULT 0,
  total_volume DECIMAL(20,8) DEFAULT 0,
  commission_rate DECIMAL(5,4) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, level)
);

-- Enable Row Level Security
ALTER TABLE network_levels ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own network levels" ON network_levels
  FOR SELECT USING (auth.uid() IN (
    SELECT user_id FROM user_profiles WHERE id = user_id
  ));
```

## 5. Create Indexes for Performance

```sql
-- Create indexes for better performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_referral_code ON user_profiles(referral_code);
CREATE INDEX idx_user_profiles_referrer_id ON user_profiles(referrer_id);
CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_network_levels_user_id ON network_levels(user_id);
```

## 6. Enable Real-time Features

In your Supabase dashboard:
1. Go to Database → Replication
2. Enable real-time for all tables:
   - user_profiles
   - referrals
   - transactions
   - network_levels

## 7. Set Up Authentication

1. Go to Authentication → Settings
2. Configure your site URL
3. Set up email templates (optional)
4. Configure social providers if needed

## 8. Test the Integration

1. Start your development server: `npm run dev`
2. Try signing up a new user
3. Check if the user profile is created automatically
4. Test the authentication flow

## 9. Security Considerations

- All tables have Row Level Security (RLS) enabled
- Users can only access their own data
- Sensitive operations are protected by policies
- Use environment variables for credentials
- Never commit `.env.local` to version control

## 10. Usage Examples

### Sign Up a New User
```javascript
import { useSupabase } from './contexts/SupabaseContext'

const { signUp } = useSupabase()

const handleSignUp = async () => {
  const { data, error } = await signUp(email, password, {
    full_name: 'John Doe',
    wallet_address: '0x...',
    referral_code: 'REF123'
  })
}
```

### Get User Profile
```javascript
import { useSupabase } from './contexts/SupabaseContext'

const { userProfile } = useSupabase()
```

### Update Profile
```javascript
import { useSupabase } from './contexts/SupabaseContext'

const { updateProfile } = useSupabase()

const handleUpdate = async () => {
  const { data, error } = await updateProfile({
    full_name: 'Jane Doe',
    phone: '+1234567890'
  })
}
```

## 11. Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure your site URL is configured in Supabase
2. **RLS Policy Errors**: Check that your policies are correctly set up
3. **Authentication Issues**: Verify your environment variables are correct
4. **Real-time Not Working**: Ensure real-time is enabled for your tables

### Debug Commands:

```javascript
// Check if Supabase is connected
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)

// Test connection
const { data, error } = await supabase.from('user_profiles').select('*').limit(1)
console.log('Connection test:', { data, error })
```

## 12. Production Deployment

1. Create a production Supabase project
2. Update environment variables for production
3. Set up proper CORS settings
4. Configure email templates
5. Set up monitoring and alerts

For Vercel deployment, add these environment variables in your Vercel dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` 