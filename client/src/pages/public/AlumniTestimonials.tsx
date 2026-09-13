import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { EmptyState, LoadingState, SectionHeader, TestimonialCard } from "../../components/ui";

export function AlumniTestimonials() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/public/alumni-testimonials").then((r) => setItems(r.data.testimonials)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="container-page py-16">
      <SectionHeader eyebrow="Alumni" title="Alumni Testimonials" description="Experiences shared by AGI alumni about their placement journey." />
      <div className="mt-10">
        {loading ? <LoadingState /> : items.length === 0 ? (
          <EmptyState title="No testimonials published yet" description="Data to be updated." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((t) => (
              <TestimonialCard key={t.id} name={t.name} sub={`${t.batch} · ${t.organization}`} text={t.testimonial} photoUrl={t.photoUrl} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
