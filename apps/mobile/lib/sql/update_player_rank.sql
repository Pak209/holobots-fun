
-- Create type if not exists
DO $$ BEGIN
    CREATE TYPE player_rank AS ENUM ('Rookie', 'Scout', 'Champion', 'Elite', 'Legend', 'Mythic');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Function to update player rank based on Holobot counts
CREATE OR REPLACE FUNCTION update_player_rank(user_id uuid)
RETURNS void AS $$
DECLARE
    rare_count INTEGER := 0;
    champion_count INTEGER := 0;
    elite_count INTEGER := 0;
    legendary_count INTEGER := 0;
    prestiged_count INTEGER := 0;
    holobot json;
    new_rank player_rank;
BEGIN
    -- Count Holobots by rank and prestige status
    FOR holobot IN 
        SELECT json_array_elements(holobots) 
        FROM profiles 
        WHERE id = user_id
    LOOP
        CASE (holobot->>'rank')
            WHEN 'Rare' THEN rare_count := rare_count + 1;
            WHEN 'Champion' THEN champion_count := champion_count + 1;
            WHEN 'Elite' THEN elite_count := elite_count + 1;
            WHEN 'Legendary' THEN legendary_count := legendary_count + 1;
        END CASE;
        
        -- Count prestiged Holobots
        IF (holobot->>'prestiged')::boolean = true THEN
            prestiged_count := prestiged_count + 1;
        END IF;
    END LOOP;

    -- Determine new rank based on counts
    new_rank := CASE
        WHEN legendary_count >= 10 AND prestiged_count >= 5 THEN 'Mythic'::player_rank
        WHEN legendary_count >= 10 THEN 'Legend'::player_rank
        WHEN elite_count >= 10 THEN 'Elite'::player_rank
        WHEN champion_count >= 1 THEN 'Champion'::player_rank
        WHEN rare_count >= 1 THEN 'Scout'::player_rank
        ELSE 'Rookie'::player_rank
    END;

    -- Update profile with new rank and prestige count
    UPDATE profiles 
    SET 
        player_rank = new_rank,
        prestige_count = prestiged_count
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;
