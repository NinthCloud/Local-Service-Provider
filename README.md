# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh


# 🛠️ Local Service Provider – Full-Stack Booking Web App

A modern, full-stack web application to connect users with local service providers. Built using **React.js**, **Node.js**, and **PostgreSQL**, this platform allows users to find, book, and manage services, while service providers can offer, update, and track their listings — all under admin supervision.

---

🌐 Live Demo
Try the fully deployed version here:
🔗 https://servicehub.up.railway.app

Features available in the live demo:

✅ User registration and login

✅ Admin dashboard for managing users/services

✅ Stripe-integrated payment flow

✅ Booking and service browsing functionality

✅ Mobile-friendly UI

## 🌟 Key Features

- 🔐 **Secure Login & Registration** (JWT & bcrypt)
- 👥 **User, Provider & Admin Roles**
- 📦 **Service Listings with Search & Filters**
- 📆 **Service Booking with PDF Confirmation**
- 🧾 **Wishlist & Booking History**
- 🧑‍💼 **Admin Panel for Moderation & Analytics**
- 🌍 **Responsive Material UI Interface**
- 🔧 **RESTful APIs with Express.js**
- 🗃️ **Structured Relational DB (PostgreSQL)**
- 💰 **Integrated payment system using stripe**

---

## 📁 Tech Stack

| Layer       | Tech                         |
|-------------|------------------------------|
| Frontend    | React.js + Material UI       |
| Backend     | Node.js + Express.js         |
| Database    | PostgreSQL                   |
| Auth        | JWT, bcrypt                  |
| Styling     | Material UI            |
| Tools       | Postman, VS Code, MYSQL workbench    |

---

## 📂 Project Structure

```bash
├── client/               # React Frontend (Material UI)
├── api/                  # Node + Express Backend
├── screenshots/          
├── public/               # Static assets
├── README.md

## 🛠️ One-Step Local Setup

Run this in your terminal:

```bash
chmod +x setup.sh
./setup.sh

## 🛠️ Quick Setup Guide

### 💻 For Windows Users:
```bash
Double-click setup.bat or run it in Command Prompt

or follow the bellow instructions

git clone https://github.com/NinthCloud/Local-Service-Provider.git
cd local-service-provider

cd server
yarn
# Add your DB credentials in .env file
yarn start


cd ../client
yarn
yarn dev

** environment variables examples
JWT_KEY = Your_secret_key
DB_NAME=your_db_name
DB_USER=your_user
DB_PASS=your_password
DB_HOST=localhost
STRIPE= your_secret_key


🧪 Testing
Unit testing: React Testing Library

API testing: Postman

Database testing: PgAdmin

Manual functional testing on Chrome

🧠 Modules Included
Authentication (JWT, Role-based)

Service Management (CRUD)

Provider Application & Approval

Wishlist, Booking, Reviews

Admin Moderation

PDF generation for bookings

🚧 Limitations

❌ No real-time chat (future feature)

❌ Moderate Admin analytics (can be enhanced)

🔮 Future Enhancements

📲 Mobile App Version

💬 In-app Messaging (Socket.io)

📍 GPS-based service filtering

🔐 Two-Factor Authentication (2FA)

📜 License
This project is for educational and commercial demo purposes. Licensing options:

Standard License (Single Project)

Extended License (SaaS / Resale)

📞 Support
For setup help or feature integration, reach out at: sd0402745@gmail.com

🙌 Credits
UI: Material UI

Backend: Express.js

DB: PostgreSQL

Tools: Postman, React DevTools
