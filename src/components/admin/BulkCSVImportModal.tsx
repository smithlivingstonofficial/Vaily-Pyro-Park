'use client';

import React, { useState } from 'react';
import Papa from 'papaparse';
import { X, Upload, FileText, CheckCircle2, AlertTriangle, Download, FileSpreadsheet } from 'lucide-react';
import { Product } from '@/types';
import { ProductService } from '@/lib/services/product.service';

interface BulkCSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

export const BulkCSVImportModal: React.FC<BulkCSVImportModalProps> = ({ isOpen, onClose, onImportSuccess }) => {
  const [csvText, setCsvText] = useState('');
  const [parsedData, setParsedData] = useState<(Partial<Product> & { category?: string; stock?: number })[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValidated, setIsValidated] = useState(false);
  const [importing, setImporting] = useState(false);
  const [dbError, setDbError] = useState('');

  if (!isOpen) return null;

  const sampleCsvTemplate = `name,sku,pack_size,mrp,selling_price,sound_level,stock,category,description
"10cm Silver Sparklers",SPK-10S,"1 Box (10 Pcs)",200,150,Silent,150,"Sparklers","Bright electric silver sparklers, safe for celebration."
"20cm Golden Fountain",FPT-20G,"1 Box (5 Pcs)",450,320,Low,150,"Flower Pots","Golden fountains showering sparks up to 10 feet."
"25 Shot Sky Rocket Cake",ARS-25R,"1 Piece",1800,1290,High,150,"Fancy Shots","25 multi-color aerial sky burst cake."`;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        setCsvText(text);
        setIsValidated(false);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadSampleCsv = () => {
    const blob = new Blob([sampleCsvTemplate], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'vaily_pyro_sample_products_import.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleParseAndValidate = () => {
    setValidationErrors([]);
    setDbError('');
    setIsValidated(false);

    if (!csvText.trim()) {
      setValidationErrors(['CSV data input cannot be empty. Please paste CSV text or upload a .csv file.']);
      return;
    }

    Papa.parse(csvText.trim(), {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as any[];
        const errors: string[] = [];
        const validRows: (Partial<Product> & { category?: string; stock?: number })[] = [];

        if (rows.length === 0) {
          errors.push('No valid rows found in CSV data.');
        }

        rows.forEach((row, idx) => {
          const rowNum = idx + 1;
          if (!row.name || !row.name.trim()) {
            errors.push(`Row ${rowNum}: Missing mandatory 'name' column.`);
          }
          if (!row.sku || !row.sku.trim()) {
            errors.push(`Row ${rowNum}: Missing mandatory 'sku' column.`);
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
              sku: row.sku?.trim().toUpperCase(),
              pack_size: row.pack_size?.trim() || '1 Box',
              mrp: isNaN(mrp) ? 0 : mrp,
              selling_price: isNaN(selling) ? 0 : selling,
              sound_level: row.sound_level || 'Medium',
              stock: parseInt(row.stock) || 150,
              description: row.description?.trim() || '',
              category: row.category?.trim() || '',
              is_active: true,
            } as any);
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

  const handleCommitImport = async () => {
    if (parsedData.length === 0) return;
    setImporting(true);
    setDbError('');

    try {
      await ProductService.bulkCreateProducts(parsedData);
      onImportSuccess();
      onClose();
    } catch (err: any) {
      console.error('Bulk CSV import database error:', err);
      setDbError(err.message || 'Failed to save imported products into Supabase database.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-sans">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-98 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-2xs">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-black text-slate-950 text-base">Bulk CSV Product Importer</h2>
              <span className="text-[11px] text-slate-500 font-semibold block">
                Batch import fireworks SKUs directly into Supabase database
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Instructions & Quick Actions */}
        <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200/80 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-amber-950">CSV Format Specification:</span>
            <button
              onClick={handleDownloadSampleCsv}
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-[11px] flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
            >
              <Download className="w-3 h-3" /> Download Sample .CSV
            </button>
          </div>
          <p className="text-amber-900 text-[11px] font-medium leading-relaxed">
            Must contain column headers: <code className="font-mono bg-white/80 px-1.5 py-0.5 rounded text-amber-950 font-bold border border-amber-300">name, sku, pack_size, mrp, selling_price, sound_level, stock</code>.
          </p>
        </div>

        {/* File Upload Dropzone */}
        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center bg-slate-50 hover:bg-slate-100/80 transition-colors">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            id="csv-file-input"
          />
          <label
            htmlFor="csv-file-input"
            className="cursor-pointer flex flex-col items-center gap-1.5 text-xs text-slate-600 font-bold"
          >
            <FileSpreadsheet className="w-6 h-6 text-amber-600" />
            <span>Click to upload `.csv` file or drag & drop</span>
            <span className="text-[10px] text-slate-400 font-normal">or paste raw CSV text below</span>
          </label>
        </div>

        {/* CSV Text Area */}
        <textarea
          rows={6}
          value={csvText}
          onChange={(e) => {
            setCsvText(e.target.value);
            setIsValidated(false);
          }}
          placeholder={sampleCsvTemplate}
          className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
        />

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            onClick={() => setCsvText(sampleCsvTemplate)}
            className="text-xs text-amber-700 hover:text-amber-800 font-extrabold flex items-center gap-1 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" /> Fill Sample Text
          </button>

          <button
            onClick={handleParseAndValidate}
            className="px-4 py-2.5 bg-slate-950 hover:bg-slate-900 text-white font-black text-xs rounded-xl transition-all cursor-pointer"
          >
            Validate CSV Syntax
          </button>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl space-y-1 text-xs text-red-700 font-semibold max-h-36 overflow-y-auto">
            <div className="flex items-center gap-1 text-red-800 font-extrabold">
              <AlertTriangle className="w-4 h-4 shrink-0" /> CSV Validation Errors:
            </div>
            {validationErrors.map((err, idx) => (
              <p key={idx} className="text-[11px] font-mono">• {err}</p>
            ))}
          </div>
        )}

        {/* Database Error */}
        {dbError && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{dbError}</span>
          </div>
        )}

        {/* Commit Action */}
        {isValidated && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-2">
            <div className="flex items-center gap-1.5 font-extrabold text-emerald-950">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Validation Passed: {parsedData.length} valid product rows ready for Supabase database insertion.</span>
            </div>

            <button
              onClick={handleCommitImport}
              disabled={importing}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-50"
            >
              {importing ? 'Inserting Products into Supabase DB...' : `Batch Import ${parsedData.length} Products to Database`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
