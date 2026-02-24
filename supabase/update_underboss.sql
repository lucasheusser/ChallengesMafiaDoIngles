-- ========================================
-- SCRIPT PARA ATUALIZAR ROLE PARA UNDERBOSS
-- ========================================
-- Este script atualiza o role de um usuário específico para 'underboss'
-- Underboss tem permissões totais como admin, podendo ver e editar todas as challenges

-- IMPORTANTE: Substitua 'USER_EMAIL_HERE' pelo email do usuário que você deseja promover

-- Opção 1: Atualizar por email
UPDATE public.profiles 
SET role = 'underboss'
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'USER_EMAIL_HERE'
);

-- Opção 2: Atualizar por full_name
-- UPDATE public.profiles 
-- SET role = 'underboss'
-- WHERE full_name = 'NOME_COMPLETO_AQUI';

-- Verificar se foi atualizado com sucesso
SELECT 
  p.id,
  p.role,
  p.full_name,
  u.email,
  p.created_at
FROM public.profiles p
JOIN auth.users u ON p.user_id = u.id
WHERE p.role = 'underboss';

-- ========================================
-- SCRIPT PARA ATUALIZAR RLS POLICIES
-- ========================================
-- Execute este script APENAS SE você ainda não atualizou o schema.sql completo
-- Caso já tenha executado o schema.sql atualizado, não precisa executar os comandos abaixo

/*
-- 1. Atualizar constraint da tabela profiles para aceitar 'underboss'
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('student', 'teacher', 'underboss', 'admin'));

-- 2. Dropar e recriar políticas com suporte a underboss
DROP POLICY IF EXISTS "Teachers can update profiles" ON public.profiles;
CREATE POLICY "Teachers can update profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
      AND role IN ('teacher', 'underboss', 'admin')
    )
  )
  WITH CHECK (true);

DROP POLICY IF EXISTS "Published challenges are viewable by authenticated users" ON public.challenges;
CREATE POLICY "Published challenges are viewable by authenticated users"
  ON public.challenges FOR SELECT
  TO authenticated
  USING (
    status = 'published' 
    OR 
    created_by IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('teacher', 'underboss', 'admin')
    )
  );

DROP POLICY IF EXISTS "Teachers can create challenges" ON public.challenges;
CREATE POLICY "Teachers can create challenges"
  ON public.challenges FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('teacher', 'underboss', 'admin')
    )
  );

DROP POLICY IF EXISTS "Teachers can update own challenges" ON public.challenges;
CREATE POLICY "Teachers can update own challenges"
  ON public.challenges FOR UPDATE
  TO authenticated
  USING (
    created_by IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('underboss', 'admin')
    )
  )
  WITH CHECK (
    created_by IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('underboss', 'admin')
    )
  );

DROP POLICY IF EXISTS "Users can view relevant submissions" ON public.submissions;
CREATE POLICY "Users can view relevant submissions"
  ON public.submissions FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
    OR
    challenge_id IN (
      SELECT id FROM public.challenges 
      WHERE created_by IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
      )
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('underboss', 'admin')
    )
  );

DROP POLICY IF EXISTS "Teachers can review submissions" ON public.submissions;
CREATE POLICY "Teachers can review submissions"
  ON public.submissions FOR UPDATE
  TO authenticated
  USING (
    challenge_id IN (
      SELECT id FROM public.challenges 
      WHERE created_by IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
      )
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('underboss', 'admin')
    )
  )
  WITH CHECK (
    challenge_id IN (
      SELECT id FROM public.challenges 
      WHERE created_by IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
      )
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('underboss', 'admin')
    )
  );
*/
