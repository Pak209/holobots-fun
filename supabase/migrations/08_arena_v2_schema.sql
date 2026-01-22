-- ============================================================================
-- Arena V2 Schema Migration
-- Description: Real-time speed combat system with stamina, defense, and combos
-- Created: 2026-01-20
-- ============================================================================

-- ============================================================================
-- BATTLE SESSIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS arena_battles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Fighters
  player_holobot_id UUID NOT NULL REFERENCES holobots(id) ON DELETE CASCADE,
  opponent_holobot_id UUID NOT NULL REFERENCES holobots(id) ON DELETE CASCADE,
  player_user_id UUID NOT NULL REFERENCES auth.users(id),
  opponent_user_id UUID REFERENCES auth.users(id), -- null for AI opponents
  
  -- Battle Configuration
  battle_type TEXT NOT NULL CHECK (battle_type IN ('pvp', 'pve', 'training', 'ranked')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('preparing', 'active', 'paused', 'completed', 'abandoned')),
  
  -- Battle Outcome
  winner_id UUID,
  win_type TEXT CHECK (win_type IN ('ko', 'finisher', 'timeout', 'forfeit')),
  total_turns INTEGER DEFAULT 0,
  duration_seconds INTEGER,
  
  -- Battle State Snapshot (JSONB for flexibility)
  battle_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Replay Data (sequence of actions for playback)
  replay_data JSONB DEFAULT '[]'::jsonb,
  
  -- Rewards Distributed
  rewards JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT different_holobots CHECK (player_holobot_id != opponent_holobot_id)
);

-- Indexes for performance
CREATE INDEX idx_arena_battles_player ON arena_battles(player_holobot_id);
CREATE INDEX idx_arena_battles_opponent ON arena_battles(opponent_holobot_id);
CREATE INDEX idx_arena_battles_player_user ON arena_battles(player_user_id);
CREATE INDEX idx_arena_battles_status ON arena_battles(status);
CREATE INDEX idx_arena_battles_type ON arena_battles(battle_type);
CREATE INDEX idx_arena_battles_created ON arena_battles(created_at DESC);

-- ============================================================================
-- BATTLE ACTIONS LOG (for detailed replays and analytics)
-- ============================================================================

CREATE TABLE IF NOT EXISTS battle_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  battle_id UUID NOT NULL REFERENCES arena_battles(id) ON DELETE CASCADE,
  
  -- Turn Info
  turn_number INTEGER NOT NULL,
  action_order INTEGER NOT NULL, -- multiple actions per turn possible
  
  -- Actor & Target
  actor_id UUID NOT NULL, -- holobot that performed action
  actor_role TEXT NOT NULL CHECK (actor_role IN ('player', 'opponent')),
  target_id UUID NOT NULL, -- holobot receiving action
  
  -- Action Details
  action_type TEXT NOT NULL CHECK (action_type IN ('strike', 'defense', 'combo', 'finisher', 'special')),
  card_played JSONB NOT NULL, -- full card data
  
  -- Resolution
  outcome TEXT NOT NULL CHECK (outcome IN ('hit', 'blocked', 'dodged', 'countered', 'missed', 'perfect_defense')),
  damage_dealt INTEGER DEFAULT 0,
  stamina_change INTEGER DEFAULT 0, -- can be negative or positive
  special_meter_change INTEGER DEFAULT 0,
  
  -- Context Flags
  was_countered BOOLEAN DEFAULT FALSE,
  triggered_combo BOOLEAN DEFAULT FALSE,
  perfect_defense BOOLEAN DEFAULT FALSE,
  opened_counter_window BOOLEAN DEFAULT FALSE,
  
  -- Timing Data (for replay accuracy)
  elapsed_ms INTEGER NOT NULL, -- milliseconds since battle start
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_battle_actions_battle ON battle_actions(battle_id);
CREATE INDEX idx_battle_actions_battle_turn ON battle_actions(battle_id, turn_number, action_order);
CREATE INDEX idx_battle_actions_actor ON battle_actions(actor_id);
CREATE INDEX idx_battle_actions_type ON battle_actions(action_type);

-- ============================================================================
-- ARENA RANKINGS (ELO-based competitive rankings)
-- ============================================================================

