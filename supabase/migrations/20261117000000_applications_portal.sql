BEGIN;

CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 120),
  email TEXT NOT NULL CHECK (char_length(email) <= 254),
  phone TEXT NOT NULL CHECK (char_length(phone) BETWEEN 7 AND 30),
  position TEXT NOT NULL CHECK (position IN ('crew', 'cashier', 'redemption')),
  cv_path TEXT NOT NULL,
  cv_filename TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.applications FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO service_role;

CREATE INDEX IF NOT EXISTS applications_created_at_idx ON public.applications (created_at DESC);
CREATE INDEX IF NOT EXISTS applications_status_created_at_idx ON public.applications (status, created_at DESC);
CREATE INDEX IF NOT EXISTS applications_position_idx ON public.applications (position);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('applicant-cvs', 'applicant-cvs', false, 10485760, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    public = false,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

COMMIT;
