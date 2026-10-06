'use client';

import { useCallback, useRef, useState } from 'react';

interface CloudinaryUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  /** Ek hi image allow karein (category cover, logo, hero bg waghera). */
  single?: boolean;
  /** Dropzone ki doosri line — recommended image size batayein. */
  hint?: string;
  /** Jab koi image na ho to dikhne wali line. */
  emptyHint?: string;
  ariaLabel?: string;
}

interface UploadingFile {
  id: string;
  name: string;
  progress: 'uploading' | 'done' | 'error';
  error?: string;
}

export function CloudinaryUploader({
  images,
  onChange,
  single = false,
  hint = 'JPG, PNG, WebP — upload hote hi WebP mein convert ho jata hai (max 15 MB)',
  emptyHint = 'Abhi koi photo nahi. Photo yahan click/drop karein.',
  ariaLabel = 'Upload images',
}: CloudinaryUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const uploadFile = useCallback(
    async (file: File) => {
      const id = `${Date.now()}-${Math.random()}`;
      setUploading((prev) => [...prev, { id, name: file.name, progress: 'uploading' }]);

      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
        const data = (await res.json()) as { ok: boolean; url?: string; error?: string };

        if (!res.ok || !data.ok || !data.url) {
          setUploading((prev) =>
            prev.map((u) => (u.id === id ? { ...u, progress: 'error', error: data.error ?? 'Upload failed' } : u))
          );
          return;
        }

        onChange(single ? [data.url] : [...images, data.url]);
        setUploading((prev) => prev.map((u) => (u.id === id ? { ...u, progress: 'done' } : u)));

        // Remove successful entry after 1.5 s
        setTimeout(() => {
          setUploading((prev) => prev.filter((u) => u.id !== id));
        }, 1500);
      } catch {
        setUploading((prev) =>
          prev.map((u) => (u.id === id ? { ...u, progress: 'error', error: 'Network error' } : u))
        );
      }
    },
    [images, onChange, single]
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
      Array.from(files).forEach((file) => {
        if (!allowed.includes(file.type)) return;
        uploadFile(file);
      });
    },
    [uploadFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const move = (from: number, to: number) => {
    const next = [...images];
    [next[from], next[to]] = [next[to], next[from]];
    onChange(next);
  };

  const remove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="uploader-root">
      {/* Drop zone */}
      <div
        className={`uploader-dropzone${dragOver ? ' uploader-dropzone--active' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
        aria-label={ariaLabel}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={!single}
          className="uploader-hidden-input"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="uploader-dropzone-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <p className="uploader-dropzone-label">Click karein ya photo yahaan drop karein</p>
        <p className="uploader-dropzone-hint">{hint}</p>
      </div>

      {/* Uploading progress */}
      {uploading.length > 0 && (
        <div className="uploader-progress-list">
          {uploading.map((u) => (
            <div key={u.id} className={`uploader-progress-item uploader-progress-item--${u.progress}`}>
              <span className="uploader-progress-name">{u.name}</span>
              {u.progress === 'uploading' && (
                <span className="uploader-progress-spinner" aria-label="Uploading…">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="uploader-spin">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                </span>
              )}
              {u.progress === 'done' && <span className="uploader-progress-ok">✓ Uploaded</span>}
              {u.progress === 'error' && <span className="uploader-progress-err">✕ {u.error}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Existing images */}
      {images.length > 0 && (
        <div className="uploader-image-grid">
          {images.map((src, index) => (
            <div key={`${src}-${index}`} className="uploader-image-card">
              {!single && index === 0 && <span className="uploader-image-main-badge">Main</span>}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src.includes('cloudinary.com')
                  ? src.replace('/upload/', '/upload/w_200,h_260,c_fill,f_auto,q_auto/')
                  : src}
                alt={`Image ${index + 1}`}
                className="uploader-image-preview"
              />
              <div className="uploader-image-controls">
                {!single && (
                  <button
                    type="button"
                    className="uploader-ctrl-btn"
                    disabled={index === 0}
                    title="Move left (main photo)"
                    onClick={() => move(index, index - 1)}
                  >←</button>
                )}
                {!single && (
                  <button
                    type="button"
                    className="uploader-ctrl-btn"
                    disabled={index === images.length - 1}
                    title="Move right"
                    onClick={() => move(index, index + 1)}
                  >→</button>
                )}
                <button
                  type="button"
                  className="uploader-ctrl-btn uploader-ctrl-btn--remove"
                  title="Remove image"
                  onClick={() => remove(index)}
                >✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && uploading.length === 0 && (
        <p className="uploader-empty-hint">{emptyHint}</p>
      )}
    </div>
  );
}
