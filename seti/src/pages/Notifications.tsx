import { Layout } from "@/components/Layout"
import { NotificationsPage } from "@/components/NotificationsPage"

export default function Notifications() {
  return (
    <Layout>
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-4xl">
        <NotificationsPage />
      </div>
    </Layout>
  )
}
