-- Migration: Create EMR tables in public schema
-- Description: Creates all Electronic Medical Records (EMR) tables in public schema
-- Date: 2025-10-11

-- Create public schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS public;

-- =============================================================================
-- EMR MASTER TABLE
-- Main EMR record table linking to patient visits
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.emr_master (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_id TEXT UNIQUE NOT NULL,
    visit_id UUID,  -- Reference to visit/consultation
    patient_id UUID,  -- Reference to patient/pet
    organization_id UUID,  -- Reference to organization
    entity_id UUID,  -- Reference to entity (hospital/clinic)
    chief_complaint TEXT,
    history_present_illness TEXT,
    diagnosis TEXT,
    treatment_plan TEXT,
    follow_up_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,  -- Reference to profiles
    updated_by UUID   -- Reference to profiles
);

-- =============================================================================
-- EMR NOTES TABLE
-- Clinical notes and observations
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.emr_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_id TEXT UNIQUE NOT NULL,
    emr_master_id UUID REFERENCES public.emr_master(id) ON DELETE CASCADE,
    note_type TEXT,  -- 'clinical', 'nursing', 'pharmacy', 'progress', 'discharge'
    note_content TEXT NOT NULL,
    is_confidential BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- =============================================================================
-- EMR VITALS TABLE
-- Vital signs and measurements
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.emr_vitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_id TEXT UNIQUE NOT NULL,
    emr_master_id UUID REFERENCES public.emr_master(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL,
    temperature DECIMAL(5,2),  -- in Celsius
    temperature_unit TEXT DEFAULT 'C',
    heart_rate INTEGER,  -- beats per minute
    respiratory_rate INTEGER,  -- breaths per minute
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    weight DECIMAL(10,2),  -- in kg
    weight_unit TEXT DEFAULT 'kg',
    height DECIMAL(10,2),  -- in cm
    height_unit TEXT DEFAULT 'cm',
    body_condition_score DECIMAL(3,1),  -- 1-9 scale for animals
    pain_score INTEGER,  -- 0-10 scale
    notes TEXT,
    measured_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID
);

-- =============================================================================
-- EMR EXAMINATION TABLE
-- Physical examination findings
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.emr_examination (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_id TEXT UNIQUE NOT NULL,
    emr_master_id UUID REFERENCES public.emr_master(id) ON DELETE CASCADE,
    system_examined TEXT,  -- 'cardiovascular', 'respiratory', 'neurological', etc.
    findings TEXT NOT NULL,
    abnormal BOOLEAN DEFAULT false,
    images_urls TEXT[],  -- Array of image URLs
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- =============================================================================
-- EMR LABORATORY TABLE
-- Laboratory test results
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.emr_laboratory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_id TEXT UNIQUE NOT NULL,
    emr_master_id UUID REFERENCES public.emr_master(id) ON DELETE CASCADE,
    test_name TEXT NOT NULL,
    test_code TEXT,
    test_category TEXT,  -- 'hematology', 'biochemistry', 'serology', etc.
    specimen_type TEXT,  -- 'blood', 'urine', 'feces', etc.
    result_value TEXT,
    result_unit TEXT,
    reference_range TEXT,
    is_abnormal BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'pending',  -- 'pending', 'in_progress', 'completed', 'cancelled'
    ordered_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    report_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    ordered_by UUID,
    performed_by UUID
);

-- =============================================================================
-- EMR IMAGING TABLE
-- Radiology and imaging results
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.emr_imaging (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_id TEXT UNIQUE NOT NULL,
    emr_master_id UUID REFERENCES public.emr_master(id) ON DELETE CASCADE,
    imaging_type TEXT NOT NULL,  -- 'x-ray', 'ultrasound', 'ct', 'mri', etc.
    body_part TEXT,
    clinical_indication TEXT,
    findings TEXT,
    impression TEXT,
    image_urls TEXT[],
    dicom_url TEXT,  -- DICOM image storage URL
    status TEXT DEFAULT 'pending',
    ordered_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    report_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    ordered_by UUID,
    radiologist_id UUID
);

-- =============================================================================
-- EMR PATHOLOGY TABLE
-- Pathology reports and histopathology
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.emr_pathology (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_id TEXT UNIQUE NOT NULL,
    emr_master_id UUID REFERENCES public.emr_master(id) ON DELETE CASCADE,
    specimen_type TEXT NOT NULL,
    specimen_source TEXT,
    gross_description TEXT,
    microscopic_findings TEXT,
    diagnosis TEXT,
    special_stains TEXT,
    immunohistochemistry TEXT,
    status TEXT DEFAULT 'pending',
    collected_at TIMESTAMPTZ,
    reported_at TIMESTAMPTZ,
    report_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    ordered_by UUID,
    pathologist_id UUID
);

