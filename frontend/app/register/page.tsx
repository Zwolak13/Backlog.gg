"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register, RegisterData, ApiResponse, User } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();
  
  // Typowanie stanu formularza
  const [form, setForm] = useState<RegisterData>({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data: ApiResponse<User> = await register(form);

      if (data.error) {
        setError(data.error);
      } else if (data.user) {
        router.push("/dashboard");
      }
    } catch {
      setError("Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80 mx-auto mt-20">
      <Input
        placeholder="Username"
        value={form.username}
        onChange={(e) => setForm({ ...form, username: e.target.value })}
      />
      <Input
        placeholder="Email"
        type="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <Input
        placeholder="Password"
        type="password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      {error && <p className="text-red-500">{error}</p>}
      <Button type="submit">Register</Button>
    </form>
  );
}