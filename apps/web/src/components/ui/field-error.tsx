type FieldErrorProps = {
  message?: string[] | string;
};

export function FieldError({ message }: FieldErrorProps) {
  if (!message) {
    return null;
  }

  const text = Array.isArray(message) ? message[0] : message;

  if (!text) {
    return null;
  }

  return <p className="mt-2 text-xs text-danger">{text}</p>;
}
