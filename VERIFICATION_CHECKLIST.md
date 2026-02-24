# ✅ CHECKLIST DE VERIFICAÇÃO

Use este checklist para verificar se tudo está funcionando corretamente.

## 📋 Verificação Inicial

### 1. Estrutura de Arquivos
- [ ] Pasta `src/` existe
- [ ] Pasta `src/app/` existe
- [ ] Pasta `src/components/` existe
- [ ] Pasta `src/lib/` existe
- [ ] Arquivo `supabase/schema.sql` existe
- [ ] Arquivo `README.md` existe
- [ ] Arquivo `package.json` existe

### 2. Dependências
```bash
# Execute para verificar
npm list --depth=0
```
- [ ] next@14.1.0 instalado
- [ ] react@18.2.0 instalado
- [ ] @supabase/ssr instalado
- [ ] zod instalado
- [ ] react-hook-form instalado

### 3. Compilação
```bash
# Execute para testar
npm run build
```
- [ ] Compila sem erros de TypeScript
- [ ] Apenas aviso sobre env vars (esperado)

## 🔧 Setup Local

### 4. Criar Projeto Supabase
- [ ] Conta Supabase criada
- [ ] Novo projeto criado
- [ ] URL do projeto copiada
- [ ] ANON key copiada

### 5. Configurar .env.local
```bash
# Crie o arquivo
copy .env.example .env.local
# Edite e adicione suas credenciais
```
- [ ] Arquivo `.env.local` criado
- [ ] NEXT_PUBLIC_SUPABASE_URL configurada
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY configurada

### 6. Executar SQL
- [ ] Abriu Supabase SQL Editor
- [ ] Copiou conteúdo de `supabase/schema.sql`
- [ ] Executou o SQL
- [ ] Viu mensagem de sucesso

### 7. Verificar Tabelas Criadas
No Supabase → Table Editor, verifique:
- [ ] Tabela `profiles` existe
- [ ] Tabela `challenges` existe
- [ ] Tabela `submissions` existe
- [ ] Tabela `transactions` existe

## 🚀 Testar Aplicação

### 8. Iniciar Servidor
```bash
npm run dev
```
- [ ] Servidor iniciou em http://localhost:3000
- [ ] Página inicial carrega sem erros
- [ ] Console do navegador sem erros

### 9. Testar Registro
- [ ] Acessar /login
- [ ] Clicar em "Register"
- [ ] Preencher formulário
- [ ] Registrar com sucesso
- [ ] Redirecionado para /dashboard

### 10. Verificar Perfil Criado
No Supabase → Table Editor → profiles:
- [ ] Novo registro criado
- [ ] `user_id` está preenchido
- [ ] `role` é 'student'
- [ ] `coins_total` é 0
- [ ] `points_total` é 0

### 11. Promover para Teacher
No Supabase SQL Editor:
```sql
UPDATE profiles 
SET role = 'teacher' 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'seu@email.com');
```
- [ ] Query executada
- [ ] Role atualizada para 'teacher'

### 12. Fazer Logout e Login Novamente
- [ ] Logout funcionou
- [ ] Login funcionou
- [ ] Redirecionado para /teacher (não /dashboard)

### 13. Criar Challenge
- [ ] Clicar em "Create New Challenge"
- [ ] Preencher título
- [ ] Preencher descrição
- [ ] Adicionar pelo menos 3 itens
- [ ] Definir recompensas
- [ ] Definir data de publicação
- [ ] Clicar em "Publish Challenge"
- [ ] Redirecionado para /teacher
- [ ] Challenge aparece na lista

### 14. Verificar Challenge no Banco
No Supabase → Table Editor → challenges:
- [ ] Challenge criada
- [ ] Status é 'published'
- [ ] `created_by` está preenchido

### 15. Testar como Student
- [ ] Criar outra conta de usuário
- [ ] Login com nova conta
- [ ] Ir para /dashboard
- [ ] Challenge publicada aparece
- [ ] Clicar em "Start Challenge"

### 16. Responder Challenge
- [ ] Página da challenge carrega
- [ ] Todos os itens aparecem
- [ ] Consegue selecionar opções
- [ ] Clicar em "Submit Challenge"
- [ ] Mensagem de sucesso aparece
- [ ] Redirecionado para /dashboard

### 17. Verificar Submission
No Supabase → Table Editor → submissions:
- [ ] Submission criada
- [ ] Status é 'pending'
- [ ] `answers_json` está preenchido

