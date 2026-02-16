import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">Terms of Service</h1>
      <p className="mt-2 text-muted-foreground">
        Last updated: February 2026
      </p>

      <Separator className="my-6" />

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
          <p className="mt-2 text-muted-foreground">
            By accessing or using JustDoStuff, you agree to be bound by these
            Terms of Service. If you do not agree, please do not use our
            platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">2. Eligibility &amp; Age Requirement</h2>
          <p className="mt-2 text-muted-foreground">
            You must be at least 18 years of age to create an account and use
            JustDoStuff. By creating an account, you represent and warrant that
            you are at least 18 years old and have the legal capacity to enter
            into these Terms. We do not knowingly collect information from or
            provide services to individuals under 18. If we discover that a
            user is under 18, we will promptly terminate their account and
            delete their personal information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">3. Description of Service</h2>
          <p className="mt-2 text-muted-foreground">
            JustDoStuff is a marketplace that connects professionals
            (&quot;Providers&quot;) who offer hands-on shadowing experiences with
            individuals (&quot;Seekers&quot;) who wish to participate. We
            facilitate the discovery and booking of these experiences but are not
            a party to the actual experience itself. JustDoStuff is not an
            employer, staffing agency, or healthcare provider.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">4. User Accounts</h2>
          <p className="mt-2 text-muted-foreground">
            You must create an account to use certain features. You are
            responsible for maintaining the security of your account and for all
            activities under your account. You must provide accurate and complete
            information and keep it updated. You agree not to share your account
            credentials with anyone else.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">5. Provider Responsibilities</h2>
          <p className="mt-2 text-muted-foreground">
            Providers are responsible for accurately describing their
            experiences, maintaining a safe environment, honoring confirmed
            bookings, and complying with all applicable laws and regulations
            related to their profession. Providers in regulated industries
            (including but not limited to healthcare, legal, and financial
            services) are solely responsible for compliance with all applicable
            professional regulations, licensing requirements, and privacy laws
            (including HIPAA, where applicable) during experiences.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">6. Seeker Responsibilities</h2>
          <p className="mt-2 text-muted-foreground">
            Seekers agree to follow all instructions and safety guidelines
            provided by the Provider, arrive on time for confirmed bookings,
            respect any NDA or confidentiality agreements, and provide accurate
            emergency contact information. Seekers understand that experiences
            may involve observation of professional activities and agree not to
            interfere with the Provider&apos;s work.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">7. Bookings &amp; Cancellations</h2>
          <p className="mt-2 text-muted-foreground">
            All bookings are subject to Provider confirmation. Either party may
            cancel a booking before it begins. Repeated cancellations may result
            in account restrictions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">8. Assumption of Risk &amp; Liability Waiver</h2>
          <p className="mt-2 text-muted-foreground">
            Participation in experiences involves inherent risks, including but
            not limited to physical injury, property damage, and exposure to
            various workplace environments. By booking an experience, Seekers
            voluntarily assume all risks associated with participation and
            agree to hold JustDoStuff, its officers, directors, employees, and
            agents harmless from any and all claims, damages, losses, or
            expenses arising from participation. This assumption of risk and
            waiver applies to the fullest extent permitted by applicable law.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">9. Healthcare Disclaimer</h2>
          <p className="mt-2 text-muted-foreground">
            JustDoStuff is not a healthcare provider, does not provide medical
            advice, and is not a HIPAA-covered entity. We do not collect, store,
            or process Protected Health Information (PHI). Healthcare-related
            experiences on our platform are observational shadowing opportunities
            only. Providers who are healthcare professionals are solely
            responsible for maintaining HIPAA compliance and patient privacy
            during any experience. No doctor-patient or provider-patient
            relationship is created through the use of this platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">10. Prohibited Conduct</h2>
          <p className="mt-2 text-muted-foreground">
            Users may not use the platform for illegal activities, harass other
            users, post false or misleading information, attempt to circumvent
            the platform for bookings, violate intellectual property rights,
            create accounts for individuals under 18, or use the platform in
            any manner that could harm minors.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">11. Intellectual Property</h2>
          <p className="mt-2 text-muted-foreground">
            All content on JustDoStuff, including but not limited to text,
            graphics, logos, and software, is owned by JustDoStuff or its
            licensors and is protected by intellectual property laws. User-
            generated content (reviews, profile information, experience
            descriptions) remains the property of the user, but users grant
            JustDoStuff a non-exclusive license to display such content on
            the platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">12. Dispute Resolution</h2>
          <p className="mt-2 text-muted-foreground">
            Any disputes arising from or relating to these Terms or the use
            of JustDoStuff shall be resolved through binding arbitration in
            accordance with the rules of the American Arbitration Association.
            You agree to waive the right to a jury trial or to participate in
            a class action lawsuit.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">13. Limitation of Liability</h2>
          <p className="mt-2 text-muted-foreground">
            To the maximum extent permitted by law, JustDoStuff shall not be
            liable for any indirect, incidental, special, consequential, or
            punitive damages, or any loss of profits, revenue, data, or
            goodwill, arising out of or in connection with your use of the
            platform or participation in any experience.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">14. Modifications</h2>
          <p className="mt-2 text-muted-foreground">
            We reserve the right to modify these Terms at any time. We will
            notify users of material changes via email or a prominent notice
            on the platform. Continued use of JustDoStuff after such changes
            constitutes acceptance of the modified Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">15. Contact</h2>
          <p className="mt-2 text-muted-foreground">
            If you have questions about these terms, please contact us at
            support@justdostuff.com.
          </p>
        </section>
      </div>
    </div>
  );
}
