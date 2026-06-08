# CredGuard Loan Recovery & Risk Intelligence System
## Core REST API Specification & Integration Guide (v1.2.0-stable)

Welcome to the **CredGuard REST API** developer documentation. CredGuard is an enterprise-grade Credit Management, Risk Heuristics, and Automated Recovery Orchestration engine designed for banks, digital lenders, and microfinance institutions. This reference matches the active implementation of your container environment.

---

## 1. Overview & Connection Architecture

### Production URL
`https://ais-dev-g2hlkbu6hmb3svafx5wuhf-50487580477.europe-west2.run.app`

### Sandboxed Testing URL
`https://ais-dev-g2hlkbu6hmb3svafx5wuhf-50487580477.europe-west2.run.app/api`

### Connection Environments
- **Sandbox Environment (Test Mode):** Connect to `/api` over TLS with sandbox test credentials (`cg_test_*`). This connects to our isolated test ledger where transactions, virtual webhooks, or compliance logs can be safely simulated.
- **Production Environment (Live Mode):** Direct live records routing using your high-privilege credentials (`cg_live_*`).

---

## 2. Authentication & Authorization Guide

All API requests must pass authentication via custom HTTP Header credentials.
CredGuard supports **Bearer Token Auth** flow. Secure your keys inside backend environments; never expose key elements inside front-end client bundles.

```http
Authorization: Bearer <your_developer_key_or_license>
Content-Type: application/json
```

| Environment | Managed Token Key Reference | Behavior |
| :--- | :--- | :--- |
| **Sandbox (Telemetry / Mock)** | `cg_test_5f18d72ae5cf438bb36130636cd4f91d` | Connects directly to test ledger. Virtual sweeps simulated. |
| **Production (Live)** | `cg_live_9a3c8e10df22472ba5670891d966036f` | Live financial telemetry syncing. Real-time notifications. |
| **Master License Sign-off** | `CG-M202606-A1B2C3D4` | Tenant container system-level registration lease signature. |

---

## 3. Global Policies

### Rate Limiting Policy
CredGuard implements strict sliding-window rate limiting on all endpoints to defend backend threads against ddos or extraction attempts.

- **Sandbox API:** Max **100 requests per minute** per developer API key. Returns HTTP `429 Too Many Requests`.
- **Production API:** Max **500 requests per minute** per enterprise key. Escalated on dedicated instances.
- **Dunning Sweeps / Geolocation Broadcasts:** Bound to async background workers.

```json
{"error": "Rate limit exceeded. Retry again in 18 seconds.", "retryAfter": 18}
```

### Response Status Codes
CredGuard strictly abides by standard HTTP status specifications:

| Status Code | Literal Meaning | Triggering Context |
| :--- | :--- | :--- |
| `200 OK` | Transaction Succeeded | General queries, scorecards, dynamic simulations. |
| `201 Created` | Ledger Appended | New borrower, loan record, or privacy consent added. |
| `400 Bad Request` | Constraint Mismatch | Mandatory property missing, negative currency integers. |
| `401 Unauthorized` | Key Mismatch | Bearer Token missing or license key lease expired. |
| `402 Payment Required` | Tenant Lockout | Operating balance empty or trial period lapsed. |
| `403 Forbidden` | Privilege Mismatch | Standard user requesting admin db SQL write accesses. |
| `404 Not Found` | Identity Missing | borrowerId or loanId does not match records. |
| `429 Too Many Requests`| Speed Limit Flipped | Rate limiter bucket capacity drained. |
| `500 Server Error` | System Failure | Database or Gemini generation thread timed out. |

### Standard Error Format
```json
{
  "success": false,
  "error": "Required fields missing. 'name' and 'email' are mandatory properties.",
  "code": "CONSTRAINT_MISMATCH",
  "requestId": "req_88f910bd6b",
  "timestamp": "2026-06-08T10:40:00Z"
}
```

---

## 4. REST API Endpoint Reference

### [Endpoint 1] POST /borrowers
**Purpose:** Registers corporate or retail borrower profiles on the ledgers, verifying identity metrics and setting base telemetry.

