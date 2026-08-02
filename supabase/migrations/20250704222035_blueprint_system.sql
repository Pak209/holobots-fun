-- Blueprint System Migration
-- Creates tables for managing blueprint pieces, seasons, and global caps

-- Create seasons table to manage different seasons
CREATE TABLE IF NOT EXISTS seasons (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    max_blueprint_pieces INTEGER NOT NULL DEFAULT 500000,
    is_active BOOLEAN NOT NULL DEFAULT false,
    distribution_limits JSONB NOT NULL DEFAULT '{}',
    holobot_weights JSONB NOT NULL DEFAULT '{}',
    daily_player_cap_enabled BOOLEAN NOT NULL DEFAULT true,
    daily_player_cap_amount INTEGER NOT NULL DEFAULT 50,
    legacy_conversion_rate DECIMAL(3,2) NOT NULL DEFAULT 0.1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create global blueprint stats table
CREATE TABLE IF NOT EXISTS global_blueprint_stats (
    season_id TEXT PRIMARY KEY REFERENCES seasons(id),
    total_pieces_dropped INTEGER NOT NULL DEFAULT 0,
    total_pieces_used INTEGER NOT NULL DEFAULT 0,
    remaining_pieces INTEGER NOT NULL DEFAULT 0,
    holobot_distribution JSONB NOT NULL DEFAULT '{}',
    source_distribution JSONB NOT NULL DEFAULT '{}',
    total_mints_completed INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create player blueprint states table
CREATE TABLE IF NOT EXISTS player_blueprint_states (
    user_id UUID NOT NULL,
    season_id TEXT NOT NULL REFERENCES seasons(id),
    blueprint_pieces JSONB NOT NULL DEFAULT '{}',
    total_pieces_earned INTEGER NOT NULL DEFAULT 0,
    total_pieces_used INTEGER NOT NULL DEFAULT 0,
    daily_pieces_earned INTEGER NOT NULL DEFAULT 0,
    last_daily_reset TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    mint_catalysts INTEGER NOT NULL DEFAULT 0,
    legacy_chips INTEGER NOT NULL DEFAULT 0,
    last_blueprint_earned TIMESTAMPTZ,
    source_breakdown JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, season_id)
);

-- Create blueprint drop history table for tracking and analytics
CREATE TABLE IF NOT EXISTS blueprint_drop_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    season_id TEXT NOT NULL REFERENCES seasons(id),
    holobot_type TEXT NOT NULL,
    pieces_awarded INTEGER NOT NULL,
    source TEXT NOT NULL,
    rarity_bonus BOOLEAN NOT NULL DEFAULT false,
    global_supply_remaining INTEGER NOT NULL,
    player_daily_remaining INTEGER NOT NULL,
    drop_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB
);

-- Create mint catalysts table for tracking catalyst crafting
CREATE TABLE IF NOT EXISTS mint_catalysts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    season_id TEXT NOT NULL REFERENCES seasons(id),
    holos_cost INTEGER NOT NULL,
    required_activity JSONB NOT NULL,
    crafted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    used_at TIMESTAMPTZ,
    is_used BOOLEAN NOT NULL DEFAULT false
);

-- Create blueprint mints table for tracking completed mints
CREATE TABLE IF NOT EXISTS blueprint_mints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    season_id TEXT NOT NULL REFERENCES seasons(id),
    holobot_type TEXT NOT NULL,
    pieces_used INTEGER NOT NULL,
    catalyst_used BOOLEAN NOT NULL DEFAULT false,
    mint_type TEXT NOT NULL CHECK (mint_type IN ('common', 'legendary')),
    minted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    holobot_data JSONB
);

-- Add RLS policies
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_blueprint_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_blueprint_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE blueprint_drop_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE mint_catalysts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blueprint_mints ENABLE ROW LEVEL SECURITY;

-- Seasons table policies (read-only for users)
CREATE POLICY "Anyone can read seasons" ON seasons FOR SELECT USING (true);
CREATE POLICY "Service role can manage seasons" ON seasons FOR ALL USING (auth.role() = 'service_role');

-- Global blueprint stats policies (read-only for users)
CREATE POLICY "Anyone can read global blueprint stats" ON global_blueprint_stats FOR SELECT USING (true);
CREATE POLICY "Service role can manage global blueprint stats" ON global_blueprint_stats FOR ALL USING (auth.role() = 'service_role');

-- Player blueprint states policies (users can only see their own)
CREATE POLICY "Users can view their own blueprint states" ON player_blueprint_states FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own blueprint states" ON player_blueprint_states FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own blueprint states" ON player_blueprint_states FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role can manage all blueprint states" ON player_blueprint_states FOR ALL USING (auth.role() = 'service_role');

-- Blueprint drop history policies (users can only see their own)
CREATE POLICY "Users can view their own drop history" ON blueprint_drop_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage all drop history" ON blueprint_drop_history FOR ALL USING (auth.role() = 'service_role');

