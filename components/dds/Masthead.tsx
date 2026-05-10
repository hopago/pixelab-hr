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
  brand = "Pixelab",
  subbrand = "Beauty Clinic",
  meta = [],
}: MastheadProps) {
  return (
    <header className="px-masthead">
      <div>
        <div className="px-wordmark">{brand}</div>
        <div className="px-subbrand">{subbrand}</div>
      </div>
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
