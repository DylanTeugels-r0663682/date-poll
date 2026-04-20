import { ShellHeader } from "@/components/ShellHeader";
import { CreateEventForm } from "@/components/CreateEventForm";

export const metadata = {
  title: "New event — date-poll",
};

export default function NewEventPage() {
  return (
    <main className="min-h-dvh">
      <ShellHeader />
      <div className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="text-3xl font-bold tracking-tight">Create an event</h1>
        <p className="mt-2 text-sm text-muted">
          Friends will mark the days they <span className="font-semibold text-foreground">can&rsquo;t</span> attend.
          No one needs to sign up.
        </p>
        <div className="mt-8">
          <CreateEventForm />
        </div>
      </div>
    </main>
  );
}
