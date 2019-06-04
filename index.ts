import { Counter, CountDownState, ConterStateKeys } from './counter';
import { merge } from 'rxjs';
import { mapTo } from 'rxjs/operators';

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

merge(counterUI.btnStart$.pipe(mapTo(1)), counterUI.btnPause$.pipe(mapTo(0))).subscribe(
  (s: number) => counterUI.renderCounterValue(s)
);
