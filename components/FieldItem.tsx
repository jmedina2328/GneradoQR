
import React from 'react';
import { Trash2 } from 'lucide-react';
import { QRField } from '../types';

interface FieldItemProps {
  field: QRField;
  onUpdate: (id: string, key: string, value: string) => void;
  onRemove: (id: string) => void;
}

const FieldItem: React.FC<FieldItemProps> = ({ field, onUpdate, onRemove }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex-1">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Nombre del Campo</label>
        <input
          type="text"
          value={field.key}
          onChange={(e) => onUpdate(field.id, e.target.value, field.value)}
          placeholder="Ej: id_estudiante"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
        />
      </div>
      <div className="flex-1">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Valor</label>
        <input
          type="text"
          value={field.value}
          onChange={(e) => onUpdate(field.id, field.key, e.target.value)}
          placeholder="Ej: 2024-001"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
        />
      </div>
      <div className="flex items-end justify-end sm:pb-1">
        <button
          onClick={() => onRemove(field.id)}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Eliminar campo"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
};

export default FieldItem;
