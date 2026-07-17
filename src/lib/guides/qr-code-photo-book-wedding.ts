import type { Guide } from "./types";
import { planBy } from "@/lib/plans";

const pro = planBy("Pro");

export const qrPhotoBook: Guide = {
  slug: "qr-code-photo-book-wedding",
  title: "QR photo books: the disposable camera replacement",
  description:
    "Buku foto QR has largely replaced the kamera pakai buang on Malaysian wedding tables. What it is, how to make the cards — and when a disposable camera is still the nicer choice.",
  updated: "2026-07-17",
  intro:
    "For years the table camera was the standard: a disposable on every table, guests shooting through the night, a shoebox of film at the end. At most Malaysian weddings now there is a small card with a QR code where the camera used to be. Here is what changed, and what was lost.",
  sections: [
    {
      heading: "What replaced the disposable camera",
      body: [
        "The kamera pakai buang was a lovely idea with an awkward arithmetic problem. Each camera cost money, and you needed one per table. Then every roll had to be developed, which cost more and took weeks.",
        "And the yield was poor. Twenty-seven exposures per camera, shot indoors at night by people who had been celebrating, with a fixed flash and no way to check the result. A good number came back dark, blurred, or thumbed. Couples were paying a few hundred ringgit to develop film and keeping a handful of frames.",
        "Meanwhile every guest at the table was holding a camera that was better in every measurable way, already in their hand, and free.",
      ],
    },
    {
      heading: "What a QR photo book actually is",
      body: [
        "Less than the name suggests. There is no book, and there is no app.",
        "It is a card on the table with a QR code printed on it. A guest points their phone camera at the code — the same gesture as reading a restaurant menu — and a web page opens. They pick photos from their camera roll, or take one there and then, and tap upload. That is the entire interaction. Nothing installs, no account is made, no password exists.",
        "The \"book\" is what you collect at the end: every guest's photos gathered in one place, which you download as a single file. The name comes from the tradition it replaced, not from anything about how it works.",
      ],
    },
    {
      heading: "When a disposable camera is still nicer",
      body: [
        "Buy the cameras if what you want is the object. A QR code cannot be put in a drawer and rediscovered in fifteen years. Film in a shoebox can. That is a real thing to want and no upload page replaces it.",
        "Buy them if you want the look. The harsh flash, the grain, the slightly wrong colour — that is an aesthetic people now pay money to imitate, and the real thing does it honestly.",
        "Buy them if the camera is the entertainment. A disposable on the table is a toy. People pick it up, pass it around, and mess about with it in a way nobody has ever done with a QR code. If you want that energy at your reception, the camera earns its cost as a party favour rather than as a photography method.",
        "And buy them if your guests are not smartphone people. If a real portion of your room would rather not, a camera asks nothing of them.",
        "There is also nothing stopping you doing both. Cameras on a few tables for the fun of it, a QR card on every table for the photos you will actually keep.",
      ],
    },
    {
      heading: "Making the QR card",
      body: [
        "One code covers the whole wedding, so you print it as many times as you like. A card on every table, a larger sign at the entrance, one by the photo booth, one near the pelamin.",
        "What goes on the card matters more than the code does. A bare QR gets ignored — people need to know what it is before they will point a phone at it. Give it a line of instruction (\"Scan to share your photos with us\"), your names, and nothing else. Anything more and it stops looking like part of your stationery and starts looking like an advertisement.",
        "Keep the code big enough to scan from a seated position — roughly a 3cm square is comfortable — and print it black on white. A QR code tinted to match your colour scheme is a QR code that half your guests will fail to scan in low light, and a wedding reception is low light.",
        `Pro includes print templates for QR cards and table signs if you would rather not build them from scratch: ${pro.priceLabel} one-time for the event, which also covers ${pro.uploadsLabel} uploads from ${pro.guestsLabel}, kept for ${pro.retentionLabel}.`,
      ],
      bullets: [
        "One code for the whole event — print as many cards as you need.",
        "Always add a line telling people what the code is for.",
        "Black on white, around 3cm square. Do not tint it to match your palette.",
        "Place one per table, plus a larger sign where people gather.",
      ],
    },
    {
      heading: "What you get at the end",
      body: [
        "This is where the comparison stops being close. With film you get an envelope of prints and negatives weeks later, most of them unusable, with no idea who shot what.",
        "With a QR page you get one ZIP, the same evening if you want it, containing every photo and video at the quality your guests' phones actually shot — sorted into folders by guest, so the person who caught the shot of your grandmother laughing is recorded next to it.",
        "Download it in the week after the wedding while you are still thinking about it. Once it is on your own drive it is yours permanently, and no storage window can touch it.",
      ],
    },
  ],
  related: ["collect-wedding-photos-from-guests", "google-photos-vs-photo-sharing-app"],
};
