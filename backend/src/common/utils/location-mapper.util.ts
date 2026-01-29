/**
 * Maps English location names to Vietnamese
 * Used for displaying user-friendly location names in Vietnamese
 */

/**
 * City name mapping: English → Vietnamese
 */
const CITY_NAME_MAP: Record<string, string> = {
  // Major cities
  Hanoi: 'Hà Nội',
  'Ho Chi Minh City': 'TP. Hồ Chí Minh',
  'Da Nang': 'Đà Nẵng',
  'Can Tho': 'Cần Thơ',
  'Hai Phong': 'Hải Phòng',
  'Bien Hoa': 'Biên Hòa',
  'Nha Trang': 'Nha Trang',
  Hue: 'Huế',
  'Vung Tau': 'Vũng Tàu',
  'Buon Ma Thuot': 'Buôn Ma Thuột',
  'Quy Nhon': 'Quy Nhơn',
  'Thai Nguyen': 'Thái Nguyên',
  'Nam Dinh': 'Nam Định',
  'Phan Thiet': 'Phan Thiết',
  'Long Xuyen': 'Long Xuyên',
  'Ha Long': 'Hạ Long',
  'Thai Binh': 'Thái Bình',
  'Bac Lieu': 'Bạc Liêu',
  'Cam Ranh': 'Cam Ranh',
  'Rach Gia': 'Rạch Giá',
  'Ca Mau': 'Cà Mau',
  Vinh: 'Vinh',
  'My Tho': 'Mỹ Tho',
  'Thanh Hoa': 'Thanh Hóa',
  'Tuy Hoa': 'Tuy Hòa',
  'Dong Hoi': 'Đồng Hới',
  Pleiku: 'Pleiku',
  'Kon Tum': 'Kon Tum',
  'Soc Trang': 'Sóc Trăng',
  'Ben Tre': 'Bến Tre',
  'Tra Vinh': 'Trà Vinh',
  'Hoa Binh': 'Hòa Bình',
  'Phu Ly': 'Phủ Lý',
  'Bac Giang': 'Bắc Giang',
  'Bac Ninh': 'Bắc Ninh',
  'Ninh Binh': 'Ninh Bình',
  'Ha Tinh': 'Hà Tĩnh',
  'Dong Ha': 'Đông Hà',
  'Tam Ky': 'Tam Kỳ',
  'Tay Ninh': 'Tây Ninh',
  'Yen Bai': 'Yên Bái',
  'Son La': 'Sơn La',
  'Lai Chau': 'Lai Châu',
  'Dien Bien Phu': 'Điện Biên Phủ',
  'Lao Cai': 'Lào Cai',
  'Ha Giang': 'Hà Giang',
  'Cao Bang': 'Cao Bằng',
  'Lang Son': 'Lạng Sơn',
};

/**
 * Country name mapping: Code → Vietnamese
 */
const COUNTRY_NAME_MAP: Record<string, string> = {
  VN: 'Việt Nam',
  US: 'Hoa Kỳ',
  CN: 'Trung Quốc',
  JP: 'Nhật Bản',
  KR: 'Hàn Quốc',
  TH: 'Thái Lan',
  SG: 'Singapore',
  MY: 'Malaysia',
  ID: 'Indonesia',
  PH: 'Philippines',
  GB: 'Anh',
  FR: 'Pháp',
  DE: 'Đức',
  AU: 'Úc',
  CA: 'Canada',
};

/**
 * Maps English location string to Vietnamese
 * @param location - Location string in format "City, Country" or "Country"
 * @returns Vietnamese location string
 *
 * @example
 * mapLocationToVietnamese("Hanoi, VN") // Returns "Hà Nội, Việt Nam"
 * mapLocationToVietnamese("VN") // Returns "Việt Nam"
 * mapLocationToVietnamese("Mạng cục bộ") // Returns "Mạng cục bộ" (no change)
 */
export function mapLocationToVietnamese(location: string | null): string {
  if (!location) {
    return 'Không xác định';
  }

  // If already Vietnamese text (e.g., "Mạng cục bộ"), return as-is
  if (location === 'Mạng cục bộ') {
    return location;
  }

  // Check if format is "City, Country"
  const parts = location.split(', ');

  if (parts.length === 2) {
    const [city, countryCode] = parts;
    const vietnameseCity = CITY_NAME_MAP[city] || city;
    const vietnameseCountry = COUNTRY_NAME_MAP[countryCode] || countryCode;
    return `${vietnameseCity}, ${vietnameseCountry}`;
  }

  // If just country code
  if (parts.length === 1) {
    return COUNTRY_NAME_MAP[location] || location;
  }

  // Fallback: return original
  return location;
}

/**
 * Adds a custom city mapping
 * Useful for adding cities that aren't in the default map
 * @param englishName - English city name
 * @param vietnameseName - Vietnamese city name
 */
export function addCityMapping(
  englishName: string,
  vietnameseName: string,
): void {
  CITY_NAME_MAP[englishName] = vietnameseName;
}

/**
 * Adds a custom country mapping
 * @param countryCode - Country code (e.g., "VN")
 * @param vietnameseName - Vietnamese country name
 */
export function addCountryMapping(
  countryCode: string,
  vietnameseName: string,
): void {
  COUNTRY_NAME_MAP[countryCode] = vietnameseName;
}
