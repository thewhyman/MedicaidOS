-- Create organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table (links auth.users to organizations)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT CHECK (role IN ('grant_manager', 'finance_director', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create grants table
CREATE TABLE grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  funder TEXT,
  amount DECIMAL(15, 2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  start_date DATE,
  end_date DATE,
  compliance_requirements TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create budgets table
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_id UUID REFERENCES grants(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  allocated DECIMAL(15, 2) NOT NULL,
  spent DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create compliance_logs table
CREATE TABLE compliance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_id UUID REFERENCES grants(id) ON DELETE CASCADE,
  requirement TEXT NOT NULL,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'overdue')),
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: Users can see profiles in their own organization
CREATE POLICY "Users can view profiles in their organization" ON profiles
  FOR SELECT USING (auth.uid() IN (
    SELECT id FROM profiles WHERE organization_id = profiles.organization_id
  ));

-- Grants: Users can see grants for their organization
CREATE POLICY "Users can view grants in their organization" ON grants
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert grants in their organization" ON grants
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ));

-- Budgets: Users can see budgets for grants in their organization
CREATE POLICY "Users can view budgets in their organization" ON budgets
  FOR SELECT USING (grant_id IN (
    SELECT id FROM grants WHERE organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  ));

-- Compliance Logs: Users can see logs for grants in their organization
CREATE POLICY "Users can view compliance_logs in their organization" ON compliance_logs
  FOR SELECT USING (grant_id IN (
    SELECT id FROM grants WHERE organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  ));
