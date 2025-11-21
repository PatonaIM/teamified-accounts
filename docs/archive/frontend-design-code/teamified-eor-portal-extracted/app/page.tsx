import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="h1 text-gray-900 mb-4">Teamified EOR Portal</h1>
          <p className="body-md text-gray-600 mb-8">Employee of Record management system</p>

          <div className="space-y-4">
            <Link href="/app/dashboard" className="btn btn-primary btn-lg w-full">
              EOR Portal
            </Link>
            <Link href="/admin/dashboard" className="btn btn-secondary btn-lg w-full">
              Admin Console
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
