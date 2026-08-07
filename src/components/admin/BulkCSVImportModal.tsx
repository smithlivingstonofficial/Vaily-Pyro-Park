'use client';

import React, { useState } from 'react';
import Papa from 'papaparse';
import { X, Upload, FileText, CheckCircle2, AlertTriangle, Download } from 'lucide-react';
import { Product } from '@/types';

interface BulkCSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedProducts: Partial<Product>[]) => void;
}

export const BulkCSVImportModal: React.FC<BulkCSVImportModalProps> = ({ isOpen, onClose, onImportSuccess }) => {
  const [csvText, setCsvText] = useState('');
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValidated, setIsValidated] = useState(false);

  if (!isOpen) return null;

  const sampleCsvTemplate = `name,sku,pack_size,mrp,selling_price,sound_level,stock
10cm Silver Sparklers,SPK-10S,1 Box (10 Pcs),200,150,Silent,200
20cm Golden Fountain,FPT-20G,1 Box (5 Pcs),450,320,Low,150
25 Shot Sky Rocket Cake,ARS-25R,1 Piece,1800,1290,High,60`;

  const handleParseAndValidate = () => {
    setValidationErrors([]);
    setIsValidated(false);

    if (!csvText.trim()) {
      setValidationErrors(['CSV input text cannot be empty.']);
      return;
    }

    Papa.parse(csvText.trim(), {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as any[];
        const errors: string[] = [];
        const validRows: any[] = [];

        if (rows.length === 0) {
          errors.push('No valid rows found in CSV data.');
        }

        rows.forEach((row, idx) => {
          const rowNum = idx + 1;
          if (!row.name || !row.name.trim()) {
            errors.push(`Row ${rowNum}: Missing mandatory 'name' field.`);
          }
          if (!row.sku || !row.sku.trim()) {
            errors.push(`Row ${rowNum}: Missing mandatory 'sku' field.`);
          }
          const mrp = parseFloat(row.mrp);
          const selling = parseFloat(row.selling_price);

          if (isNaN(mrp) || mrp < 0) {
            errors.push(`Row ${rowNum}: Invalid MRP value '${row.mrp}'.`);
          }
          if (isNaN(selling) || selling < 0) {
            errors.push(`Row ${rowNum}: Invalid Selling Price value '${row.selling_price}'.`);
          }
          if (!isNaN(mrp) && !isNaN(selling) && selling > mrp) {
            errors.push(`Row ${rowNum}: Selling Price (₹${selling}) exceeds MRP (₹${mrp}).`);
          }

          if (errors.length === 0) {
            validRows.push({
              name: row.name?.trim(),
              sku: row.sku?.trim(),
              pack_size: row.pack_size?.trim() || '1 Box',
              mrp: isNaN(mrp) ? 0 : mrp,
              selling_price: isNaN(selling) ? 0 : selling,
              sound_level: row.sound_level || 'Medium',
              stock: parseInt(row.stock) || 100,
            });
          }
        });

        if (errors.length > 0) {
          setValidationErrors(errors);
        } else {
          setParsedData(validRows);
          setIsValidated(true);
        }
      },
      error: (err: Error) => {
        setValidationErrors([`CSV Syntax Error: ${err.message}`]);
      },
    });
  };

  const handleCommitImport = () => {
    onImportSuccess(parsedData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-amber-600" />
            <h2 className="font-extrabold text-lg text-slate-950">Bulk CSV Product Importer</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Paste your CSV product data below. Must include columns: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-amber-700">name, sku, pack_size, mrp, selling_price, sound_level, stock</code>.
        </p>

        <textarea
          rows={7}
          value={csvText}
          onChange={(e) => {
            setCsvText(e.target.value);
            setIsValidated(false);
          }}
          placeholder={sampleCsvTemplate}
          className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-1 focus:ring-amber-500 outline-none"
        />

        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => setCsvText(sampleCsvTemplate)}
            className="text-xs text-amber-700 hover:underline font-bold flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5" /> Load Sample Template
          </button>

          <button
            onClick={handleParseAndValidate}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl"
          >
            Validate CSV Syntax
          </button>
        </div>

        {validationErrors.length > 0 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl space-y-1 text-xs text-red-700 font-semibold max-h-32 overflow-y-auto">
            <div className="flex items-center gap-1 text-red-800 font-extrabold">
              <AlertTriangle className="w-4 h-4" /> Validation Errors Found:
            </div>
            {validationErrors.map((err, idx) => (
              <p key={idx}>• {err}</p>
            ))}
          </div>
        )}

        {isValidated && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 space-y-2">
            <div className="flex items-center gap-1 font-extrabold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Pre-Validation Clean: {parsedData.length} valid product rows ready to import.
            </div>

            <button
              onClick={handleCommitImport}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-md"
            >
              COMMIT & IMPORT {parsedData.length} PRODUCTS TO CATALOGUE
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
