// utils/avatarCompress.js
function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      type,
      quality
    );
  });
}

function supportsWebP() {
  const c = document.createElement("canvas");
  const data = c.toDataURL("image/webp");
  return data.startsWith("data:image/webp");
}

export async function fileToSquareCompressedBlob(file, opts = {}) {
  const {
    maxBytes = 200 * 1024,
    startSize = 512,
    minSize = 256,
    type = supportsWebP() ? "image/webp" : "image/jpeg",
    background = "#ffffff",
    maxQuality = 0.92,
    minQuality = 0.6,
    sizeStep = 0.85,

    // NEW: if true, return the original file when it already meets constraints
    passthroughIfAlreadyOk = true,
  } = opts;

  const img = await createImageBitmap(file, { imageOrientation: "from-image" });

  // NEW: passthrough if square + already small enough
  if (
    passthroughIfAlreadyOk &&
    img.width === img.height &&
    file.size <= maxBytes
  ) {
    if (img.close) img.close();

    // Important: returning File keeps original bytes/format
    // If you need a Blob, File is still a Blob.
    return file;
  }

  const width = img.width;
  const height = img.height;

  const side = Math.min(width, height);
  const sx = Math.floor((width - side) / 2);
  const sy = Math.floor((height - side) / 2);

  let outSize = startSize;

  while (outSize >= minSize) {
    const canvas = document.createElement("canvas");
    canvas.width = outSize;
    canvas.height = outSize;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context not available");

    if (type === "image/jpeg") {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, outSize, outSize);
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, sx, sy, side, side, 0, 0, outSize, outSize);

    let bestBlob = null;
    let low = minQuality;
    let high = maxQuality;

    for (let i = 0; i < 8; i++) {
      const q = (low + high) / 2;
      const blob = await canvasToBlob(canvas, type, q);

      if (blob.size <= maxBytes) {
        bestBlob = blob;
        low = q; // try higher quality
      } else {
        high = q; // lower quality
      }
    }

    if (bestBlob) {
      if (img.close) img.close();
      return bestBlob;
    }

    outSize = Math.floor(outSize * sizeStep);
  }

  if (img.close) img.close();

  // fallback: minSize + minQuality
  const fallbackCanvas = document.createElement("canvas");
  fallbackCanvas.width = minSize;
  fallbackCanvas.height = minSize;
  const fctx = fallbackCanvas.getContext("2d");
  if (!fctx) throw new Error("Canvas 2D context not available");

  if (type === "image/jpeg") {
    fctx.fillStyle = background;
    fctx.fillRect(0, 0, minSize, minSize);
  }

  fctx.imageSmoothingEnabled = true;
  fctx.imageSmoothingQuality = "high";
  fctx.drawImage(img, sx, sy, side, side, 0, 0, minSize, minSize);

  return await canvasToBlob(fallbackCanvas, type, minQuality);
}