- **Endpoint URL:** `https://ais-dev-g2hlkbu6hmb3svafx5wuhf-50487580477.europe-west2.run.app/api/borrowers`
- **HTTP Method:** `POST`
- **Requires Authentication:** Yes (Bearer token)
- **Headers:**
  - `Authorization: Bearer cg_test_5f18d72ae5cf438bb36130636cd4f91d`
  - `Content-Type: application/json`

#### Parameters
| Parameter | Type | Required | Range/Constraints | Description / Example |
| :--- | :--- | :--- | :--- | :--- |
| `name` | string | Yes | 3-80 chars | Legal Name (e.g., `Adebayo Chukwuma`) |
| `email` | string | Yes | Valid email | Email Address (e.g., `adebayo.c@yahoo.com`) |
| `phone` | string | No | Numeric string | Local mobile (e.g., `+2348031234567`) |
| `company` | string | No | Chars | Registrant business (e.g., `Nirvana Retail Ltd`) |
| `kycStatus` | string | No | 'Pending'\|'Verified' | Verification checkpoint (defaults to `'Verified'`) |

#### Output Manifestations & Code Snippets

::: details Request Payload (JSON)
```json
{
  "name": "Sarah Jenkins",
  "email": "sarah.jenkins@gmail.com",
  "phone": "+2348098765432",
  "company": "SJ Global Logistics",
  "kycStatus": "Verified"
}
```
:::

::: details Success Response Payload (201 Created)
```json
{
  "id": "bor_1720459381",
  "name": "Sarah Jenkins",
  "email": "sarah.jenkins@gmail.com",
  "phone": "+2348098765432",
  "company": "SJ Global Logistics",
  "kycStatus": "Verified",
  "createdAt": "2026-06-08T10:41:00Z"
}
```
:::

::: details Error Response Payload (400 Bad Request)
```json
{
  "error": "Required fields missing. 'name' and 'email' are mandatory properties."
}
```
:::

#### Multi-Language Code References

*   **cURL Shell:**
    ```bash
    curl -X POST https://ais-dev-g2hlkbu6hmb3svafx5wuhf-50487580477.europe-west2.run.app/api/borrowers \
      -H "Authorization: Bearer cg_test_5f18d72ae5cf438bb36130636cd4f91d" \
      -H "Content-Type: application/json" \
      -d '{"name": "Sarah Jenkins", "email": "sarah.jenkins@gmail.com", "phone": "+2348098765432", "company": "SJ Global Logistics"}'
    ```
*   **Postman Request:**
    - Method: `POST`
    - URL: `https://ais-dev-g2hlkbu6hmb3svafx5wuhf-50487580477.europe-west2.run.app/api/borrowers`
    - Headers: `Authorization: Bearer {{token}}`, `Content-Type: application/json`
    - Body (raw, JSON): Same as payload.
*   **JavaScript (Fetch):**
    ```javascript
    fetch('https://ais-dev-g2hlkbu6hmb3svafx5wuhf-50487580477.europe-west2.run.app/api/borrowers', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer cg_test_5f18d72ae5cf438bb36130636cd4f91d',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: "Sarah Jenkins",
        email: "sarah.jenkins@gmail.com",
        company: "SJ Global Logistics"
      })
    })
    .then(r => r.json())
    .then(console.log);
    ```
*   **Kotlin (Android):**
    ```kotlin
    val client = OkHttpClient()
    val mediaType = "application/json; charset=utf-8".toMediaType()
    val body = "{\"name\":\"Sarah Jenkins\",\"email\":\"sarah.jenkins@gmail.com\",\"company\":\"SJ Global Logistics\"}".toRequestBody(mediaType)
    val request = Request.Builder()
        .url("https://ais-dev-g2hlkbu6hmb3svafx5wuhf-50487580477.europe-west2.run.app/api/borrowers")
        .post(body)
        .addHeader("Authorization", "Bearer cg_test_5f18d72ae5cf438bb36130636cd4f91d")
        .addHeader("Content-Type", "application/json")
        .build()
    client.newCall(request).execute().use { response -> 
        println(response.body?.string())
    }
    ```
