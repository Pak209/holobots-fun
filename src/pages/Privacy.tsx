const Privacy = () => {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
      {/* Subtle sci-fi background */}
      <div
        className="fixed inset-0 opacity-30 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 20% 10%, rgba(245,196,0,0.35), transparent 40%), radial-gradient(circle at 80% 30%, rgba(0,212,255,0.25), transparent 45%), radial-gradient(circle at 30% 80%, rgba(245,196,0,0.15), transparent 45%)",
        }}
        aria-hidden
      />

      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-widest text-center">
            Privacy Policy
          </h1>
          <p className="text-center text-gray-300 mt-3">
            Effective Date: <span className="text-[#F5C400]">May 27, 2026</span>
          </p>
        </header>

        <p className="text-gray-200 leading-relaxed text-sm sm:text-base">
          Holobots respects your privacy. This Privacy Policy explains what
          information we collect, how we use it, and the choices you have when
          using the Holobots mobile app.
        </p>

        <div className="mt-8 space-y-10">
          <section>
            <h2 className="text-xl font-black uppercase tracking-wider text-[#F5C400]">
              1. Information We Collect
            </h2>

            <div className="mt-4 space-y-6">
              <div>
                <h3 className="font-bold text-white">Account Information</h3>
                <p className="text-gray-200 leading-relaxed mt-2 text-sm sm:text-base">
                  When you sign in to Holobots, we may collect information needed
                  to create, authenticate, and manage your account, such as
                  your user ID, username, email address, and account
                  preferences.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-white">
                  Gameplay Information
                </h3>
                <p className="text-gray-200 leading-relaxed mt-2 text-sm sm:text-base">
                  We collect and store gameplay data, including Holobot
                  ownership, levels, experience, battle cards, inventory,
                  rewards, in-game currency balances, arena progress, PvP
                  battle results, leaderboard data, missions, and other game
                  progress.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-white">
                  Fitness and Activity Information
                </h3>
                <p className="text-gray-200 leading-relaxed mt-2 text-sm sm:text-base">
                  If you choose to use fitness features, Holobots may request
                  permission to access activity-related data from your device
                  or platform health services. This may include step count,
                  workout activity, distance, motion data, workout timing, and
                  related fitness summaries.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-white">
                  Location and Motion Information
                </h3>
                <p className="text-gray-200 leading-relaxed mt-2 text-sm sm:text-base">
                  If you start a workout or activity-based feature, Holobots may
                  request location and motion permissions to measure distance,
                  movement, and workout progress. Location is used only for
                  enabled activity features and reward calculations.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-white">
                  Authentication and Device Information
                </h3>
                <p className="text-gray-200 leading-relaxed mt-2 text-sm sm:text-base">
                  Holobots may use platform authentication features such as Face
                  ID or device biometrics if you enable them. We do not receive
                  or store your biometric data. Authentication is handled by
                  your device operating system.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-white">
                  Technical and Diagnostic Information
                </h3>
                <p className="text-gray-200 leading-relaxed mt-2 text-sm sm:text-base">
                  We may collect technical data such as device type, operating
                  system, app version, crash logs, performance information, and
                  error reports to improve app reliability and fix bugs.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-wider text-[#F5C400]">
              2. How We Use Information
            </h2>
            <p className="text-gray-200 leading-relaxed mt-4 text-sm sm:text-base">
              We use collected information to:
            </p>
            <ul className="mt-3 space-y-2 text-gray-200 leading-relaxed text-sm sm:text-base list-disc pl-5">
              <li>Create and manage your Holobots account</li>
              <li>Save game progress and inventory</li>
              <li>Sync PvP battles between players</li>
              <li>
                Calculate rewards, missions, leaderboard progress, and battle
                outcomes
              </li>
              <li>
                Enable fitness-based reward features when you grant permission
              </li>
              <li>Improve app performance, security, and reliability</li>
              <li>
                Prevent cheating, abuse, fraud, or unauthorized access
              </li>
              <li>Provide support and respond to user requests</li>
              <li>
                Comply with legal, platform, and safety requirements
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-wider text-[#F5C400]">
              3. Fitness and Health Data
            </h2>
            <div className="mt-4 space-y-4">
              <p className="text-gray-200 leading-relaxed text-sm sm:text-base">
                Holobots uses fitness and activity data only to power in-game
                fitness features and calculate rewards such as Sync Points or
                related progress.
              </p>
              <p className="text-gray-200 leading-relaxed text-sm sm:text-base">
                Holobots is not a medical or health care app. The app does not
                provide medical advice, diagnosis, treatment, or health
                recommendations. You should not rely on Holobots for medical
                decisions.
              </p>
              <p className="text-gray-200 leading-relaxed text-sm sm:text-base">
                You can disable fitness, motion, health, or location permissions
                at any time through your device settings.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-wider text-[#F5C400]">
              4. Data Sharing
            </h2>
            <div className="mt-4 space-y-4">
              <p className="text-gray-200 leading-relaxed text-sm sm:text-base">
                We do not sell your personal information.
              </p>
              <p className="text-gray-200 leading-relaxed text-sm sm:text-base">
                We may share limited information with service providers that help
                us operate the app, including authentication, cloud storage,
                databases, crash reporting, analytics, hosting, and security
                services.
              </p>
              <p className="text-gray-200 leading-relaxed text-sm sm:text-base">
                Holobots uses Firebase and related cloud services to store
                account data, game progress, and PvP synchronization data.
              </p>
              <p className="text-gray-200 leading-relaxed text-sm sm:text-base">
                We may also disclose information if required by law, legal
                process, platform policy, or to protect the rights, safety, and
                security of Holobots, our users, or others.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-wider text-[#F5C400]">
              5. Data Storage and Security
            </h2>
            <p className="text-gray-200 leading-relaxed mt-4 text-sm sm:text-base">
              We use reasonable technical and organizational safeguards to protect
              your information. However, no online service is completely secure,
              and we cannot guarantee absolute security.
            </p>
            <p className="text-gray-200 leading-relaxed mt-3 text-sm sm:text-base">
              Your game data may be stored on cloud servers operated by our
              service providers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-wider text-[#F5C400]">
              6. Your Choices
            </h2>
            <ul className="mt-4 space-y-2 text-gray-200 leading-relaxed text-sm sm:text-base list-disc pl-5">
              <li>Sign out of your account</li>
              <li>Decline optional permissions</li>
              <li>Disable permissions in iOS or Android settings</li>
              <li>Stop using fitness or location-based features</li>
              <li>
                Contact us to request help with account access or deletion
              </li>
            </ul>
            <p className="text-gray-200 leading-relaxed mt-3 text-sm sm:text-base">
              Some features may not work if required permissions are disabled.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-wider text-[#F5C400]">
              7. Children's Privacy
            </h2>
            <div className="mt-4 space-y-3">
              <p className="text-gray-200 leading-relaxed text-sm sm:text-base">
                Holobots is intended for users who are old enough to manage an
                online game account under applicable laws and platform rules.
                Holobots is not directed to children under 13.
              </p>
              <p className="text-gray-200 leading-relaxed text-sm sm:text-base">
                If you believe a child has provided personal information without
                proper consent, contact us so we can review and take
                appropriate action.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-wider text-[#F5C400]">
              8. Account Deletion
            </h2>
            <div className="mt-4 space-y-3">
              <p className="text-gray-200 leading-relaxed text-sm sm:text-base">
                You may request account deletion by contacting us at{" "}
                <a
                  href="mailto:support@holobots.fun"
                  className="text-[#00D4FF] hover:underline"
                >
                  support@holobots.fun
                </a>
                . Account deletion may remove or disable access to your
                profile, Holobots, inventory, battle history, rewards, and
                progress.
              </p>
              <p className="text-gray-200 leading-relaxed text-sm sm:text-base">
                Some information may be retained if required for legal,
                security, fraud prevention, or platform compliance purposes.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-wider text-[#F5C400]">
              9. Changes to This Policy
            </h2>
            <p className="text-gray-200 leading-relaxed mt-4 text-sm sm:text-base">
              We may update this Privacy Policy from time to time. If we make
              material changes, we will update the effective date and may
              provide additional notice inside the app or through the store
              listing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-wider text-[#F5C400]">
              10. Contact Us
            </h2>
            <p className="text-gray-200 leading-relaxed mt-4 text-sm sm:text-base">
              If you have questions about this Privacy Policy or your data,
              contact us at:
            </p>
            <p className="text-gray-200 leading-relaxed mt-2 text-sm sm:text-base">
              <a
                href="mailto:support@holobots.fun"
                className="text-[#00D4FF] hover:underline break-all"
              >
                support@holobots.fun
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Privacy;

