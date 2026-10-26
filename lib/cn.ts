export const cn = (...klasser: (string | false | null | undefined)[]) => klasser.filter(Boolean).join(' ');