### 18. Revisar Submission (como Teacher)
- [ ] Login com conta teacher
- [ ] Ir para /teacher
- [ ] Submission pendente aparece
- [ ] Clicar em "Review Submission"
- [ ] Página de revisão carrega
- [ ] Respostas do aluno aparecem

### 19. Aprovar Submission
- [ ] Escrever feedback
- [ ] Clicar em "Approve & Credit Rewards"
- [ ] Confirmar no dialog
- [ ] Mensagem de sucesso
- [ ] Redirecionado para /teacher

### 20. Verificar Recompensas
No Supabase → Table Editor:

**profiles** (do student):
- [ ] `coins_total` aumentou
- [ ] `points_total` aumentou

**submissions**:
- [ ] Status mudou para 'approved'
- [ ] `feedback_text` está preenchido
- [ ] `reviewed_at` está preenchido
- [ ] `reviewed_by` está preenchido

**transactions**:
- [ ] Nova transação criada
- [ ] `type` é 'challenge_reward'
- [ ] `amount_coins` correto
- [ ] `amount_points` correto
- [ ] `ref_submission_id` está preenchido

### 21. Testar Leaderboard
- [ ] Acessar /leaderboard
- [ ] Student aparece na lista
- [ ] Moedas aparecem corretamente
- [ ] Pontos aparecem corretamente

## 🎨 Testar UI

### 22. Responsividade
- [ ] Desktop (>1024px) funciona
- [ ] Tablet (768px - 1024px) funciona
- [ ] Mobile (<768px) funciona
- [ ] Navegação em mobile funciona

### 23. Feedback Visual
- [ ] Toasts aparecem (sucesso, erro)
- [ ] Loading states funcionam
- [ ] Badges de status aparecem
- [ ] Ícones renderizam corretamente

### 24. Navegação
- [ ] NavBar aparece em todas páginas auth
- [ ] Links funcionam corretamente
- [ ] Logout funciona
- [ ] Redirects funcionam

## 🔒 Testar Segurança

### 25. RLS - Row Level Security
Tente acessar dados sem permissão:

**Como Student:**
- [ ] Não consegue acessar /teacher
- [ ] Não consegue ver challenges de outros teachers em draft
- [ ] Não consegue ver submissions de outros users

**Como Teacher:**
- [ ] Não consegue editar challenges de outros teachers
- [ ] Não consegue revisar submissions de challenges de outros

### 26. Validação
Tente submeter dados inválidos:
- [ ] Email inválido no registro
- [ ] Senha muito curta
- [ ] Challenge sem título
- [ ] Submission incompleta
- [ ] Feedback vazio na revisão

## 📊 Performance

### 27. Lighthouse (Opcional)
```bash
# No Chrome DevTools
# Executar Lighthouse audit
```
- [ ] Performance > 80
- [ ] Accessibility > 90
- [ ] Best Practices > 80
- [ ] SEO > 90

## 🚢 Deploy (Opcional)

### 28. Deploy na Vercel
- [ ] Projeto no GitHub
- [ ] Conectado na Vercel
- [ ] Env vars configuradas
- [ ] Deploy com sucesso
- [ ] Site acessível

### 29. Configurar Supabase para Produção
- [ ] URL da Vercel adicionada em Redirect URLs
- [ ] Site URL atualizada
- [ ] Auth funciona em produção

## ✅ RESULTADO FINAL

Marque aqui quando completar todos os testes:

- [ ] ✅ Todos os testes passaram
- [ ] ✅ Aplicação funciona localmente
- [ ] ✅ Autenticação funciona
- [ ] ✅ Challenges funcionam
- [ ] ✅ Submissions funcionam
- [ ] ✅ Revisão funciona
- [ ] ✅ Gamificação funciona
- [ ] ✅ Leaderboard funciona
- [ ] ✅ Segurança funciona
- [ ] ✅ Deploy funciona (se aplicável)

---

## 🎉 PARABÉNS!

Se todos os checkboxes acima estão marcados, seu projeto está 100% funcional!

---

## 🐛 Se algo falhou

Consulte:
1. **README.md** → Seção "Troubleshooting"
2. **Console do navegador** → Erros de JavaScript
3. **Terminal** → Erros do Next.js
4. **Supabase Logs** → Erros do banco

---

**Boa sorte! 🚀**
