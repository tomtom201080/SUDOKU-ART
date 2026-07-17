// supabase/functions/delete-account/index.ts
// Edge function : supprime toutes les données d'un utilisateur connecté
// puis son compte auth. À déployer via : supabase functions deploy delete-account

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return new Response('Unauthorized', { status: 401 });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Identifier l'utilisateur à partir du JWT
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return new Response('Invalid token', { status: 401 });

  const uid = user.id;

  // Supprimer toutes les données liées à cet utilisateur
  await supabase.from('seen_paintings').delete().eq('user_id', uid);
  await supabase.from('quest_progress').delete().eq('user_id', uid);
  await supabase.from('math_quest_progress').delete().eq('user_id', uid);
  await supabase.from('game_events').delete().eq('user_id', uid);
  await supabase.from('challenges').delete().eq('sender_user_id', uid);

  // Supprimer le compte auth (opération admin uniquement)
  const { error: deleteError } = await supabase.auth.admin.deleteUser(uid);
  if (deleteError) return new Response(JSON.stringify({ error: deleteError.message }), { status: 500 });

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
