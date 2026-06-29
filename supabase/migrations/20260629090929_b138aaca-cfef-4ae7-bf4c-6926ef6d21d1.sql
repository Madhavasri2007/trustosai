
-- Grant admin to the user
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE email = 'kishorekumarp.r30@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Page views tracking
CREATE TABLE public.page_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  path text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE INDEX page_views_user_created_idx ON public.page_views(user_id, created_at DESC);
CREATE INDEX page_views_created_idx ON public.page_views(created_at DESC);

GRANT SELECT, INSERT ON public.page_views TO authenticated;
GRANT ALL ON public.page_views TO service_role;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own page_views insert" ON public.page_views FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own page_views select" ON public.page_views FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admin read page_views" ON public.page_views FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
