-- Create reports table for tracking generated report files
CREATE TABLE IF NOT EXISTS reports (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name        text NOT NULL,
    report_type text NOT NULL,   -- 'financial_summary' | 'grant_utilization' | 'compliance_audit'
    format      text NOT NULL,   -- 'csv' | 'html'
    storage_path text NOT NULL,
    size_bytes  bigint,
    created_by  uuid REFERENCES auth.users(id),
    created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reports_org_id ON reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- Storage bucket for reports (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', false)
ON CONFLICT (id) DO NOTHING;
