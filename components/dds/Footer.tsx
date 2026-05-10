type FooterProps = {
  left: string;
  right: string;
};

export function Footer({ left, right }: FooterProps) {
  return (
    <footer className="px-footer">
      <div>{left}</div>
      <div>{right}</div>
    </footer>
  );
}
