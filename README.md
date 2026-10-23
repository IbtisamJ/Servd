# Servd 🍽️

> A mobile-first food redistribution platform connecting commercial food enterprises with verified Non-Profit Organisations (NGOs) to eliminate food waste and support communities in need.

---

## 1. Project Summary

**Servd** is a cross-platform mobile application built using React Native, Expo, and Firebase. The platform bridges the gap between food donors (supermarkets, restaurants, caterers) and community charities. 

Food enterprises can rapidly list surplus edible food with photos, quantities, and collection deadlines. Verified NGOs can browse available donations in real-time and place reservations for immediate pickup. The platform features strict role-based access control (RBAC) and administrative oversight to ensure food safety, accountability, and traceability.

---

## 2. Key Features

### 🔐 Authentication & Role-Based Access Control (RBAC)
* **Multi-Role User Management:** Distinct flows and permissions for **Admins**, **NGOs**, and **Food Enterprises**.
* **Atomic Onboarding & Rollback:** Safe batch creation across Firebase Authentication and Firestore documents, with automated cleanup if profile generation encounters network or permission faults.
* **Persistent Sessions:** Native mobile session handling using `@react-native-async-storage/async-storage` to keep users logged in securely across app launches.

### 🏢 Food Enterprise Portal
* **Donation Creation:** Enter food titles, descriptions, quantities, expiry windows, and pickup addresses.
* **Media Uploads:** Integrated photo capturing and selection powered by Cloudinary unsigned uploads, delivering optimized HTTPS image links without paid infrastructure locks.
* **Listing Management:** Real-time visibility into active and completed food listings.

### 🤝 NGO Discovery & Reservation Flow
* **Live Donation Feed:** View available donations formatted with clear item details and photos.
* **Vetted Reservations:** Strict Firestore security enforcement preventing unverified or pending NGOs from claiming food items until vetted by an administrator.

### 🛡️ Administrative Dashboard & Security
* **NGO Verification System:** Admin panel to review NPO registration details and approve or reject accounts.
* **Zero-Trust Firestore Security Rules:** Server-side validation preventing privilege escalation, cross-role tampering, unauthenticated data reads, and donation spoofing.

---

## 3. Technology Stack

* **Frontend:** React Native, Expo Router, TypeScript
* **State & Persistence:** React Hooks, `@react-native-async-storage/async-storage`
* **Backend & Database:** Firebase Authentication, Cloud Firestore
* **Image Hosting:** Cloudinary (Unsigned Mobile API via `expo-image-picker`)
* **Security:** Firebase Security Rules (RBAC, atomic validation)

---

## 4. Application Screenshots

MUST STILL BE ADDED!

---

## 5. Links

* **Source Code Repository:** [https://github.com/IbtisamJ/Servd](https://github.com/IbtisamJ/Servd)
* **Demo Video:** MUST STILL BE ADDED*

---

## 6. Project Limitations & Future Enhancements

* **Push Notifications:** The current version relies on live Firestore reactive snapshot listeners for feed updates. Native OS push notifications (e.g., via Expo Notifications) for reservation alerts are earmarked for subsequent releases.
* **Turn-by-Turn GPS Navigation:** Collection points display formatted text pickup addresses. Future iterations will integrate interactive map SDKs (such as Google Maps or Mapbox) with live routing.
* **Offline Mutations:** While data reads benefit from local device caching, donation creation and reservation claims require an active internet connection to ensure inventory consistency.


---

## 7. Getting Started

### Prerequisites
* Node.js (v18 or higher)
* npm or yarn
* Expo Go app installed on an Android or iOS device (or an emulator)

### Installation & Run

1. Clone the repository:
   ```bash
   git clone [https://github.com/IbtisamJ/Servd.git](https://github.com/IbtisamJ/Servd.git)
   cd Servd
