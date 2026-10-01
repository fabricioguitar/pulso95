import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { tarefa, autor, discordId } = await req.json();
    const discordWebhookUrl = Deno.env.get('DISCORD_WEBHOOK_URL');

    if (!discordWebhookUrl) {
      throw new Error('DISCORD_WEBHOOK_URL não configurado.');
    }

    if (!discordId) {
      return new Response(JSON.stringify({ success: true, message: 'Nenhum Discord ID configurado para este usuário. Notificação ignorada.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const prazoFormatado = tarefa.prazo.split('-').reverse().join('/');
    
    // Formatting the message per requirements
    const content = `📋 **NOVA TAREFA**\n\n👤 **Responsável:** <@${discordId}>\n📌 **Tarefa:** ${tarefa.titulo}\n🏢 **Condomínio:** ${tarefa.condominioNome}\n📅 **Prazo:** ${prazoFormatado}\n⚡ **Prioridade:** ${tarefa.prioridade}\n👤 **Criado por:** ${autor}\n\nPULSO95 — Gestão inteligente de processos`;

    const response = await fetch(discordWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro na API do Discord:', errorText);
      throw new Error(`Falha ao enviar para o Discord: ${response.statusText}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error('Erro na Edge Function:', error.message);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
