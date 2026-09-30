export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-full flex-1 flex-col bg-zinc-50 dark:bg-black">{children}</div>;
}
