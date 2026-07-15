import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal";

export const metadata: Metadata = {
  title: "Security — MomentDrop",
  description:
    "How MomentDrop keeps your events, photos, and account safe — encryption, private storage, access controls, and payment security.",
};

const EMAIL = "momentdropsharing@gmail.com";

export default function SecurityPage() {
  return (
    <LegalPage
      eyebrow="Trust"
      title="Security"
      updated="15 July 2026"
      intro={
        "Your guests’ photos and your account matter to us. Here is a plain-language overview of how MomentDrop protects them. Security is a shared effort, and we build on trusted, industry-certified infrastructure."
      }
    >
      <h2>Encryption in transit</h2>
      <p>{"All traffic between your browser and MomentDrop is encrypted with HTTPS/TLS. Uploads, logins, and payments travel over secure connections."}</p>

      <h2>Encryption at rest</h2>
      <p>{"Data is stored with established providers — Supabase (managed PostgreSQL) for accounts and event details, and Google Drive for the uploaded photos and videos. These providers encrypt data at rest on their infrastructure."}</p>

      <h2>Your uploads stay private</h2>
      <p>{"Photos and videos uploaded to an event land in private storage that only the event host can access — not a public feed. Hosts can optionally require uploads to be approved before they appear, and can set a per-guest upload limit."}</p>

      <h2>Accounts and passwords</h2>
      <p>{"Sign-in is handled by Supabase Auth, which also supports Google sign-in. Passwords are stored only as salted hashes — never in plain text — and sessions use secure cookies."}</p>

      <h2>Access controls</h2>
      <p>{"Database access is protected by row-level security, so each host can only reach their own events and uploads. Administrative access is limited and follows least-privilege principles."}</p>

      <h2>Payments</h2>
      <p>{"Payments are processed by Stripe, a PCI-DSS Level 1 certified provider. MomentDrop never sees or stores your full card number; Stripe handles card data directly."}</p>

      <h2>Infrastructure and certifications</h2>
      <p>{"MomentDrop runs on Vercel (application hosting and content delivery), Supabase (managed database and authentication), and Google (file storage). These providers maintain recognised certifications such as ISO 27001, SOC 2, and PCI DSS, along with backups and high-availability infrastructure managed on their side."}</p>

      <h2>Responsible disclosure</h2>
      <p>{"If you believe you have found a security vulnerability, please report it to "}<a href={`mailto:${EMAIL}`}>{EMAIL}</a>{". We will investigate promptly and, where an incident affects your data, we will notify affected users."}</p>

      <h2>Your part</h2>
      <ul>
        <li>{"Use a strong, unique password and keep it private."}</li>
        <li>{"Turn on upload approval and per-guest limits for larger events."}</li>
        <li>{"Get consent from guests and from people who appear in the photos and videos you collect."}</li>
        <li>{"Keep your own copies of photos you want to keep long-term."}</li>
      </ul>

      <p>{"For how we handle personal data, see our "}<Link href="/privacy">Privacy Policy</Link>{" and "}<Link href="/terms">Terms &amp; Conditions</Link>{"."}</p>
    </LegalPage>
  );
}
