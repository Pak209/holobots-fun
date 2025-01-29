import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { ethers } from "npm:ethers@^6.13.5"
import * as ed25519 from "https://deno.land/x/ed25519@1.6.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { address, nonce, signature, type, signedMessage } = await req.json()
    console.log('Verifying wallet:', { address, type })

    if (!address || !nonce || (!signature && !signedMessage) || !type) {
      throw new Error('Missing required fields')
    }

    let isValid = false

    if (type === 'evm') {
      // Verify EVM signature
      const recoveredAddress = ethers.verifyMessage(nonce, signature)
      isValid = recoveredAddress.toLowerCase() === address.toLowerCase()
      console.log('EVM verification result:', { isValid, recoveredAddress })
    } else if (type === 'solana') {
      // Verify Solana signature
      const message = new TextEncoder().encode(nonce)
      const signatureUint8 = new Uint8Array(signedMessage)
      const publicKeyUint8 = new Uint8Array(Buffer.from(address, 'base58'))
      
      isValid = ed25519.verify(signatureUint8, message, publicKeyUint8)
      console.log('Solana verification result:', { isValid })
    } else {
      throw new Error('Invalid wallet type')
    }

    if (!isValid) {
      throw new Error('Invalid signature')
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Create or update web3_users record
    const { data, error } = await supabaseClient
      .from('web3_users')
      .upsert({ wallet_address: address })
      .select()
      .single()

    if (error) throw error

    return new Response(
      JSON.stringify({ 
        message: 'Wallet verified successfully',
        user: data
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('Verification error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})