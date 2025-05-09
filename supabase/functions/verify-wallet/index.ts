
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import * as ed25519 from "https://deno.land/x/ed25519@1.6.0/mod.ts";
import { ethers } from "https://esm.sh/ethers@6.7.1";

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
    const { address, nonce, signature, type, provider } = await req.json();
    console.log('Verifying wallet:', { address, type, provider });

    if (!address || !nonce || !signature || !type) {
      throw new Error('Missing required fields');
    }

    let isValid = false;

    if (type === 'evm') {
      try {
        const recoveredAddress = ethers.verifyMessage(nonce, signature);
        isValid = recoveredAddress.toLowerCase() === address.toLowerCase();
        console.log('EVM verification result:', { isValid, recoveredAddress });
      } catch (error) {
        console.error('EVM signature verification error:', error);
        throw new Error('Invalid EVM signature');
      }
    } else if (type === 'solana') {
      try {
        const message = new TextEncoder().encode(nonce);
        const signatureUint8 = new Uint8Array(Buffer.from(signature, 'base58'));
        const publicKeyUint8 = new Uint8Array(Buffer.from(address, 'base58'));
        
        isValid = ed25519.verify(signatureUint8, message, publicKeyUint8);
        console.log('Solana verification result:', { isValid });
      } catch (error) {
        console.error('Solana signature verification error:', error);
        throw new Error('Invalid Solana signature');
      }
    } else {
      throw new Error('Invalid wallet type');
    }

    if (!isValid) {
      throw new Error('Invalid signature');
    }

    // Initialize Supabase client with admin privileges
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Create or update web3_users record
    const { data: userData, error: userError } = await supabaseAdmin
      .from('web3_users')
      .upsert({ 
        wallet_address: address,
        provider: provider || type 
      })
      .select()
      .single();

    if (userError) {
      console.error('Error upserting web3_user:', userError);
      throw userError;
    }

    // Create a new session
    const { data: { user }, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email: `${address.toLowerCase()}@web3.user`,
      password: crypto.randomUUID(),
      email_confirm: true,
      user_metadata: {
        wallet_address: address,
        provider: type,
      }
    });

    if (signUpError) {
      console.error('Error creating user:', signUpError);
      throw signUpError;
    }

    const { data: session, error: sessionError } = await supabaseAdmin.auth.admin.createSession({
      user_id: user.id
    });

    if (sessionError) {
      console.error('Error creating session:', sessionError);
      throw sessionError;
    }

    return new Response(
      JSON.stringify({ 
        message: 'Wallet verified successfully',
        session,
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
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }),
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