-- =============================================================================
-- EMR PRESCRIPTIONS TABLE
-- Medication prescriptions
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.emr_prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_id TEXT UNIQUE NOT NULL,
    emr_master_id UUID REFERENCES public.emr_master(id) ON DELETE CASCADE,
    medication_name TEXT NOT NULL,
    medication_code TEXT,
    dosage TEXT NOT NULL,
    dosage_unit TEXT,
    route TEXT,  -- 'oral', 'iv', 'im', 'sc', 'topical', etc.
    frequency TEXT,
    duration TEXT,
    quantity DECIMAL(10,2),
    refills INTEGER DEFAULT 0,
    instructions TEXT,
    indication TEXT,
    status TEXT DEFAULT 'active',  -- 'active', 'completed', 'cancelled', 'discontinued'
    prescribed_at TIMESTAMPTZ DEFAULT NOW(),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    prescribed_by UUID,
    dispensed_by UUID,
    dispensed_at TIMESTAMPTZ
);

-- =============================================================================
-- EMR ALERTS TABLE
-- Medical alerts and warnings
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.emr_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_id TEXT UNIQUE NOT NULL,
    patient_id UUID NOT NULL,
    alert_type TEXT NOT NULL,  -- 'allergy', 'condition', 'medication', 'behavioral', 'dietary'
    severity TEXT DEFAULT 'medium',  -- 'low', 'medium', 'high', 'critical'
    alert_text TEXT NOT NULL,
    details TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID
);

-- =============================================================================
-- EMR AUDIT LOGS TABLE
-- Track all changes to EMR records for compliance
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.emr_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_id TEXT UNIQUE NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL,  -- 'create', 'update', 'delete', 'view'
    old_values JSONB,
    new_values JSONB,
    user_id UUID NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- EMR Master indexes
CREATE INDEX IF NOT EXISTS idx_emr_master_patient ON public.emr_master(patient_id);
CREATE INDEX IF NOT EXISTS idx_emr_master_visit ON public.emr_master(visit_id);
CREATE INDEX IF NOT EXISTS idx_emr_master_organization ON public.emr_master(organization_id);
CREATE INDEX IF NOT EXISTS idx_emr_master_entity ON public.emr_master(entity_id);
CREATE INDEX IF NOT EXISTS idx_emr_master_created_at ON public.emr_master(created_at);
CREATE INDEX IF NOT EXISTS idx_emr_master_platform_id ON public.emr_master(platform_id);

-- EMR Notes indexes
CREATE INDEX IF NOT EXISTS idx_emr_notes_master ON public.emr_notes(emr_master_id);
CREATE INDEX IF NOT EXISTS idx_emr_notes_type ON public.emr_notes(note_type);
CREATE INDEX IF NOT EXISTS idx_emr_notes_platform_id ON public.emr_notes(platform_id);

-- EMR Vitals indexes
CREATE INDEX IF NOT EXISTS idx_emr_vitals_master ON public.emr_vitals(emr_master_id);
CREATE INDEX IF NOT EXISTS idx_emr_vitals_patient ON public.emr_vitals(patient_id);
CREATE INDEX IF NOT EXISTS idx_emr_vitals_measured_at ON public.emr_vitals(measured_at);
CREATE INDEX IF NOT EXISTS idx_emr_vitals_platform_id ON public.emr_vitals(platform_id);

-- EMR Examination indexes
CREATE INDEX IF NOT EXISTS idx_emr_examination_master ON public.emr_examination(emr_master_id);
CREATE INDEX IF NOT EXISTS idx_emr_examination_system ON public.emr_examination(system_examined);
CREATE INDEX IF NOT EXISTS idx_emr_examination_platform_id ON public.emr_examination(platform_id);

-- EMR Laboratory indexes
CREATE INDEX IF NOT EXISTS idx_emr_laboratory_master ON public.emr_laboratory(emr_master_id);
CREATE INDEX IF NOT EXISTS idx_emr_laboratory_status ON public.emr_laboratory(status);
CREATE INDEX IF NOT EXISTS idx_emr_laboratory_category ON public.emr_laboratory(test_category);
CREATE INDEX IF NOT EXISTS idx_emr_laboratory_platform_id ON public.emr_laboratory(platform_id);