CREATE TABLE IF NOT EXISTS arena_rankings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Rating
  elo_rating INTEGER NOT NULL DEFAULT 1200,
  peak_rating INTEGER NOT NULL DEFAULT 1200,
  
  -- Stats
  total_battles INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  win_streak INTEGER NOT NULL DEFAULT 0,
  best_win_streak INTEGER NOT NULL DEFAULT 0,
  
  -- Victory Types
  ko_wins INTEGER NOT NULL DEFAULT 0,
  finisher_wins INTEGER NOT NULL DEFAULT 0,
  timeout_wins INTEGER NOT NULL DEFAULT 0,
  
  -- Season Info
  season_id TEXT NOT NULL DEFAULT 'season_1',
  rank_tier TEXT DEFAULT 'bronze', -- bronze, silver, gold, platinum, diamond, master
  
  -- Achievements
  perfect_defenses INTEGER NOT NULL DEFAULT 0,
  total_combos INTEGER NOT NULL DEFAULT 0,
  total_damage_dealt BIGINT NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_battle_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_arena_rankings_elo ON arena_rankings(elo_rating DESC);
CREATE INDEX idx_arena_rankings_season ON arena_rankings(season_id, elo_rating DESC);
CREATE INDEX idx_arena_rankings_tier ON arena_rankings(rank_tier);
CREATE INDEX idx_arena_rankings_wins ON arena_rankings(wins DESC);

-- ============================================================================
-- CARD TEMPLATES (base cards, not per-battle instances)
-- ============================================================================

CREATE TABLE IF NOT EXISTS card_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identity
  card_name TEXT UNIQUE NOT NULL,
  card_type TEXT NOT NULL CHECK (card_type IN ('strike', 'defense', 'combo', 'finisher', 'special')),
  
  -- Stats
  base_damage INTEGER DEFAULT 0,
  stamina_cost INTEGER NOT NULL,
  speed_modifier NUMERIC(3,2) NOT NULL DEFAULT 1.0,
  
  -- Requirements (JSONB for flexible conditions)
  requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Effects (JSONB for flexible effects)
  effects JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Visual
  animation_id TEXT NOT NULL,
  icon_url TEXT,
  
  -- Metadata
  description TEXT NOT NULL,
  flavor_text TEXT,
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  
  -- Availability
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  unlock_requirement TEXT, -- e.g., "player_rank >= 5"
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_card_templates_type ON card_templates(card_type);
CREATE INDEX idx_card_templates_name ON card_templates(card_name);
CREATE INDEX idx_card_templates_active ON card_templates(is_active);
CREATE INDEX idx_card_templates_rarity ON card_templates(rarity);

-- ============================================================================
-- BATTLE MODIFIERS (seasonal/event rules)
-- ============================================================================

CREATE TABLE IF NOT EXISTS battle_modifiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identity
  modifier_name TEXT NOT NULL,
  modifier_type TEXT NOT NULL CHECK (modifier_type IN ('stamina', 'damage', 'speed', 'special_meter', 'custom')),
  
  -- Effect
  target TEXT NOT NULL CHECK (target IN ('player', 'opponent', 'both')),
  multiplier NUMERIC(3,2) NOT NULL DEFAULT 1.0,
  
  -- Availability
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  season_id TEXT,
  event_id TEXT,
  
  -- Metadata
  description TEXT NOT NULL,
  icon_url TEXT,
  
  -- Timestamps
  active_from TIMESTAMPTZ,
  active_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_battle_modifiers_active ON battle_modifiers(is_active);
CREATE INDEX idx_battle_modifiers_season ON battle_modifiers(season_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE arena_battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE arena_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_modifiers ENABLE ROW LEVEL SECURITY;

-- arena_battles policies
CREATE POLICY "Users can view their own battles"
  ON arena_battles FOR SELECT
  USING (auth.uid() = player_user_id OR auth.uid() = opponent_user_id);

CREATE POLICY "Users can insert their own battles"
  ON arena_battles FOR INSERT
  WITH CHECK (auth.uid() = player_user_id);

CREATE POLICY "Users can update their active battles"
  ON arena_battles FOR UPDATE
  USING (auth.uid() = player_user_id OR auth.uid() = opponent_user_id)
  WITH CHECK (status IN ('active', 'paused', 'completed', 'abandoned'));

-- battle_actions policies (read-only for users)
CREATE POLICY "Users can view actions from their battles"
  ON battle_actions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM arena_battles
      WHERE id = battle_actions.battle_id
      AND (player_user_id = auth.uid() OR opponent_user_id = auth.uid())
    )
  );

CREATE POLICY "System can insert battle actions"
  ON battle_actions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM arena_battles
      WHERE id = battle_actions.battle_id
      AND (player_user_id = auth.uid() OR opponent_user_id = auth.uid())
    )
  );

-- arena_rankings policies
CREATE POLICY "Users can view all rankings"
  ON arena_rankings FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Users can update their own rankings"
  ON arena_rankings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rankings"
  ON arena_rankings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- card_templates policies (read-only for users)
CREATE POLICY "All users can view active cards"
  ON card_templates FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

-- battle_modifiers policies (read-only)
CREATE POLICY "All users can view active modifiers"
  ON battle_modifiers FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update arena rankings after battle
