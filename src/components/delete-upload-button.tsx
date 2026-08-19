"use client";

import { deleteUpload } from "@/lib/uploads/actions";

/**
 * Permanently deletes one upload (Drive file + DB row). Confirms first, because —
 * unlike Hide — there is no undo. Hidden behind a client component only for the
 * confirm dialog; the delete itself runs in the server action.
 */
export function DeleteUploadButton({ uploadId, eventId }: { uploadId: string; eventId: string }) {
  return (
    <form
      action={deleteUpload}
      onSubmit={(e) => {
        if (!confirm("Delete this permanently? The file is removed and this can't be undone.")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="uploadId" value={uploadId} />
      <input type="hidden" name="eventId" value={eventId} />
      <button
        type="submit"
        className="h-9 rounded-full border border-[#e7c9c2] px-4 text-xs font-bold text-[#9a3b2b] transition hover:bg-[#fbf1ef]"
      >
        Delete
      </button>
    </form>
  );
}
