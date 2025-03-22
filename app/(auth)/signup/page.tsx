import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-transparent">
      <div className="w-full max-w-md p-6">
        <SignUp 
          appearance={{
            elements: {
              formButtonPrimary: "bg-primary hover:bg-primary/90",
              footerActionLink: "text-primary hover:text-primary/90"
            }
          }}
          afterSignUpUrl="/dashboard"
          signInUrl="/login"
        />
      </div>
    </div>
  );
} 