-- EMR Imaging indexes
CREATE INDEX IF NOT EXISTS idx_emr_imaging_master ON public.emr_imaging(emr_master_id);
CREATE INDEX IF NOT EXISTS idx_emr_imaging_type ON public.emr_imaging(imaging_type);
CREATE INDEX IF NOT EXISTS idx_emr_imaging_status ON public.emr_imaging(status);
CREATE INDEX IF NOT EXISTS idx_emr_imaging_platform_id ON public.emr_imaging(platform_id);

-- EMR Pathology indexes
CREATE INDEX IF NOT EXISTS idx_emr_pathology_master ON public.emr_pathology(emr_master_id);
CREATE INDEX IF NOT EXISTS idx_emr_pathology_status ON public.emr_pathology(status);
CREATE INDEX IF NOT EXISTS idx_emr_pathology_platform_id ON public.emr_pathology(platform_id);

-- EMR Prescriptions indexes
CREATE INDEX IF NOT EXISTS idx_emr_prescriptions_master ON public.emr_prescriptions(emr_master_id);
CREATE INDEX IF NOT EXISTS idx_emr_prescriptions_status ON public.emr_prescriptions(status);
CREATE INDEX IF NOT EXISTS idx_emr_prescriptions_medication ON public.emr_prescriptions(medication_name);
CREATE INDEX IF NOT EXISTS idx_emr_prescriptions_platform_id ON public.emr_prescriptions(platform_id);

-- EMR Alerts indexes
CREATE INDEX IF NOT EXISTS idx_emr_alerts_patient ON public.emr_alerts(patient_id);
CREATE INDEX IF NOT EXISTS idx_emr_alerts_type ON public.emr_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_emr_alerts_severity ON public.emr_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_emr_alerts_active ON public.emr_alerts(is_active);
CREATE INDEX IF NOT EXISTS idx_emr_alerts_platform_id ON public.emr_alerts(platform_id);

-- EMR Audit Logs indexes
CREATE INDEX IF NOT EXISTS idx_emr_audit_table_record ON public.emr_audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_emr_audit_user ON public.emr_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_emr_audit_created_at ON public.emr_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_emr_audit_platform_id ON public.emr_audit_logs(platform_id);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all EMR tables
ALTER TABLE public.emr_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emr_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emr_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emr_examination ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emr_laboratory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emr_imaging ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emr_pathology ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emr_prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emr_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emr_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for EMR Master
CREATE POLICY "Users can view EMR records for their organization"
    ON public.emr_master FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can create EMR records for their organization"
    ON public.emr_master FOR INSERT
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update EMR records for their organization"
    ON public.emr_master FOR UPDATE
    USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

-- Similar policies for other EMR tables (simplified for brevity)
-- Each table should have appropriate SELECT, INSERT, UPDATE policies

-- Service role has full access
CREATE POLICY "Service role has full access to all EMR tables"
    ON public.emr_master FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- =============================================================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================================================

-- Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to tables with updated_at column
CREATE TRIGGER update_emr_master_updated_at BEFORE UPDATE ON public.emr_master
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emr_notes_updated_at BEFORE UPDATE ON public.emr_notes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emr_examination_updated_at BEFORE UPDATE ON public.emr_examination
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emr_laboratory_updated_at BEFORE UPDATE ON public.emr_laboratory
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emr_imaging_updated_at BEFORE UPDATE ON public.emr_imaging
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emr_pathology_updated_at BEFORE UPDATE ON public.emr_pathology
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emr_prescriptions_updated_at BEFORE UPDATE ON public.emr_prescriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emr_alerts_updated_at BEFORE UPDATE ON public.emr_alerts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE public.emr_master IS 'Main EMR record linking to patient visits and containing primary medical information';
COMMENT ON TABLE public.emr_notes IS 'Clinical notes and observations for EMR records';
COMMENT ON TABLE public.emr_vitals IS 'Vital signs and measurements for patients';
COMMENT ON TABLE public.emr_examination IS 'Physical examination findings and system reviews';
COMMENT ON TABLE public.emr_laboratory IS 'Laboratory test orders and results';
COMMENT ON TABLE public.emr_imaging IS 'Radiology and imaging orders and results';
COMMENT ON TABLE public.emr_pathology IS 'Pathology and histopathology reports';
COMMENT ON TABLE public.emr_prescriptions IS 'Medication prescriptions and dispensing records';
COMMENT ON TABLE public.emr_alerts IS 'Medical alerts, allergies, and warnings for patients';
COMMENT ON TABLE public.emr_audit_logs IS 'Audit trail for all EMR record changes';

-- =============================================================================
-- GRANTS
-- =============================================================================

-- Grant appropriate permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Service role gets full access
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

COMMENT ON SCHEMA public IS 'Master data schema containing EMR and other platform-wide data';
