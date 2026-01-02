
import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Plus, Download, Sparkles, RefreshCcw, Info, QrCode, LayoutGrid, Trash2, Wand2, User, Phone } from 'lucide-react';
import { QRField } from './types';
import FieldItem from './components/FieldItem';
import { getSmartSuggestions } from './services/geminiService';

const App: React.FC = () => {
  // Campos iniciales actualizados: GS (Grado y Sección) y Tutor
  const [fields, setFields] = useState<QRField[]>([
    { id: '1', key: 'nombre', value: 'Usuario Ejemplo' },
    { id: '2', key: 'id', value: '001' },
    { id: '3', key: 'GS', value: '5G' },
    { id: '4', key: 'tutor', value: 'Juan Pérez' },
    { id: '5', key: 'contacto', value: '987654321' }
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

  const normalizeKeys = () => {
    const normalized = fields.map(f => ({
      ...f,
      key: f.key.toLowerCase().trim().replace(/\s+/g, '_').replace(/\//g, '_').replace(/[^a-z0-9_]/g, '')
    }));
    setFields(normalized);
  };

  const getQRData = () => {
    const dataObj: Record<string, string> = {};
    fields.forEach(f => {
      if (f.key.trim()) dataObj[f.key.trim()] = f.value.trim();
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
      canvas.width = img.width + 80;
      canvas.height = img.height + 80;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 40, 40);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `QR_Palmista_${Date.now()}.png`;
        downloadLink.href = `${pngFile}`;
        downloadLink.click();
      }
    };
    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
  };

  const handleSmartSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const suggestion = await getSmartSuggestions("AsistenciaPalmista");
      setFields(suggestion.fields.map(f => ({ id: Math.random().toString(36).substr(2, 9), key: f.key, value: f.value })));
      setExplanation(suggestion.explanation);
    } catch (error) {
      alert("Error al obtener sugerencias.");
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const getVal = (key: string) => fields.find(f => f.key.toLowerCase() === key.toLowerCase())?.value || '---';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-xl text-white">
              <QrCode size={22} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-none">Palmista Pro</h1>
              <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">Generador de Asistencia</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={normalizeKeys} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors" title="Limpiar claves">
              <Wand2 size={20} />
            </button>
            <button onClick={handleSmartSuggestions} disabled={loadingSuggestions} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 shadow-md shadow-blue-100">
              {loadingSuggestions ? <RefreshCcw className="animate-spin" size={16} /> : <Sparkles size={16} />}
              IA
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <LayoutGrid size={20} className="text-blue-600" />
                Datos del Código QR
              </h2>
              <button onClick={() => setFields([])} className="text-xs font-bold text-red-400 hover:text-red-600 transition-colors uppercase tracking-widest">
                Borrar Todo
              </button>
            </div>

            <div className="space-y-3">
              {fields.map(field => (
                <FieldItem key={field.id} field={field} onUpdate={updateField} onRemove={removeField} />
              ))}
              <button onClick={addField} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/30 transition-all flex items-center justify-center gap-2 font-bold text-sm">
                <Plus size={18} /> AGREGAR CAMPO
              </button>
            </div>
          </div>
          
          {explanation && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 italic text-sm text-blue-700">
              <Info className="shrink-0" size={18} />
              {explanation}
            </div>
          )}
        </div>

        <div className="lg:col-span-5">
          <div className="sticky top-24 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-full flex justify-between items-start mb-6">
                  <div className="w-20 h-20 bg-blue-700 rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-lg shadow-blue-200">
                    {getVal('nombre').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black tracking-tighter">
                      S/G: {getVal('GS')}
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                      ID: {getVal('id')}
                    </div>
                  </div>
                </div>

                <div className="w-full mb-8">
                  <h3 className="text-2xl font-black text-slate-800 leading-tight">
                    {getVal('nombre')}
                  </h3>
                  <div className="h-1 w-12 bg-blue-600 mt-2 rounded-full opacity-20"></div>
                </div>

                <div className="w-full space-y-5 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Tutor</p>
                      <p className="font-bold text-slate-700 text-sm">{getVal('tutor')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                      <Phone size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Contacto</p>
                      <p className="font-bold text-slate-700 text-sm">{getVal('contacto')}</p>
                    </div>
                  </div>
                </div>

                <div className="w-full bg-slate-50 rounded-[2rem] p-5 border border-slate-100 flex flex-col items-center gap-4">
                  <div ref={qrRef} className="bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                    <QRCodeSVG value={getQRData()} size={150} level="Q" includeMargin={true} />
                  </div>
                  <button onClick={downloadQR} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-3">
                    <Download size={16} /> Descargar Identificador
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
              <h4 className="text-xs font-black text-blue-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Info size={14} /> Guía de Campos
              </h4>
              <p className="text-xs text-blue-700 leading-relaxed font-medium">
                Se ha configurado el campo <b>GS</b> como un valor único (ej. "5G") para simplificar la integración con <b>AsistenciaPalmista</b>.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
