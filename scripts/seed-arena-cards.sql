-- ============================================================================
-- Arena V2 Card Templates Seed Data
-- ============================================================================
-- This file populates the card_templates table with base combat cards

-- ============================================================================
-- STRIKE CARDS
-- ============================================================================

INSERT INTO card_templates (card_name, card_type, base_damage, stamina_cost, speed_modifier, requirements, effects, animation_id, description) VALUES

-- Light Strikes (Low cost, fast)
('Jab', 'strike', 8, 1, 1.2, 
  '[]'::jsonb,
  '[{"type": "combo_enable", "target": "self", "value": 1}]'::jsonb,
  'jab_animation',
  'Quick punch. Opens combo opportunities.'),

('Cross', 'strike', 12, 1, 1.0,
  '[]'::jsonb,
  '[{"type": "damage", "target": "opponent", "value": 12}]'::jsonb,
  'cross_animation',
  'Straight power punch. Reliable damage.'),

('Low Kick', 'strike', 10, 1, 1.1,
  '[]'::jsonb,
  '[{"type": "damage", "target": "opponent", "value": 10}]'::jsonb,
  'low_kick_animation',
  'Fast leg strike. Hard to block.'),

-- Medium Strikes (Moderate cost, good damage)
('Hook', 'strike', 18, 2, 0.9,
  '[]'::jsonb,
  '[{"type": "damage", "target": "opponent", "value": 18}, {"type": "special_meter", "target": "self", "value": 15}]'::jsonb,
  'hook_animation',
  'Powerful hook punch. Builds special meter.'),

('Uppercut', 'strike', 22, 2, 0.85,
  '[{"type": "combo", "operator": "gte", "value": 1}]'::jsonb,
  '[{"type": "damage", "target": "opponent", "value": 22}, {"type": "special_meter", "target": "self", "value": 20}]'::jsonb,
  'uppercut_animation',
  'Rising punch. Requires combo setup. High meter gain.'),

('Body Blow', 'strike', 16, 2, 0.95,
  '[]'::jsonb,
  '[{"type": "damage", "target": "opponent", "value": 16}, {"type": "status", "target": "opponent", "value": -10, "duration": 2}]'::jsonb,
  'body_blow_animation',
  'Body strike. Reduces opponent stamina recovery.'),

('Roundhouse', 'strike', 20, 2, 0.8,
  '[]'::jsonb,
  '[{"type": "damage", "target": "opponent", "value": 20}]'::jsonb,
  'roundhouse_animation',
  'Spinning kick. High damage, slower startup.'),

-- Heavy Strikes (High cost, high damage)
('Elbow Strike', 'strike', 25, 3, 0.75,
  '[{"type": "stamina", "operator": "gte", "value": 4}]'::jsonb,
  '[{"type": "damage", "target": "opponent", "value": 25}, {"type": "special_meter", "target": "self", "value": 25}]'::jsonb,
  'elbow_animation',
  'Devastating elbow. Requires good stamina. Excellent meter gain.'),

('Spinning Backfist', 'strike', 28, 3, 0.7,
  '[{"type": "combo", "operator": "gte", "value": 2}]'::jsonb,
  '[{"type": "damage", "target": "opponent", "value": 28}, {"type": "special_meter", "target": "self", "value": 30}]'::jsonb,
  'backfist_animation',
  'Flashy spinning strike. Combo finisher. High risk, high reward.'),

('Superman Punch', 'strike', 30, 3, 0.65,
  '[{"type": "stamina", "operator": "gte", "value": 5}]'::jsonb,
  '[{"type": "damage", "target": "opponent", "value": 30}, {"type": "special_meter", "target": "self", "value": 35}]'::jsonb,
  'superman_punch_animation',
  'Explosive flying punch. Massive damage. Leaves you vulnerable.');

-- ============================================================================
-- DEFENSE CARDS
-- ============================================================================

INSERT INTO card_templates (card_name, card_type, base_damage, stamina_cost, speed_modifier, requirements, effects, animation_id, description) VALUES

-- Basic Defense
('Block', 'defense', 0, 1, 1.0,
  '[]'::jsonb,
  '[{"type": "damage_reduction", "target": "self", "value": 50}]'::jsonb,
  'block_animation',
  'Basic block. Reduces damage by 50%. Safe but doesn''t open counters.'),

('Retreat', 'defense', 0, 1, 1.1,
  '[]'::jsonb,
  '[{"type": "damage_reduction", "target": "self", "value": 40}, {"type": "stamina_gain", "target": "self", "value": 1}]'::jsonb,
  'retreat_animation',
  'Step back. Moderate protection. Small stamina gain.'),

-- Advanced Defense (Counter Potential)
('Slip', 'defense', 0, 2, 1.3,
  '[]'::jsonb,
  '[{"type": "damage_reduction", "target": "self", "value": 100}, {"type": "counter_window", "target": "self", "value": 800}]'::jsonb,
  'slip_animation',
  'Perfect evasion vs punches. Opens 0.8s counter window.'),

