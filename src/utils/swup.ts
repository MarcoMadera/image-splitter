interface SwupHookEvent {
  to: {
    url: string;
  };
}

interface Swup {
  hooks: {
    on(event: string, callback: (e: SwupHookEvent) => void): void;
    off(event: string, callback: (e: SwupHookEvent) => void): void;
  };
}

declare global {
  interface Window {
    swup: Swup | undefined;
  }
}

export function onSwup(
  event: string,
  callback: () => void,
  onCurrentPath: boolean = true
): void {
  const currentPath = window.location.pathname;
  window.addEventListener("DOMContentLoaded", callback);
  const setup = () => {
    window.swup?.hooks?.on(event, (e) => {
      if (onCurrentPath && e?.to?.url === currentPath) {
        callback();
      } else if (onCurrentPath) {
        window.swup?.hooks?.off(event, callback);
      } else {
        callback();
      }
    });
  };

  if (window.swup?.hooks) {
    setup();
  } else {
    document.addEventListener("swup:enable", setup);
  }
}
