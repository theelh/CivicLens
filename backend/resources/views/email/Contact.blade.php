<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Contact Message</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #F6F7F8; margin: 0; padding: 40px 20px; color: #171717; }
    .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #E8EBF0; }
    .header { background: #2369A4; padding: 32px 36px; }
    .header h1 { margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.3px; }
    .header p { margin: 6px 0 0; color: rgba(255,255,255,0.65); font-size: 13px; }
    .body { padding: 32px 36px; }
    .field { margin-bottom: 22px; }
    .field-label { font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #9CA3AF; margin-bottom: 6px; }
    .field-value { font-size: 15px; color: #171717; line-height: 1.6; }
    .message-box { background: #F6F7F8; border-radius: 10px; padding: 16px 18px; border-left: 3px solid #2369A4; }
    .footer { padding: 18px 36px; border-top: 1px solid #E8EBF0; background: #FAFAFA; }
    .footer p { margin: 0; font-size: 12px; color: #9CA3AF; }
    a { color: #2369A4; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>New Contact Message</h1>
      <p>Received via CivicLens AI contact form</p>
    </div>
    <div class="body">
      <div class="field">
        <div class="field-label">From</div>
        <div class="field-value">{{ $data['name'] }}</div>
      </div>
      <div class="field">
        <div class="field-label">Email</div>
        <div class="field-value"><a href="mailto:{{ $data['email'] }}">{{ $data['email'] }}</a></div>
      </div>
      <div class="field">
        <div class="field-label">Message</div>
        <div class="field-value message-box">{{ $data['message'] }}</div>
      </div>
    </div>
    <div class="footer">
      <p>This message was sent from the CivicLens AI contact form. Reply directly to this email to respond to {{ $data['name'] }}.</p>
    </div>
  </div>
</body>
</html>