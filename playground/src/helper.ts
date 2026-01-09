import { Template, Font, checkTemplate, getInputFromTemplate, getDefaultFont } from '@pdfme/common';
import { Form, Viewer, Designer } from '@pdfme/ui';
import { generate } from '@pdfme/generator';
import { getPlugins } from './plugins';

export function fromKebabCase(str: string): string {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export const getFontsData = (): Font => ({
  ...getDefaultFont(),
  'PinyonScript-Regular': {
    fallback: false,
    data: 'https://fonts.gstatic.com/s/pinyonscript/v22/6xKpdSJbL9-e9LuoeQiDRQR8aOLQO4bhiDY.ttf',
  },
  NotoSerifJP: {
    fallback: false,
    data: 'https://fonts.gstatic.com/s/notoserifjp/v30/xn71YHs72GKoTvER4Gn3b5eMRtWGkp6o7MjQ2bwxOubAILO5wBCU.ttf',
  },
  NotoSansJP: {
    fallback: false,
    data: 'https://fonts.gstatic.com/s/notosansjp/v53/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFBEj75vY0rw-oME.ttf',
  },
  'dawningofanewday-regular': {
    fallback: false,
    data: 'https://raw.githubusercontent.com/weberon/fonts-in-weberon/master/all_fonts/DawningofaNewDay-Regular.ttf',
  },
  'Ludicrous': {
    fallback: false,
    data: 'https://raw.githubusercontent.com/weberon/fonts-in-weberon/master/all_fonts/Ludicrous/Ludicrous.ttf',
  },
  'daniel-regular': {
    fallback: false,
    data: 'https://raw.githubusercontent.com/weberon/fonts-in-weberon/master/all_fonts/daniel/daniel.ttf',
  },
  'daniel-bold': {
    fallback: false,
    data: 'https://raw.githubusercontent.com/weberon/fonts-in-weberon/master/all_fonts/daniel/danielbd.ttf',
  },
  'Grape Nuts': {
    fallback: false,
    data: 'https://raw.githubusercontent.com/weberon/fonts-in-weberon/master/all_fonts/Grape_Nuts/GrapeNuts-Regular.ttf',
  },
  'dafontAnsteryScript': {
    fallback: false,
    data: 'https://raw.githubusercontent.com/weberon/fonts-in-weberon/master/all_fonts/dafont/AnsteryScript.ttf',
  },
  'vletterBadger': {
    fallback: false,
    data: 'https://raw.githubusercontent.com/weberon/fonts-in-weberon/master/all_fonts/vletter/Badger.ttf',
  },
  'dafontAccountantSignature': {
    fallback: false,
    data: 'https://raw.githubusercontent.com/weberon/fonts-in-weberon/master/all_fonts/dafont/aAccountantSignature.ttf',
  },
  'dafontAgreementSignature': {
    fallback: false,
    data: 'https://raw.githubusercontent.com/weberon/fonts-in-weberon/master/all_fonts/dafont/aAgreementSignature.ttf',
  },
  'dafontApplicantSignature': {
    fallback: false,
    data: 'https://raw.githubusercontent.com/weberon/fonts-in-weberon/master/all_fonts/dafont/aApplicantSignature.ttf',
  },
  'biro_script_standard_us': {
    fallback: false,
    data: 'https://raw.githubusercontent.com/weberon/fonts-in-weberon/master/all_fonts/biro_script/biro_script_standard_us.woff',
  },
  'biro_script_bold_standard_us': {
    fallback: false,
    data: 'https://raw.githubusercontent.com/weberon/fonts-in-weberon/master/all_fonts/biro_script/biro_script_bold_standard_us.woff',
  },
});

export const readFile = (file: File | null, type: 'text' | 'dataURL' | 'arrayBuffer') => {
  return new Promise<string | ArrayBuffer>((r) => {
    const fileReader = new FileReader();
    fileReader.addEventListener('load', (e) => {
      if (e && e.target && e.target.result && file !== null) {
        r(e.target.result);
      }
    });
    if (file !== null) {
      if (type === 'text') {
        fileReader.readAsText(file);
      } else if (type === 'dataURL') {
        fileReader.readAsDataURL(file);
      } else if (type === 'arrayBuffer') {
        fileReader.readAsArrayBuffer(file);
      }
    }
  });
};

const getTemplateFromJsonFile = (file: File) => {
  return readFile(file, 'text').then((jsonStr) => {
    const template: Template = JSON.parse(jsonStr as string);
    checkTemplate(template);
    return template;
  });
};

export const downloadJsonFile = (json: unknown, title: string) => {
  if (typeof window !== 'undefined') {
    const blob = new Blob([JSON.stringify(json)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
};

export const handleLoadTemplate = (
  e: React.ChangeEvent<HTMLInputElement>,
  currentRef: Designer | Form | Viewer | null
) => {
  if (e.target && e.target.files && e.target.files[0]) {
    getTemplateFromJsonFile(e.target.files[0])
      .then((t) => {
        if (!currentRef) return;
        currentRef.updateTemplate(t);
      })
      .catch((e) => {
        alert(`Invalid template file.
--------------------------
${e}`);
      });
  }
};

export const translations: { label: string; value: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ko', label: 'Korean' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ar', label: 'Arabic' },
  { value: 'th', label: 'Thai' },
  { value: 'pl', label: 'Polish' },
  { value: 'it', label: 'Italian' },
  { value: 'de', label: 'German' },
  { value: 'fr', label: 'French' },
  { value: 'es', label: 'Spanish' },
];

export const generatePDF = async (currentRef: Designer | Form | Viewer | null) => {
  if (!currentRef) return;
  const template = currentRef.getTemplate();
  const options = currentRef.getOptions();
  const inputs =
    typeof (currentRef as Viewer | Form).getInputs === 'function'
      ? (currentRef as Viewer | Form).getInputs()
      : getInputFromTemplate(template);
  const font = getFontsData();

  try {
    const pdf = await generate({
      template,
      inputs,
      options: {
        font,
        lang: options.lang,
        title: 'pdfme',
      },
      plugins: getPlugins(),
    });

    const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
    window.open(URL.createObjectURL(blob));
  } catch (e) {
    alert(e + '\n\nCheck the console for full stack trace');
    throw e;
  }
};

export const isJsonString = (str: string) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

export const parseCsv = (csvText: string) => {
  // Remove BOM if present
  const cleanText = csvText.replace(/^\uFEFF/, '');
  const lines = cleanText.split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  const records: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/^"|"$/g, ''));

    const record: any = {};
    headers.forEach((header, index) => {
      record[header] = values[index] !== undefined ? values[index] : '';
    });
    records.push(record);
  }
  return records;
};

