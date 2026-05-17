CREATE TABLE IF NOT EXISTS public.pipeline_logs (
  id          BIGSERIAL PRIMARY KEY,
  ran_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  source      TEXT        NOT NULL,
  records_fetched  INT   NOT NULL DEFAULT 0,
  records_upserted INT   NOT NULL DEFAULT 0,
  status      TEXT        NOT NULL DEFAULT 'success',
  error_message TEXT,
  duration_ms INT
);

ALTER TABLE public.pipeline_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pipeline_logs public read"   ON public.pipeline_logs FOR SELECT USING (true);
CREATE POLICY "pipeline_logs anyone insert" ON public.pipeline_logs FOR INSERT WITH CHECK (true);
