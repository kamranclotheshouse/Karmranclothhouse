# Kamran Cloth House — Client Handover

## Live website

- Website: https://www.kamranclothhouse.pk
- Admin panel: https://www.kamranclothhouse.pk/admin
- Customer order tracking: https://www.kamranclothhouse.pk/track

## Accounts to transfer

Transfer ownership and billing to the client’s own email address. Do not send passwords in a normal WhatsApp message; use a password manager or change the password together on a call.

- Google account / Search Console: add the client as an Owner, then verify `https://www.kamranclothhouse.pk/` and submit `/sitemap.xml`.
- PKNIC: transfer the domain account and billing details. Keep the client as the registrant.
- Vercel: transfer the project/team and billing ownership. Keep the production domain attached.
- GitHub: transfer repository ownership or add the client as an administrator.
- Neon: transfer project ownership and billing; do not expose the database connection string.
- Cloudinary: transfer cloud ownership/API access; rotate the API secret after handover if needed.
- Meta Business / Events Manager: transfer Pixel and Business access. The active website Pixel is configured in Admin → Settings.
- TikTok Ads Manager: transfer the Pixel and Business access if TikTok tracking is used.

### Current access status

- Google and PKNIC credentials: shared separately through the password manager.
- Admin panel login: already handed over; client should change the PIN after acceptance.
- Meta Business and TikTok Ads Manager: client already owns these accounts; no credentials are required from the developer.
- Neon and Cloudinary: already connected to the client’s email; client can manage them directly.
- Vercel: client can inspect the production environment variables after logging in.
- GitHub: transfer repository ownership or add the client as an administrator.

## Vercel production variables

Set these in Vercel → Project Settings → Environment Variables → Production:

```text
ADMIN_PIN=<new private admin PIN>
ADMIN_SESSION_SECRET=<long random secret>
NEON_DATABASE_URL=<Neon PostgreSQL connection string>
CLOUDINARY_CLOUD_NAME=<Cloudinary cloud name>
CLOUDINARY_API_KEY=<Cloudinary API key>
CLOUDINARY_API_SECRET=<Cloudinary API secret>
NEXT_PUBLIC_SITE_URL=https://www.kamranclothhouse.pk
```

Pixel IDs are saved from the admin panel, so they do not need to be placed in GitHub or Vercel variables.

## First handover checks

1. Client signs in at `/admin` using the new PIN.
2. Client changes the store phone, WhatsApp number, email and social links in Settings.
3. Client confirms the production domain opens with HTTPS.
4. Client places one small test order, checks it in Admin → Orders, then removes the test order.
5. Client checks Meta Events Manager if advertising pixels are being used.
6. Client confirms the sitemap at `/sitemap.xml` and robots file at `/robots.txt`.

## Ongoing content updates

Use the admin panel for products, prices, stock, images, categories, brands, banners, contact information and orders. Product images uploaded there are converted to WebP and stored in Cloudinary.

Do not run `npm run db:seed` on the production database after the client has edited content through the admin panel.

## Security after handover

- Change the admin PIN and session secret.
- Remove developer access from Vercel, GitHub, Neon, Cloudinary, Google, Meta, TikTok and PKNIC when no longer required.
- Keep all API keys and database credentials private.
- Keep the domain, hosting, database, media and advertising accounts under the client’s own email and billing details.
