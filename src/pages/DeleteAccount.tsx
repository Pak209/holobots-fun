const DeleteAccount = () => {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
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
            Delete Your Holobots Account
          </h1>
        </header>

        <div className="space-y-6 text-gray-200 leading-relaxed text-sm sm:text-base">
          <p>
            You can request deletion of your Holobots account and associated
            data by emailing:
          </p>

          <p className="text-center">
            <a
              href="mailto:support@holobots.fun?subject=Delete%20Holobots%20Account"
              className="text-[#00D4FF] hover:underline text-lg font-semibold break-all"
            >
              support@holobots.fun
            </a>
          </p>

          <p>
            Please use the email address connected to your Holobots account and
            include the subject line:
          </p>

          <p className="text-center font-bold text-[#F5C400] uppercase tracking-wider">
            Delete Holobots Account
          </p>

          <p>
            When your request is verified, we will delete or anonymize account
            data associated with your Holobots profile, including gameplay
            progress, Holobot data, inventory, rewards, PvP records, and fitness
            sync data stored by Holobots.
          </p>

          <p>
            Some information may be retained if required for legal, security,
            fraud prevention, dispute resolution, or platform compliance
            purposes.
          </p>

          <p>
            Deletion requests are typically processed within{" "}
            <span className="text-[#F5C400] font-semibold">30 days</span>.
          </p>
        </div>
      </main>
    </div>
  );
};

export default DeleteAccount;