export const generateBulkPDF = async (currentRef: Designer | Form | Viewer | null, csvFile: File) => {
  if (!currentRef) return;
  const template = currentRef.getTemplate();
  const csvText = (await readFile(csvFile, 'text')) as string;
  const records = parseCsv(csvText);

  console.log('Parsed CSV records:', records);

  const allInputs = records.map((record, index) => {
    const input: any = {};
    template.schemas.forEach((page) => {
      Object.entries(page).forEach(([key, schema]) => {
        const schemaName = schema.name || key;
        const type = (schema.type || '').toLowerCase();
        const isMultiVariable = type === 'multivariabletext' || type === 'multi-variable text';
        const isQR = type === 'qrcode' || type === 'qr' || type.includes('qrcode') || type.includes('qr');

        if (isMultiVariable && (schema as any).variables) {
          const variableMap: any = {};
          (schema as any).variables.forEach((variable: string) => {
            const val = record[variable] !== undefined ? record[variable] :
              Object.entries(record).find(([k]) => k.toLowerCase() === variable.toLowerCase())?.[1];
            variableMap[variable] = (val !== undefined && val.trim() !== '') ? val : ' ';
          });
          input[schemaName] = JSON.stringify(variableMap);
        } else {
          // Check for exact match or case-insensitive match for convenience
          let recordValue = record[schemaName] !== undefined ? record[schemaName] :
            Object.entries(record).find(([k]) => k.toLowerCase() === schemaName.toLowerCase())?.[1];

          // Special fallback for QR codes if no direct match found
          if (isQR && recordValue === undefined) {
            recordValue = record['qrcode'] || record['qr'] ||
              Object.entries(record).find(([k]) => k.toLowerCase() === 'qrcode' || k.toLowerCase() === 'qr')?.[1];
          }

          input[schemaName] = recordValue !== undefined ? recordValue : (schema.content || '');
        }
      });
    });
    console.log(`Generated input for record ${index + 1}:`, input);
    return input;
  });

  try {
    const pdf = await generate({
      template,
      inputs: allInputs,
      options: {
        font: getFontsData(),
        lang: currentRef.getOptions().lang,
        title: 'pdfme-bulk',
      },
      plugins: getPlugins(),
    });

    const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bulk_generation_${new Date().getTime()}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    alert(e + '\n\nCheck the console for full stack trace');
    throw e;
  }
};

export const getPaperSizes = () => ({
  A4: { width: 210, height: 297 },
  'A4 Landscape': { width: 297, height: 210 },
  Letter: { width: 215.9, height: 279.4 },
  'Letter Landscape': { width: 279.4, height: 215.9 },
  Legal: { width: 215.9, height: 355.6 },
  'Legal Landscape': { width: 355.6, height: 215.9 },
  A3: { width: 297, height: 420 },
  'A3 Landscape': { width: 420, height: 297 },
  Tabloid: { width: 279.4, height: 431.8 },
  'Tabloid Landscape': { width: 431.8, height: 279.4 },
  A5: { width: 148, height: 210 },
  'A5 Landscape': { width: 210, height: 148 },
});

export const getBlankTemplate = (width = 210, height = 297) =>
({
  schemas: [{}],
  basePdf: {
    width,
    height,
    padding: [20, 10, 20, 10],
  },
} as Template);


export const getTemplateById = async (templateId: string): Promise<Template> => {
  const template = await fetch(`/template-assets/${templateId}/template.json`).then((res) =>
    res.json()
  );
  checkTemplate(template);
  return template as Template;
};
