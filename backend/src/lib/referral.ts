export function generateReferralCode(name: string): string {
  const prefix = name.slice(0, 4).toUpperCase().replace(/[^A-Z]/g, "X");
  const suffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${suffix}`;
}