*   **Swift (iOS):**
    ```swift
    import Foundation
    var r = URLRequest(url: URL(string: "https://ais-dev-g2hlkbu6hmb3svafx5wuhf-50487580477.europe-west2.run.app/api/borrowers")!)
    r.httpMethod = "POST"
    r.setValue("Bearer cg_test_5f18d72ae5cf438bb36130636cd4f91d", forHTTPHeaderField: "Authorization")
    r.setValue("application/json", forHTTPHeaderField: "Content-Type")
    let dict = ["name": "Sarah Jenkins", "email": "sarah.jenkins@gmail.com", "company": "SJ Global Logistics"]
    r.httpBody = try? JSONSerialization.data(withJSONObject: dict)
    URLSession.shared.dataTask(with: r) { d, _, _ in 
       if let data = d { print(String(data: data, encoding: .utf8)!) }
    }.resume()
    ```

---

### [Endpoint 2] GET /borrowers/{borrowerId}
**Purpose:** Fetches legal metadata, profile details, registration timestamps, and current KYC checkpoint flags for a specific borrower.

- **Endpoint URL:** `https://ais-dev-g2hlkbu6hmb3svafx5wuhf-50487580477.europe-west2.run.app/api/borrowers/{borrowerId}`
- **HTTP Method:** `GET`
- **Requires Authentication:** Yes (Bearer token)
- **Headers:** `Authorization: Bearer <key>`

#### Parameters
| Parameter | Type | Required | Format | Description / Example |
| :--- | :--- | :--- | :--- | :--- |
| `borrowerId` | string | Yes | Path Segment | Unique identifier starting with `bor_` |

#### Output Manifestations & Code Snippets

::: details Success Response Payload (200 OK)
```json
{
  "id": "bor_01",
  "name": "Adebayo Chukwuma",
  "email": "adebayo.c@yahoo.com",
  "phone": "+2348034509122",
  "company": "Chukwuma Retail Ltd",
  "kycStatus": "Verified",
  "createdAt": "2026-05-24T09:30:00Z",
  "payoutConsistency": 92
}
```
:::

::: details Error Response Payload (404 Not Found)
```json
{
  "error": "Borrower identity not found. Please check of the id value."
}
```
:::

#### Multi-Language Code References

*   **cURL Shell:**
    ```bash
    curl -X GET https://ais-dev-g2hlkbu6hmb3svafx5wuhf-50487580477.europe-west2.run.app/api/borrowers/bor_01 \
      -H "Authorization: Bearer cg_test_5f18d72ae5cf438bb36130636cd4f91d"
    ```
*   **JavaScript:**
    ```javascript
    fetch('https://ais-dev-g2hlkbu6hmb3svafx5wuhf-50487580477.europe-west2.run.app/api/borrowers/bor_01', {
      headers: { 'Authorization': 'Bearer cg_test_5f18d72ae5cf438bb36130636cd4f91d' }
    }).then(r => r.json()).then(console.log);
    ```

---

### [Endpoint 3] POST /risk/score
**Purpose:** Formulates unified scorecards containing risk band groupings, overdue metrics, outstanding liability weights, and payout validation parameters.

- **Endpoint URL:** `https://ais-dev-g2hlkbu6hmb3svafx5wuhf-50487580477.europe-west2.run.app/api/risk/score`
- **HTTP Method:** `POST`
- **Requires Authentication:** Yes
- **Headers:** `Authorization: Bearer <key>`, `Content-Type: application/json`

#### Parameters
| Parameter | Type | Required | Format | Description / Example |
| :--- | :--- | :--- | :--- | :--- |
| `borrowerId` | string | Yes | JSON property | Target borrower record id (e.g., `bor_01`) |

#### Output Manifestations & Code Snippets

::: details Request Payload (JSON)
```json
{
  "borrowerId": "bor_01"
}
```
:::

