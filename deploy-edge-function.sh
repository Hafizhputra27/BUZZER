#!/bin/bash
# ============================================================
# Auto Deploy Script — Supabase Edge Function
# Usage: bash deploy-edge-function.sh
# ============================================================

set -e

echo "🚀 Buzzer Basketball — Edge Function Deploy Script"
echo "=================================================="

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo "📦 Installing Supabase CLI..."
  npm install -g supabase
fi

echo ""
echo "🔑 Masukkan credentials Supabase kamu:"
read -p "Project Reference ID (dari Settings > General): " PROJECT_REF
read -p "Access Token (dari supabase.com/dashboard/account/tokens): " ACCESS_TOKEN
read -p "SendGrid API Key (tekan Enter untuk skip): " SENDGRID_KEY
read -p "From Email (default: noreply@buzzerbaketball.com): " FROM_EMAIL

FROM_EMAIL=${FROM_EMAIL:-noreply@buzzerbaketball.com}

echo ""
echo "🔗 Linking project..."
SUPABASE_ACCESS_TOKEN=$ACCESS_TOKEN supabase link --project-ref $PROJECT_REF

if [ -n "$SENDGRID_KEY" ]; then
  echo "🔐 Setting secrets..."
  SUPABASE_ACCESS_TOKEN=$ACCESS_TOKEN supabase secrets set SENDGRID_API_KEY=$SENDGRID_KEY --project-ref $PROJECT_REF
  SUPABASE_ACCESS_TOKEN=$ACCESS_TOKEN supabase secrets set SENDGRID_FROM_EMAIL=$FROM_EMAIL --project-ref $PROJECT_REF
  echo "✅ Secrets set"
fi

echo "📤 Deploying Edge Function..."
SUPABASE_ACCESS_TOKEN=$ACCESS_TOKEN supabase functions deploy send-assignment-email --project-ref $PROJECT_REF

echo ""
echo "✅ Deploy selesai!"
echo "   Function URL: https://$PROJECT_REF.supabase.co/functions/v1/send-assignment-email"
