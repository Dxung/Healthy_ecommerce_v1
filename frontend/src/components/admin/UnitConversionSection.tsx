'use client';

import { useState } from 'react';
import { apiClient, type UnitResponse, type UnitConversionResponse, type ApiError } from '@/lib/api';
import { Loader2, Plus, Trash2, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useUnitConversions } from '@/lib/hooks/useAdminData';

interface UnitConversionSectionProps {
  units: UnitResponse[];
}

export function UnitConversionSection({ units }: UnitConversionSectionProps) {
  const { conversions, isLoading: loading, refresh: refreshConversions } = useUnitConversions();
  const [deleting, setDeleting] = useState<string | null>(null);

  // Create form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [fromUnitId, setFromUnitId] = useState('');
  const [toUnitId, setToUnitId] = useState('');
  const [factor, setFactor] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!fromUnitId || !toUnitId) {
      toast.error('Vui lòng chọn đơn vị');
      return;
    }
    if (fromUnitId === toUnitId) {
      toast.error('Đơn vị nguồn và đích không được giống nhau');
      return;
    }
    const factorNum = parseFloat(factor);
    if (isNaN(factorNum) || factorNum <= 0) {
      toast.error('Hệ số chuyển đổi phải là số dương');
      return;
    }

    try {
      setCreating(true);
      await apiClient.createUnitConversion({
        fromUnitId,
        toUnitId,
        conversionFactor: factorNum,
      });
      toast.success('Đã tạo quy tắc chuyển đổi');
      setFromUnitId('');
      setToUnitId('');
      setFactor('');
      setShowCreateForm(false);
      refreshConversions();
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể tạo quy tắc chuyển đổi');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (conversion: UnitConversionResponse) => {
    if (!confirm(`Bạn có chắc muốn xóa quy tắc chuyển đổi này?`)) return;

    try {
      setDeleting(conversion.id);
      await apiClient.deleteUnitConversion(conversion.id);
      toast.success('Đã xóa quy tắc chuyển đổi');
      refreshConversions();
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể xóa quy tắc chuyển đổi');
    } finally {
      setDeleting(null);
    }
  };

  const getUnit = (unitId: string) => units.find((u) => u.id === unitId);
  const activeUnits = units.filter((u) => u.isActive);

  const getConversionDescription = (conv: UnitConversionResponse) => {
    const fromUnit = getUnit(conv.fromUnitId);
    const toUnit = getUnit(conv.toUnitId);
    return `1 ${fromUnit?.symbol || '?'} = ${conv.conversionFactor} ${toUnit?.symbol || '?'}`;
  };

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-900">Quy tắc chuyển đổi đơn vị</h2>
          <p className="text-sm text-gray-500">
            Thiết lập hệ số chuyển đổi giữa các đơn vị
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setShowCreateForm(!showCreateForm)}
          variant={showCreateForm ? 'outline' : 'default'}
        >
          {showCreateForm ? (
            'Hủy'
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Thêm quy tắc
            </>
          )}
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="p-4 border-b bg-gray-50/50">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label className="mb-1 block">Từ đơn vị</Label>
              <select
                value={fromUnitId}
                onChange={(e) => setFromUnitId(e.target.value)}
                className="w-48 h-10 rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Chọn...</option>
                {activeUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center pb-2">
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>

            <div className="space-y-2">
              <Label className="mb-1 block">Sang đơn vị</Label>
              <select
                value={toUnitId}
                onChange={(e) => setToUnitId(e.target.value)}
                className="w-48 h-10 rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Chọn...</option>
                {activeUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Hệ số</Label>
              <Input
                type="number"
                step="any"
                value={factor}
                onChange={(e) => setFactor(e.target.value)}
                placeholder="1000"
                className="w-32"
              />
            </div>

            <Button onClick={handleCreate} disabled={creating}>
              {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Tạo
            </Button>
          </div>

          {/* Preview */}
          {fromUnitId && toUnitId && factor && (
            <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-700">
              <RefreshCw className="w-4 h-4 inline mr-2" />
              Chuyển đổi: 1{' '}
              {units.find((u) => u.id === fromUnitId)?.symbol || '?'} ={' '}
              {factor}{' '}
              {units.find((u) => u.id === toUnitId)?.symbol || '?'}
            </div>
          )}
        </div>
      )}

      {/* Conversions List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : conversions.length === 0 ? (
        <div className="p-8 text-center">
          <RefreshCw className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Chưa có quy tắc chuyển đổi nào</p>
        </div>
      ) : (
        <div className="divide-y">
          {conversions.map((conv) => {
            const fromUnit = getUnit(conv.fromUnitId);
            const toUnit = getUnit(conv.toUnitId);
            return (
              <div
                key={conv.id}
                className="px-4 py-3 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {fromUnit?.name || 'Unknown'}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">
                      ({fromUnit?.symbol || '?'})
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {toUnit?.name || 'Unknown'}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">
                      ({toUnit?.symbol || '?'})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm bg-gray-100 px-3 py-1 rounded font-mono">
                    {getConversionDescription(conv)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(conv)}
                    disabled={deleting === conv.id}
                  >
                    {deleting === conv.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 text-red-500" />
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