::: details Success Response Payload (200 OK)
```json
{
  "success": true,
  "borrowerId": "bor_01",
  "borrowerName": "Adebayo Chukwuma",
  "riskScore": 65,
  "riskBand": "HIGH",
  "analytics": {
    "totalOutstanding": 4500,
    "overdueCount": 1,
    "kycStatus": "Verified",
    "payoutConsistency": 92
  },
  "computations": [
    "1 active overdue or default loan instance(s) flagged on profile."
  ],
  "assessmentDate": "2026-06-08T10:41:40Z"
}
```
:::

::: details Error Response Payload (404 Not Found)
```json
{
  "error": "Borrower identity could not be resolved."
}
```
:::

#### Multi-Language Code References

*   **cURL Shell:**
    ```bash
    curl -X POST https://ais-dev-g2hlkbu6hmb3svafx5wuhf-50487580477.europe-west2.run.app/api/risk/score \
      -H "Authorization: Bearer cg_test_5f18d72ae5cf438bb36130636cd4f91d" \
      -H "Content-Type: application/json" \
      -d '{"borrowerId": "bor_01"}'
    ```
*   **JavaScript:**
    ```javascript
    fetch('https://ais-dev-g2hlkbu6hmb3svafx5wuhf-50487580477.europe-west2.run.app/api/risk/score', {
      method: "POST",
      headers: { 
        "Authorization": "Bearer cg_test_5f18d72ae5cf438bb36130636cd4f91d",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ borrowerId: "bor_01" })
    }).then(r => r.json()).then(console.log);
    ```

---

### [Endpoint 4] POST /loans
**Purpose:** Disburses or indexes amortised corporate loan facilities under designated borrower records and configures dynamic interest payment schedules.

- **Endpoint URL:** `https://ais-dev-g2hlkbu6hmb3svafx5wuhf-50487580477.europe-west2.run.app/api/loans`
- **HTTP Method:** `POST`
- **Requires Authentication:** Yes
- **Headers:** `Authorization: Bearer <key>`, `Content-Type: application/json`

#### Parameters
| Parameter | Type | Required | Constraints | Description / Example |
| :--- | :--- | :--- | :--- | :--- |
| `borrowerId` | string | Yes | Matches database | Borrower identifier (`bor_01`) |
| `amount` | number | Yes | Float > 0 | Principal amount (e.g., `5000`) |
| `interestRate` | number | No | Default: 10 | Annual Percentage Rate interest percentage (e.g., `12`) |
| `durationMonths`| number | No | Default: 3 | Schedule amortisation length in months (e.g., `3`) |

#### Output Manifestations & Code Snippets

::: details Request Payload (JSON)
```json
{
  "borrowerId": "bor_01",
  "amount": 2500,
  "interestRate": 12,
  "durationMonths": 3
}
```
:::

::: details Success Response Payload (211 Created)
```json
{
  "id": "loan_1720459999",
  "borrowerId": "bor_01",
  "borrowerName": "Adebayo Chukwuma",
  "amount": 2500,
  "interestRate": 12,
  "startDate": "2026-06-08T10:41:00Z",
  "dueDate": "2026-09-08T10:41:00Z",
  "amountPaid": 0,
  "latePenalties": 0,
  "status": "Active",
  "repaymentSchedule": [
    { "dueDate": "2026-07-08T10:41:00Z", "amount": 934, "paid": false },
    { "dueDate": "2026-08-08T10:41:00Z", "amount": 934, "paid": false },
    { "dueDate": "2026-09-08T10:41:00Z", "amount": 934, "paid": false }
  ]
}
```
:::

#### Multi-Language Code References

*   **cURL Shell:**
    ```bash
    curl -X POST https://ais-dev-g2hlkbu6hmb3svafx5wuhf-50487580477.europe-west2.run.app/api/loans \
      -H "Authorization: Bearer cg_test_5f18d72ae5cf438bb36130636cd4f91d" \
      -H "Content-Type: application/json" \
      -d '{"borrowerId": "bor_01", "amount": 2500, "interestRate": 12, "durationMonths": 3}'
    ```

---

### [Endpoint 5] GET /loans/{loanId}
**Purpose:** Fetches the running balance, legal covenants, settlement schedules, and payment allocation parameters for a loan contract.

