/**
 * Script to convert Vietnam administrative divisions data to SQL
 * Source: https://github.com/daohoangson/dvhcvn
 *
 * Usage: node seed-locations.js
 * Output: seed-locations.sql
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const DATA_URL = 'https://raw.githubusercontent.com/daohoangson/dvhcvn/master/data/dvhcvn.json';
const OUTPUT_FILE = path.join(__dirname, 'seed-locations.sql');

function fetchData(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function escapeSQL(str) {
  if (!str) return 'NULL';
  return `'${str.replace(/'/g, "''")}'`;
}

function generateNameWithType(name, type) {
  // The name from dvhcvn already includes the type prefix
  // e.g., name = "Thành phố Hà Nội", type = "Thành phố Trung ương"
  // So we just return the name as-is
  return name;
}

function convertTypeToSlug(type) {
  // Convert Vietnamese type to slug
  const typeMap = {
    'Thành phố Trung ương': 'thanh-pho-trung-uong',
    'Tỉnh': 'tinh',
    'Thành phố': 'thanh-pho',
    'Quận': 'quan',
    'Huyện': 'huyen',
    'Thị xã': 'thi-xa',
    'Phường': 'phuong',
    'Xã': 'xa',
    'Thị trấn': 'thi-tran',
  };
  return typeMap[type] || type?.toLowerCase().replace(/\s+/g, '-') || null;
}

async function main() {
  console.log('Fetching data from dvhcvn...');
  const data = await fetchData(DATA_URL);

  let sql = `-- Vietnam Administrative Divisions Seed Data
-- Source: https://github.com/daohoangson/dvhcvn
-- Generated: ${new Date().toISOString()}

-- Clear existing data (in correct order due to foreign keys)
TRUNCATE TABLE location_schema.wards CASCADE;
TRUNCATE TABLE location_schema.districts CASCADE;
TRUNCATE TABLE location_schema.provinces CASCADE;

-- Insert Provinces
INSERT INTO location_schema.provinces (id, name, name_en, type, name_with_type) VALUES
`;

  const provinceValues = [];
  const districtValues = [];
  const wardValues = [];

  for (const province of data.data) {
    const provinceId = province.level1_id;
    const provinceName = province.name;
    const provinceType = convertTypeToSlug(province.type);
    const provinceNameWithType = generateNameWithType(provinceName, province.type);

    provinceValues.push(`(${escapeSQL(provinceId)}, ${escapeSQL(provinceName)}, NULL, ${escapeSQL(provinceType)}, ${escapeSQL(provinceNameWithType)})`);

    if (province.level2s) {
      for (const district of province.level2s) {
        const districtId = district.level2_id;
        const districtName = district.name;
        const districtType = convertTypeToSlug(district.type);
        const districtNameWithType = generateNameWithType(districtName, district.type);

        districtValues.push(`(${escapeSQL(districtId)}, ${escapeSQL(provinceId)}, ${escapeSQL(districtName)}, NULL, ${escapeSQL(districtType)}, ${escapeSQL(districtNameWithType)})`);

        if (district.level3s) {
          for (const ward of district.level3s) {
            const wardId = ward.level3_id;
            const wardName = ward.name;
            const wardType = convertTypeToSlug(ward.type);
            const wardNameWithType = generateNameWithType(wardName, ward.type);

            wardValues.push(`(${escapeSQL(wardId)}, ${escapeSQL(districtId)}, ${escapeSQL(wardName)}, NULL, ${escapeSQL(wardType)}, ${escapeSQL(wardNameWithType)})`);
          }
        }
      }
    }
  }

  sql += provinceValues.join(',\n') + ';\n\n';

  sql += `-- Insert Districts
INSERT INTO location_schema.districts (id, province_id, name, name_en, type, name_with_type) VALUES
`;
  sql += districtValues.join(',\n') + ';\n\n';

  sql += `-- Insert Wards
INSERT INTO location_schema.wards (id, district_id, name, name_en, type, name_with_type) VALUES
`;
  sql += wardValues.join(',\n') + ';\n';

  sql += `
-- Summary
-- Provinces: ${provinceValues.length}
-- Districts: ${districtValues.length}
-- Wards: ${wardValues.length}
`;

  fs.writeFileSync(OUTPUT_FILE, sql, 'utf8');
  console.log(`Generated ${OUTPUT_FILE}`);
  console.log(`- Provinces: ${provinceValues.length}`);
  console.log(`- Districts: ${districtValues.length}`);
  console.log(`- Wards: ${wardValues.length}`);
}

main().catch(console.error);
