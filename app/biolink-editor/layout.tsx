import { AuthGuard } from "@/components/auth-guard"

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      {children}
    </AuthGuard>
  )
}
