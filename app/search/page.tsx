import { Suspense } from "react";
import { SearchExperience } from "@/components/SearchExperience";

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-16 text-sm text-[#6b6b7b]">
          Loading buses...
        </main>
      }
    >
      <SearchExperience />
    </Suspense>
  );
}
