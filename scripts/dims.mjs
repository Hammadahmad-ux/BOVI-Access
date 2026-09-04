import sharp from "sharp";
for (const f of process.argv.slice(2)) {
  try {
    const m = await sharp(f).metadata();
    const orient = m.width > m.height ? "landscape" : m.width === m.height ? "square" : "portrait";
    console.log(`${f.split("/").pop().padEnd(28)} ${m.width}x${m.height}  ${orient}  ar=${(m.width / m.height).toFixed(2)}`);
  } catch (e) { console.log(`${f} ERROR ${e.message}`); }
}