('Parry', 'defense', 0, 2, 1.2,
  '[{"type": "intelligence", "operator": "gte", "value": 60}]'::jsonb,
  '[{"type": "damage_reduction", "target": "self", "value": 100}, {"type": "counter_window", "target": "self", "value": 1000}, {"type": "stamina_gain", "target": "self", "value": 1}]'::jsonb,
  'parry_animation',
  'Deflect and counter. Requires INT. Opens 1.0s window. Restores stamina.'),

('Roll', 'defense', 0, 2, 1.15,
  '[]'::jsonb,
  '[{"type": "damage_reduction", "target": "self", "value": 90}, {"type": "position_change", "target": "self", "value": 1}]'::jsonb,
  'roll_animation',
  'Evasive roll. Good vs kicks. Repositions fighter.'),

-- Grappling Defense
('Sprawl', 'defense', 0, 2, 1.0,
  '[]'::jsonb,
  '[{"type": "damage_reduction", "target": "self", "value": 100}, {"type": "counter_window", "target": "self", "value": 600}]'::jsonb,
  'sprawl_animation',
  'Defend takedowns. Perfect defense vs grapple attempts.'),

-- Advanced Counter Defense
('Counter Stance', 'defense', 0, 3, 1.4,
  '[{"type": "intelligence", "operator": "gte", "value": 75}]'::jsonb,
  '[{"type": "counter_window", "target": "self", "value": 1500}, {"type": "damage_multiplier", "target": "self", "value": 150}]'::jsonb,
  'counter_stance_animation',
  'High-INT defense. Extended counter window. +50% counter damage.');

-- ============================================================================
-- COMBO CARDS
-- ============================================================================

INSERT INTO card_templates (card_name, card_type, base_damage, stamina_cost, speed_modifier, requirements, effects, animation_id, description) VALUES

-- 2-Hit Combos
('One-Two', 'combo', 24, 2, 1.1,
  '[{"type": "combo", "operator": "equals", "value": 0}]'::jsonb,
  '[{"type": "damage", "target": "opponent", "value": 24}, {"type": "combo_enable", "target": "self", "value": 2}]'::jsonb,
  'one_two_animation',
  'Classic jab-cross combo. Fast combo starter.'),

-- 3-Hit Combos
('Jab-Cross-Hook', 'combo', 42, 3, 1.0,
  '[{"type": "combo", "operator": "equals", "value": 0}]'::jsonb,
  '[{"type": "damage", "target": "opponent", "value": 42}, {"type": "special_meter", "target": "self", "value": 30}]'::jsonb,
  'jab_cross_hook_animation',
  'Bread and butter 3-piece. Solid damage and meter.'),

('High-Low-High', 'combo', 45, 3, 0.95,
  '[{"type": "combo", "operator": "equals", "value": 0}]'::jsonb,
  '[{"type": "damage", "target": "opponent", "value": 45}, {"type": "special_meter", "target": "self", "value": 35}]'::jsonb,
  'high_low_high_animation',
  'Mix-up combo. Hard to defend. Great meter gain.'),

-- 5-Hit Combos (Advanced)
('Rush Combo', 'combo', 65, 4, 0.9,
  '[{"type": "stamina", "operator": "gte", "value": 5}, {"type": "combo", "operator": "equals", "value": 0}]'::jsonb,
  '[{"type": "damage", "target": "opponent", "value": 65}, {"type": "special_meter", "target": "self", "value": 50}]'::jsonb,
  'rush_combo_animation',
  '5-hit barrage. Requires high stamina. Massive meter gain.'),

('Technical Sequence', 'combo', 70, 5, 0.85,
  '[{"type": "stamina", "operator": "gte", "value": 5}, {"type": "intelligence", "operator": "gte", "value": 70}]'::jsonb,
  '[{"type": "damage", "target": "opponent", "value": 70}, {"type": "special_meter", "target": "self", "value": 60}, {"type": "stamina_gain", "target": "self", "value": 1}]'::jsonb,
  'technical_sequence_animation',
  'Complex 5-hit combo. High INT required. Stamina-efficient.');

-- ============================================================================
-- FINISHER CARDS
-- ============================================================================

INSERT INTO card_templates (card_name, card_type, base_damage, stamina_cost, speed_modifier, requirements, effects, animation_id, description) VALUES

-- Standard Finishers
('Devastating Strike', 'finisher', 100, 6, 0.5,
  '[{"type": "special_meter", "operator": "gte", "value": 100}, {"type": "opponent_state", "operator": "equals", "value": "gassed"}]'::jsonb,
  '[{"type": "damage", "target": "opponent", "value": 100}, {"type": "status", "target": "opponent", "value": -99, "duration": 999}]'::jsonb,
  'devastating_strike_animation',
  'Ultimate power strike. Requires opponent to be gassed. Cinematic finish.'),

