import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <span className="text-lg font-bold tracking-tight">
              Just<span className="text-primary">Do</span>Stuff
            </span>
            <p className="text-sm text-muted-foreground">
              Discover what it&apos;s really like. Shadow professionals, explore
              careers, and find your passion through real experiences.
            </p>
          </div>

          {/* Explore */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Explore</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/explore"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Browse Experiences
                </Link>
              </li>
              <li>
                <Link
                  href="/explore?category=technology-startups"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Technology
                </Link>
              </li>
              <li>
                <Link
                  href="/explore?category=culinary-restaurants"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Culinary
                </Link>
              </li>
              <li>
                <Link
                  href="/explore?category=photography-film"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Photography
                </Link>
              </li>
            </ul>
          </div>

          {/* For Providers */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">For Providers</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/signup"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Become a Provider
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} JustDoStuff. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
