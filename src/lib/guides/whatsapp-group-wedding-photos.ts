import type { Guide } from "./types";
import { planBy } from "@/lib/plans";

const pro = planBy("Pro");

export const whatsappGroup: Guide = {
  slug: "whatsapp-group-wedding-photos",
  title: "Collecting wedding photos in a WhatsApp group: what goes wrong",
  description:
    "The wedding group chat is where most guest photos end up — and where most of them stay. What works, what breaks, and when the group is genuinely good enough.",
  updated: "2026-07-17",
  intro:
    "There is already a group. Everyone is in it, everyone knows how it works, and it costs nothing. For a lot of celebrations that really is the answer. For a wedding, it has a few specific failure modes worth knowing before you rely on it.",
  sections: [
    {
      heading: "Why everyone does this",
      body: [
        "Because it is free, it is already there, and there is nothing to explain. No links, no setup, no app to install, no card on the table. You say \"send to the group\" and people send to the group.",
        "That is a real advantage and it should not be dismissed. Every alternative asks your guests to do something slightly unfamiliar. WhatsApp asks them to do the thing they already do forty times a day.",
      ],
    },
    {
      heading: "When a WhatsApp group is fine",
      body: [
        "If you are expecting a handful of photos from a handful of people, use the group. A small dinner, an afternoon, a family gathering where ten people will send ten photos each — the group is the right tool and setting up anything else is overkill.",
        "It is also fine when the photos are casual. If nobody is printing anything, nobody is making an album, and the photos will live on a phone and be scrolled past fondly — the group is exactly enough.",
        "Where it stops being fine is volume and permanence. The two failure modes below are both about scale.",
      ],
    },
    {
      heading: "The compression, specifically",
      body: [
        "This is the one most people do not know about until afterwards.",
        "When someone sends a photo the normal way in WhatsApp, it is not the file from their camera that arrives. WhatsApp re-encodes it — the image is resized and recompressed to keep it small and fast to send. What lands in your chat is a smaller, lower-quality copy of what your guest actually shot.",
        "For scrolling on a phone this is invisible and nobody minds. It stops being invisible the moment you want to print an enlargement, crop into a group shot, or hand the files to someone making an album. The detail is gone and there is no recovering it — the original is still on your guest's phone, but what you have is the copy.",
        "There is a workaround, and it is only fair to mention it: send photos as a document rather than a photo, and WhatsApp leaves the file alone. It works. It also requires every guest to know about it, remember it, and do it correctly at a wedding, which in practice means it does not happen.",
      ],
    },
    {
      heading: "What else goes wrong at a wedding",
      body: [
        "Photos and conversation share one stream. The group is not just photos — it is congratulations, questions about parking, voice notes, and forwards. The photos scroll away between them, and a week later they are a thousand messages up.",
        "Video hits limits. WhatsApp caps how large a video file can be, and longer clips get compressed hard or refused outright. The speech that ran seven minutes is not making it through intact.",
        "Saving is a chore or a flood. Three hundred photos means tapping save three hundred times — or turning on auto-save and letting your camera roll fill with every meme and forwarded graphic anyone posted that month.",
        "You lose track of who sent what. It is visible in the chat on the day and effectively gone later. And once someone leaves the group or clears their chat, the photos they sent can go with them.",
      ],
    },
    {
      heading: "A QR upload page instead",
      body: [
        "The alternative is a page rather than a chat. A QR code on the tables, guests scan and upload straight from their camera roll, and the files land unmodified — what they shot is what you get.",
        "Photos are not competing with conversation, so nothing scrolls away. Each upload is attributed, and the download comes as one ZIP foldered by guest, so who-took-what survives. Guests do not install anything or make an account; they scan and they are done.",
        `For a full wedding that is ${pro.priceLabel} one-time — ${pro.uploadsLabel} photos and videos from ${pro.guestsLabel}, kept for ${pro.retentionLabel}. Every event starts free, so you can see how it behaves before paying for anything.`,
        "Keep the group. It is where the celebrating happens. Just do not make it the place your photos live.",
      ],
    },
  ],
  related: ["collect-wedding-photos-from-guests", "google-photos-vs-photo-sharing-app"],
};
