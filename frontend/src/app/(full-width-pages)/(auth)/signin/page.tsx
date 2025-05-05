import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | NexKos",
  description: "Login to NexKos",
};

export default function SignIn() {
  return <SignInForm />;
}
