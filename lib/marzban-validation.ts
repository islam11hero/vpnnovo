export const MARZBAN_USERNAME_PATTERN = /^[a-zA-Z0-9_.-]{3,64}$/;

export function validateMarzbanUsername(username: string): string | null {
  const value = username.trim();
  if (!value) return "Username is required.";
  if (/\s/.test(value)) return "Username cannot contain spaces.";
  if (!MARZBAN_USERNAME_PATTERN.test(value)) {
    return "Use 3–64 characters: letters, numbers, underscore, dot, or hyphen.";
  }
  return null;
}
