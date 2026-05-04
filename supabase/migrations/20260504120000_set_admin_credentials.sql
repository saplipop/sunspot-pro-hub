-- Set admin account to shreyasingh7297@gmail.com / Shrey@1122
DO $$
DECLARE
  v_uid uuid;
  v_email text := 'shreyasingh7297@gmail.com';
  v_password text := 'Shrey@1122';
BEGIN
  -- Try to find an existing admin
  SELECT user_id INTO v_uid FROM public.user_roles WHERE role = 'admin' LIMIT 1;

  IF v_uid IS NOT NULL THEN
    UPDATE auth.users
    SET email = v_email,
        encrypted_password = crypt(v_password, gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        updated_at = now(),
        raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('full_name', 'Shreya Singh')
    WHERE id = v_uid;
  ELSE
    -- Check if a user with that email already exists
    SELECT id INTO v_uid FROM auth.users WHERE email = v_email LIMIT 1;

    IF v_uid IS NULL THEN
      v_uid := gen_random_uuid();
      INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password,
        email_confirmed_at, created_at, updated_at,
        raw_app_meta_data, raw_user_meta_data
      ) VALUES (
        v_uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        v_email, crypt(v_password, gen_salt('bf')),
        now(), now(), now(),
        jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
        jsonb_build_object('full_name', 'Shreya Singh')
      );
    ELSE
      UPDATE auth.users
      SET encrypted_password = crypt(v_password, gen_salt('bf')),
          email_confirmed_at = COALESCE(email_confirmed_at, now()),
          updated_at = now()
      WHERE id = v_uid;
    END IF;

    INSERT INTO public.user_roles (user_id, role) VALUES (v_uid, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  -- Ensure profile row exists
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (v_uid, v_email, 'Shreya Singh')
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, full_name = EXCLUDED.full_name;
END $$;
