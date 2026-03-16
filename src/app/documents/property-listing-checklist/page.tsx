'use client';

import Image from 'next/image';

export default function PropertyListingChecklistPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Header / Branding */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.svg"
              alt="Mukamba Gateway"
              width={160}
              height={40}
              className="h-10 w-auto"
            />
            <div className="hidden sm:block">
              <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Seller Resource
              </p>
              <p className="text-sm text-slate-600">
                Property Listing Checklist
              </p>
            </div>
          </div>
          <div className="text-right text-xs sm:text-sm text-slate-500">
            <p className="font-semibold text-slate-700">Mukamba Gateway</p>
            <p>mukambagateway.com</p>
            <p>hello@mukambagateway.com</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Title */}
        <section>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            Property Listing Checklist
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-3xl">
            Use this checklist to prepare everything you need before listing your
            property on Mukamba Gateway. Bringing these items together upfront
            helps our team verify faster and gets your listing in front of
            verified buyers sooner.
          </p>
        </section>

        {/* Section A */}
        <section>
          <h2 className="text-lg sm:text-xl font-semibold text-[#7f1518] mb-2">
            A. Property &amp; Ownership Documents
          </h2>
          <ul className="space-y-1 text-sm sm:text-base text-slate-700">
            <li>[ ] Certified copy of title deed / sectional title deed</li>
            <li>[ ] Proof of ownership (POA, mandate, company docs if applicable)</li>
            <li>[ ] Latest municipal rates statement / utility bill</li>
            <li>[ ] Zoning certificate (where applicable)</li>
            <li>[ ] Building plan approvals / occupation certificate (if required)</li>
            <li>[ ] HOA / body corporate clearance or consent (if sectional title/estate)</li>
            <li>[ ] Any existing lease agreements (if the property is tenanted)</li>
            <li>[ ] Seller ID / passport for all registered owners</li>
            <li>[ ] Company registration documents &amp; director IDs (if company / trust seller)</li>
          </ul>
        </section>

        {/* Section B */}
        <section>
          <h2 className="text-lg sm:text-xl font-semibold text-[#7f1518] mb-2">
            B. Property Details for Listing
          </h2>
          <ul className="space-y-1 text-sm sm:text-base text-slate-700">
            <li>[ ] Full property address (unit number, complex/estate, city, country)</li>
            <li>[ ] Property type (house, townhouse, apartment, land, commercial, etc.)</li>
            <li>[ ] Number of bedrooms, bathrooms, parking bays/garages</li>
            <li>[ ] Erf/stand size and building size (m²)</li>
            <li>[ ] Year built / approximate age of the property</li>
            <li>[ ] Special features (pool, borehole, solar, backup water, security, etc.)</li>
            <li>[ ] Occupancy status (owner occupied, tenanted, vacant)</li>
            <li>[ ] Available from date</li>
          </ul>
        </section>

        {/* Section C */}
        <section>
          <h2 className="text-lg sm:text-xl font-semibold text-[#7f1518] mb-2">
            C. Pricing &amp; Payment Structure
          </h2>
          <ul className="space-y-1 text-sm sm:text-base text-slate-700">
            <li>[ ] Asking price (USD / ZAR, as applicable)</li>
            <li>[ ] Minimum acceptable price / reserve (if applicable)</li>
            <li>[ ] Preferred payment structure:</li>
            <li className="ml-4">[ ] Cash sale</li>
            <li className="ml-4">[ ] Installment sale</li>
            <li className="ml-4">[ ] Hybrid / other (specify)</li>
            <li>[ ] Minimum deposit required</li>
            <li>[ ] Maximum installment term you are willing to accept</li>
            <li>[ ] Any special conditions (subject to, exclusions, items included in sale)</li>
          </ul>
        </section>

        {/* Section D */}
        <section>
          <h2 className="text-lg sm:text-xl font-semibold text-[#7f1518] mb-2">
            D. Media Requirements
          </h2>
          <ul className="space-y-1 text-sm sm:text-base text-slate-700">
            <li>[ ] High‑resolution exterior photos (front, back, street view)</li>
            <li>[ ] High‑resolution interior photos (each key room)</li>
            <li>[ ] Photos of special features (garden, pool, solar, views, etc.)</li>
            <li>[ ] Floor plan (if available)</li>
            <li>[ ] Short property description (3–5 sentences highlighting key benefits)</li>
            <li>[ ] 30–60 second video walkthrough / 360° tour (optional but recommended)</li>
          </ul>
        </section>

        {/* Section E */}
        <section>
          <h2 className="text-lg sm:text-xl font-semibold text-[#7f1518] mb-2">
            E. Compliance &amp; Permissions
          </h2>
          <ul className="space-y-1 text-sm sm:text-base text-slate-700">
            <li>[ ] I am authorised to list this property on Mukamba Gateway</li>
            <li>[ ] I agree to Mukamba Gateway’s verification process and document checks</li>
            <li>[ ] I will update Mukamba Gateway if there are any changes (price, status, mandates)</li>
          </ul>
        </section>

        {/* How to Use Box */}
        <section className="border border-slate-200 rounded-2xl p-4 sm:p-6 bg-slate-50">
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">
            How to Use This Checklist
          </h2>
          <ol className="list-decimal list-inside space-y-1 text-sm sm:text-base text-slate-700">
            <li>Gather and scan the documents listed in Sections A–E.</li>
            <li>
              Go to the Mukamba Gateway web app and on the Home page click the{' '}
              <span className="font-semibold">“Want to Sell?”</span> button to start your listing.
            </li>
            <li>
              Follow the prompts to provide your property details and upload the required documents.
            </li>
            <li>
              Our team verifies your submission and confirms your listing status, keeping you updated
              through your dashboard.
            </li>
          </ol>
        </section>

        {/* Print hint */}
        <p className="text-xs text-slate-500 text-right">
          Tip: Use your browser&apos;s print function to save this page as a PDF for offline use.
        </p>
      </main>
    </div>
  );
}

