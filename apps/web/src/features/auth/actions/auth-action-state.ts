export type AuthActionState = {
  ok: boolean;
  message: string | null;
  errors?: Record<string, string[] | undefined>;
};

export const initialAuthActionState: AuthActionState = {
  ok: false,
  message: null,
  errors: {},
};
