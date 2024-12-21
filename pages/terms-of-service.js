import NavBar, { MobileNavBar } from "@/components/navBar";
const TermsOfService = () => {

  return (
    <main>
      <section className="mb-5 flex flex-row space-x-2 w-full">
        <NavBar />
        <div className="text-slate-900 w-full pb-2 pl-2 lg:pl-lPostCustom pr-4 xl:pr-40 mt-4 lg:mt-8 flex flex-col">
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
                <li>
                  You must not impersonate others or use offensive usernames.
                </li>
                <li>
                  Animebook.io reserves the right to terminate or suspend
                  accounts for violations.{" "}
                </li>
              </ul>
            </li>

            <li>
              <span className="font-semibold">Content Guidelines</span>
              <ul>
                <li>Users are responsible for their content.</li>
                <li>
                  Content must not violate laws, contain hate speech, or
                  infringe on intellectual property.
                </li>
                <li>
                  By posting content, you grant Animebook.io a non-exclusive
                  license to display it on the Platform.
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
                  All transactions, including ETH and Luffy token tips, are
                  final and non-refundable.
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
                {'Animebook.io is provided "as is" without warranties. We are not liable for:'}
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
                <a className={"underline text-pastelGreen font-medium cursor-default"} href="https://support@animebook.io">support@animebook.io.</a>
              </span>
            </li>
          </ol>
        </div>
      </section>
      <MobileNavBar />
    </main>
  );
};
export default TermsOfService;
