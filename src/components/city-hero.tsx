"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  ArrowDown,
  ArrowUpRight,
  Compass,
  MapPin,
  MoveHorizontal,
  Sun,
  Waves,
  Landmark,
  Building2,
} from "lucide-react";
import { useMotion, MotionToggle } from "./motion-provider";
const CityScene = dynamic(() => import("./city-scene"), { ssr: false });
const districts = [
  {
    id: "coast",
    label: "The coast",
    category: "Outdoors",
    Icon: Waves,
    description: "Sea air. Slow afternoons.",
  },
  {
    id: "culture",
    label: "The culture",
    category: "Culture",
    Icon: Landmark,
    description: "Old stories. New discoveries.",
  },
  {
    id: "city",
    label: "The city",
    category: "Hidden gems",
    Icon: Building2,
    description: "Little corners. Big possibilities.",
  },
] as const;
export function CityHero({
  onExplore,
}: {
  onExplore: (category: string) => void;
}) {
  const [district, setDistrict] = useState<"coast" | "culture" | "city">(
    "coast",
  );
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const { enabled } = useMotion();
  const root = useRef<HTMLElement>(null);
  const entered = useRef(false);
  const item = districts.find((d) => d.id === district)!;
  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback(() => setFailed(true), []);
  useEffect(() => {
    if (!enabled || !root.current || entered.current) return;
    let cancelled = false;
    let revert = () => {};
    void import("gsap")
      .then(({ gsap }) => {
        if (cancelled) return;
        entered.current = true;
        const ctx = gsap.context(() => {
          gsap.fromTo(
            ".city-title-line",
            { y: 22, opacity: 0.5, filter: "blur(3px)" },
            {
              y: 0,
              opacity: 1,
              filter: "blur(0px)",
              duration: 0.85,
              stagger: 0.1,
              ease: "power3.out",
              clearProps: "all",
            },
          );
          gsap.fromTo(
            ".city-stage",
            { scale: 0.96, opacity: 0.6 },
            {
              scale: 1,
              opacity: 1,
              duration: 1.2,
              ease: "power3.out",
              clearProps: "transform,opacity",
            },
          );
        }, root);
        revert = () => ctx.revert();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      revert();
    };
  }, [enabled]);
  return (
    <section className="city-hero" ref={root} aria-labelledby="city-heading">
      <div className="city-intro">
        <h1 id="city-heading">
          <span className="city-title-line">A whole city.</span>
          <span className="city-title-line">A thousand</span>
          <span className="city-title-line city-title-last">
            little <em>escapes.</em>
            <span className="title-spark" aria-hidden="true">
              <Sun />
            </span>
          </span>
        </h1>
        <p>
          Rediscover Casablanca, one good plan at a time.
          <br />
          The seaside strolls. The hidden corners.
          <br className="wide-only" /> The places that make you say{" "}
          <strong>“let’s go.”</strong>
        </p>
        <div className="city-actions">
          <a className="button city-explore" href="#discover">
            Find my next outing <ArrowUpRight size={19} />
          </a>
          <a
            className="city-secondary"
            href="#discover"
            onClick={() => onExplore("All places")}
          >
            Take a look around <ArrowDown size={16} />
          </a>
        </div>
        <div className="city-local">
          <span className="local-icon">
            <Compass size={18} />
          </span>
          <span>
            Made for the curious.
            <br />
            <strong>Starting in Casablanca.</strong>
          </span>
        </div>
      </div>
      <div className="city-world">
        <div className="city-location">
          <span>
            <MapPin size={14} />
            CASABLANCA, MOROCCO
          </span>
          <Sun size={20} />
        </div>
        <div className={`city-stage ${ready && !failed ? "scene-ready" : ""}`}>
          <div className="city-orbit" aria-hidden="true" />
          <span className="city-backword" aria-hidden="true">
            Casa.
          </span>
          <div className="city-fallback">
            <Image
              unoptimized
              src="https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=1000&q=85"
              width={1000}
              height={800}
              alt="Moroccan architecture, an illustrative introduction to exploring Casablanca"
            />
          </div>
          {!failed && (
            <CityScene
              paused={!enabled}
              activeDistrict={district}
              onReady={onReady}
              onError={onError}
            />
          )}
          <div className="scene-place-label">
            <span className="scene-label-dot" />
            <span>{item.description}</span>
          </div>
        </div>
        <div className="city-scene-footer">
          <span className="scene-hint">
            {ready && !failed ? (
              <>
                <MoveHorizontal size={15} />
                Drag to discover another angle
              </>
            ) : failed ? (
              "A little Moroccan inspiration"
            ) : (
              "Preparing your little escape…"
            )}
          </span>
          <MotionToggle />
        </div>
        <div
          className="district-switch"
          aria-label="Explore a side of Casablanca"
        >
          {districts.map(({ id, label, Icon }) => (
            <button
              key={id}
              aria-pressed={district === id}
              onClick={() => setDistrict(id)}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </div>
        <a
          href="#discover"
          className="district-explore"
          onClick={() => onExplore(item.category)}
        >
          Explore {item.label.toLowerCase()} <ArrowUpRight size={15} />
        </a>
        <span className="scene-disclosure">
          An imaginative city miniature, not a navigation map.
        </span>
      </div>
      <div className="city-bottom-line">
        <span>LESS SEARCHING. MORE EXPLORING.</span>
        <a href="#discover">
          <ArrowDown size={14} /> Your next good day starts below
        </a>
        <span className="city-coordinate">33.57° N · 7.59° W</span>
      </div>
    </section>
  );
}
