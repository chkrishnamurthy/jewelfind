import { Gem, Sparkles } from "lucide-react";
import { clsx } from "clsx";

export function JewelryVisual({ tone = "amber", compact = false, dataUrl, alt = "Jewellery reference" }: { tone?: string; compact?: boolean; dataUrl?: string; alt?: string }) {
  // Blob/data URLs are user-selected previews and cannot use Next Image optimization.
  // eslint-disable-next-line @next/next/no-img-element
  if (dataUrl) return <div className={clsx("jewelry-visual jewelry-visual--image", compact && "jewelry-visual--compact")}><img src={dataUrl} alt={alt} /></div>;
  return (
    <div className={clsx("jewelry-visual", `jewelry-visual--${tone}`, compact && "jewelry-visual--compact")} role="img" aria-label={alt}>
      <span className="jewelry-visual__glow" />
      <Gem className="jewelry-visual__gem" strokeWidth={1.2} />
      <Sparkles className="jewelry-visual__sparkle" strokeWidth={1.5} />
    </div>
  );
}
