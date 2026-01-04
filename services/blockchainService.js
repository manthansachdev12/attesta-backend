const { ethers } = require("ethers");
const crypto = require("crypto");

/* =========================
   PROVIDER
========================= */
let provider;
let wallet;
let contract;

try {
  provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

  wallet = new ethers.Wallet(
    process.env.BLOCKCHAIN_PRIVATE_KEY,
    provider
  );

  // Minimal ABI (DO NOT CHANGE)
  const ABI = [
    "function storeProof(bytes32 proofHash)",
    "function verifyProof(bytes32 proofHash) view returns (bool)"
  ];

  contract = new ethers.Contract(
    process.env.ATTESTA_CONTRACT_ADDRESS,
    ABI,
    wallet
  );

  console.log("✅ Blockchain service initialized");
} catch (err) {
  console.error("❌ Blockchain init failed:", err.message);
  contract = null; // 🔑 VERY IMPORTANT
}

/* =========================
   HASH GENERATOR
========================= */
function generateVerificationHash(payload) {
  try {
    return crypto
      .createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex");
  } catch (err) {
    console.error("❌ Hash generation failed:", err.message);
    return null;
  }
}

/* =========================
   STORE PROOF (SAFE)
========================= */
async function storeProofOnChain(hash) {
  try {
    if (!contract) {
      console.warn("⚠️ Blockchain not available (store skipped)");
      return null;
    }

    if (!hash) {
      console.warn("⚠️ Empty hash provided");
      return null;
    }

    const tx = await contract.storeProof("0x" + hash);
    await tx.wait();
    return tx.hash;
  } catch (err) {
    console.error("❌ storeProofOnChain failed:", err.message);
    return null; // ❗ NEVER THROW
  }
}

/* =========================
   VERIFY PROOF (SAFE)
========================= */
async function verifyProofOnChain(hash) {
  try {
    if (!contract) {
      console.warn("⚠️ Blockchain not available (verify=false)");
      return false;
    }

    if (!hash) {
      console.warn("⚠️ Empty hash provided");
      return false;
    }

    const isValid = await contract.verifyProof("0x" + hash);
    return Boolean(isValid);
  } catch (err) {
    console.error("❌ verifyProofOnChain failed:", err.message);
    return false; // ❗ NEVER THROW
  }
}

module.exports = {
  generateVerificationHash,
  storeProofOnChain,
  verifyProofOnChain,
};