- **Endpoint URL:** `https://ais-dev-g2hlkbu6hmb3svafx5wuhf-50487580477.europe-west2.run.app/api/loans/{loanId}`
- **HTTP Method:** `GET`
- **Requires Authentication:** Yes

#### Parameters
| Parameter | Type | Required | Format | Description / Example |
| :--- | :--- | :--- | :--- | :--- |
| `loanId` | string | Yes | Path segment | Loan unique ID starting with `loan_` |

#### Output Manifestations & Code Snippets

::: details Success Response Payload (200 OK)
```json
{
  "id": "loan_01",
  "borrowerId": "bor_01",
  "borrowerName": "Adebayo Chukwuma",
  "amount": 2500,
  "interestRate": 12,
  "startDate": "2026-05-24T09:30:00Z",
  "dueDate": "2026-08-24T09:30:00Z",
  "amountPaid": 500,
  "latePenalties": 50,
  "status": "Active",
  "repaymentSchedule": [
    { "dueDate": "2026-06-24T09:30:00Z", "amount": 934, "paid": true }
  ]
}
```
:::

::: details Error Response (404 Not Found)
```json
{
  "error": "Loan instance not found on the systems ledger database."
}
```
:::

---

### [Endpoint 6] POST /recovery/trigger
**Purpose:** Manual or API-originated activation of the dunning sequences, digital communication broadcasts, dunning notes logging, or active agent transfer commands for delinquent/overdue agreements.

- **Endpoint URL:** `https://ais-dev-g2hlkbu6hmb3svafx5wuhf-50487580477.europe-west2.run.app/api/recovery/trigger`
- **HTTP Method:** `POST`
- **Requires Authentication:** Yes
- **Headers:** `Authorization: Bearer <key>`, `Content-Type: application/json`

#### Parameters
| Parameter | Type | Required | Format/Enum | Description / Example |
| :--- | :--- | :--- | :--- | :--- |
| `loanId` | string | Yes | Valid system loan_ | Target delinquent loan reference (e.g., `loan_01`) |
| `actionType`| string | Yes | `'DUNNING_SMS'`\|`'DUNNING_EMAIL'`\|`'LEGAL_LETTER'` | The explicit dunning channel command |
| `note` | string | No | Chars | Notes to append inside collector audit trail |
| `agentName` | string | No | Chars | Assign collector agent (defaults to `'AI AutoDUN Agent'`) |

#### Output Manifestations & Code Snippets

::: details Request Payload (JSON)
```json
{
  "loanId": "loan_01",
  "actionType": "DUNNING_SMS",
  "note": "Borrower failed to satisfy installment overdue. Escalated collection.",
  "agentName": "Chinedu Okafor"
}
```
:::

::: details Success Response Payload (200 OK)
```json
{
  "success": true,
  "message": "Recovery action pipeline initiated successfully.",
  "actionDetails": {
    "caseId": "case_1720459000",
    "loanId": "loan_01",
    "actionLogged": "DUNNING_SMS",
    "agentAssigned": "Chinedu Okafor",
    "newCaseStage": "Dunning",
    "timestamp": "2026-06-08T10:41:00Z"
  }
}
```
:::

#### Multi-Language Code References

*   **cURL Shell:**
    ```bash
    curl -X POST https://ais-dev-g2hlkbu6hmb3svafx5wuhf-50487580477.europe-west2.run.app/api/recovery/trigger \
      -H "Authorization: Bearer cg_test_5f18d72ae5cf438bb36130636cd4f91d" \
      -H "Content-Type: application/json" \
      -d '{"loanId": "loan_01", "actionType": "DUNNING_SMS", "note": "Failed installment"}'
    ```

---

### [Endpoint 7] POST /events
**Purpose:** Event ingest port for upstream system logs, payments webhooks from platforms (e.g., Stripe, Paystack), or telemetry logs.

- **Endpoint URL:** `https://ais-dev-g2hlkbu6hmb3svafx5wuhf-50487580477.europe-west2.run.app/api/events`
- **HTTP Method:** `POST`
- **Requires Authentication:** Yes

