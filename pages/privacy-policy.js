import Head from "next/head";
import NavBar, { MobileNavBar } from "@/components/navBar";
const PrivacyPolicy = () => {

  return (
    <main>
      <Head>
  <title>Privacy Policy - Animebook</title>
  <meta name="description" content="Read Animebook's privacy policy to understand how we collect, use and protect your data including livestreaming features." />
  <meta property="og:title" content="Privacy Policy - Animebook" />
  <meta property="og:url" content="https://animebook.io/privacy-policy" />
  <meta name="robots" content="noindex" />
  <link rel="canonical" href="https://animebook.io/privacy-policy" />
</Head>
      <section className="mb-5 flex flex-row space-x-2 w-full">
        <NavBar />
        <div className="text-slate-900 w-full pb-2 pl-2 lg:pl-lPostCustom pr-4 xl:pr-40 mt-4 lg:mt-8 flex flex-col">
          <span className="font-bold text-xl">Privacy Policy</span>
          <span className="my-2">{"Last Updated: [16/12/2024]"}</span>
          <span>
            {
              'Animebook.io ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform (the "Platform"). By accessing or using Animebook.io, you agree to the terms of this Privacy Policy.'
            }
          </span>
          <ul>
            <li>
              <div className="font-semibold">Information We Collect </div>
              <div className="font-medium mt-1">
                {"Information You Provide to Us:"}
              </div>
              <ul>
                <li>
                  Account Information: When you create an account, we may
                  collect your email address, username, and other details.
                </li>
                <li>
                  Content Submissions: Posts, comments, and other content you
                  create or share on the Platform.
                </li>
                <li>
                  Payment Information: If you tip other users or make
                  transactions, we may collect wallet addresses and transaction
                  details (no private keys).
                </li>
              </ul>

              <div className="font-medium mt-1">
                {"Information Collected Automatically:"}
              </div>
              <ul>
                <li>
                  Device and Usage Data: IP address, browser type, operating
                  system, and usage patterns.
                </li>
                <li>
                  Cookies and Tracking Technologies: Information about your
                  activity on the Platform for improving your experience.
                </li>
              </ul>
            </li>

            <li>
              <div className="font-semibold">How We Use Your Information</div>
              <div className="mt-1">
                {"We use the collected information to:"}
              </div>

              <ul>
                <li>Provide and enhance Platform functionality.</li>
                <li>Process transactions and tips.</li>
                <li>Improve user experience through analytics.</li>
                <li>Comply with legal obligations.</li>
                <li>Prevent fraud and secure our Platform.</li>
              </ul>
            </li>

            <li>
              <div className="font-semibold">How We Share Your Information</div>
              <div>
                We do not sell your personal information. However, we may share
                information with:
              </div>
              <ul>
                <li>
                  {
                    "Service Providers: For analytics, hosting, and payment processing."
                  }
                </li>
                <li>
                  {
                    "Legal Authorities: When required to comply with laws or protect our rights."
                  }
                </li>
                <li>
                  {
                    "Community Features: Publicly visible posts and comments shared by you."
                  }
                </li>
              </ul>
            </li>

            <li>
              <span className="font-semibold">Data Security</span>
              <div>
                We implement industry-standard measures to protect your
                information. However, no system is completely secure, and we
                cannot guarantee absolute security.
              </div>
            </li>

            <li>
              <div className="font-semibold">Livestreaming</div>
              <div className="mt-1">
                When you use our livestreaming feature:
              </div>
              <ul>
                <li>
                  Video and audio data is transmitted in real-time
                  and is not stored on our servers unless you explicitly save a
                  recording. However, stream thumbnails are captured and saved to provide previews of your stream.
                </li>
                <li>
                  Viewer counts and chat messages during streams are collected
                  to provide the livestreaming experience.
                </li>
                <li>
                  Your username and avatar are visible to viewers during a live
                  session.
                </li>
                <li>
                  Stream URLs are unique to your account and should not be
                  shared with untrusted parties.
                </li>
              </ul>
            </li>

            <li>
              <div className="font-semibold">Your Rights</div>
              <div>
                {"Depending on your jurisdiction, you may have rights to:"}
              </div>
              <ul>
                <li>Access, update, or delete your data.</li>
                <li>Opt out of data processing or marketing communications.</li>
              </ul>
            </li>

            <li>
              <div className="font-semibold">Third-Party Links</div>
              <div>
                Our Platform may link to third-party websites. We are not
                responsible for their privacy practices, so please review their
                policies.
              </div>
            </li>
            <li>
              <span className="font-semibold">
                Changes to this Privacy Policy
              </span>
              <div>
                We may update this Privacy Policy from time to time. Changes
                will be posted on this page with an updated date.
              </div>
            </li>
            <li>
              <div className="font-semibold">Contact Us</div>
              <span>
                <span>
                  {"If you have questions or concerns, contact us at "}
                </span>
                <a
                  className={
                    "underline text-pastelGreen font-medium cursor-default"
                  }
                  href="https://support@animebook.io"
                >
                  support@animebook.io.
                </a>
              </span>
            </li>
          </ul>
        </div>
      </section>
      <MobileNavBar />
    </main>
  );
};
export default PrivacyPolicy;
