-- Migration: Replace coupon functions with unified CRUD function
-- Drop existing coupon functions
DROP FUNCTION IF EXISTS public.apply_coupon;
DROP FUNCTION IF EXISTS public.delete_global_coupon;
DROP FUNCTION IF EXISTS public.get_global_coupons;
DROP FUNCTION IF EXISTS public.update_global_coupon;
DROP FUNCTION IF EXISTS public.validate_coupon;

-- Create coupons table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
    discount_value DECIMAL(10,2) NOT NULL CHECK (discount_value > 0),
    currency VARCHAR(3) DEFAULT 'USD',
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE,
    usage_limit INTEGER CHECK (usage_limit > 0),
    usage_count INTEGER DEFAULT 0 CHECK (usage_count >= 0),
    is_active BOOLEAN DEFAULT true,
    applicable_solution_types TEXT[],
    coupon_type VARCHAR(20) NOT NULL CHECK (coupon_type IN ('promo', 'partner', 'referral')),
    partner_id UUID,
    target_user_id UUID,
    auto_apply_rules JSONB,
    campaign_name VARCHAR(100),
    referral_tracking JSONB,
    minimum_order_value DECIMAL(10,2) CHECK (minimum_order_value >= 0),
    maximum_discount_amount DECIMAL(10,2) CHECK (maximum_discount_amount >= 0),
    first_time_user_only BOOLEAN DEFAULT false,
    stackable BOOLEAN DEFAULT false,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON public.coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_dates ON public.coupons(valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_coupons_type ON public.coupons(coupon_type);

-- Enable RLS (Row Level Security)
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Create unified CRUD function for coupons
CREATE OR REPLACE FUNCTION public.crud_coupons(
    action TEXT,
    coupon_data JSONB DEFAULT NULL,
    coupon_id UUID DEFAULT NULL,
    filters JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
    coupon_record RECORD;
    search_query TEXT;
    where_conditions TEXT[] = ARRAY[]::TEXT[];
    final_query TEXT;
BEGIN
    -- Validate action parameter
    IF action NOT IN ('create', 'read', 'update', 'delete', 'validate', 'apply', 'stats') THEN
        RETURN jsonb_build_object('error', 'Invalid action. Must be one of: create, read, update, delete, validate, apply, stats');
    END IF;

    CASE action
        WHEN 'create' THEN
            -- Create new coupon
            IF coupon_data IS NULL THEN
                RETURN jsonb_build_object('error', 'Coupon data is required for create action');
            END IF;
            
            INSERT INTO public.coupons (
                code, description, discount_type, discount_value, currency,
                valid_from, valid_until, usage_limit, applicable_solution_types,
                coupon_type, minimum_order_value, maximum_discount_amount,
                first_time_user_only, stackable, campaign_name, is_active, created_by
            )
            SELECT 
                (coupon_data->>'code')::VARCHAR(50),
                coupon_data->>'description',
                (coupon_data->>'discount_type')::VARCHAR(20),
                (coupon_data->>'discount_value')::DECIMAL(10,2),
                COALESCE(coupon_data->>'currency', 'USD'),
                (coupon_data->>'valid_from')::TIMESTAMP WITH TIME ZONE,
                (coupon_data->>'valid_until')::TIMESTAMP WITH TIME ZONE,
                (coupon_data->>'usage_limit')::INTEGER,
                CASE 
                    WHEN coupon_data->'applicable_solution_types' IS NOT NULL 
                    THEN ARRAY(SELECT jsonb_array_elements_text(coupon_data->'applicable_solution_types'))
                    ELSE NULL 
                END,
                (coupon_data->>'coupon_type')::VARCHAR(20),
                (coupon_data->>'minimum_order_value')::DECIMAL(10,2),
                (coupon_data->>'maximum_discount_amount')::DECIMAL(10,2),
                COALESCE((coupon_data->>'first_time_user_only')::BOOLEAN, false),
                COALESCE((coupon_data->>'stackable')::BOOLEAN, false),
                coupon_data->>'campaign_name',
                COALESCE((coupon_data->>'is_active')::BOOLEAN, true),
                (coupon_data->>'created_by')::UUID
            RETURNING * INTO coupon_record;
            
            RETURN jsonb_build_object('success', true, 'data', row_to_json(coupon_record));

        WHEN 'read' THEN
            -- Read coupons with optional filters
            search_query := 'SELECT * FROM public.coupons WHERE 1=1';
            
            -- Add filters if provided
            IF filters IS NOT NULL THEN
                IF filters ? 'search' AND filters->>'search' != '' THEN
                    where_conditions := array_append(where_conditions, 
                        format('(code ILIKE %L OR description ILIKE %L)', 
                               '%' || (filters->>'search') || '%',
                               '%' || (filters->>'search') || '%'));
                END IF;
                
                IF filters ? 'status' THEN
                    CASE filters->>'status'
                        WHEN 'active' THEN
                            where_conditions := array_append(where_conditions, 
                                'is_active = true AND (valid_until IS NULL OR valid_until > NOW())');
                        WHEN 'expired' THEN
                            where_conditions := array_append(where_conditions, 
                                'valid_until IS NOT NULL AND valid_until <= NOW()');
                        WHEN 'inactive' THEN
                            where_conditions := array_append(where_conditions, 'is_active = false');
                    END CASE;
                END IF;
                
                IF filters ? 'coupon_type' THEN
                    where_conditions := array_append(where_conditions, 
                        format('coupon_type = %L', filters->>'coupon_type'));
                END IF;
            END IF;
            
            -- Single coupon by ID
            IF coupon_id IS NOT NULL THEN
                where_conditions := array_append(where_conditions, format('id = %L', coupon_id));
            END IF;
            
            -- Build final query
            IF array_length(where_conditions, 1) > 0 THEN
                search_query := search_query || ' AND ' || array_to_string(where_conditions, ' AND ');
            END IF;
            
            search_query := search_query || ' ORDER BY created_at DESC';
            
            -- Execute and return results
            EXECUTE format('SELECT json_agg(row_to_json(t)) FROM (%s) t', search_query) INTO result;
            RETURN jsonb_build_object('success', true, 'data', COALESCE(result, '[]'::jsonb));

        WHEN 'update' THEN
            -- Update existing coupon
            IF coupon_id IS NULL THEN
                RETURN jsonb_build_object('error', 'Coupon ID is required for update action');
            END IF;
            
            IF coupon_data IS NULL THEN
                RETURN jsonb_build_object('error', 'Coupon data is required for update action');
            END IF;
            
            UPDATE public.coupons SET
                description = COALESCE((coupon_data->>'description'), description),
                discount_type = COALESCE((coupon_data->>'discount_type')::VARCHAR(20), discount_type),
                discount_value = COALESCE((coupon_data->>'discount_value')::DECIMAL(10,2), discount_value),
                currency = COALESCE(coupon_data->>'currency', currency),
                valid_from = COALESCE((coupon_data->>'valid_from')::TIMESTAMP WITH TIME ZONE, valid_from),
                valid_until = COALESCE((coupon_data->>'valid_until')::TIMESTAMP WITH TIME ZONE, valid_until),
                usage_limit = COALESCE((coupon_data->>'usage_limit')::INTEGER, usage_limit),
                applicable_solution_types = COALESCE(
                    CASE 
                        WHEN coupon_data->'applicable_solution_types' IS NOT NULL 
                        THEN ARRAY(SELECT jsonb_array_elements_text(coupon_data->'applicable_solution_types'))
                        ELSE applicable_solution_types 
                    END, applicable_solution_types),
                coupon_type = COALESCE((coupon_data->>'coupon_type')::VARCHAR(20), coupon_type),
                minimum_order_value = COALESCE((coupon_data->>'minimum_order_value')::DECIMAL(10,2), minimum_order_value),
                maximum_discount_amount = COALESCE((coupon_data->>'maximum_discount_amount')::DECIMAL(10,2), maximum_discount_amount),
                first_time_user_only = COALESCE((coupon_data->>'first_time_user_only')::BOOLEAN, first_time_user_only),
                stackable = COALESCE((coupon_data->>'stackable')::BOOLEAN, stackable),
                campaign_name = COALESCE(coupon_data->>'campaign_name', campaign_name),
                is_active = COALESCE((coupon_data->>'is_active')::BOOLEAN, is_active),
                updated_at = NOW()
            WHERE id = coupon_id
            RETURNING * INTO coupon_record;
            
            IF coupon_record IS NULL THEN
                RETURN jsonb_build_object('error', 'Coupon not found');
            END IF;
            
            RETURN jsonb_build_object('success', true, 'data', row_to_json(coupon_record));

        WHEN 'delete' THEN
            -- Delete coupon
            IF coupon_id IS NULL THEN
                RETURN jsonb_build_object('error', 'Coupon ID is required for delete action');
            END IF;
            
            DELETE FROM public.coupons WHERE id = coupon_id RETURNING * INTO coupon_record;
            
            IF coupon_record IS NULL THEN
                RETURN jsonb_build_object('error', 'Coupon not found');
            END IF;
            
            RETURN jsonb_build_object('success', true, 'message', 'Coupon deleted successfully');

        WHEN 'validate' THEN
            -- Validate coupon by code
            IF coupon_data IS NULL OR NOT (coupon_data ? 'code') THEN
                RETURN jsonb_build_object('error', 'Coupon code is required for validation');
            END IF;
            
            SELECT * INTO coupon_record 
            FROM public.coupons 
            WHERE code = (coupon_data->>'code') 
            AND is_active = true 
            AND valid_from <= NOW() 
            AND (valid_until IS NULL OR valid_until > NOW())
            LIMIT 1;
            
            IF coupon_record IS NULL THEN
                RETURN jsonb_build_object('valid', false, 'error_message', 'Invalid or expired coupon code');
            END IF;
            
            -- Check usage limit
            IF coupon_record.usage_limit IS NOT NULL AND coupon_record.usage_count >= coupon_record.usage_limit THEN
                RETURN jsonb_build_object('valid', false, 'error_message', 'Coupon usage limit exceeded');
            END IF;
            
            RETURN jsonb_build_object(
                'valid', true, 
                'coupon', row_to_json(coupon_record),
                'discount_amount', coupon_record.discount_value
            );

        WHEN 'apply' THEN
            -- Apply coupon (increment usage count)
            IF coupon_data IS NULL OR NOT (coupon_data ? 'code') THEN
                RETURN jsonb_build_object('error', 'Coupon code is required for application');
            END IF;
            
            -- First validate the coupon
            SELECT * INTO coupon_record 
            FROM public.coupons 
            WHERE code = (coupon_data->>'code') 
            AND is_active = true 
            AND valid_from <= NOW() 
            AND (valid_until IS NULL OR valid_until > NOW())
            LIMIT 1;
            
            IF coupon_record IS NULL THEN
                RETURN jsonb_build_object('success', false, 'error_message', 'Invalid or expired coupon code');
            END IF;
            
            IF coupon_record.usage_limit IS NOT NULL AND coupon_record.usage_count >= coupon_record.usage_limit THEN
                RETURN jsonb_build_object('success', false, 'error_message', 'Coupon usage limit exceeded');
            END IF;
            
            -- Increment usage count
            UPDATE public.coupons 
            SET usage_count = usage_count + 1, updated_at = NOW()
            WHERE id = coupon_record.id
            RETURNING * INTO coupon_record;
            
            RETURN jsonb_build_object(
                'success', true,
                'coupon_id', coupon_record.id,
                'discount_amount', coupon_record.discount_value,
                'final_amount', COALESCE((coupon_data->>'order_amount')::DECIMAL(10,2), 0) - coupon_record.discount_value
            );

        WHEN 'stats' THEN
            -- Get coupon statistics
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE is_active = true AND (valid_until IS NULL OR valid_until > NOW())) as active,
                COUNT(*) FILTER (WHERE valid_until IS NOT NULL AND valid_until <= NOW()) as expired,
                COUNT(*) FILTER (WHERE is_active = false) as inactive,
                COALESCE(SUM(usage_count), 0) as total_usage
            INTO result
            FROM public.coupons;
            
            RETURN jsonb_build_object('success', true, 'data', row_to_json(result));
            
        ELSE
            RETURN jsonb_build_object('error', 'Unknown action');
    END CASE;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('error', 'Database error: ' || SQLERRM);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.crud_coupons TO authenticated;

-- Add RLS policies (adjust based on your authentication system)
CREATE POLICY "Enable read access for all users" ON public.coupons FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.coupons FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON public.coupons FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON public.coupons FOR DELETE USING (auth.role() = 'authenticated');

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_coupons_updated_at 
    BEFORE UPDATE ON public.coupons 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();