#### Parameters
| Parameter | Type | Required | Format | Description / Example |
| :--- | :--- | :--- | :--- | :--- |
| `eventType` | string | Yes | Namespace style | Action label (e.g., `repayment.success`, `ptp.broken`) |
| `payload` | object | Yes | Key-value dictionary| Explicit event context metadata |
| `timestamp` | string | No | ISO 8601 string | Occurrence timestamp |

#### Output Manifestations & Code Snippets

::: details Request Payload (JSON)
```json
{
  "eventType": "repayment.success",
  "payload": {
    "loanId": "loan_01",
    "amount": 500,
    "gateway": "Paystack",
    "reference": "pst_90fa8d7aefec"
  },
  "timestamp": "2026-06-08T10:40:00Z"
}
```
:::

::: details Success Response Payload (200 OK)
```json
{
  "success": true,
  "eventId": "evt_1720459123",
  "eventType": "repayment.success",
  "processed": true,
  "timestamp": "2026-06-08T10:41:00Z",
  "verificationSignature": "a4d3f576be89ce7cf320daef7d3945de68f237f86d87e02b89f81dfbcafb0e9c"
}
```
:::

---

### [Endpoint 8] POST /fraud/analyze
**Purpose:** Runs real-time velocity threat-modelling, commercial proxy checkpoints, location hops, and device consistency checks.

- **Endpoint URL:** `https://ais-dev-g2hlkbu6hmb3svafx5wuhf-50487580477.europe-west2.run.app/api/fraud/analyze`
- **HTTP Method:** `POST`
- **Requires Authentication:** Yes

#### Parameters
| Parameter | Type | Required | Description / Example |
| :--- | :--- | :--- | :--- |
| `borrowerId` | string | Yes | Target borrower trace identifier (`bor_01`) |
| `ipAddress` | string | Yes | External request socket IP address (`102.89.34.89`) |
| `deviceFingerprint`| string | No | Browser/device canvas signature sequence |
| `vpnUsed` | boolean| No | Direct override indicator toggle override |

#### Output Manifestations & Code Snippets

::: details Request Payload (JSON)
```json
{
  "borrowerId": "bor_01",
  "ipAddress": "102.89.34.89",
  "deviceFingerprint": "98d8ee34facc830e",
  "vpnUsed": false
}
```
:::

::: details Success Response Payload (200 OK)
```json
{
  "success": true,
  "assessmentId": "frd_1720459341",
  "borrowerId": "bor_01",
  "fraudScore": 12,
  "riskRating": "LOW",
  "recommendedAction": "PASS",
  "findings": [],
  "checkedAt": "2026-06-08T10:41:00Z"
}
```
:::

---

### [Endpoint 9] POST /consent/create
**Purpose:** Establishes electronic mandate consent tokens authorizing automated Direct Debit sweeps or geographic dunning overlays.

- **Endpoint URL:** `https://ais-dev-g2hlkbu6hmb3svafx5wuhf-50487580477.europe-west2.run.app/api/consent/create`
- **HTTP Method:** `POST`
- **Requires Authentication:** Yes

#### Parameters
| Parameter | Type | Required | Constraints | Description / Example |
| :--- | :--- | :--- | :--- | :--- |
| `borrowerId` | string | Yes | Existing borrower | Target borrower identifier ID (`bor_01`) |
| `consentType`| string | Yes | Namespace string | (e.g., `DIRECT_DEBIT_MANDATE`, `GEOLOCATION`) |
| `granted` | boolean| Yes | Must be boolean | Explicit affirmation state (`true`\|`false`) |
| `ipAddress` | string | No | Source IP | Verification trace socket IP (`185.90.10.15`) |

#### Output Manifestations & Code Snippets

::: details Request Payload (JSON)
```json
{
  "borrowerId": "bor_01",
  "consentType": "DIRECT_DEBIT_MANDATE",
  "granted": true,
  "ipAddress": "102.89.34.15"
}
```
:::

::: details Success Response Payload (201 Created)
```json
{
  "success": true,
  "message": "Privacy mandate or direct debit authorization recorded legally.",
  "consentRecord": {
    "id": "con_1720459242",
    "borrowerName": "Adebayo Chukwuma",
    "borrowerId": "bor_01",
    "consentType": "DIRECT_DEBIT_MANDATE",
    "granted": true,
    "timestamp": "2026-06-08T10:41:00Z",
    "ip": "102.89.34.15"
  },
  "complianceHash": "5fd2b620acdfbfef43accd309e3ca15b0e89fd3c"
}
```
:::

