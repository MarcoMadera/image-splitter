// eslint-disable-next-line import/no-extraneous-dependencies
import { icons } from "@iconify-json/ep";
import { type ToastOptions, ToastTypes, type WrapperProps } from "types/toast";
import { generateId } from "utils";

const TOAST_LOCATIONS: string[] = [
  "top-right",
  "top-center",
  "top-left",
  "bottom-right",
  "bottom-center",
  "bottom-left",
];

const TOAST_ICONS: Record<ToastTypes, string> = {
  success: `<svg width='24' height='24' viewBox='0 0 1024 1024'>${icons.icons["success-filled"]?.body}</svg>`,
  error: `<svg width='24' height='24' viewBox='0 0 1024 1024'>${icons.icons["circle-close-filled"]?.body}</svg>`,
  warning: `<svg width='24' height='24' viewBox='0 0 1024 1024'>${icons.icons["warn-triangle-filled"]?.body}</svg>`,
  info: `<svg width='24' height='24' viewBox='0 0 1024 1024'>${icons.icons["info-filled"]?.body}</svg>`,
};

const toastClasses: Record<ToastTypes, string[]> = {
  [ToastTypes.SUCCESS]: [
    ToastTypes.SUCCESS,
    "bg-green-500",
    "border-green-600",
  ],
  [ToastTypes.ERROR]: [ToastTypes.ERROR, "bg-red-500", "border-red-600"],
  [ToastTypes.WARNING]: [
    ToastTypes.WARNING,
    "bg-yellow-500",
    "border-yellow-600",
  ],
  [ToastTypes.INFO]: [ToastTypes.INFO, "bg-blue-500", "border-blue-600"],
};

const createToastContainer = (location: string) => {
  const toaster = document.createElement("div");
  toaster.id = "toaster";
  toaster.className = `toaster ${location}`;
  document.body.appendChild(toaster);

  const rack = document.createElement("ol");
  rack.id = "wrapperContainer";
  rack.className = "rack";
  toaster.appendChild(rack);

  return toaster;
};

const getToastContainer = (location?: string) => {
  let toaster = document.getElementById("toaster");

  if (!toaster) {
    toaster = createToastContainer(location ?? "top-right");
  } else {
    TOAST_LOCATIONS.forEach((loc) => toaster?.classList.remove(loc));
    toaster.classList.add(`toaster`, location ?? "top-right");
  }

  return toaster;
};

export const despawnToast = (toastId: string, wrapper: WrapperProps): void => {
  const toast = document.getElementById(toastId);
  if (!toast) return;

  toast.classList.add("fadeOutToast");
  setTimeout(() => {
    try {
      toast.style.opacity = "0";
      toast.parentNode?.removeChild(toast);
      wrapper.options.currentToasts--;
      clearTimeout(wrapper.timers[toastId]);
      delete wrapper.timers[toastId];
    } catch (e) {}

    if (wrapper.options.currentToasts === 0) {
      const toaster = document.getElementById("toaster");
      toaster?.parentNode?.removeChild(toaster);
    }
  }, 500);
};

export const createToastElement = (
  wrapper: WrapperProps,
  { message, type = ToastTypes.INFO, location }: ToastOptions
): HTMLElement => {
  const toast = document.createElement("li");
  toast.className =
    "toast cursor-pointer text-white border-2 rounded-md py-3 px-4 flex items-center gap-2 max-w-sm w-full transform transition-transform duration-500 ease-in-out";

  toast.classList.add(...toastClasses[type]);

  const isTopLocation =
    location &&
    (location.includes("top-right") ||
      location.includes("top-center") ||
      location.includes("top-left"));
  const isBottomLocation =
    location &&
    (location.includes("bottom-right") ||
      location.includes("bottom-center") ||
      location.includes("bottom-left"));

  if (isTopLocation) toast.classList.add("toastDown");
  if (isBottomLocation) toast.classList.add("toastUp");

  const toastIcon = document.createElement("div");
  toastIcon.className = "icon";
  toastIcon.innerHTML = TOAST_ICONS[type];
  toast.appendChild(toastIcon);

  if (message) {
    const toastMessage = document.createElement("div");
    toastMessage.className = "message";
    toastMessage.textContent = message;
    toast.appendChild(toastMessage);
  }

  toast.addEventListener("click", () => {
    despawnToast(toast.id, wrapper);
  });

  setTimeout(() => {
    toast.classList.remove("toastDown", "toastUp");
  }, 500);

  return toast;
};

const getExistingToast = (type: ToastTypes, message: string) => {
  const existingToasts = document.querySelectorAll(`.toast.${type}`);
  for (const toast of existingToasts) {
    const toastMessage = toast.querySelector(".message");
    if (toastMessage && toastMessage.textContent === message) {
      return toast;
    }
  }
  return null;
};

export const wrapper: WrapperProps = {
  options: {
    maxToasts: 4,
    toastLife: 7000,
    currentToasts: 0,
    stackedToasts: true,
  },
  timers: {},
  toast({ message, type = ToastTypes.INFO, location = "top-right" }) {
    getToastContainer(location);
    const existingToast = getExistingToast(type, message);

    if (existingToast) {
      existingToast.classList.add("shake");
      setTimeout(() => {
        existingToast.classList.remove("shake");
      }, 500);
      clearTimeout(wrapper.timers[existingToast.id]);
      wrapper.timers[existingToast.id] = setTimeout(() => {
        despawnToast(existingToast.id, wrapper);
      }, wrapper.options.toastLife);
      return;
    }

    if (wrapper.options.currentToasts >= wrapper.options.maxToasts) {
      const oldestToast =
        document.getElementById("wrapperContainer")?.firstChild;
      if (oldestToast) {
        document.getElementById("wrapperContainer")?.removeChild(oldestToast);
        wrapper.options.currentToasts--;
      }
    }

    const toast = createToastElement(wrapper, {
      message,
      type,
      location,
    });
    wrapper.options.currentToasts++;
    toast.id = `wrapperToast-${generateId()}`;
    document.getElementById("wrapperContainer")?.appendChild(toast);

    wrapper.timers[toast.id] = setTimeout(() => {
      despawnToast(toast.id, wrapper);
    }, wrapper.options.toastLife);
  },
};
