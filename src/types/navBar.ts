export enum LinkPreset {
  Splitter = 0,
  Test = 1,
}

export type NavBarLink = {
  name: string;
  url: string;
  external?: boolean;
};

export type NavBarConfig = {
  links: (NavBarLink | LinkPreset)[];
};
