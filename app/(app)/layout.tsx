import OnboardingModal from "@/app/components/onboarding-modal";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
        <OnboardingModal />
        {children}
    </div>
  );
}
