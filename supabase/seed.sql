-- Initial seed data for the database GUI client
-- This file contains sample data for development and testing

-- Note: User profiles will be created automatically via trigger when users sign up
-- This seed file focuses on reference data and development helpers

-- Insert sample database connection types for reference
-- (This is just for documentation - the actual connections will be user-specific)

-- Sample AI usage types for reference
INSERT INTO public.ai_usage_logs (id, user_id, usage_type, tokens_used, cost_cents, created_at)
VALUES 
  -- These are just examples - real data will be inserted by the application
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'query_generation', 100, 5, NOW() - INTERVAL '1 day'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'chat_message', 50, 2, NOW() - INTERVAL '2 hours')
ON CONFLICT (id) DO NOTHING;

-- Note: The above sample data uses placeholder UUIDs and will only work if those users exist
-- In production, this seed file should be minimal or empty