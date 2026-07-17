import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How MomentDrop collects, uses, stores, and protects personal data, and your rights under Malaysia's PDPA 2010.",
  alternates: { canonical: "/privacy" },
};

const EMAIL = "momentdropsharing@gmail.com";

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="15 July 2026"
      intro={
        "This Privacy Policy explains how MomentDrop (“MomentDrop”, “we”, “us”) collects, uses, stores, and protects personal data when you use our website and services. We are based in Malaysia and handle personal data in line with the Personal Data Protection Act 2010 (PDPA)."
      }
    >
      <h2>1. Who this applies to</h2>
      <p>{"MomentDrop lets an event host create an event, share a QR code, and collect photos and videos from guests. This policy covers two groups:"}</p>
      <ul>
        <li><strong>Hosts</strong>{" — people who create an account and run an event."}</li>
        <li><strong>Guests</strong>{" — people who scan a host’s QR code (or open the link) and upload photos or videos. Guests do not create an account."}</li>
      </ul>

      <h2>2. Information we collect</h2>
      <h3>Account information (hosts)</h3>
      <p>{"When you sign up, we collect your name and email address, and either a password or a Google sign-in identifier. Authentication is handled by Supabase; we do not store your Google password."}</p>
      <h3>Event content (hosts and guests)</h3>
      <p>{"The photos and videos uploaded to an event, plus the guest name and any optional message a guest adds when uploading. Event content is stored in private storage that only the event host can access."}</p>
      <h3>Payment information</h3>
      <p>{"When you upgrade an event, payment is processed by Stripe. We receive confirmation of the payment and plan, but we never see or store your full card number."}</p>
      <h3>Usage and device data</h3>
      <p>{"Like most websites, our hosting provider logs technical data such as IP address, browser and device type, and pages visited, to keep the service secure and reliable."}</p>
      <h3>Assistant chats</h3>
      <p>{"If you use the in-site chat assistant, the messages you send are processed by Google (Gemini) to generate a reply. Do not share passwords or payment details in the chat."}</p>
      <h3>Cookies</h3>
      <p>{"We use only essential cookies needed to keep you signed in and to run the service. We do not use advertising cookies."}</p>

      <h2>3. How we use your data</h2>
      <ul>
        <li>{"To provide the service — create events, generate QR codes, receive and store uploads, and let hosts view and download their album."}</li>
        <li>{"To process payments and manage plans and upgrades."}</li>
        <li>{"To provide support and respond to your messages."}</li>
        <li>{"To keep the service secure, prevent abuse, and fix problems."}</li>
        <li>{"To improve MomentDrop."}</li>
      </ul>
      <p>{"We rely on your consent and on the performance of our agreement with you (providing the service) as the basis for processing under the PDPA."}</p>

      <h2>4. Service providers (sub-processors)</h2>
      <p>{"We use trusted third parties to run MomentDrop. They process personal data only to provide services to us:"}</p>
      <ul>
        <li><strong>Supabase</strong>{" — database and account authentication."}</li>
        <li><strong>Google (Drive, Sign-in, Gemini)</strong>{" — storage of uploaded photos and videos, optional Google sign-in, and the chat assistant."}</li>
        <li><strong>Stripe</strong>{" — payment processing."}</li>
        <li><strong>Vercel</strong>{" — website hosting and content delivery."}</li>
        <li><strong>Make.com</strong>{" — routing contact-form messages to our support inbox."}</li>
      </ul>

      <h2>5. Storage and international transfers</h2>
      <p>{"Data is stored on infrastructure operated by the providers above, which may be located outside Malaysia (for example in Singapore, the EU, or the United States). Where data is transferred abroad, we rely on these providers’ own safeguards and contractual protections."}</p>

      <h2>6. How long we keep it</h2>
      <p>{"Event content is retained according to the event’s plan, after which it may be deleted:"}</p>
      <ul>
        <li><strong>Free</strong>{" — about 7 days."}</li>
        <li><strong>Plus</strong>{" — about 3 months."}</li>
        <li><strong>Pro</strong>{" — about 6 months."}</li>
      </ul>
      <p>{"Account data is kept while your account is active. You can ask us to delete your account and associated data at any time (see “Your rights”)."}</p>

      <h2>7. Sharing your data</h2>
      <p>{"We do not sell your personal data. We share it only with the service providers listed above, when required by law or to protect our rights, or with your consent. Photos and messages a guest uploads to an event are, by design, visible to that event’s host."}</p>

      <h2>8. Your rights (PDPA)</h2>
      <p>{"Subject to the PDPA, you may request to access or correct your personal data, withdraw consent, or ask us to delete your data. To make a request, email "}<a href={`mailto:${EMAIL}`}>{EMAIL}</a>{". You may also contact the Personal Data Protection Commissioner of Malaysia if you have concerns about how your data is handled."}</p>

      <h2>9. Children</h2>
      <p>{"You must be at least 18 to create an account and host an event. We do not knowingly collect personal data directly from children through account creation. Hosts are responsible for their events, including obtaining any consent needed from guests and from the people who appear in uploaded photos and videos — including where a guest or subject is a minor."}</p>

      <h2>10. Security</h2>
      <p>{"We take reasonable measures to protect your data, including encryption in transit, private storage for uploads, and access controls. See our "}<Link href="/security">Security page</Link>{" for details. No online service can be completely secure, so we cannot guarantee absolute security."}</p>

      <h2>11. Changes to this policy</h2>
      <p>{"We may update this policy from time to time. We will post the updated version here and change the “last updated” date; significant changes may be notified by email or on the website."}</p>

      <h2>12. Contact us</h2>
      <p>{"Questions about this policy or your data? Email "}<a href={`mailto:${EMAIL}`}>{EMAIL}</a>{" or use our "}<Link href="/contact">contact page</Link>{"."}</p>

      <p className="muted">{"This policy is provided for general information and is not legal advice."}</p>
    </LegalPage>
  );
}
