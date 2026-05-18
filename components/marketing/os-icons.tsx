type IconProps = { className?: string };

export function WindowsIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 5.5L10.5 4.6V11.5H3V5.5ZM11.5 4.4L21 3V11.5H11.5V4.4ZM3 12.5H10.5V19.4L3 18.5V12.5ZM11.5 12.5H21V21L11.5 19.6V12.5Z" />
    </svg>
  );
}

export function AppleIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.05 12.65c-.02-2.18 1.78-3.22 1.86-3.27-1.01-1.48-2.58-1.68-3.14-1.7-1.34-.14-2.62.79-3.3.79-.68 0-1.73-.77-2.85-.75-1.47.02-2.82.85-3.57 2.16-1.52 2.64-.39 6.55 1.09 8.7.72 1.04 1.58 2.21 2.71 2.17 1.09-.04 1.5-.7 2.82-.7 1.32 0 1.68.7 2.83.68 1.17-.02 1.91-1.06 2.62-2.1.83-1.21 1.17-2.38 1.19-2.44-.03-.01-2.28-.87-2.3-3.45zm-2.17-6.3c.6-.73 1.01-1.74.9-2.75-.87.04-1.93.58-2.56 1.31-.56.64-1.05 1.68-.92 2.67 1.02.08 2.06-.52 2.58-1.23z" />
    </svg>
  );
}

export function LinuxIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.5 2c-2.2 0-4.5.6-4.5 3.2 0 .7.2 1.2.5 1.7l-.3 1c-1 .3-2.2.9-2.8 2.1-.5 1-.6 2.2-.3 3.3.6 2.2 2.6 3.6 4.8 3.9.4 2.4 2 4.2 4.3 4.8 0 0 .1.6.5.6h1.8c.4 0 .5-.6.5-.6 2.3-.6 3.9-2.4 4.3-4.8 2.2-.3 4.2-1.7 4.8-3.9.3-1.1.2-2.3-.3-3.3-.6-1.2-1.8-1.8-2.8-2.1l-.3-1c.3-.5.5-1 .5-1.7 0-2.6-2.3-3.2-4.5-3.2zm-2.2 12.8c-.5 0-.9-.5-.8-1.1.1-.6.6-1 1.1-1 .6 0 1 .5.9 1.1-.1.6-.6 1-1.2 1zm4.4 0c-.5 0-1-.4-1.1-1-.1-.6.3-1.1.9-1.1.5 0 1 .4 1.1 1 .1.6-.4 1.1-1 1.1z" />
    </svg>
  );
}

export function AndroidIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.6 9.5l1.3-2.2c.2-.3.1-.7-.2-.9-.3-.2-.7-.1-.9.2l-1.4 2.4c-1.1-.5-2.4-.8-3.7-.8s-2.6.3-3.7.8L7.2 6.6c-.2-.3-.6-.4-.9-.2-.3.2-.4.6-.2.9l1.3 2.2C4.8 11.2 3 13.8 3 16.8h18c0-3-1.8-5.6-4.4-7.3zM8.5 14.5c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm7 0c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z" />
    </svg>
  );
}

export function IosIcon({ className = "h-6 w-6" }: IconProps) {
  return <AppleIcon className={className} />;
}

export const DEPLOYMENT_PLATFORMS = [
  { id: "windows", label: "Windows 11/10", href: "#deploy-windows", Icon: WindowsIcon },
  { id: "macos", label: "macOS Sonoma+", href: "#deploy-macos", Icon: AppleIcon },
  { id: "linux", label: "Linux / Qubes", href: "#deploy-linux", Icon: LinuxIcon },
  { id: "ios", label: "iOS / iPadOS", href: "#deploy-ios", Icon: IosIcon },
  { id: "android", label: "Android 14+", href: "#deploy-android", Icon: AndroidIcon },
] as const;
