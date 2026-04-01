# Deploy Script - Supabase Edge Function (Windows PowerShell)
# Usage: .\deploy-edge-function.ps1

Write-Host "Buzzer Basketball - Edge Function Deploy Script"
Write-Host "================================================"

# Check if supabase CLI is installed
$supExists = Get-Command supabase -ErrorAction SilentlyContinue
if (-not $supExists) {
    Write-Host "Installing Supabase CLI..."
    npm install -g supabase
}

Write-Host ""
Write-Host "Masukkan credentials Supabase kamu:"

$PROJECT_REF = Read-Host "Project Reference ID (dari Settings > General)"
$ACCESS_TOKEN = Read-Host "Access Token (dari supabase.com/dashboard/account/tokens)"
$SENDGRID_KEY = Read-Host "SendGrid API Key (tekan Enter untuk skip)"
$FROM_EMAIL   = Read-Host "From Email (tekan Enter untuk default: noreply@buzzerbaketball.com)"

if ([string]::IsNullOrEmpty($FROM_EMAIL)) {
    $FROM_EMAIL = "noreply@buzzerbaketball.com"
}

$env:SUPABASE_ACCESS_TOKEN = $ACCESS_TOKEN

Write-Host ""
Write-Host "Linking project..."
supabase link --project-ref $PROJECT_REF

if (-not [string]::IsNullOrEmpty($SENDGRID_KEY)) {
    Write-Host "Setting secrets..."
    supabase secrets set SENDGRID_API_KEY=$SENDGRID_KEY --project-ref $PROJECT_REF
    supabase secrets set SENDGRID_FROM_EMAIL=$FROM_EMAIL --project-ref $PROJECT_REF
    Write-Host "Secrets set successfully"
}

Write-Host "Deploying Edge Function..."
supabase functions deploy send-assignment-email --project-ref $PROJECT_REF

Write-Host ""
Write-Host "Deploy selesai!"
Write-Host "Function URL: https://$PROJECT_REF.supabase.co/functions/v1/send-assignment-email"
