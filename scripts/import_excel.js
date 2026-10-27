const XLSX = require('xlsx');
process.loadEnvFile('.env.local');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const excelPath = 'c:/Users/aryad/Downloads/RECAP DECOR 2026.xlsx';
const wb = XLSX.readFile(excelPath, { cellStyles: true });

function parseExcelDate(val, fallbackDate) {
  if (val === null || val === undefined || val === '') return fallbackDate;
  if (typeof val === 'number') {
    const parsed = XLSX.SSF.parse_date_code(val);
    if (parsed) {
      const y = parsed.y;
      const m = String(parsed.m).padStart(2, '0');
      const d = String(parsed.d).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    const parts = trimmed.split(/[/.-]/);
    if (parts.length === 3) {
      let d = parseInt(parts[0], 10);
      let m = parseInt(parts[1], 10);
      let y = parseInt(parts[2], 10);
      if (y < 100) y += 2000;
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
  }
  return fallbackDate;
}

function parseMoney(val) {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return Math.round(val);
  if (typeof val === 'string') {
    const cleaned = val.replace(/[^0-9.-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : Math.round(num);
  }
  return 0;
}

function parseStatus(val, remaining, total, transfer) {
  if (typeof val === 'string' && val.trim()) {
    const s = val.trim().toLowerCase();
    if (s.includes('lunas')) return 'Lunas';
    if (s.includes('kurang')) return 'Kurang';
    if (s.includes('dp')) return 'DP';
    if (s.includes('batal')) return 'Batal';
  }
  if (remaining <= 0 && transfer >= total && total > 0) return 'Lunas';
  if (transfer > 0 && remaining > 0) return 'Kurang';
  return 'DP';
}

function extractRecords(sheetName, startRow, endRow) {
  const sheet = wb.Sheets[sheetName];
  const records = [];
  const defaultDate = sheetName === 'AGUSTUS' ? '2026-08-01' : '2026-09-01';

  for (let r = startRow; r <= endRow; r++) {
    const no = sheet['A' + r]?.v;
    if (typeof no !== 'number') continue;

    const dealingRaw = sheet['B' + r]?.v;
    const clientRaw = sheet['C' + r]?.v;
    const decorTypeRaw = sheet['D' + r]?.v;
    const venueRaw = sheet['E' + r]?.v;
    const eventDateRaw = sheet['F' + r]?.v;
    const totalRaw = sheet['G' + r]?.v;
    const transferRaw = sheet['H' + r]?.v;
    const kurangRaw = sheet['I' + r]?.v;
    const statusRaw = sheet['J' + r]?.v;
    const overtimeRaw = sheet['K' + r]?.v;

    const total_amount = parseMoney(totalRaw);
    const transfer_amount = parseMoney(transferRaw);
    let remaining_amount = parseMoney(kurangRaw);
    if (remaining_amount === 0 && total_amount > transfer_amount) {
      remaining_amount = total_amount - transfer_amount;
    }

    const status = parseStatus(sheet['J' + r]?.v, remaining_amount, total_amount, transfer_amount);
    const charge_overtime = parseMoney(overtimeRaw);

    const color = sheet['C' + r]?.s?.fgColor?.rgb;
    let sales_pic = 'Ce Loren';
    if (color === 'FF00FF') sales_pic = 'Ce Loren';
    else if (color === 'FF9900') sales_pic = 'Arsita';

    records.push({
      dealing_date: parseExcelDate(dealingRaw, defaultDate),
      client_name: String(clientRaw || '').trim(),
      decor_type: String(decorTypeRaw || 'Table Decor').trim(),
      venue: String(venueRaw || '').trim(),
      event_date: parseExcelDate(eventDateRaw, defaultDate),
      total_amount,
      transfer_amount,
      status,
      charge_overtime,
      sales_pic,
      notes: `Rekap ${sheetName} 2026 No. ${no}`,
    });
  }
  return records;
}

async function run() {
  const agustus = extractRecords('AGUSTUS', 4, 19);
  const september = extractRecords('SEPTEMBER', 4, 24);
  const allEvents = [...agustus, ...september];

  console.log(`Loaded ${agustus.length} records from AGUSTUS.`);
  console.log(`Loaded ${september.length} records from SEPTEMBER.`);
  console.log(`Total records to import: ${allEvents.length}`);

  const { error: delError } = await supabase.from('events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delError) console.error('Warning clearing old events:', delError.message);

  const { data, error } = await supabase.from('events').insert(allEvents).select();
  if (error) {
    console.error('Import Error:', error);
    process.exit(1);
  }

  console.log(`Successfully imported ${data.length} records into Supabase events!`);
}

run();