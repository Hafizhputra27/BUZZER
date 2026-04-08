-- Migration: 002_rls_policies
-- Description: Row Level Security policies for all tables

-- users: only can read own data, admin can read all
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_self_read" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_self_insert" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_self_update" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "admin_read_all_users" ON users FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- campaigns: admin can CRUD, buzzer can only read assigned campaigns
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_manage_campaigns" ON campaigns FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "buzzer_read_assigned_campaigns" ON campaigns FOR SELECT USING (
  EXISTS (SELECT 1 FROM assignments WHERE campaign_id = campaigns.id AND buzzer_id = auth.uid())
);

-- assignments: admin can CRUD, buzzer can only read own
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_manage_assignments" ON assignments FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "buzzer_read_own_assignments" ON assignments FOR SELECT USING (buzzer_id = auth.uid());

-- submissions: buzzer can insert/read own, admin can read all and update status
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "buzzer_manage_own_submissions" ON submissions FOR ALL USING (buzzer_id = auth.uid());
CREATE POLICY "admin_manage_submissions" ON submissions FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
