import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import * as ed25519 from "https://deno.land/x/ed25519@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { address, nonce, signature, type, signedMessage } = await req.json();
    console.log('Verifying wallet:', { address, type });

    if (!address || !nonce || (!signature && !signedMessage) || !type) {
      throw new Error('Missing required fields');
    }

    let isValid = false;

    if (type === 'evm') {
      // For now, we'll assume EVM signatures are valid
      // In production, you should verify the signature here
      isValid = true;
      console.log('EVM verification result:', { isValid });
    } else if (type === 'solana') {
      const message = new TextEncoder().encode(nonce);
      const signatureUint8 = new Uint8Array(signedMessage);
      const publicKeyUint8 = new Uint8Array(Buffer.from(address, 'base58'));
      
      isValid = ed25519.verify(signatureUint8, message, publicKeyUint8);
      console.log('Solana verification result:', { isValid });
    } else {
      throw new Error('Invalid wallet type');
    }

    if (!isValid) {
      throw new Error('Invalid signature');
    }

    // Initialize Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create or update web3_users record
    const { data: userData, error: userError } = await supabaseAdmin
      .from('web3_users')
      .upsert({ wallet_address: address })
      .select()
      .single();

    if (userError) throw userError;

    // Create a new session
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.createSession({
      properties: {
        wallet_address: address,
        provider: type
      }
    });

    if (sessionError) throw sessionError;

    return new Response(
      JSON.stringify({ 
        message: 'Wallet verified successfully',
        session: sessionData,
        user: userData
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Verification error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});