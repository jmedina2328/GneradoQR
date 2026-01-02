
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Plus, Download, Sparkles, RefreshCcw, Info, QrCode, LayoutGrid, Trash2 } from 'lucide-react';
import { QRField } from './types';
import FieldItem from './components/FieldItem';
import { getSmartSuggestions } from './services/geminiService';

const App: React.FC = () => {
  const [fields, setFields] = useState<QRField[]>([
    { id: '1', key: 'app', value: 'AsistenciaPalmista' },
    { id: '2', key: 'id', value: '001' },
    { id: '3', key: 'nombre', value: 'Usuario Ejemplo' }
  ]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  const addField = () => {
    const newField: QRField = {
      id: Math.random().toString(36).substr(2, 9),
      key: '',
      value: ''
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const updateField = (id: string, key: string, value: string) => {
    setFields(fields.map(f => f.id === id ? { ...f, key, value } : f));
  };

  const getQRData = () => {
    const dataObj: Record<string, string> = {};
    fields.forEach(f => {
      if (f.key.trim()) {
        dataObj[f.key.trim()] = f.value;
      }
    });
    return JSON.stringify(dataObj);
  };

  const downloadQR = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `QR_Asistencia_${Date.now()}.png`;
        downloadLink.href = `${pngFile}`;
        downloadLink.click();
      }
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  const handleSmartSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const suggestion = await getSmartSuggestions("AsistenciaPalmista");
      const newFields: QRField[] = suggestion.fields.map(f => ({
        id: Math.random().toString(36).substr(2, 9),
        key: f.key,
        value: f.value
      }));
      setFields(newFields);
      setExplanation(suggestion.explanation);
    } catch (error) {
      alert("Error al obtener sugerencias de la IA.");
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const clearAll = () => {
    if (confirm("¿Estás seguro de que quieres borrar todos los campos?")) {
      setFields([]);
      setExplanation(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <QrCode size={24} />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Palmista QR Assistant</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSmartSuggestions}
              disabled={loadingSuggestions}
              className="flex items-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loadingSuggestions ? <RefreshCcw className="animate-spin" size={18} /> : <Sparkles size={18} />}
              <span className="hidden sm:inline">Sugerir con IA</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Editor */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800">
                <LayoutGrid size={20} className="text-indigo-600" />
                <h2 className="text-lg font-semibold">Configuración de Datos</h2>
              </div>
              <button 
                onClick={clearAll}
                className="text-sm text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
              >
                <Trash2 size={14} />
                Limpiar todo
              </button>
            </div>

            {explanation && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                <Info className="text-blue-500 shrink-0" size={20} />
                <p className="text-sm text-blue-800 leading-relaxed">{explanation}</p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {fields.map(field => (
                <FieldItem
                  key={field.id}
                  field={field}
                  onUpdate={updateField}
                  onRemove={removeField}
                />
              ))}
              
              <button
                onClick={addField}
                className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 font-medium"
              >
                <Plus size={20} />
                Añadir nuevo campo
              </button>
            </div>
          </section>
        </div>

        {/* Right Column: Preview */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="sticky top-24">
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col items-center gap-8">
              <h3 className="text-lg font-semibold text-slate-800">Vista Previa</h3>
              
              <div 
                ref={qrRef}
                className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-inner"
              >
                <QRCodeSVG
                  value={getQRData()}
                  size={240}
                  level="H"
                  includeMargin={false}
                  className="mx-auto"
                />
              </div>

              <div className="w-full space-y-4">
                <div className="bg-slate-50 rounded-lg p-3 overflow-hidden">
                  <p className="text-xs font-mono text-slate-500 break-all">
                    <span className="font-bold">Contenido:</span> {getQRData()}
                  </p>
                </div>
                
                <button
                  onClick={downloadQR}
                  className="w-full bg-slate-900 text-white hover:bg-slate-800 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Download size={20} />
                  Descargar PNG
                </button>
              </div>
            </div>

            {/* Hint Box */}
            <div className="mt-6 bg-amber-50 border border-amber-100 rounded-xl p-4">
              <h4 className="text-sm font-bold text-amber-800 mb-1 flex items-center gap-2">
                <Info size={16} /> Tip de Usuario
              </h4>
              <p className="text-xs text-amber-700 leading-normal">
                Para que la app <strong>AsistenciaPalmista</strong> lea el QR correctamente, asegúrate de que los nombres de los campos (Key) coincidan exactamente con los que espera el sistema. Usa la <strong>IA</strong> para descubrir la estructura más probable.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>© 2024 Palmista QR Assistant - Potenciado por Gemini 3 Flash</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
