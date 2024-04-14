export function setClickOutsideToClose(
  panel: string,
  idsToIgnore: string[]
): void {
  document.addEventListener("click", (event) => {
    const panelElement = document.getElementById(panel);
    const isClickInsidePanel = panelElement?.contains(event.target as Node);
    const isClickInsideIgnoredElement = idsToIgnore.some((id) =>
      document.getElementById(id)?.contains(event.target as Node)
    );

    if (!isClickInsidePanel && !isClickInsideIgnoredElement) {
      panelElement?.classList.add("closed");
    }
  });
}