-- Mint catalysts policies (users can only see their own)
CREATE POLICY "Users can view their own mint catalysts" ON mint_catalysts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own mint catalysts" ON mint_catalysts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own mint catalysts" ON mint_catalysts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role can manage all mint catalysts" ON mint_catalysts FOR ALL USING (auth.role() = 'service_role');

-- Blueprint mints policies (users can only see their own)
CREATE POLICY "Users can view their own blueprint mints" ON blueprint_mints FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own blueprint mints" ON blueprint_mints FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role can manage all blueprint mints" ON blueprint_mints FOR ALL USING (auth.role() = 'service_role');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_seasons_active ON seasons(is_active, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_global_stats_season ON global_blueprint_stats(season_id);
CREATE INDEX IF NOT EXISTS idx_player_states_user_season ON player_blueprint_states(user_id, season_id);
CREATE INDEX IF NOT EXISTS idx_drop_history_user_season ON blueprint_drop_history(user_id, season_id);
CREATE INDEX IF NOT EXISTS idx_drop_history_timestamp ON blueprint_drop_history(drop_timestamp);
CREATE INDEX IF NOT EXISTS idx_mint_catalysts_user_season ON mint_catalysts(user_id, season_id);
CREATE INDEX IF NOT EXISTS idx_blueprint_mints_user_season ON blueprint_mints(user_id, season_id);

-- Create trigger function to update global stats when blueprint pieces are awarded
CREATE OR REPLACE FUNCTION update_global_blueprint_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update global stats when blueprint pieces are awarded
    IF TG_OP = 'INSERT' THEN
        UPDATE global_blueprint_stats 
        SET 
            total_pieces_dropped = total_pieces_dropped + NEW.pieces_awarded,
            remaining_pieces = remaining_pieces - NEW.pieces_awarded,
            holobot_distribution = holobot_distribution || 
                jsonb_build_object(
                    NEW.holobot_type, 
                    COALESCE((holobot_distribution->NEW.holobot_type)::integer, 0) + NEW.pieces_awarded
                ),
            source_distribution = source_distribution || 
                jsonb_build_object(
                    NEW.source, 
                    COALESCE((source_distribution->NEW.source)::integer, 0) + NEW.pieces_awarded
                ),
            last_updated = NOW()
        WHERE season_id = NEW.season_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating global stats
CREATE TRIGGER trigger_update_global_stats
    AFTER INSERT ON blueprint_drop_history
    FOR EACH ROW
    EXECUTE FUNCTION update_global_blueprint_stats();

-- Create trigger function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating timestamps
CREATE TRIGGER trigger_seasons_updated_at
    BEFORE UPDATE ON seasons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_player_states_updated_at
    BEFORE UPDATE ON player_blueprint_states
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Insert default Season 1 configuration
INSERT INTO seasons (
    id, name, start_date, end_date, max_blueprint_pieces, is_active,
    distribution_limits, holobot_weights, daily_player_cap_enabled,
    daily_player_cap_amount, legacy_conversion_rate
) VALUES (
    'season_1',
    'Genesis Season',
    NOW(),
    NOW() + INTERVAL '90 days',
    500000,
    true,
    '{"quest_rewards": 200000, "sync_training": 75000, "arena_battles": 75000, "league_rewards": 50000, "booster_packs": 100000, "seasonal_events": 50000, "daily_missions": 25000, "achievement_rewards": 25000}',
    '{"ace": 1.0, "kuma": 1.0, "shadow": 1.0, "hare": 1.0, "tora": 1.0, "wake": 1.0, "era": 1.0, "gama": 1.0, "ken": 1.0, "kurai": 1.0, "tsuin": 1.0, "wolf": 1.0}',
    true,
    50,
    0.1
) ON CONFLICT (id) DO NOTHING;

-- Insert default global blueprint stats for Season 1
INSERT INTO global_blueprint_stats (
    season_id, total_pieces_dropped, total_pieces_used, remaining_pieces,
    holobot_distribution, source_distribution, total_mints_completed
) VALUES (
    'season_1', 0, 0, 500000,
    '{"ace": 0, "kuma": 0, "shadow": 0, "hare": 0, "tora": 0, "wake": 0, "era": 0, "gama": 0, "ken": 0, "kurai": 0, "tsuin": 0, "wolf": 0}',
    '{"quest_rewards": 0, "sync_training": 0, "arena_battles": 0, "league_rewards": 0, "booster_packs": 0, "seasonal_events": 0, "daily_missions": 0, "achievement_rewards": 0}',
    0
) ON CONFLICT (season_id) DO NOTHING;

-- Add comments for documentation
COMMENT ON TABLE seasons IS 'Stores configuration for different blueprint seasons';
COMMENT ON TABLE global_blueprint_stats IS 'Tracks global blueprint piece statistics per season';
COMMENT ON TABLE player_blueprint_states IS 'Stores individual player blueprint piece inventories and states';
COMMENT ON TABLE blueprint_drop_history IS 'Complete history of all blueprint piece drops for analytics';
COMMENT ON TABLE mint_catalysts IS 'Tracks crafted and used mint catalysts';
COMMENT ON TABLE blueprint_mints IS 'Records all completed holobot mints using blueprint pieces';