import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import Bootstrap from './Bootstrap';

// Suppress benign ResizeObserver loop errors (browser quirk; often with toasts/layout)
const isResizeObserverLoop = (msg: string | undefined) => {
  if (typeof msg !== 'string') return false;
  return (
    msg.includes('ResizeObserver loop limit exceeded') ||
    msg.includes('ResizeObserver loop completed with undelivered notifications')
  );
};

const prevOnError = window.onerror;
window.onerror = function (message, source, lineno, colno, error) {
  const msg = typeof message === 'string' ? message : error?.message;
  if (isResizeObserverLoop(msg)) {
    return true;
  }
  return prevOnError
    ? prevOnError.call(this, message, source, lineno, colno, error)
    : false;
};

const handleWindowError = (ev: ErrorEvent) => {
  if (isResizeObserverLoop(ev.message)) {
    ev.stopImmediatePropagation();
    ev.stopPropagation();
    ev.preventDefault();
  }
};

window.addEventListener('error', handleWindowError, true);
window.addEventListener('unhandledrejection', (ev) => {
  if (isResizeObserverLoop(ev.reason?.message)) {
    ev.preventDefault();
  }
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Bootstrap />
  </React.StrictMode>
);
