# BookMyEvent

BookMyEvent is a MERN event-booking application. Users can browse events, register and verify their accounts by email OTP, request bookings, pay through Razorpay when needed, and track booking status. Admins can create events and approve, reject, or cancel booking requests.

## What is included

- React 19 and Vite client in `client/`
- Express 5 API and Mongoose models in `server/`
- JWT authentication with user/admin role protection
- Email OTP for account verification and booking requests
- Free and paid events with seat tracking
- Razorpay order creation and signature verification
- Admin dashboard for event and booking management
- MongoDB seed script with demo users, events, and bookings

## Project layout

```text
client/                 React/Vite frontend
server/                 Express/Mongoose backend
server/controllers/     Authentication, event, booking, and payment logic
server/models/          User, event, booking, and OTP schemas
server/routes/          API route definitions
BookMyEvent_Postman_Collection.json
```

## Quick start

Prerequisites: Node.js 18+ and a MongoDB database. Email OTP requires a Gmail App Password or another SMTP-compatible account. Razorpay credentials are required only for online payment flows.

1. Configure `server/.env` using the variables in [SETUP_GUIDE.md](SETUP_GUIDE.md).
2. Install dependencies in each package:

   ```bash
   cd server
   npm install

   cd ../client
   npm install
   ```

3. Start the API in one terminal:

   ```bash
   cd server
   npm run dev
   ```

4. Start the frontend in another terminal:

   ```bash
   cd client
   npm run dev
   ```

Open the Vite URL, normally `http://localhost:5173`. The frontend currently calls the API at `http://localhost:5000/api`.

## Demo data

From `server/`, run:

```bash
node seed.js
```

This deletes existing users, events, and bookings before inserting demo data. All seeded users use `password123`; the admin account is `admin@BookMyEvent.com` and the demo user is `user@BookMyEvent.com`.

## API overview

The API is mounted at `http://localhost:5000/api`:

| Area     | Endpoints                                                                                                                 |
| -------- | ------------------------------------------------------------------------------------------------------------------------- |
| Auth     | `POST /auth/register`, `/login`, `/verify-otp`, `/forgot-password`, `/reset-password`                                     |
| Events   | `GET /events`, `GET /events/:id`, admin `POST`, `PUT`, and `DELETE /events`                                               |
| Bookings | `POST /bookings/send-otp`, `POST /bookings`, `GET /bookings/my`, admin `GET /bookings`, admin confirm/reject, user cancel |
| Payments | `POST /payments/create-order`, `POST /payments/verify`                                                                    |

All protected endpoints require `Authorization: Bearer <token>`. Import [BookMyEvent_Postman_Collection.json](BookMyEvent_Postman_Collection.json) to exercise the API.

## Troubleshooting

- `argument handler must be a function` in `server/routes/booking.js` means a controller import is undefined. The route expects `getAllBookings`, `confirmBooking`, `rejectBooking`, and the other exports from `server/controllers/bookingController.js`. Stop all old Node/nodemon processes, verify the export exists, and restart from `server/`.
- MongoDB connection errors usually mean `MONGO_URI` is missing, invalid, or blocked by the Atlas network-access rules.
- OTP emails require valid SMTP credentials. For Gmail, use an App Password rather than the normal account password.
- Razorpay errors require both `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `server/.env`.
