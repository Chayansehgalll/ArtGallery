import { getArtDimensions, frameBorderRatio } from "../utils/aspectRatio";
import type { Artwork } from "../data/artworks";
import { cn } from "../utils/cn";

const FRAME_COLORS: Record<string, { frame: string; bevel: string }> = {
  "Black Oak": { frame: "#1a1a1a", bevel: "#2a2a2a" },
  Walnut: { frame: "#5c3a1e", bevel: "#6e4a2a" },
  "White Gold": { frame: "#e8e0cc", bevel: "#f2ecd8" },
  "Natural Oak": { frame: "#c4a77d", bevel: "#d4b98f" },
  Brass: { frame: "#b5a642", bevel: "#c8ba55" },
  "Brushed Steel": { frame: "#8a8a8a", bevel: "#9c9c9c" },
};

interface FramedArtworkProps {
  artwork: Pick<Artwork, "dimensions" | "image" | "title"> & {
    width?: number;
    height?: number;
  };
  /** named frame style; falls back to Black Oak */
  frame?: string;
  /**
   * fit mode:
   *  - "contain": frame+art fit inside the box, centered (no crop, may leave gaps in box)
   *  - "natural": the box adopts the artwork's own aspect ratio (no gaps, no crop)
   */
  mode?: "contain" | "natural";
  className?: string;
  /** show the wall mount shadow */
  shadow?: boolean;
  imgClassName?: string;
  /** disable lazy loading (for above-the-fold hero images) */
  eager?: boolean;
}

/**
 * Renders a painting inside a dynamically generated frame that always
 * preserves the artwork's true aspect ratio. The frame border scales
 * with the painting and frame+art behave as a single unit.
 */
export default function FramedArtwork({
  artwork,
  frame = "Black Oak",
  mode = "natural",
  className,
  shadow = true,
  imgClassName,
  eager = false,
}: FramedArtworkProps) {
  const dims = getArtDimensions(artwork);
  const colors = FRAME_COLORS[frame] || FRAME_COLORS["Black Oak"];
  const borderPct = frameBorderRatio(dims) * 100; // % of the framed unit

  // The frame unit always takes the painting's real aspect ratio.
  // border is applied as padding so art + frame scale together.
  const frameStyle: React.CSSProperties = {
    aspectRatio: dims.cssAspect,
    padding: `${borderPct}%`,
    background: `linear-gradient(135deg, ${colors.frame}, ${colors.bevel} 50%, ${colors.frame})`,
    boxShadow: shadow
      ? "0 20px 50px -12px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.4)"
      : undefined,
  };

  const wrapper =
    mode === "contain"
      ? "max-w-full max-h-full h-full w-full flex items-center justify-center"
      : "w-full";

  return (
    <div className={cn(wrapper, className)}>
      <div
        className="relative"
        style={
          mode === "contain"
            ? { aspectRatio: dims.cssAspect, maxWidth: "100%", maxHeight: "100%", height: "100%" }
            : { width: "100%" }
        }
      >
        {/* Dynamic frame */}
        <div className="relative w-full" style={frameStyle}>
          {/* Inner bevel/mat */}
          <div
            className="relative w-full overflow-hidden"
            style={{
              aspectRatio: dims.cssAspect,
              boxShadow: "inset 0 0 0 2px rgba(0,0,0,0.35), inset 0 2px 8px rgba(0,0,0,0.45)",
            }}
          >
            {/* Painting — never cropped or stretched */}
            <img
              src={artwork.image}
              alt={artwork.title}
              loading={eager ? "eager" : "lazy"}
              className={cn("block w-full h-full", imgClassName)}
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
