/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const SDK_TEMPLATES = {
  javascript: `/**
 * LoanIntelligence Web SDK (JS / React Native)
 * Fulfills compliance & session capture with user consent
 */
export class LoanIntelligence {
  private static baseURL: string = "https://api.loan-recovery-intelligence.com";
  private static apiKey: string = "";
  private static hasConsent: boolean = false;

  public static initialize(config: { apiKey: string, baseURL?: string }) {
    this.apiKey = config.apiKey;
    if (config.baseURL) this.baseURL = config.baseURL;
  }

  public static setConsent(granted: boolean) {
    this.hasConsent = granted;
  }

  /**
   * Tracks user interaction (strictly adheres to privacy guidelines)
   */
  public static async trackSession(borrowerId: string, appVersion: string): Promise<any> {
    if (!this.hasConsent) {
      console.warn("LoanIntelligence SDK: Track skipped. User consent not granted.");
      return { status: "declined", reason: "no_consent" };
    }

    try {
      // Gather non-private client info
      const sessionData = {
        borrowerId,
        appVersion,
        deviceType: window.innerWidth < 768 ? "web_mobile" : "web_desktop",
        os: navigator.userAgentData?.platform || navigator.platform || "Unknown OS",
        browser: this.getBrowserName(),
        consentGiven: true
      };

      const response = await fetch(\`\${this.baseURL}/api/sessions/track\`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": \`Bearer \${this.apiKey}\`
        },
        body: JSON.stringify(sessionData)
      });
      return await response.json();
    } catch (err) {
      console.error("LoanIntelligence SDK error:", err);
    }
  }

  private static getBrowserName(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes("Firefox")) return "Mozilla Firefox";
    if (userAgent.includes("Chrome")) return "Google Chrome";
    if (userAgent.includes("Safari")) return "Apple Safari";
    return "Generic Browser";
  }
}`,

  android: `package com.loansystem.intelligence

import android.content.Context
import android.os.Build
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject

/**
 * Android Kotlin SDK for Risk & Recovery Intelligence.
 * Lightweight middleware that hooks into your existing app events.
 */
object LoanIntelligenceSDK {
    private var apiKey: String = ""
    private var baseURL: String = "https://api.loan-recovery-intelligence.com"
    private var hasConsent: Boolean = false
    private val client = OkHttpClient()

    fun init(apiKey: String, baseUrl: String? = null) {
        this.apiKey = apiKey
        baseUrl?.let { this.baseURL = it }
    }

    fun setConsentGranted(granted: Boolean) {
        this.hasConsent = granted
    }

    fun trackSession(context: Context, borrowerId: String, callback: (String) -> Unit) {
        if (!hasConsent) {
            callback("{\"status\":\"error\",\"message\":\"Compliance: Consent not granted\"}")
            return
        }

        Thread {
            try {
                const val JSON_MIME = "application/json; charset=utf-8"
                val json = JSONObject().apply {
                    put("borrowerId", borrowerId)
                    put("deviceType", "mobile_android")
                    put("os", "Android " + Build.VERSION.RELEASE)
                    put("browser", "Mobile Native App")
                    put("appVersion", context.packageManager.getPackageInfo(context.packageName, 0).versionName)
                    put("consentGiven", true)
                }

                val body = json.toString().toRequestBody(JSON_MIME.toMediaType())
                val request = Request.Builder()
                    .url("$baseURL/api/sessions/track")
                    .post(body)
                    .addHeader("Authorization", "Bearer $apiKey")
                    .build()

                client.newCall(request).execute().use { response ->
                    callback(response.body?.string() ?: "{}")
                }
            } catch (e: Exception) {
                callback("{\"status\":\"error\",\"error\":\"\${e.message}\"}")
            }
        }.start()
    }
}`,

  swift: `import Foundation

/// iOS Swift integration module for Loan Recovery Middleware
public class LoanIntelligenceSDK {
    public static let shared = LoanIntelligenceSDK()
    
    private var apiKey: String = ""
    private var baseURL: String = "https://api.loan-recovery-intelligence.com"
    private var isConsentGranted: Bool = false
    
    private init() {}
    
    public func configure(apiKey: String, baseURL: String? = nil) {
        self.apiKey = apiKey
        if let customURL = baseURL {
            self.baseURL = customURL
        }
    }
    
    public func setConsent(granted: Bool) {
        self.isConsentGranted = granted
    }
    
    public func trackSession(borrowerId: String, appVersion: String, completion: @escaping (Result<[String: Any], Error>) -> Void) {
        guard isConsentGranted else {
            completion(.failure(NSError(domain: "RiskSDK", code: 403, userInfo: [NSLocalizedDescriptionKey: "User consent is mandatory under privacy frameworks."])))
            return
        }
        
        guard let url = URL(string: "\\(baseURL)/api/sessions/track") else { return }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("Application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \\(apiKey)", forHTTPHeaderField: "Authorization")
        
        let payload: [String: Any] = [
            "borrowerId": borrowerId,
            "deviceType": "mobile_ios",
            "os": "iOS \\(UIDevice.current.systemVersion)",
            "browser": "iOS Native App",
            "appVersion": appVersion,
            "consentGiven": true
        ]
        
        request.httpBody = try? JSONSerialization.data(withJSONObject: payload)
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            guard let data = data else { return }
            do {
                if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any] {
                    completion(.success(json))
                }
            } catch {
                completion(.failure(error))
            }
        }.resume()
    }
}`,

  webhook: `/**
 * Webhook structure and verification pattern (Express Node.js)
 * Verify payment gateways webhook signatures safely
 */
const crypto = require('crypto');

// Secret shared with Stripe/Paystack/Flutterwave
const WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET;

app.post('/api/payments/webhook', (req, res) => {
  const signature = req.headers['x-paystack-signature'] || req.headers['stripe-signature'];
  
  if (!signature) {
    return res.status(401).send('Missing webhook event signature.');
  }

  // Cryptographic assertion
  const hash = crypto
    .createHmac('sha512', WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash !== signature) {
    return res.status(403).send('Invalid cryptographic payload verification.');
  }

  const event = req.body;
  
  // Handshake events safely
  if (event.event === 'charge.success') {
    const paymentReference = event.data.reference;
    const amountPaid = event.data.amount / 100; // normalized
    
    // Call SDK / Internal API trigger
    updatePaymentRepayments(paymentReference, amountPaid);
  }

  res.status(200).send('Webhook verified successfully.');
});`
};
