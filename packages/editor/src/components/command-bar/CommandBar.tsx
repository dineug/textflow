import {
  type ActionImpl,
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarProvider,
  KBarResults,
  KBarSearch,
  useMatches,
} from 'kbar';
import { forwardRef, Fragment, useMemo } from 'react';

import { useAppContext } from '@/components/app-context';
import { cn } from '@/lib/utils';

import { useThemeActions } from './useThemeActions';

const CommandBar: React.FC = () => {
  const { $root } = useAppContext();
  useThemeActions();

  if (!$root) {
    return null;
  }

  return (
    <KBarPortal container={$root}>
      <KBarPositioner>
        <KBarAnimator
          className={cn(
            'bg-popover text-popover-foreground w-full max-w-xl overflow-hidden rounded-md border shadow-md'
          )}
        >
          <KBarSearch
            className={cn(
              'bg-background text-foreground box-border w-full border-none px-4 py-3 text-base outline-none'
            )}
          />
          <RenderResults />
        </KBarAnimator>
      </KBarPositioner>
    </KBarPortal>
  );
};

CommandBar.displayName = 'CommandBar';

const RenderResults: React.FC = () => {
  const { results, rootActionId } = useMatches();

  return (
    <KBarResults
      items={results}
      onRender={({ item, active }) =>
        typeof item === 'string' ? (
          <div className={cn('px-4 py-2 text-[10px] uppercase opacity-50')}>
            {item}
          </div>
        ) : (
          <ResultItem
            action={item}
            active={active}
            currentRootActionId={rootActionId}
          />
        )
      }
    />
  );
};

RenderResults.displayName = 'RenderResults';

type ResultItemProps = {
  action: ActionImpl;
  active: boolean;
  currentRootActionId?: string | null;
};

const ResultItem = forwardRef<HTMLDivElement, ResultItemProps>(
  ({ action, active, currentRootActionId }, ref) => {
    const ancestors = useMemo(() => {
      if (!currentRootActionId) return action.ancestors;
      const index = action.ancestors.findIndex(
        ancestor => ancestor.id === currentRootActionId
      );
      return action.ancestors.slice(index + 1);
    }, [action.ancestors, currentRootActionId]);

    return (
      <div
        ref={ref}
        className={cn(
          'aria-[selected=true]:bg-accent aria-[selected=true]:text-accent-foreground relative flex cursor-default select-none items-center justify-between rounded-sm px-4 py-3 text-sm outline-none',
          'aria-[selected=true]:border-l-foreground border-l-2 border-solid border-l-transparent'
        )}
        aria-selected={active}
      >
        <div className={cn('flex items-center gap-2 text-sm')}>
          {action.icon && action.icon}
          <div className={cn('flex flex-col')}>
            <div>
              {ancestors.length > 0 &&
                ancestors.map(ancestor => (
                  <Fragment key={ancestor.id}>
                    <span className={cn('mr-2 opacity-50')}>
                      {ancestor.name}
                    </span>
                    <span className={cn('mr-2')}>&rsaquo;</span>
                  </Fragment>
                ))}
              <span>{action.name}</span>
            </div>
            {action.subtitle && (
              <span className={cn('text-xs')}>{action.subtitle}</span>
            )}
          </div>
        </div>
        {action.shortcut?.length ? (
          <div aria-hidden className={cn('grid grid-flow-col gap-1')}>
            {action.shortcut.map(sc => (
              <kbd
                key={sc}
                className={cn(
                  'bg-background/10 rounded-md px-[6px] py-1 text-sm'
                )}
              >
                {sc}
              </kbd>
            ))}
          </div>
        ) : null}
      </div>
    );
  }
);

ResultItem.displayName = 'ResultItem';

function withKBarProvider<P extends JSX.IntrinsicAttributes>(
  WrappedComponent: React.FC<P>
) {
  const WithKBarProvider: React.FC<P> = props => {
    return (
      <KBarProvider>
        <WrappedComponent {...props} />
      </KBarProvider>
    );
  };

  WithKBarProvider.displayName = 'WithKBarProvider';

  return WithKBarProvider;
}

export default withKBarProvider(CommandBar);
