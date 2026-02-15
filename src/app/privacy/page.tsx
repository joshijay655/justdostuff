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
            phone number, city, state, profile photo, bio, and emergency contact
            details. We also collect usage data such as pages visited, features
            used, and booking activity.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">2. How We Use Your Information</h2>
          <p className="mt-2 text-muted-foreground">
            We use your information to operate and improve the platform,
            facilitate bookings between Providers and Seekers, send booking
            confirmations and updates, provide customer support, and ensure
            safety by sharing emergency contacts with confirmed booking
            participants.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">3. Information Sharing</h2>
          <p className="mt-2 text-muted-foreground">
            We share limited profile information publicly (name, bio, city).
            Emergency contact details are only shared with the other party after
            a booking is confirmed. We do not sell your personal information to
            third parties.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">4. Data Security</h2>
          <p className="mt-2 text-muted-foreground">
            We use industry-standard security measures to protect your data,
            including encrypted connections (HTTPS), secure authentication, and
            row-level security on our database. However, no method of
            transmission over the internet is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">5. Cookies</h2>
          <p className="mt-2 text-muted-foreground">
            We use essential cookies for authentication and session management.
            These are necessary for the platform to function and cannot be
            disabled.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">6. Your Rights</h2>
          <p className="mt-2 text-muted-foreground">
            You can access and update your personal information through your
            profile page at any time. You may request deletion of your account
            and associated data by contacting us. You can download your data
            upon request.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">7. Data Retention</h2>
          <p className="mt-2 text-muted-foreground">
            We retain your data for as long as your account is active. Booking
            records and reviews are kept for platform integrity. If you delete
            your account, your personal data will be removed within 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">8. Contact</h2>
          <p className="mt-2 text-muted-foreground">
            For privacy-related questions or requests, contact us at
            privacy@justdostuff.com.
          </p>
        </section>
      </div>
    </div>
  );
}
