import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface SendEmailRequest {
  assignmentId: string
  buzzerEmail: string
  buzzerName: string
  campaignTitle: string
  campaignDescription: string
  campaignDeadline: string
}

function buildEmailHtml(
  buzzerName: string,
  campaignTitle: string,
  campaignDescription: string,
  campaignDeadline: string,
): string {
  const formattedDeadline = new Date(campaignDeadline).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Penugasan Campaign Baru</title>
</head>
<body style="margin:0;padding:0;background-color:#040d1a;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#040d1a;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:16px;overflow:hidden;max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a73e8,#0d47a1);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">
                🏀 Buzzer Basketball
              </h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">
                Platform Manajemen Campaign Buzzer
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 16px;color:#e2e8f0;font-size:16px;">
                Halo, <strong style="color:#ffffff;">${buzzerName}</strong>!
              </p>
              <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;line-height:1.6;">
                Kamu baru saja ditugaskan ke campaign baru. Berikut adalah detail penugasanmu:
              </p>

              <!-- Campaign Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(26,115,232,0.1);border:1px solid rgba(26,115,232,0.3);border-radius:12px;margin-bottom:24px;">
                <tr>
                  <td style="padding:24px;">
                    <p style="margin:0 0 4px;color:#64b5f6;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">
                      Campaign
                    </p>
                    <h2 style="margin:0 0 16px;color:#ffffff;font-size:20px;font-weight:700;">
                      ${campaignTitle}
                    </h2>

                    <p style="margin:0 0 4px;color:#64b5f6;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">
                      Brief / Deskripsi
                    </p>
                    <p style="margin:0 0 16px;color:#cbd5e1;font-size:14px;line-height:1.7;">
                      ${campaignDescription}
                    </p>

                    <p style="margin:0 0 4px;color:#64b5f6;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">
                      Deadline
                    </p>
                    <p style="margin:0;color:#f87171;font-size:15px;font-weight:600;">
                      📅 ${formattedDeadline}
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 24px;color:#94a3b8;font-size:14px;line-height:1.6;">
                Silakan login ke platform untuk melihat detail lengkap dan mengirimkan bukti posting kamu sebelum deadline.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                <tr>
                  <td style="background:#1a73e8;border-radius:8px;text-align:center;">
                    <a href="#" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">
                      Lihat Penugasan →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;color:#64748b;font-size:13px;line-height:1.6;border-top:1px solid rgba(255,255,255,0.08);padding-top:24px;">
                Email ini dikirim secara otomatis oleh sistem Buzzer Basketball. Jika kamu merasa menerima email ini karena kesalahan, abaikan saja.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }

  try {
    const apiKey = Deno.env.get('SENDGRID_API_KEY')
    if (!apiKey) {
      console.error('[send-assignment-email] SENDGRID_API_KEY is not set')
      return new Response(
        JSON.stringify({ success: false, error: 'Email service is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const fromEmail =
      Deno.env.get('SENDGRID_FROM_EMAIL') ?? 'noreply@buzzerbaketball.com'

    const body: SendEmailRequest = await req.json()
    const {
      assignmentId,
      buzzerEmail,
      buzzerName,
      campaignTitle,
      campaignDescription,
      campaignDeadline,
    } = body

    if (!assignmentId || !buzzerEmail || !buzzerName || !campaignTitle || !campaignDescription || !campaignDeadline) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const htmlContent = buildEmailHtml(buzzerName, campaignTitle, campaignDescription, campaignDeadline)

    const emailPayload = {
      personalizations: [
        {
          to: [{ email: buzzerEmail, name: buzzerName }],
          subject: `[Buzzer Basketball] Penugasan Baru: ${campaignTitle}`,
        },
      ],
      from: { email: fromEmail, name: 'Buzzer Basketball' },
      content: [
        {
          type: 'text/html',
          value: htmlContent,
        },
      ],
    }

    const sgResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    })

    if (!sgResponse.ok) {
      const errorText = await sgResponse.text()
      console.error(
        `[send-assignment-email] SendGrid error ${sgResponse.status}: ${errorText}`,
      )
      return new Response(
        JSON.stringify({ success: false, error: `SendGrid error: ${sgResponse.status}` }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    console.log(
      `[send-assignment-email] Email sent to ${buzzerEmail} for assignment ${assignmentId}`,
    )

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    console.error('[send-assignment-email] Unexpected error:', err)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
