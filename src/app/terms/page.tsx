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
          <h2 className="text-xl font-semibold">2. Description of Service</h2>
          <p className="mt-2 text-muted-foreground">
            JustDoStuff is a marketplace that connects professionals
            (&quot;Providers&quot;) who offer hands-on shadowing experiences with
            individuals (&quot;Seekers&quot;) who wish to participate. We
            facilitate the discovery and booking of these experiences but are not
            a party to the actual experience itself.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">3. User Accounts</h2>
          <p className="mt-2 text-muted-foreground">
            You must create an account to use certain features. You are
            responsible for maintaining the security of your account and for all
            activities under your account. You must provide accurate and complete
            information and keep it updated.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">4. Provider Responsibilities</h2>
          <p className="mt-2 text-muted-foreground">
            Providers are responsible for accurately describing their
            experiences, maintaining a safe environment, honoring confirmed
            bookings, and complying with all applicable laws and regulations
            related to their profession.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">5. Seeker Responsibilities</h2>
          <p className="mt-2 text-muted-foreground">
            Seekers agree to follow all instructions and safety guidelines
            provided by the Provider, arrive on time for confirmed bookings,
            respect any NDA or confidentiality agreements, and provide accurate
            emergency contact information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">6. Bookings & Cancellations</h2>
          <p className="mt-2 text-muted-foreground">
            All bookings are subject to Provider confirmation. Either party may
            cancel a booking before it begins. Repeated cancellations may result
            in account restrictions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">7. Liability Waiver</h2>
          <p className="mt-2 text-muted-foreground">
            Participation in experiences involves inherent risks. By booking an
            experience, Seekers acknowledge these risks and agree to hold
            JustDoStuff harmless from any claims arising from participation.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">8. Prohibited Conduct</h2>
          <p className="mt-2 text-muted-foreground">
            Users may not use the platform for illegal activities, harass other
            users, post false or misleading information, attempt to circumvent
            the platform for bookings, or violate intellectual property rights.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">9. Contact</h2>
          <p className="mt-2 text-muted-foreground">
            If you have questions about these terms, please contact us at
            support@justdostuff.com.
          </p>
        </section>
      </div>
    </div>
  );
}
