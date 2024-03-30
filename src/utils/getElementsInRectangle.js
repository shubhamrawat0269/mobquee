export const getElementsInRectangle = (rect) => {
  const elements = document.querySelectorAll(".ui-element"); // Add appropriate selector
  // console.log(elements);
  const selectedElements = [];

  elements.forEach((element) => {
    const elementRect = element.getBoundingClientRect();
    if (
      elementRect.left >= rect.left &&
      elementRect.right <= rect.left + rect.width &&
      elementRect.top >= rect.top &&
      elementRect.bottom <= rect.top + rect.height
    ) {
      selectedElements.push(element);
    }
  });
  return selectedElements;
};
