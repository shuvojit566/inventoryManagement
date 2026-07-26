import React from 'react'
import { Link } from 'react-router-dom'

const features = [
  { title: 'Secure business accounts', description: 'Every account stores products, sales, customers, and reports separately.' },
  { title: 'Cloud-style access', description: 'Login from anywhere and manage inventory safely with account-based sessions.' },
  { title: 'Smart dashboards', description: 'See sales, purchases, low stock alerts, and receivables in one view.' },
  { title: 'Profile & business settings', description: 'Manage your business name, GST, invoice format, and contact details from a single place.' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold">EasyInventory</h1>
            <p className="text-sm text-slate-500">Account-based inventory management for modern businesses.</p>
          </div>
          <nav className="flex items-center gap-3 text-sm">
            <Link to="/admin/login" className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100">
              Admin Portal
            </Link>
            <Link to="/login" className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100">
              Login
            </Link>
            <Link to="/register" className="rounded-lg bg-sky-600 px-4 py-2 text-white hover:bg-sky-700">
              Register
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-16">
        <section className="grid gap-10 lg:grid-cols-[1.2fr,0.8fr] lg:items-center">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.3em] text-sky-600">Inventory as a service</p>
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Secure multi-user inventory management for every business.
            </h2>
            <p className="max-w-2xl text-base leading-8 text-slate-600">
              Register your team, configure business settings, and keep records fully isolated per account. Build invoices, sales, purchases, and reports with an easy SaaS-style experience.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/register" className="rounded-lg bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 transition">
                Start free trial
              </Link>
              <Link to="/login" className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">
                Sign in
              </Link>
            </div>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-sky-600 via-sky-500 to-slate-900 p-2 shadow-xl">
            <div className="rounded-3xl bg-white p-8 text-slate-900 shadow-lg">
              <p className="text-sm font-semibold uppercase text-sky-600">Trusted by growing businesses</p>
              <div className="mt-8 space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold">Invoice tracking</p>
                  <p className="mt-2 text-sm text-slate-600">Create customer invoices, track payment status, and manage receipts with complete account separation.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold">Stock controls</p>
                  <p className="mt-2 text-sm text-slate-600">Automatically update stock on sales and purchases, and spot low-stock items before they run out.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold">Business settings</p>
                  <p className="mt-2 text-sm text-slate-600">Save your business logo, GST, invoice prefix, currency, and contact details per account.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-3xl bg-white p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900">Why account-based inventory?</h3>
              <ul className="mt-6 space-y-4 text-slate-600">
                <li>• Keep each business profile separate and secure.</li>
                <li>• Ensure customers, products, sales, and purchase records belong only to the signed-in account.</li>
                <li>• Prevent data leaks across teams, branches, or clients.</li>
                <li>• Use settings and reports that are specific to your business.</li>
              </ul>
            </div>
            <div className="rounded-3xl bg-slate-900 p-8 text-white shadow-sm">
              <h3 className="text-xl font-semibold">Designed for fast onboarding</h3>
              <p className="mt-4 leading-7 text-slate-200">
                Start with a simple registration and immediately see your own dashboard. Your account is protected with secure login and session persistence.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {features.map(feature => (
                  <div key={feature.title} className="rounded-2xl bg-slate-800 p-4">
                    <p className="font-semibold">{feature.title}</p>
                    <p className="mt-2 text-sm text-slate-300">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20 rounded-3xl bg-white p-8 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Feature rich</h3>
              <p className="mt-2 text-sm text-slate-600">Manage products, customers, sales, purchases, expenses, and business settings inside one secure account.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Data isolation</h3>
              <p className="mt-2 text-sm text-slate-600">Each user's data is tagged with their account ID so only authenticated users can access it.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Secure login</h3>
              <p className="mt-2 text-sm text-slate-600">Login, remember me, and logout flows let you protect your inventory data with confidence.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-6 text-sm text-slate-500">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p>EasyInventory © 2026. Built for modern businesses.</p>
            <div className="flex flex-wrap gap-3">
              <a href="mailto:support@example.com" className="text-slate-600 hover:text-slate-900">Contact</a>
              <Link to="/register" className="text-slate-600 hover:text-slate-900">Get started</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
