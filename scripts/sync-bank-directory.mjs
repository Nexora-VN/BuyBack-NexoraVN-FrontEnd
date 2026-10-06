import { readFile, writeFile, mkdir } from "node:fs/promises";

const directoryPath = new URL("../public/bank-directory.json", import.meta.url);
const logoDir = new URL("../public/bank-logos/", import.meta.url);
const current = JSON.parse(await readFile(directoryPath, "utf8"));
const ageDays = (Date.now() - Date.parse(current.updatedAt)) / 86_400_000;
if (ageDays < 18 && !process.argv.includes("--force")) {
  console.log(`Bank directory is ${ageDays.toFixed(1)} days old; refresh at 18 days.`);
  process.exit(0);
}

const response = await fetch("https://api.vietqr.io/v2/banks", {
  signal: AbortSignal.timeout(15000),
});
if (!response.ok) throw new Error(`Bank directory request failed: ${response.status}`);
const payload = await response.json();
if (payload.code !== "00" || !Array.isArray(payload.data) || payload.data.length < 40)
  throw new Error("Unexpected bank directory response; leaving existing snapshot untouched");

await mkdir(logoDir, { recursive: true });
const banks = payload.data
  .filter(
    (item) =>
      typeof item.code === "string" &&
      item.code.length <= 20 &&
      item.code.trim().toUpperCase() !== "MOMO",
  )
  .map((item) => ({
    code: item.code.trim(),
    name: item.shortName || item.name || item.code,
    fullName: item.name || item.code,
    logo: null,
    kind: "bank",
    sourceLogo: item.logo,
  }))
  .sort((a, b) => a.name.localeCompare(b.name, "vi"));

async function updateLogo(bank) {
  if (!/^[A-Za-z0-9_-]{2,20}$/.test(bank.code)) return;
  if (
    typeof bank.sourceLogo !== "string" ||
    !bank.sourceLogo.startsWith("https://cdn.vietqr.io/img/")
  )
    return;
  try {
    const result = await fetch(bank.sourceLogo, { signal: AbortSignal.timeout(12000) });
    const bytes = Buffer.from(await result.arrayBuffer());
    if (
      !result.ok ||
      !result.headers.get("content-type")?.startsWith("image/png") ||
      bytes.length > 250000 ||
      bytes.subarray(0, 4).toString("hex") !== "89504e47"
    )
      return;
    await writeFile(new URL(`${bank.code}.png`, logoDir), bytes);
    bank.logo = `/bank-logos/${bank.code}.png`;
  } catch {
    // A missing logo falls back to a text icon in the picker.
  }
}
for (let index = 0; index < banks.length; index += 8)
  await Promise.all(banks.slice(index, index + 8).map(updateLogo));

const cleanBanks = banks.map((bank) => ({ code: bank.code, name: bank.name, fullName: bank.fullName, logo: bank.logo, kind: bank.kind }));
cleanBanks.unshift({
  code: "MOMO",
  name: "MoMo",
  fullName: "Ví MoMo",
  logo: "/bank-logos/MOMO.png",
  kind: "wallet",
});
await writeFile(
  directoryPath,
  `${JSON.stringify({ updatedAt: new Date().toISOString().slice(0, 10), banks: cleanBanks }, null, 2)}\n`,
);
console.log(`Updated ${cleanBanks.length} receiving institutions.`);
