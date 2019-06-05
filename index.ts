import { Counter, CountDownState, ConterStateKeys } from './counter';
import { merge, NEVER, Observable, timer, pipe, UnaryFunction, combineLatest, Subject } from 'rxjs';
import {
  mapTo,
  switchMap,
  scan,
  startWith,
  pluck,
  distinctUntilChanged,
  tap,
  withLatestFrom,
  map
} from 'rxjs/operators';

// = CONSTANTS ===========================================================
const initialConterState: CountDownState = {
  isTicking: false,
  count: 0,
  countUp: true,
  tickSpeed: 200,
  countDiff: 1
};

const counterUI = new Counter(document.body, {
  initialSetTo: initialConterState.count + 10,
  initialTickSpeed: initialConterState.tickSpeed,
  initialCountDiff: initialConterState.countDiff
});

// = BASE OBSERVABLES  ====================================================
// == SOURCE OBSERVABLES ==================================================
// === STATE OBSERVABLES ==================================================
const updateStateSubject: Subject<Partial<CountDownState>> = new Subject();
const counterCommands$ = merge<Partial<CountDownState>>(
  counterUI.btnStart$.pipe(mapTo({ isTicking: true })),
  counterUI.btnPause$.pipe(mapTo({ isTicking: false })),
  counterUI.btnSetTo$.pipe(map(n => ({ count: n }))),
  counterUI.btnUp$.pipe(mapTo({ countUp: true })),
  counterUI.btnDown$.pipe(mapTo({ countUp: false })),
  updateStateSubject.asObservable()
);

const counterState$: Observable<CountDownState> = counterCommands$.pipe(
  startWith(initialConterState),
  scan((state: CountDownState, change) => ({ ...state, ...change }))
);

// === INTERACTION OBSERVABLES ============================================
// Counter takes care of abstracting that

// == INTERMEDIATE OBSERVABLES ============================================
const count$ = counterState$.pipe(pluck<CountDownState, number>(ConterStateKeys.count));
const isTicking$ = counterState$.pipe(
  queryChange<CountDownState, boolean>(ConterStateKeys.isTicking)
);
const tickSpeed$ = counterState$.pipe(
  queryChange<CountDownState, number>(ConterStateKeys.tickSpeed)
);

const counterUpdateTrigger$ = combineLatest([isTicking$, tickSpeed$]).pipe(
  switchMap(([isTicking, tickSpeed]) => (isTicking ? timer(0, tickSpeed) : NEVER))
);
// = SIDE EFFECTS =========================================================
// == UI INPUTS ===========================================================
const renderCountChange$ = count$.pipe(tap(count => counterUI.renderCounterValue(count)));
const readerSetTo$ = counterUI.btnReset$.pipe(tap(() => counterUI.renderSetToInputValue('10')));

// == UI OUTPUTS ==========================================================
const updateCount$ = counterUpdateTrigger$.pipe(
  withLatestFrom(counterState$, (_, { count, countUp, countDiff }) => ({
    count,
    countUp,
    countDiff
  })),
  tap(({ count, countUp, countDiff }) =>
    updateStateSubject.next({ count: count + countDiff * (countUp ? +1 : -1) })
  )
);
const updateTickSpeed$ = counterUI.inputTickSpeed$.pipe(
  tap(tickSpeed => updateStateSubject.next({ tickSpeed }))
);

const updateCountDiff$ = counterUI.inputCountDiff$.pipe(
  tap(countDiff => updateStateSubject.next({ countDiff }))
);

// == SUBSCRIPTION ========================================================
merge(
  renderCountChange$,
  updateCount$,
  readerSetTo$,
  updateTickSpeed$,
  updateCountDiff$
).subscribe();

// = HELPER ===============================================================
// = CUSTOM OPERATORS =====================================================
// == CREATION METHODS ====================================================

// == OPERATORS ===========================================================

function queryChange<T, I>(key: string): UnaryFunction<Observable<T>, Observable<I>> {
  return pipe(
    pluck<T, I>(key),
    distinctUntilChanged<I>()
  );
}
