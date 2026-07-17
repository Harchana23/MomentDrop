/**
 * Page-specific FAQ sets.
 *
 * Two rules, both learned the hard way:
 *
 * 1. Each page gets questions matching *that page's* intent. The same block
 *    repeated sitewide reads as duplicate content and answers nobody's actual
 *    question. The full list lives on /faq.
 * 2. Every answer must be true against src/lib/chat/knowledge.ts and the plan
 *    cards on /pricing. If a limit changes, it changes in all three places or
 *    the site starts contradicting itself.
 *
 * These are written for humans, not for FAQPage markup — Google stopped showing
 * FAQ rich results on 7 May 2026, so there is no schema payoff to chase here.
 */

export type FaqItem = { q: string; a: string };

/** /pricing — the visitor is deciding what this costs and what the catch is. */
export const PRICING_FAQS: FaqItem[] = [
  {
    q: "Is this a subscription?",
    a: "No — there's no recurring charge, ever. Every event starts free with no card required, and you pay one time only for the specific events that need more. Host one wedding a year and you pay once a year.",
  },
  {
    q: "Do my guests have to pay anything?",
    a: "Never. Guests don't pay, don't install an app, and don't create an account. They scan the QR code, upload, and they're done. Only the host pays, and only if you choose to upgrade.",
  },
  {
    q: "What happens when my event's storage window ends?",
    a: "Photos stay available for 7 days on Free, 3 months on Plus, and 6 months on Pro. Download the ZIP any time before then — once it's on your computer it's yours to keep forever. We'd suggest downloading in the week after your event, while you're still thinking about it.",
  },
  {
    q: "Which plan should I pick for a wedding?",
    a: "Pro. It covers 1,000 uploads with unlimited guests and keeps everything for 6 months, which fits a full-day wedding with a few hundred guests. Plus (400 uploads) is usually enough for an engagement or a smaller reception.",
  },
  {
    q: "Can I upgrade after my event has already started?",
    a: "Yes. Upgrade a specific event from your dashboard whenever you're ready — including partway through the night if uploads are coming in faster than you expected. Nothing already uploaded is lost.",
  },
  {
    q: "How do I pay?",
    a: "Card payment, in Malaysian Ringgit, handled securely by Stripe. We never see or store your card details.",
  },
];

/** /use-cases/wedding — the visitor is worried about guests, control, and keeping the photos. */
export const WEDDING_FAQS: FaqItem[] = [
  {
    q: "Will my older relatives actually manage it?",
    a: "This is the question we get most, and it's why there's no app. They point their phone camera at the QR code on the table, a normal web page opens, they pick photos from their camera roll, done. No download, no sign-up, no password to remember.",
  },
  {
    q: "Can I stop unflattering photos from showing up?",
    a: "Yes. Turn on 'Require approval' in Access Control and every upload waits in an Approval tab until you publish it. Nothing appears in the shared album or on the Photo Wall until you say so.",
  },
  {
    q: "How many photos can our guests upload?",
    a: "Pro covers 1,000 photos and videos from unlimited guests, which suits most full-day weddings. You can also cap how many each guest uploads, so one enthusiastic cousin doesn't use the whole allowance.",
  },
  {
    q: "How long do we have to download everything?",
    a: "6 months on Pro, 3 months on Plus. One click gives you every photo and video as a single ZIP, sorted into folders by guest — so you can see exactly who took what, and keep or print whatever you like.",
  },
  {
    q: "Can we put a QR code on every table?",
    a: "That's exactly how most couples run it. One event, one QR code, printed as many times as you need. Pro includes print templates for QR cards and signs so they match your stationery.",
  },
  {
    q: "Can guests upload video too, or only photos?",
    a: "Both. Guests can upload video from their camera roll or record on the spot — clips recorded in the page stop at one minute, and any single file can be up to 50MB.",
  },
];

/** /use-cases/birthday — smaller, more casual, price-sensitive. */
export const BIRTHDAY_FAQS: FaqItem[] = [
  {
    q: "Is the free plan enough for a small party?",
    a: "For an intimate one, often yes: Free covers 30 uploads from up to 10 guests, kept for 7 days. If you're expecting a full room, Plus (RM49) lifts it to 400 uploads from unlimited guests, kept for 3 months.",
  },
  {
    q: "Can friends add videos, not just photos?",
    a: "Yes — the singing, the candles, the speech that went on too long. Guests can upload clips from their camera roll or record one right in the page (those stop at a minute). Any single file can be up to 50MB.",
  },
  {
    q: "Do my friends need to download anything?",
    a: "No. They scan the QR by the cake, a web page opens, and they upload. No app, no account, works on any phone.",
  },
  {
    q: "Can I see everything in one place afterwards?",
    a: "That's the point. Instead of chasing people in the group chat for a week, you download one ZIP with every photo and video, organized by who sent it.",
  },
];

