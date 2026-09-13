import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { EmptyState, LoadingState, SectionHeader, TestimonialCard } from "../../components/ui";

export function IndustrySpeaks() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/public/industry-testimonials").then((r) => setItems(r.data.testimonials)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="container-page py-16">
      <SectionHeader eyebrow="Industry Voices" title="Industry Speaks" description="Perspectives shared by recruiting partners engaging with AGI students." />
      <div className="mt-10">
        {loading ? <LoadingState /> : items.length === 0 ? (
          <EmptyState title="No testimonials published yet" description="Data to be updated." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((t) => (
              <TestimonialCard key={t.id} name={t.name} sub={`${t.designation}, ${t.company?.name ?? ""}`} text={t.testimonial} photoUrl={t.photoUrl} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
