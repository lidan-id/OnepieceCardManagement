type PackInfo = {
  id: string;
  raw_title: string;
  title_parts: {
    prefix: string;
    title: string;
    label: string;
  };
};

export type { PackInfo };
