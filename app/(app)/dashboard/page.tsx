import { UserButton } from "@clerk/nextjs";

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-4 items-center justify-center h-screen">
      <h1>Protected Route</h1>
      <p>This is a protected route. Only logged in users can access this page.</p>
      <UserButton />
    </div>
  );
}