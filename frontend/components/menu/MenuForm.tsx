'use client';

import { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { uploadMenuImage } from '@/lib/supabase/uploadMenuImage';
import type { MenuItem, MenuCategory, MenuBadge } from '@/lib/types';

export interface MenuFormValues {
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  calories: number;
  protein?: number;
  fat?: number;
  ingredients: string[];
  badges: MenuBadge[];
  imageUrl: string;
  isAvailable: boolean;
  stock: number;
}

interface MenuFormProps {
  initial?: MenuItem;
  onSubmit: (values: MenuFormValues) => void | Promise<void>;
  submitLabel: string;
}

const CATEGORY_OPTIONS: { id: MenuCategory; label: string }[] = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'snacks', label: 'Snacks' },
  { id: 'drinks', label: 'Drinks' },
];

const BADGE_OPTIONS: MenuBadge[] = ['best-seller', 'kids-favorite', 'healthy-choice', 'spicy', 'quick-grab', 'vegetarian', 'halal'];

function placeholderImage(label: string) {
  return `https://placehold.co/480x320/ff5f1f/ffffff?font=roboto&text=${encodeURIComponent(label || 'Menu')}`;
}

export default function MenuForm({ initial, onSubmit, submitLabel }: MenuFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [price, setPrice] = useState(initial?.price?.toString() ?? '');
  const [category, setCategory] = useState<MenuCategory>(initial?.category ?? 'lunch');
  const [calories, setCalories] = useState(initial?.calories?.toString() ?? '');
  const [protein, setProtein] = useState(initial?.protein?.toString() ?? '');
  const [fat, setFat] = useState(initial?.fat?.toString() ?? '');
  const [ingredients, setIngredients] = useState(initial?.ingredients?.join(', ') ?? '');
  const [badges, setBadges] = useState<MenuBadge[]>(initial?.badges ?? []);
  const [stock, setStock] = useState(initial?.stock?.toString() ?? '10');
  const [isAvailable, setIsAvailable] = useState(initial?.isAvailable ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initial?.imageUrl ?? null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, image: 'File harus berupa gambar (PNG, JPG, dll).' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: 'Ukuran gambar maksimal 5MB.' }));
      return;
    }

    setErrors((prev) => ({ ...prev, image: undefined as unknown as string }));
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const toggleBadge = (badge: MenuBadge) => {
    setBadges((prev) => (prev.includes(badge) ? prev.filter((b) => b !== badge) : [...prev, badge]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (name.trim().length < 3) nextErrors.name = 'Nama minimal 3 karakter';
    if (!price || Number(price) <= 0) nextErrors.price = 'Harga harus lebih dari 0';
    if (!calories || Number(calories) < 0) nextErrors.calories = 'Kalori wajib diisi';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);

    let imageUrl = initial?.imageUrl ?? placeholderImage(name);
    if (imageFile) {
      setIsUploading(true);
      try {
        imageUrl = await uploadMenuImage(imageFile);
      } catch (err) {
        setIsUploading(false);
        setIsSubmitting(false);
        setErrors((prev) => ({
          ...prev,
          image: err instanceof Error ? err.message : 'Gagal upload foto, coba lagi.',
        }));
        return;
      }
      setIsUploading(false);
    }

    await onSubmit({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      category,
      calories: Number(calories),
      protein: protein ? Number(protein) : undefined,
      fat: fat ? Number(fat) : undefined,
      ingredients: ingredients
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      badges,
      imageUrl,
      isAvailable,
      stock: Number(stock) || 0,
    });

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input label="Nama Menu" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />

      <div className="flex flex-col gap-2">
        <label className="font-mono text-label-bold uppercase tracking-wide">Foto Menu</label>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 border-2 border-outline bg-surface-container overflow-hidden shrink-0 flex items-center justify-center">
            {imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imagePreview} alt="Preview foto menu" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl" aria-hidden>
                🍽️
              </span>
            )}
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleImageChange}
              className="font-mono text-label-sm file:squishy file:mr-3 file:border-2 file:border-outline file:bg-secondary-container file:px-3 file:py-2 file:font-mono file:text-label-sm file:uppercase file:font-bold file:cursor-pointer cursor-pointer"
            />
            <span className="font-mono text-label-sm text-on-surface-variant">PNG, JPG, atau WEBP, maks 5MB.</span>
            {!imagePreview && (
              <span className="font-mono text-label-sm text-on-surface-variant">
                Belum pilih foto? Placeholder otomatis dipakai.
              </span>
            )}
          </div>
        </div>
        {errors.image && <span className="font-mono text-label-sm text-error uppercase">{errors.image}</span>}
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-mono text-label-bold uppercase tracking-wide">Deskripsi</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full border-2 border-outline bg-surface-container-lowest px-4 py-3 font-body-md text-body-md outline-none focus:shadow-sm resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Harga (Rp)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} error={errors.price} />
        <Input label="Stok" type="number" value={stock} onChange={(e) => setStock(e.target.value)} />
      </div>

      <div>
        <label className="font-mono text-label-bold uppercase tracking-wide block mb-2">Kategori</label>
        <div className="grid grid-cols-4 gap-2">
          {CATEGORY_OPTIONS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={`squishy border-2 border-outline px-3 py-2 font-mono text-label-sm uppercase ${
                category === c.id ? 'bg-primary-container text-on-primary shadow-none translate-x-1 translate-y-1' : 'bg-surface-container-lowest shadow-sm'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Input label="Kalori" type="number" value={calories} onChange={(e) => setCalories(e.target.value)} error={errors.calories} />
        <Input label="Protein (g)" type="number" value={protein} onChange={(e) => setProtein(e.target.value)} />
        <Input label="Lemak (g)" type="number" value={fat} onChange={(e) => setFat(e.target.value)} />
      </div>

      <Input
        label="Bahan (pisahkan dengan koma)"
        value={ingredients}
        onChange={(e) => setIngredients(e.target.value)}
        placeholder="Nasi, Ayam, Telur"
      />

      <div>
        <label className="font-mono text-label-bold uppercase tracking-wide block mb-2">Badge</label>
        <div className="flex flex-wrap gap-2">
          {BADGE_OPTIONS.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => toggleBadge(b)}
              className={`squishy border-2 border-outline px-3 py-2 font-mono text-label-sm uppercase ${
                badges.includes(b) ? 'bg-secondary-container shadow-none translate-x-1 translate-y-1' : 'bg-surface-container-lowest shadow-sm'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-3 font-mono text-label-bold uppercase cursor-pointer w-fit">
        <input type="checkbox" className="brutal-checkbox" checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} />
        Tersedia untuk dijual
      </label>

      <Button type="submit" variant="primary" fullWidth disabled={isSubmitting}>
        {isUploading ? 'Mengupload foto...' : isSubmitting ? 'Menyimpan...' : submitLabel}
      </Button>
    </form>
  );
}
