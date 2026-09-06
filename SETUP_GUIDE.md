# BookMyEvent Setup Guide

This guide configures MongoDB, email OTP, and optional Razorpay payments, then starts the two packages that make up BookMyEvent.

## 1. Prerequisites

- Node.js 18 or newer
- MongoDB Atlas or a local MongoDB server
- A Gmail account with 2-Step Verification and an App Password, or another SMTP account
- A Razorpay account if paid bookings should use online payment

## 2. Set up MongoDB Atlas

MongoDB Atlas provides a fully managed, free cloud database. This is where `mongoose` will store all your `Users`, `Events`, and `Bookings`.

1. **Sign Up / Log In**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create a free account.
2. **Create a Cluster**:
   - Once logged in, click **"Build a Database"** or **"Create Cluster"**.
   - Select the **"M0 Sandbox" (Free Tier)** option.
   - Choose a provider (e.g., AWS, Google Cloud) and click **Create** (no credit card required).
3. **Set Up Database Access (Credentials)**:
   - On the left sidebar, click **"Database Access"**.
   - Click **"Add New Database User"**.
   - Choose **Password** authentication.
   - Set a database username and password. Keep them separate from the application JWT secret.
   - Click **Add User**.
4. **Set Up Network Access (IP Whitelist)**:
   - On the left sidebar, click **"Network Access"**.
   - Click **"Add IP Address"**.
   - Add the IP address of the development machine. `0.0.0.0/0` works for temporary development but is less restrictive.
   - Click **Confirm**.
5. **Get Your Connection String**:
   - On the left sidebar, click **"Database"** (under Deployments).
   - Click the **"Connect"** button on your new cluster.
   - Choose **"Drivers"** (Connect your application).
   - Copy the driver connection string and replace its password placeholder. Include a database name such as `BookMyEvent` in the path.

## 3. Configure email OTP

To send emails automatically (booking confirmations), you need to configure an App Password for your Gmail account. Normal passwords won't work because of 2FA.

1. Go to your [Google Account Manage page](https://myaccount.google.com/).
2. Navigate to **Security**.
3. Under "How you sign in to Google", select **2-Step Verification** and make sure it is turned ON.
4. Once ON, go back to the Security tab, search for **App Passwords** in the search bar.
5. Generate an App Password and copy the 16-character value.

## 4. Configure `server/.env`

Create a file named `.env` inside `server/`:

```env
# MongoDB Atlas connection string
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/BookMyEvent?retryWrites=true&w=majority

# Use a long random value in real deployments
JWT_SECRET=replace_with_a_long_random_secret

# SMTP credentials used for account, booking, and password-reset OTPs
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=the_16_character_app_password

# Backend port; the client currently expects 5000
PORT=5000

# Required for Razorpay payment endpoints
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Do not commit `.env`; it is ignored by the repository. Never put these server secrets in `client/`.

## 5. Install dependencies and run

There is no root `package.json`, so install and run each package separately.

### Backend

```bash
cd server
npm install
npm run dev
```

The API listens on `http://localhost:5000`. The backend starts listening immediately and logs the MongoDB connection result separately.

### Frontend

In a second terminal:

```bash
cd client
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

## 6. Optional: seed demo data

Stop the backend first, then run from `server/`:

```bash
node seed.js
```

Warning: seeding permanently deletes all existing users, events, and bookings in the configured database. It creates verified demo users, events, and randomized bookings. The seeded admin login is `admin@BookMyEvent.com` / `password123`; the regular user login is `user@BookMyEvent.com` / `password123`.

## 7. Test the complete flow

1. Register a user and verify the account OTP sent by email, or use a seeded account.
2. Log in; the response token is stored by the frontend for protected requests.
3. Browse events and request a booking. A booking OTP is required.
4. For a paid event, create and verify a Razorpay order. Payment changes `paymentStatus` to `paid`, but the booking remains pending.
5. Log in as an admin and confirm or reject the booking. Confirmation decrements the event's available seats.
6. Import `BookMyEvent_Postman_Collection.json` into Postman to test the same API flow manually.

## 8. Troubleshooting

### `argument handler must be a function`

This Express error occurs while loading `server/routes/booking.js` when one imported controller is undefined. The current route requires these exports from `server/controllers/bookingController.js`: `bookEvent`, `sendBookingOTP`, `getMyBookings`, `getAllBookings`, `confirmBooking`, `cancelBooking`, and `rejectBooking`. Stop duplicate nodemon/Node processes, confirm the export exists, and restart the backend from `server/`.

### MongoDB does not connect

Check the URI, URL-encode special characters in the database password, and confirm the machine IP is allowed in Atlas Network Access.

### OTP or payment requests fail

Check `EMAIL_USER` and `EMAIL_PASS` first. Paid flows additionally require valid Razorpay keys. Free events do not require Razorpay, but booking requests still use the OTP and admin approval flow.