---

### [Endpoint 10] GET /consent/{borrowerId}
**Purpose:** Queries regulatory registries for GDPR/NDPR metadata checks, returning active declarations of legal consent for a given borrower.

- **Endpoint URL:** `https://ais-dev-g2hlkbu6hmb3svafx5wuhf-50487580477.europe-west2.run.app/api/consent/{borrowerId}`
- **HTTP Method:** `GET`
- **Requires Authentication:** Yes

#### Parameters
| Parameter | Type | Required | Description / Example |
| :--- | :--- | :--- | :--- |
| `borrowerId`| string | Yes | Target borrower tracer identifier (`bor_01`) in path |

#### Output Manifestations & Code Snippets

::: details Success Response Payload (200 OK)
```json
{
  "success": true,
  "borrowerId": "bor_01",
  "activeConsents": [
    {
      "id": "con_01",
      "borrowerId": "bor_01",
      "borrowerName": "Adebayo Chukwuma",
      "consentType": "GEO_LOCATION",
      "granted": true,
      "timestamp": "2026-05-28T14:45:00Z",
      "ip": "102.89.34.89"
    }
  ],
  "retrievedAt": "2026-06-08T10:41:00Z"
}
```
:::

---

## 5. Webhook Documentation

CredGuard uses outgoing HTTP POST webhooks to notify your webhooks listener server immediately about loan timeline events and consumer behaviors.

### Configure Webhook
Register your endpoint inside the Admin Panel under **Developer Core -> Webhook Subscriptions**. Make sure your server can accept standard incoming JSON request payloads.

### Supported Webhook Events
- `repayment.captured` - Triggered when direct debit succeeds.
- `case.escalated` - Collection category shifts (e.g., First Notice to Legal).
- `promise.broken` - Borrower breaches Promise-To-Pay (PTP) timeline threshold.
- `telemetry.alert` - Location mismatch or VPN disengagement during checkout.

### Sample Webhook Request Body
```json
{
  "event": "promise.broken",
  "id": "evt_hook_88aa20ee31",
  "timestamp": "2026-06-08T10:40:00Z",
  "payload": {
    "caseId": "case_01",
    "borrowerId": "bor_01",
    "borrowerName": "Adebayo Chukwuma",
    "promisedAmount": 1500,
    "promisedDate": "2026-06-05T23:59:59Z",
    "daysOverdue": 3
  }
}
```

---

## 6. SDK Integration Guide

These pre-compiled modules illustrate rapid core bindings.

### Web SDK (JavaScript / ES6)
Initialize with your credential tokens to track borrower checkouts, capture consent, or query loan statistics on frontend elements safely.

```javascript
class CredGuardSDK {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://ais-dev-g2hlkbu6hmb3svafx5wuhf-50487580477.europe-west2.run.app/api';
  }

  async trackSession(payload) {
    const r = await fetch(`${this.baseUrl}/sessions/track`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    return r.json();
  }
}
const credguard = new CredGuardSDK('cg_test_5f18d72ae5cf438bb36130636cd4f91d');
```

---

### Android Mobile SDK (Kotlin)
For native mobile loan wrappers or telemetry collection services.

```kotlin
class CredGuardClient(private val apiToken: String) {
    private val client = OkHttpClient()
    private val BASE_URL = "https://ais-dev-g2hlkbu6hmb3svafx5wuhf-50487580477.europe-west2.run.app/api"

    fun emitLocationConsent(borrowerId: String, granted: Boolean, ip: String): String {
        val mediaType = "application/json".toMediaType()
        val json = """{"borrowerId":"$borrowerId","consentType":"GEOLOCATION","granted":$granted,"ipAddress":"$ip"}"""
        val r = Request.Builder()
            .url("$BASE_URL/consent/create")
            .post(json.toRequestBody(mediaType))
            .addHeader("Authorization", "Bearer $apiToken")
            .build()
        client.newCall(r).execute().use { return it.body?.string() ?: "" }
    }
}
```

