const Terms = () => {
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
            Terms of Use
          </h1>
          <p className="text-center text-gray-300 mt-3">
            Effective Date: <span className="text-[#F5C400]">May 27, 2026</span>
          </p>
        </header>

        <p className="text-gray-200 leading-relaxed text-sm sm:text-base">
          These Terms of Use govern your access to and use of the Holobots mobile
          app. By using Holobots, you agree to these Terms.
        </p>

        <div className="mt-8 space-y-10">
          <section>
            <h2 className="text-xl font-black uppercase tracking-wider text-[#F5C400]">
              1. Use of the App
            </h2>
            <p className="text-gray-200 leading-relaxed mt-4 text-sm sm:text-base">
              Holobots is a mobile game that includes Holobot collection,
              progression, battles, inventory, rewards, PvP arena features,
              fitness-based game systems, and related gameplay features.
            </p>
            <p className="text-gray-200 leading-relaxed mt-3 text-sm sm:text-base">
              You agree to use Holobots only for lawful purposes and in accordance
              with these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-wider text-[#F5C400]">
              2. Account Responsibility
            </h2>
            <p className="text-gray-200 leading-relaxed mt-4 text-sm sm:text-base">
              You are responsible for maintaining the security of your account and
              device. You are responsible for activity that occurs through your
              account.
            </p>
            <p className="text-gray-200 leading-relaxed mt-3 text-sm sm:text-base">
              You agree not to impersonate another person, create misleading
              account information, or use another user's account without
              permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-wider text-[#F5C400]">
              3. Game Progress and Virtual Items
            </h2>
            <p className="text-gray-200 leading-relaxed mt-4 text-sm sm:text-base">
              Holobots may include virtual items such as Holobots, cards, parts,
              tickets, blueprints, Sync Points, Holos, rewards, rankings, and
              other in-game content.
            </p>
            <p className="text-gray-200 leading-relaxed mt-3 text-sm sm:text-base">
              Unless otherwise clearly stated, virtual items:
            </p>
            <ul className="mt-3 space-y-2 text-gray-200 leading-relaxed text-sm sm:text-base list-disc pl-5">
              <li>Are part of the game experience</li>
              <li>Have no real-world cash value</li>
              <li>
                Cannot be sold, transferred, or exchanged outside approved game
                systems
              </li>
              <li>
                May be changed, rebalanced, removed, or reset to fix bugs,
                prevent abuse, or improve gameplay
              </li>
            </ul>
            <p className="text-gray-200 leading-relaxed mt-4 text-sm sm:text-base">
              We may adjust rewards, stats, inventory, or progress if needed for
              game balance, technical issues, fraud prevention, or policy
              compliance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-wider text-[#F5C400]">
              4. PvP and Fair Play
            </h2>
            <p className="text-gray-200 leading-relaxed mt-4 text-sm sm:text-base">
              Holobots includes player-versus-player battle features. You agree
              not to:
            </p>
            <ul className="mt-3 space-y-2 text-gray-200 leading-relaxed text-sm sm:text-base list-disc pl-5">
              <li>Cheat or exploit bugs</li>
              <li>Use bots, scripts, automation, or unauthorized tools</li>
              <li>Manipulate matchmaking or battle results</li>
              <li>Interfere with another player's gameplay</li>
              <li>Attack, overload, or reverse engineer backend services</li>
              <li>Abuse Firebase, APIs, or network requests</li>
              <li>
                Use multiple accounts to farm rewards or manipulate rankings
              </li>
            </ul>
            <p className="text-gray-200 leading-relaxed mt-4 text-sm sm:text-base">
              Violations may result in loss of rewards, reset progress, suspension,
              or termination of access.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-wider text-[#F5C400]">
              5. Fitness Features
            </h2>
            <p className="text-gray-200 leading-relaxed mt-4 text-sm sm:text-base">
              Holobots may include optional fitness or activity-based features.
              These features are for entertainment and gameplay purposes only.
            </p>
            <p className="text-gray-200 leading-relaxed mt-3 text-sm sm:text-base">
              Holobots is not a medical device or health care service. It does not
              provide medical advice, diagnosis, treatment, or fitness safety
              guidance.
            </p>
            <p className="text-gray-200 leading-relaxed mt-3 text-sm sm:text-base">
              You are responsible for exercising safely and using your own
              judgment. Stop activity if you feel pain, dizziness, or discomfort,
              and consult a qualified professional when appropriate.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-wider text-[#F5C400]">
              6. Permissions
            </h2>
            <p className="text-gray-200 leading-relaxed mt-4 text-sm sm:text-base">
              Some features may require permissions such as health, fitness,
              motion, location, notifications, or biometric authentication.
            </p>
            <p className="text-gray-200 leading-relaxed mt-3 text-sm sm:text-base">
              You may disable permissions through your device settings. Some app
              features may not function without required permissions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-wider text-[#F5C400]">
              7. Testing Builds
            </h2>
            <p className="text-gray-200 leading-relaxed mt-4 text-sm sm:text-base">
              If you access Holobots through TestFlight, Google Play testing,
              internal testing, closed testing, or another pre-release channel,
              you understand that the app may contain bugs, incomplete features,
              balance changes, crashes, or temporary data resets.
            </p>
            <p className="text-gray-200 leading-relaxed mt-3 text-sm sm:text-base">
              Testing access does not guarantee permanent availability or
              production release.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-wider text-[#F5C400]">
              8. User Conduct
            </h2>
            <p className="text-gray-200 leading-relaxed mt-4 text-sm sm:text-base">
              You agree not to submit, create, or share content that is unlawful,
              harmful, abusive, threatening, hateful, harassing, sexually explicit,
              or otherwise inappropriate.
            </p>
            <p className="text-gray-200 leading-relaxed mt-3 text-sm sm:text-base">
              You agree not to use usernames or other profile information to share
              sensitive personal information or violate the rights of others.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-wider text-[#F5C400]">
              9. Intellectual Property
            </h2>
            <p className="text-gray-200 leading-relaxed mt-4 text-sm sm:text-base">
              Holobots, including its name, characters, artwork, gameplay systems,
              interface, text, code, designs, and other content, is owned by
              Holobots or its licensors.
            </p>
            <p className="text-gray-200 leading-relaxed mt-3 text-sm sm:text-base">
              You may not copy, modify, distribute, sell, reverse engineer, or
              create derivative works from Holobots except as allowed by law or
              with written permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-wider text-[#F5C400]">
              10. App Stores and Platforms
            </h2>
            <p className="text-gray-200 leading-relaxed mt-4 text-sm sm:text-base">
              Your use of Holobots may also be subject to Apple App Store, Google
              Play, and device platform terms. If there is a conflict between these
              Terms and platform rules, platform rules may apply where required.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-wider text-[#F5C400]">
              11. Service Changes
            </h2>
            <p className="text-gray-200 leading-relaxed mt-4 text-sm sm:text-base">
              We may update, modify, suspend, or discontinue Holobots or any
              feature at any time. We may also change gameplay balance, rewards,
              availability, supported devices, or backend systems.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-wider text-[#F5C400]">
              12. Termination
            </h2>
            <p className="text-gray-200 leading-relaxed mt-4 text-sm sm:text-base">
              We may suspend or terminate access to Holobots if you violate these
              Terms, misuse the app, harm other users, create security risks, or
              engage in fraudulent or abusive behavior.
            </p>
            <p className="text-gray-200 leading-relaxed mt-3 text-sm sm:text-base">
              You may stop using Holobots at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-wider text-[#F5C400]">
              13. Disclaimers
            </h2>
            <p className="text-gray-200 leading-relaxed mt-4 text-sm sm:text-base">
              Holobots is provided "as is" and "as available." We do not guarantee
              that the app will always be available, error-free, secure, or
              uninterrupted.
            </p>
            <p className="text-gray-200 leading-relaxed mt-3 text-sm sm:text-base">
              To the maximum extent permitted by law, we disclaim warranties of
              merchantability, fitness for a particular purpose, and non-infringement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-wider text-[#F5C400]">
              14. Limitation of Liability
            </h2>
            <p className="text-gray-200 leading-relaxed mt-4 text-sm sm:text-base">
              To the maximum extent permitted by law, Holobots and its team will not
              be liable for indirect, incidental, special, consequential, or punitive
              damages, including loss of data, progress, rewards, virtual items, or
              access.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-wider text-[#F5C400]">
              15. Changes to These Terms
            </h2>
            <p className="text-gray-200 leading-relaxed mt-4 text-sm sm:text-base">
              We may update these Terms from time to time. If we make material changes,
              we will update the effective date and may provide notice through the app
              or store listing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-wider text-[#F5C400]">
              16. Contact Us
            </h2>
            <p className="text-gray-200 leading-relaxed mt-4 text-sm sm:text-base">
              If you have questions about these Terms, contact us at:
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

export default Terms;

