
-- Restrict profile updates so users cannot change trust_score
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (display_name, updated_at) ON public.profiles TO authenticated;

-- Remove public anonymous access to reports; require auth to view
DROP POLICY IF EXISTS "public read reports" ON public.reports;
CREATE POLICY "auth read reports" ON public.reports FOR SELECT TO authenticated USING (true);
REVOKE SELECT ON public.reports FROM anon;
