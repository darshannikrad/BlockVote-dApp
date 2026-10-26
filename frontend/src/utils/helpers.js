/**
 * Truncates an Ethereum address to standard format: 0x1234...5678
 * @param {string} address
 * @param {number} startLength
 * @param {number} endLength
 * @returns {string}
 */
export const formatAddress = (address, startLength = 6, endLength = 4) => {
  if (!address) return "";
  if (address.length <= startLength + endLength) return address;
  return `${address.substring(0, startLength)}...${address.substring(
    address.length - endLength
  )}`;
};

/**
 * Formats a Unix timestamp into a readable date and time
 * @param {number|string} timestamp
 * @returns {string}
 */
export const formatTimestamp = (timestamp) => {
  if (!timestamp || Number(timestamp) === 0) return "Not specified / Ongoing";
  const num = Number(timestamp);
  const ms = num < 1e11 ? num * 1000 : num;
  return new Date(ms).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Returns human-readable label for election phase enum (0: Created, 1: Registration, 2: Voting, 3: Ended)
 * @param {number} phase
 * @returns {string}
 */
export const getPhaseLabel = (phase) => {
  const p = Number(phase);
  switch (p) {
    case 0:
      return "Created";
    case 1:
      return "Registration";
    case 2:
      return "Voting Active";
    case 3:
      return "Ended";
    default:
      return "Unknown";
  }
};

/**
 * Returns badge color hex for election phase
 * @param {number} phase
 * @returns {string}
 */
export const getPhaseColor = (phase) => {
  const p = Number(phase);
  switch (p) {
    case 0:
      return "#94a3b8"; // Slate / Created
    case 1:
      return "#f59e0b"; // Amber / Registration
    case 2:
      return "#10b981"; // Emerald / Voting Active
    case 3:
      return "#ef4444"; // Rose / Ended
    default:
      return "#64748b";
  }
};

/**
 * Formats vote percentage string
 * @param {number} count
 * @param {number} total
 * @returns {string}
 */
export const calculatePercentage = (count, total) => {
  if (!total || total === 0) return "0.0%";
  return `${((count / total) * 100).toFixed(1)}%`;
};
