import React from 'react';
import { Transaction } from '../types';
import { X, Printer, FileText } from 'lucide-react';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, transaction }) => {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm print:bg-white print:p-0">
      <div className="bg-white text-slate-900 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden print:shadow-none print:w-full print:max-w-none">
        
        {/* Screen Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-slate-50 print:hidden">
          <h2 className="text-lg font-bold flex items-center">
            <FileText className="w-5 h-5 mr-2 text-slate-600" />
            Detalle de Factura
          </h2>
          <div className="flex space-x-2">
            <button onClick={handlePrint} className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-full">
              <Printer className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="p-8 print:p-8" id="invoice-content">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-indigo-600">MuseLink</h1>
              <p className="text-sm text-gray-500">Mercado Musical Digital</p>
            </div>
            <div className="text-right">
              <h3 className="text-xl font-bold text-gray-800">FACTURA</h3>
              <p className="text-sm text-gray-600">#{transaction.invoiceNumber}</p>
              <p className="text-sm text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="border-t-2 border-gray-100 py-6 mb-6">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold text-gray-700 text-sm uppercase mb-2">Facturado a:</h4>
                <p className="text-gray-800 font-medium">{transaction.userName}</p>
                <p className="text-gray-500 text-sm">ID Usuario: {transaction.userId}</p>
              </div>
              <div className="text-right">
                <h4 className="font-bold text-gray-700 text-sm uppercase mb-2">Método de Pago:</h4>
                <p className="text-gray-800">Tarjeta de Crédito / Débito</p>
                <p className="text-gray-500 text-sm">Procesado digitalmente</p>
              </div>
            </div>
          </div>

          <table className="w-full mb-8">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-4 text-left text-xs font-bold text-gray-600 uppercase">Descripción</th>
                <th className="py-3 px-4 text-right text-xs font-bold text-gray-600 uppercase">Cantidad</th>
                <th className="py-3 px-4 text-right text-xs font-bold text-gray-600 uppercase">Precio Unit.</th>
                <th className="py-3 px-4 text-right text-xs font-bold text-gray-600 uppercase">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-4 px-4 text-sm text-gray-800">Créditos de Contacto (MuseLink)</td>
                <td className="py-4 px-4 text-right text-sm text-gray-800">{transaction.amount}</td>
                <td className="py-4 px-4 text-right text-sm text-gray-800">
                  ${(transaction.cost / transaction.amount).toFixed(2)}
                </td>
                <td className="py-4 px-4 text-right text-sm font-bold text-gray-800">
                  ${transaction.cost.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-1/2">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-800 font-medium">${transaction.cost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Impuestos (0%)</span>
                <span className="text-gray-800 font-medium">$0.00</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-lg font-bold text-indigo-600">Total</span>
                <span className="text-lg font-bold text-indigo-600">${transaction.cost.toFixed(2)} USD</span>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center text-xs text-gray-400">
            <p>Gracias por usar MuseLink. Esta es una factura generada electrónicamente.</p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 text-center print:hidden">
          <p className="text-sm text-gray-500">Presiona el icono de impresora para guardar como PDF.</p>
        </div>
      </div>
    </div>
  );
};