('Lightning Rush', 'finisher', 80, 6, 0.7,
  '[{"type": "special_meter", "operator": "gte", "value": 100}, {"type": "speed", "operator": "gte", "value": 70}]'::jsonb,
  '[{"type": "damage", "target": "opponent", "value": 80}, {"type": "multi_hit", "target": "opponent", "value": 10}]'::jsonb,
  'lightning_rush_animation',
  'Speed-based finisher. Multiple rapid strikes. High-speed Holobots only.'),

('Ground and Pound', 'finisher', 90, 6, 0.6,
  '[{"type": "special_meter", "operator": "gte", "value": 100}, {"type": "opponent_state", "operator": "equals", "value": "exhausted"}]'::jsonb,
  '[{"type": "damage", "target": "opponent", "value": 90}, {"type": "guaranteed_hit", "target": "self", "value": 1}]'::jsonb,
  'ground_pound_animation',
  'Grappler finisher. Requires exhausted opponent. Cannot be defended.'),

('Plasma Overload', 'finisher', 120, 7, 0.4,
  '[{"type": "special_meter", "operator": "gte", "value": 100}, {"type": "opponent_state", "operator": "equals", "value": "gassed"}]'::jsonb,
  '[{"type": "damage", "target": "opponent", "value": 120}, {"type": "status", "target": "self", "value": -3, "duration": 999}]'::jsonb,
  'plasma_overload_animation',
  'Highest damage finisher. Drains your remaining stamina. All or nothing.');

-- ============================================================================
-- SPECIAL / ARCHETYPE-SPECIFIC CARDS
-- ============================================================================

INSERT INTO card_templates (card_name, card_type, base_damage, stamina_cost, speed_modifier, requirements, effects, animation_id, description) VALUES

-- Striker Archetype
('Blitz Mode', 'strike', 0, 2, 1.5,
  '[{"type": "archetype", "operator": "equals", "value": "striker"}]'::jsonb,
  '[{"type": "status", "target": "self", "value": 1, "duration": 3}, {"type": "speed_boost", "target": "self", "value": 30}]'::jsonb,
  'blitz_mode_animation',
  'Striker special. +30% speed for 3 turns. Aggressive tempo.'),

-- Technical Archetype
('Read and React', 'defense', 0, 2, 1.3,
  '[{"type": "archetype", "operator": "equals", "value": "technical"}]'::jsonb,
  '[{"type": "counter_window", "target": "self", "value": 2000}, {"type": "prediction", "target": "self", "value": 1}]'::jsonb,
  'read_react_animation',
  'Technical special. See opponent''s next card. Extended counter window.'),

-- Balanced Archetype
('Adapt', 'strike', 15, 1, 1.0,
  '[{"type": "archetype", "operator": "equals", "value": "balanced"}]'::jsonb,
  '[{"type": "damage", "target": "opponent", "value": 15}, {"type": "card_draw", "target": "self", "value": 1}]'::jsonb,
  'adapt_animation',
  'Balanced special. Moderate damage. Draw extra card. Versatile.'),

-- Grappler Archetype
('Clinch Control', 'strike', 12, 2, 0.8,
  '[{"type": "archetype", "operator": "equals", "value": "grappler"}]'::jsonb,
  '[{"type": "damage", "target": "opponent", "value": 12}, {"type": "status", "target": "opponent", "value": -20, "duration": 2}, {"type": "position_control", "target": "self", "value": 1}]'::jsonb,
  'clinch_animation',
  'Grappler special. Control position. Drain opponent stamina over time.');

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

CREATE INDEX idx_card_templates_type ON card_templates(card_type);
CREATE INDEX idx_card_templates_name ON card_templates(card_name);

-- ============================================================================
-- Completion
-- ============================================================================

-- Verify card counts
DO $$
DECLARE
  strike_count INT;
  defense_count INT;
  combo_count INT;
  finisher_count INT;
BEGIN
  SELECT COUNT(*) INTO strike_count FROM card_templates WHERE card_type = 'strike';
  SELECT COUNT(*) INTO defense_count FROM card_templates WHERE card_type = 'defense';
  SELECT COUNT(*) INTO combo_count FROM card_templates WHERE card_type = 'combo';
  SELECT COUNT(*) INTO finisher_count FROM card_templates WHERE card_type = 'finisher';
  
  RAISE NOTICE 'Card templates seeded successfully:';
  RAISE NOTICE '  - Strike cards: %', strike_count;
  RAISE NOTICE '  - Defense cards: %', defense_count;
  RAISE NOTICE '  - Combo cards: %', combo_count;
  RAISE NOTICE '  - Finisher cards: %', finisher_count;
  RAISE NOTICE '  - Total cards: %', strike_count + defense_count + combo_count + finisher_count;
END $$;