/** /use-cases/party — festivals and open houses; crowd size and the big screen. */
export const PARTY_FAQS: FaqItem[] = [
  {
    q: "We're expecting a lot of people — is there a guest limit?",
    a: "On Plus and Pro, no — unlimited guests can upload to the same event. Only the Free plan caps it, at 10 guests. For a Raya or Deepavali open house where people drift in all day, Plus or Pro is the right call.",
  },
  {
    q: "Can we show the photos on a TV during the party?",
    a: "Yes, on Plus and Pro. The Live Photo Wall is a full-screen slideshow you can put on a TV or projector, and it refreshes as new photos arrive. It also turns out to be the best nudge there is — people upload once they see it running.",
  },
  {
    q: "Do guests need an app or an account?",
    a: "Neither. One QR code at the door or on the table, and anyone can scan and upload straight from their phone browser.",
  },
  {
    q: "Can I check photos before they go on the screen?",
    a: "Yes — turn on 'Require approval' and uploads wait for you to publish them. Worth doing if the Photo Wall is up in front of everyone.",
  },
];

/** /use-cases/corporate — branding, ownership, scale. */
export const CORPORATE_FAQS: FaqItem[] = [
  {
    q: "Can we brand the upload page for our company?",
    a: "Yes. Plus adds custom branding, and Pro adds full brand control plus a custom event URL — so what your attendees see looks like your event, not ours.",
  },
  {
    q: "Who owns and can see the photos?",
    a: "You do. Uploads land in private storage that only the event owner can open from the dashboard — it's never a public feed. You choose whether to show a shared album back to attendees.",
  },
  {
    q: "Will it handle a full annual dinner?",
    a: "Pro covers 1,000 uploads from unlimited attendees and keeps them for 6 months, which comfortably fits an annual dinner or a launch. You can also cap uploads per person.",
  },
  {
    q: "How does the team get the photos afterwards?",
    a: "One click downloads everything as a single ZIP, organized into folders by contributor — ready to hand to marketing without chasing anyone for their camera roll.",
  },
];

/** /how-it-works — mechanics, in order. */
export const HOW_IT_WORKS_FAQS: FaqItem[] = [
  {
    q: "What do guests actually see when they scan?",
    a: "Your event page in their phone's browser — your event name, your cover photo, and an upload button. They pick photos and videos from their camera roll or take one right there. No install, no sign-up screen.",
  },
  {
    q: "Do I need to print anything?",
    a: "Only if you want to. Every event gives you a QR code and a shareable link, so you can WhatsApp the link instead. Pro includes print templates for QR cards and table signs if you'd like them printed.",
  },
  {
    q: "Can I review uploads before anyone sees them?",
    a: "Yes — 'Require approval' in Access Control holds every upload in an Approval tab until you publish it. You can also password-protect the event so only people with the password can open it at all.",
  },
  {
    q: "How do I get everything at the end?",
    a: "From the event's Media tab, click 'Download all (ZIP)'. You get every photo and video in one file, in folders by guest name.",
  },
];

/** /faq — the complete list. */
export const GENERAL_FAQS: FaqItem[] = [
  {
    q: "Do guests need to download an app or sign up?",
    a: "No. Guests scan the QR code (or open your link), land on a normal mobile web page, and upload photos and videos straight from their phone — no app, no account.",
  },
  {
    q: "Where are the photos stored?",
    a: "In private cloud storage that only you, the event owner, can access from your dashboard. Nothing is posted to a public feed — you choose whether to show a shared album back to guests.",
  },
  {
    q: "How long are my photos kept?",
    a: "7 days on Free, 3 months on Plus, and 6 months on Pro. Download the ZIP before your window ends and the files are yours permanently — MomentDrop is built to collect photos from your guests and hand them to you, not to be your long-term photo archive.",
  },
  {
    q: "Is MomentDrop a subscription?",
    a: "No. Every event starts free, and upgrades are a one-time payment for that specific event — RM49 for Plus, RM99 for Pro. There's no recurring charge and no card needed to start.",
  },
  {
    q: "Can I approve photos before they appear?",
    a: "Yes. Turn on 'Require approval' in Access Control and new uploads wait in an Approval tab until you publish them.",
  },
  {
    q: "How do I download everything?",
    a: "From the event's Media tab, click 'Download all (ZIP)'. You get every photo and video in one file, organized into folders by guest name.",
  },
  {
    q: "What's a Photo Wall?",
    a: "A live, full-screen slideshow of published photos you can put on a projector or TV at the venue. It auto-advances and refreshes as new photos come in. Available on Plus and Pro.",
  },
  {
    q: "Can I password-protect my event?",
    a: "Yes. Set a password in Access Control and guests must enter it before they can open the event page.",
  },
  {
    q: "How big can uploads be?",
    a: "Each file can be up to 50MB — plenty for photos and short videos. Videos recorded in the page itself stop at one minute.",
  },
  {
    q: "Can I limit how much each guest uploads?",
    a: "Yes. Set a per-guest upload cap so your allowance is shared out evenly instead of being used up by the first few enthusiastic guests.",
  },
  {
    q: "What does it cost?",
    a: "Every event starts free — 30 uploads from up to 10 guests. Upgrade a specific event to Plus (RM49) or Pro (RM99) for more uploads, unlimited guests, and a longer window. See the pricing page for the full comparison.",
  },
  {
    q: "Is it just for weddings?",
    a: "No — birthdays, open houses, festivals, and corporate events all work the same way. Anywhere people take photos, MomentDrop collects them.",
  },
];
