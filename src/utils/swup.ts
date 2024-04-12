interface Swup {
  hooks: {
    on(event: string, callback: () => void): void;
  };
}

declare global {
  interface Window {
    swup: Swup | undefined;
  }
}

export function onSwup(event: string, callback: () => void): void {
  window.addEventListener("DOMContentLoaded", callback);
  const setup = () => {
    window.swup?.hooks?.on(event, () => {
      callback();
    });
  };
  if (window.swup?.hooks) {
    setup();
  } else {
    document.addEventListener("swup:enable", setup);
  }
}
