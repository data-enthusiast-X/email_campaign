import Sidebar from "@/components/layout/Sidebar"
import Topbar from "@/components/layout/Topbar"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{
      display: "flex",
      height: "100vh",
      overflow: "hidden",
      background: "#F5EEE6"
    }}>
      <Sidebar />
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        overflow: "hidden"
      }}>
        <Topbar />
        <main style={{
          flex: 1,
          overflow: "auto",
          background: "#F5EEE6"
        }}>
          {children}
        </main>
      </div>
    </div>
  )
}
