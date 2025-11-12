type Listener = (loading: boolean) => void;

let count = 0;
const listeners = new Set<Listener>();

const notify = () => {
  const isLoading = count > 0;
  listeners.forEach((l) => l(isLoading));
};

export const onChange = (listener: Listener) => {
  listeners.add(listener);
  
  listener(count > 0);
  return () => {
    listeners.delete(listener);
  };
};

export const show = () => {
  count += 1;
  notify();
};

export const hide = () => {
  if (count > 0) count -= 1;
  notify();
};

export const reset = () => {
  count = 0;
  notify();
};

export const isLoading = () => count > 0;

export default {
  onChange,
  show,
  hide,
  reset,
  isLoading,
};
