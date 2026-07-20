import type { Guide } from "./types";
import { planBy } from "@/lib/plans";

const pro = planBy("Pro");

export const googlePhotosVs: Guide = {
  slug: "google-photos-vs-photo-sharing-app",
  title: "Google Photos vs a photo-sharing app for your wedding",
  description:
    "A shared Google Photos album is free. So when is a paid photo-sharing app actually worth it for a wedding? An honest comparison — including when to just use the free album.",
  updated: "2026-07-17",
  intro:
    "You can make a shared Google Photos album, turn the link into a QR code, and print it on a card for your tables — for free, in about ten minutes. It is a real option and plenty of couples do exactly that. Here is when it is the right answer, and where it quietly falls apart.",
  sections: [
    {
      heading: "The free version, honestly",
      body: [
        "It works like this. You create an album in Google Photos, open the sharing settings, and turn on the option that lets other people add photos. You copy the link, paste it into any free QR code generator, and drop the resulting image into a Canva card. Print the cards, put them on the tables.",
        "Guests scan the code, the album opens, they tap to add photos. At the end you select everything and download it.",
        "That is a genuinely decent setup. It costs nothing, it uses tools you already have, and the photos land at full quality rather than being squashed. Anyone telling you this does not work is selling something.",
      ],
    },
    {
      heading: "When you should just use Google Photos",
      body: [
        "Use the free album if your gathering is small — a dinner, a birthday, an engagement with twenty or thirty people. At that size you can see everyone, you can nudge the two who forgot, and there is nothing to manage.",
        "Use it if your guests are the kind of crowd who all have Google accounts and use them. Colleagues, a younger group, people comfortable with the app — they will not blink.",
        "Use it if nobody needs moderating. A close group of friends, no photos you would be anxious about, no screen showing uploads to a room.",
        "And use it if the photos are nice to have rather than the point. If losing half of them would be a shrug rather than a heartbreak, do not spend money on this.",
        "In all of those cases a free album is the better answer and we would rather you took it. The reason to pay is not that free is broken — it is that a wedding puts pressure on it in specific places.",
      ],
    },
    {
      heading: "Where it breaks at a wedding",
      body: [
        "Anyone with the link can delete photos — including other people's. A shared album gives contributors real editing power, and there is no way to hand out a link that only adds. One guest tidying up what they think are their own duplicates can take other people's photos with them, and you will not know until you go looking.",
        "There is no cap per guest. One relative who shoots in burst mode can upload four hundred near-identical frames, and everything else drowns. You cannot limit anyone, and you cannot un-drown it afterwards except by hand.",
        "Nothing waits for your approval. Whatever goes in is in, visible to everyone with the link, immediately. For most weddings that is fine right up until the one photo where it is not.",
        "Guests without a Google account hit a wall. Not everyone has one, not everyone is signed in on their phone, and the ones who are not will be standing at your reception being asked to sign in to something. Some will. Older relatives, mostly, will put the phone away.",
        "And the download is a pile. You get every photo in one heap with no record of who contributed what. Months later, when you want to thank whoever caught the shot of your grandmother laughing, there is no way to find out.",
      ],
    },
    {
      heading: "What you are paying for",
      body: [
        "Each of those has a specific fix, and that is the entire value proposition — not features for their own sake.",
        "Guests upload without an account or an app, so nobody is signing in to anything at your reception. Uploads only add; a guest cannot delete another guest's photos. You can cap how many each person uploads, so the allowance gets shared. You can require approval, so nothing appears until you say so. And the download arrives as one ZIP, foldered by guest, so who-took-what survives the day.",
        `For a full wedding that is Pro: ${pro.uploadsLabel} photos and videos from ${pro.guestsLabel}, kept for ${pro.retentionLabel}, ${pro.priceLabel} one-time for that event. Not a subscription — you pay once, for the one wedding.`,
      ],
    },
    {
      heading: "The short version",
      body: [
        "Small, casual, low stakes: use the free Google Photos album. You will not regret it and you will not miss the features.",
        "A few hundred guests, relatives who are not signed in to anything, and a day that does not have a second take: that is what the paid tiers are for. The question is not which tool is better. It is whether your wedding puts weight on the places where free gives way.",
      ],
    },
  ],
  related: ["collect-wedding-photos-from-guests", "whatsapp-group-wedding-photos"],
};
