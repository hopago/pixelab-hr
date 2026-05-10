import { Logo } from "./Logo";

type MetaItem = {
  key: string;
  value: string;
};

type MastheadProps = {
  brand?: string;
  subbrand?: string;
  meta?: MetaItem[];
};

export function Masthead({
  subbrand = "Beauty Clinic",
  meta = [],
}: MastheadProps) {
  return (
    <header className="px-masthead">
      <Logo variant="on-dark" size="md" subbrand={subbrand} />
      {meta.length > 0 && (
        <div className="px-doc-meta">
          {meta.map((item, idx) => (
            <div key={idx}>
              <span className="px-meta-key">{item.key}</span>
              {item.value}
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
