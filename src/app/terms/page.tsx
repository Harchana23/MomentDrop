import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal";

export const metadata: Metadata = {
  title: "Terms & Conditions — MomentDrop",
  description:
    "The terms that govern your use of MomentDrop — accounts, content, acceptable use, payments, and liability.",
};

const EMAIL = "momentdropsharing@gmail.com";

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      updated="15 July 2026"
      intro={
        "These Terms & Conditions govern your use of MomentDrop (“MomentDrop”, “we”, “us”). By creating an account or using the service, you agree to these terms. If you do not agree, please do not use MomentDrop."
      }
    >
      <h2>1. Who can use MomentDrop</h2>
      <p>{"You must be at least 18 years old to create an account and host an event. Guests can scan a QR code and upload photos or videos without an account; if a guest is under 18, the host is responsible for any consent required."}</p>

      <h2>2. The service</h2>
      <p>{"MomentDrop lets a host create an event, share a QR code and link, and collect photos and videos from guests into a private album that the host can view and download. Some features are only available on paid plans."}</p>

      <h2>3. Your account</h2>
      <ul>
        <li>{"Provide accurate information and keep it up to date."}</li>
        <li>{"Keep your password secure. You are responsible for activity under your account."}</li>
        <li>{"Do not share your account or create accounts for others without permission."}</li>
        <li>{"Tell us promptly if you believe your account has been accessed without authorisation."}</li>
      </ul>

      <h2>4. Your content</h2>
      <p>{"“Content” means the photos, videos, names, and messages uploaded to an event by you or your guests. You (and your guests) keep ownership of your Content."}</p>
      <p>{"You grant MomentDrop a limited, worldwide, royalty-free licence to store, process, and display Content solely to operate the service for you — for example, to save uploads to your private album, show a live photo wall if you enable it, and let you download your album. This licence ends when the Content is deleted."}</p>
      <p>{"You are responsible for your Content. You confirm that you have the rights and any necessary consent to upload it and to collect photos and videos of the people who appear in it."}</p>

      <h2>5. Acceptable use</h2>
      <p>{"You agree not to use MomentDrop to upload or share Content that is unlawful, infringing, hateful, harassing, sexually explicit, or otherwise objectionable, and not to:"}</p>
      <ul>
        <li>{"break the law or infringe anyone’s rights;"}</li>
        <li>{"upload malware or attempt to disrupt, overload, or gain unauthorised access to the service;"}</li>
        <li>{"scrape, copy, or reverse-engineer the service, or use it to build a competing product;"}</li>
        <li>{"misuse another person’s data."}</li>
      </ul>
      <p>{"Hosts are responsible for moderating their own events. You can require uploads to be approved before they appear."}</p>

      <h2>6. Plans and payments</h2>
      <p>{"Every event starts free. Paid plans (Plus and Pro) are one-time charges per event, in Malaysian Ringgit (MYR), processed by Stripe. Current prices are shown on the "}<Link href="/pricing">pricing page</Link>{" and may change from time to time; changes do not affect an upgrade you have already paid for."}</p>

      <h2>7. Refunds</h2>
      <p>{"Paid, one-time per-event upgrades are generally non-refundable once the event is active, except where a refund is required by law. If something has gone wrong, contact us at "}<a href={`mailto:${EMAIL}`}>{EMAIL}</a>{" and we will try to help."}</p>

      <h2>8. Third-party services</h2>
      <p>{"MomentDrop relies on third parties (including Supabase, Google, Stripe, and Vercel). We are not responsible for their availability, performance, or any loss caused by their failure, though we choose reputable providers."}</p>

      <h2>9. Our intellectual property</h2>
      <p>{"The MomentDrop name, logo, website, and software are owned by us and are protected by law. These terms do not give you any rights in them except to use the service as intended."}</p>

      <h2>10. Availability and disclaimers</h2>
      <p>{"The service is provided “as is” and “as available”, without warranties of any kind, whether express or implied. We do not warrant that the service will be uninterrupted, error-free, or that Content will never be lost. Please keep your own copies of important photos and videos."}</p>

      <h2>11. Limitation of liability</h2>
      <p>{"To the fullest extent allowed by law, MomentDrop will not be liable for any indirect, incidental, or consequential loss, or for loss of data or content. Our total liability for any claim relating to the service is limited to the amount you paid us for the event giving rise to the claim in the 12 months before the claim."}</p>

      <h2>12. Suspension and termination</h2>
      <p>{"We may suspend or terminate access if you breach these terms or misuse the service. You can stop using MomentDrop at any time and ask us to delete your account and data."}</p>

      <h2>13. Changes to these terms</h2>
      <p>{"We may update these terms from time to time. We will post the updated version here and change the “last updated” date. Continued use after changes take effect means you accept the updated terms."}</p>

      <h2>14. Governing law</h2>
      <p>{"These terms are governed by the laws of Malaysia, and the courts of Malaysia have jurisdiction over any dispute."}</p>

      <h2>15. Contact us</h2>
      <p>{"Questions about these terms? Email "}<a href={`mailto:${EMAIL}`}>{EMAIL}</a>{" or use our "}<Link href="/contact">contact page</Link>{"."}</p>

      <p className="muted">{"These terms are provided for general information and are not legal advice."}</p>
    </LegalPage>
  );
}
