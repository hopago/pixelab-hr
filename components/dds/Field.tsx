import type {
  ReactNode,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

type FieldHeaderProps = {
  num?: string;
  title: ReactNode;
  help?: ReactNode;
};

export function FieldHeader({ num, title, help }: FieldHeaderProps) {
  return (
    <>
      <div className="px-field-label">
        {num && <span className="px-field-num">{num}</span>}
        <span className="px-field-title">{title}</span>
      </div>
      {help && <span className="px-field-help">{help}</span>}
    </>
  );
}

type FieldProps = {
  children: ReactNode;
};

export function Field({ children }: FieldProps) {
  return <div className="px-field">{children}</div>;
}

type FieldInputProps = InputHTMLAttributes<HTMLInputElement> & {
  num?: string;
  title?: ReactNode;
  help?: ReactNode;
};

export function FieldInput({ num, title, help, ...rest }: FieldInputProps) {
  return (
    <Field>
      {title && <FieldHeader num={num} title={title} help={help} />}
      <input className="px-field-input" {...rest} />
    </Field>
  );
}

type FieldTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  num?: string;
  title?: ReactNode;
  help?: ReactNode;
};

export function FieldTextarea({
  num,
  title,
  help,
  ...rest
}: FieldTextareaProps) {
  return (
    <Field>
      {title && <FieldHeader num={num} title={title} help={help} />}
      <textarea className="px-field-textarea" {...rest} />
    </Field>
  );
}
