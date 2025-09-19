# WhatsApp API Setup Guide

This document explains how to configure WhatsApp notifications for the Admin -> Manage Notification feature.

## 1) Choose a WhatsApp API Provider

You can use any provider that exposes a simple HTTP API. Popular options:
- Meta WhatsApp Cloud API (official)
- Gupshup, Twilio, MessageBird, etc.

All providers will assign you an API endpoint and a token/key to authorize requests.

## 2) Configure Environment Variables

In `backend/.env` (or your deployment environment) set:

- WHATSAPP_API_URL=<your provider's message send endpoint>
- WHATSAPP_API_KEY=<your token or API key>

If you plan to use Twilio for WhatsApp messages, set these instead (or in addition):

- WHATSAPP_PROVIDER=twilio
- TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx
- TWILIO_AUTH_TOKEN=<your_twilio_auth_token>
- TWILIO_WHATSAPP_FROM=whatsapp:+1415XXXXXXX

When using Twilio, the backend will call Twilio's REST Messages API with basic auth. Ensure your Twilio phone number is WhatsApp-enabled (sandbox or production).

See `backend/.env.example` for placeholders.

If these are not set, the backend will SIMULATE sending (useful for development). You will see logs like:

```
[notificationService] WHATSAPP_API_URL/API_KEY not set. Simulating send.
[Simulated WhatsApp] To: 9876543210 Message: ...
```

## 3) Expected Request Payload (Generic)

The backend sends a POST request to WHATSAPP_API_URL with body:

```
{
  "to": "+91XXXXXXXXXX",
  "message": "<text>"
}
```

Headers include:
- Authorization: Bearer <WHATSAPP_API_KEY>
- Content-Type: application/json

Adjust your provider's webhook/settings accordingly (you may need to use a gateway URL that maps these fields).

## 4) Testing in Development

- Ensure the backend is running.
- In the Admin Dashboard, open "Manage Notification".
- Select a Published competition and verify the message template auto-fills.
- Select a few users and click Send.
- With no API configured, messages are simulated and marked as sent in the database table `CompetitionNotifications`.

## 5) Database Tracking

The table `CompetitionNotifications` records per-user sent status to prevent duplicates and to show the "Message Sent" status in the grid.

Columns:
- CompetitionID (FK)
- UserID (FK)
- MessageSent (bit)
- SentDateTime (datetime2)

## 6) Troubleshooting

- If you see 401s from the API, verify login and tokens in localStorage.
- If the provider returns 400/403 errors, verify your API URL and credentials.
- If no users appear, ensure there are active users in the Users table.
- If no competitions appear, publish at least one competition.

## 7) Security Notes

- Keep your API key secret; never commit it to version control.
- Use provider-specific IP allowlists and rate limits where possible.
- Consider message templates approved by WhatsApp for higher deliverability.

