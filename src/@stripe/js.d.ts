/* eslint-disable @typescript-eslint/no-explicit-any */

declare module '@stripe/js' {
  export function loadStripe(
    publishableKey: string,
    options?: any
  ): Promise<any>
}
