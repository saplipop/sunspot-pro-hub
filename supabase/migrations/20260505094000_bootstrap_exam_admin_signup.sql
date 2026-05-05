CREATE OR REPLACE FUNCTION public.bootstrap_exam_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_email text;
BEGIN
  SELECT lower(email) INTO current_email
  FROM auth.users
  WHERE id = auth.uid();

  IF auth.uid() IS NULL OR current_email <> 'admin@exameye.com' THEN
    RETURN false;
  END IF;

  DELETE FROM public.user_roles
  WHERE user_id = auth.uid()
    AND role <> 'admin';

  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.profiles (id, email, full_name)
  VALUES (auth.uid(), 'admin@exameye.com', 'ExamEye Admin')
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = EXCLUDED.full_name;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.bootstrap_exam_admin() FROM public;
GRANT EXECUTE ON FUNCTION public.bootstrap_exam_admin() TO authenticated;
