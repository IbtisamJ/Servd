# Servd 🍽️❤️

> **Surplus food, shared.** A mobile app that connects food enterprises with verified NGOs, so good food reaches the communities who need it instead of going to waste.

Built for the **ITMDA** module, 2026.

---

## Summary

Every day, food businesses end up with surplus food that is still safe to eat. At the same time, NGOs are looking for food donations for the people they serve. **Servd** links the two.

Food enterprises list their surplus food as donations. Verified NGOs browse what is available nearby and reserve it for collection. Administrators verify NGOs and keep an eye on the whole platform. Every donation moves through a clear life cycle (*Available → Reserved → Collected*, or *Expired / Cancelled*), so everyone always knows where the food is.

---

## Key Features

### 🏪 Food Enterprises
- Register and log in as a food enterprise
- Create a donation (food name, category, description, quantity, collection location, collection deadline and expiry date)
- Edit or cancel a donation
- See the status of each donation and whether an NGO has reserved it

### 🤝 NGOs
- Register with organisation details and NPO number
- Verification status: *Pending → Approved / Rejected*
- Only **approved** NGOs can reserve food
- Browse available donations and view full details
- Reserve a donation and track reservations

### 🛡️ Administrators
- Dashboard with platform totals (pending NGO approvals, active donations, active reservations, registered users)
- Review, search and filter NGO applications, then approve or reject them
- View and manage donation records, filtered by status
- Manage enterprises, reservations and users

### 🔐 Security and accounts
- Email and password authentication (Firebase Authentication)
- Role-based access: **Enterprise**, **NGO** and **Admin**
- Firestore security rules enforce the roles on the server. For example, nobody can register as an admin, an NGO cannot approve itself, and unverified NGOs cannot reserve food
- Input validation and clear error messages on registration and login
- Login is remembered between app launches

---

## Screenshots

### Getting started and registration
| Splash | Login | Reset password | Create account | Organisation details | Account created |
|:---:|:---:|:---:|:---:|:---:|:---:|
| <img src="https://github.com/user-attachments/assets/4b191dec-126d-4df6-a07a-d4fad2a7d572" width="125" alt="Splash"> | <img src="https://github.com/user-attachments/assets/55f9c29d-fa37-4dd2-b28e-efd15499032f" width="125" alt="Login"> | <img src="https://github.com/user-attachments/assets/e4d0b235-6db3-4878-8150-2a74800ddbfd" width="125" alt="Reset password"> | <img src="https://github.com/user-attachments/assets/5493742a-ec6e-4eae-be1f-27a7ae50513a" width="125" alt="Create account"> | <img src="https://github.com/user-attachments/assets/168e3e45-58f8-4f1d-8b47-b93dd6579240" width="125" alt="Organisation details"> | <img src="https://github.com/user-attachments/assets/ed7d14fb-2468-41f6-a981-6ce435238d0d" width="125" alt="Account created"> |

### NGO experience
| Pending approval | NGO dashboard | Verification status | Available donations | Donation details |
|:---:|:---:|:---:|:---:|:---:|
| <img src="https://github.com/user-attachments/assets/848e6b7d-e36c-4a67-ab76-3e6db771c5dd" width="135" alt="Pending approval"> | <img src="https://github.com/user-attachments/assets/9e18ba9e-bb17-42b6-be5d-80ddf71669d0" width="135" alt="NGO dashboard"> | <img src="https://github.com/user-attachments/assets/372b80ee-e453-41ec-95f8-25adfc3555c4" width="135" alt="Verification status"> | <img src="https://github.com/user-attachments/assets/82a338da-35ef-4ccd-b6e7-3fd87465d53d" width="135" alt="Available donations"> | <img src="https://github.com/user-attachments/assets/f9b072bd-65b3-4651-a468-8e501d238bc5" width="135" alt="Donation details"> |

