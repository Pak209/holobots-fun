-- Async Auto-Battle System Migration
-- Battle Leagues (PvE)
CREATE TYPE league_type AS ENUM ('junkyard', 'city_scraps', 'neon_core', 'overlord');
CREATE TYPE battle_pool_type AS ENUM ('casual', 'ranked');
CREATE TYPE battle_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- Fitness Activity Tracking
CREATE TABLE fitness_activity (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  steps INTEGER DEFAULT 0,
  workout_time INTEGER DEFAULT 0, -- in seconds
  calories_burned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Battle Tickets System
CREATE TABLE battle_tickets (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  daily_tickets INTEGER DEFAULT 3,
  bonus_tickets INTEGER DEFAULT 0,
  last_reset DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Leagues and Battle Pools
CREATE TABLE battle_leagues (
  id SERIAL PRIMARY KEY,
  league_type league_type NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  min_steps_required INTEGER DEFAULT 0,
  energy_cost INTEGER DEFAULT 0,
  cpu_level_range INTEGER[] DEFAULT ARRAY[1, 10], -- [min, max]
  rewards JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Battle Pools (PvP)
CREATE TABLE battle_pools (
  id SERIAL PRIMARY KEY,
  pool_type battle_pool_type NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  entry_requirements JSONB DEFAULT '{}', -- steps, level, etc.
  rewards JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  cycle_start_time TIMESTAMPTZ DEFAULT NOW(),
  cycle_duration INTERVAL DEFAULT '24 hours'
);

-- Battle Pool Entries (Player submissions)
CREATE TABLE battle_pool_entries (
  id SERIAL PRIMARY KEY,
  pool_id INTEGER REFERENCES battle_pools(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  holobot_name VARCHAR(50) NOT NULL,
  holobot_stats JSONB NOT NULL, -- Snapshot of stats at submission time
  fitness_bonus JSONB DEFAULT '{}', -- Fitness-based bonuses applied
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(pool_id, user_id)
);

-- Async Battles
CREATE TABLE async_battles (
  id SERIAL PRIMARY KEY,
  battle_type VARCHAR(20) NOT NULL, -- 'pve_league' or 'pvp_pool'
  league_id INTEGER REFERENCES battle_leagues(id) ON DELETE SET NULL,
  pool_id INTEGER REFERENCES battle_pools(id) ON DELETE SET NULL,
  player1_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  player1_holobot JSONB NOT NULL,
  player2_id TEXT REFERENCES profiles(id) ON DELETE CASCADE, -- NULL for PvE
  player2_holobot JSONB NOT NULL, -- CPU or player holobot
  battle_log JSONB DEFAULT '[]',
  winner_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  battle_status battle_status DEFAULT 'pending',
  rewards JSONB DEFAULT '{}',
  scheduled_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Battle Results and Rankings
CREATE TABLE battle_rankings (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  pool_id INTEGER REFERENCES battle_pools(id) ON DELETE CASCADE,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  draw INTEGER DEFAULT 0,
  rating INTEGER DEFAULT 1000, -- ELO-style rating
  rank_position INTEGER,
  season_start DATE DEFAULT CURRENT_DATE,
  last_battle_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, pool_id, season_start)
);

-- Daily Fitness Rewards
CREATE TABLE daily_fitness_rewards (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  steps_achieved INTEGER DEFAULT 0,
  target_steps INTEGER DEFAULT 10000,
  rewards_claimed JSONB DEFAULT '{}',
  battle_bonuses JSONB DEFAULT '{}', -- Fitness bonuses for battles
  is_claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Insert default leagues
INSERT INTO battle_leagues (league_type, name, description, min_steps_required, energy_cost, cpu_level_range, rewards) VALUES 
('junkyard', 'Junkyard League', 'Easy league for beginners', 2000, 5, ARRAY[5, 10], '{"holos": 50, "exp": 100}'),
('city_scraps', 'City Scraps League', 'Medium difficulty league', 4000, 10, ARRAY[15, 25], '{"holos": 100, "exp": 200, "parts": 1}'),
('neon_core', 'Neon Core League', 'Hard league for advanced players', 6000, 15, ARRAY[30, 40], '{"holos": 200, "exp": 400, "parts": 2}'),
('overlord', 'Overlord League', 'Endgame AI bosses', 8000, 20, ARRAY[45, 50], '{"holos": 500, "exp": 800, "parts": 3, "legendary_parts": 1}');

-- Insert default battle pools
INSERT INTO battle_pools (pool_type, name, description, entry_requirements, rewards) VALUES 
('casual', 'Casual Battle Pool', 'Relaxed PvP battles', '{"min_level": 1}', '{"holos": 25, "exp": 50}'),
('ranked', 'Ranked Battle Pool', 'Competitive PvP battles', '{"min_level": 5, "min_steps": 1000}', '{"holos": 100, "exp": 200, "rating_points": 25}');

-- Functions for battle simulation
CREATE OR REPLACE FUNCTION calculate_fitness_bonus(user_id_param TEXT, battle_date DATE DEFAULT CURRENT_DATE)
RETURNS JSONB AS $$
DECLARE
  fitness_data RECORD;
  bonus JSONB := '{}';
BEGIN
  SELECT * INTO fitness_data 
  FROM fitness_activity 
  WHERE user_id = user_id_param AND date = battle_date;
  
  IF FOUND THEN
    -- Calculate bonuses based on steps
    IF fitness_data.steps >= 2000 THEN
      bonus := bonus || '{"hp_bonus": 5}';
    END IF;
    IF fitness_data.steps >= 4000 THEN
      bonus := bonus || '{"attack_bonus": 3}';
    END IF;
    IF fitness_data.steps >= 6000 THEN
      bonus := bonus || '{"special_charge_bonus": 10}';
    END IF;
    IF fitness_data.steps >= 8000 THEN
      bonus := bonus || '{"all_stats_bonus": 5}';
    END IF;
  END IF;
  
  RETURN bonus;
END;
$$ LANGUAGE plpgsql;

-- Function to reset daily battle tickets
CREATE OR REPLACE FUNCTION reset_daily_tickets()
RETURNS VOID AS $$
BEGIN
  UPDATE battle_tickets 
  SET daily_tickets = 3, last_reset = CURRENT_DATE
  WHERE last_reset < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Indexes for performance
CREATE INDEX idx_fitness_activity_user_date ON fitness_activity(user_id, date);
CREATE INDEX idx_battle_pool_entries_pool_active ON battle_pool_entries(pool_id, is_active);
CREATE INDEX idx_async_battles_status ON async_battles(battle_status);
CREATE INDEX idx_async_battles_scheduled ON async_battles(scheduled_at) WHERE battle_status = 'pending';
CREATE INDEX idx_battle_rankings_pool_rating ON battle_rankings(pool_id, rating DESC);
CREATE INDEX idx_daily_fitness_rewards_user_date ON daily_fitness_rewards(user_id, date);

-- RLS policies
ALTER TABLE fitness_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_pool_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE async_battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_fitness_rewards ENABLE ROW LEVEL SECURITY;

-- Fitness activity policies
CREATE POLICY "Users can manage their own fitness data" ON fitness_activity
FOR ALL USING (auth.uid()::text = user_id);

-- Battle tickets policies
CREATE POLICY "Users can view their own battle tickets" ON battle_tickets
FOR ALL USING (auth.uid()::text = user_id);

-- Battle pool entries policies
CREATE POLICY "Users can manage their own pool entries" ON battle_pool_entries
FOR ALL USING (auth.uid()::text = user_id);

CREATE POLICY "All users can view active pool entries" ON battle_pool_entries
FOR SELECT USING (is_active = true);

-- Async battles policies
CREATE POLICY "Users can view their own battles" ON async_battles
FOR SELECT USING (auth.uid()::text = player1_id OR auth.uid()::text = player2_id);

CREATE POLICY "System can manage all battles" ON async_battles
FOR ALL USING (current_setting('role') = 'service_role');

-- Battle rankings policies
CREATE POLICY "Users can view their own rankings" ON battle_rankings
FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "All users can view rankings for leaderboards" ON battle_rankings
FOR SELECT USING (true);

-- Daily fitness rewards policies
CREATE POLICY "Users can manage their own fitness rewards" ON daily_fitness_rewards
FOR ALL USING (auth.uid()::text = user_id);

-- Add columns to profiles for battle system
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS battle_tickets INTEGER DEFAULT 3;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_fitness_sync DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS battle_rating INTEGER DEFAULT 1000; 