CREATE OR REPLACE FUNCTION update_arena_rankings_after_battle()
RETURNS TRIGGER AS $$
DECLARE
  winner_ranking arena_rankings;
  loser_ranking arena_rankings;
  loser_user_id UUID;
  elo_change INTEGER;
BEGIN
  -- Only process completed battles
  IF NEW.status != 'completed' OR NEW.winner_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Skip if not PvP or ranked
  IF NEW.battle_type NOT IN ('pvp', 'ranked') THEN
    RETURN NEW;
  END IF;
  
  -- Determine loser
  IF NEW.winner_id = NEW.player_holobot_id THEN
    loser_user_id := NEW.opponent_user_id;
  ELSE
    loser_user_id := NEW.player_user_id;
  END IF;
  
  -- Skip if AI battle (opponent_user_id is null)
  IF loser_user_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Get current rankings (ensure they exist)
  INSERT INTO arena_rankings (user_id) VALUES (NEW.player_user_id)
    ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO arena_rankings (user_id) VALUES (loser_user_id)
    ON CONFLICT (user_id) DO NOTHING;
  
  SELECT * INTO winner_ranking FROM arena_rankings 
    WHERE user_id = NEW.player_user_id;
  SELECT * INTO loser_ranking FROM arena_rankings 
    WHERE user_id = loser_user_id;
  
  -- Calculate ELO change (simplified K=32 formula)
  elo_change := GREATEST(10, LEAST(50, 
    32 * (1 - 1 / (1 + POWER(10, (loser_ranking.elo_rating - winner_ranking.elo_rating) / 400.0)))
  ))::INTEGER;
  
  -- Update winner
  UPDATE arena_rankings
  SET 
    elo_rating = elo_rating + elo_change,
    peak_rating = GREATEST(peak_rating, elo_rating + elo_change),
    wins = wins + 1,
    total_battles = total_battles + 1,
    win_streak = win_streak + 1,
    best_win_streak = GREATEST(best_win_streak, win_streak + 1),
    ko_wins = CASE WHEN NEW.win_type = 'ko' THEN ko_wins + 1 ELSE ko_wins END,
    finisher_wins = CASE WHEN NEW.win_type = 'finisher' THEN finisher_wins + 1 ELSE finisher_wins END,
    timeout_wins = CASE WHEN NEW.win_type = 'timeout' THEN timeout_wins + 1 ELSE timeout_wins END,
    last_battle_at = NOW(),
    updated_at = NOW()
  WHERE user_id = NEW.player_user_id;
  
  -- Update loser
  UPDATE arena_rankings
  SET 
    elo_rating = GREATEST(800, elo_rating - elo_change), -- floor at 800
    losses = losses + 1,
    total_battles = total_battles + 1,
    win_streak = 0,
    last_battle_at = NOW(),
    updated_at = NOW()
  WHERE user_id = loser_user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update rankings
CREATE TRIGGER trigger_update_arena_rankings
  AFTER UPDATE OF status ON arena_battles
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION update_arena_rankings_after_battle();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get user's current ranking
CREATE OR REPLACE FUNCTION get_user_arena_rank(p_user_id UUID)
RETURNS TABLE (
  rank INTEGER,
  elo_rating INTEGER,
  wins INTEGER,
  losses INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH ranked_users AS (
    SELECT 
      user_id,
      elo_rating,
      wins,
      losses,
      ROW_NUMBER() OVER (ORDER BY elo_rating DESC) as rank
    FROM arena_rankings
    WHERE season_id = 'season_1' -- TODO: make dynamic
  )
  SELECT 
    rank::INTEGER,
    ranked_users.elo_rating,
    ranked_users.wins,
    ranked_users.losses
  FROM ranked_users
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default card templates (will be overwritten by seed file)
-- This ensures the table structure works

INSERT INTO card_templates (card_name, card_type, base_damage, stamina_cost, speed_modifier, animation_id, description)
VALUES 
  ('Jab', 'strike', 8, 1, 1.2, 'jab_animation', 'Quick punch. Opens combo opportunities.'),
  ('Block', 'defense', 0, 1, 1.0, 'block_animation', 'Basic block. Reduces damage by 50%.')
ON CONFLICT (card_name) DO NOTHING;

-- ============================================================================
-- COMPLETION
-- ============================================================================

-- Log successful migration
DO $$
BEGIN
  RAISE NOTICE 'Arena V2 schema migration completed successfully!';
  RAISE NOTICE 'Tables created: arena_battles, battle_actions, arena_rankings, card_templates, battle_modifiers';
  RAISE NOTICE 'Next step: Run seed-arena-cards.sql to populate card templates';
END $$;
