"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarCheck, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-6 tracking-tight lg:text-5xl">
          CORAL for Student Organizations
        </h1>
        <p className="text-xl text-muted-foreground mb-4 max-w-3xl mx-auto">
          Centralized Online Record for Attendance and Logging
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button asChild size="lg">
            <Link href="/login">Login</Link>
          </Button>
          <Button variant="outline" size="lg">
            <Link href="#">Contact Us</Link>
          </Button>
        </div>
      </section>

      {/* Feature Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border/50">
          <CalendarCheck className="h-10 w-10 text-primary mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            Event Attendance Tracking
          </h2>
          <p className="text-muted-foreground">
            Record attendance at meetings, seminars, and special events.
          </p>
        </div>
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border/50">
          <BarChart3 className="h-10 w-10 text-primary mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            Simple Attendance Analytics
          </h2>
          <p className="text-muted-foreground">
            Instantly see how many members attended each event and track
            participation trends at a glance.
          </p>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-primary/10 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">
          Ready to boost your student operations?
        </h2>
        <p className="mb-6 text-muted-foreground max-w-2xl mx-auto">
          Join other VSU student organizations using SAMS to streamline their
          events and track member participation.
        </p>
        <Button asChild size="lg">
          <Link href="#">Contact Us</Link>
        </Button>
      </section>
    </div>
  );
}
