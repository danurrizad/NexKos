import LoginForm from "@/components/auth/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | NexKos",
  description: "Login to NexKos",
};

export default function Login() {
  return <LoginForm />;
}
