export const filstorrelse = (b: number) => (b >= 1024 * 1024 ? `${(b / 1024 / 1024).toLocaleString('nb-NO', { maximumFractionDigits: 1 })} MB` : `${Math.max(1, Math.round(b / 1024))} kB`);
export const kanVises = (type: string) => /^image\/(jpeg|png|webp)$/.test(type);
export const MAKS_VEDLEGG = 6;
export const TILLATTE_TYPER = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf'];
