export function setClickOutsideToClose(
  panel: string,
  idsToIgnore: string[]
): void {
  document.addEventListener("click", (event) => {
    const panelElement = document.getElementById(panel);
    const panelElementEventTarget = event.target;

    for (let id of idsToIgnore) {
      const element = document.getElementById(id);
      if (
        element == panelElement ||
        element?.contains(panelElementEventTarget as Node)
      ) {
        return;
      }
    }
    panelElement?.classList.add("closed");
  });
}
