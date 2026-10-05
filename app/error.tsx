"use client";

import { useEffect } from "react";
import { ErrorState } from "@/src/components/ui";
import { MarketingHeader } from "@/src/components/layouts/marketing";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) { useEffect(() => { console.error(error); }, [error]); return <><MarketingHeader /><main className="section"><div className="narrow"><ErrorState title="The page could not be displayed" message="Your demo data is safe in this browser. Try rendering the page again." onRetry={reset} /></div></main></>; }
