import Form from 'next/form';

import { Input } from './ui/input';
import { Label } from './ui/label';

export function AuthForm({
  action,
  children,
  defaultEmail = '',
  type = "signup"
}: {
  action: NonNullable<
    string | ((formData: FormData) => void | Promise<void>) | undefined
  >;
  children: React.ReactNode;
  defaultEmail?: string;
  type?: string;
}) {
  return (
    <Form action={action} className="flex flex-col gap-4 px-4 sm:px-16">
      {type === "signup" && (
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="email"
            className="text-zinc-600 font-normal dark:text-zinc-400"
          >
            Name
          </Label>

          <Input
            id="name"
            name="name"
            className="bg-muted text-md md:text-sm"
            type="text"
            placeholder="Makrov"
            autoComplete="name"
            required
            autoFocus
            defaultValue={defaultEmail}
          />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="email"
          className="text-zinc-600 font-normal dark:text-zinc-400"
        >
          Email Address
        </Label>

        <Input
          id="email"
          name="email"
          className="bg-muted text-md md:text-sm"
          type="email"
          placeholder="user@acme.com"
          autoComplete="email"
          required
          autoFocus
          defaultValue={defaultEmail}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="password"
          className="text-zinc-600 font-normal dark:text-zinc-400"
        >
          Password
        </Label>

        <Input
          id="password"
          name="password"
          className="bg-muted text-md md:text-sm"
          type="password"
          required
        />
      </div>

      {children}
    </Form>
  );
}
