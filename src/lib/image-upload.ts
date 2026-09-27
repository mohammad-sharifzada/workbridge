/** Verkleinert Fotos für Speicherung im Profil (Base64). */
export async function compressImageFile(
  file: File,
  opts?: { maxEdge?: number; quality?: number; maxBytes?: number },
): Promise<{ dataUrl: string } | { error: "too_big" | "invalid" }> {
  const maxEdge = opts?.maxEdge ?? 720;
  const quality = opts?.quality ?? 0.72;
  const maxBytes = opts?.maxBytes ?? 700_000;

  if (!file.type.startsWith("image/")) return { error: "invalid" };

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return { error: "invalid" };

  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return { error: "invalid" };
  }
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  let q = quality;
  let dataUrl = canvas.toDataURL("image/jpeg", q);
  while (dataUrl.length > maxBytes * 1.37 && q > 0.4) {
    q -= 0.08;
    dataUrl = canvas.toDataURL("image/jpeg", q);
  }

  if (dataUrl.length > maxBytes * 1.37) return { error: "too_big" };
  return { dataUrl };
}
