import { describe, expect, it } from 'vitest';
import {
  createSession,
  durationMs,
  pause,
  recordKeystroke,
  resume,
  start,
} from '../../src/engine/session';

describe('session state machine', () => {
  it('begins idle, activates on start', () => {
    const s = createSession('lesson', 'l1', 'abc');
    expect(s.status).toBe('idle');
    const a = start(s, 0);
    expect(a.status).toBe('active');
    expect(a.startedAt).toBe(0);
  });

  it('advances on correct keystrokes', () => {
    let s = start(createSession('lesson', 'l1', 'abc'), 0);
    s = recordKeystroke(s, 'a', 100);
    expect(s.index).toBe(1);
    expect(s.keystrokes[0].correct).toBe(true);
    expect(s.keystrokes[0].msSincePrevious).toBe(100);
  });

  it('logs wrong keystrokes and still advances', () => {
    let s = start(createSession('lesson', 'l1', 'abc'), 0);
    s = recordKeystroke(s, 'x', 100); // wrong
    expect(s.index).toBe(1);
    expect(s.keystrokes[0].correct).toBe(false);
    expect(s.keystrokes[0].actual).toBe('x');
  });

  it('backspace steps index back but keeps log intact', () => {
    let s = start(createSession('lesson', 'l1', 'abc'), 0);
    s = recordKeystroke(s, 'x', 100); // wrong → index = 1
    s = recordKeystroke(s, 'Backspace', 150);
    expect(s.index).toBe(0);
    expect(s.keystrokes.length).toBe(1); // log unchanged
    expect(s.keystrokes[0].correct).toBe(false);
  });

  it('marks finished when last index is filled', () => {
    let s = start(createSession('lesson', 'l1', 'ab'), 0);
    s = recordKeystroke(s, 'a', 100);
    s = recordKeystroke(s, 'b', 200);
    expect(s.status).toBe('finished');
  });

  it('pause/resume subtracts paused time from duration', () => {
    let s = start(createSession('lesson', 'l1', 'abcdef'), 0);
    s = recordKeystroke(s, 'a', 100);
    s = pause(s, 1000);
    // 5000 ms later, resume
    s = resume(s, 6000);
    s = recordKeystroke(s, 'b', 6100);
    // active time: from 0 to "now", minus 5000 paused
    const d = durationMs(s, 6100);
    // 6100 - 0 - 5000 = 1100
    expect(d).toBe(1100);
  });
});