### Admin experience
| Admin dashboard | NGO management | Donations management | More admin features |
|:---:|:---:|:---:|:---:|
| <img src="https://github.com/user-attachments/assets/6d5be392-b026-4012-96e4-8d40ce666a45" width="150" alt="Admin dashboard"> | <img src="https://github.com/user-attachments/assets/83c3f116-8a5d-463c-86e0-e7b9a6b4f804" width="150" alt="NGO management"> | <img src="https://github.com/user-attachments/assets/abebf968-bfdb-428f-8469-19eef0858be8" width="150" alt="Donations management"> | <img src="https://github.com/user-attachments/assets/f4e8d92d-9d1b-41f1-be5b-962c4c3400b3" width="150" alt="More admin features"> |

---

## Demo Video

▶️ **Watch the demo:** [ADD DEMO VIDEO LINK HERE]

The demo walks through the full flow: a food enterprise registers and creates a donation, an admin approves an NGO, the NGO reserves the donation, and the enterprise sees the updated status.

---

## Source Code

🔗 **GitHub repository:** https://github.com/IbtisamJ/Servd

---

## Tech Stack

| Area | Technology |
|---|---|
| App | React Native with Expo and Expo Router |
| Language | TypeScript |
| Authentication | Firebase Authentication (email and password) |
| Database | Cloud Firestore |
| Access control | Firestore Security Rules |
| Storage | Firebase Storage (configured) |

---

## Getting Started

**You will need:** [Node.js](https://nodejs.org), [Git](https://git-scm.com), and the Expo Go app on your phone (optional).

```bash
# 1. Clone the project
git clone https://github.com/IbtisamJ/Servd.git
cd Servd

# 2. Install dependencies
npm install

# 3. Start the app
npm start
```

Then press **`w`** to open it in a browser, or scan the QR code with **Expo Go** (your phone and computer must be on the same Wi-Fi).

The Firebase configuration is in `src/config/firebase.ts`, so no `.env` file is needed.

> **Windows PowerShell:** if `npm` is blocked, run `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`, or use Command Prompt.

### Try it out
Register a new Food Enterprise or NGO account from the app. Admin accounts cannot be created in the app. They are created manually in the Firebase console.

---

## Project Structure

```
src/
├── app/          # Screens and navigation (Expo Router)
├── components/   # Reusable UI components
├── config/       # Firebase setup
├── constants/    # Shared roles, statuses, collection names, and theme
├── hooks/        # useAuth: current user, role and NGO status
└── services/     # authService: register, login, logout, validation
firestore.rules   # Firestore security rules
```

---

## Data Model

| Collection | Purpose |
|---|---|
| `users` | Every account: name, email, role, account status |
| `ngos` | NGO details: organisation name, NPO number, contact info, verification status |
| `foodEnterprises` | Enterprise details: enterprise name, contact info |
| `donations` | Surplus food listings and their status |
| `reservations` | Links an NGO to a donation |

**Statuses**
- NGO verification: `pending` → `approved` / `rejected`
- Donation: `available` → `reserved` → `collected` (or `expired` / `cancelled`)
- Reservation: `active` → `collected` / `cancelled`

---

## Limitations

- **Manual NGO verification:** an administrator checks each NGO by hand. There is no automatic check of NPO numbers.
- **No email verification:** accounts are not confirmed through an email link at sign-up.
- **No offline support:** the app needs an internet connection.
- **Testing was manual:** features were tested by hand and the results are in our testing document. There are no automated tests.
- **Firebase free tier:** the project is built for demonstration and student-scale use.

### Possible future work
- Push notifications for new, reserved and collected donations
- Maps and distance search for collection locations
- Ratings and impact reporting (for example, kilograms of food saved)
- Automatic NPO verification

---

## Team

| Name | Role |
|---|---|
| Sarah Armien | [ADD ROLE] |
| Ethan Swart | [ADD ROLE] |
| Helmer Carlos Morgado | [ADD ROLE] |
| Ibtisam Jaffer | [ADD ROLE] |
| Thaakirah Enos | [ADD ROLE] |
| Raabiah Adams | Authentication, user roles and Firestore security rules |

---

*Good food deserves to be shared.*
