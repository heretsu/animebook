export function Policy({darkMode}) {
  return (
    <div className={`${darkMode ? 'text-white' : 'text-slate-900'} w-full pb-2 pl-2 mx-2 flex flex-col`}>
      <span className="font-bold text-xl">Privacy Policy</span>
      <span className="my-2">{"Last Updated: [16/12/2024]"}</span>
      <span>
        {
          'Animebook.io ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform (the "Platform"). By accessing or using Animebook.io, you agree to the terms of this Privacy Policy.'
        }
      </span>
      <ol>
        <li>
          <div className="font-semibold">Information We Collect </div>
          <div className="font-medium mt-1">
            {"1.1. Information You Provide to Us:"}
          </div>
          <ul>
            <li>
              Account Information: When you create an account, we may collect
              your email address, username, and other details.
            </li>
            <li>
              Content Submissions: Posts, comments, and other content you create
              or share on the Platform.
            </li>
            <li>
              Payment Information: If you tip other users or make transactions,
              we may collect wallet addresses and transaction details (no
              private keys).
            </li>
          </ul>

          <div className="font-medium mt-1">
            {"1.2. Information Collected Automatically:"}
          </div>
          <ul>
            <li>
              Device and Usage Data: IP address, browser type, operating system,
              and usage patterns.
            </li>
            <li>
              Cookies and Tracking Technologies: Information about your activity
              on the Platform for improving your experience.
            </li>
          </ul>
        </li>

        <li>
          <div className="font-semibold">How We Use Your Information</div>
          <div className="mt-1">{"We use the collected information to:"}</div>

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
            We implement industry-standard measures to protect your information.
            However, no system is completely secure, and we cannot guarantee
            absolute security.
          </div>
        </li>

        <li>
          <div className="font-semibold">Your Rights</div>
          <div>{"Depending on your jurisdiction, you may have rights to:"}</div>
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
          <span className="font-semibold">Changes to this Privacy Policy</span>
          <div>
            We may update this Privacy Policy from time to time. Changes will be
            posted on this page with an updated date.
          </div>
        </li>
        <li>
          <div className="font-semibold">Contact Us</div>
          <span>
            <span>{"If you have questions or concerns, contact us at "}</span>
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
      </ol>
    </div>
  );
}
export default function TOS({darkMode}) {
  return (
    <div className={`${darkMode ? 'text-white' : 'text-slate-900'} w-full pb-2 pl-2 mx-2 flex flex-col`}>
      <span className="font-bold text-xl">Terms of Service</span>
      <span className="my-2">{"Last Updated: [16/12/2024]"}</span>
      <span>
        {
          'Welcome to Animebook.io! By accessing or using our Platform, you agree to these Terms of Service ("Terms"). Please read them carefully:'
        }
      </span>
      <ol>
        <li>
          <div className="font-semibold">Acceptance of Terms</div>
          <div>
            By accessing Animebook.io, you confirm that you are at least 18
            years old or have parental consent and agree to abide by these
            Terms.
          </div>
        </li>
        <li>
          <span className="font-semibold">User Accounts</span>
          <ul>
            <li>
              You are responsible for safeguarding your account credentials.
            </li>
            <li>You must not impersonate others or use offensive usernames.</li>
            <li>
              Animebook.io reserves the right to terminate or suspend accounts
              for violations.{" "}
            </li>
          </ul>
        </li>

        <li>
          <span className="font-semibold">Content Guidelines</span>
          <ul>
            <li>Users are responsible for their content.</li>
            <li>
              Content must not violate laws, contain hate speech, or infringe on
              intellectual property.
            </li>
            <li>
              By posting content, you grant Animebook.io a non-exclusive license
              to display it on the Platform.
            </li>
          </ul>
        </li>

        <li>
          <span className="font-semibold">Prohibited Activities</span>
          <div>Users must not:</div>
          <ul>
            <li>Use the Platform for illegal activities.</li>
            <li>Attempt to hack or disrupt the Platform.</li>
            <li>Engage in spamming or phishing activities.</li>
          </ul>
        </li>

        <li>
          <span className="font-semibold">Tipping and Transactions</span>
          <ul>
            <li>
              All transactions, including ETH and Luffy token tips, are final
              and non-refundable.
            </li>
            <li>
              Users are responsible for ensuring the accuracy of wallet
              addresses.
            </li>
          </ul>
        </li>

        <li>
          <div className="font-semibold">Intellectual Property</div>
          <div>
            All Platform content, except user-generated content, is owned by
            Animebook.io or licensed to us. You must not copy, reproduce, or
            distribute Platform content without permission.
          </div>
        </li>
        <li>
          <span className="font-semibold">Limitation of Liability</span>
          <div>
            {
              'Animebook.io is provided "as is" without warranties. We are not liable for:'
            }
          </div>
          <ul>
            <li>Losses from Platform use or downtime.</li>
            <li>User-generated content.</li>
            <li>
              {
                "Blockchain-related risks (e.g., lost private keys or transaction errors)."
              }
            </li>
          </ul>
        </li>
        <li>
          <div className="font-semibold">Termination</div>
          <div>
            We reserve the right to terminate access to the Platform for
            violating these Terms or at our discretion.
          </div>
        </li>
        <li>
          <div className="font-semibold">Governing Law</div>
          <div>
            These Terms are governed by the laws of called Jurisdiction.
            Disputes will be resolved under these laws.
          </div>
        </li>
        <li>
          <div className="font-semibold">Changes to Terms</div>
          <div>
            We may update these Terms occasionally. Continued use of the
            Platform constitutes acceptance of any updates.
          </div>
        </li>
        <li>
          <div className="font-semibold">Contact Us</div>
          <span>
            <span>{"For questions about these Terms, contact us at "}</span>
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
      </ol>
    </div>
  );
}
