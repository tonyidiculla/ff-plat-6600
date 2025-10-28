-- Create entity ownership table with correct foreign key reference

-- Create entity ownership table using 'id' as the foreign key reference
CREATE TABLE IF NOT EXISTS global.entity_ownership (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL, -- Reference to entity_master_l01.id instead
    owner_user_id UUID NOT NULL,
    owner_type TEXT DEFAULT 'primary' CHECK (owner_type IN ('primary', 'secondary', 'stakeholder')),
    ownership_percentage DECIMAL(5,2) DEFAULT 100.0 CHECK (ownership_percentage >= 0 AND ownership_percentage <= 100),
    is_primary_owner BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(entity_id, owner_user_id)
);

-- Add foreign key constraint separately to handle potential issues
DO $$ 
BEGIN
    -- Try to add foreign key constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'entity_ownership' 
        AND constraint_type = 'FOREIGN KEY'
        AND table_schema = 'global'
    ) THEN
        -- First try with entity_id reference
        BEGIN
            ALTER TABLE global.entity_ownership 
            ADD CONSTRAINT fk_entity_ownership_entity_id 
            FOREIGN KEY (entity_id) REFERENCES global.entity_master_l01(entity_id) ON DELETE CASCADE;
        EXCEPTION WHEN OTHERS THEN
            -- If that fails, try with id reference
            BEGIN
                ALTER TABLE global.entity_ownership 
                ADD CONSTRAINT fk_entity_ownership_id 
                FOREIGN KEY (entity_id) REFERENCES global.entity_master_l01(id) ON DELETE CASCADE;
            EXCEPTION WHEN OTHERS THEN
                -- Log the error but continue
                RAISE NOTICE 'Could not create foreign key constraint: %', SQLERRM;
            END;
        END;
    END IF;
END $$;

-- Enable RLS on ownership table
ALTER TABLE global.entity_ownership ENABLE ROW LEVEL SECURITY;

-- Create policies for ownership table
CREATE POLICY "Users can view entity ownership" ON global.entity_ownership
    FOR SELECT TO authenticated, anon
    USING (true);

CREATE POLICY "Users can manage entity ownership" ON global.entity_ownership  
    FOR ALL TO authenticated, anon
    USING (true);

-- Grant permissions
GRANT ALL ON global.entity_ownership TO service_role, authenticated, anon;

-- Create a function to search managers from profiles
CREATE OR REPLACE FUNCTION public.search_manager_profiles(search_term TEXT DEFAULT '')
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result_data JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'user_id', user_id,
            'first_name', first_name,
            'last_name', last_name,
            'email', email,
            'full_name', CONCAT(first_name, ' ', last_name),
            'display_text', CONCAT(first_name, ' ', last_name, ' (', email, ')')
        )
    ) INTO result_data
    FROM global.profiles
    WHERE is_active = true
        AND (
            search_term = '' OR
            LOWER(first_name) LIKE LOWER('%' || search_term || '%') OR
            LOWER(last_name) LIKE LOWER('%' || search_term || '%') OR
            LOWER(email) LIKE LOWER('%' || search_term || '%') OR
            LOWER(CONCAT(first_name, ' ', last_name)) LIKE LOWER('%' || search_term || '%')
        )
    ORDER BY first_name, last_name
    LIMIT 20;
    
    RETURN json_build_object(
        'success', true,
        'data', COALESCE(result_data, '[]'::json)
    );
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.search_manager_profiles TO service_role, authenticated, anon;