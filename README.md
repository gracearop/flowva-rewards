# Flowva Rewards Platform - Technical Assessment

A full-stack implementation of the Flowva Rewards system. This project demonstrates a robust "Points & Rewards" economy using **React** and **Supabase**, with a heavy focus on database atomicity and clean architecture.

## 🚀 Live Demo
**URL:** [INSERT YOUR VERCEL/NETLIFY URL HERE]

## 🛠 Tech Stack
- **Frontend:** React (Vite), Tailwind CSS, React Router
- **Backend/Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (JWT-based)

---

## 🏗 Database Schema & Logic

The backend is built on a relational PostgreSQL schema designed for high data integrity.

### 1. The Tables
- **`profiles`**: Extends Supabase Auth users. Stores the `current_points` balance.
- **`rewards`**: Inventory of items available for redemption.
- **`transactions`**: An immutable ledger recording every point change (earned or spent) for audit purposes.

### 2. Atomic Transactions (RPC)
Instead of handling point logic in the frontend—which is prone to race conditions and security vulnerabilities—I implemented **Postgres Functions (RPC)**.
- **`redeem_reward`**: Validates the user's balance, deducts points, and logs a transaction in a single atomic operation. If any part fails, the whole transaction rolls back.
- **`add_points`**: Securely increments user balance and logs the event.

### 3. Automation with Triggers
I implemented a **Database Trigger** (`on_auth_user_created`) that automatically initializes a profile row with 0 points the moment a user signs up. This ensures the frontend never encounters a "missing profile" state.



---

## 🛡 Security (RLS)
Security is handled at the database level using **Row Level Security (RLS)**:
- **Public Access**: Users can view the rewards list without restriction.
- **Private Access**: Users can only view their own point balance and transaction history (enforced via `auth.uid() = id`).
- **Function Security**: Logic functions use `security definer` to execute controlled updates while keeping the underlying tables locked down to the `anon` key.

---

## ⚖️ Trade-offs & Assumptions
1. **Real-time Updates**: For this assessment, point balances refresh via a callback after a successful RPC call. In a production environment with high concurrency, I would use **Supabase Realtime** listeners to sync balances across multiple devices instantly.
2. **Transactional Ledger**: I assumed that every point change must be tracked. Therefore, points are never simply "updated"—they are always accompanied by a record in the `transactions` table to provide a clear audit trail.
3. **Image Hosting**: I used Unsplash URLs for reward images. For a final product, these would be hosted in a **Supabase Storage Bucket** with optimized CDN delivery.

---

## 📦 Local Setup Instructions

1. **Clone & Install**
   ```bash
   git clone <your-repo-url>
   cd flowva-rewards
   npm install