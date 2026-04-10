
-- Temporarily create a function to set admin password
CREATE OR REPLACE FUNCTION public.temp_set_admin_password()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'extensions', 'public', 'auth'
AS $$
BEGIN
  UPDATE auth.users 
  SET encrypted_password = crypt('MISHI1701', gen_salt('bf'))
  WHERE email = 'mishiofficial1701@gmail.com';
END;
$$;

-- Execute it
SELECT public.temp_set_admin_password();

-- Drop it immediately
DROP FUNCTION public.temp_set_admin_password();
