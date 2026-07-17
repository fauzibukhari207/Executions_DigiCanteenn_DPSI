/**
 * Helper penggabung className minimalis (pengganti ringan library `clsx`)
 * supaya kita tidak menambah dependency hanya untuk ini.
 */
type ClassValue = string | number | boolean | null | undefined;

export default function clsx(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ');
}
