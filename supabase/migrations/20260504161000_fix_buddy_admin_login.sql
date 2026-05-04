-- Repair the Buddy admin login so password authentication can resolve the user,
-- its email identity, and its admin-only role consistently.
DO $$
DECLARE
  v_uid uuid;
  v_email text := 'buddy@meaw.local';
  v_password text := 'Shrey@1122';
  v_identity jsonb;
  v_id_type text;
  v_has_provider_id boolean;
BEGIN
  SELECT id INTO v_uid FROM auth.users WHERE lower(email) = v_email LIMIT 1;

  IF v_uid IS NULL THEN
    SELECT user_id INTO v_uid FROM public.user_roles WHERE role = 'admin' LIMIT 1;
  END IF;

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
      jsonb_build_object('full_name', 'Buddy', 'username', 'Buddy@Meaw')
    );
  ELSE
    UPDATE auth.users
    SET email = v_email,
        encrypted_password = crypt(v_password, gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        updated_at = now(),
        raw_app_meta_data = jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
        raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('full_name', 'Buddy', 'username', 'Buddy@Meaw')
    WHERE id = v_uid;
  END IF;

  v_identity := jsonb_build_object(
    'sub', v_uid::text,
    'email', v_email,
    'email_verified', true,
    'phone_verified', false
  );

  SELECT data_type INTO v_id_type
  FROM information_schema.columns
  WHERE table_schema = 'auth' AND table_name = 'identities' AND column_name = 'id';

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'auth' AND table_name = 'identities' AND column_name = 'provider_id'
  ) INTO v_has_provider_id;

  IF v_has_provider_id THEN
    IF v_id_type = 'uuid' THEN
      EXECUTE '
        INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
        VALUES ($1::uuid, $1, $1::text, $2, ''email'', now(), now(), now())
        ON CONFLICT (provider_id, provider) DO UPDATE
        SET user_id = EXCLUDED.user_id, identity_data = EXCLUDED.identity_data, updated_at = now()'
      USING v_uid, v_identity;
    ELSE
      EXECUTE '
        INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
        VALUES ($1::text, $1, $1::text, $2, ''email'', now(), now(), now())
        ON CONFLICT (provider_id, provider) DO UPDATE
        SET user_id = EXCLUDED.user_id, identity_data = EXCLUDED.identity_data, updated_at = now()'
      USING v_uid, v_identity;
    END IF;
  ELSE
    IF v_id_type = 'uuid' THEN
      EXECUTE '
        INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
        VALUES ($1::uuid, $1, $2, ''email'', now(), now(), now())
        ON CONFLICT (provider, id) DO UPDATE
        SET user_id = EXCLUDED.user_id, identity_data = EXCLUDED.identity_data, updated_at = now()'
      USING v_uid, v_identity;
    ELSE
      EXECUTE '
        INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
        VALUES ($1::text, $1, $2, ''email'', now(), now(), now())
        ON CONFLICT (provider, id) DO UPDATE
        SET user_id = EXCLUDED.user_id, identity_data = EXCLUDED.identity_data, updated_at = now()'
      USING v_uid, v_identity;
    END IF;
  END IF;

  DELETE FROM public.user_roles WHERE user_id = v_uid AND role <> 'admin';
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_uid, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.profiles (id, email, full_name)
  VALUES (v_uid, v_email, 'Buddy')
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, full_name = EXCLUDED.full_name;
END $$;
