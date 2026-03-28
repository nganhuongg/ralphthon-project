'use client';

// components/InputForm.tsx
// Entry point for chart generation. Collects birthday, birthplace, birth hour
// (optional), gender, and life decision. Validates with Zod v4 on submit.

import { useState } from 'react';
import { InputFormSchema, formDataToBirthInput, parseTimeString } from '@/lib/tuvi/validation';
import { useVerseStore } from '@/lib/store';
import type { BirthInput } from '@/lib/tuvi/types';

interface InputFormProps {
  onSubmit: (input: BirthInput) => void;
}

export default function InputForm({ onSubmit }: InputFormProps) {
  const setBirthInput = useVerseStore((s) => s.setBirthInput);
  const setIsCalculating = useVerseStore((s) => s.setIsCalculating);

  const [fields, setFields] = useState({
    birthYear: '',
    birthMonth: '',
    birthDay: '',
    birthTime: '',   // HH:MM string — parsed to hour/minute on submit (D-02)
    gender: '' as 'M' | 'F' | '',
    birthplace: '',
    decision: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    // Clear the error for this field as the user types
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const { hour } = parseTimeString(fields.birthTime);

    const rawData = {
      birthYear: parseInt(fields.birthYear, 10),
      birthMonth: parseInt(fields.birthMonth, 10),
      birthDay: parseInt(fields.birthDay, 10),
      birthHour: hour ?? undefined,
      gender: fields.gender as 'M' | 'F',
      birthplace: fields.birthplace,
      decision: fields.decision,
    };

    // Zod v4: use safeParse and access result.error.issues (NOT result.error.errors)
    const result = InputFormSchema.safeParse(rawData);

    if (!result.success) {
      const newErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0]?.toString() ?? 'form';
        if (!newErrors[field]) {
          newErrors[field] = issue.message;
        }
      }
      setErrors(newErrors);
      return;
    }

    const birthInput = formDataToBirthInput(result.data);
    setBirthInput(birthInput);
    setIsCalculating(true);
    onSubmit(birthInput);
  }

  // Shared Tailwind class strings
  const inputClass =
    'w-full bg-verse-black border border-verse-gold/40 text-verse-paper px-3 py-2 rounded ' +
    'focus:outline-none focus:border-verse-gold focus:ring-1 focus:ring-verse-gold/50 ' +
    'placeholder-verse-paper/30 font-verse text-sm transition-colors';
  const labelClass = 'block text-verse-gold text-xs tracking-widest uppercase mb-1';
  const errorClass = 'text-red-400 text-xs mt-1';
  const fieldClass = 'flex flex-col gap-0.5';

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="w-full max-w-lg mx-auto flex flex-col gap-6"
    >
      {/* Title */}
      <div className="text-center mb-2">
        <h2 className="text-verse-gold text-xl font-light tracking-[0.2em] uppercase">
          Begin
        </h2>
        <p className="text-verse-paper/50 text-xs mt-1 tracking-wide">
          Your chart will be cast from these details.
        </p>
      </div>

      {/* Date of birth — three separate fields per INPUT-01 */}
      <div className="flex flex-col gap-1">
        <span className={labelClass}>Date of Birth</span>
        <div className="grid grid-cols-3 gap-2">
          <div className={fieldClass}>
            <input
              name="birthDay"
              type="number"
              min="1"
              max="31"
              placeholder="Day"
              value={fields.birthDay}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div className={fieldClass}>
            <input
              name="birthMonth"
              type="number"
              min="1"
              max="12"
              placeholder="Month"
              value={fields.birthMonth}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div className={fieldClass}>
            <input
              name="birthYear"
              type="number"
              min="1967"
              max="2025"
              placeholder="Year"
              value={fields.birthYear}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </div>
        {(errors.birthDay ?? errors.birthMonth ?? errors.birthYear) && (
          <p className={errorClass}>
            {errors.birthDay ?? errors.birthMonth ?? errors.birthYear}
          </p>
        )}
      </div>

      {/* Birth time — optional HH:MM field per D-01, D-02.
          D-02: use a clock input (type="time") — no traditional 12-giờ names shown in UI. */}
      <div className={fieldClass}>
        <label className={labelClass}>
          Birth Time{' '}
          <span className="text-verse-paper/30 normal-case tracking-normal">(optional)</span>
        </label>
        <input
          name="birthTime"
          type="time"
          value={fields.birthTime}
          onChange={handleChange}
          className={inputClass}
          placeholder="HH:MM"
        />
        {/* D-01: When left empty, chart engine silently defaults to the noon hour */}
      </div>

      {/* Gender — required for palace assignment direction */}
      <div className={fieldClass}>
        <label className={labelClass}>Gender</label>
        <select
          name="gender"
          value={fields.gender}
          onChange={handleChange}
          className={inputClass}
        >
          <option value="">Select gender</option>
          <option value="M">Male</option>
          <option value="F">Female</option>
        </select>
        {errors.gender && <p className={errorClass}>{errors.gender}</p>}
      </div>

      {/* Birthplace — used for timezone derivation (D-12) */}
      <div className={fieldClass}>
        <label className={labelClass}>
          Birthplace{' '}
          <span className="text-verse-paper/30 normal-case tracking-normal">
            (city or region)
          </span>
        </label>
        <input
          name="birthplace"
          type="text"
          placeholder="e.g. Hà Nội, Ho Chi Minh City"
          value={fields.birthplace}
          onChange={handleChange}
          className={inputClass}
          autoComplete="off"
        />
        {errors.birthplace && <p className={errorClass}>{errors.birthplace}</p>}
      </div>

      {/* Life decision — INPUT-03, 10–500 chars */}
      <div className={fieldClass}>
        <label className={labelClass}>The decision you are standing at</label>
        <textarea
          name="decision"
          placeholder="Describe the crossroads. What are you trying to decide?"
          value={fields.decision}
          onChange={handleChange}
          rows={3}
          className={`${inputClass} resize-none`}
          maxLength={500}
        />
        <div className="flex justify-between items-start">
          {errors.decision ? (
            <p className={errorClass}>{errors.decision}</p>
          ) : (
            <span />
          )}
          <span className="text-verse-paper/30 text-xs">{fields.decision.length}/500</span>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className={
          'mt-2 w-full bg-verse-red border border-verse-gold/50 text-verse-gold ' +
          'py-3 px-6 tracking-[0.15em] uppercase text-sm font-medium ' +
          'hover:bg-verse-red-light hover:border-verse-gold transition-colors ' +
          'focus:outline-none focus:ring-2 focus:ring-verse-gold/50 rounded'
        }
      >
        Cast Chart
      </button>
    </form>
  );
}