---

### iOS Mobile SDK (Swift)
For iOS finance and lending applications.

```swift
class CredGuardIOS {
    let apiToken: String
    init(apiToken: String) { self.apiToken = apiToken }
    
    func trackTelemetryCheck(borrowerId: String, ip: String) {
        let url = URL(string: "https://ais-dev-g2hlkbu6hmb3svafx5wuhf-50487580477.europe-west2.run.app/api/fraud/analyze")!
        var r = URLRequest(url: url)
        r.httpMethod = "POST"
        r.allHTTPHeaderFields = [
            "Authorization": "Bearer \(apiToken)",
            "Content-Type": "application/json"
        ]
        r.httpBody = try? JSONSerialization.data(withJSONObject: ["borrowerId": borrowerId, "ipAddress": ip])
        URLSession.shared.dataTask(with: r) { d, _, _ in
            if let d = d, let str = String(data: d, encoding: .utf8) { print(str) }
        }.resume()
    }
}
```

---

## 7. Postman Collection Configuration Guide

A bank's IT system validation team can configure Postman rapidly using these parameters:

1.  **Create Workspace:** Open Postman -> Click **Import** -> Select **New Collection**.
2.  **Declare Environment Variables:** Create a new Postman environment containing:
    -   `baseUrl` -> value: `https://ais-dev-g2hlkbu6hmb3svafx5wuhf-50487580477.europe-west2.run.app/api`
    -   `token` -> value: `cg_test_5f18d72ae5cf438bb36130636cd4f91d`
3.  **Setup Header Inheritance:** Select the Postman collection roots -> click **Authorization** -> Set type to **Bearer Token** with token value `{{token}}`.
4.  **Add Requests:** Create 10 POST/GET requests referencing paths like `{{baseUrl}}/borrowers` or `{{baseUrl}}/consent/bor_01`.

---

## 8. Master Integration & Testing Checklist

Use this checklist to sign off on your system integration:

| Endpoint Sequence ID | Action Item | Values to Input (Payload) | Expected Response Code | Success Signal Field to Validate |
| :---: | :--- | :--- | :---: | :--- |
| **01** | Create Borrower | `{"name": "Sarah", "email": "sarah@g.com"}` | `211 Created` | Contains generated `"id"` beginning with `bor_` |
| **02** | Fetch Profile | Path segment `bor_01` in URL | `200 OK` | Check values: `"email": "adebayo.c@yahoo.com"` |
| **03** | Run Risk Scorer | `{"borrowerId": "bor_01"}` | `200 OK` | Returns `"riskBand"` (`"LOW"`\|`"HIGH"`\|`"CRITICAL"`) |
| **04** | Provision Loan | `{"borrowerId": "bor_01", "amount": 2500}`| `211 Created` | Verifies dynamic installment table arrays |
| **05** | View Agreement | Path segment `loan_01` in URL | `200 OK` | Returns `"status": "Active"` and balances |
| **06** | Manual Recovery | `{"loanId": "loan_01", "actionType": "DUNNING_SMS"}` | `200 OK` | `"newCaseStage"` changed to `"Dunning"` |
| **07** | Ingest Webhook | `{"eventType": "ptp.broken", "payload": {}}`| `200 OK` | `"processed": true` and non-empty `"eventId"` |
| **08** | Verify Fraud | `{"borrowerId": "bor_01", "ipAddress": "45.90.1.2"}` | `200 OK` | `"recommendedAction"` switches from PASS to CHALLENGE |
| **09** | Record Consent | `{"borrowerId": "bor_01", "consentType": "GEO"}` | `211 Created` | Returns dynamic SHA1 `"complianceHash"` token |
| **10** | Retrieve Consent| Path segment `bor_01` in URL | `200 OK` | Non-empty array inside `"activeConsents"` |

---
*For further documentation updates or to acquire system administration access to our database & SQL playgrounds, open the principal dashboard workspace or contact the devops engineers at `fidelisemus@gmail.com`.*
