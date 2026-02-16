import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="mt-2 text-muted-foreground">
        Last updated: February 2026
      </p>

      <Separator className="my-6" />

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold">1. Information We Collect</h2>
          <p className="mt-2 text-muted-foreground">
            We collect information you provide directly: name, email address,
            date of birth, phone number, city, state, profile photo, bio, and
            emergency contact details. For providers seeking verification, we
            may also collect professional information such as profession,
            company name, LinkedIn profile, website URL, and years of
            experience. We also collect usage data such as pages visited,
            features used, and booking activity.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">2. How We Use Your Information</h2>
          <p className="mt-2 text-muted-foreground">
            We use your information to operate and improve the platform,
            facilitate bookings between Providers and Seekers, verify user
            age eligibility (18+ requirement), send booking confirmations
            and updates, provide customer support, process provider
            verification requests, and ensure safety by sharing emergency
            contacts with confirmed booking participants.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">3. Information Sharing</h2>
          <p className="mt-2 text-muted-foreground">
            We share limited profile information publicly (name, bio, city).
            Emergency contact details are only shared with the other party after
            a booking is confirmed. We do not sell your personal information to
            third parties. We may share information with service providers who
            help us operate the platform (e.g., email delivery, hosting) under
            strict data processing agreements.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">4. Data Security</h2>
          <p className="mt-2 text-muted-foreground">
            We use industry-standard security measures to protect your data,
            including encrypted connections (HTTPS), secure authentication,
            and row-level security on our database. We conduct regular security
            reviews and limit employee access to personal data on a need-to-know
            basis. However, no method of transmission over the internet is
            100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">5. Cookies &amp; Tracking</h2>
          <p className="mt-2 text-muted-foreground">
            We use essential cookies for authentication and session management.
            These are strictly necessary for the platform to function and cannot
            be disabled. We do not use advertising cookies, third-party tracking
            pixels, or behavioral tracking technologies. We do not engage in
            cross-site tracking or sell data to advertisers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">6. Children&apos;s Privacy (COPPA Compliance)</h2>
          <p className="mt-2 text-muted-foreground">
            JustDoStuff is intended solely for users aged 18 and older. We
            comply with the Children&apos;s Online Privacy Protection Act (COPPA)
            and do not knowingly collect, use, or disclose personal information
            from anyone under 18 years of age. Our signup process requires
            date of birth verification to enforce this age requirement.
          </p>
          <p className="mt-2 text-muted-foreground">
            If you believe that a child under 18 has created an account or
            provided personal information through our platform, please contact
            us immediately at privacy@justdostuff.com. We will promptly
            investigate and, if confirmed, delete the account and all associated
            personal information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">7. Healthcare Information (HIPAA)</h2>
          <p className="mt-2 text-muted-foreground">
            JustDoStuff is not a HIPAA-covered entity. We do not collect,
            store, process, or transmit Protected Health Information (PHI).
            Our platform facilitates observational shadowing experiences only
            and does not create any healthcare provider-patient relationship.
            Healthcare professionals using our platform as Providers are solely
            responsible for maintaining HIPAA compliance and protecting patient
            privacy during any experience they offer.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">8. Your Rights</h2>
          <p className="mt-2 text-muted-foreground">
            You have the right to access, update, or correct your personal
            information through your profile page at any time. You may request
            a complete copy of your data by contacting us. You may request
            deletion of your account and all associated personal data by
            contacting us at privacy@justdostuff.com. For California residents,
            you have additional rights under the CCPA, including the right to
            know what data we collect, the right to delete your data, and the
            right to opt out of the sale of personal information (we do not
            sell personal information).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">9. Data Retention</h2>
          <p className="mt-2 text-muted-foreground">
            We retain your personal data for as long as your account is active
            or as needed to provide services. Booking records are retained
            for up to 3 years for legal and safety purposes. Reviews are
            retained for platform integrity but may be anonymized upon account
            deletion. If you delete your account, your personal data (name,
            email, phone, emergency contacts, profile photo) will be removed
            within 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">10. International Users</h2>
          <p className="mt-2 text-muted-foreground">
            JustDoStuff is operated from the United States. If you access our
            platform from outside the US, your information may be transferred
            to and processed in the United States. By using our platform, you
            consent to this transfer. For users in the European Economic Area
            (EEA), we process data on the basis of consent (provided at signup)
            and legitimate interest (platform operation).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">11. Changes to This Policy</h2>
          <p className="mt-2 text-muted-foreground">
            We may update this Privacy Policy from time to time. We will
            notify you of material changes via email or a prominent notice on
            the platform. We encourage you to review this policy periodically.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">12. Contact Us</h2>
          <p className="mt-2 text-muted-foreground">
            For privacy-related questions, data requests, or to report concerns
            about underage users, contact us at privacy@justdostuff.com.
          </p>
        </section>
      </div>
    </div>
  );
}
