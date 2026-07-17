import type { Guide } from "./types";
import { planBy } from "@/lib/plans";

const free = planBy("Free");
const plus = planBy("Plus");
const pro = planBy("Pro");

export const collectWeddingPhotos: Guide = {
  slug: "collect-wedding-photos-from-guests",
  title: "How to collect photos from your wedding guests",
  description:
    "Every way to collect your guests' wedding photos — QR codes, Google Photos, WhatsApp groups and disposable cameras — and an honest look at which one suits your day.",
  updated: "2026-07-17",
  intro:
    "Your photographer captures the day you planned. Your guests capture the day that actually happened — the uncles laughing at the back, the kids under the table, the bit you missed because you were being photographed. Here is how to get those photos without chasing anyone for a month.",
  sections: [
    {
      heading: "Why guest photos go missing",
      body: [
        "Every person at your wedding is holding a camera. Two hundred guests, two hundred cameras, and most of what they shoot you will never see.",
        "It is not that people are unwilling. Ask around at the reception and everyone means to send you their photos. Then Monday arrives, work resumes, and the photos stay on their phones. The ones you do get arrive in dribs and drabs over the following weeks, in a group chat, mixed in with forwarded jokes and voice notes, until you stop scrolling back.",
        "So the practical question is not whether your guests took good photos. They did. It is how much friction sits between their camera roll and your hands — and whether you can remove it before the day, because you will not have the appetite afterwards.",
      ],
    },
    {
      heading: "Your four options",
      body: [
        "There are really only four ways people do this, and each one genuinely suits somebody.",
        "A QR upload page. You put a QR code on the tables. Guests scan it, a web page opens, they pick photos from their camera roll and upload. No app to install, no account to make. Everything lands in one place that belongs to you.",
        "A shared Google Photos album. You make an album, set it to allow contributions, turn the link into a QR code with a free generator, and print it on a card. Costs nothing and takes about ten minutes to set up.",
        "A WhatsApp group. You already have one for the wedding. People send photos to it. Zero setup, and everyone knows how.",
        "Disposable cameras on the tables. The old way. Guests shoot, you collect the cameras, you develop the film. Nobody needs to be told how one works.",
      ],
    },
    {
      heading: "How to choose",
      body: [
        "Two things decide it: how many people are coming, and how much you will mind if the photos are lost or unusable.",
        "If you are having a small gathering — say under twenty guests — use a free shared album. Genuinely. Set up a Google Photos album, share the link, done. At that size everyone will actually upload, you can chase the two who forget, and paying for software to manage twenty people is silly. We would rather tell you that than sell you something you do not need.",
        "The calculus changes with scale and with stakes. At a full Malaysian wedding — a few hundred guests across a nikah, a reception, maybe two days — a free album starts to strain in ways that are not obvious until it is too late to fix. Anyone with the link can delete anyone else's photos. One guest can upload four hundred near-identical shots and bury everything. Nothing stops an unflattering photo appearing where people can see it. And when you download, you get an undifferentiated dump with no idea who took what.",
        "So the honest rule of thumb: small and casual, use the free thing. A day you only get once, with a few hundred people and no second take — that is when a purpose-built upload page earns its keep.",
      ],
    },
    {
      heading: "Setting up a QR upload page",
      body: [
        "If you go that route, the setup is short. Create the event and name it. You get a QR code and a link straight away.",
        "Print the QR. One code works for the whole wedding, so print it as many times as you like — a card on every table, a larger sign near the entrance, one at the photo booth. Put a line of instruction under it: people need to know what they are scanning and why. \"Scan to share your photos with us\" does the job.",
        "Decide about approval before the day, not during it. If you would rather see uploads before anyone else does, turn on approval and they wait for you. If your photo wall will be up on a screen in front of three hundred people, turn it on.",
        "Set a per-guest limit if you are worried about one enthusiastic cousin using the whole allowance. Most people do not need this, but it is there.",
      ],
      bullets: [
        "One QR code for the whole event — print it as many times as you need.",
        "Guests scan, upload, and leave. No app, no account, no password.",
        "Turn on approval if uploads will be shown on a screen.",
        "Cap uploads per guest if you want the allowance shared evenly.",
      ],
    },
    {
      heading: "What it costs",
      body: [
        `Every event starts free. The free tier covers ${free.uploadsLabel} uploads from ${free.guestsLabel}, kept for ${free.retentionLabel} — enough to try it at a small gathering before you commit anything.`,
        `For a full wedding, Pro is the one that fits: ${pro.uploadsLabel} photos and videos from ${pro.guestsLabel}, kept for ${pro.retentionLabel}, at ${pro.priceLabel}. Plus sits in between at ${plus.priceLabel} — ${plus.uploadsLabel} uploads, ${plus.guestsLabel}, kept for ${plus.retentionLabel} — which suits an engagement or a smaller reception.`,
        "These are one-time payments for one event, not a subscription. You are not signing up for anything monthly, and there is no card required to start. If you host one wedding, you pay once.",
      ],
    },
    {
      heading: "After the day",
      body: [
        "This is the part people forget, so put it in your calendar now: download everything in the week after the wedding, while you are still thinking about it.",
        `Storage windows are finite — ${free.retentionLabel} on Free, ${plus.retentionLabel} on Plus, ${pro.retentionLabel} on Pro. That is deliberate. This is a tool for collecting photos from your guests and handing them to you, not a place to store your marriage. Once the ZIP is on your computer or your own cloud drive, it is yours permanently and nothing can expire it.`,
        "One click gives you every photo and video in a single ZIP, sorted into folders by guest. That last part matters more than it sounds: months later, when you want to thank the person who caught the shot of your grandmother laughing, you will know who took it.",
      ],
    },
  ],
  related: [
    "google-photos-vs-photo-sharing-app",
    "whatsapp-group-wedding-photos",
    "qr-code-photo-book-wedding",
  ],
};
