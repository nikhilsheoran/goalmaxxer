import { SignUp } from "@clerk/nextjs";
import { neobrutalism } from "@clerk/themes";

export default function Page() {
  return (
    <SignUp
      appearance={{
        baseTheme: neobrutalism,
      }}
      redirectUrl={"/dashboard"}
    />
  );
}