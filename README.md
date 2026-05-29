# CredGuard Core — Recovery & Loan Intelligence System
### Deployment & Mobile Application Integration Guide

This guide describes how to deploy the **CredGuard Core** microservices engine and integrate it directly with consumer-facing mobile banking and loan apps (iOS & Android).

---

## 📅 Part 1: System Overview & Architecture

CredGuard Core serves as the high-availability security brain, risk auditor, and overdue recovery workspace. It bridges operational staff (loan operators, recovery agents) with active client mobile applications:

1. **KyC & Multi-Device Monitoring**: The system listens to signals from client mobile applications, detecting concurrent IPs, device IDs, and spoofed coordinates.
2. **Sequential Proximity Tracking**: Calculates sequential movement distance (using the Haversine formula) between successive login locations to flag impossible travel behaviors (VPN frauds, shared device harvesting).
3. **Instant Settlements Pipeline**: Communicates with gateways (like Paystack or Flutterwave) to update ledger states and log repayment events instantly.

---

## 🚀 Part 2: Deployment Guide

### Option A: Local Dev & Quick Start

1. **Configure Environment Variables**:
   Create a `.env` file in the root:
   ```env
   # .env
   PORT=3000
   GEMINI_API_KEY=your_gemini_api_key_here
   NODE_ENV=development
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start the Express-Vite Development Workspace**:
   ```bash
   npm run dev
   ```
   *This starts the live-reloaded server on `http://localhost:3000` via `tsx`.*

---

### Option B: Production Compilation (Node.js)

To compile the application as a standalone, ultra-performing Node process, use the bundled build script:

1. **Compile Front-End and Back-End Bundle**:
   ```bash
   npm run build
   ```
   *This builds the React static files into `dist/` and compiles `server.ts` into a native CommonJS output `dist/server.cjs` via `esbuild`.*

2. **Boot Standalone Cluster**:
   ```bash
   NODE_ENV=production npm start
   ```

---

### Option C: Docker Containerization

The included `Dockerfile` is optimized to execute multi-stage, high-performance builds.

1. **Build Container Image**:
   ```bash
   docker build -t credguard-core:latest .
   ```

2. **Run Container**:
   ```bash
   docker run -d \
     -p 3000:3000 \
     -e GEMINI_API_KEY="your_api_key" \
     -e NODE_ENV="production" \
     --name credguard-srv \
     credguard-core:latest
   ```

---

### Option D: Kubernetes Deployment

For high-availability orchestration, use the configured `k8s-deployment.yaml`:

```bash
# Apply ConfigMap, Secrets, and Deployments to your K8s cluster:
kubectl apply -f k8s-deployment.yaml

# Monitor Rollout status:
kubectl rollout status deployment/credguard-core
```

---

## 📲 Part 3: Mobile App Integration steps

To integrate the mobile client app with CredGuard Core, follow these step-by-step instruction sets for your development team:

### Step 1: Authentication & Device Token Registration
When a borrower logs in via the iOS/Android mobile client, the app must authenticate them and retrieve a JWT authentication token from CredGuard Core.

* **API Endpoint**: `POST /api/auth/login`
* **Network Payload**:
```json
{
  "email": "borrower.email@example.com",
  "password": "borrower_secure_password"
}
```
* **Success JSON Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5...",
  "borrower": {
    "id": "bor_01",
    "name": "Adebayo Chukwuma",
    "email": "adebayo.c@example.com"
  }
}
```

* **Action for Mobile App**: Save the `token` securely inside secure keychains (`Keychain Services` for iOS or `EncryptedSharedPreferences` for Android).

---

### Step 2: Periodic Geolocation & Core Session Reporting
To monitor VPN fraud and track sequential session points, the mobile application must transmit telemetry events to the core registry. 

#### A. Trigger Interval
Transmit geolocation signals under these scenarios:
1. Immediately upon successful application boot and user login.
2. Every **15 minutes** while the application is active in the foreground.
3. Upon initiating major financial operations (e.g., Requesting a Loan extension or Submitting Repayment).

#### B. API Payload Structure
Transmit `POST /api/sessions/log` containing real-time telemetry:

* **Endpoint**: `POST /api/sessions/log`
* **Authorization Header**: `Bearer <token>`
* **HTTP Body Content**:
```json
{
  "borrowerId": "bor_01",
  "ipAddress": "197.210.8.23",
  "latitude": 6.5244,
  "longitude": 3.3792,
  "deviceId": "Android-HD92-8812",
  "os": "Android 14",
  "browser": "Mobile App API Client v2.4",
  "vpnUsed": false
}
```

#### C. Distance Logic Execution
Once reported, CredGuard's internal algorithms evaluate the mathematical distance between sequential coordinates. Given sequential point $A(\phi_1, \lambda_1)$ and $B(\phi_2, \lambda_2)$, distance is processed via the **Haversine formula**:

$$d = 2 R \arcsin \left( \sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)} \right)$$

*Where $R = 6371\text{ km}$, $\Delta\phi = \phi_2 - \phi_1$, and $\Delta\lambda = \lambda_2 - \lambda_1$.*

If successive coordinates reveal impossible physical speeds (e.g., $d > 50\text{ km}$ spanned inside 5 minutes), the backend triggers a high-level `RiskAlert` dashboard notification and returns a session restriction token.

---

### Step 3: Triggering Loan Reminders & Notifications
Remind clients of upcoming schedules directly within the consumer app or invoke external notification gateways:

* **API Endpoint**: `POST /api/notifications/trigger`
* **JSON Payload**:
```json
{
  "borrowerId": "bor_01",
  "reminderType": "OverdueWarning"
}
```
* **System Action**: Immediately logs a reminder sequence on the admin control panel, sending a push notice to the connected device.

---

### Step 4: Real-Time Payments & Repayment Operations
When the client successfully satisfies a repayment obligation via the integrated checkout gateway (e.g. Paystack / Card Flutterwave):

* **API Endpoint**: `POST /api/payments`
* **JSON Payload**:
```json
{
  "loanId": "loan_101",
  "amount": 186666,
  "gateway": "Paystack",
  "reference": "pstk_mob_8172648"
}
```
* **Success Output**: The system applies the exact amount to the selected loan contract, updates the active ledger indices, and changes the record status flag to `Paid` once fully settled.

---

### 🛡️ Step 5: Mobile App Compliance & Security Policies
Ensure the mobile app complies with consumer protection laws (GDPR / NDPR):
1. **Explicit Consent Prompt**: Explicitly ask the user to authorize device metadata logging to help prevent VPN fraud before starting trackers.
2. **Fallback State**: If location access is blocked by OS level permissions, request standard coarse network IP location markers for minimal ledger tracking.
