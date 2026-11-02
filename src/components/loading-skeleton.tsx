export function LoadingSkeleton({label}: {label:string}) {
  return <div role="status" aria-label={label} className="loading-skeleton"><i/><i/><i/></div>;
}
