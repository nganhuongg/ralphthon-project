// lib/tuvi/__tests__/lunar.test.ts
// Tests for lunar-bridge.ts: Gregorian → LunarDate adapter
// RED: these tests must FAIL before implementation exists

import { calculateLunarDate, birthplaceToTimezoneOffset, hourToGioIndex } from '../lunar-bridge';

describe('hourToGioIndex', () => {
  it('Test 3: null hour → default Giờ Ngọ (index 6)', () => {
    expect(hourToGioIndex(null)).toBe(6);
  });

  it('Test 4: hour 23 → Giờ Tý (index 0) — midnight boundary', () => {
    expect(hourToGioIndex(23)).toBe(0);
  });

  it('Test 5: hour 1 → Giờ Tý (index 0) — still Tý (23:00–00:59)', () => {
    expect(hourToGioIndex(1)).toBe(0);
  });

  it('hour 0 → Giờ Tý (index 0)', () => {
    expect(hourToGioIndex(0)).toBe(0);
  });

  it('hour 11 → Giờ Ngọ (index 6)', () => {
    // 11am: (11+1)%24 / 2 = 12/2 = 6
    expect(hourToGioIndex(11)).toBe(6);
  });

  it('hour 13 → Giờ Mùi (index 7)', () => {
    // 1pm: (13+1)%24 / 2 = 14/2 = 7
    expect(hourToGioIndex(13)).toBe(7);
  });

  it('hour 3 → Giờ Dần (index 2)', () => {
    // 3am: (3+1)%24 / 2 = 4/2 = 2
    expect(hourToGioIndex(3)).toBe(2);
  });
});

describe('birthplaceToTimezoneOffset', () => {
  it('Test 6: Vietnam birthplace returns 7', () => {
    expect(birthplaceToTimezoneOffset('Hà Nội')).toBe(7);
  });

  it('Test 7: Non-VN birthplace does not throw and returns a number', () => {
    const result = birthplaceToTimezoneOffset('Paris');
    expect(typeof result).toBe('number');
    expect(isNaN(result)).toBe(false);
  });

  it('Ho Chi Minh City returns 7', () => {
    expect(birthplaceToTimezoneOffset('Hồ Chí Minh')).toBe(7);
  });

  it('Saigon returns 7', () => {
    expect(birthplaceToTimezoneOffset('saigon')).toBe(7);
  });

  it('Vietnam returns 7', () => {
    expect(birthplaceToTimezoneOffset('Vietnam')).toBe(7);
  });
});

describe('calculateLunarDate', () => {
  it('Test 1 (Tết boundary): Jan 20, 1985 → yearCanChi = "Giáp Tý" (NOT Ất Sửu — Tết 1985 was Feb 20)', () => {
    const result = calculateLunarDate({ year: 1985, month: 1, day: 20 }, 7, null);
    expect(result.yearCanChi).toBe('Giáp Tý');
  });

  it('Test 2 (normal date): Mar 15, 1990 → yearCanChi = "Canh Ngọ", lunarMonth = 2', () => {
    const result = calculateLunarDate({ year: 1990, month: 3, day: 15 }, 7, null);
    expect(result.yearCanChi).toBe('Canh Ngọ');
    expect(result.month).toBe(2);
  });

  it('returns a gioIndex of 6 when hour is null (default Ngọ)', () => {
    const result = calculateLunarDate({ year: 1990, month: 3, day: 15 }, 7, null);
    expect(result.gioIndex).toBe(6);
  });

  it('returns a gioName of "Ngọ" when hour is null', () => {
    const result = calculateLunarDate({ year: 1990, month: 3, day: 15 }, 7, null);
    expect(result.gioName).toBe('Ngọ');
  });

  it('returns isLeapMonth as a boolean', () => {
    const result = calculateLunarDate({ year: 1990, month: 3, day: 15 }, 7, null);
    expect(typeof result.isLeapMonth).toBe('boolean');
  });

  it('returns non-empty yearCanChi string', () => {
    const result = calculateLunarDate({ year: 1990, month: 3, day: 15 }, 7, null);
    expect(result.yearCanChi.length).toBeGreaterThan(0);
  });

  it('returns non-empty monthCanChi string', () => {
    const result = calculateLunarDate({ year: 1990, month: 3, day: 15 }, 7, null);
    expect(result.monthCanChi.length).toBeGreaterThan(0);
  });

  it('returns non-empty dayCanChi string', () => {
    const result = calculateLunarDate({ year: 1990, month: 3, day: 15 }, 7, null);
    expect(result.dayCanChi.length).toBeGreaterThan(0);
  });

  it('returns non-empty hourCanChi string', () => {
    const result = calculateLunarDate({ year: 1990, month: 3, day: 15 }, 7, null);
    expect(result.hourCanChi.length).toBeGreaterThan(0);
  });
});
