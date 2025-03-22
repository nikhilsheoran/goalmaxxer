import OnboardingModal from "@/app/components/onboarding-modal";
import { getOnBoardingDone } from "@/app/actions/serverActions";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const isOnBoardingDone = await getOnBoardingDone();
  return (
    <div className="flex h-screen w-full">
        <OnboardingModal isOnBoardingDone={isOnBoardingDone} />
        {children}
    </div>
  );
}
