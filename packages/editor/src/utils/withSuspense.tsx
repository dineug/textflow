import { Suspense } from 'react';

export function withSuspense<P extends JSX.IntrinsicAttributes>(
  WrappedComponent: React.FC<P>
) {
  const WithSuspense: React.FC<P> = props => (
    <Suspense fallback={null}>
      <WrappedComponent {...props} />
    </Suspense>
  );

  WithSuspense.displayName = 'WithSuspense';

  return WithSuspense;
}
