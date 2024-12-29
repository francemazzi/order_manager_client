import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Order Manager</h1>
        <Link href="/auth">
          <Button size="lg">Entra</Button>
        </Link>
      </div>
    </main>
  );
}
